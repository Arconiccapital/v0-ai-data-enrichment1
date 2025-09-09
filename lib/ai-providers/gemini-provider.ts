import { GoogleGenerativeAI } from '@google/generative-ai'
import { 
  AIProvider, 
  SearchResult, 
  EnrichmentResult, 
  ProviderConfig,
  Citation 
} from './provider-interface'

export class GeminiProvider implements AIProvider {
  name = 'gemini-grounding'
  private genAI: GoogleGenerativeAI
  private model: any
  
  constructor(config: ProviderConfig) {
    if (!config.apiKey) {
      throw new Error('Gemini API key is required')
    }
    
    this.genAI = new GoogleGenerativeAI(config.apiKey)
    // Use gemini-2.0-flash for newest grounding support
    this.model = this.genAI.getGenerativeModel({ 
      model: config.model || 'gemini-2.0-flash',
      generationConfig: {
        temperature: config.temperature || 0.3,
        maxOutputTokens: config.maxTokens || 500,
      }
    })
  }
  
  async findUniqueItem(
    searchType: string,
    foundItems: Set<string>,
    index: number
  ): Promise<SearchResult | null> {
    try {
      // Build exclusion list for deduplication
      const excludeList = Array.from(foundItems).slice(-10) // Last 10 items
      const excludeHint = excludeList.length > 0 
        ? `\n\nDO NOT return any of these (they were already found): ${excludeList.join(', ')}`
        : ''
      
      const prompt = `Find exactly ONE real, currently existing ${searchType}.${excludeHint}
      
Requirements:
1. Must be a real, verifiable entity that currently exists
2. Must be different from any already listed
3. Search the web to verify it exists

CRITICAL: You must return ONLY a single JSON object with this format:
{
  "name": "Entity Name",
  "source": "primary website or source URL",
  "verification": "one sentence explaining why this is a valid ${searchType}"
}

Do not include any explanatory text before or after.
Do not wrap in markdown code blocks.
Do not return an array of results.
Return only the raw JSON object for ONE item.`

      // Generate with grounding enabled
      const result = await this.model.generateContent({
        contents: [{ 
          role: 'user',
          parts: [{ text: prompt }]
        }],
        tools: [{
          googleSearch: {}
        }],
        toolConfig: {
          functionCallingConfig: {
            mode: 'ANY'
          }
        }
      })
      
      const response = await result.response
      const text = response.text()
      
      // Parse the response
      let parsedResult: any
      try {
        // Try to extract JSON from markdown code block first
        const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
        if (codeBlockMatch) {
          // Extract the content inside the code block
          const jsonContent = codeBlockMatch[1].trim()
          // Handle both array and object responses
          if (jsonContent.startsWith('[')) {
            // It's an array - take the first item
            const array = JSON.parse(jsonContent)
            parsedResult = array[0] || {}
          } else {
            parsedResult = JSON.parse(jsonContent)
          }
        } else {
          // Try to extract JSON directly
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            parsedResult = JSON.parse(jsonMatch[0])
          } else {
            // Fallback: extract from text
            return {
              name: text.split('\n')[0].trim(),
              source: '',
              verification: `Found as result for "${searchType}"`,
              citations: [],
              searchQuery: searchType
            }
          }
        }
      } catch (e) {
        console.error('[Gemini] Failed to parse JSON:', e)
        // Try to extract something useful from the response
        const lines = text.split('\n').filter(line => line.trim())
        if (lines.length > 0) {
          parsedResult = { name: lines[0].replace(/^[-*]\s*/, '').trim() }
        } else {
          return null
        }
      }
      
      // Extract citations from grounding metadata
      const citations: Citation[] = []
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata
      
      if (groundingMetadata?.groundingChunks) {
        for (const chunk of groundingMetadata.groundingChunks) {
          if (chunk.web) {
            citations.push({
              uri: chunk.web.uri || '',
              title: chunk.web.title || new URL(chunk.web.uri || '').hostname
            })
          }
        }
      }
      
      // Use first citation as primary source if not provided
      if (!parsedResult.source && citations.length > 0) {
        parsedResult.source = citations[0].uri
      }
      
      return {
        name: parsedResult.name || parsedResult,
        source: parsedResult.source || '',
        verification: parsedResult.verification || `Verified ${searchType}`,
        citations: citations,
        searchQuery: groundingMetadata?.webSearchQueries?.[0] || searchType
      }
      
    } catch (error: any) {
      console.error(`[Gemini] Error finding item ${index + 1}:`, error.message)
      
      // Check for rate limiting
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      
      return null
    }
  }
  
  async enrichValue(
    value: string,
    prompt: string,
    context?: Record<string, any>
  ): Promise<EnrichmentResult> {
    try {
      const contextStr = context ? JSON.stringify(context) : ''
      const fullPrompt = `${prompt}

Current value: "${value}"
Context: ${contextStr}

Search the web for accurate, up-to-date information to answer this query.
Return a concise, factual answer based on your search results.`

      // Generate with grounding enabled
      const result = await this.model.generateContent({
        contents: [{ 
          role: 'user',
          parts: [{ text: fullPrompt }]
        }],
        tools: [{
          googleSearch: {}
        }],
        toolConfig: {
          functionCallingConfig: {
            mode: 'ANY'
          }
        }
      })
      
      const response = await result.response
      const text = response.text()
      
      // Extract citations from grounding metadata
      const citations: Citation[] = []
      const searchQueries: string[] = []
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata
      
      if (groundingMetadata) {
        // Get search queries used
        if (groundingMetadata.webSearchQueries) {
          searchQueries.push(...groundingMetadata.webSearchQueries)
        }
        
        // Get citations
        if (groundingMetadata.groundingChunks) {
          for (const chunk of groundingMetadata.groundingChunks) {
            if (chunk.web) {
              citations.push({
                uri: chunk.web.uri || '',
                title: chunk.web.title || new URL(chunk.web.uri || '').hostname
              })
            }
          }
        }
      }
      
      // Clean up the response
      let enrichedValue = text.trim()
        .replace(/^["']|["']$/g, '') // Remove quotes
        .replace(/^\*\*|\*\*$/g, '') // Remove markdown bold
        .replace(/^-\s*/, '') // Remove list markers
      
      return {
        value: enrichedValue,
        sources: citations,
        fullResponse: text,
        searchQueries: searchQueries
      }
      
    } catch (error: any) {
      console.error('[Gemini] Enrichment error:', error.message)
      
      // Return original value on error
      return {
        value: value,
        sources: [],
        fullResponse: error.message,
        searchQueries: []
      }
    }
  }
}

// Helper function to normalize names for deduplication
export function normalizeForComparison(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
    .replace(/(inc|corp|llc|ltd|limited|company|companies|co|plc|group|holdings|international|global)$/i, '')
}