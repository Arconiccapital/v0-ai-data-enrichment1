import { useCallback } from 'react'
import { useSpreadsheetStore } from '@/lib/spreadsheet-store'

export function useClipboard() {
  const { updateCell, data } = useSpreadsheetStore()
  
  const handleCopyCell = useCallback(async (value: string) => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(value)
    }
  }, [])

  const handlePasteCell = useCallback(async (rowIndex: number, colIndex: number) => {
    if (navigator.clipboard) {
      const text = await navigator.clipboard.readText()
      updateCell(rowIndex, colIndex, text)
    }
  }, [updateCell])

  const handleCutCell = useCallback(async (rowIndex: number, colIndex: number) => {
    const value = data[rowIndex]?.[colIndex] || ""
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(value)
      updateCell(rowIndex, colIndex, "")
    }
  }, [data, updateCell])

  return {
    handleCopyCell,
    handlePasteCell,
    handleCutCell
  }
}