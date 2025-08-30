/**
 * Response Validator - Ensures consistent format across all AI provider responses
 */

export interface ValidationResult {
  isValid: boolean
  value: string
  originalValue: string
  corrections: string[]
  confidence: number
}

/**
 * Validates and standardizes email addresses
 */
function validateEmail(value: string): ValidationResult {
  const originalValue = value
  let cleanValue = value.trim().toLowerCase()
  const corrections: string[] = []
  
  // Remove common prefixes
  cleanValue = cleanValue.replace(/^(email:|e-mail:|contact:)\s*/i, '')
  
  // Extract email from text like "The email is john@example.com"
  const emailMatch = cleanValue.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)
  if (emailMatch) {
    cleanValue = emailMatch[0].toLowerCase()
    corrections.push('Extracted email from text')
  }
  
  // Validate format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValid = emailRegex.test(cleanValue)
  
  return {
    isValid,
    value: cleanValue,
    originalValue,
    corrections,
    confidence: isValid ? 1.0 : 0.3
  }
}

/**
 * Validates and standardizes URLs
 */
function validateURL(value: string): ValidationResult {
  const originalValue = value
  let cleanValue = value.trim()
  const corrections: string[] = []
  
  // Remove common prefixes
  cleanValue = cleanValue.replace(/^(website:|url:|site:)\s*/i, '')
  
  // Add https:// if missing
  if (!cleanValue.startsWith('http://') && !cleanValue.startsWith('https://')) {
    if (cleanValue.includes('.')) {
      cleanValue = 'https://' + cleanValue
      corrections.push('Added https:// prefix')
    }
  }
  
  // Remove trailing slashes and clean up
  cleanValue = cleanValue.replace(/\/+$/, '')
  
  // Extract URL from text
  const urlMatch = cleanValue.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/g)
  if (urlMatch) {
    cleanValue = urlMatch[0]
    corrections.push('Extracted URL from text')
  }
  
  // Validate format
  const isValid = /^https?:\/\/.+\..+/.test(cleanValue)
  
  return {
    isValid,
    value: cleanValue,
    originalValue,
    corrections,
    confidence: isValid ? 1.0 : 0.3
  }
}

/**
 * Validates and standardizes phone numbers
 */
function validatePhone(value: string): ValidationResult {
  const originalValue = value
  let cleanValue = value.trim()
  const corrections: string[] = []
  
  // Remove common prefixes
  cleanValue = cleanValue.replace(/^(phone:|tel:|mobile:|call:)\s*/i, '')
  
  // Extract phone from text
  const phoneMatch = cleanValue.match(/[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}/g)
  if (phoneMatch) {
    cleanValue = phoneMatch[0]
    corrections.push('Extracted phone from text')
  }
  
  // Standardize format for US numbers
  if (cleanValue.match(/^[0-9]{10}$/)) {
    cleanValue = `+1-${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 6)}-${cleanValue.slice(6)}`
    corrections.push('Formatted as US phone number')
  }
  
  const isValid = cleanValue.length >= 10 && /[\d\s\-\+\(\)]+/.test(cleanValue)
  
  return {
    isValid,
    value: cleanValue,
    originalValue,
    corrections,
    confidence: isValid ? 0.9 : 0.3
  }
}

/**
 * Validates and standardizes currency values
 */
function validateCurrency(value: string): ValidationResult {
  const originalValue = value
  let cleanValue = value.trim()
  const corrections: string[] = []
  
  // Extract number from text like "The revenue is $5 million"
  const currencyMatch = cleanValue.match(/\$?\s*[\d,]+\.?\d*\s*(billion|million|thousand|k|m|b)?/i)
  if (currencyMatch) {
    cleanValue = currencyMatch[0]
    corrections.push('Extracted currency from text')
  }
  
  // Convert shorthand to full numbers
  cleanValue = cleanValue.replace(/(\d+)\s*k/i, (m, n) => (parseInt(n) * 1000).toString())
  cleanValue = cleanValue.replace(/(\d+\.?\d*)\s*m(illion)?/i, (m, n) => (parseFloat(n) * 1000000).toString())
  cleanValue = cleanValue.replace(/(\d+\.?\d*)\s*b(illion)?/i, (m, n) => (parseFloat(n) * 1000000000).toString())
  
  // Add dollar sign if missing
  if (!cleanValue.startsWith('$') && /^\d/.test(cleanValue)) {
    cleanValue = '$' + cleanValue
    corrections.push('Added $ symbol')
  }
  
  // Format with commas
  const numPart = cleanValue.replace(/[^\d.]/g, '')
  if (numPart) {
    const formatted = parseFloat(numPart).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
    cleanValue = formatted
    corrections.push('Formatted currency')
  }
  
  const isValid = /^\$[\d,]+(\.\d{2})?$/.test(cleanValue)
  
  return {
    isValid,
    value: cleanValue,
    originalValue,
    corrections,
    confidence: isValid ? 0.95 : 0.5
  }
}

/**
 * Validates and standardizes dates
 */
function validateDate(value: string): ValidationResult {
  const originalValue = value
  let cleanValue = value.trim()
  const corrections: string[] = []
  
  // Extract date patterns
  const datePatterns = [
    /\d{4}-\d{2}-\d{2}/,  // YYYY-MM-DD
    /\d{2}\/\d{2}\/\d{4}/, // MM/DD/YYYY
    /\d{2}-\d{2}-\d{4}/,   // MM-DD-YYYY
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2},?\s+\d{4}/i, // Month DD, YYYY
  ]
  
  for (const pattern of datePatterns) {
    const match = cleanValue.match(pattern)
    if (match) {
      cleanValue = match[0]
      corrections.push('Extracted date from text')
      break
    }
  }
  
  // Try to parse and standardize to YYYY-MM-DD
  const parsed = new Date(cleanValue)
  if (!isNaN(parsed.getTime())) {
    cleanValue = parsed.toISOString().split('T')[0]
    corrections.push('Standardized to YYYY-MM-DD format')
  }
  
  const isValid = /^\d{4}-\d{2}-\d{2}$/.test(cleanValue)
  
  return {
    isValid,
    value: cleanValue,
    originalValue,
    corrections,
    confidence: isValid ? 1.0 : 0.4
  }
}

/**
 * Validates and standardizes names (CEO, person names, etc.)
 */
function validateName(value: string): ValidationResult {
  const originalValue = value
  let cleanValue = value.trim()
  const corrections: string[] = []
  
  // Remove titles and prefixes
  cleanValue = cleanValue.replace(/^(CEO:|Chief Executive Officer:|Founder:|President:|Mr\.|Mrs\.|Ms\.|Dr\.)\s*/i, '')
  if (cleanValue !== value.trim()) {
    corrections.push('Removed title/prefix')
  }
  
  // Extract name from text like "The CEO is John Smith"
  const nameMatch = cleanValue.match(/(?:is|:|-)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g)
  if (nameMatch) {
    cleanValue = nameMatch[0].replace(/^(is|:|-)\s*/i, '').trim()
    corrections.push('Extracted name from text')
  }
  
  // Remove company suffixes
  cleanValue = cleanValue.replace(/\s*(Jr\.|Sr\.|III|II|IV)$/i, '')
  
  // Ensure proper capitalization
  cleanValue = cleanValue.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
  
  const isValid = /^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(cleanValue)
  
  return {
    isValid,
    value: cleanValue,
    originalValue,
    corrections,
    confidence: isValid ? 0.9 : 0.5
  }
}

/**
 * Validates and standardizes numbers
 */
function validateNumber(value: string): ValidationResult {
  const originalValue = value
  let cleanValue = value.trim()
  const corrections: string[] = []
  
  // Extract number from text
  const numberMatch = cleanValue.match(/[\d,]+\.?\d*/g)
  if (numberMatch) {
    cleanValue = numberMatch[0]
    corrections.push('Extracted number from text')
  }
  
  // Remove commas for pure number
  cleanValue = cleanValue.replace(/,/g, '')
  
  // Handle ranges like "100-500"
  if (cleanValue.includes('-') && !cleanValue.startsWith('-')) {
    // Keep as range
    const parts = cleanValue.split('-')
    if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
      cleanValue = `${parts[0]}-${parts[1]}`
    }
  }
  
  const isValid = /^[\d\-\.]+$/.test(cleanValue)
  
  return {
    isValid,
    value: cleanValue,
    originalValue,
    corrections,
    confidence: isValid ? 1.0 : 0.3
  }
}

/**
 * Main validation function that routes to specific validators
 */
export function validateResponse(
  value: string,
  expectedType: string
): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      value: '',
      originalValue: value,
      corrections: ['Empty value'],
      confidence: 0
    }
  }
  
  // Route to specific validator based on type
  switch (expectedType) {
    case 'email':
      return validateEmail(value)
    case 'url':
      return validateURL(value)
    case 'phone':
      return validatePhone(value)
    case 'currency':
      return validateCurrency(value)
    case 'date':
      return validateDate(value)
    case 'name':
    case 'ceo':
    case 'founder':
      return validateName(value)
    case 'number':
      return validateNumber(value)
    default:
      // For text or unknown types, just clean up
      return {
        isValid: true,
        value: value.trim(),
        originalValue: value,
        corrections: [],
        confidence: 0.8
      }
  }
}

/**
 * Extracts specific data type from verbose text
 */
export function extractFromVerboseResponse(
  text: string,
  expectedType: string
): string | null {
  const cleanText = text.toLowerCase()
  
  switch (expectedType) {
    case 'email':
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)
      return emailMatch ? emailMatch[0] : null
      
    case 'url':
      const urlMatch = text.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/g)
      return urlMatch ? urlMatch[0] : null
      
    case 'phone':
      const phoneMatch = text.match(/[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}/g)
      return phoneMatch ? phoneMatch[0] : null
      
    case 'currency':
      const currencyMatch = text.match(/\$?\s*[\d,]+\.?\d*\s*(billion|million|thousand|k|m|b)?/i)
      return currencyMatch ? currencyMatch[0] : null
      
    case 'date':
      const dateMatch = text.match(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/g)
      return dateMatch ? dateMatch[0] : null
      
    case 'name':
    case 'ceo':
      // Look for patterns like "CEO is John Smith" or "John Smith (CEO)"
      const patterns = [
        /(?:ceo|chief executive officer|founder|president)(?:\s+is)?\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?:\s+is)?(?:\s+the)?\s+(?:ceo|chief executive officer)/i
      ]
      for (const pattern of patterns) {
        const match = text.match(pattern)
        if (match && match[1]) {
          return match[1].trim()
        }
      }
      return null
      
    case 'number':
      const numberMatch = text.match(/\d+(?:,\d{3})*(?:\.\d+)?/g)
      return numberMatch ? numberMatch[0] : null
      
    default:
      return null
  }
}