import { NextResponse } from 'next/server'

// Initialize Perplexity API - ALWAYS use real web search
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || ''

export async function POST(request: Request) {
  try {
    const { prompt, count = 20, type = 'first-column' } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
    }

    // Check if API key is configured
    if (!PERPLEXITY_API_KEY) {
      return NextResponse.json({ 
        error: 'Perplexity API key not configured. Please add PERPLEXITY_API_KEY to your environment variables.'
      }, { status: 500 })
    }

    console.log("[Find Data] Processing prompt:", prompt)
    console.log("[Find Data] Requested count:", count)
    console.log("[Find Data] Searching with Perplexity Sonar...")
    
    const systemPrompt = `You MUST search the internet to find REAL, EXISTING entities.
Do NOT generate, hallucinate, or make up any names or data.
Return ONLY actual people/companies that currently exist based on web search results.
Format: JSON array of strings with exactly ${count} items.
For agents/brokers: Include full name and company (e.g., "John Smith - Ray White Sydney")
For companies: Include the actual company name as it appears online
CRITICAL: These must be REAL entities you find through web search, not generated examples.`

    const userPrompt = `Search the internet RIGHT NOW for: ${prompt}
Find exactly ${count} REAL, CURRENTLY EXISTING results.
These must be ACTUAL entities with VERIFIABLE information from web search.
Use current web data to find real names, real companies, real information.
Do NOT make up or generate any data - only return what you find through web search.
Return as JSON array.`

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 2000,
        return_citations: true,
        return_related_questions: false
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[Find Data] Perplexity API error:", error)
      return NextResponse.json({ 
        error: `Failed to fetch data from Perplexity: ${response.status}` 
      }, { status: 500 })
    }

    const data = await response.json()
    console.log("[Find Data] Perplexity response received")

    // Extract items and citations from the response
    let items: string[] = []
    let citations: string[] = []
    let fullResponse = ''
    
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      const content = data.choices[0].message.content
      fullResponse = content
      console.log("[Find Data] Raw Perplexity response:", content.substring(0, 500))
      
      // Extract citations if available
      if (data.citations) {
        citations = data.citations
        console.log("[Find Data] Found", citations.length, "citations")
      }
      
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
        console.log("[Find Data] Parsing response as text")
        items = extractItemsFromText(content, count)
      }
    }

    // Ensure we have strings
    items = items.slice(0, count).map(item => 
      typeof item === 'string' ? item.trim() : JSON.stringify(item)
    ).filter(item => item && item.length > 0)

    if (items.length === 0) {
      return NextResponse.json({ 
        error: 'No results found. Please try a different search query.' 
      }, { status: 404 })
    }

    console.log(`[Find Data] Found ${items.length} real items from Perplexity search`)
    
    // Build search query for audit trail
    const searchQuery = `Search the internet for: ${prompt}`
    
    return NextResponse.json({ 
      data: items,
      count: items.length,
      type,
      source: 'perplexity-sonar',
      model: 'sonar',
      // Add process information for audit trail
      process: {
        prompt: prompt,
        query: searchQuery,
        response: fullResponse,
        citations: citations,
        timestamp: new Date().toISOString(),
        itemsFound: items.length,
        requestedCount: count
      }
    })

  } catch (error: any) {
    console.error('[Find Data] Error:', error)
    return NextResponse.json(
      { error: `Failed to generate data: ${error.message}` },
      { status: 500 }
    )
  }
}

function extractItemsFromText(text: string, requestedCount: number): string[] {
  const items: string[] = []
  
  // Split by newlines and common separators
  const lines = text.split(/[\n\r,;]/)
  
  for (const line of lines) {
    let cleaned = line.trim()
    
    // Remove common prefixes like "1.", "- ", "* ", etc.
    cleaned = cleaned.replace(/^[\d\.\-\*\•\)\]]+\s*/, '')
    
    // Remove quotes
    cleaned = cleaned.replace(/^["']|["']$/g, '')
    
    // Skip empty lines or very short entries
    if (cleaned.length > 2 && !cleaned.toLowerCase().includes('here') && 
        !cleaned.toLowerCase().includes('following') && 
        !cleaned.toLowerCase().includes('list')) {
      
      // For agent listings, try to extract name and company
      if (cleaned.includes(' - ') || cleaned.includes(' at ') || cleaned.includes(' from ')) {
        items.push(cleaned)
      } else if (cleaned.match(/^[A-Z]/)) { // Starts with capital letter
        items.push(cleaned)
      }
    }
    
    if (items.length >= requestedCount) break
  }
  
  return items
}