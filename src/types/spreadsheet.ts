// Spreadsheet related type definitions

export interface Cell {
  value: string
  enriched?: boolean
  explanation?: string
}

export interface Row {
  id: string
  cells: Cell[]
}

export interface Column {
  id: string
  name: string
  width?: number
  type?: 'text' | 'number' | 'email' | 'url' | 'date'
}

export interface SpreadsheetData {
  columns: Column[]
  rows: Row[]
}

export interface EnrichmentConfig {
  columnIndex: number
  columnName: string
  prompt: string
  formatMode: 'strict' | 'flexible'
  dataType?: string
  isConfigured: boolean
}

export interface EnrichmentStatus {
  enriching: boolean
  currentRow?: number
  prompt?: string
  progress?: number
}

export interface CellSelection {
  row: number
  col: number
}

export interface SelectionRange {
  start: CellSelection
  end: CellSelection
}

export type SelectionMode = 'single' | 'multiple' | 'range'

export interface FilterCriteria {
  column: string
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'empty' | 'not_empty'
  value?: string
}