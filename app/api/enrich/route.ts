import { validateAndExtractValue, formatTemplates, applyCustomFormat } from "@/lib/enrichment-utils"
import { validateResponse } from "@/lib/response-validator"
import { PerplexityProvider } from "@/lib/ai-providers/perplexity-provider"
import { OpenAIProvider } from "@/lib/ai-providers/openai-provider"
import type { AIProvider } from "@/lib/ai-providers/provider-interface"

export async function POST(request: Request) {
  try {
    const { value, prompt, rowContext, customFormat, attachmentContext } = await request.json()

    if (!prompt) {
      return Response.json({ error: "Missing prompt" }, { status: 400 })
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
    
    // Build context object
    const context: Record<string, any> = {}
    
    // Add row context if available
    if (rowContext && Object.keys(rowContext).length > 0) {
      context.rowData = rowContext
    }
    
    // Add attachment context if available
    if (attachmentContext && attachmentContext.length > 0) {
      context.attachments = attachmentContext
    }
    
    // FORCE PERPLEXITY SONAR FOR ALL ENRICHMENT
    // Skip routing and always use Perplexity Sonar
    console.log(`[Enrichment] Forcing Perplexity Sonar for all enrichment`)
    
    const providerSelection = {
      provider: 'perplexity' as 'perplexity' | 'openai' | 'claude',
      model: 'sonar',
      temperature: 0.1,
      maxTokens: 200,
      estimatedCost: 0.001,
      reason: 'Forced to use Perplexity Sonar for all enrichment',
      routerType: 'forced',
      confidence: 1
    }
    
    // Initialize the selected provider
    let provider: AIProvider
    
    switch (providerSelection.provider) {
      case 'openai':
        provider = new OpenAIProvider({ 
          apiKey: process.env.OPENAI_API_KEY || '',
          model: providerSelection.model,
          temperature: providerSelection.temperature,
          maxTokens: providerSelection.maxTokens
        })
        break
      
      case 'perplexity':
        provider = new PerplexityProvider({
          apiKey: process.env.PERPLEXITY_API_KEY || '',
          model: providerSelection.model,
          temperature: providerSelection.temperature,
          maxTokens: providerSelection.maxTokens
        })
        break
      
      case 'claude':
        // For now, fall back to OpenAI if Claude is selected
        // TODO: Implement Claude provider
        console.log('[Enrichment] Claude not implemented, falling back to OpenAI')
        provider = new OpenAIProvider({
          apiKey: process.env.OPENAI_API_KEY || '',
          model: 'gpt-4o-mini'
        })
        break
      
      default:
        throw new Error(`Unknown provider: ${providerSelection.provider}`)
    }
    
    // Call the provider
    try {
      const result = await provider.enrichValue(
        value || '',
        cleanPrompt,
        context
      )
      
      let enrichedValue = result.value
      
      // Apply final validation and standardization
      if (expectedType && expectedType !== 'text' && expectedType !== 'free') {
        const finalValidation = validateResponse(enrichedValue, expectedType)
        if (finalValidation.isValid || finalValidation.corrections.length > 0) {
          enrichedValue = finalValidation.value
          console.log(`[Enrichment] Applied ${finalValidation.corrections.length} format corrections for ${expectedType}`)
        }
      }
      
      // Apply format validation if specified
      if (formatMode === 'custom' && customFormat) {
        const customValidation = applyCustomFormat(enrichedValue, customFormat)
        if (customValidation.extracted) {
          enrichedValue = customValidation.extracted
        }
      } else if (formatMode === 'strict' && expectedType !== 'free') {
        const validation = validateAndExtractValue(enrichedValue, expectedType)
        if (validation.extracted) {
          enrichedValue = validation.extracted || validation.value
        }
      }
      
      const isValidated = formatMode === 'custom' 
        ? customFormat && applyCustomFormat(enrichedValue.trim(), customFormat).valid
        : formatMode === 'strict' && expectedType !== 'free'
          ? validateAndExtractValue(enrichedValue.trim(), expectedType).valid
          : true
      
      return Response.json({ 
        enrichedValue: enrichedValue.trim(),
        dataType: expectedType,
        formatMode,
        validated: isValidated,
        source: providerSelection.provider,
        model: providerSelection.model,
        // Add process information for audit trail
        process: {
          query: cleanPrompt,
          response: result.fullResponse,
          citations: result.metadata?.citations || result.sources,
          timestamp: result.metadata?.timestamp || new Date().toISOString(),
          provider: providerSelection.provider,
          model: providerSelection.model,
          estimatedCost: providerSelection.estimatedCost,
          routingReason: providerSelection.reason,
          routerType: providerSelection.routerType,
          routerConfidence: providerSelection.confidence,
          confidence: result.metadata?.confidence || 1,
          status: result.metadata?.status || 'success',
          verification: result.metadata?.verification || {},
          entity: result.metadata?.entity || value
        }
      })
      
    } catch (providerError: any) {
      console.error(`[Enrichment] Provider ${providerSelection.provider} failed:`, providerError)
      
      // Try fallback provider if main provider fails
      if (providerSelection.provider !== 'openai') {
        console.log('[Enrichment] Attempting fallback to OpenAI')
        const fallbackProvider = new OpenAIProvider({
          apiKey: process.env.OPENAI_API_KEY || '',
          model: 'gpt-4o-mini'
        })
        
        try {
          const fallbackResult = await fallbackProvider.enrichValue(
            value || '',
            cleanPrompt,
            context
          )
          
          return Response.json({
            enrichedValue: fallbackResult.value.trim(),
            dataType: expectedType,
            formatMode,
            validated: true,
            source: 'openai',
            model: 'gpt-4o-mini',
            process: {
              query: cleanPrompt,
              response: fallbackResult.fullResponse,
              citations: fallbackResult.sources,
              timestamp: new Date().toISOString(),
              provider: 'openai',
              model: 'gpt-4o-mini',
              fallback: true,
              originalError: providerError.message
            }
          })
        } catch (fallbackError) {
          console.error('[Enrichment] Fallback also failed:', fallbackError)
        }
      }
      
      throw providerError
    }

  } catch (error) {
    console.error("Enrichment API error:", error)
    return Response.json({ 
      error: `Failed to enrich data: ${(error instanceof Error ? error.message : String(error))}` 
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