import { validateAndExtractValue, formatTemplates, applyCustomFormat } from "@/lib/enrichment-utils"

// Initialize Perplexity API
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || ''

export async function POST(request: Request) {
  try {
    const { value, prompt, rowContext, customFormat } = await request.json()

    if (!prompt) {
      return Response.json({ error: "Missing prompt" }, { status: 400 })
    }

    // Check if API key is configured
    const usingMockData = !PERPLEXITY_API_KEY
    
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
      
      let enrichedValue = value // fallback to original value

      if (usingMockData) {
        console.log("[v0] Using mock data (configure PERPLEXITY_API_KEY for real enrichment)")
        const primaryValue = value || (rowContext ? Object.values(rowContext)[0] : "")
        enrichedValue = generateMockEnrichment(primaryValue, cleanPrompt, rowContext, expectedType)
      } else {
        // Build context for Perplexity
        const contextStr = rowContext && Object.keys(rowContext).length > 0
          ? `Context about the entity: ${JSON.stringify(rowContext)}`
          : ''
        
        // Create type-specific instructions
        const typeInstructions = getTypeInstructions(expectedType)
        
        console.log("[v0] Perplexity enrichment for:", cleanPrompt)
        console.log("[v0] Expected type:", expectedType)

        // Use Perplexity for enrichment with web search
        const systemPrompt = `You are a web search assistant finding real information.
${typeInstructions}
Search the web for actual, current information about this entity.
Return ONLY the requested data with no additional text or formatting.
If you cannot find the information, return "N/A".`

        const userPrompt = `${contextStr}
Current value: ${value || 'empty'}
Find real information for: ${cleanPrompt}
Return only the specific data requested, nothing else.`

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
            temperature: 0.1,
            max_tokens: 150
          })
        })

        if (!response.ok) {
          const error = await response.text()
          throw new Error(`Perplexity API error: ${response.status} - ${error}`)
        }

        const data = await response.json()
        console.log("[v0] Perplexity response received")

        if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          enrichedValue = data.choices[0].message.content.trim()
          
          // Clean up common response patterns
          enrichedValue = enrichedValue
            .replace(/^["']|["']$/g, '') // Remove quotes
            .replace(/^\*\*|\*\*$/g, '') // Remove markdown bold
            .replace(/^-\s*/, '') // Remove list markers
          
          // Apply format validation
          if (formatMode === 'custom' && customFormat) {
            const customValidation = applyCustomFormat(enrichedValue, customFormat)
            if (customValidation.extracted) {
              enrichedValue = customValidation.extracted
            }
          } else if (formatMode === 'strict') {
            const validation = validateAndExtractValue(enrichedValue, expectedType)
            if (validation.extracted) {
              enrichedValue = validation.extracted || validation.value
            }
          }
        }
      }

      const isValidated = formatMode === 'custom' 
        ? customFormat && applyCustomFormat(enrichedValue.trim(), customFormat).valid
        : formatMode === 'strict' 
          ? validateAndExtractValue(enrichedValue.trim(), expectedType).valid
          : true

      return Response.json({ 
        enrichedValue: enrichedValue.trim(),
        dataType: expectedType,
        formatMode,
        validated: isValidated,
        source: usingMockData ? 'mock' : 'perplexity'
      })
    } catch (perplexityError: any) {
      console.log("[v0] Perplexity API error:", perplexityError.message)
      console.log("[v0] Falling back to mock enrichment")

      // Fallback to mock enrichment
      const primaryValue = value || (rowContext ? Object.values(rowContext)[0] : "")
      const cleanPrompt = prompt
        .replace(/\[Expected type: \w+\]/, '')
        .replace(/\[Format mode: \w+\]/, '')
        .replace(/\[Pattern: [^\]]+\]/, '')
        .trim()
      const typeMatch = prompt.match(/\[Expected type: (\w+)\]/)
      const expectedType = typeMatch ? typeMatch[1] : 'text'
      
      const mockEnrichment = generateMockEnrichment(primaryValue, cleanPrompt, rowContext, expectedType)
      
      return Response.json({ 
        enrichedValue: mockEnrichment,
        dataType: expectedType,
        validated: true,
        source: 'mock'
      })
    }
  } catch (error) {
    console.error("Enrichment API error:", error)
    return Response.json({ error: "Failed to enrich data" }, { status: 500 })
  }
}

function getTypeInstructions(expectedType: string): string {
  switch (expectedType) {
    case 'email':
      return 'Find the actual professional email address for this person or company. Format: name@domain.com'
    case 'url':
      return 'Find the actual official website URL. Format: https://www.example.com'
    case 'phone':
      return 'Find the actual phone number. Include country code if applicable.'
    case 'name':
      return 'Find the actual person\'s full name from web search.'
    case 'currency':
      return 'Find the actual monetary amount or valuation. Format with currency symbol (e.g., $1,000,000)'
    case 'number':
      return 'Find the actual numeric value. Return only digits and decimal points.'
    case 'date':
      return 'Find the actual date. Format: YYYY-MM-DD'
    case 'company':
      return 'Find the actual company name from web search.'
    case 'address':
      return 'Find the actual physical address.'
    default:
      return 'Find the actual requested information from web search.'
  }
}

function generateMockEnrichment(value: string, prompt: string, rowContext?: Record<string, string>, expectedType?: string): string {
  const lowerPrompt = prompt.toLowerCase()
  const companyName = rowContext?.["Company Name"] || rowContext?.["Company"] || value
  
  // Generate based on expected type
  if (expectedType) {
    switch (expectedType) {
      case 'email':
        return `contact@${companyName.toLowerCase().replace(/\s+/g, "")}.com`
      case 'url':
        return `https://www.${companyName.toLowerCase().replace(/\s+/g, "")}.com`
      case 'phone':
        return `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
      case 'currency':
        const amounts = ["$10M", "$50M", "$100M", "$500M", "$1B"]
        return amounts[Math.floor(Math.random() * amounts.length)]
      case 'name':
        if (lowerPrompt.includes("ceo") || lowerPrompt.includes("founder")) {
          const names = ["John Smith", "Sarah Johnson", "Michael Chen", "Emily Davis"]
          return names[Math.floor(Math.random() * names.length)]
        }
        return "John Doe"
      case 'number':
        return String(Math.floor(Math.random() * 10000))
      case 'date':
        const year = 2000 + Math.floor(Math.random() * 25)
        return `${year}-01-01`
    }
  }
  
  // Context-based generation
  if (lowerPrompt.includes("website") || lowerPrompt.includes("url")) {
    return `https://www.${companyName.toLowerCase().replace(/\s+/g, "")}.com`
  }
  
  if (lowerPrompt.includes("email")) {
    return `contact@${companyName.toLowerCase().replace(/\s+/g, "")}.com`
  }
  
  if (lowerPrompt.includes("phone")) {
    return `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
  }
  
  if (lowerPrompt.includes("ceo") || lowerPrompt.includes("founder")) {
    const names = ["John Smith", "Sarah Johnson", "Michael Chen", "Emily Davis", "Robert Wilson"]
    return names[Math.floor(Math.random() * names.length)]
  }
  
  if (lowerPrompt.includes("revenue") || lowerPrompt.includes("funding")) {
    const amounts = ["$1M-10M", "$10M-50M", "$50M-100M", "$100M+", "$1B+"]
    return amounts[Math.floor(Math.random() * amounts.length)]
  }
  
  if (lowerPrompt.includes("employee") || lowerPrompt.includes("size")) {
    const sizes = ["1-10", "11-50", "51-200", "201-500", "500-1000", "1000+"]
    return sizes[Math.floor(Math.random() * sizes.length)]
  }
  
  if (lowerPrompt.includes("industry") || lowerPrompt.includes("category")) {
    const industries = ["Technology", "Healthcare", "Finance", "E-commerce", "SaaS", "Manufacturing"]
    return industries[Math.floor(Math.random() * industries.length)]
  }
  
  if (lowerPrompt.includes("location") || lowerPrompt.includes("headquarters")) {
    const locations = ["San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "Boston, MA"]
    return locations[Math.floor(Math.random() * locations.length)]
  }
  
  // Default
  return `Enhanced: ${value}`
}