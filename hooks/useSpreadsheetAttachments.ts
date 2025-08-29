import { useCallback } from 'react'
import { useSpreadsheetStore } from '@/lib/spreadsheet-store'

export function useSpreadsheetAttachments() {
  const {
    getCellAttachments,
    addCellAttachment,
    removeCellAttachment,
    getColumnAttachments,
    addColumnAttachment,
    removeColumnAttachment,
    toggleAttachmentContext,
  } = useSpreadsheetStore()

  // Get attachment count for a cell
  const getCellAttachmentCount = useCallback((rowIndex: number, colIndex: number): number => {
    return getCellAttachments(rowIndex, colIndex).length
  }, [getCellAttachments])

  // Get attachment count for a column
  const getColumnAttachmentCount = useCallback((colIndex: number): number => {
    return getColumnAttachments(colIndex).length
  }, [getColumnAttachments])

  // Check if cell has attachments
  const hasCellAttachments = useCallback((rowIndex: number, colIndex: number): boolean => {
    return getCellAttachmentCount(rowIndex, colIndex) > 0
  }, [getCellAttachmentCount])

  // Check if column has attachments
  const hasColumnAttachments = useCallback((colIndex: number): boolean => {
    return getColumnAttachmentCount(colIndex) > 0
  }, [getColumnAttachmentCount])

  // Add attachment to cell
  const handleAddCellAttachment = useCallback((
    rowIndex: number,
    colIndex: number,
    attachment: any
  ) => {
    addCellAttachment(rowIndex, colIndex, attachment)
  }, [addCellAttachment])

  // Remove attachment from cell
  const handleRemoveCellAttachment = useCallback(async (
    rowIndex: number,
    colIndex: number,
    attachmentId: string
  ) => {
    const attachments = getCellAttachments(rowIndex, colIndex)
    const attachment = attachments.find(a => a.id === attachmentId)
    
    // Delete file from disk if filepath exists
    if (attachment?.filepath) {
      try {
        await fetch('/api/column-attachments/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filepath: attachment.filepath,
            columnIndex: colIndex.toString(),
            rowIndex: rowIndex.toString(),
            attachmentId: attachmentId
          })
        })
      } catch (error) {
        console.error('Failed to delete file from disk:', error)
      }
    }
    
    removeCellAttachment(rowIndex, colIndex, attachmentId)
  }, [getCellAttachments, removeCellAttachment])

  // Add attachment to column
  const handleAddColumnAttachment = useCallback((
    colIndex: number,
    attachment: any
  ) => {
    addColumnAttachment(colIndex, attachment)
  }, [addColumnAttachment])

  // Remove attachment from column
  const handleRemoveColumnAttachment = useCallback(async (
    colIndex: number,
    attachmentId: string
  ) => {
    const attachments = getColumnAttachments(colIndex)
    const attachment = attachments.find(a => a.id === attachmentId)
    
    // Delete file from disk if filepath exists
    if (attachment?.filepath) {
      try {
        await fetch('/api/column-attachments/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filepath: attachment.filepath,
            columnIndex: colIndex.toString(),
            rowIndex: null,
            attachmentId: attachmentId
          })
        })
      } catch (error) {
        console.error('Failed to delete file from disk:', error)
      }
    }
    
    removeColumnAttachment(colIndex, attachmentId)
  }, [getColumnAttachments, removeColumnAttachment])

  // Toggle attachment context for a column
  const handleToggleAttachmentContext = useCallback((
    colIndex: number,
    useAttachments: boolean
  ) => {
    toggleAttachmentContext(colIndex, useAttachments)
  }, [toggleAttachmentContext])

  // Get total attachment count (cells + columns)
  const getTotalAttachmentCount = useCallback((
    data: string[][],
    headers: string[]
  ): number => {
    let total = 0
    
    // Count cell attachments
    data.forEach((row, rowIndex) => {
      row.forEach((_, colIndex) => {
        total += getCellAttachmentCount(rowIndex, colIndex)
      })
    })
    
    // Count column attachments
    headers.forEach((_, colIndex) => {
      total += getColumnAttachmentCount(colIndex)
    })
    
    return total
  }, [getCellAttachmentCount, getColumnAttachmentCount])

  return {
    // Get attachments
    getCellAttachments,
    getColumnAttachments,
    
    // Attachment counts
    getCellAttachmentCount,
    getColumnAttachmentCount,
    getTotalAttachmentCount,
    
    // Status checks
    hasCellAttachments,
    hasColumnAttachments,
    
    // Cell attachment handlers
    handleAddCellAttachment,
    handleRemoveCellAttachment,
    
    // Column attachment handlers
    handleAddColumnAttachment,
    handleRemoveColumnAttachment,
    
    // Context toggle
    handleToggleAttachmentContext,
  }
}