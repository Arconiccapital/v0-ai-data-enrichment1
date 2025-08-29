import { create } from 'zustand'
import { EnrichmentMetadata } from '../types/enrichment'

export interface GenerationMetadata {
  model: string
  rows: number
  columns: number
  timestamp: Date
  prompt?: string
}

interface MetadataState {
  cellExplanations: Map<string, string>
  cellMetadata: Map<string, EnrichmentMetadata>
  generationMetadata: GenerationMetadata | null
  
  // Cell explanations
  setCellExplanation: (row: number, col: number, explanation: string) => void
  getCellExplanation: (row: number, col: number) => string | null
  clearCellExplanation: (row: number, col: number) => void
  
  // Cell metadata
  setCellMetadata: (row: number, col: number, metadata: EnrichmentMetadata) => void
  getCellMetadata: (row: number, col: number) => EnrichmentMetadata | null
  clearCellMetadata: (row: number, col: number) => void
  
  // Generation metadata
  setGenerationMetadata: (metadata: GenerationMetadata) => void
  clearGenerationMetadata: () => void
  
  // Utilities
  clearAllMetadata: () => void
  exportMetadata: () => object
}

export const useMetadataStore = create<MetadataState>((set, get) => ({
  cellExplanations: new Map(),
  cellMetadata: new Map(),
  generationMetadata: null,
  
  // Cell explanations
  setCellExplanation: (row, col, explanation) =>
    set((state) => {
      const key = `${row}-${col}`
      const newMap = new Map(state.cellExplanations)
      newMap.set(key, explanation)
      return { cellExplanations: newMap }
    }),
  
  getCellExplanation: (row, col) => {
    const state = get()
    const key = `${row}-${col}`
    return state.cellExplanations.get(key) || null
  },
  
  clearCellExplanation: (row, col) =>
    set((state) => {
      const key = `${row}-${col}`
      const newMap = new Map(state.cellExplanations)
      newMap.delete(key)
      return { cellExplanations: newMap }
    }),
  
  // Cell metadata
  setCellMetadata: (row, col, metadata) =>
    set((state) => {
      const key = `${row}-${col}`
      const newMap = new Map(state.cellMetadata)
      newMap.set(key, metadata)
      return { cellMetadata: newMap }
    }),
  
  getCellMetadata: (row, col) => {
    const state = get()
    const key = `${row}-${col}`
    return state.cellMetadata.get(key) || null
  },
  
  clearCellMetadata: (row, col) =>
    set((state) => {
      const key = `${row}-${col}`
      const newMap = new Map(state.cellMetadata)
      newMap.delete(key)
      return { cellMetadata: newMap }
    }),
  
  // Generation metadata
  setGenerationMetadata: (metadata) => set({ generationMetadata: metadata }),
  
  clearGenerationMetadata: () => set({ generationMetadata: null }),
  
  // Utilities
  clearAllMetadata: () =>
    set({
      cellExplanations: new Map(),
      cellMetadata: new Map(),
      generationMetadata: null
    }),
  
  exportMetadata: () => {
    const state = get()
    
    // Convert Maps to objects for export
    const explanations: Record<string, string> = {}
    state.cellExplanations.forEach((value, key) => {
      explanations[key] = value
    })
    
    const metadata: Record<string, EnrichmentMetadata> = {}
    state.cellMetadata.forEach((value, key) => {
      metadata[key] = value
    })
    
    return {
      cellExplanations: explanations,
      cellMetadata: metadata,
      generationMetadata: state.generationMetadata
    }
  }
}))