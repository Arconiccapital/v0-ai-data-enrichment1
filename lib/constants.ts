/**
 * Application-wide constants and configuration
 */

// API Configuration
export const API_CONFIG = {
  PERPLEXITY: {
    MODEL: 'sonar',
    MAX_TOKENS: 2000,
    TEMPERATURE: 0.2,
    BASE_URL: 'https://api.perplexity.ai/chat/completions'
  },
  OPENAI: {
    MODEL: 'gpt-4o-mini',
    MAX_TOKENS: 150,
    TEMPERATURE: 0.3,
    BASE_URL: 'https://api.openai.com/v1'
  },
  TIMEOUT_MS: 30000,
  RETRY_ATTEMPTS: 2
} as const

// Data Processing
export const DATA_LIMITS = {
  MAX_ROWS: 10000,
  MAX_COLUMNS: 100,
  BATCH_SIZE: 10,
  CHUNK_SIZE: 50,
  MAX_CELL_LENGTH: 5000,
  MAX_FILE_SIZE: 10 * 1024 * 1024 // 10MB
} as const

// Enrichment Configuration
export const ENRICHMENT_CONFIG = {
  DELAY_BETWEEN_REQUESTS_MS: 500,
  MAX_CONCURRENT_REQUESTS: 3,
  RETRY_DELAY_MS: 1000,
  PROGRESS_UPDATE_INTERVAL_MS: 100
} as const

// Data Types
export const DATA_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  URL: 'url',
  PHONE: 'phone',
  NAME: 'name',
  COMPANY: 'company',
  CURRENCY: 'currency',
  NUMBER: 'number',
  DATE: 'date',
  ADDRESS: 'address',
  BOOLEAN: 'boolean',
  CATEGORY: 'category'
} as const

// Format Modes
export const FORMAT_MODES = {
  STRICT: 'strict',
  FLEXIBLE: 'flexible',
  CUSTOM: 'custom'
} as const

// UI Configuration
export const UI_CONFIG = {
  CELL_HEIGHT: 32,
  CELL_MIN_WIDTH: 100,
  CELL_MAX_WIDTH: 400,
  HEADER_HEIGHT: 40,
  SIDEBAR_WIDTH: 400,
  ANIMATION_DURATION_MS: 200,
  DEBOUNCE_DELAY_MS: 300,
  SCROLL_THROTTLE_MS: 16
} as const

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  COPY: { key: 'c', meta: true },
  PASTE: { key: 'v', meta: true },
  CUT: { key: 'x', meta: true },
  DELETE: { key: 'Delete' },
  BACKSPACE: { key: 'Backspace' },
  SELECT_ALL: { key: 'a', meta: true },
  UNDO: { key: 'z', meta: true },
  REDO: { key: 'z', meta: true, shift: true },
  ENRICH: { key: 'e', meta: true },
  EXPORT: { key: 's', meta: true }
} as const

// Regular Expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  PHONE: /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/,
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
  NUMBER: /^-?\d+(\.\d+)?$/,
  CURRENCY: /^\$?[\d,]+(\.\d{2})?$/
} as const

// Error Messages
export const ERROR_MESSAGES = {
  API_KEY_MISSING: 'API key not configured. Please add it to your environment variables.',
  API_REQUEST_FAILED: 'Failed to fetch data from API. Please try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed size.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a CSV file.',
  NO_DATA: 'No data available to process.',
  ENRICHMENT_FAILED: 'Failed to enrich data. Please check your settings and try again.',
  EXPORT_FAILED: 'Failed to export data. Please try again.',
  INVALID_FORMAT: 'Invalid data format. Please check your input.'
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  FILE_UPLOADED: 'File uploaded successfully!',
  DATA_ENRICHED: 'Data enriched successfully!',
  DATA_EXPORTED: 'Data exported successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!'
} as const

// Default Values
export const DEFAULTS = {
  COLUMN_WIDTH: 150,
  ROW_HEIGHT: 32,
  EMPTY_CELL: '',
  PLACEHOLDER_TEXT: 'Enter value...',
  DEFAULT_FILENAME: 'enriched_data.csv',
  DEFAULT_COUNT: 20
} as const

// Storage Keys
export const STORAGE_KEYS = {
  RECENT_FILES: 'recentFiles',
  USER_PREFERENCES: 'userPreferences',
  API_KEYS: 'apiKeys',
  LAST_TEMPLATE: 'lastTemplate'
} as const

export type DataType = typeof DATA_TYPES[keyof typeof DATA_TYPES]
export type FormatMode = typeof FORMAT_MODES[keyof typeof FORMAT_MODES]