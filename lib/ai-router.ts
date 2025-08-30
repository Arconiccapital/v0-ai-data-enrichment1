/**
 * AI Router - Intelligent routing to different AI providers based on task type
 * Optimizes for cost while maintaining quality
 */

export type TaskType = 'SEARCH' | 'CLASSIFY' | 'FORMAT' | 'GENERATE' | 'UNKNOWN'
export type ProviderName = 'perplexity' | 'openai' | 'claude'
export type RouterMode = 'economy' | 'balanced' | 'quality'

interface RouterConfig {
  mode: RouterMode
  fallbackProvider: ProviderName
}

interface TaskDetectionResult {
  type: TaskType
  confidence: number
  keywords: string[]
}

interface ProviderSelection {
  provider: ProviderName
  model: string
  temperature: number
  maxTokens: number
  estimatedCost: number // per request
  reason: string
}

// Keyword mappings for task detection
const TASK_KEYWORDS = {
  SEARCH: [
    'find', 'search', 'lookup', 'look up', 'website', 'url', 'email', 
    'phone', 'address', 'contact', 'locate', 'discover', 'current',
    'latest', 'real', 'actual', 'ceo', 'founder', 'revenue', 'funding',
    'location', 'headquarters', 'get the', 'what is the'
  ],
  CLASSIFY: [
    'classify', 'categorize', 'category', 'type', 'kind', 'segment',
    'group', 'bucket', 'label', 'tag', 'identify', 'determine',
    'is this', 'what type', 'which category'
  ],
  FORMAT: [
    'format', 'clean', 'normalize', 'extract', 'parse', 'convert',
    'transform', 'reformat', 'standardize', 'fix', 'correct'
  ],
  GENERATE: [
    'analyze', 'summarize', 'explain', 'create', 'generate', 'write',
    'compose', 'dashboard', 'report', 'insights', 'complex', 'detailed'
  ]
}

export class AIRouter {
  private config: RouterConfig

  constructor(config?: Partial<RouterConfig>) {
    this.config = {
      mode: config?.mode || (process.env.AI_ROUTER_MODE as RouterMode) || 'balanced',
      fallbackProvider: config?.fallbackProvider || 
        (process.env.AI_ROUTER_FALLBACK as ProviderName) || 'openai'
    }
  }

  /**
   * Main routing method - analyzes prompt and returns provider selection
   */
  route(prompt: string, context?: any): ProviderSelection {
    // First check if we already have the data we need
    const smartRouting = this.checkExistingData(prompt, context)
    if (smartRouting) {
      return smartRouting
    }
    
    const detection = this.detectTaskType(prompt)
    
    // Route based on task type and confidence
    if (detection.confidence < 0.5) {
      // Low confidence - use fallback
      return this.getFallbackProvider('Low confidence in task detection')
    }

    // High confidence routing
    switch (detection.type) {
      case 'SEARCH':
        return this.getSearchProvider()
      
      case 'CLASSIFY':
      case 'FORMAT':
        return this.getClassificationProvider()
      
      case 'GENERATE':
        return this.getGenerationProvider()
      
      default:
        return this.getFallbackProvider('Unknown task type')
    }
  }

  /**
   * Check if we already have data and don't need to search
   */
  private checkExistingData(prompt: string, context?: any): ProviderSelection | null {
    if (!context?.rowData) return null
    
    const lowercasePrompt = prompt.toLowerCase()
    
    // If asking for website but we already have it
    if (lowercasePrompt.includes('website') || lowercasePrompt.includes('url')) {
      if (context.rowData.Website || context.rowData.URL || context.rowData.Domain) {
        // Just clean/format existing data
        return {
          provider: 'openai',
          model: 'gpt-4o-mini',
          temperature: 0,
          maxTokens: 50,
          estimatedCost: 0.00015,
          reason: 'Website already exists in data - using OpenAI to format/clean'
        }
      }
    }
    
    // If asking for email but we already have it
    if (lowercasePrompt.includes('email')) {
      if (context.rowData.Email || context.rowData['Email Address']) {
        return {
          provider: 'openai',
          model: 'gpt-4o-mini',
          temperature: 0,
          maxTokens: 50,
          estimatedCost: 0.00015,
          reason: 'Email already exists in data - using OpenAI to validate/format'
        }
      }
    }
    
    // If classifying but no entity name provided
    if ((lowercasePrompt.includes('classify') || lowercasePrompt.includes('category')) && 
        !context.rowData.Company && !context.rowData.Name) {
      // Need to search for entity first
      return {
        provider: 'perplexity',
        model: 'sonar',
        temperature: 0.1,
        maxTokens: 150,
        estimatedCost: 0.001,
        reason: 'No entity name provided - need to search first'
      }
    }
    
    return null
  }

  /**
   * Detect the type of task from the prompt
   */
  private detectTaskType(prompt: string): TaskDetectionResult {
    const lowercasePrompt = prompt.toLowerCase()
    const scores: Record<TaskType, number> = {
      SEARCH: 0,
      CLASSIFY: 0,
      FORMAT: 0,
      GENERATE: 0,
      UNKNOWN: 0
    }
    const foundKeywords: string[] = []

    // Score each task type based on keyword matches
    for (const [taskType, keywords] of Object.entries(TASK_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowercasePrompt.includes(keyword)) {
          scores[taskType as TaskType] += 1
          foundKeywords.push(keyword)
        }
      }
    }

    // Find the highest scoring task type
    let maxScore = 0
    let selectedType: TaskType = 'UNKNOWN'
    
    for (const [type, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score
        selectedType = type as TaskType
      }
    }

    // Calculate confidence (0-1)
    const totalKeywords = foundKeywords.length
    const confidence = totalKeywords > 0 ? 
      Math.min(maxScore / Math.max(3, totalKeywords), 1) : 0

    return {
      type: selectedType,
      confidence,
      keywords: foundKeywords
    }
  }

  /**
   * Get provider for search tasks (finding information)
   */
  private getSearchProvider(): ProviderSelection {
    return {
      provider: 'perplexity',
      model: 'sonar',
      temperature: 0.1,
      maxTokens: 150,
      estimatedCost: 0.001, // $1 per 1000 requests
      reason: 'Web search task - using Perplexity for real-time information'
    }
  }

  /**
   * Get provider for classification/formatting tasks
   */
  private getClassificationProvider(): ProviderSelection {
    if (this.config.mode === 'quality') {
      // Use Claude for highest quality
      return {
        provider: 'claude',
        model: 'claude-3-haiku-20240307',
        temperature: 0,
        maxTokens: 150,
        estimatedCost: 0.00025, // $0.25 per 1M tokens
        reason: 'Classification task in quality mode - using Claude'
      }
    }

    // Default to OpenAI for cost efficiency
    return {
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0,
      maxTokens: 150,
      estimatedCost: 0.00015, // $0.15 per 1M tokens
      reason: 'Classification/formatting task - using OpenAI Mini for cost efficiency'
    }
  }

  /**
   * Get provider for complex generation tasks
   */
  private getGenerationProvider(): ProviderSelection {
    if (this.config.mode === 'economy') {
      // Use OpenAI even for complex tasks in economy mode
      return {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.3,
        maxTokens: 500,
        estimatedCost: 0.00015,
        reason: 'Generation task in economy mode - using OpenAI Mini'
      }
    }

    // Use Claude for complex generation
    return {
      provider: 'claude',
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.7,
      maxTokens: 1000,
      estimatedCost: 0.003, // $3 per 1M tokens
      reason: 'Complex generation task - using Claude Sonnet for quality'
    }
  }

  /**
   * Get fallback provider
   */
  private getFallbackProvider(reason: string): ProviderSelection {
    const providers: Record<ProviderName, ProviderSelection> = {
      openai: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.1,
        maxTokens: 150,
        estimatedCost: 0.00015,
        reason: `Fallback to OpenAI: ${reason}`
      },
      perplexity: {
        provider: 'perplexity',
        model: 'sonar',
        temperature: 0.1,
        maxTokens: 150,
        estimatedCost: 0.001,
        reason: `Fallback to Perplexity: ${reason}`
      },
      claude: {
        provider: 'claude',
        model: 'claude-3-haiku-20240307',
        temperature: 0.1,
        maxTokens: 150,
        estimatedCost: 0.00025,
        reason: `Fallback to Claude: ${reason}`
      }
    }

    return providers[this.config.fallbackProvider]
  }

  /**
   * Estimate cost for a batch of requests
   */
  estimateBatchCost(prompts: string[]): { 
    totalCost: number, 
    breakdown: Record<ProviderName, number> 
  } {
    const breakdown: Record<ProviderName, number> = {
      perplexity: 0,
      openai: 0,
      claude: 0
    }

    let totalCost = 0

    for (const prompt of prompts) {
      const selection = this.route(prompt)
      breakdown[selection.provider] += selection.estimatedCost
      totalCost += selection.estimatedCost
    }

    return { totalCost, breakdown }
  }
}

// Export singleton instance
export const aiRouter = new AIRouter()