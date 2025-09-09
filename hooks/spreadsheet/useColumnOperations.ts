import { useState, useCallback } from 'react'
import { Column, ColumnOperation } from '@/types/spreadsheet'
import { toast } from 'sonner'

interface UseColumnOperationsProps {
  columns: Column[]
  onColumnsChange: (columns: Column[]) => void
  onDataUpdate?: (updateFn: (data: any[][]) => any[][]) => void
}

export function useColumnOperations({
  columns,
  onColumnsChange,
  onDataUpdate
}: UseColumnOperationsProps) {
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({})

  // Resize column
  const resizeColumn = useCallback((index: number, width: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [index]: width
    }))
  }, [])

  // Rename column
  const renameColumn = useCallback((index: number, newName: string) => {
    const updatedColumns = [...columns]
    if (updatedColumns[index]) {
      updatedColumns[index] = {
        ...updatedColumns[index],
        name: newName
      }
      onColumnsChange(updatedColumns)
      toast.success(`Column renamed to "${newName}"`)
    }
  }, [columns, onColumnsChange])

  // Add column
  const addColumn = useCallback((
    name: string,
    index?: number,
    position: 'before' | 'after' = 'after'
  ) => {
    const newColumn: Column = {
      id: `col-${Date.now()}`,
      name,
      type: 'text'
    }

    let insertIndex: number
    if (index === undefined) {
      insertIndex = columns.length
    } else {
      insertIndex = position === 'before' ? index : index + 1
    }

    const updatedColumns = [
      ...columns.slice(0, insertIndex),
      newColumn,
      ...columns.slice(insertIndex)
    ]
    
    onColumnsChange(updatedColumns)

    // Update data to add empty cells for new column
    if (onDataUpdate) {
      onDataUpdate((data) => 
        data.map(row => {
          const newRow = [...row]
          newRow.splice(insertIndex, 0, '')
          return newRow
        })
      )
    }

    toast.success(`Column "${name}" added`)
    return insertIndex
  }, [columns, onColumnsChange, onDataUpdate])

  // Delete column
  const deleteColumn = useCallback((index: number) => {
    if (columns.length <= 1) {
      toast.error('Cannot delete the last column')
      return false
    }

    const columnName = columns[index]?.name
    const updatedColumns = columns.filter((_, i) => i !== index)
    onColumnsChange(updatedColumns)

    // Update data to remove column cells
    if (onDataUpdate) {
      onDataUpdate((data) => 
        data.map(row => row.filter((_, i) => i !== index))
      )
    }

    // Remove column width
    setColumnWidths(prev => {
      const updated = { ...prev }
      delete updated[index]
      // Shift widths for columns after the deleted one
      const shifted: Record<number, number> = {}
      Object.entries(updated).forEach(([key, value]) => {
        const colIndex = parseInt(key)
        if (colIndex > index) {
          shifted[colIndex - 1] = value
        } else {
          shifted[colIndex] = value
        }
      })
      return shifted
    })

    toast.success(`Column "${columnName}" deleted`)
    return true
  }, [columns, onColumnsChange, onDataUpdate])

  // Hide/show column
  const toggleColumnVisibility = useCallback((index: number) => {
    const updatedColumns = [...columns]
    if (updatedColumns[index]) {
      updatedColumns[index] = {
        ...updatedColumns[index],
        isHidden: !updatedColumns[index].isHidden
      }
      onColumnsChange(updatedColumns)
      
      const action = updatedColumns[index].isHidden ? 'hidden' : 'shown'
      toast.success(`Column "${updatedColumns[index].name}" ${action}`)
    }
  }, [columns, onColumnsChange])

  // Move column
  const moveColumn = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    const updatedColumns = [...columns]
    const [movedColumn] = updatedColumns.splice(fromIndex, 1)
    updatedColumns.splice(toIndex, 0, movedColumn)
    onColumnsChange(updatedColumns)

    // Update data to move column cells
    if (onDataUpdate) {
      onDataUpdate((data) => 
        data.map(row => {
          const newRow = [...row]
          const [movedCell] = newRow.splice(fromIndex, 1)
          newRow.splice(toIndex, 0, movedCell)
          return newRow
        })
      )
    }

    // Update column widths
    setColumnWidths(prev => {
      const updated = { ...prev }
      const fromWidth = updated[fromIndex]
      
      if (fromIndex < toIndex) {
        // Moving right
        for (let i = fromIndex; i < toIndex; i++) {
          updated[i] = updated[i + 1] || 200
        }
      } else {
        // Moving left
        for (let i = fromIndex; i > toIndex; i--) {
          updated[i] = updated[i - 1] || 200
        }
      }
      
      updated[toIndex] = fromWidth || 200
      return updated
    })

    toast.success(`Column moved from position ${fromIndex + 1} to ${toIndex + 1}`)
  }, [columns, onColumnsChange, onDataUpdate])

  // Duplicate column
  const duplicateColumn = useCallback((index: number) => {
    const columnToDuplicate = columns[index]
    if (!columnToDuplicate) return

    const newColumn: Column = {
      ...columnToDuplicate,
      id: `col-${Date.now()}`,
      name: `${columnToDuplicate.name} (Copy)`
    }

    const insertIndex = index + 1
    const updatedColumns = [
      ...columns.slice(0, insertIndex),
      newColumn,
      ...columns.slice(insertIndex)
    ]
    
    onColumnsChange(updatedColumns)

    // Duplicate column width
    const originalWidth = columnWidths[index] || 200
    setColumnWidths(prev => {
      const updated = { ...prev }
      // Shift widths for columns after the insertion point
      Object.entries(updated).forEach(([key, value]) => {
        const colIndex = parseInt(key)
        if (colIndex >= insertIndex) {
          updated[colIndex + 1] = value
          delete updated[colIndex]
        }
      })
      updated[insertIndex] = originalWidth
      return updated
    })

    // Duplicate data
    if (onDataUpdate) {
      onDataUpdate((data) => 
        data.map(row => {
          const newRow = [...row]
          newRow.splice(insertIndex, 0, row[index] || '')
          return newRow
        })
      )
    }

    toast.success(`Column "${columnToDuplicate.name}" duplicated`)
    return insertIndex
  }, [columns, onColumnsChange, columnWidths, onDataUpdate])

  // Get column by index
  const getColumn = useCallback((index: number): Column | undefined => {
    return columns[index]
  }, [columns])

  // Get column width
  const getColumnWidth = useCallback((index: number): number => {
    return columnWidths[index] || 200
  }, [columnWidths])

  // Set column type
  const setColumnType = useCallback((index: number, type: Column['type']) => {
    const updatedColumns = [...columns]
    if (updatedColumns[index]) {
      updatedColumns[index] = {
        ...updatedColumns[index],
        type
      }
      onColumnsChange(updatedColumns)
      toast.success(`Column type changed to "${type}"`)
    }
  }, [columns, onColumnsChange])

  return {
    columnWidths,
    resizeColumn,
    renameColumn,
    addColumn,
    deleteColumn,
    toggleColumnVisibility,
    moveColumn,
    duplicateColumn,
    getColumn,
    getColumnWidth,
    setColumnType
  }
}