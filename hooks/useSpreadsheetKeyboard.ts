import { useEffect, useCallback } from 'react'

interface UseSpreadsheetKeyboardProps {
  selectedCell: { row: number; col: number } | null
  data: string[][]
  onCopyCell: (value: string) => void
  onPasteCell: (rowIndex: number, colIndex: number) => void
  onCutCell: (rowIndex: number, colIndex: number) => void
  onToggleCellDetails: () => void
}

export function useSpreadsheetKeyboard({
  selectedCell,
  data,
  onCopyCell,
  onPasteCell,
  onCutCell,
  onToggleCellDetails
}: UseSpreadsheetKeyboardProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const modifier = isMac ? e.metaKey : e.ctrlKey
    
    if (modifier) {
      // Toggle cell details with Cmd/Ctrl + I
      if (e.key === 'i' && selectedCell) {
        e.preventDefault()
        onToggleCellDetails()
      }
      // Copy/paste/cut operations
      else if (selectedCell) {
        if (e.key === 'c') {
          e.preventDefault()
          const value = data[selectedCell.row][selectedCell.col]
          onCopyCell(value)
        } else if (e.key === 'v') {
          e.preventDefault()
          onPasteCell(selectedCell.row, selectedCell.col)
        } else if (e.key === 'x') {
          e.preventDefault()
          onCutCell(selectedCell.row, selectedCell.col)
        }
      }
    }
  }, [selectedCell, data, onCopyCell, onPasteCell, onCutCell, onToggleCellDetails])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}