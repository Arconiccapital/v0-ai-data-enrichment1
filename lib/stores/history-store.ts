import { create } from 'zustand'

interface HistoryEntry {
  type: 'cell_update' | 'row_add' | 'row_delete' | 'column_add' | 'column_delete' | 'bulk_paste'
  timestamp: number
  data: any
  description?: string
}

interface HistoryState {
  past: HistoryEntry[]
  future: HistoryEntry[]
  maxHistorySize: number
  
  // Actions
  pushHistory: (entry: HistoryEntry) => void
  undo: () => HistoryEntry | null
  redo: () => HistoryEntry | null
  clearHistory: () => void
  canUndo: () => boolean
  canRedo: () => boolean
}

const MAX_HISTORY_SIZE = 50

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  maxHistorySize: MAX_HISTORY_SIZE,
  
  pushHistory: (entry) =>
    set((state) => {
      // Add to past, clear future (new action breaks redo chain)
      let newPast = [...state.past, entry]
      
      // Limit history size
      if (newPast.length > state.maxHistorySize) {
        newPast = newPast.slice(-state.maxHistorySize)
      }
      
      return {
        past: newPast,
        future: [] // Clear future when new action is performed
      }
    }),
  
  undo: () => {
    const state = get()
    if (state.past.length === 0) return null
    
    const lastEntry = state.past[state.past.length - 1]
    const newPast = state.past.slice(0, -1)
    const newFuture = [lastEntry, ...state.future]
    
    set({
      past: newPast,
      future: newFuture
    })
    
    return lastEntry
  },
  
  redo: () => {
    const state = get()
    if (state.future.length === 0) return null
    
    const nextEntry = state.future[0]
    const newFuture = state.future.slice(1)
    const newPast = [...state.past, nextEntry]
    
    set({
      past: newPast,
      future: newFuture
    })
    
    return nextEntry
  },
  
  clearHistory: () =>
    set({
      past: [],
      future: []
    }),
  
  canUndo: () => {
    const state = get()
    return state.past.length > 0
  },
  
  canRedo: () => {
    const state = get()
    return state.future.length > 0
  }
}))