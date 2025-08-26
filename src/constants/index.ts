/**
 * Application-wide constants
 */

// API Endpoints
export const API_ENDPOINTS = {
  ENRICH: '/api/enrich',
  ANALYZE: '/api/analyze',
  GENERATE_EMAIL: '/api/generate-email',
  GENERATE_REPORT: '/api/generate-report',
  GENERATE_DASHBOARD: '/api/generate-dashboard',
  FILTER: '/api/filter',
} as const

// File size limits
export const FILE_LIMITS = {
  MAX_CSV_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_ROWS: 10000,
  MAX_COLUMNS: 100,
} as const

// UI Constants
export const UI = {
  DEFAULT_COLUMN_WIDTH: 150,
  MIN_COLUMN_WIDTH: 50,
  MAX_COLUMN_WIDTH: 500,
  ROWS_PER_PAGE: 50,
  DEBOUNCE_DELAY: 300,
} as const

// Workflow steps
export const WORKFLOW_STEPS = [
  { id: 'enrich', label: 'Enrich', icon: 'Sparkles' },
  { id: 'analyze', label: 'Analyze', icon: 'BarChart3' },
  { id: 'output', label: 'Output', icon: 'FileText' },
  { id: 'export', label: 'Export', icon: 'Download' },
] as const

// Data types for enrichment
export const DATA_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  EMAIL: 'email',
  URL: 'url',
  DATE: 'date',
  PHONE: 'phone',
  ADDRESS: 'address',
  BOOLEAN: 'boolean',
} as const

// Enrichment modes
export const ENRICHMENT_MODES = {
  STRICT: 'strict',
  FLEXIBLE: 'flexible',
  CREATIVE: 'creative',
} as const

// Export formats
export const EXPORT_FORMATS = {
  CSV: 'csv',
  JSON: 'json',
  EXCEL: 'excel',
  PDF: 'pdf',
} as const