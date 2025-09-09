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
    const modelMatch = prompt.match(/\[Model: ([^\]]+)\]/)
    const requestedModel = modelMatch ? modelMatch[1] : null
    
    // Clean prompt from annotations
    const cleanPrompt = prompt
      .replace(/\[Expected type: \w+\]/, '')
      .replace(/\[Format mode: \w+\]/, '')
      .replace(/\[Pattern: [^\]]+\]/, '')
      .replace(/\[Model: [^\]]+\]/, '')
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
    
    // Intelligent model routing
    let providerSelection: {
      provider: 'perplexity' | 'openai' | 'claude',
      model: string,
      temperature: number,
      maxTokens: number,
      estimatedCost: number,
      reason: string,
      routerType: string,
      confidence: number
    }
    
    // Check if user explicitly selected a model
    if (requestedModel && requestedModel !== 'auto') {
      console.log(`[Enrichment] User selected model: ${requestedModel}`)
      
      if (requestedModel === 'perplexity-sonar') {
        providerSelection = {
          provider: 'perplexity',
          model: 'sonar',
          temperature: 0.1,
          maxTokens: 200,
          estimatedCost: 0.001,
          reason: 'User selected Perplexity Sonar',
          routerType: 'forced',
          confidence: 1
        }
      } else if (requestedModel === 'gpt-4o') {
        providerSelection = {
          provider: 'openai',
          model: 'gpt-4o',
          temperature: 0.1,
          maxTokens: 200,
          estimatedCost: 0.003,
          reason: 'User selected GPT-4o',
          routerType: 'forced',
          confidence: 1
        }
      } else if (requestedModel === 'gpt-4o-mini') {
        providerSelection = {
          provider: 'openai',
          model: 'gpt-4o-mini',
          temperature: 0.1,
          maxTokens: 200,
          estimatedCost: 0.0005,
          reason: 'User selected GPT-4o-mini',
          routerType: 'forced',
          confidence: 1
        }
      } else {
        // Default to Perplexity if unknown model
        providerSelection = {
          provider: 'perplexity',
          model: 'sonar',
          temperature: 0.1,
          maxTokens: 200,
          estimatedCost: 0.001,
          reason: 'Unknown model, defaulting to Perplexity',
          routerType: 'forced',
          confidence: 1
        }
      }
    } else {
      // Auto-routing based on prompt content
      const lowerPrompt = cleanPrompt.toLowerCase()
      
      // Check for search-related keywords
      const searchKeywords = ['find', 'search', 'lookup', 'latest', 'current', 'website', 'email', 'contact', 'address', 'location', 'url', 'link']
      const hasSearchIntent = searchKeywords.some(keyword => lowerPrompt.includes(keyword))
      
      // Check for classification keywords
      const classificationKeywords = ['categorize', 'classify', 'type', 'category', 'group', 'organize', 'label', 'tag', 'industry', 'sector', 'segment']
      const hasClassificationIntent = classificationKeywords.some(keyword => lowerPrompt.includes(keyword))
      
      // Check for extraction keywords
      const extractionKeywords = ['extract', 'parse', 'format', 'clean', 'normalize', 'standardize', 'convert']
      const hasExtractionIntent = extractionKeywords.some(keyword => lowerPrompt.includes(keyword))
      
      if (hasSearchIntent) {
        console.log('[Enrichment] Auto-routing: Detected search intent, using Perplexity')
        providerSelection = {
          provider: 'perplexity',
          model: 'sonar',
          temperature: 0.1,
          maxTokens: 200,
          estimatedCost: 0.001,
          reason: 'Search intent detected - best for web search',
          routerType: 'rule',
          confidence: 0.9
        }
      } else if (hasClassificationIntent) {
        console.log('[Enrichment] Auto-routing: Detected classification intent, using GPT-4o-mini')
        providerSelection = {
          provider: 'openai',
          model: 'gpt-4o-mini',
          temperature: 0.1,
          maxTokens: 200,
          estimatedCost: 0.0005,
          reason: 'Classification intent detected - best for categorization',
          routerType: 'rule',
          confidence: 0.9
        }
      } else if (hasExtractionIntent) {
        console.log('[Enrichment] Auto-routing: Detected extraction intent, using GPT-4o-mini')
        providerSelection = {
          provider: 'openai',
          model: 'gpt-4o-mini',
          temperature: 0.1,
          maxTokens: 200,
          estimatedCost: 0.0005,
          reason: 'Extraction intent detected - best for data formatting',
          routerType: 'rule',
          confidence: 0.85
        }
      } else {
        // Default to Perplexity Sonar for general enrichment
        // Most enrichment tasks benefit from current web data
        console.log('[Enrichment] Auto-routing: General enrichment, defaulting to Perplexity for current data')
        providerSelection = {
          provider: 'perplexity',
          model: 'sonar',
          temperature: 0.1,
          maxTokens: 200,
          estimatedCost: 0.001,
          reason: 'Default to web search for current data',
          routerType: 'rule',
          confidence: 0.7
        }
      }
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