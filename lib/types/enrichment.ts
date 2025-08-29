export interface EnrichmentStatus {
  enriching: boolean
  currentRow: number
  prompt?: string
}

export interface ColumnEnrichmentConfig {
  prompt: string
  contextColumns: Set<number>
  useAttachments?: boolean
  isConfigured?: boolean
}

export interface EnrichmentMetadata {
  enrichedAt?: Date
  prompt?: string
  sources?: string[]
}