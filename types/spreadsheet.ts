/**
 * Spreadsheet-related type definitions
 */

export interface Cell {
  value: string
  isEnriched?: boolean
  isEnriching?: boolean
  error?: string
}

export interface CellPosition {
  row: number
  col: number
}

export interface CellRange {
  start: CellPosition
  end: CellPosition
}

export interface ColumnConfig {
  width: number
  isConfigured: boolean
  prompt?: string
  type?: string
  name?: string
}

export interface EnrichmentStatus {
  enriching: boolean
  currentRow?: number
  prompt?: string
  progress?: number
  total?: number
}

export interface SelectionState {
  rows: Set<number>
  columns: Set<number>
  cells: Set<string>
  range?: CellRange
}

export interface SpreadsheetData {
  headers: string[]
  data: string[][]
  enrichedData?: Record<string, Cell>
  fileName?: string
}

export interface EnrichmentTask {
  row: number
  col: number
  value: string
  prompt: string
  context: Record<string, string>
}

export interface ColumnMetadata {
  index: number
  name: string
  type?: string
  width?: number
  isHidden?: boolean
  isFrozen?: boolean
}

export type ExportFormat = 'csv' | 'excel' | 'json'

export type EnrichmentScope = 'cell' | 'selected' | 'all'

export interface SpreadsheetActions {
  onCellChange: (value: string, rowIndex: number, colIndex: number) => void
  onCellClick: (rowIndex: number, colIndex: number) => void
  onCellSelection: (rowIndex: number, colIndex: number) => void
  onRowSelection: (rowIndex: number) => void
  onColumnSelection: (colIndex: number) => void
  onSelectAll: () => void
  onClearSelection: () => void
  onAddColumn: (name: string) => void
  onEnrichColumn: (colIndex: number, scope: EnrichmentScope, rowIndex?: number) => void
  onExport: (format: ExportFormat) => void
}