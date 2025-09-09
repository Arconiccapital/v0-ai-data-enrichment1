/**
 * Shared API client utilities for Perplexity and OpenAI
 */

interface APIClientConfig {
  apiKey: string
  baseUrl: string
  model: string
}

interface APIResponse<T = any> {
  data?: T
  error?: string
  source: 'perplexity' | 'openai' | 'mock'
}

/**
 * Perplexity API client wrapper
 */
export class PerplexityClient {
  private apiKey: string
  private model: string = 'sonar'
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PERPLEXITY_API_KEY || ''
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey)
  }

  async completion(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>, options: {
    temperature?: number
    maxTokens?: number
  } = {}): Promise<APIResponse> {
    if (!this.isConfigured) {
      return { 
        error: 'Perplexity API key not configured',
        source: 'perplexity'
      }
    }

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: options.temperature || 0.2,
          max_tokens: options.maxTokens || 2000
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Perplexity API error: ${response.status} - ${error}`)
      }

      const data = await response.json()
      return { data, source: 'perplexity' }
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : String(error),
        source: 'perplexity'
      }
    }
  }
}

/**
 * OpenAI API client wrapper
 */
export class OpenAIClient {
  private apiKey: string
  private model: string = 'gpt-4o-mini'
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || ''
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey)
  }

  async completion(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>, options: {
    temperature?: number
    maxTokens?: number
    responseFormat?: { type: string }
  } = {}): Promise<APIResponse> {
    if (!this.isConfigured) {
      return { 
        error: 'OpenAI API key not configured',
        source: 'openai'
      }
    }

    try {
      // Dynamic import to avoid bundling OpenAI SDK if not used
      const OpenAI = (await import('openai')).default
      const openai = new OpenAI({ apiKey: this.apiKey })

      const completion = await openai.chat.completions.create({
        model: this.model,
        messages,
        temperature: options.temperature || 0.3,
        max_tokens: options.maxTokens || 150,
        ...(options.responseFormat && { response_format: options.responseFormat })
      })

      return { 
        data: completion,
        source: 'openai'
      }
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : String(error),
        source: 'openai'
      }
    }
  }
}

/**
 * Extract content from API response
 */
export function extractResponseContent(response: unknown): string | null {
  if (!response) return null
  
  // Handle Perplexity/OpenAI response format
  if (response.choices?.[0]?.message?.content) {
    return response.choices[0].message.content
  }
  
  // Handle direct content
  if (typeof response === 'string') {
    return response
  }
  
  return null
}

/**
 * Standard error response
 */
export function createErrorResponse(message: string, status: number = 500) {
  return Response.json(
    { error: message },
    { status }
  )
}

/**
 * Standard success response
 */
export function createSuccessResponse<T = any>(data: T, metadata: Record<string, any> = {}) {
  return Response.json({
    ...data,
    ...metadata,
    timestamp: new Date().toISOString()
  })
}