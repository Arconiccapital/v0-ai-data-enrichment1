/**
 * CSV utility functions
 */

export interface ParsedCSV {
  headers: string[]
  rows: string[][]
}

/**
 * Parse CSV text into headers and rows
 */
export function parseCSV(csvText: string): ParsedCSV {
  const lines = csvText.trim().split('\n')

  if (lines.length === 0) {
    throw new Error('CSV file is empty')
  }

  // Parse headers
  const headers = parseCSVLine(lines[0])

  // Parse data rows
  const rows: string[][] = []
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i])
    // Ensure row has same length as headers
    while (row.length < headers.length) {
      row.push('')
    }
    rows.push(row.slice(0, headers.length))
  }

  return { headers, rows }
}

/**
 * Parse a single CSV line handling quotes and commas
 */
export function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  // Add final field
  result.push(current.trim())

  return result
}

/**
 * Convert data to CSV format
 */
export function dataToCSV(headers: string[], rows: string[][]): string {
  const escapeCSVValue = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  const csvHeaders = headers.map(escapeCSVValue).join(',')
  const csvRows = rows.map(row => 
    row.map(escapeCSVValue).join(',')
  ).join('\n')

  return `${csvHeaders}\n${csvRows}`
}

/**
 * Download CSV file
 */
export function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = dataToCSV(headers, rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}