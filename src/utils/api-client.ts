/**
 * Centralized API client for all API calls
 */

import { API_ENDPOINTS } from '@/src/constants'

interface ApiOptions extends RequestInit {
  timeout?: number
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Make an API request with error handling and timeout
 */
async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { timeout = 30000, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(endpoint, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status,
        errorText
      )
    }

    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof ApiError) {
      throw error
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408)
      }
      throw new ApiError(error.message)
    }
    
    throw new ApiError('Unknown error occurred')
  }
}

/**
 * API client with methods for each endpoint
 */
export const apiClient = {
  /**
   * Enrich data with AI
   */
  async enrich(data: {
    value: string
    prompt: string
    rowContext?: Record<string, string>
    customFormat?: any
  }) {
    return apiRequest(API_ENDPOINTS.ENRICH, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Analyze data
   */
  async analyze(data: {
    prompt: string
    rows: string[][]
    headers: string[]
    analysisType: 'standard' | 'formula' | 'scoring'
  }) {
    return apiRequest(API_ENDPOINTS.ANALYZE, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Generate email
   */
  async generateEmail(data: {
    prompt: string
    context: Record<string, string>
  }) {
    return apiRequest(API_ENDPOINTS.GENERATE_EMAIL, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Generate report
   */
  async generateReport(data: {
    title: string
    sections: any[]
    format: 'html' | 'markdown' | 'pdf'
  }) {
    return apiRequest(API_ENDPOINTS.GENERATE_REPORT, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Generate dashboard
   */
  async generateDashboard(data: {
    headers: string[]
    rows: string[][]
    metrics: string[]
  }) {
    return apiRequest(API_ENDPOINTS.GENERATE_DASHBOARD, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Filter data
   */
  async filter(data: {
    headers: string[]
    rows: string[][]
    filters: Array<{
      column: string
      operator: string
      value?: string
    }>
  }) {
    return apiRequest(API_ENDPOINTS.FILTER, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

export { ApiError }