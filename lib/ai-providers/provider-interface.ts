// AI Provider Interface for consistent API across different providers

export interface SearchResult {
  name: string
  source: string
  verification: string
  citations: Citation[]
  searchQuery?: string
}

export interface Citation {
  uri: string
  title: string
}

export interface EnrichmentResult {
  value: string
  sources: Citation[]
  fullResponse: string
  searchQueries?: string[]
}

export interface AIProvider {
  // Find a single unique item
  findUniqueItem(
    searchType: string,
    foundItems: Set<string>,
    index: number
  ): Promise<SearchResult | null>
  
  // Enrich a value with context
  enrichValue(
    value: string,
    context: string,
    prompt: string
  ): Promise<EnrichmentResult>
  
  // Provider name for logging
  name: string
}

// Provider configuration
export interface ProviderConfig {
  apiKey: string
  model?: string
  temperature?: number
  maxTokens?: number
}