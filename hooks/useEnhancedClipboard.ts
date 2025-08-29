import { useCallback } from 'react'
import { useSpreadsheetStore } from '@/lib/spreadsheet-store'
import { parseClipboardData, calculatePasteBounds } from '@/lib/utils/clipboard-parser'
import { toast } from 'sonner'

export function useEnhancedClipboard() {
  const { 
    data, 
    headers,
    updateCell, 
    addRow,
    addColumn,
    selectedCells,
  } = useSpreadsheetStore()
  
  /**
   * Copy single cell value
   */
  const copySingleCell = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success('Copied to clipboard')
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy to clipboard')
    }
  }, [])
  
  /**
   * Copy multiple cells as TSV (Excel format)
   */
  const copyMultipleCells = useCallback(async (cells: string[][]) => {
    try {
      // Convert to tab-separated format (Excel compatible)
      const tsv = cells.map(row => row.join('\t')).join('\n')
      await navigator.clipboard.writeText(tsv)
      toast.success(`Copied ${cells.length} rows to clipboard`)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy to clipboard')
    }
  }, [])
  
  /**
   * Copy selected cells
   */
  const copySelection = useCallback(async (selectedCell?: { row: number; col: number }) => {
    if (!selectedCells || selectedCells.size === 0) {
      if (selectedCell) {
        const value = data[selectedCell.row]?.[selectedCell.col] || ''
        await copySingleCell(value)
      }
      return
    }
    
    // Organize selected cells by row
    const cellsByRow = new Map<number, number[]>()
    let minRow = Infinity
    let maxRow = -Infinity
    let minCol = Infinity
    let maxCol = -Infinity
    
    selectedCells.forEach(cellKey => {
      const [row, col] = cellKey.split('-').map(Number)
      if (!cellsByRow.has(row)) {
        cellsByRow.set(row, [])
      }
      cellsByRow.get(row)!.push(col)
      
      minRow = Math.min(minRow, row)
      maxRow = Math.max(maxRow, row)
      minCol = Math.min(minCol, col)
      maxCol = Math.max(maxCol, col)
    })
    
    // Build rectangular selection (fill gaps with empty)
    const rows: string[][] = []
    for (let r = minRow; r <= maxRow; r++) {
      const row: string[] = []
      for (let c = minCol; c <= maxCol; c++) {
        if (selectedCells.has(`${r}-${c}`)) {
          row.push(data[r]?.[c] || '')
        } else {
          row.push('') // Empty cell in rectangle
        }
      }
      rows.push(row)
    }
    
    await copyMultipleCells(rows)
  }, [selectedCells, data, copySingleCell, copyMultipleCells])
  
  /**
   * Paste clipboard data (single or multiple cells)
   */
  const paste = useCallback(async (selectedCell?: { row: number; col: number }) => {
    if (!selectedCell) {
      toast.error('Please select a cell first')
      return
    }
    
    try {
      const text = await navigator.clipboard.readText()
      const parsed = parseClipboardData(text)
      
      if (parsed.rows.length === 0) {
        return
      }
      
      // Single cell paste
      if (parsed.rows.length === 1 && parsed.rows[0].length === 1) {
        updateCell(selectedCell.row, selectedCell.col, parsed.rows[0][0])
        toast.success('Pasted')
        return
      }
      
      // Multi-cell paste
      const bounds = calculatePasteBounds(
        parsed,
        data.length,
        headers.length,
        selectedCell,
        selectedCells
      )
      
      // Add new rows if needed
      for (let i = 0; i < bounds.needsNewRows; i++) {
        addRow()
      }
      
      // Add new columns if needed
      for (let i = 0; i < bounds.needsNewCols; i++) {
        addColumn(`Column ${headers.length + i + 1}`)
      }
      
      // Paste data
      let pastedCells = 0
      parsed.rows.forEach((row, rowOffset) => {
        row.forEach((value, colOffset) => {
          const targetRow = bounds.startRow + rowOffset
          const targetCol = bounds.startCol + colOffset
          
          if (targetRow < data.length + bounds.needsNewRows && 
              targetCol < headers.length + bounds.needsNewCols) {
            updateCell(targetRow, targetCol, value)
            pastedCells++
          }
        })
      })
      
      toast.success(`Pasted ${pastedCells} cells`)
    } catch (error) {
      console.error('Failed to paste:', error)
      toast.error('Failed to paste from clipboard')
    }
  }, [selectedCells, data, headers, updateCell, addRow, addColumn])
  
  /**
   * Cut selected cells (copy then clear)
   */
  const cut = useCallback(async (selectedCell?: { row: number; col: number }) => {
    await copySelection(selectedCell)
    
    // Clear selected cells
    if (selectedCells && selectedCells.size > 0) {
      selectedCells.forEach(cellKey => {
        const [row, col] = cellKey.split('-').map(Number)
        updateCell(row, col, '')
      })
      toast.success('Cut to clipboard')
    } else if (selectedCell) {
      updateCell(selectedCell.row, selectedCell.col, '')
      toast.success('Cut to clipboard')
    }
  }, [selectedCells, updateCell, copySelection])
  
  /**
   * Handle paste event (for Ctrl+V / Cmd+V)
   */
  const handlePasteEvent = useCallback(async (event: ClipboardEvent, selectedCell?: { row: number; col: number }) => {
    event.preventDefault()
    
    if (!selectedCell) {
      return
    }
    
    const text = event.clipboardData?.getData('text/plain') || ''
    const parsed = parseClipboardData(text)
    
    if (parsed.rows.length === 0) {
      return
    }
    
    // Calculate paste bounds
    const bounds = calculatePasteBounds(
      parsed,
      data.length,
      headers.length,
      selectedCell,
      selectedCells
    )
    
    // Add rows if needed
    for (let i = 0; i < bounds.needsNewRows; i++) {
      addRow()
    }
    
    // Add columns if needed  
    for (let i = 0; i < bounds.needsNewCols; i++) {
      addColumn(`Column ${headers.length + i + 1}`)
    }
    
    // Batch update cells
    const updates: Array<{ row: number; col: number; value: string }> = []
    
    parsed.rows.forEach((row, rowOffset) => {
      row.forEach((value, colOffset) => {
        const targetRow = bounds.startRow + rowOffset
        const targetCol = bounds.startCol + colOffset
        
        if (targetRow < data.length + bounds.needsNewRows && 
            targetCol < headers.length + bounds.needsNewCols) {
          updates.push({ row: targetRow, col: targetCol, value })
        }
      })
    })
    
    // Apply all updates
    updates.forEach(({ row, col, value }) => {
      updateCell(row, col, value)
    })
    
    toast.success(`Pasted ${updates.length} cells`)
  }, [selectedCells, data, headers, updateCell, addRow, addColumn])
  
  return {
    // Simple operations
    copy: copySingleCell,
    paste,
    cut,
    
    // Advanced operations
    copySelection,
    copyMultipleCells,
    handlePasteEvent,
  }
}