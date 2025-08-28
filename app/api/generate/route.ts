import { NextResponse } from 'next/server'

// Initialize Perplexity API - ALWAYS use real web search
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || ''

// Detect query type to provide better context
function detectQueryType(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()
  
  if (lowerPrompt.includes('who works at') || lowerPrompt.includes('employees of') || lowerPrompt.includes('team at')) {
    return '[Focus: Find specific people with full names and their titles/positions]'
  }
  if (lowerPrompt.includes('companies in') || lowerPrompt.includes('startups') || lowerPrompt.includes('businesses')) {
    return '[Focus: Find actual company names with brief descriptions]'
  }
  if (lowerPrompt.includes('ceo') || lowerPrompt.includes('founder') || lowerPrompt.includes('executive')) {
    return '[Focus: Find specific person names with their company and title]'
  }
  if (lowerPrompt.includes('products') || lowerPrompt.includes('services') || lowerPrompt.includes('tools')) {
    return '[Focus: Find specific product/service names with companies]'
  }
  if (lowerPrompt.includes('real estate') || lowerPrompt.includes('properties') || lowerPrompt.includes('agents')) {
    return '[Focus: Find specific names with companies/brokerages]'
  }
  if (lowerPrompt.includes('investors') || lowerPrompt.includes('vcs') || lowerPrompt.includes('venture')) {
    return '[Focus: Find specific investor/firm names]'
  }
  // Default
  return '[Focus: Find specific, named entities relevant to this query]'
}

// Validate and filter results to remove hallucinations
function validateResults(items: string[]): string[] {
  return items.filter(item => {
    // Universal blacklist
    const blacklist = ['unnamed', 'unspecified', 'unknown', 'various', 'multiple', 'several', 'unidentified']
    const lowerItem = item.toLowerCase()
    
    // Check for blacklisted words
    if (blacklist.some(word => lowerItem.includes(word))) {
      console.log(`[Find Data] Filtering out hallucinated item: ${item}`)
      return false
    }
    
    // Remove items that are just numbers + generic terms
    if (item.match(/^\d+\s+(employees|people|staff|workers|managers|executives)/i)) {
      console.log(`[Find Data] Filtering out generic count: ${item}`)
      return false
    }
    
    // Must have minimum content
    if (item.trim().length < 3) {
      return false
    }
    
    // For people, should have at least two words (first and last name)
    // Unless it's a company or product
    if (!item.includes('-') && !item.includes(',') && !item.includes('Inc') && !item.includes('LLC')) {
      const words = item.split(' ').filter(w => w.length > 1)
      if (words.length < 2) {
        console.log(`[Find Data] Filtering out single word: ${item}`)
        return false
      }
    }
    
    return true
  })
}

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
    
    const systemPrompt = `You are a precision web search assistant. Your ONLY job is to find REAL, VERIFIABLE information.

UNIVERSAL RULES (apply to EVERY search):
1. ONLY return items you can verify exist through web search
2. Quality > Quantity: Better to return 3 real items than ${count} with fakes
3. Each item must be specific and verifiable:
   - People: Must have full names
   - Companies: Must have actual company names  
   - Products: Must have specific product names
   - Places: Must have actual addresses/locations
4. If you cannot find enough real data, return ONLY what exists
5. NEVER create placeholder content

PROHIBITED (never return these):
- "unnamed" / "unspecified" / "unknown" / "various"
- Generic descriptions without specific names
- Numbered lists like "35 employees" or "10 managers"
- Placeholder text or approximations
- Made-up examples

OUTPUT RULES:
- Return a JSON array of strings
- Each string should be self-contained with all relevant info
- Stop when you run out of real data
- It's OK to return fewer items than requested`

    // Detect query type and enhance prompt
    const queryHint = detectQueryType(prompt)
    
    const userPrompt = `Task: ${prompt}

Search the web to find UP TO ${count} real results for this query.
${queryHint}

IMPORTANT:
- Interpret the query intelligently based on what's being asked
- If searching for people: Return "Full Name - Title/Company"
- If searching for companies: Return "Company Name - Brief descriptor"
- If searching for products: Return "Product Name - Company/Category"
- If searching for data points: Return specific values with context

Return ONLY verified results you find through web search.
If you can only verify ${Math.min(5, Math.floor(count/4))} items, return just those.
Quality and accuracy are mandatory, quantity is optional.

Format: JSON array of strings, each item complete and specific.`

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

    // Ensure we have strings and take up to the requested count
    items = items.slice(0, count).map(item => 
      typeof item === 'string' ? item.trim() : JSON.stringify(item)
    ).filter(item => item && item.length > 0)
    
    // Apply validation to filter out hallucinations
    const validatedItems = validateResults(items)
    
    console.log(`[Find Data] Raw items: ${items.length}, After validation: ${validatedItems.length}`)
    
    if (validatedItems.length === 0) {
      return NextResponse.json({ 
        error: 'No verified results found. The query may be too specific or data may not be publicly available.' 
      }, { status: 404 })
    }

    console.log(`[Find Data] Found ${validatedItems.length} verified items from Perplexity search`)
    
    // Build search query for audit trail
    const searchQuery = `Search the internet for: ${prompt}`
    
    return NextResponse.json({ 
      data: validatedItems,
      count: validatedItems.length,
      type,
      source: 'perplexity-sonar',
      model: 'sonar',
      // Add message if we found fewer than requested
      message: validatedItems.length < count 
        ? `Found ${validatedItems.length} verified results (requested ${count})` 
        : null,
      // Add process information for audit trail
      process: {
        prompt: prompt,
        query: searchQuery,
        response: fullResponse,
        citations: citations,
        timestamp: new Date().toISOString(),
        itemsFound: validatedItems.length,
        requestedCount: count,
        filteredOut: items.length - validatedItems.length
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