/**
 * Parse clipboard data from Excel/Google Sheets
 * Handles both TSV (tab-separated) and CSV formats
 */

export interface ParsedClipboardData {
  rows: string[][]
  rowCount: number
  colCount: number
}

/**
 * Parse clipboard text into a 2D array
 * Excel/Google Sheets use tabs, CSV uses commas
 */
export function parseClipboardData(text: string): ParsedClipboardData {
  if (!text) {
    return { rows: [], rowCount: 0, colCount: 0 }
  }

  // Trim the text and split by newlines
  const lines = text.trim().split(/\r?\n/)
  
  // Detect delimiter (tab for Excel, comma for CSV)
  const delimiter = text.includes('\t') ? '\t' : ','
  
  // Parse each line
  const rows = lines.map(line => {
    // Handle quoted values in CSV
    if (delimiter === ',' && line.includes('"')) {
      return parseCSVLine(line)
    }
    return line.split(delimiter)
  })
  
  // Calculate dimensions
  const rowCount = rows.length
  const colCount = Math.max(...rows.map(row => row.length))
  
  // Normalize all rows to have same column count
  const normalizedRows = rows.map(row => {
    while (row.length < colCount) {
      row.push('')
    }
    return row
  })
  
  return {
    rows: normalizedRows,
    rowCount,
    colCount
  }
}

/**
 * Parse a CSV line handling quoted values
 * Handles: "value with, comma", normal, "quoted \"with\" escapes"
 */
function parseCSVLine(line: string): string[] {
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
        // Toggle quote mode
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  // Add last field
  result.push(current)
  
  return result
}

/**
 * Determine paste boundaries based on selection and data size
 */
export interface PasteBounds {
  startRow: number
  startCol: number
  endRow: number
  endCol: number
  needsNewRows: number
  needsNewCols: number
}

export function calculatePasteBounds(
  data: ParsedClipboardData,
  currentGridRows: number,
  currentGridCols: number,
  selectedCell: { row: number; col: number },
  selectedCells?: Set<string>
): PasteBounds {
  // If multiple cells selected, use top-left as start
  let startRow = selectedCell.row
  let startCol = selectedCell.col
  
  if (selectedCells && selectedCells.size > 1) {
    let minRow = Infinity
    let minCol = Infinity
    
    selectedCells.forEach(cellKey => {
      const [row, col] = cellKey.split('-').map(Number)
      minRow = Math.min(minRow, row)
      minCol = Math.min(minCol, col)
    })
    
    startRow = minRow
    startCol = minCol
  }
  
  const endRow = startRow + data.rowCount - 1
  const endCol = startCol + data.colCount - 1
  
  // Calculate if we need to add rows/columns
  const needsNewRows = Math.max(0, endRow - currentGridRows + 1)
  const needsNewCols = Math.max(0, endCol - currentGridCols + 1)
  
  return {
    startRow,
    startCol,
    endRow,
    endCol,
    needsNewRows,
    needsNewCols
  }
}

/**
 * Format data for display (truncate long values, show preview)
 */
export function formatPastePreview(data: ParsedClipboardData, maxChars = 50): string {
  if (data.rows.length === 0) return 'Empty clipboard'
  
  const preview = data.rows
    .slice(0, 3)
    .map(row => 
      row.slice(0, 3)
        .map(cell => {
          if (cell.length > maxChars) {
            return cell.substring(0, maxChars) + '...'
          }
          return cell
        })
        .join(' | ')
    )
    .join('\n')
  
  const more = data.rows.length > 3 ? `\n... and ${data.rows.length - 3} more rows` : ''
  
  return preview + more
}