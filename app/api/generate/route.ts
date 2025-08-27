import { NextResponse } from 'next/server'

// Initialize Perplexity API
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || ''

export async function POST(request: Request) {
  try {
    const { prompt, count = 20, type = 'first-column' } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
    }

    console.log("[Find Data] Processing prompt:", prompt)
    console.log("[Find Data] Requested count:", count)

    // Check if API key is configured
    if (!PERPLEXITY_API_KEY) {
      console.log("[Find Data] Warning: No Perplexity API key, using mock data")
      const mockData = generateMockData(prompt, count)
      return NextResponse.json({ 
        data: mockData,
        count: mockData.length,
        type,
        source: 'mock',
        warning: 'Please configure PERPLEXITY_API_KEY environment variable'
      })
    }

    try {
      // Use Perplexity with web search for real data
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
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Perplexity API error: ${response.status} - ${error}`)
      }

      const data = await response.json()
      console.log("[Find Data] Perplexity response received")

      // Extract items from the response
      let items: string[] = []
      
      if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        const content = data.choices[0].message.content
        console.log("[Find Data] Raw Perplexity response:", content.substring(0, 500)) // Log first 500 chars
        
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

      if (items.length > 0) {
        console.log(`[Find Data] Found ${items.length} real items from Perplexity search`)
        
        return NextResponse.json({ 
          data: items,
          count: items.length,
          type,
          source: 'perplexity-sonar',
          model: 'sonar'
        })
      }

      // Fall back to mock if no data found
      console.log("[Find Data] No data found from Perplexity, using mock")
      const mockData = generateMockData(prompt, count)
      return NextResponse.json({ 
        data: mockData,
        count: mockData.length,
        type,
        source: 'mock'
      })

    } catch (perplexityError: any) {
      console.log("[Find Data] Perplexity API error:", perplexityError.message)
      
      // Fall back to mock data on error
      const data = generateMockData(prompt, count)
      
      return NextResponse.json({ 
        data,
        count: data.length,
        type,
        source: 'mock',
        error: perplexityError.message
      })
    }
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate data' },
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

// Mock data generation as fallback
function generateMockData(prompt: string, count: number): string[] {
  const lowerPrompt = prompt.toLowerCase()
  
  if (lowerPrompt.includes('company') || lowerPrompt.includes('companies')) {
    return generateCompanies(count)
  } else if (lowerPrompt.includes('agent') || lowerPrompt.includes('broker')) {
    return generateAgents(count)
  } else if (lowerPrompt.includes('founder') || lowerPrompt.includes('ceo') || lowerPrompt.includes('people')) {
    return generatePeopleNames(count)
  } else if (lowerPrompt.includes('property') || lowerPrompt.includes('real estate')) {
    return generateAddresses(count)
  } else {
    return Array.from({ length: count }, (_, i) => `Item ${i + 1}`)
  }
}

function generateCompanies(count: number): string[] {
  const companies = [
    'TechCorp Solutions', 'DataSync Systems', 'CloudMetrics Pro',
    'InnovateTech', 'Digital Dynamics', 'FutureScale', 'SmartData Inc',
    'Quantum Analytics', 'NextGen Software', 'AI Innovations',
    'CyberSecure Tech', 'GlobalTech Partners', 'Velocity Systems',
    'DataDrive Solutions', 'CloudFirst Technologies'
  ]
  return companies.slice(0, count)
}

function generateAgents(count: number): string[] {
  const agents = [
    'John Smith - Ray White', 'Sarah Johnson - McGrath Estate',
    'Michael Chen - Belle Property', 'Emily Davis - LJ Hooker',
    'Robert Wilson - Harcourts', 'Lisa Anderson - Century 21',
    'David Martinez - Raine & Horne', 'Jennifer Taylor - Laing+Simmons',
    'William Brown - Di Jones', 'Maria Garcia - Bresic Whitney',
    'James Miller - The Agency', 'Patricia Jones - Sotheby\'s',
    'Christopher Lee - Knight Frank', 'Jessica White - CBRE',
    'Daniel Harris - Colliers International'
  ]
  return agents.slice(0, count)
}

function generatePeopleNames(count: number): string[] {
  const names = [
    'John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Davis',
    'Robert Wilson', 'Lisa Anderson', 'David Martinez', 'Jennifer Taylor',
    'William Brown', 'Maria Garcia', 'James Miller', 'Patricia Jones',
    'Christopher Lee', 'Jessica White', 'Daniel Harris'
  ]
  return names.slice(0, count)
}

function generateAddresses(count: number): string[] {
  const addresses = [
    '123 Main Street, New York, NY 10001',
    '456 Oak Avenue, Los Angeles, CA 90028',
    '789 Pine Road, Chicago, IL 60601',
    '321 Maple Drive, Houston, TX 77002',
    '654 Elm Street, Phoenix, AZ 85001',
    '987 Cedar Lane, Philadelphia, PA 19102',
    '147 Birch Way, San Antonio, TX 78205',
    '258 Willow Court, San Diego, CA 92101',
    '369 Spruce Avenue, Dallas, TX 75201',
    '741 Ash Boulevard, San Jose, CA 95110'
  ]
  return addresses.slice(0, count)
}