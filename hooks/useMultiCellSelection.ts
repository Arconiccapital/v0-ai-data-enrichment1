import { useState, useCallback, useRef, useEffect } from 'react'

interface CellPosition {
  row: number
  col: number
}

interface SelectionRange {
  start: CellPosition
  end: CellPosition
}

export function useMultiCellSelection() {
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set())
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [lastSelectedCell, setLastSelectedCell] = useState<CellPosition | null>(null)
  const selectionStartRef = useRef<CellPosition | null>(null)

  // Start selection on mouse down
  const startSelection = useCallback((row: number, col: number, shiftKey: boolean, ctrlKey: boolean) => {
    const cellKey = `${row}-${col}`
    
    if (ctrlKey) {
      // Ctrl+Click: Toggle individual cell selection
      setSelectedCells(prev => {
        const newSet = new Set(prev)
        if (newSet.has(cellKey)) {
          newSet.delete(cellKey)
        } else {
          newSet.add(cellKey)
        }
        return newSet
      })
      setLastSelectedCell({ row, col })
    } else if (shiftKey && lastSelectedCell) {
      // Shift+Click: Select range from last selected to current
      const minRow = Math.min(lastSelectedCell.row, row)
      const maxRow = Math.max(lastSelectedCell.row, row)
      const minCol = Math.min(lastSelectedCell.col, col)
      const maxCol = Math.max(lastSelectedCell.col, col)
      
      const newSelection = new Set<string>()
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          newSelection.add(`${r}-${c}`)
        }
      }
      setSelectedCells(newSelection)
      setSelectionRange({ start: lastSelectedCell, end: { row, col } })
    } else {
      // Regular click: Start new selection
      setIsSelecting(true)
      selectionStartRef.current = { row, col }
      setSelectedCells(new Set([cellKey]))
      setSelectionRange({ start: { row, col }, end: { row, col } })
      setLastSelectedCell({ row, col })
    }
  }, [lastSelectedCell])

  // Update selection during mouse move
  const updateSelection = useCallback((row: number, col: number) => {
    if (!isSelecting || !selectionStartRef.current) return
    
    const start = selectionStartRef.current
    const minRow = Math.min(start.row, row)
    const maxRow = Math.max(start.row, row)
    const minCol = Math.min(start.col, col)
    const maxCol = Math.max(start.col, col)
    
    const newSelection = new Set<string>()
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        newSelection.add(`${r}-${c}`)
      }
    }
    
    setSelectedCells(newSelection)
    setSelectionRange({ start, end: { row, col } })
  }, [isSelecting])

  // End selection on mouse up
  const endSelection = useCallback(() => {
    setIsSelecting(false)
    selectionStartRef.current = null
  }, [])

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedCells(new Set())
    setSelectionRange(null)
    setLastSelectedCell(null)
  }, [])

  // Select all cells
  const selectAll = useCallback((totalRows: number, totalCols: number) => {
    const allCells = new Set<string>()
    for (let r = 0; r < totalRows; r++) {
      for (let c = 0; c < totalCols; c++) {
        allCells.add(`${r}-${c}`)
      }
    }
    setSelectedCells(allCells)
    setSelectionRange({ 
      start: { row: 0, col: 0 }, 
      end: { row: totalRows - 1, col: totalCols - 1 } 
    })
  }, [])

  // Check if a cell is selected
  const isCellSelected = useCallback((row: number, col: number): boolean => {
    return selectedCells.has(`${row}-${col}`)
  }, [selectedCells])

  // Get selected data as a 2D array
  const getSelectedData = useCallback((data: string[][]): string[][] => {
    if (selectedCells.size === 0) return []
    
    // Find bounds of selection
    let minRow = Infinity, maxRow = -1
    let minCol = Infinity, maxCol = -1
    
    selectedCells.forEach(cellKey => {
      const [row, col] = cellKey.split('-').map(Number)
      minRow = Math.min(minRow, row)
      maxRow = Math.max(maxRow, row)
      minCol = Math.min(minCol, col)
      maxCol = Math.max(maxCol, col)
    })
    
    // Build rectangular selection
    const result: string[][] = []
    for (let r = minRow; r <= maxRow; r++) {
      const row: string[] = []
      for (let c = minCol; c <= maxCol; c++) {
        if (selectedCells.has(`${r}-${c}`)) {
          row.push(data[r]?.[c] || '')
        } else {
          row.push('') // Empty for non-selected cells in rectangle
        }
      }
      result.push(row)
    }
    
    return result
  }, [selectedCells])

  // Handle global mouse up to end selection
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelecting) {
        endSelection()
      }
    }
    
    document.addEventListener('mouseup', handleGlobalMouseUp)
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [isSelecting, endSelection])

  return {
    selectedCells,
    selectionRange,
    isSelecting,
    startSelection,
    updateSelection,
    endSelection,
    clearSelection,
    selectAll,
    isCellSelected,
    getSelectedData,
  }
}