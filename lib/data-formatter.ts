/**
 * Utility functions for formatting data values in dashboards
 */

/**
 * Format large numbers with appropriate suffixes (K, M, B, T)
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1e12) {
    return `${(value / 1e12).toFixed(1)}T`
  } else if (value >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`
  }
  return value.toLocaleString()
}

/**
 * Format currency values with proper symbols and abbreviations
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
  }
  
  const symbol = symbols[currency] || '$'
  
  if (value >= 1e9) {
    return `${symbol}${(value / 1e9).toFixed(1)}B`
  } else if (value >= 1e6) {
    return `${symbol}${(value / 1e6).toFixed(1)}M`
  } else if (value >= 1e3) {
    return `${symbol}${(value / 1e3).toFixed(1)}K`
  }
  
  return `${symbol}${value.toLocaleString()}`
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format dates to readable strings
 */
export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  
  if (isNaN(date.getTime())) {
    return value.toString()
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Smart value formatter that detects the type and formats accordingly
 */
export function formatValue(value: any, type?: string): string {
  if (value === null || value === undefined) {
    return '-'
  }
  
  // If type is specified, use specific formatter
  if (type) {
    switch (type) {
      case 'currency':
        const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value
        return isNaN(num) ? value : formatCurrency(num)
      
      case 'number':
      case 'numeric':
        const n = typeof value === 'string' ? parseFloat(value) : value
        return isNaN(n) ? value : formatLargeNumber(n)
      
      case 'percentage':
        const p = typeof value === 'string' ? parseFloat(value) : value
        return isNaN(p) ? value : formatPercentage(p)
      
      case 'date':
        return formatDate(value)
      
      default:
        return value.toString()
    }
  }
  
  // Auto-detect type
  if (typeof value === 'number') {
    // Check if it looks like a year
    if (value >= 1900 && value <= 2100 && Number.isInteger(value)) {
      return value.toString()
    }
    // Check if it's a percentage (between 0-100 or has decimal places)
    if (value >= 0 && value <= 100 && !Number.isInteger(value)) {
      return formatPercentage(value)
    }
    // Large numbers
    if (value >= 10000) {
      return formatLargeNumber(value)
    }
    return value.toLocaleString()
  }
  
  if (typeof value === 'string') {
    // Check for currency symbols
    if (value.includes('$') || value.match(/^\d+(\.\d{2})?$/)) {
      const num = parseFloat(value.replace(/[^0-9.-]/g, ''))
      if (!isNaN(num) && num >= 1000) {
        return formatCurrency(num)
      }
    }
    
    // Check for dates
    const date = new Date(value)
    if (!isNaN(date.getTime()) && value.includes('-') || value.includes('/')) {
      return formatDate(date)
    }
  }
  
  return value.toString()
}

/**
 * Format a metric value with appropriate unit/suffix
 */
export function formatMetricValue(value: any, unit?: string): string {
  const formatted = formatValue(value)
  
  if (unit && !formatted.includes(unit)) {
    return `${formatted} ${unit}`
  }
  
  return formatted
}

/**
 * Calculate and format growth/change percentages
 */
export function formatGrowth(current: number, previous: number): string {
  if (previous === 0) return '+∞'
  
  const growth = ((current - previous) / previous) * 100
  const sign = growth >= 0 ? '+' : ''
  
  return `${sign}${growth.toFixed(1)}%`
}

/**
 * Get a human-readable label for a data range
 */
export function getRangeLabel(min: number, max: number, type?: string): string {
  if (type === 'currency') {
    return `${formatCurrency(min)} - ${formatCurrency(max)}`
  }
  
  return `${formatLargeNumber(min)} - ${formatLargeNumber(max)}`
}

/**
 * Format duration/time periods
 */
export function formatDuration(years: number): string {
  if (years < 1) {
    const months = Math.round(years * 12)
    return `${months} month${months !== 1 ? 's' : ''}`
  }
  
  return `${years} year${years !== 1 ? 's' : ''}`
}