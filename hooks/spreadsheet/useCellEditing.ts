import { useState, useCallback, useRef } from 'react'
import { CellEdit } from '@/types/spreadsheet'

interface UseCellEditingProps {
  data: (string | number | null)[][]
  onDataChange: (data: (string | number | null)[][]) => void
  onCellEdit?: (edit: CellEdit) => void
  readOnly?: boolean
}

interface EditingCell {
  row: number
  col: number
  originalValue: string | number | null
}

export function useCellEditing({
  data,
  onDataChange,
  onCellEdit,
  readOnly = false
}: UseCellEditingProps) {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [undoStack, setUndoStack] = useState<CellEdit[]>([])
  const [redoStack, setRedoStack] = useState<CellEdit[]>([])
  const editHistoryRef = useRef<CellEdit[]>([])

  // Start editing a cell
  const startEdit = useCallback((row: number, col: number) => {
    if (readOnly) return false
    
    const currentValue = data[row]?.[col] ?? null
    setEditingCell({
      row,
      col,
      originalValue: currentValue
    })
    return true
  }, [data, readOnly])

  // End editing and save changes
  const endEdit = useCallback((save: boolean = true) => {
    if (!editingCell) return

    if (!save) {
      // Cancel edit - restore original value
      setEditingCell(null)
      return
    }

    setEditingCell(null)
  }, [editingCell])

  // Update cell value
  const updateCell = useCallback((
    row: number,
    col: number,
    value: string | number | null
  ) => {
    if (readOnly) return false

    const oldValue = data[row]?.[col] ?? null
    
    // Don't update if value hasn't changed
    if (oldValue === value) return false

    // Create new data array
    const newData = data.map((r, rIndex) => {
      if (rIndex === row) {
        return r.map((c, cIndex) => {
          if (cIndex === col) {
            return value
          }
          return c
        })
      }
      return r
    })

    // Record edit for undo/redo
    const edit: CellEdit = {
      rowIndex: row,
      columnIndex: col,
      oldValue,
      newValue: value,
      timestamp: new Date()
    }

    // Update undo stack and clear redo stack
    setUndoStack(prev => [...prev, edit])
    setRedoStack([])
    editHistoryRef.current.push(edit)

    // Update data
    onDataChange(newData)
    onCellEdit?.(edit)

    return true
  }, [data, onDataChange, onCellEdit, readOnly])

  // Undo last edit
  const undo = useCallback(() => {
    if (undoStack.length === 0) return false

    const lastEdit = undoStack[undoStack.length - 1]
    const newUndoStack = undoStack.slice(0, -1)
    
    // Apply undo
    const newData = data.map((r, rIndex) => {
      if (rIndex === lastEdit.rowIndex) {
        return r.map((c, cIndex) => {
          if (cIndex === lastEdit.columnIndex) {
            return lastEdit.oldValue
          }
          return c
        })
      }
      return r
    })

    setUndoStack(newUndoStack)
    setRedoStack(prev => [...prev, lastEdit])
    onDataChange(newData)

    return true
  }, [data, undoStack, onDataChange])

  // Redo last undone edit
  const redo = useCallback(() => {
    if (redoStack.length === 0) return false

    const editToRedo = redoStack[redoStack.length - 1]
    const newRedoStack = redoStack.slice(0, -1)
    
    // Apply redo
    const newData = data.map((r, rIndex) => {
      if (rIndex === editToRedo.rowIndex) {
        return r.map((c, cIndex) => {
          if (cIndex === editToRedo.columnIndex) {
            return editToRedo.newValue
          }
          return c
        })
      }
      return r
    })

    setRedoStack(newRedoStack)
    setUndoStack(prev => [...prev, editToRedo])
    onDataChange(newData)

    return true
  }, [data, redoStack, onDataChange])

  // Clear cell(s)
  const clearCells = useCallback((
    cells: Array<{ row: number; col: number }>
  ) => {
    if (readOnly || cells.length === 0) return false

    const edits: CellEdit[] = []
    const newData = data.map((row, rIndex) => {
      return row.map((cell, cIndex) => {
        const shouldClear = cells.some(c => c.row === rIndex && c.col === cIndex)
        if (shouldClear && cell !== null) {
          edits.push({
            rowIndex: rIndex,
            columnIndex: cIndex,
            oldValue: cell,
            newValue: null,
            timestamp: new Date()
          })
          return null
        }
        return cell
      })
    })

    if (edits.length > 0) {
      setUndoStack(prev => [...prev, ...edits])
      setRedoStack([])
      onDataChange(newData)
      return true
    }

    return false
  }, [data, onDataChange, readOnly])

  // Batch update cells
  const batchUpdateCells = useCallback((
    updates: Array<{
      row: number
      col: number
      value: string | number | null
    }>
  ) => {
    if (readOnly || updates.length === 0) return false

    const edits: CellEdit[] = []
    const newData = data.map((row, rIndex) => {
      return row.map((cell, cIndex) => {
        const update = updates.find(u => u.row === rIndex && u.col === cIndex)
        if (update && update.value !== cell) {
          edits.push({
            rowIndex: rIndex,
            columnIndex: cIndex,
            oldValue: cell,
            newValue: update.value,
            timestamp: new Date()
          })
          return update.value
        }
        return cell
      })
    })

    if (edits.length > 0) {
      setUndoStack(prev => [...prev, ...edits])
      setRedoStack([])
      onDataChange(newData)
      return true
    }

    return false
  }, [data, onDataChange, readOnly])

  // Fill cells with a value
  const fillCells = useCallback((
    cells: Array<{ row: number; col: number }>,
    value: string | number | null
  ) => {
    const updates = cells.map(cell => ({
      ...cell,
      value
    }))
    return batchUpdateCells(updates)
  }, [batchUpdateCells])

  // Get cell value
  const getCellValue = useCallback((
    row: number,
    col: number
  ): string | number | null => {
    return data[row]?.[col] ?? null
  }, [data])

  // Check if cell is being edited
  const isEditing = useCallback((row: number, col: number): boolean => {
    return editingCell?.row === row && editingCell?.col === col
  }, [editingCell])

  // Get edit history
  const getEditHistory = useCallback((): CellEdit[] => {
    return editHistoryRef.current
  }, [])

  // Clear edit history
  const clearHistory = useCallback(() => {
    setUndoStack([])
    setRedoStack([])
    editHistoryRef.current = []
  }, [])

  return {
    editingCell,
    startEdit,
    endEdit,
    updateCell,
    undo,
    redo,
    clearCells,
    batchUpdateCells,
    fillCells,
    getCellValue,
    isEditing,
    getEditHistory,
    clearHistory,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0
  }
}