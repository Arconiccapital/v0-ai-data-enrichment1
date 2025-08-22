export interface ParsedCSV {
  headers: string[]
  rows: string[][]
}

export function parseCSV(csvText: string): ParsedCSV {
  const lines = csvText.trim().split("\n")

  if (lines.length === 0) {
    throw new Error("CSV file is empty")
  }

  // Parse headers
  const headers = parseCSVLine(lines[0])

  // Parse data rows
  const rows: string[][] = []
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i])
    // Ensure row has same length as headers
    while (row.length < headers.length) {
      row.push("")
    }
    rows.push(row.slice(0, headers.length))
  }

  return { headers, rows }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
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
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  // Add final field
  result.push(current.trim())

  return result
}
