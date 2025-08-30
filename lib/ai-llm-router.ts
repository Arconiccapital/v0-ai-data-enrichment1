/**
 * LLM-Based Router - Uses AI to intelligently route requests to the optimal provider
 * More accurate than keyword matching by understanding context and intent
 */

import { ProviderName, TaskType } from './ai-router'

export interface LLMRoutingDecision {
  provider: ProviderName
  task_type: TaskType | 'search' | 'classify' | 'format' | 'extract' | 'generate'
  needs_web_search: boolean
  needs_current_data: boolean
  can_use_knowledge: boolean
  reasoning: string
  confidence: number
  estimated_cost: number
  cache_key?: string
}

interface RoutingContext {
  prompt: string
  value: string | null
  rowData?: Record<string, any>
  existingColumns?: string[]
}

// Simple in-memory cache with TTL
class RoutingCache {
  private cache = new Map<string, { decision: LLMRoutingDecision, timestamp: number }>()
  private ttl = 3600000 // 1 hour

  get(key: string): LLMRoutingDecision | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return cached.decision
  }

  set(key: string, decision: LLMRoutingDecision): void {
    this.cache.set(key, { decision, timestamp: Date.now() })
  }

  clear(): void {
    this.cache.clear()
  }
}

export class LLMRouter {
  private cache = new RoutingCache()
  private openAIKey: string
  private routerModel = 'gpt-4o-mini' // Fast and cheap for routing
  
  constructor(openAIKey?: string) {
    this.openAIKey = openAIKey || process.env.OPENAI_API_KEY || ''
  }

  /**
   * Main routing method using LLM intelligence
   */
  async route(context: RoutingContext): Promise<LLMRoutingDecision> {
    // Generate cache key
    const cacheKey = this.generateCacheKey(context)
    
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached) {
      console.log('[LLMRouter] Using cached decision')
      return { ...cached, cache_key: cacheKey }
    }

    // If no OpenAI key, fall back to simple logic
    if (!this.openAIKey) {
      console.warn('[LLMRouter] No OpenAI key, using fallback logic')
      return this.fallbackRoute(context)
    }

    try {
      // Call OpenAI for routing decision
      const decision = await this.getRoutingDecision(context)
      
      // Cache the decision
      this.cache.set(cacheKey, decision)
      
      return { ...decision, cache_key: cacheKey }
    } catch (error) {
      console.error('[LLMRouter] Error getting routing decision:', error)
      return this.fallbackRoute(context)
    }
  }

  /**
   * Get routing decision from LLM
   */
  private async getRoutingDecision(context: RoutingContext): Promise<LLMRoutingDecision> {
    const systemPrompt = `You are a routing function that decides which AI provider to use for data enrichment tasks.

Analyze the request and return ONLY valid JSON with your routing decision.

Available Providers:
1. "perplexity" - Web search, real-time data, current information ($0.001/request)
2. "openai" - Classification, formatting, extraction from context ($0.00015/request)  
3. "claude" - Complex analysis, multi-step reasoning ($0.003/request)

Decision Rules:
- "Find" tasks (Find CEO, Find website, Find revenue, etc.) → perplexity (web search required)
- Need current/real-time data or web search → perplexity
- Need to look up information not in context → perplexity
- Classification, categorization, formatting → openai
- Extraction from PROVIDED context only → openai
- Complex analysis or generation → claude
- IMPORTANT: If prompt says "Find" something, always use perplexity unless that exact data exists in context

Return this exact JSON structure:
{
  "provider": "perplexity" | "openai" | "claude",
  "task_type": "search" | "classify" | "format" | "extract" | "generate",
  "needs_web_search": true | false,
  "needs_current_data": true | false,
  "can_use_knowledge": true | false,
  "reasoning": "one line explanation",
  "confidence": 0.0 to 1.0
}`

    const userPrompt = this.buildUserPrompt(context)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openAIKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.routerModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0,
        max_tokens: 150,
        response_format: { type: "json_object" }
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI router error: ${response.status}`)
    }

    const data = await response.json()
    const decision = JSON.parse(data.choices[0].message.content)

    // Add cost estimation
    const costMap = {
      perplexity: 0.001,
      openai: 0.00015,
      claude: 0.003
    }

    return {
      ...decision,
      estimated_cost: costMap[decision.provider as ProviderName] || 0.00015
    }
  }

  /**
   * Build user prompt for routing decision
   */
  private buildUserPrompt(context: RoutingContext): string {
    let prompt = `Task Request: "${context.prompt}"\n`
    prompt += `Current Value: "${context.value || 'empty'}"\n\n`

    // Add row context if available
    if (context.rowData && Object.keys(context.rowData).length > 0) {
      prompt += `Row Data Available:\n`
      Object.entries(context.rowData).forEach(([key, value]) => {
        if (value) {
          prompt += `- ${key}: ${value}\n`
        }
      })
      prompt += '\n'
    }

    // Add column context
    if (context.existingColumns && context.existingColumns.length > 0) {
      prompt += `Existing Columns: ${context.existingColumns.join(', ')}\n\n`
    }

    // Analysis hints
    prompt += `Analyze:\n`
    prompt += `1. Does this task start with "Find"? If yes → likely needs perplexity web search\n`
    prompt += `2. Is the requested data already in the row context above?\n`
    prompt += `3. Does this need current/real-time information from the web?\n`
    prompt += `4. Can this be classified/formatted using general knowledge?\n`
    prompt += `\nIMPORTANT: "Find CEO", "Find website", "Find revenue" etc. require perplexity unless that exact data is already in context.\n`
    prompt += `Return your routing decision as JSON.`

    return prompt
  }

  /**
   * Generate cache key for routing decision
   */
  private generateCacheKey(context: RoutingContext): string {
    const keyParts = [
      'v2', // Version to invalidate old cache entries
      context.prompt.toLowerCase(),
      context.value || 'null',
      JSON.stringify(Object.keys(context.rowData || {}).sort())
    ]
    return keyParts.join('::')
  }

  /**
   * Fallback routing when LLM is unavailable
   */
  private fallbackRoute(context: RoutingContext): LLMRoutingDecision {
    const prompt = context.prompt.toLowerCase()
    
    // Simple keyword-based fallback
    const needsSearch = /find|search|lookup|current|latest|website|email|phone|ceo|founder/.test(prompt)
    const isClassification = /classify|categorize|type|b2b|b2c|industry|segment/.test(prompt)
    const isFormat = /format|clean|extract|normalize|fix/.test(prompt)
    
    let provider: ProviderName = 'openai'
    let task_type = 'classify'
    let reasoning = 'Fallback routing based on keywords'
    
    if (needsSearch) {
      provider = 'perplexity'
      task_type = 'search'
      reasoning = 'Keywords suggest web search needed'
    } else if (isFormat) {
      provider = 'openai'
      task_type = 'format'
      reasoning = 'Keywords suggest formatting task'
    } else if (isClassification) {
      provider = 'openai'
      task_type = 'classify'
      reasoning = 'Keywords suggest classification task'
    }

    return {
      provider,
      task_type: task_type as any,
      needs_web_search: needsSearch,
      needs_current_data: needsSearch,
      can_use_knowledge: !needsSearch,
      reasoning,
      confidence: 0.5,
      estimated_cost: provider === 'perplexity' ? 0.001 : 0.00015
    }
  }

  /**
   * Clear the routing cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Analyze routing patterns for optimization
   */
  async analyzeRoutingPatterns(
    requests: Array<{ prompt: string, actualProvider: ProviderName, success: boolean }>
  ): Promise<{
    patterns: Array<{ pattern: string, preferredProvider: ProviderName, successRate: number }>
    recommendations: string[]
  }> {
    // Analyze historical routing decisions to improve future routing
    // This could be expanded to learn from actual usage patterns
    
    const patterns: Map<string, { provider: ProviderName, success: number, total: number }> = new Map()
    
    for (const req of requests) {
      // Extract key patterns from prompts
      const pattern = this.extractPattern(req.prompt)
      const existing = patterns.get(pattern) || { provider: req.actualProvider, success: 0, total: 0 }
      
      existing.total++
      if (req.success) existing.success++
      patterns.set(pattern, existing)
    }
    
    const analysisResults = Array.from(patterns.entries()).map(([pattern, stats]) => ({
      pattern,
      preferredProvider: stats.provider,
      successRate: stats.success / stats.total
    }))
    
    const recommendations = this.generateRecommendations(analysisResults)
    
    return {
      patterns: analysisResults,
      recommendations
    }
  }

  private extractPattern(prompt: string): string {
    // Simple pattern extraction - could be made more sophisticated
    const words = prompt.toLowerCase().split(/\s+/)
    const keywords = words.filter(w => 
      ['find', 'search', 'classify', 'format', 'extract', 'get', 'what', 'who', 'where'].includes(w)
    )
    return keywords.join('_') || 'general'
  }

  private generateRecommendations(patterns: Array<{ pattern: string, successRate: number }>): string[] {
    const recommendations: string[] = []
    
    const lowSuccessPatterns = patterns.filter(p => p.successRate < 0.7)
    if (lowSuccessPatterns.length > 0) {
      recommendations.push(`Consider adjusting routing for patterns with low success: ${lowSuccessPatterns.map(p => p.pattern).join(', ')}`)
    }
    
    return recommendations
  }
}

// Export singleton instance
export const llmRouter = new LLMRouter()