import { useState, useCallback, useRef, useEffect } from 'react'
import { Selection } from '@/types/spreadsheet'

interface UseSpreadsheetSelectionProps {
  rowCount: number
  columnCount: number
  onSelectionChange?: (selection: Selection | null) => void
}

export function useSpreadsheetSelection({
  rowCount,
  columnCount,
  onSelectionChange
}: UseSpreadsheetSelectionProps) {
  const [selection, setSelection] = useState<Selection | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const selectionStartRef = useRef<{ row: number; col: number } | null>(null)

  // Start selection
  const startSelection = useCallback((row: number, col: number, shiftKey: boolean = false) => {
    if (shiftKey && selection) {
      // Extend existing selection
      const newSelection: Selection = {
        startRow: selection.startRow,
        startCol: selection.startCol,
        endRow: row,
        endCol: col,
        isSelecting: false
      }
      setSelection(newSelection)
      onSelectionChange?.(newSelection)
    } else {
      // Start new selection
      selectionStartRef.current = { row, col }
      setIsSelecting(true)
      const newSelection: Selection = {
        startRow: row,
        startCol: col,
        endRow: row,
        endCol: col,
        isSelecting: true
      }
      setSelection(newSelection)
      onSelectionChange?.(newSelection)
    }
  }, [selection, onSelectionChange])

  // Update selection during drag
  const updateSelection = useCallback((row: number, col: number) => {
    if (!isSelecting || !selectionStartRef.current) return

    const newSelection: Selection = {
      startRow: Math.min(selectionStartRef.current.row, row),
      startCol: Math.min(selectionStartRef.current.col, col),
      endRow: Math.max(selectionStartRef.current.row, row),
      endCol: Math.max(selectionStartRef.current.col, col),
      isSelecting: true
    }
    setSelection(newSelection)
    onSelectionChange?.(newSelection)
  }, [isSelecting, onSelectionChange])

  // End selection
  const endSelection = useCallback(() => {
    if (selection && isSelecting) {
      const finalSelection: Selection = {
        ...selection,
        isSelecting: false
      }
      setSelection(finalSelection)
      onSelectionChange?.(finalSelection)
    }
    setIsSelecting(false)
    selectionStartRef.current = null
  }, [selection, isSelecting, onSelectionChange])

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelection(null)
    setIsSelecting(false)
    selectionStartRef.current = null
    onSelectionChange?.(null)
  }, [onSelectionChange])

  // Select all
  const selectAll = useCallback(() => {
    const allSelection: Selection = {
      startRow: 0,
      startCol: 0,
      endRow: rowCount - 1,
      endCol: columnCount - 1,
      isSelecting: false
    }
    setSelection(allSelection)
    onSelectionChange?.(allSelection)
  }, [rowCount, columnCount, onSelectionChange])

  // Select column
  const selectColumn = useCallback((columnIndex: number) => {
    const columnSelection: Selection = {
      startRow: 0,
      startCol: columnIndex,
      endRow: rowCount - 1,
      endCol: columnIndex,
      isSelecting: false
    }
    setSelection(columnSelection)
    onSelectionChange?.(columnSelection)
  }, [rowCount, onSelectionChange])

  // Select row
  const selectRow = useCallback((rowIndex: number) => {
    const rowSelection: Selection = {
      startRow: rowIndex,
      startCol: 0,
      endRow: rowIndex,
      endCol: columnCount - 1,
      isSelecting: false
    }
    setSelection(rowSelection)
    onSelectionChange?.(rowSelection)
  }, [columnCount, onSelectionChange])

  // Check if cell is in selection
  const isCellSelected = useCallback((row: number, col: number): boolean => {
    if (!selection) return false
    return (
      row >= selection.startRow &&
      row <= selection.endRow &&
      col >= selection.startCol &&
      col <= selection.endCol
    )
  }, [selection])

  // Get selected cells data
  const getSelectedCells = useCallback(<T = unknown>(
    getData: (row: number, col: number) => T
  ): T[][] => {
    if (!selection) return []

    const cells: T[][] = []
    for (let row = selection.startRow; row <= selection.endRow; row++) {
      const rowCells: T[] = []
      for (let col = selection.startCol; col <= selection.endCol; col++) {
        rowCells.push(getData(row, col))
      }
      cells.push(rowCells)
    }
    return cells
  }, [selection])

  // Handle mouse up globally to end selection
  useEffect(() => {
    const handleMouseUp = () => {
      if (isSelecting) {
        endSelection()
      }
    }

    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isSelecting, endSelection])

  return {
    selection,
    isSelecting,
    startSelection,
    updateSelection,
    endSelection,
    clearSelection,
    selectAll,
    selectColumn,
    selectRow,
    isCellSelected,
    getSelectedCells
  }
}