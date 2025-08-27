import { validateAndExtractValue, formatTemplates, applyCustomFormat } from "@/lib/enrichment-utils"

// Initialize Perplexity API - ALWAYS use real web search
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || ''

export async function POST(request: Request) {
  try {
    const { value, prompt, rowContext, customFormat } = await request.json()

    if (!prompt) {
      return Response.json({ error: "Missing prompt" }, { status: 400 })
    }

    // Check if API key is configured
    if (!PERPLEXITY_API_KEY) {
      return Response.json({ 
        error: 'Perplexity API key not configured. Please add PERPLEXITY_API_KEY to your environment variables.' 
      }, { status: 500 })
    }
    
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

    // Store the search query for audit trail
    const searchQuery = `Find ${cleanPrompt} for ${value || 'the entity'}${contextStr ? ' with context' : ''}`

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
      console.error("[v0] Perplexity API error:", error)
      return Response.json({ 
        error: `Failed to enrich data: Perplexity API error ${response.status}` 
      }, { status: 500 })
    }

    const data = await response.json()
    console.log("[v0] Perplexity response received")

    let enrichedValue = value // fallback to original value
    let fullResponse = '' // Store the full response for audit trail

    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      fullResponse = data.choices[0].message.content
      enrichedValue = fullResponse.trim()
      
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
    } else {
      return Response.json({ 
        error: 'No response from Perplexity API' 
      }, { status: 500 })
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
      source: 'perplexity',
      // Add process information for audit trail
      process: {
        query: searchQuery,
        response: fullResponse,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error("Enrichment API error:", error)
    return Response.json({ 
      error: `Failed to enrich data: ${error.message}` 
    }, { status: 500 })
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