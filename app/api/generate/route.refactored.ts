import { NextResponse } from 'next/server'
import { PerplexityClient, extractResponseContent, createErrorResponse, createSuccessResponse } from '@/lib/api/api-client'
import { MockDataService } from '@/lib/services/mock-data.service'
import { API_CONFIG, DEFAULTS } from '@/lib/constants'
import type { GenerationRequest, GenerationResponse } from '@/types/api'

/**
 * Refactored generate route using shared utilities
 */
export async function POST(request: Request) {
  try {
    const body: GenerationRequest = await request.json()
    const { prompt, count = DEFAULTS.DEFAULT_COUNT, type = 'first-column' } = body

    if (!prompt) {
      return createErrorResponse('Missing prompt', 400)
    }

    console.log('[Find Data] Processing prompt:', prompt)
    console.log('[Find Data] Requested count:', count)

    // Initialize clients
    const perplexity = new PerplexityClient()
    const mockService = MockDataService.getInstance()

    // Check if API is configured
    if (!perplexity.isConfigured) {
      console.log('[Find Data] Warning: No Perplexity API key, using mock data')
      const mockData = mockService.generateData(prompt, { count, type })
      
      const response: GenerationResponse = {
        data: mockData,
        count: mockData.length,
        type,
        source: 'mock',
        warning: 'Please configure PERPLEXITY_API_KEY environment variable'
      }
      
      return createSuccessResponse(response)
    }

    // Use Perplexity for real data
    console.log('[Find Data] Searching with Perplexity Sonar...')
    
    const messages = [
      {
        role: 'system',
        content: buildSystemPrompt(count)
      },
      {
        role: 'user',
        content: buildUserPrompt(prompt, count)
      }
    ]

    const result = await perplexity.completion(messages, {
      temperature: API_CONFIG.PERPLEXITY.TEMPERATURE,
      maxTokens: API_CONFIG.PERPLEXITY.MAX_TOKENS
    })

    // Handle API error
    if (result.error) {
      console.log('[Find Data] Perplexity API error:', result.error)
      const mockData = mockService.generateData(prompt, { count, type })
      
      const response: GenerationResponse = {
        data: mockData,
        count: mockData.length,
        type,
        source: 'mock',
        error: result.error
      }
      
      return createSuccessResponse(response)
    }

    // Extract and parse response
    const content = extractResponseContent(result.data)
    if (!content) {
      throw new Error('Empty response from Perplexity')
    }

    console.log('[Find Data] Raw Perplexity response:', content.substring(0, 500))

    const items = parseResponseItems(content, count)

    if (items.length > 0) {
      console.log(`[Find Data] Found ${items.length} real items from Perplexity search`)
      
      const response: GenerationResponse = {
        data: items,
        count: items.length,
        type,
        source: 'perplexity',
        model: API_CONFIG.PERPLEXITY.MODEL
      }
      
      return createSuccessResponse(response)
    }

    // Fall back to mock if no data found
    console.log('[Find Data] No data found from Perplexity, using mock')
    const mockData = mockService.generateData(prompt, { count, type })
    
    const response: GenerationResponse = {
      data: mockData,
      count: mockData.length,
      type,
      source: 'mock'
    }
    
    return createSuccessResponse(response)

  } catch (error) {
    console.error('Generation error:', error)
    return createErrorResponse('Failed to generate data', 500)
  }
}

/**
 * Build system prompt for Perplexity
 */
function buildSystemPrompt(count: number): string {
  return `You MUST search the internet to find REAL, EXISTING entities.
Do NOT generate, hallucinate, or make up any names or data.
Return ONLY actual people/companies that currently exist based on web search results.
Format: JSON array of strings with exactly ${count} items.
For agents/brokers: Include full name and company (e.g., "John Smith - Ray White Sydney")
For companies: Include the actual company name as it appears online
CRITICAL: These must be REAL entities you find through web search, not generated examples.`
}

/**
 * Build user prompt for search
 */
function buildUserPrompt(prompt: string, count: number): string {
  return `Search the internet RIGHT NOW for: ${prompt}
Find exactly ${count} REAL, CURRENTLY EXISTING results.
These must be ACTUAL entities with VERIFIABLE information from web search.
Use current web data to find real names, real companies, real information.
Do NOT make up or generate any data - only return what you find through web search.
Return as JSON array.`
}

/**
 * Parse response items from various formats
 */
function parseResponseItems(content: string, requestedCount: number): string[] {
  let items: string[] = []
  
  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(content)
    
    if (Array.isArray(parsed)) {
      items = parsed
    } else if (parsed.items && Array.isArray(parsed.items)) {
      items = parsed.items
    } else if (parsed.data && Array.isArray(parsed.data)) {
      items = parsed.data
    } else if (parsed.results && Array.isArray(parsed.results)) {
      items = parsed.results
    } else {
      // Try to extract array from any property that is an array
      const arrays = Object.values(parsed).filter(val => Array.isArray(val))
      if (arrays.length > 0) {
        items = arrays[0] as string[]
      }
    }
  } catch (parseError) {
    // If JSON parsing fails, extract items from text
    console.log('[Find Data] Parsing response as text')
    items = extractItemsFromText(content, requestedCount)
  }

  // Ensure we have strings and clean them up
  return items
    .slice(0, requestedCount)
    .map(item => typeof item === 'string' ? item.trim() : JSON.stringify(item))
    .filter(item => item && item.length > 0)
}

/**
 * Extract items from plain text response
 */
function extractItemsFromText(text: string, requestedCount: number): string[] {
  const items: string[] = []
  const lines = text.split(/[\n\r,;]/)
  
  for (const line of lines) {
    let cleaned = line.trim()
    
    // Remove common prefixes
    cleaned = cleaned.replace(/^[\d\.\-\*\•\)\]]+\s*/, '')
    cleaned = cleaned.replace(/^["']|["']$/g, '')
    
    // Skip empty or filler lines
    if (cleaned.length > 2 && 
        !cleaned.toLowerCase().includes('here') && 
        !cleaned.toLowerCase().includes('following') && 
        !cleaned.toLowerCase().includes('list')) {
      
      // Accept lines with proper formatting
      if (cleaned.includes(' - ') || 
          cleaned.includes(' at ') || 
          cleaned.includes(' from ') || 
          cleaned.match(/^[A-Z]/)) {
        items.push(cleaned)
      }
    }
    
    if (items.length >= requestedCount) break
  }
  
  return items
}