export interface FormatTemplate {
  pattern: RegExp
  instruction: string
  example: string
  validator: (value: string) => boolean
  extractor?: (text: string) => string | null
}

export interface CustomFormat {
  pattern: string  // User-provided regex pattern as string
  example: string
  instruction: string
}

export type FormatMode = 'strict' | 'custom' | 'free'

// Common pattern templates for quick selection
export const commonPatterns = {
  ssn: {
    name: "Social Security Number",
    pattern: "^\\d{3}-\\d{2}-\\d{4}$",
    example: "123-45-6789",
    instruction: "Format as SSN: XXX-XX-XXXX"
  },
  zipCode: {
    name: "ZIP Code",
    pattern: "^\\d{5}(-\\d{4})?$",
    example: "12345 or 12345-6789",
    instruction: "Format as US ZIP code"
  },
  sku: {
    name: "SKU/Product Code",
    pattern: "^[A-Z]{3}-\\d{4}$",
    example: "ABC-1234",
    instruction: "Format as SKU: 3 letters, dash, 4 numbers"
  },
  orderId: {
    name: "Order ID",
    pattern: "^ORD-\\d{8}$",
    example: "ORD-12345678",
    instruction: "Format as Order ID: ORD-XXXXXXXX"
  },
  customerId: {
    name: "Customer ID",
    pattern: "^CUST-[A-Z]{2}\\d{6}$",
    example: "CUST-AB123456",
    instruction: "Format as Customer ID: CUST-XXNNNNNN"
  },
  isbn: {
    name: "ISBN",
    pattern: "^\\d{3}-\\d{10}$",
    example: "978-1234567890",
    instruction: "Format as ISBN-13"
  },
  ipAddress: {
    name: "IP Address",
    pattern: "^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$",
    example: "192.168.1.1",
    instruction: "Format as IPv4 address"
  },
  macAddress: {
    name: "MAC Address",
    pattern: "^([0-9A-F]{2}:){5}[0-9A-F]{2}$",
    example: "00:1B:44:11:3A:B7",
    instruction: "Format as MAC address with colons"
  },
  twitterHandle: {
    name: "Twitter/X Handle",
    pattern: "^@[a-zA-Z0-9_]{1,15}$",
    example: "@username",
    instruction: "Format as Twitter handle with @"
  },
  hashtag: {
    name: "Hashtag",
    pattern: "^#[a-zA-Z0-9_]+$",
    example: "#trending",
    instruction: "Format as hashtag with #"
  }
}

export const formatTemplates: Record<string, FormatTemplate> = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    instruction: "Return ONLY the email address in format: firstname.lastname@domain.com",
    example: "john.doe@company.com",
    validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
    extractor: (text: string) => {
      const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)
      return match ? match[0] : null
    }
  },
  url: {
    pattern: /^https?:\/\/.+/,
    instruction: "Return ONLY the full URL starting with https:// or http://",
    example: "https://www.company.com",
    validator: (value: string) => /^https?:\/\/.+/.test(value.trim()),
    extractor: (text: string) => {
      const match = text.match(/https?:\/\/[^\s]+/g)
      return match ? match[0].replace(/[.,;!?]$/, '') : null
    }
  },
  phone: {
    pattern: /^\+?[\d\s\-\(\)]+$/,
    instruction: "Return ONLY the phone number in format: +1 (555) 123-4567",
    example: "+1 (555) 123-4567",
    validator: (value: string) => /^\+?[\d\s\-\(\)]+$/.test(value.trim()),
    extractor: (text: string) => {
      const match = text.match(/\+?[\d\s\-\(\)]{10,}/g)
      return match ? match[0].trim() : null
    }
  },
  currency: {
    pattern: /^\$[\d,.]+(M|B|K|T)?$/i,
    instruction: "Return ONLY the amount as: $XXM (millions), $XXB (billions), or $XXK (thousands)",
    example: "$50M",
    validator: (value: string) => /^\$[\d,.]+(M|B|K|T)?$/i.test(value.trim()),
    extractor: (text: string) => {
      const match = text.match(/\$[\d,.]+(M|B|K|T|million|billion|thousand)?/gi)
      if (match) {
        let result = match[0]
        // Convert word forms to abbreviations
        result = result.replace(/million/i, 'M')
          .replace(/billion/i, 'B')
          .replace(/thousand/i, 'K')
          .replace(/trillion/i, 'T')
        return result
      }
      return null
    }
  },
  percentage: {
    pattern: /^\d+(\.\d+)?%$/,
    instruction: "Return ONLY as percentage: XX% or XX.X%",
    example: "85.5%",
    validator: (value: string) => /^\d+(\.\d+)?%$/.test(value.trim()),
    extractor: (text: string) => {
      const match = text.match(/\d+(\.\d+)?%/g)
      return match ? match[0] : null
    }
  },
  date: {
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    instruction: "Return ONLY the date in format: YYYY-MM-DD",
    example: "2024-03-15",
    validator: (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value.trim()),
    extractor: (text: string) => {
      // Try to extract various date formats and normalize
      const patterns = [
        /\d{4}-\d{2}-\d{2}/,
        /\d{1,2}\/\d{1,2}\/\d{2,4}/,
        /\d{1,2}-\d{1,2}-\d{2,4}/
      ]
      for (const pattern of patterns) {
        const match = text.match(pattern)
        if (match) {
          // Normalize to YYYY-MM-DD format
          const dateStr = match[0]
          if (dateStr.includes('-') && dateStr.length === 10) {
            return dateStr
          }
          // Convert other formats if needed
          return dateStr
        }
      }
      return null
    }
  },
  number: {
    pattern: /^[\d,]+(\.\d+)?$/,
    instruction: "Return ONLY the number, use commas for thousands",
    example: "1,234,567",
    validator: (value: string) => /^[\d,]+(\.\d+)?$/.test(value.trim()),
    extractor: (text: string) => {
      const match = text.match(/[\d,]+(\.\d+)?/g)
      return match ? match[0] : null
    }
  },
  text: {
    pattern: /.+/,
    instruction: "Return a concise text response",
    example: "Sample text",
    validator: (value: string) => value.trim().length > 0,
    extractor: (text: string) => text.trim()
  }
}

export function detectDataType(columnName: string, sampleData?: string[]): string {
  const nameLower = columnName.toLowerCase()
  
  // Check column name for hints
  if (nameLower.includes('email') || nameLower.includes('e-mail')) return 'email'
  if (nameLower.includes('website') || nameLower.includes('url') || nameLower.includes('link')) return 'url'
  if (nameLower.includes('phone') || nameLower.includes('tel') || nameLower.includes('mobile')) return 'phone'
  if (nameLower.includes('revenue') || nameLower.includes('price') || nameLower.includes('cost') || 
      nameLower.includes('salary') || nameLower.includes('funding') || nameLower.includes('valuation')) return 'currency'
  if (nameLower.includes('percent') || nameLower.includes('rate') || nameLower.includes('%')) return 'percentage'
  if (nameLower.includes('date') || nameLower.includes('time') || nameLower.includes('year')) return 'date'
  if (nameLower.includes('count') || nameLower.includes('number') || nameLower.includes('quantity')) return 'number'
  
  // Check sample data if available
  if (sampleData && sampleData.length > 0) {
    const nonEmptySamples = sampleData.filter(s => s && s.trim())
    if (nonEmptySamples.length > 0) {
      // Test against patterns
      if (nonEmptySamples.some(s => formatTemplates.email.validator(s))) return 'email'
      if (nonEmptySamples.some(s => formatTemplates.url.validator(s))) return 'url'
      if (nonEmptySamples.some(s => formatTemplates.phone.validator(s))) return 'phone'
      if (nonEmptySamples.some(s => formatTemplates.currency.validator(s))) return 'currency'
      if (nonEmptySamples.some(s => formatTemplates.date.validator(s))) return 'date'
      if (nonEmptySamples.some(s => formatTemplates.number.validator(s))) return 'number'
    }
  }
  
  return 'text'
}

export function generateSmartPrompt(
  columnName: string,
  dataType: string,
  rowContext: Record<string, string>
): string {
  const columnLower = columnName.toLowerCase()
  const format = formatTemplates[dataType]
  
  // Build context string from available data
  const contextParts: string[] = []
  if (rowContext['Company Name'] || rowContext['Company']) {
    contextParts.push(`Company: ${rowContext['Company Name'] || rowContext['Company']}`)
  }
  if (rowContext['Lead Name'] || rowContext['Contact'] || rowContext['Name']) {
    contextParts.push(`Person: ${rowContext['Lead Name'] || rowContext['Contact'] || rowContext['Name']}`)
  }
  if (rowContext['Location'] || rowContext['City'] || rowContext['Country']) {
    contextParts.push(`Location: ${rowContext['Location'] || rowContext['City'] || rowContext['Country']}`)
  }
  if (rowContext['Industry'] || rowContext['Sector']) {
    contextParts.push(`Industry: ${rowContext['Industry'] || rowContext['Sector']}`)
  }
  
  const contextString = contextParts.length > 0 ? `Context: ${contextParts.join(', ')}. ` : ''
  
  // Generate type-specific prompts
  switch (dataType) {
    case 'email':
      if (rowContext['Lead Name'] && (rowContext['Company'] || rowContext['Company Name'])) {
        return `${contextString}Find the professional email address for ${rowContext['Lead Name']} at ${rowContext['Company'] || rowContext['Company Name']}. ${format.instruction}`
      } else if (rowContext['Company'] || rowContext['Company Name']) {
        return `${contextString}Find the primary contact email for ${rowContext['Company'] || rowContext['Company Name']}. ${format.instruction}`
      }
      return `${contextString}Find the relevant email address. ${format.instruction}`
    
    case 'url':
      if (columnLower.includes('linkedin')) {
        return `${contextString}Find the LinkedIn profile URL. ${format.instruction}`
      }
      if (columnLower.includes('twitter') || columnLower.includes('x.com')) {
        return `${contextString}Find the Twitter/X profile URL. ${format.instruction}`
      }
      return `${contextString}Find the official website URL. ${format.instruction}`
    
    case 'phone':
      if (columnLower.includes('mobile')) {
        return `${contextString}Find the mobile phone number. ${format.instruction}`
      }
      return `${contextString}Find the main business phone number. ${format.instruction}`
    
    case 'currency':
      if (columnLower.includes('revenue')) {
        return `${contextString}Find the latest annual revenue. ${format.instruction}`
      }
      if (columnLower.includes('funding') || columnLower.includes('valuation')) {
        return `${contextString}Find the total funding raised or current valuation. ${format.instruction}`
      }
      if (columnLower.includes('market cap')) {
        return `${contextString}Find the current market capitalization. ${format.instruction}`
      }
      return `${contextString}Find the relevant financial figure for "${columnName}". ${format.instruction}`
    
    case 'date':
      if (columnLower.includes('founded') || columnLower.includes('established')) {
        return `${contextString}Find the founding or establishment date. ${format.instruction}`
      }
      if (columnLower.includes('updated') || columnLower.includes('modified')) {
        return `${contextString}Find the last updated date. ${format.instruction}`
      }
      return `${contextString}Find the relevant date for "${columnName}". ${format.instruction}`
    
    case 'number':
      if (columnLower.includes('employee') || columnLower.includes('staff')) {
        return `${contextString}Find the number of employees. Return ONLY the number or range (e.g., "500" or "100-500")`
      }
      if (columnLower.includes('count') || columnLower.includes('quantity')) {
        return `${contextString}Find the count or quantity for "${columnName}". ${format.instruction}`
      }
      return `${contextString}Find the relevant number for "${columnName}". ${format.instruction}`
    
    default:
      // For text or unknown types, be more specific based on column name
      if (columnLower.includes('description')) {
        return `${contextString}Write a brief description (max 100 words). Focus on key facts and services.`
      }
      if (columnLower.includes('industry') || columnLower.includes('sector')) {
        return `${contextString}Identify the primary industry or sector. Return a concise category name.`
      }
      if (columnLower.includes('title') || columnLower.includes('position')) {
        return `${contextString}Find the job title or position. Return the exact title only.`
      }
      if (columnLower.includes('ceo') || columnLower.includes('founder')) {
        return `${contextString}Find the name of the CEO or founder. Return ONLY the person's full name.`
      }
      return `${contextString}Find relevant information for "${columnName}". Be concise and specific.`
  }
}

export function validateAndExtractValue(
  rawValue: string,
  dataType: string
): { valid: boolean; value: string; extracted?: string } {
  const format = formatTemplates[dataType]
  if (!format) {
    return { valid: true, value: rawValue }
  }
  
  // First try direct validation
  const trimmedValue = rawValue.trim()
  if (format.validator(trimmedValue)) {
    return { valid: true, value: trimmedValue }
  }
  
  // Try extraction if available
  if (format.extractor) {
    const extracted = format.extractor(rawValue)
    if (extracted && format.validator(extracted)) {
      return { valid: true, value: extracted, extracted }
    }
  }
  
  // Return original value if can't validate/extract
  return { valid: false, value: trimmedValue }
}

export function improvePrompt(currentPrompt: string, dataType: string): string {
  const format = formatTemplates[dataType]
  if (!format) return currentPrompt
  
  // Check if prompt already has format instructions
  const hasFormatInstruction = currentPrompt.toLowerCase().includes('only') || 
                               currentPrompt.toLowerCase().includes('format')
  
  if (!hasFormatInstruction) {
    // Add format instruction to the end
    return `${currentPrompt}. ${format.instruction}`
  }
  
  // Replace existing format instruction with the strict one
  const improvedPrompt = currentPrompt.replace(
    /return.*?(?:\.|$)/gi,
    format.instruction + '.'
  )
  
  return improvedPrompt
}

export function validateCustomFormat(pattern: string, testValue: string): { valid: boolean; error?: string } {
  try {
    const regex = new RegExp(pattern)
    const isValid = regex.test(testValue)
    return { valid: isValid }
  } catch (error) {
    return { valid: false, error: 'Invalid regex pattern' }
  }
}

export function applyCustomFormat(
  value: string,
  customFormat: CustomFormat
): { valid: boolean; value: string; extracted?: string } {
  try {
    const regex = new RegExp(customFormat.pattern)
    
    // First try direct validation
    if (regex.test(value.trim())) {
      return { valid: true, value: value.trim() }
    }
    
    // Try to extract matching pattern from text
    const match = value.match(regex)
    if (match) {
      return { valid: true, value: match[0], extracted: match[0] }
    }
    
    // Try global search for the pattern
    const globalRegex = new RegExp(customFormat.pattern, 'g')
    const globalMatch = value.match(globalRegex)
    if (globalMatch && globalMatch.length > 0) {
      return { valid: true, value: globalMatch[0], extracted: globalMatch[0] }
    }
    
    return { valid: false, value: value.trim() }
  } catch (error) {
    return { valid: false, value: value.trim() }
  }
}