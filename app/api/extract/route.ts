import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { url, text } = await request.json()

    if (!url && !text) {
      return NextResponse.json({ error: 'Missing URL or text' }, { status: 400 })
    }

    let extractedData: string[] = []

    if (url) {
      // In production, this would fetch and parse the URL
      // For now, return mock data based on URL pattern
      extractedData = await extractFromUrl(url)
    } else if (text) {
      // Extract entities from text
      extractedData = extractFromText(text)
    }

    return NextResponse.json({ 
      data: extractedData,
      count: extractedData.length,
      source: url || 'text'
    })
  } catch (error) {
    console.error('Extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract data' },
      { status: 500 }
    )
  }
}

async function extractFromUrl(url: string): Promise<string[]> {
  // Mock extraction based on URL patterns
  // In production, this would actually fetch and parse the page
  
  const urlLower = url.toLowerCase()
  
  if (urlLower.includes('crunchbase') || urlLower.includes('company')) {
    return [
      'Stripe',
      'OpenAI',
      'Anthropic',
      'Databricks',
      'Canva',
      'Figma',
      'Notion',
      'Airtable',
      'Vercel',
      'Supabase',
      'Linear',
      'Retool',
      'Temporal',
      'Planetscale',
      'Railway'
    ]
  }
  
  if (urlLower.includes('linkedin') || urlLower.includes('people')) {
    return [
      'John Smith - CEO at TechCorp',
      'Sarah Johnson - VP Engineering',
      'Michael Chen - Product Manager',
      'Emily Davis - Data Scientist',
      'Robert Wilson - Sales Director',
      'Lisa Anderson - Marketing Head',
      'David Brown - CTO',
      'Jennifer Lee - HR Director',
      'Chris Taylor - Operations Manager',
      'Amanda White - Finance Director'
    ]
  }
  
  if (urlLower.includes('product')) {
    return [
      'CRM Software',
      'Project Management Tool',
      'Email Marketing Platform',
      'Analytics Dashboard',
      'Customer Support System',
      'Inventory Management',
      'HR Management System',
      'Accounting Software',
      'Social Media Manager',
      'Content Management System'
    ]
  }
  
  // Default: return generic items
  return [
    'Item 1 from ' + new URL(url).hostname,
    'Item 2 from ' + new URL(url).hostname,
    'Item 3 from ' + new URL(url).hostname,
    'Item 4 from ' + new URL(url).hostname,
    'Item 5 from ' + new URL(url).hostname
  ]
}

function extractFromText(text: string): string[] {
  // Simple entity extraction from text
  // Split by common delimiters and clean up
  
  const lines = text
    .split(/[\n,;|]/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
  
  // Try to detect if it's a structured format
  const cleaned = lines.map(line => {
    // Remove common prefixes like numbers, bullets, etc.
    return line
      .replace(/^[\d\.\-\*\•\◦\▪\→\>\#]+\s*/g, '')
      .replace(/^\s*[\(\[].*?[\)\]]\s*/g, '')
      .trim()
  }).filter(item => item.length > 0)
  
  // Remove duplicates
  return [...new Set(cleaned)]
}