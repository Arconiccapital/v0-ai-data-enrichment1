import { useState, useCallback, useRef, useEffect } from 'react'

interface ResizeState {
  columnIndex: number | null
  startX: number
  startWidth: number
}

const MIN_COLUMN_WIDTH = 100
const MAX_COLUMN_WIDTH = 500
const DEFAULT_COLUMN_WIDTH = 200

export function useColumnResize() {
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({})
  const [resizingColumn, setResizingColumn] = useState<number | null>(null)
  const resizeState = useRef<ResizeState>({
    columnIndex: null,
    startX: 0,
    startWidth: 0,
  })

  // Start resizing a column
  const handleResizeStart = useCallback((
    e: React.MouseEvent,
    columnIndex: number
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const currentWidth = columnWidths[columnIndex] || DEFAULT_COLUMN_WIDTH
    
    resizeState.current = {
      columnIndex,
      startX: e.clientX,
      startWidth: currentWidth,
    }
    
    setResizingColumn(columnIndex)

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [columnWidths])

  // Handle mouse move during resize
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const { columnIndex, startX, startWidth } = resizeState.current
    
    if (columnIndex === null) return

    const diff = e.clientX - startX
    const newWidth = Math.min(
      Math.max(startWidth + diff, MIN_COLUMN_WIDTH),
      MAX_COLUMN_WIDTH
    )

    setColumnWidths(prev => ({
      ...prev,
      [columnIndex]: newWidth,
    }))
  }, [])

  // Handle mouse up to end resize
  const handleMouseUp = useCallback(() => {
    resizeState.current = {
      columnIndex: null,
      startX: 0,
      startWidth: 0,
    }
    
    setResizingColumn(null)

    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [handleMouseMove])

  // Get column width
  const getColumnWidth = useCallback((columnIndex: number): number => {
    return columnWidths[columnIndex] || DEFAULT_COLUMN_WIDTH
  }, [columnWidths])

  // Set column width directly
  const setColumnWidth = useCallback((columnIndex: number, width: number) => {
    const validWidth = Math.min(Math.max(width, MIN_COLUMN_WIDTH), MAX_COLUMN_WIDTH)
    setColumnWidths(prev => ({
      ...prev,
      [columnIndex]: validWidth,
    }))
  }, [])

  // Reset column width to default
  const resetColumnWidth = useCallback((columnIndex: number) => {
    setColumnWidths(prev => {
      const newWidths = { ...prev }
      delete newWidths[columnIndex]
      return newWidths
    })
  }, [])

  // Reset all column widths
  const resetAllColumnWidths = useCallback(() => {
    setColumnWidths({})
  }, [])

  // Auto-size column based on content
  const autoSizeColumn = useCallback((
    columnIndex: number,
    data: string[][],
    header: string
  ) => {
    // Calculate max content width
    let maxWidth = header.length * 8 // Rough estimate: 8px per character
    
    data.forEach(row => {
      const cellContent = row[columnIndex] || ''
      const contentWidth = cellContent.length * 8
      maxWidth = Math.max(maxWidth, contentWidth)
    })
    
    // Add padding
    maxWidth += 40
    
    // Apply constraints
    const finalWidth = Math.min(Math.max(maxWidth, MIN_COLUMN_WIDTH), MAX_COLUMN_WIDTH)
    setColumnWidth(columnIndex, finalWidth)
  }, [setColumnWidth])

  // Auto-size all columns
  const autoSizeAllColumns = useCallback((
    data: string[][],
    headers: string[]
  ) => {
    headers.forEach((header, index) => {
      autoSizeColumn(index, data, header)
    })
  }, [autoSizeColumn])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [handleMouseMove, handleMouseUp])

  return {
    // State
    columnWidths,
    resizingColumn,
    
    // Handlers
    handleResizeStart,
    
    // Utilities
    getColumnWidth,
    setColumnWidth,
    resetColumnWidth,
    resetAllColumnWidths,
    autoSizeColumn,
    autoSizeAllColumns,
    
    // Constants
    MIN_COLUMN_WIDTH,
    MAX_COLUMN_WIDTH,
    DEFAULT_COLUMN_WIDTH,
  }
}