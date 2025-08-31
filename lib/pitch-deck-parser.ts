// VC Scoring Framework columns that we'll extract
const PITCH_DECK_HEADERS = [
  "Company Name",
  "Industry/Vertical", 
  "Stage",
  "Founded",
  "Headquarters",
  "Website",
  // Market (30%)
  "Market Size (TAM)",
  "Market Growth Rate",
  "Customer Pain Intensity",
  // Team (20%)
  "Founders",
  "Founder Experience",
  "Team Size",
  // Product (15%)
  "Product Description",
  "Product Stage",
  "Product Differentiation",
  // GTM (12%)
  "Customers/Users",
  "Revenue/MRR",
  "Growth Rate",
  "GTM Strategy",
  // Tech (8%)
  "Technology/IP",
  "Tech Defensibility",
  // Business & Deal (15%)
  "Previous Funding",
  "Burn Rate",
  "Runway (months)",
  "Valuation",
  "Investment Ask",
  "Use of Funds",
  // Additional
  "Key Metrics",
  "Competition",
  "Risks",
  "Evidence/Notes"
]

export async function parsePitchDeck(file: File): Promise<{
  headers: string[]
  rows: string[][]
  extractionNote?: string
}> {
  try {
    // Create FormData to send file to API
    const formData = new FormData()
    formData.append('file', file)
    
    // Send to API for processing and AI extraction
    const response = await fetch('/api/parse-pitch-deck', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Failed to parse pitch deck: ${errorData}`)
    }
    
    const result = await response.json()
    
    // Validate response structure
    if (!result.headers || !result.rows) {
      // If API doesn't return expected format, use defaults
      return {
        headers: PITCH_DECK_HEADERS,
        rows: [createEmptyRow(result)],
        extractionNote: result.extractionNote
      }
    }
    
    return {
      headers: result.headers,
      rows: result.rows,
      extractionNote: result.extractionNote
    }
    
  } catch (error) {
    console.error('Error parsing pitch deck:', error)
    
    // Return empty template on error
    return {
      headers: PITCH_DECK_HEADERS,
      rows: [PITCH_DECK_HEADERS.map(() => 'Error extracting data')]
    }
  }
}

// Helper function to create a row from partial data
function createEmptyRow(data?: any): string[] {
  const row: string[] = []
  
  PITCH_DECK_HEADERS.forEach(header => {
    if (data && data[header]) {
      row.push(String(data[header]))
    } else {
      // Provide helpful defaults
      switch(header) {
        case "Company Name":
          row.push(data?.companyName || "Unknown Company")
          break
        case "Product Stage":
          row.push("MVP")
          break
        case "Stage":
          row.push("Pre-Seed")
          break
        default:
          row.push("Not specified")
      }
    }
  })
  
  return row
}

// Export headers for reference
export { PITCH_DECK_HEADERS }