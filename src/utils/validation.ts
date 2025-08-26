/**
 * Validation utility functions
 */

/**
 * Check if a string is a valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check if a string is a valid URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    // Also accept URLs without protocol
    if (url.startsWith('www.')) {
      return isValidURL(`https://${url}`)
    }
    return false
  }
}

/**
 * Check if a string is a valid number
 */
export function isValidNumber(value: string): boolean {
  const cleaned = value.replace(/[$,]/g, '')
  return !isNaN(Number(cleaned)) && cleaned !== ''
}

/**
 * Check if a string is a valid date
 */
export function isValidDate(value: string): boolean {
  const date = new Date(value)
  return !isNaN(date.getTime())
}

/**
 * Detect the data type of a value
 */
export type DataType = 'email' | 'url' | 'number' | 'date' | 'text'

export function detectDataType(value: string): DataType {
  if (!value) return 'text'
  
  if (isValidEmail(value)) return 'email'
  if (isValidURL(value)) return 'url'
  if (isValidDate(value)) return 'date'
  if (isValidNumber(value)) return 'number'
  
  return 'text'
}

/**
 * Validate required fields
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors.push(`${String(field)} is required`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}