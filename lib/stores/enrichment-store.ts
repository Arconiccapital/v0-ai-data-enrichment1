import { create } from 'zustand'
import { ColumnEnrichmentConfig, EnrichmentStatus } from '../types/enrichment'

interface EnrichmentState {
  enrichmentStatus: Record<number, EnrichmentStatus>
  columnEnrichmentConfigs: Record<number, ColumnEnrichmentConfig>
  
  // Actions
  setEnrichmentStatus: (colIndex: number, status: EnrichmentStatus) => void
  clearEnrichmentStatus: (colIndex: number) => void
  storeColumnEnrichmentConfig: (colIndex: number, config: ColumnEnrichmentConfig) => void
  getColumnEnrichmentConfig: (colIndex: number) => ColumnEnrichmentConfig | null
  
  // Status checkers
  isColumnEnriching: (colIndex: number) => boolean
  isAnyEnriching: () => boolean
  getCellEnrichmentStatus: (row: number, col: number) => boolean
}

export const useEnrichmentStore = create<EnrichmentState>((set, get) => ({
  enrichmentStatus: {},
  columnEnrichmentConfigs: {},
  
  setEnrichmentStatus: (colIndex, status) =>
    set((state) => ({
      enrichmentStatus: {
        ...state.enrichmentStatus,
        [colIndex]: status
      }
    })),
  
  clearEnrichmentStatus: (colIndex) =>
    set((state) => {
      const newStatus = { ...state.enrichmentStatus }
      delete newStatus[colIndex]
      return { enrichmentStatus: newStatus }
    }),
  
  storeColumnEnrichmentConfig: (colIndex, config) =>
    set((state) => ({
      columnEnrichmentConfigs: {
        ...state.columnEnrichmentConfigs,
        [colIndex]: config
      }
    })),
  
  getColumnEnrichmentConfig: (colIndex) => {
    const state = get()
    return state.columnEnrichmentConfigs[colIndex] || null
  },
  
  isColumnEnriching: (colIndex) => {
    const state = get()
    return state.enrichmentStatus[colIndex]?.enriching || false
  },
  
  isAnyEnriching: () => {
    const state = get()
    return Object.values(state.enrichmentStatus).some(status => status?.enriching)
  },
  
  getCellEnrichmentStatus: (row, col) => {
    const state = get()
    const status = state.enrichmentStatus[col]
    return status?.enriching && status?.currentRow === row
  }
}))