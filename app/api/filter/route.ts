import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { prompt, headers, data } = await request.json()

    if (!prompt || !headers || !data) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Parse the prompt to understand selection criteria
    const lowerPrompt = prompt.toLowerCase()
    const selectedIndices: number[] = []

    // Simple rule-based filtering for demo
    // In production, this would use an LLM to understand complex queries
    
    data.forEach((row: string[], rowIndex: number) => {
      let shouldSelect = false

      // Check for revenue/funding criteria
      if (lowerPrompt.includes("revenue") || lowerPrompt.includes("funding")) {
        const amountMatch = prompt.match(/\$?([\d,]+)(M|B|K)?/i)
        if (amountMatch) {
          const targetAmount = parseFloat(amountMatch[1].replace(/,/g, ''))
          const multiplier = amountMatch[2]?.toUpperCase() === 'M' ? 1000000 : 
                           amountMatch[2]?.toUpperCase() === 'B' ? 1000000000 : 
                           amountMatch[2]?.toUpperCase() === 'K' ? 1000 : 1

          // Find revenue/funding columns
          headers.forEach((header, colIndex) => {
            if (header.toLowerCase().includes('revenue') || 
                header.toLowerCase().includes('funding')) {
              const cellValue = row[colIndex]
              const cellAmount = parseAmount(cellValue)
              
              if (lowerPrompt.includes('greater') || lowerPrompt.includes('more') || lowerPrompt.includes('over')) {
                if (cellAmount > targetAmount * multiplier) {
                  shouldSelect = true
                }
              } else if (lowerPrompt.includes('less') || lowerPrompt.includes('under')) {
                if (cellAmount < targetAmount * multiplier) {
                  shouldSelect = true
                }
              }
            }
          })
        }
      }

      // Check for empty fields
      if (lowerPrompt.includes("empty")) {
        headers.forEach((header, colIndex) => {
          if (lowerPrompt.includes(header.toLowerCase())) {
            if (!row[colIndex] || row[colIndex].trim() === '') {
              shouldSelect = true
            }
          }
        })
        
        // Generic "empty email" check
        if (lowerPrompt.includes("email")) {
          const emailColIndex = headers.findIndex(h => 
            h.toLowerCase().includes('email') || h.toLowerCase().includes('e-mail')
          )
          if (emailColIndex >= 0 && (!row[emailColIndex] || row[emailColIndex].trim() === '')) {
            shouldSelect = true
          }
        }
      }

      // Check for industry/category
      if (lowerPrompt.includes("industry") || lowerPrompt.includes("category")) {
        const industryTerms = ["technology", "tech", "healthcare", "finance", "retail", "manufacturing"]
        industryTerms.forEach(term => {
          if (lowerPrompt.includes(term)) {
            headers.forEach((header, colIndex) => {
              if (header.toLowerCase().includes('industry') || 
                  header.toLowerCase().includes('category')) {
                if (row[colIndex]?.toLowerCase().includes(term)) {
                  shouldSelect = true
                }
              }
            })
          }
        })
      }

      // Check for location
      if (lowerPrompt.includes("california") || lowerPrompt.includes("ca") ||
          lowerPrompt.includes("new york") || lowerPrompt.includes("ny") ||
          lowerPrompt.includes("texas") || lowerPrompt.includes("tx")) {
        headers.forEach((header, colIndex) => {
          if (header.toLowerCase().includes('location') || 
              header.toLowerCase().includes('state') ||
              header.toLowerCase().includes('address')) {
            const location = lowerPrompt.match(/(california|ca|new york|ny|texas|tx)/i)?.[0]
            if (location && row[colIndex]?.toLowerCase().includes(location.toLowerCase())) {
              shouldSelect = true
            }
          }
        })
      }

      // Check for top N
      if (lowerPrompt.includes("top")) {
        const topMatch = prompt.match(/top (\d+)/i)
        if (topMatch) {
          const topN = parseInt(topMatch[1])
          if (rowIndex < topN) {
            shouldSelect = true
          }
        }
      }

      // Check for containing specific text
      if (lowerPrompt.includes("contains") || lowerPrompt.includes("includes")) {
        const searchTerm = prompt.match(/(?:contains?|includes?)\s+"([^"]+)"/i)?.[1]
        if (searchTerm) {
          row.forEach(cell => {
            if (cell?.toLowerCase().includes(searchTerm.toLowerCase())) {
              shouldSelect = true
            }
          })
        }
      }

      if (shouldSelect) {
        selectedIndices.push(rowIndex)
      }
    })

    // If no specific criteria matched, try to be helpful
    if (selectedIndices.length === 0 && lowerPrompt.includes("all")) {
      // Select all rows
      for (let i = 0; i < data.length; i++) {
        selectedIndices.push(i)
      }
    }

    return NextResponse.json({ 
      selectedIndices,
      message: `Selected ${selectedIndices.length} rows based on: "${prompt}"`
    })

  } catch (error) {
    console.error("Filter API error:", error)
    return NextResponse.json(
      { error: "Failed to process filter" },
      { status: 500 }
    )
  }
}

function parseAmount(value: string): number {
  if (!value) return 0
  
  // Remove currency symbols and spaces
  const cleaned = value.replace(/[$,\s]/g, '')
  
  // Check for M/B/K suffixes
  const match = cleaned.match(/([\d.]+)(M|B|K)?/i)
  if (match) {
    const num = parseFloat(match[1])
    const suffix = match[2]?.toUpperCase()
    
    if (suffix === 'M') return num * 1000000
    if (suffix === 'B') return num * 1000000000
    if (suffix === 'K') return num * 1000
    
    return num
  }
  
  return parseFloat(cleaned) || 0
}