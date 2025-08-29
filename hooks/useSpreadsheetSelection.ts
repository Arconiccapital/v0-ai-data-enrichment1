import { useState, useCallback } from 'react'
import { useSpreadsheetStore } from '@/lib/spreadsheet-store'

interface CellPosition {
  row: number
  col: number
}

export function useSpreadsheetSelection() {
  const {
    selectedRows,
    selectedColumns,
    selectedCells,
    toggleRowSelection,
    toggleColumnSelection,
    toggleCellSelection,
    clearCellSelection,
    selectAllRows,
    clearSelection,
  } = useSpreadsheetStore()

  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null)

  // Cell selection handlers
  const handleCellClick = useCallback((rowIndex: number, colIndex: number) => {
    setSelectedCell({ row: rowIndex, col: colIndex })
  }, [])

  const handleToggleSelection = useCallback((rowIndex: number, colIndex: number) => {
    toggleCellSelection(rowIndex, colIndex)
  }, [toggleCellSelection])

  // Row selection handlers
  const handleToggleRowSelection = useCallback((rowIndex: number) => {
    toggleRowSelection(rowIndex)
  }, [toggleRowSelection])

  const handleSelectAllRows = useCallback(() => {
    selectAllRows()
  }, [selectAllRows])

  // Column selection handlers
  const handleToggleColumnSelection = useCallback((colIndex: number) => {
    toggleColumnSelection(colIndex)
  }, [toggleColumnSelection])

  // Clear selections
  const handleClearSelection = useCallback(() => {
    clearSelection()
    clearCellSelection()
    setSelectedCell(null)
  }, [clearSelection, clearCellSelection])

  const handleClearCellSelection = useCallback(() => {
    clearCellSelection()
    setSelectedCell(null)
  }, [clearCellSelection])

  // Check if specific cell is selected
  const isCellSelected = useCallback((rowIndex: number, colIndex: number): boolean => {
    return selectedCell?.row === rowIndex && selectedCell?.col === colIndex
  }, [selectedCell])

  const isMultiSelected = useCallback((rowIndex: number, colIndex: number): boolean => {
    return selectedCells.has(`${rowIndex}-${colIndex}`)
  }, [selectedCells])

  return {
    // State
    selectedCell,
    selectedRows,
    selectedColumns,
    selectedCells,
    
    // Cell handlers
    handleCellClick,
    handleToggleSelection,
    isCellSelected,
    isMultiSelected,
    
    // Row handlers
    handleToggleRowSelection,
    handleSelectAllRows,
    
    // Column handlers
    handleToggleColumnSelection,
    
    // Clear handlers
    handleClearSelection,
    handleClearCellSelection,
    
    // Direct setters
    setSelectedCell,
  }
}