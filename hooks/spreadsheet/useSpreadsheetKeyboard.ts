import { useEffect, useCallback } from 'react'
import { Selection } from '@/types/spreadsheet'

interface UseSpreadsheetKeyboardProps {
  selection: Selection | null
  rowCount: number
  columnCount: number
  onCopy?: () => void
  onPaste?: () => void
  onCut?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onDelete?: () => void
  onSelectAll?: () => void
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void
  onEnterEdit?: () => void
  onEscapeEdit?: () => void
  isEditing?: boolean
  disabled?: boolean
}

export function useSpreadsheetKeyboard({
  selection,
  rowCount,
  columnCount,
  onCopy,
  onPaste,
  onCut,
  onUndo,
  onRedo,
  onDelete,
  onSelectAll,
  onNavigate,
  onEnterEdit,
  onEscapeEdit,
  isEditing = false,
  disabled = false
}: UseSpreadsheetKeyboardProps) {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const modKey = isMac ? event.metaKey : event.ctrlKey

    // Handle escape key
    if (event.key === 'Escape') {
      if (isEditing) {
        event.preventDefault()
        onEscapeEdit?.()
      }
      return
    }

    // Don't handle other shortcuts while editing
    if (isEditing) {
      // Allow Enter to finish editing
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        onEscapeEdit?.() // Using escape handler to exit edit mode
        onNavigate?.('down')
      }
      return
    }

    // Copy (Cmd/Ctrl + C)
    if (modKey && event.key === 'c' && !event.shiftKey) {
      event.preventDefault()
      onCopy?.()
      return
    }

    // Paste (Cmd/Ctrl + V)
    if (modKey && event.key === 'v' && !event.shiftKey) {
      event.preventDefault()
      onPaste?.()
      return
    }

    // Cut (Cmd/Ctrl + X)
    if (modKey && event.key === 'x' && !event.shiftKey) {
      event.preventDefault()
      onCut?.()
      return
    }

    // Undo (Cmd/Ctrl + Z)
    if (modKey && event.key === 'z' && !event.shiftKey) {
      event.preventDefault()
      onUndo?.()
      return
    }

    // Redo (Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y)
    if ((modKey && event.key === 'z' && event.shiftKey) || (modKey && event.key === 'y')) {
      event.preventDefault()
      onRedo?.()
      return
    }

    // Select All (Cmd/Ctrl + A)
    if (modKey && event.key === 'a') {
      event.preventDefault()
      onSelectAll?.()
      return
    }

    // Delete or Backspace
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (!isEditing && selection) {
        event.preventDefault()
        onDelete?.()
      }
      return
    }

    // Navigation with arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault()
      
      switch (event.key) {
        case 'ArrowUp':
          onNavigate?.('up')
          break
        case 'ArrowDown':
          onNavigate?.('down')
          break
        case 'ArrowLeft':
          onNavigate?.('left')
          break
        case 'ArrowRight':
          onNavigate?.('right')
          break
      }
      return
    }

    // Tab navigation
    if (event.key === 'Tab') {
      event.preventDefault()
      if (event.shiftKey) {
        onNavigate?.('left')
      } else {
        onNavigate?.('right')
      }
      return
    }

    // Enter to edit
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onEnterEdit?.()
      return
    }

    // F2 to edit
    if (event.key === 'F2') {
      event.preventDefault()
      onEnterEdit?.()
      return
    }

    // Home/End for row navigation
    if (event.key === 'Home') {
      event.preventDefault()
      if (modKey) {
        // Go to first cell
        // This would need a specific handler
      } else {
        // Go to first cell in row
        // This would need a specific handler
      }
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      if (modKey) {
        // Go to last cell
        // This would need a specific handler
      } else {
        // Go to last cell in row
        // This would need a specific handler
      }
      return
    }

    // Page Up/Down for scrolling
    if (event.key === 'PageUp' || event.key === 'PageDown') {
      // Let default behavior handle scrolling
      return
    }

    // Start editing on any printable character
    if (event.key.length === 1 && !modKey && !event.altKey) {
      onEnterEdit?.()
    }
  }, [
    disabled,
    isEditing,
    selection,
    onCopy,
    onPaste,
    onCut,
    onUndo,
    onRedo,
    onDelete,
    onSelectAll,
    onNavigate,
    onEnterEdit,
    onEscapeEdit
  ])

  useEffect(() => {
    if (disabled) return

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, disabled])

  // Utility function to get next cell position
  const getNextCell = useCallback((
    currentRow: number,
    currentCol: number,
    direction: 'up' | 'down' | 'left' | 'right'
  ): { row: number; col: number } | null => {
    let newRow = currentRow
    let newCol = currentCol

    switch (direction) {
      case 'up':
        newRow = Math.max(0, currentRow - 1)
        break
      case 'down':
        newRow = Math.min(rowCount - 1, currentRow + 1)
        break
      case 'left':
        newCol = Math.max(0, currentCol - 1)
        break
      case 'right':
        newCol = Math.min(columnCount - 1, currentCol + 1)
        break
    }

    if (newRow === currentRow && newCol === currentCol) {
      return null // No movement possible
    }

    return { row: newRow, col: newCol }
  }, [rowCount, columnCount])

  return {
    getNextCell
  }
}