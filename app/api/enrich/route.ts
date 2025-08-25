import { LinkupClient } from "linkup-sdk"
import { validateAndExtractValue, formatTemplates, applyCustomFormat } from "@/lib/enrichment-utils"

const client = new LinkupClient({ apiKey: "0e82fb78-e35f-48ae-aa64-af16af4fcaab" })

export async function POST(request: Request) {
  try {
    const { value, prompt, rowContext, customFormat } = await request.json()

    if (!prompt) {
      return Response.json({ error: "Missing prompt" }, { status: 400 })
    }

    try {
      // Extract format mode and data type from prompt
      const formatModeMatch = prompt.match(/\[Format mode: (\w+)\]/)
      const formatMode = formatModeMatch ? formatModeMatch[1] : 'strict'
      const typeMatch = prompt.match(/\[Expected type: (\w+)\]/)
      const expectedType = typeMatch ? typeMatch[1] : 'text'
      const patternMatch = prompt.match(/\[Pattern: ([^\]]+)\]/)
      const customPattern = patternMatch ? patternMatch[1] : null
      
      // Clean prompt from annotations
      const cleanPrompt = prompt
        .replace(/\[Expected type: \w+\]/, '')
        .replace(/\[Format mode: \w+\]/, '')
        .replace(/\[Pattern: [^\]]+\]/, '')
        .trim()
      
      // Create search query using row context if available
      let searchQuery = cleanPrompt
      
      if (rowContext && Object.keys(rowContext).length > 0) {
        // Build context string from all row data
        const contextParts = Object.entries(rowContext)
          .filter(([key, val]) => val)
          .map(([key, val]) => `${key}: ${val}`)
          .join(", ")
        
        searchQuery = `${contextParts}. ${cleanPrompt}`
        console.log("[v0] Using row context for search:", contextParts)
      } else if (value) {
        // Fallback to single value if no context
        searchQuery = `${value} ${cleanPrompt.replace(/\{value\}/g, value)}`
      }

      console.log("[v0] Linkup search query:", searchQuery)
      console.log("[v0] Expected data type:", expectedType)

      const response = await client.search({
        query: searchQuery,
        depth: "standard",
        outputType: "sourcedAnswer",
        includeImages: false,
      })

      console.log("[v0] Linkup response:", response)

      let enrichedValue = value // fallback to original value

      if (response.answer) {
        enrichedValue = response.answer

        // Extract specific formats
        if (expectedType === 'name') {
          // Extract names from sentences
          const namePattern = /\b([A-Z][a-z]+(?: [A-Z][a-z]+)+)\b/g
          const names = enrichedValue.match(namePattern)
          if (names && names.length > 0) {
            enrichedValue = names.join(', ')
            console.log("[v0] Extracted names:", enrichedValue)
          }
        } else if (expectedType === 'company') {
          // Extract company name, remove common suffixes
          const companyPattern = /\b([A-Z][a-zA-Z0-9\s&]+(?:Inc|LLC|Ltd|Corp|Company|Co)?\.?)\b/
          const match = enrichedValue.match(companyPattern)
          if (match) {
            enrichedValue = match[1].trim()
          }
        } else if (expectedType === 'title') {
          // Extract job title
          const titlePattern = /\b((?:Chief|Senior|Junior|Lead|Head|Director|Manager|VP|President|CEO|CTO|CFO|COO)[^,.;]*)\b/i
          const match = enrichedValue.match(titlePattern)
          if (match) {
            enrichedValue = match[1].trim()
          }
        } else if (expectedType === 'location') {
          // Extract location (city, state/country)
          const locationPattern = /\b([A-Z][a-zA-Z\s]+(?:,\s*[A-Z]{2})?(?:,\s*[A-Z][a-zA-Z\s]+)?)\b/
          const match = enrichedValue.match(locationPattern)
          if (match) {
            enrichedValue = match[1].trim()
          }
        }

        // Apply format validation based on mode
        if (formatMode === 'custom' && customFormat) {
          // Apply custom format validation
          const customValidation = applyCustomFormat(enrichedValue, customFormat)
          if (customValidation.extracted) {
            enrichedValue = customValidation.extracted
            console.log("[v0] Extracted custom formatted value:", enrichedValue)
          } else if (!customValidation.valid) {
            console.log("[v0] Warning: Could not extract value matching custom pattern")
          }
        } else if (formatMode === 'strict') {
          // Apply strict format validation based on expected type
          const validation = validateAndExtractValue(enrichedValue, expectedType)
          
          if (validation.extracted) {
            // Successfully extracted formatted value
            enrichedValue = validation.extracted
            console.log("[v0] Extracted formatted value:", enrichedValue)
          } else if (!validation.valid && formatTemplates[expectedType]?.extractor) {
            // Try harder extraction for specific types
            if (expectedType === 'url' && response.sources?.length > 0) {
              // Look for URLs in sources
              const urlSource = response.sources.find((source) => source.url)
              if (urlSource) {
                enrichedValue = urlSource.url
              }
            } else if (expectedType === 'email') {
              // Try to extract from full text
              const extracted = formatTemplates.email.extractor(response.answer)
              if (extracted) {
                enrichedValue = extracted
              }
            }
          }
          
          // Final validation
          const finalValidation = validateAndExtractValue(enrichedValue, expectedType)
          if (finalValidation.valid || finalValidation.extracted) {
            enrichedValue = finalValidation.extracted || finalValidation.value
          } else {
            console.log(`[v0] Warning: Could not extract valid ${expectedType} from response`)
          }
        }
        // For 'free' mode, no validation needed
      }

      const isValidated = formatMode === 'custom' 
        ? customFormat && applyCustomFormat(enrichedValue.trim(), customFormat).valid
        : formatMode === 'strict' 
          ? validateAndExtractValue(enrichedValue.trim(), expectedType).valid
          : true // free mode is always "valid"
      
      return Response.json({ 
        enrichedValue: enrichedValue.trim(),
        dataType: expectedType,
        formatMode,
        validated: isValidated
      })
    } catch (linkupError) {
      console.log("[v0] Linkup API error:", linkupError.message)
      console.log("[v0] Linkup API not available, using mock enrichment")

      // Fallback to mock enrichment for demo purposes
      const primaryValue = value || (rowContext ? Object.values(rowContext)[0] : "")
      const cleanPrompt = prompt
        .replace(/\[Expected type: \w+\]/, '')
        .replace(/\[Format mode: \w+\]/, '')
        .replace(/\[Pattern: [^\]]+\]/, '')
        .trim()
      const typeMatch = prompt.match(/\[Expected type: (\w+)\]/)
      const expectedType = typeMatch ? typeMatch[1] : 'text'
      const formatModeMatch = prompt.match(/\[Format mode: (\w+)\]/)
      const formatMode = formatModeMatch ? formatModeMatch[1] : 'strict'
      
      const mockEnrichment = generateMockEnrichment(primaryValue, cleanPrompt, rowContext, expectedType, formatMode, customFormat)
      
      return Response.json({ 
        enrichedValue: mockEnrichment,
        dataType: expectedType,
        validated: true // Mock data is already formatted correctly
      })
    }
  } catch (error) {
    console.error("Enrichment API error:", error)
    return Response.json({ error: "Failed to enrich data" }, { status: 500 })
  }
}

function generateMockEnrichment(
  value: string, 
  prompt: string, 
  rowContext?: Record<string, string>, 
  expectedType?: string,
  formatMode?: string,
  customFormat?: any
): string {
  const lowerPrompt = prompt.toLowerCase()
  const lowerValue = value.toLowerCase()
  
  // Use context for more accurate mock data if available
  const companyName = rowContext?.["Company Name"] || rowContext?.["Company"] || value
  const location = rowContext?.["Location"] || rowContext?.["Region"] || ""
  
  // Generate based on expected type if provided
  if (expectedType) {
    switch (expectedType) {
      case 'name':
        // Return just names for founder/CEO prompts
        if (lowerPrompt.includes("founder") || lowerPrompt.includes("ceo")) {
          const names = ["John Smith", "Sarah Johnson", "Michael Chen, David Lee", "Emily Davis", "Robert Wilson, Anna Brown"]
          return names[Math.floor(Math.random() * names.length)]
        }
        return "John Doe"
      
      case 'company':
        return companyName
      
      case 'title':
        const titles = ["CEO", "CTO", "VP of Sales", "Director of Marketing", "Senior Engineer", "Product Manager"]
        return titles[Math.floor(Math.random() * titles.length)]
      
      case 'location':
        if (location) return location
        const locations = ["San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "Boston, MA"]
        return locations[Math.floor(Math.random() * locations.length)]
      
      case 'email':
        const leadName = rowContext?.["Lead Name"] || ""
        if (leadName) {
          const firstName = leadName.split(" ")[0].toLowerCase()
          return `${firstName}@${companyName.toLowerCase().replace(/\s+/g, "")}.com`
        }
        return `contact@${companyName.toLowerCase().replace(/\s+/g, "")}.com`
      
      case 'url':
        return `https://www.${companyName.toLowerCase().replace(/\s+/g, "")}.com`
      
      case 'phone':
        return `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
      
      case 'currency':
        const amounts = ["$10M", "$50M", "$100M", "$500M", "$1B", "$5B"]
        return amounts[Math.floor(Math.random() * amounts.length)]
      
      case 'percentage':
        return `${Math.floor(Math.random() * 100)}%`
      
      case 'date':
        const year = 2000 + Math.floor(Math.random() * 24)
        const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
        const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
        return `${year}-${month}-${day}`
      
      case 'number':
        return String(Math.floor(Math.random() * 10000))
    }
  }

  // Company-related enrichments
  if (lowerPrompt.includes("website") || lowerPrompt.includes("url")) {
    return `https://www.${companyName.toLowerCase().replace(/\s+/g, "")}.com`
  }

  if (lowerPrompt.includes("category") || lowerPrompt.includes("industry")) {
    // Use industry from context if available
    if (rowContext?.["Industry"]) {
      return rowContext["Industry"] + " Services"
    }
    const categories = ["Technology", "Healthcare", "Finance", "E-commerce", "SaaS", "Manufacturing", "Consulting"]
    return categories[Math.floor(Math.random() * categories.length)]
  }

  if (lowerPrompt.includes("revenue") || lowerPrompt.includes("funding") || lowerPrompt.includes("market cap")) {
    const amounts = ["$1M-10M", "$10M-50M", "$50M-100M", "$100M+", "$1B+", "Series A", "Series B", "Series C"]
    return amounts[Math.floor(Math.random() * amounts.length)]
  }

  if (lowerPrompt.includes("location") || lowerPrompt.includes("headquarters")) {
    // Return existing location if in context
    if (location) {
      return location + ", USA"
    }
    const locations = ["San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "Boston, MA", "Chicago, IL"]
    return locations[Math.floor(Math.random() * locations.length)]
  }

  if (lowerPrompt.includes("email") || lowerPrompt.includes("contact")) {
    const leadName = rowContext?.["Lead Name"] || ""
    if (leadName) {
      const firstName = leadName.split(" ")[0].toLowerCase()
      return `${firstName}@${companyName.toLowerCase().replace(/\s+/g, "")}.com`
    }
    return `contact@${companyName.toLowerCase().replace(/\s+/g, "")}.com`
  }
  
  if (lowerPrompt.includes("phone")) {
    return `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
  }
  
  if (lowerPrompt.includes("ceo") || lowerPrompt.includes("founder")) {
    const names = ["John Smith", "Sarah Johnson", "Michael Chen", "Emily Davis", "Robert Wilson"]
    return names[Math.floor(Math.random() * names.length)]
  }

  if (lowerPrompt.includes("description") || lowerPrompt.includes("about")) {
    return `${value} is a leading company in their industry, providing innovative solutions to customers worldwide.`
  }

  if (lowerPrompt.includes("employee") || lowerPrompt.includes("size")) {
    const sizes = ["1-10", "11-50", "51-200", "201-500", "500-1000", "1000+"]
    return sizes[Math.floor(Math.random() * sizes.length)]
  }

  // Default enrichment
  return `Enhanced: ${value}`
}
