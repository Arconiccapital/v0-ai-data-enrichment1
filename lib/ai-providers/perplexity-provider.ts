import { AIProvider, EnrichmentResult, ProviderConfig, Citation } from './provider-interface'
import { validateResponse, extractFromVerboseResponse } from '../response-validator'

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
  citations?: any[]
  sources?: any[]
  web_results?: any[]
  references?: any[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
  }
}

export class PerplexityProvider implements AIProvider {
  name = 'perplexity'
  private apiKey: string
  private model: string
  private baseUrl = 'https://api.perplexity.ai/chat/completions'

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey || process.env.PERPLEXITY_API_KEY || ''
    this.model = config.model || 'sonar'
    
    if (!this.apiKey) {
      console.warn('Perplexity API key not configured')
    }
  }

  async enrichValue(
    value: string,
    prompt: string,
    context?: Record<string, any>
  ): Promise<EnrichmentResult> {
    if (!this.apiKey) {
      throw new Error('Perplexity API key not configured')
    }

    // Build structured prompt for Perplexity with STRICT format enforcement
    const systemPrompt = `You are a precision web search function that returns data in EXACT formats.

CRITICAL INSTRUCTIONS:
1. Search for the SPECIFIC entity in "Target Entity" field ONLY
2. Return data in the EXACT format specified for the data type
3. NO extra text, NO explanations, ONLY the requested format

Return ONLY this JSON structure:
{
  "value": "EXACT data in specified format | null",
  "confidence": 0.0-1.0,
  "status": "success" | "not_found" | "multiple_matches" | "wrong_entity",
  "sources": ["url1", "url2"],
  "verification": {
    "entity_matched": "exact name found",
    "format_valid": true | false
  }
}

FORMAT REQUIREMENTS BY TYPE:
- EMAIL: "firstname.lastname@domain.com" (lowercase, no spaces)
- URL: "https://www.example.com" (must start with https://)
- PHONE: "+1-XXX-XXX-XXXX" (with country code)
- CURRENCY: "$X,XXX,XXX" (with $ and commas)
- DATE: "YYYY-MM-DD" (ISO format only)
- NAME/CEO: "Firstname Lastname" (no titles, properly capitalized)
- NUMBER: "12345" (digits only, no text)
- COMPANY: "Company Name Inc" (official name)

VALIDATION RULES:
1. value field MUST contain ONLY the data in specified format
2. Do NOT include phrases like "The CEO is..." or "Website:"
3. Return null if data not found or unsure
4. Set format_valid to true only if format is exact

NEVER DO THIS:
❌ Return verbose explanations
❌ Include prefixes like "CEO:" or "Email:"
❌ Return data for wrong entity
❌ Guess or make up data`

    // Detect data type from prompt for format enforcement
    const promptLower = prompt.toLowerCase()
    let dataType = 'text'
    let formatExample = ''
    
    if (promptLower.includes('email')) {
      dataType = 'EMAIL'
      formatExample = 'john.smith@company.com'
    } else if (promptLower.includes('website') || promptLower.includes('url')) {
      dataType = 'URL'
      formatExample = 'https://www.company.com'
    } else if (promptLower.includes('phone') || promptLower.includes('number') && promptLower.includes('contact')) {
      dataType = 'PHONE'
      formatExample = '+1-555-123-4567'
    } else if (promptLower.includes('revenue') || promptLower.includes('funding') || promptLower.includes('valuation') || promptLower.includes('$')) {
      dataType = 'CURRENCY'
      formatExample = '$10,000,000'
    } else if (promptLower.includes('date') || promptLower.includes('founded') || promptLower.includes('established')) {
      dataType = 'DATE'
      formatExample = '2024-01-15'
    } else if (promptLower.includes('ceo') || promptLower.includes('founder') || promptLower.includes('chief executive')) {
      dataType = 'NAME/CEO'
      formatExample = 'John Smith'
    } else if (promptLower.includes('employees') || promptLower.includes('count')) {
      dataType = 'NUMBER'
      formatExample = '5000'
    }
    
    // Build user prompt with structured context for verification
    let userPrompt = `Target Entity: "${value || 'unknown'}"\n`
    userPrompt += `Task: ${prompt}\n`
    userPrompt += `Data Type: ${dataType}\n`
    userPrompt += `REQUIRED FORMAT: ${formatExample}\n\n`
    
    if (context && Object.keys(context).length > 0) {
      // Add row context for entity verification
      if (context.rowData) {
        userPrompt += `Entity Context (use to verify correct entity):\n`
        Object.entries(context.rowData).forEach(([key, val]) => {
          if (val) userPrompt += `- ${key}: ${val}\n`
        })
        userPrompt += `\n`
      }
      
      // Special handling for location/industry to help disambiguation
      const location = context.rowData?.Location || context.rowData?.City || context.rowData?.State
      const industry = context.rowData?.Industry || context.rowData?.Sector
      
      if (location || industry) {
        userPrompt += `DISAMBIGUATION HELP:\n`
        if (location) userPrompt += `- Entity should be in/near: ${location}\n`
        if (industry) userPrompt += `- Entity should be in industry: ${industry}\n`
        userPrompt += `If multiple entities match the name, use this to identify the correct one.\n\n`
      }
    }
    
    userPrompt += `CRITICAL REQUIREMENTS:\n`
    userPrompt += `1. Find information for THIS EXACT "${value}" only\n`
    userPrompt += `2. Return value in EXACT format: ${formatExample}\n`
    userPrompt += `3. NO extra text - just the data in the specified format\n`
    userPrompt += `4. Return null if not found - do NOT guess\n`
    userPrompt += `\nReturn JSON with value field containing ONLY the formatted data.`

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.1,
          max_tokens: 200,
          return_citations: true,
          return_related_questions: false
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Perplexity API error: ${response.status} - ${error}`)
      }

      const data: PerplexityResponse = await response.json()
      
      // Debug log to see the actual response structure
      console.log('[Perplexity] Raw API response structure:', {
        hasChoices: !!data.choices,
        hasCitations: !!data.citations,
        hasSources: !!data.sources,
        hasWebResults: !!data.web_results,
        hasReferences: !!data.references,
        keys: Object.keys(data)
      })
      
      if (data.citations) {
        console.log('[Perplexity] Citations found:', data.citations.length, 'citations')
      }
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('No response from Perplexity')
      }

      const responseContent = data.choices[0].message.content

      // Try to parse as JSON first
      let parsedResponse: any
      let isJsonResponse = false
      
      try {
        parsedResponse = JSON.parse(responseContent)
        isJsonResponse = true
      } catch {
        // Not JSON, treat as plain text response
        parsedResponse = {
          value: this.extractValue(responseContent),
          confidence: 0.7,
          status: 'success'
        }
      }

      // Extract citations with enhanced metadata - check multiple possible fields
      const citations: Citation[] = []
      const citationSources = data.citations || data.sources || data.web_results || data.references || []
      
      console.log('[Perplexity] Checking citation sources:', {
        fromCitations: data.citations?.length || 0,
        fromSources: data.sources?.length || 0,
        fromWebResults: data.web_results?.length || 0,
        fromReferences: data.references?.length || 0,
        totalFound: citationSources.length
      })
      
      if (citationSources && citationSources.length > 0) {
        citationSources.forEach((citation: any, idx: number) => {
          // Handle different formats - sometimes it's just a URL string
          const url = typeof citation === 'string' ? citation : (citation.uri || citation.url || citation.link)
          
          if (url) {
            try {
              const domain = new URL(url).hostname.replace('www.', '')
              
              // Determine credibility based on domain
              let credibility: 'high' | 'medium' | 'low' = 'medium'
              if (domain.includes('.gov') || domain.includes('.edu') || 
                  domain.includes('wikipedia.org') || domain.includes('reuters.com') ||
                  domain.includes('bloomberg.com') || domain.includes('forbes.com')) {
                credibility = 'high'
              } else if (domain.includes('.org')) {
                credibility = 'medium'
              }
              
              citations.push({
                uri: url,
                title: typeof citation === 'object' ? (citation.title || domain) : domain,
                snippet: typeof citation === 'object' ? (citation.snippet || citation.text || citation.content || '') : '',
                domain: domain,
                date: typeof citation === 'object' ? (citation.publishedDate || citation.date) : undefined,
                credibility: credibility
              })
            } catch (e) {
              console.warn('[Perplexity] Invalid URL in citation:', url)
            }
          }
        })
      }
      
      // Fallback: Extract URLs from the response content if no citations found
      if (citations.length === 0 && responseContent) {
        console.log('[Perplexity] No citations found, extracting URLs from response')
        const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g
        const urls = responseContent.match(urlRegex)
        if (urls) {
          urls.forEach(url => {
            try {
              const domain = new URL(url).hostname.replace('www.', '')
              citations.push({
                uri: url,
                title: domain,
                snippet: '',
                domain: domain,
                credibility: 'medium'
              })
            } catch (e) {
              // Invalid URL, skip
            }
          })
        }
      }
      
      console.log('[Perplexity] Final citations extracted:', citations.length)

      // Extract sources from the response if mentioned
      const sources = parsedResponse.sources || citations.map(c => c.uri)
      
      // Get raw value from response
      let rawValue = parsedResponse.value || this.extractValue(responseContent)
      
      // If response is verbose or not in correct format, try extraction
      if (!parsedResponse.value || !isJsonResponse) {
        const extracted = extractFromVerboseResponse(responseContent, dataType.toLowerCase().replace('/', ''))
        if (extracted) {
          rawValue = extracted
        }
      }
      
      // Validate and standardize the response
      const validation = validateResponse(rawValue, dataType.toLowerCase().replace('/', ''))
      const finalValue = validation.isValid ? validation.value : rawValue
      
      // Update confidence based on validation
      const finalConfidence = validation.isValid 
        ? (parsedResponse.confidence || 0.8) 
        : Math.min(parsedResponse.confidence || 0.5, validation.confidence)

      // Ensure citations are passed properly
      const finalCitations = citations.length > 0 ? citations : (parsedResponse.citations || [])
      
      console.log('[Perplexity] Returning result with citations:', finalCitations.length)
      
      return {
        value: finalValue,
        sources: finalCitations,
        fullResponse: responseContent,
        searchQueries: [prompt],
        metadata: {
          provider: this.name,
          model: this.model,
          confidence: finalConfidence,
          status: validation.isValid ? (parsedResponse.status || 'success') : 'needs_review',
          verification: {
            ...parsedResponse.verification,
            format_valid: validation.isValid,
            corrections: validation.corrections
          },
          citations: finalCitations,
          query: prompt,
          entity: value,
          timestamp: new Date().toISOString(),
          usage: data.usage,
          isJsonResponse,
          dataType: dataType,
          validation: validation
        }
      }
    } catch (error: any) {
      console.error('Perplexity provider error:', error)
      throw error
    }
  }

  /**
   * Extract clean value from text response
   */
  private extractValue(text: string): string {
    // Remove common patterns
    let cleaned = text
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/^\*\*|\*\*$/g, '') // Remove markdown bold
      .replace(/^-\s*/, '') // Remove list markers
      .trim()
    
    // If it's a sentence, try to extract just the value
    if (cleaned.includes(':')) {
      const parts = cleaned.split(':')
      if (parts.length === 2) {
        cleaned = parts[1].trim()
      }
    }
    
    // Remove "The answer is" type prefixes
    cleaned = cleaned
      .replace(/^(The |This |It is |The answer is |Found: |Result: )/i, '')
      .trim()
    
    return cleaned
  }

  // Not typically used, but can support finding unique items
  async findUniqueItem(
    searchType: string,
    foundItems: Set<string>,
    index: number
  ): Promise<any> {
    const prompt = `Find a unique ${searchType} that is NOT in this list: ${Array.from(foundItems).join(', ')}`
    const result = await this.enrichValue('', prompt)
    
    return {
      name: result.value,
      source: 'perplexity_search',
      verification: result.metadata?.status || 'unknown',
      citations: result.sources,
      searchQuery: prompt
    }
  }
}