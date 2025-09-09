// API request and response types

import { DataType } from './spreadsheet'
import { EnrichmentResponse } from './enrichment'

// Base API types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  metadata?: ApiMetadata
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp?: string
}

export interface ApiMetadata {
  requestId?: string
  timestamp?: string
  duration?: number
  version?: string
}

// Enrich API
export interface EnrichApiRequest {
  value: string | null
  prompt: string
  rowContext?: Record<string, unknown>
  customFormat?: string
  attachmentContext?: Array<{
    type: string
    content: string
    metadata?: Record<string, unknown>
  }>
}

export interface EnrichApiResponse extends EnrichmentResponse {
  // Extends EnrichmentResponse from enrichment.ts
}

// Generate API
export interface GenerateApiRequest {
  prompt: string
  count?: number
  dataType?: DataType
  customFormat?: string
  examples?: string[]
  context?: Record<string, unknown>
}

export interface GenerateApiResponse {
  generatedValues: string[]
  dataType?: DataType
  metadata?: {
    provider?: string
    model?: string
    processingTime?: number
  }
}

// Column Attachments API
export interface UploadAttachmentRequest {
  columnIndex: number
  attachments: Array<{
    type: 'url' | 'text' | 'pdf' | 'image'
    name: string
    content: string
  }>
}

export interface UploadAttachmentResponse {
  success: boolean
  attachments?: Array<{
    id: string
    name: string
    type: string
    url?: string
  }>
  error?: string
}

export interface DeleteAttachmentRequest {
  columnIndex: number
  attachmentIds: string[]
}

// Find Data API
export interface FindDataRequest {
  query: string
  count?: number
  dataType?: DataType
  includeHeaders?: boolean
  filters?: Record<string, unknown>
}

export interface FindDataResponse {
  results: Array<{
    value: string
    metadata?: Record<string, unknown>
  }>
  headers?: string[]
  totalCount?: number
  dataType?: DataType
}

// Export API
export interface ExportRequest {
  format: 'csv' | 'excel' | 'json' | 'pdf'
  data: {
    headers: string[]
    rows: Array<Array<string | number | null>>
  }
  options?: {
    includeHeaders?: boolean
    dateFormat?: string
    numberFormat?: string
    fileName?: string
  }
}

export interface ExportResponse {
  url?: string
  blob?: Blob
  fileName?: string
  mimeType?: string
  size?: number
}

// Template API
export interface TemplateRequest {
  templateId: string
  parameters?: Record<string, unknown>
  customization?: {
    theme?: string
    branding?: Record<string, unknown>
  }
}

export interface TemplateResponse {
  id: string
  name: string
  data: {
    headers: string[]
    rows: Array<Array<string | number | null>>
  }
  metadata?: {
    category?: string
    description?: string
    tags?: string[]
  }
}

// Analytics API
export interface AnalyticsRequest {
  dataId: string
  analysisType: 'summary' | 'correlation' | 'trend' | 'outlier'
  columns?: string[]
  options?: Record<string, unknown>
}

export interface AnalyticsResponse {
  analysisType: string
  results: Record<string, unknown>
  visualizations?: Array<{
    type: string
    data: unknown
    options?: Record<string, unknown>
  }>
  insights?: string[]
  metadata?: {
    processingTime?: number
    confidence?: number
  }
}

// Authentication API
export interface AuthRequest {
  email?: string
  password?: string
  provider?: 'google' | 'github' | 'credentials'
  token?: string
}

export interface AuthResponse {
  user?: {
    id: string
    email: string
    name?: string
    avatar?: string
    role?: string
  }
  token?: string
  refreshToken?: string
  expiresAt?: string
}

// Project API
export interface ProjectRequest {
  name: string
  type: 'data' | 'output'
  subtype: string
  data?: unknown
  metadata?: Record<string, unknown>
}

export interface ProjectResponse {
  id: string
  name: string
  type: string
  subtype: string
  createdAt: string
  updatedAt: string
  data?: unknown
  metadata?: Record<string, unknown>
}

// WebSocket types for real-time updates
export interface WebSocketMessage {
  type: 'enrichment-progress' | 'collaboration' | 'notification' | 'error'
  payload: unknown
  timestamp: string
}

export interface EnrichmentProgressMessage {
  jobId: string
  progress: number
  total: number
  currentRow?: number
  status: 'processing' | 'completed' | 'failed'
  message?: string
}