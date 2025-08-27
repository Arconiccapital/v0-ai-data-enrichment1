/**
 * API-related type definitions
 */

export interface APIError {
  error: string
  code?: number
  details?: any
}

export interface APISuccess<T = any> {
  data: T
  metadata?: Record<string, any>
  source?: 'perplexity' | 'openai' | 'mock'
  timestamp?: string
}

export type APIResponse<T = any> = APISuccess<T> | APIError

export interface EnrichmentRequest {
  value: string
  prompt: string
  rowContext?: Record<string, string>
  customFormat?: string
}

export interface EnrichmentResponse {
  enrichedValue: string
  dataType: string
  formatMode: 'strict' | 'flexible' | 'custom'
  validated: boolean
  source: 'perplexity' | 'openai' | 'mock'
}

export interface GenerationRequest {
  prompt: string
  count?: number
  type?: string
}

export interface GenerationResponse {
  data: string[]
  count: number
  type: string
  source: 'perplexity' | 'openai' | 'mock'
  model?: string
  warning?: string
  error?: string
}

export interface ExtractionRequest {
  content: string
  type?: 'headers' | 'data' | 'all'
}

export interface ExtractionResponse {
  headers?: string[]
  data?: string[][]
  rowCount?: number
  columnCount?: number
}