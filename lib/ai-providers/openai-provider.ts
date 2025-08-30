import { AIProvider, EnrichmentResult, ProviderConfig } from './provider-interface'
import { validateResponse, extractFromVerboseResponse } from '../response-validator'

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
  }
}

export class OpenAIProvider implements AIProvider {
  name = 'openai'
  private apiKey: string
  private model: string
  private baseUrl = 'https://api.openai.com/v1/chat/completions'

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || ''
    this.model = config.model || 'gpt-4o-mini'
    
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured')
    }
  }

  async enrichValue(
    value: string,
    prompt: string,
    context?: Record<string, any>
  ): Promise<EnrichmentResult> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Build the JSON schema for structured output with better instructions
    const systemPrompt = `You are a JSON function that classifies, formats, and enriches data.

CRITICAL RULES:
1. The "Target Entity" field contains the SPECIFIC item to work with
2. For classification/categorization tasks, use your knowledge to classify accurately
3. For data extraction from context, use ONLY the provided context
4. NEVER return data for a different entity with a similar name

Return ONLY valid JSON matching this schema:
{
  "value": "string | null",
  "confidence": 0.0-1.0,
  "status": "success" | "needs_review" | "insufficient_data" | "multiple_matches",
  "reason": "string if not success",
  "verification": {
    "entity_matched": "string describing what was matched",
    "based_on": "what was used (knowledge or context)"
  }
}

Task Types:
- CLASSIFICATION (industry, B2B/B2C, size): Use your knowledge about the entity
- EXTRACTION (from context): Use ONLY provided context data
- FORMATTING: Clean and format the provided value

VALIDATION BEFORE RETURNING:
- Verify you're working with the correct entity
- Set confidence based on certainty (1.0 = definite, 0.7 = probable, 0.3 = guess)
- Use status:"success" when you can provide a value

NEVER DO THIS:
❌ Return data for a different entity
❌ Mix data from multiple sources`

    // Build user prompt with better structured context
    let userPrompt = `Target Entity: "${value || 'empty'}"\n`
    userPrompt += `Task: ${prompt}\n\n`
    
    if (context && Object.keys(context).length > 0) {
      // Structure context for clarity
      if (context.rowData) {
        userPrompt += `Row Data for THIS entity:\n`
        Object.entries(context.rowData).forEach(([key, val]) => {
          userPrompt += `- ${key}: ${val}\n`
        })
      }
      
      if (context.attachments) {
        userPrompt += `\nAdditional Context:\n${context.attachments}\n`
      }
      
      userPrompt += `\nIMPORTANT: Use the above context for data extraction tasks.\n`
    }
    
    // Determine task type from prompt
    const isClassification = prompt.toLowerCase().includes('classify') || 
                           prompt.toLowerCase().includes('categorize') ||
                           prompt.toLowerCase().includes('b2b') ||
                           prompt.toLowerCase().includes('b2c') ||
                           prompt.toLowerCase().includes('industry') ||
                           prompt.toLowerCase().includes('type')
    
    if (isClassification) {
      userPrompt += `\nThis is a CLASSIFICATION task. Use your knowledge about "${value}" to classify it accurately.\n`
    } else if (context?.rowData) {
      userPrompt += `\nThis is an EXTRACTION task. Use ONLY the provided context data.\n`
    }
    
    userPrompt += `\nReturn JSON only with your result.`

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
          temperature: 0,
          max_tokens: 150,
          response_format: { type: "json_object" } // Force JSON response
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenAI API error: ${response.status} - ${error}`)
      }

      const data: OpenAIResponse = await response.json()
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('No response from OpenAI')
      }

      // Parse the JSON response
      let parsedResponse: any
      try {
        parsedResponse = JSON.parse(data.choices[0].message.content)
      } catch (parseError) {
        // If JSON parsing fails, try to repair
        return await this.repairAndRetry(value, prompt, context, data.choices[0].message.content)
      }

      // Validate the response structure
      // Detect data type from prompt
      const promptLower = prompt.toLowerCase()
      let dataType = 'text'
      
      if (promptLower.includes('email')) dataType = 'email'
      else if (promptLower.includes('website') || promptLower.includes('url')) dataType = 'url'
      else if (promptLower.includes('phone')) dataType = 'phone'
      else if (promptLower.includes('revenue') || promptLower.includes('funding')) dataType = 'currency'
      else if (promptLower.includes('date') || promptLower.includes('founded')) dataType = 'date'
      else if (promptLower.includes('ceo') || promptLower.includes('founder')) dataType = 'ceo'
      else if (promptLower.includes('employees') || promptLower.includes('count')) dataType = 'number'
      
      // Get raw value
      let rawValue = parsedResponse.value || value
      
      // If response is verbose, try extraction
      if (rawValue && rawValue.length > 50 && dataType !== 'text') {
        const extracted = extractFromVerboseResponse(rawValue, dataType)
        if (extracted) {
          rawValue = extracted
        }
      }
      
      // Validate and standardize
      const validation = validateResponse(rawValue, dataType)
      const enrichedValue = validation.isValid ? validation.value : rawValue
      
      // Adjust confidence based on validation
      const confidence = validation.isValid 
        ? (parsedResponse.confidence || 0.8)
        : Math.min(parsedResponse.confidence || 0.5, validation.confidence)
      
      const status = validation.isValid 
        ? (parsedResponse.status || 'success')
        : 'needs_review'

      return {
        value: enrichedValue,
        sources: [], // OpenAI doesn't provide web sources
        fullResponse: data.choices[0].message.content,
        metadata: {
          provider: this.name,
          model: this.model,
          confidence,
          status,
          reason: parsedResponse.reason,
          verification: {
            ...parsedResponse.verification,
            format_valid: validation.isValid,
            corrections: validation.corrections
          },
          citations: [], // No web citations for classification
          query: prompt,
          entity: value,
          timestamp: new Date().toISOString(),
          usage: data.usage,
          dataType: dataType,
          validation: validation
        }
      }
    } catch (error: any) {
      console.error('OpenAI provider error:', error)
      throw error
    }
  }

  private async repairAndRetry(
    value: string,
    prompt: string,
    context: Record<string, any> | undefined,
    invalidJson: string
  ): Promise<EnrichmentResult> {
    // Try to repair the JSON
    const repairPrompt = `The following JSON is invalid. Please repair it and return valid JSON only:
${invalidJson}

Required schema:
{
  "value": "string or null",
  "confidence": "number between 0 and 1", 
  "status": "success | needs_review | not_found",
  "reason": "string (optional)"
}`

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
            { role: 'user', content: repairPrompt }
          ],
          temperature: 0,
          max_tokens: 150,
          response_format: { type: "json_object" }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to repair JSON')
      }

      const data: OpenAIResponse = await response.json()
      const repairedJson = JSON.parse(data.choices[0].message.content)

      return {
        value: repairedJson.value || value,
        sources: [],
        fullResponse: data.choices[0].message.content,
        metadata: {
          provider: this.name,
          model: this.model,
          confidence: repairedJson.confidence || 0.3,
          status: repairedJson.status || 'needs_review',
          reason: repairedJson.reason || 'JSON repair was required',
          repaired: true
        }
      }
    } catch (error) {
      // Final fallback
      return {
        value: value,
        sources: [],
        fullResponse: invalidJson,
        metadata: {
          provider: this.name,
          model: this.model,
          confidence: 0,
          status: 'needs_review',
          reason: 'Failed to get valid JSON response',
          error: error?.toString()
        }
      }
    }
  }

  // Not used for classification tasks, but required by interface
  async findUniqueItem(
    searchType: string,
    foundItems: Set<string>,
    index: number
  ): Promise<any> {
    throw new Error('OpenAI provider does not support search tasks - use for classification only')
  }
}