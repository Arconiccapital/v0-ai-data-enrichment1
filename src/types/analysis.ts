// Analysis related type definitions

export interface DataTypeAnalysis {
  emails: number
  urls: number
  numbers: number
  dates: number
  text: number
}

export interface ColumnAnalysis {
  columnName: string
  columnIndex: number
  totalCells: number
  filledCells: number
  emptyCells: number
  completeness: number
  dataTypes: DataTypeAnalysis
  uniqueValues: number
  mostCommon: Array<{
    value: string
    count: number
  }>
}

export interface DataAnalysis {
  totalRows: number
  totalColumns: number
  overallCompleteness: number
  columnAnalyses: ColumnAnalysis[]
  enrichmentSuggestions: string[]
  insights: string[]
}

export type AnalysisType = 'standard' | 'formula' | 'scoring'

export interface AnalysisResult {
  type: AnalysisType
  timestamp: Date
  data: DataAnalysis
  aiResults?: any
}