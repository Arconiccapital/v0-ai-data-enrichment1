export interface CellPosition {
  row: number
  col: number
}

export interface ColumnConfig {
  width: number
  isConfigured: boolean
  prompt?: string
}

export interface EnrichmentStatus {
  enriching: boolean
  currentRow?: number
  prompt?: string
}

export interface SelectionState {
  rows: Set<number>
  columns: Set<number>
  cells: Set<string>
}

export interface SpreadsheetData {
  headers: string[]
  data: string[][]
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