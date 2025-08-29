import { create } from 'zustand'
import { ColumnAttachment } from '../types/attachments'

interface AttachmentState {
  cellAttachments: Map<string, ColumnAttachment[]>
  columnAttachments: Map<number, ColumnAttachment[]>
  columnAttachmentContext: Record<number, boolean>
  
  // Cell attachment actions
  addCellAttachment: (row: number, col: number, attachment: ColumnAttachment) => void
  removeCellAttachment: (row: number, col: number, attachmentId: string) => void
  getCellAttachments: (row: number, col: number) => ColumnAttachment[]
  clearCellAttachments: (row: number, col: number) => void
  
  // Column attachment actions
  addColumnAttachment: (col: number, attachment: ColumnAttachment) => void
  removeColumnAttachment: (col: number, attachmentId: string) => void
  getColumnAttachments: (col: number) => ColumnAttachment[]
  clearColumnAttachments: (col: number) => void
  
  // Context management
  toggleAttachmentContext: (col: number, useAttachments: boolean) => void
  shouldUseAttachments: (col: number) => boolean
  
  // Utilities
  getAllAttachmentsForContext: (row: number, col: number) => ColumnAttachment[]
  getTotalAttachmentCount: () => number
  clearAllAttachments: () => void
}

export const useAttachmentStore = create<AttachmentState>((set, get) => ({
  cellAttachments: new Map(),
  columnAttachments: new Map(),
  columnAttachmentContext: {},
  
  // Cell attachments
  addCellAttachment: (row, col, attachment) =>
    set((state) => {
      const key = `${row}-${col}`
      const currentAttachments = state.cellAttachments.get(key) || []
      const newMap = new Map(state.cellAttachments)
      newMap.set(key, [...currentAttachments, attachment])
      return { cellAttachments: newMap }
    }),
  
  removeCellAttachment: (row, col, attachmentId) =>
    set((state) => {
      const key = `${row}-${col}`
      const currentAttachments = state.cellAttachments.get(key) || []
      const newMap = new Map(state.cellAttachments)
      const filtered = currentAttachments.filter(a => a.id !== attachmentId)
      
      if (filtered.length > 0) {
        newMap.set(key, filtered)
      } else {
        newMap.delete(key)
      }
      
      return { cellAttachments: newMap }
    }),
  
  getCellAttachments: (row, col) => {
    const state = get()
    const key = `${row}-${col}`
    return state.cellAttachments.get(key) || []
  },
  
  clearCellAttachments: (row, col) =>
    set((state) => {
      const key = `${row}-${col}`
      const newMap = new Map(state.cellAttachments)
      newMap.delete(key)
      return { cellAttachments: newMap }
    }),
  
  // Column attachments
  addColumnAttachment: (col, attachment) =>
    set((state) => {
      const currentAttachments = state.columnAttachments.get(col) || []
      const newMap = new Map(state.columnAttachments)
      newMap.set(col, [...currentAttachments, attachment])
      return { columnAttachments: newMap }
    }),
  
  removeColumnAttachment: (col, attachmentId) =>
    set((state) => {
      const currentAttachments = state.columnAttachments.get(col) || []
      const newMap = new Map(state.columnAttachments)
      const filtered = currentAttachments.filter(a => a.id !== attachmentId)
      
      if (filtered.length > 0) {
        newMap.set(col, filtered)
      } else {
        newMap.delete(col)
      }
      
      return { columnAttachments: newMap }
    }),
  
  getColumnAttachments: (col) => {
    const state = get()
    return state.columnAttachments.get(col) || []
  },
  
  clearColumnAttachments: (col) =>
    set((state) => {
      const newMap = new Map(state.columnAttachments)
      newMap.delete(col)
      return { columnAttachments: newMap }
    }),
  
  // Context management
  toggleAttachmentContext: (col, useAttachments) =>
    set((state) => ({
      columnAttachmentContext: {
        ...state.columnAttachmentContext,
        [col]: useAttachments
      }
    })),
  
  shouldUseAttachments: (col) => {
    const state = get()
    return state.columnAttachmentContext[col] ?? true
  },
  
  // Get all attachments for enrichment context
  getAllAttachmentsForContext: (row, col) => {
    const state = get()
    const cellAttachments = state.getCellAttachments(row, col)
    const columnAttachments = state.shouldUseAttachments(col) 
      ? state.getColumnAttachments(col) 
      : []
    
    // Cell attachments take priority
    return [...cellAttachments, ...columnAttachments]
  },
  
  getTotalAttachmentCount: () => {
    const state = get()
    let count = 0
    
    // Count cell attachments
    state.cellAttachments.forEach(attachments => {
      count += attachments.length
    })
    
    // Count column attachments
    state.columnAttachments.forEach(attachments => {
      count += attachments.length
    })
    
    return count
  },
  
  clearAllAttachments: () =>
    set({
      cellAttachments: new Map(),
      columnAttachments: new Map(),
      columnAttachmentContext: {}
    })
}))