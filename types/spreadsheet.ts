// Core spreadsheet types

export interface Cell {
  value: string | number | null
  formula?: string
  isEnriched?: boolean
  enrichmentStatus?: 'pending' | 'processing' | 'completed' | 'error'
  metadata?: CellMetadata
}

export interface CellMetadata {
  enrichedAt?: Date
  enrichmentSource?: string
  confidence?: number
  citations?: string[]
}

export interface Column {
  id: string
  name: string
  type?: DataType
  width?: number
  isHidden?: boolean
  enrichmentConfig?: EnrichmentConfig
  attachments?: ColumnAttachment[]
}

export interface Row {
  id: string
  cells: Cell[]
  isSelected?: boolean
  isHidden?: boolean
}

export interface SpreadsheetData {
  columns: Column[]
  rows: Row[]
  metadata?: SpreadsheetMetadata
}

export interface SpreadsheetMetadata {
  name?: string
  createdAt?: Date
  modifiedAt?: Date
  rowCount: number
  columnCount: number
  source?: 'csv' | 'manual' | 'api' | 'template'
}

export interface Selection {
  startRow: number
  startCol: number
  endRow: number
  endCol: number
  isSelecting?: boolean
}

export interface ColumnAttachment {
  id: string
  type: 'url' | 'text' | 'pdf' | 'image'
  name: string
  url?: string
  content?: string
  metadata?: Record<string, unknown>
}

export interface EnrichmentConfig {
  isConfigured: boolean
  prompt?: string
  dataType?: DataType
  formatMode?: 'strict' | 'flexible' | 'custom'
  customFormat?: string
  examples?: string[]
}

export type DataType = 
  | 'text'
  | 'number'
  | 'email'
  | 'url'
  | 'phone'
  | 'date'
  | 'currency'
  | 'percentage'
  | 'boolean'
  | 'company'
  | 'address'
  | 'name'
  | 'custom'

export interface Tab {
  id: string
  name: string
  type: 'data' | 'output' | 'analysis'
  data?: SpreadsheetData
  isActive?: boolean
  isDirty?: boolean
}

export interface SpreadsheetState {
  tabs: Tab[]
  activeTabId: string | null
  selection: Selection | null
  clipboard?: Cell[][]
  undoStack: SpreadsheetAction[]
  redoStack: SpreadsheetAction[]
}

export interface SpreadsheetAction {
  type: 'cell-edit' | 'column-add' | 'column-delete' | 'row-add' | 'row-delete' | 'paste'
  timestamp: Date
  previousState?: Partial<SpreadsheetData>
  newState?: Partial<SpreadsheetData>
  description?: string
}

export interface ColumnOperation {
  type: 'rename' | 'insert' | 'delete' | 'hide' | 'show' | 'resize'
  columnId?: string
  columnIndex?: number
  newName?: string
  newWidth?: number
  position?: 'before' | 'after'
}

export interface CellEdit {
  rowIndex: number
  columnIndex: number
  oldValue: string | number | null
  newValue: string | number | null
  timestamp: Date
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'json' | 'pdf'
  includeHeaders?: boolean
  selectedColumnsOnly?: boolean
  selectedRowsOnly?: boolean
  dateFormat?: string
  numberFormat?: string
}