// Enrichment-related types

import { DataType } from './spreadsheet'

export interface EnrichmentRequest {
  value: string | null
  prompt: string
  rowContext?: Record<string, unknown>
  customFormat?: string
  attachmentContext?: AttachmentContext[]
  dataType?: DataType
  formatMode?: 'strict' | 'flexible' | 'custom'
}

export interface EnrichmentResponse {
  enrichedValue: string
  dataType?: DataType
  formatMode?: string
  validated?: boolean
  source?: 'perplexity' | 'openai' | 'claude' | 'mock'
  model?: string
  process?: EnrichmentProcess
}

export interface EnrichmentProcess {
  query: string
  response: string
  citations?: string[]
  timestamp: string
  provider: string
  model: string
  estimatedCost?: number
  routingReason?: string
  routerType?: string
  routerConfidence?: number
  confidence?: number
  status?: 'success' | 'partial' | 'failed'
  verification?: Record<string, unknown>
  entity?: string
  fallback?: boolean
  originalError?: string
}

export interface AttachmentContext {
  type: string
  content: string
  metadata?: Record<string, unknown>
}

export interface EnrichmentJob {
  id: string
  columnIndex: number
  rowIndices: number[]
  prompt: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress: number
  total: number
  results?: EnrichmentResult[]
  startedAt?: Date
  completedAt?: Date
  error?: string
}

export interface EnrichmentResult {
  rowIndex: number
  originalValue: string | null
  enrichedValue: string
  success: boolean
  error?: string
  metadata?: EnrichmentMetadata
}

export interface EnrichmentMetadata {
  provider: string
  model: string
  confidence?: number
  sources?: string[]
  processingTime?: number
  cost?: number
}

export interface ProviderConfig {
  provider: 'perplexity' | 'openai' | 'claude'
  apiKey: string
  model?: string
  temperature?: number
  maxTokens?: number
  baseUrl?: string
}

export interface ProviderSelection {
  provider: 'perplexity' | 'openai' | 'claude'
  model: string
  temperature: number
  maxTokens: number
  estimatedCost: number
  reason: string
  routerType: 'llm' | 'rule' | 'forced'
  confidence: number
}

export interface EnrichmentTemplate {
  id: string
  name: string
  description: string
  category: string
  prompt: string
  dataType: DataType
  formatMode: 'strict' | 'flexible' | 'custom'
  customFormat?: string
  examples?: EnrichmentExample[]
  tags?: string[]
  isPublic?: boolean
  createdBy?: string
  createdAt?: Date
}

export interface EnrichmentExample {
  input: string
  output: string
  explanation?: string
}

export interface EnrichmentHistory {
  id: string
  timestamp: Date
  columnName: string
  rowCount: number
  prompt: string
  provider: string
  model: string
  successCount: number
  failureCount: number
  totalCost?: number
  averageConfidence?: number
}

export interface BatchEnrichmentOptions {
  batchSize?: number
  concurrency?: number
  retryAttempts?: number
  retryDelay?: number
  skipErrors?: boolean
  progressCallback?: (progress: number, total: number) => void
}

export interface VibeModeTransformation {
  prompt: string
  inputColumns?: string[]
  outputColumns?: string[]
  examples?: Array<{
    input: Record<string, string>
    output: Record<string, string>
  }>
  mode?: 'transform' | 'generate' | 'analyze'
}