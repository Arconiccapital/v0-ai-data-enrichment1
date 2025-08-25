import { useState, useCallback, useEffect } from 'react'

const DEFAULT_COLUMN_WIDTH = 200
const MIN_COLUMN_WIDTH = 100
const MAX_COLUMN_WIDTH = 500

export function useColumnResizing(columnCount: number) {
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({})
  const [resizingColumn, setResizingColumn] = useState<number | null>(null)

  // Initialize column widths
  useEffect(() => {
    const initialWidths: Record<number, number> = {}
    for (let i = 0; i < columnCount; i++) {
      if (columnWidths[i] === undefined) {
        initialWidths[i] = DEFAULT_COLUMN_WIDTH
      }
    }
    if (Object.keys(initialWidths).length > 0) {
      setColumnWidths(prev => ({ ...prev, ...initialWidths }))
    }
  }, [columnCount])

  const startResizing = useCallback((columnIndex: number, startX: number) => {
    setResizingColumn(columnIndex)
    const startWidth = columnWidths[columnIndex] || DEFAULT_COLUMN_WIDTH

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX
      const newWidth = Math.max(MIN_COLUMN_WIDTH, Math.min(MAX_COLUMN_WIDTH, startWidth + diff))
      setColumnWidths(prev => ({ ...prev, [columnIndex]: newWidth }))
    }

    const handleMouseUp = () => {
      setResizingColumn(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [columnWidths])

  const getColumnWidth = useCallback((columnIndex: number) => {
    return columnWidths[columnIndex] || DEFAULT_COLUMN_WIDTH
  }, [columnWidths])

  const resetColumnWidths = useCallback(() => {
    const resetWidths: Record<number, number> = {}
    for (let i = 0; i < columnCount; i++) {
      resetWidths[i] = DEFAULT_COLUMN_WIDTH
    }
    setColumnWidths(resetWidths)
  }, [columnCount])

  return {
    columnWidths,
    resizingColumn,
    startResizing,
    getColumnWidth,
    resetColumnWidths
  }
}