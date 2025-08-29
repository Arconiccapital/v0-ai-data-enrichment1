import { useCallback } from 'react'
import { useSpreadsheetStore } from '@/lib/spreadsheet-store'

export function useSpreadsheetEnrichment() {
  const {
    enrichmentStatus,
    columnEnrichmentConfigs,
    storeColumnEnrichmentConfig,
    enrichExistingColumn,
    enrichColumn,
    enrichSingleCell,
    enrichSelectedCells,
    getColumnEnrichmentConfig,
  } = useSpreadsheetStore()

  // Check if a cell is currently being enriched
  const isCellEnriching = useCallback((rowIndex: number, colIndex: number): boolean => {
    return enrichmentStatus[colIndex]?.enriching && 
           enrichmentStatus[colIndex]?.currentRow === rowIndex
  }, [enrichmentStatus])

  // Check if any column is being enriched
  const isAnyColumnEnriching = useCallback((): boolean => {
    return Object.values(enrichmentStatus).some(status => status?.enriching)
  }, [enrichmentStatus])

  // Get enrichment progress for a column
  const getEnrichmentProgress = useCallback((colIndex: number) => {
    const status = enrichmentStatus[colIndex]
    if (!status?.enriching) return null
    
    return {
      currentRow: status.currentRow,
      prompt: status.prompt,
      isEnriching: status.enriching
    }
  }, [enrichmentStatus])

  // Enrich a specific column
  const handleEnrichColumn = useCallback(async (
    columnIndex: number,
    prompt: string,
    contextColumns?: Set<number>
  ) => {
    await enrichColumn(columnIndex, prompt, contextColumns)
  }, [enrichColumn])

  // Enrich existing column with different scopes
  const handleEnrichExistingColumn = useCallback(async (
    columnIndex: number,
    scope: 'cell' | 'selected' | 'all',
    selectedRows?: Set<number>,
    rowIndex?: number
  ) => {
    await enrichExistingColumn(columnIndex, scope, selectedRows, rowIndex)
  }, [enrichExistingColumn])

  // Enrich a single cell
  const handleEnrichSingleCell = useCallback(async (
    rowIndex: number,
    columnIndex: number,
    prompt?: string,
    contextColumns?: Set<number>
  ) => {
    await enrichSingleCell(rowIndex, columnIndex, prompt, contextColumns)
  }, [enrichSingleCell])

  // Enrich selected cells
  const handleEnrichSelectedCells = useCallback(async (
    columnIndex: number,
    selectedRows: Set<number>,
    prompt?: string,
    contextColumns?: Set<number>
  ) => {
    await enrichSelectedCells(columnIndex, selectedRows, prompt, contextColumns)
  }, [enrichSelectedCells])

  // Store enrichment configuration for a column
  const handleStoreEnrichmentConfig = useCallback((
    columnIndex: number,
    config: any
  ) => {
    storeColumnEnrichmentConfig(columnIndex, config)
  }, [storeColumnEnrichmentConfig])

  // Get enrichment configuration for a column
  const handleGetEnrichmentConfig = useCallback((columnIndex: number) => {
    return getColumnEnrichmentConfig(columnIndex)
  }, [getColumnEnrichmentConfig])

  // Check if a column has enrichment configured
  const isColumnConfigured = useCallback((columnIndex: number): boolean => {
    return columnEnrichmentConfigs[columnIndex]?.isConfigured || false
  }, [columnEnrichmentConfigs])

  return {
    // State
    enrichmentStatus,
    columnEnrichmentConfigs,
    
    // Status checks
    isCellEnriching,
    isAnyColumnEnriching,
    getEnrichmentProgress,
    isColumnConfigured,
    
    // Enrichment handlers
    handleEnrichColumn,
    handleEnrichExistingColumn,
    handleEnrichSingleCell,
    handleEnrichSelectedCells,
    
    // Configuration handlers
    handleStoreEnrichmentConfig,
    handleGetEnrichmentConfig,
  }
}