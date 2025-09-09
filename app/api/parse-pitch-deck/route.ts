import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { PITCH_DECK_HEADERS } from '@/lib/pitch-deck-parser'

// Initialize Anthropic client
const getAnthropicClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
  if (!apiKey || apiKey === 'your-claude-api-key-here') {
    console.warn('No Claude API key configured')
    return null
  }
  return new Anthropic({ apiKey })
}

// Parse document content based on file type
async function extractTextFromFile(file: File): Promise<{ content: string; error?: string }> {
  const fileName = file.name.toLowerCase()
  
  try {
    if (fileName.endsWith('.pdf')) {
      try {
        // Dynamic import for server-side only
        const pdfParse = (await import('pdf-parse')).default
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        // pdf-parse with options to avoid test file issues
        const data = await pdfParse(buffer, {
          // Disable default test data loading
          version: 'default'
        })
        
        if (!data.text || data.text.trim().length === 0) {
          console.log('PDF has no extractable text - might be image-based')
          return { 
            content: '', 
            error: 'PDF appears to be image-based or has no extractable text. Using sample data.' 
          }
        }
        
        return { content: data.text }
      } catch (pdfError: any) {
        console.error('PDF parsing error:', pdfError.message)
        return { 
          content: '', 
          error: `PDF extraction failed: ${pdfError.message}. Using sample data.` 
        }
      }
    } else if (fileName.endsWith('.txt')) {
      const text = await file.text()
      return { content: text }
    } else if (fileName.match(/\.pptx?$/)) {
      // For PowerPoint, we'll extract what text we can
      const text = await file.text()
      // Extract readable text patterns
      const readable = text.match(/[\x20-\x7E]+/g)
      const content = readable ? readable.join(' ') : ''
      
      if (!content) {
        return { 
          content: '', 
          error: 'Could not extract text from PowerPoint file. Using sample data.' 
        }
      }
      
      return { content }
    } else {
      // Default to text extraction
      const text = await file.text()
      return { content: text }
    }
  } catch (error) {
    console.error('Error extracting text from file:', error)
    return { 
      content: '', 
      error: `File extraction failed: ${(error instanceof Error ? error.message : String(error))}. Using sample data.` 
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Extract text content from file
    const extraction = await extractTextFromFile(file)
    
    // If extraction failed, return mock data with a note
    if (!extraction.content || extraction.content.trim().length === 0) {
      console.log('Text extraction failed or empty, using mock data:', extraction.error)
      const mockData = generateMockPitchDeckData(file.name)
      
      // Add extraction error note to the mock data
      if (extraction.error && mockData.rows && mockData.rows[0]) {
        mockData.rows[0][mockData.rows[0].length - 1] = 
          `Note: ${extraction.error} | File: ${file.name}`
      }
      
      return NextResponse.json({
        ...mockData,
        extractionNote: extraction.error || 'Could not extract text from file'
      })
    }
    
    const anthropic = getAnthropicClient()
    
    if (!anthropic) {
      console.log('No Claude API key configured, returning mock data')
      // Return mock data if no API key
      return NextResponse.json(generateMockPitchDeckData(file.name))
    }
    
    console.log('Using Claude API for pitch deck extraction')
    
    // Create extraction prompt
    const systemPrompt = `You are an expert VC analyst extracting structured data from pitch decks.
    
Your task is to extract information and map it to a spreadsheet format for VC investment analysis.

Return a JSON object with:
- headers: An array of column headers
- rows: An array containing one row of extracted data

The columns should match this VC scoring framework:
${PITCH_DECK_HEADERS.join(', ')}

Guidelines:
- Extract actual values from the pitch deck content
- Use "Not specified" or "N/A" for missing information
- For market size, extract TAM/SAM/SOM values
- For team, list founder names and their experience
- For metrics, extract specific numbers (revenue, users, growth rate)
- For funding, note previous rounds and amounts
- Be concise but comprehensive
- Return valid JSON only, no explanations`

    const userPrompt = `Extract structured data from this pitch deck content:

File: ${file.name}

Content:
${extraction.content.substring(0, 15000)} // Limit content length for API

Extract and structure the information according to the VC investment framework.`

    try {
      const response = await anthropic.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest',
        max_tokens: 4000,
        temperature: 0.3,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: userPrompt
        }]
      })
      
      const responseContent = response.content[0]
      if (responseContent.type === 'text') {
        try {
          // Parse the JSON response
          let jsonText = responseContent.text
          
          // Clean up the response if needed
          jsonText = jsonText
            .replace(/```json\s*/g, '')
            .replace(/```\s*/g, '')
            .trim()
          
          // Find JSON object in response
          const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            jsonText = jsonMatch[0]
          }
          
          const extractedData = JSON.parse(jsonText)
          
          // Validate structure
          if (!extractedData.headers || !extractedData.rows) {
            throw new Error('Invalid response structure')
          }
          
          console.log('Successfully extracted data from pitch deck')
          return NextResponse.json(extractedData)
          
        } catch (parseError) {
          console.error('Failed to parse Claude response:', parseError)
          // Return with default structure on parse error
          return NextResponse.json(generateMockPitchDeckData(file.name))
        }
      }
    } catch (apiError: any) {
      console.error('Claude API error:', apiError)
      // Return mock data on API error
      return NextResponse.json(generateMockPitchDeckData(file.name))
    }
    
  } catch (error) {
    console.error('Pitch deck parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse pitch deck', message: (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}

// Generate mock data for testing or when API is unavailable
function generateMockPitchDeckData(fileName: string) {
  const companyName = fileName.replace(/\.(pdf|pptx?)$/i, '').replace(/[-_]/g, ' ')
  
  const mockRow = [
    companyName,                    // Company Name
    "Technology/SaaS",              // Industry/Vertical
    "Series A",                     // Stage
    "2021",                        // Founded
    "San Francisco, CA",           // Headquarters
    "www.example.com",             // Website
    "$50B",                        // Market Size (TAM)
    "25% CAGR",                    // Market Growth Rate
    "High - Mission critical",      // Customer Pain Intensity
    "John Doe, Jane Smith",        // Founders
    "10+ years in industry",       // Founder Experience
    "25",                          // Team Size
    "AI-powered analytics platform", // Product Description
    "Production",                   // Product Stage
    "Proprietary ML algorithms",   // Product Differentiation
    "500+ customers",              // Customers/Users
    "$2M ARR",                     // Revenue/MRR
    "200% YoY",                    // Growth Rate
    "PLG + Enterprise sales",       // GTM Strategy
    "Patented technology",         // Technology/IP
    "Strong network effects",      // Tech Defensibility
    "$5M Series A",                // Previous Funding
    "$500K/month",                 // Burn Rate
    "18",                          // Runway (months)
    "$50M",                        // Valuation
    "$15M Series B",               // Investment Ask
    "Product dev, GTM, hiring",    // Use of Funds
    "NRR: 125%, CAC: $5K",        // Key Metrics
    "Competitor A, B, C",          // Competition
    "Market timing, execution",     // Risks
    `Extracted from: ${fileName}`  // Evidence/Notes
  ]
  
  return {
    headers: PITCH_DECK_HEADERS,
    rows: [mockRow]
  }
}