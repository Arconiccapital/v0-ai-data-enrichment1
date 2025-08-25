import { create } from "zustand"
import { FormatMode, CustomFormat } from "@/lib/enrichment-utils"

interface EnrichmentStatus {
  enriching: boolean
  currentRow?: number
  prompt?: string
}

interface ColumnFormatPreference {
  formatMode: FormatMode
  dataType?: string
  customFormat?: CustomFormat
}

interface ColumnEnrichmentConfig {
  columnIndex: number
  columnName: string
  prompt: string
  formatMode: FormatMode
  dataType?: string
  customFormat?: CustomFormat
  isConfigured: boolean
}

interface ColumnAnalysis {
  columnName: string
  columnIndex: number
  totalCells: number
  filledCells: number
  emptyCells: number
  completeness: number
  dataTypes: {
    emails: number
    urls: number
    numbers: number
    dates: number
    text: number
  }
  uniqueValues: number
  mostCommon: { value: string; count: number }[]
}

interface DataAnalysis {
  totalRows: number
  totalColumns: number
  overallCompleteness: number
  columnAnalyses: ColumnAnalysis[]
  enrichmentSuggestions: string[]
  insights: string[]
}

interface FilterCriteria {
  column: string
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'empty' | 'not_empty'
  value?: string
}

type SelectionMode = 'single' | 'multiple' | 'range'

interface SpreadsheetStore {
  headers: string[]
  data: string[][]
  hasData: boolean
  enrichmentStatus: Record<number, EnrichmentStatus>
  columnFormats: Record<string, ColumnFormatPreference>
  columnEnrichmentConfigs: Record<number, ColumnEnrichmentConfig>
  selectedCells: Set<string> // Format: "row-col"
  cellExplanations: Record<string, string> // Format: "row-col" -> explanation
  // Selection state
  selectedRows: Set<number>
  selectedColumns: Set<number>
  selectionMode: SelectionMode
  filterCriteria: FilterCriteria[]
  // Data methods
  setData: (headers: string[], rows: string[][]) => void
  updateCell: (rowIndex: number, colIndex: number, value: string) => void
  addColumn: (header: string) => number
  addColumnWithEnrichment: (header: string, config?: Partial<ColumnEnrichmentConfig>) => void
  clearData: () => void
  // Enrichment methods
  enrichColumn: (columnIndex: number, prompt: string, contextColumns?: Set<number>) => Promise<void>
  enrichColumnToNew: (sourceColumnIndex: number, newColumnName: string, prompt: string, formatMode?: FormatMode, customFormat?: CustomFormat, contextColumns?: Set<number>) => Promise<void>
  enrichSingleCell: (rowIndex: number, columnIndex: number, prompt?: string, contextColumns?: Set<number>) => Promise<void>
  enrichSelectedCells: (columnIndex: number, selectedRows: Set<number>, prompt?: string, contextColumns?: Set<number>) => Promise<void>
  enrichExistingColumn: (columnIndex: number, scope: 'cell' | 'selected' | 'all', selectedRows?: Set<number>, rowIndex?: number) => Promise<void>
  storeColumnEnrichmentConfig: (columnIndex: number, config: Partial<ColumnEnrichmentConfig>) => void
  getColumnEnrichmentConfig: (columnIndex: number) => ColumnEnrichmentConfig | undefined
  analyzeData: () => DataAnalysis
  setColumnFormat: (columnName: string, preference: ColumnFormatPreference) => void
  getColumnFormat: (columnName: string) => ColumnFormatPreference | undefined
  // Selection methods
  toggleCellSelection: (rowIndex: number, colIndex: number) => void
  clearCellSelection: () => void
  getSelectedCells: () => Array<{ row: number; col: number }>
  toggleRowSelection: (rowIndex: number) => void
  toggleColumnSelection: (colIndex: number) => void
  selectAllRows: () => void
  clearSelection: () => void
  setSelectionMode: (mode: SelectionMode) => void
  applyFilter: (filter: FilterCriteria) => void
  removeFilter: (index: number) => void
  getFilteredData: () => { headers: string[]; rows: string[][] }
  getSelectedData: () => { headers: string[]; rows: string[][] }
  // Explanation methods
  setCellExplanation: (rowIndex: number, colIndex: number, explanation: string) => void
  getCellExplanation: (rowIndex: number, colIndex: number) => string | undefined
  setColumnExplanations: (colIndex: number, explanations: string[]) => void
}

export const useSpreadsheetStore = create<SpreadsheetStore>((set, get) => ({
  headers: [],
  data: [],
  hasData: false,
  enrichmentStatus: {},
  columnFormats: {},
  columnEnrichmentConfigs: {},
  selectedCells: new Set(),
  cellExplanations: {},
  selectedRows: new Set(),
  selectedColumns: new Set(),
  selectionMode: 'multiple',
  filterCriteria: [],

  setData: (headers, rows) =>
    set({
      headers,
      data: rows,
      hasData: true,
      enrichmentStatus: {},
    }),

  updateCell: (rowIndex, colIndex, value) =>
    set((state) => {
      const newData = [...state.data]
      newData[rowIndex] = [...newData[rowIndex]]
      newData[rowIndex][colIndex] = value
      return { data: newData }
    }),

  addColumn: (header) => {
    const state = get()
    const newColumnIndex = state.headers.length
    set({
      headers: [...state.headers, header],
      data: state.data.map((row) => [...row, ""]),
    })
    return newColumnIndex
  },

  addColumnWithEnrichment: (header, config) =>
    set((state) => {
      const newColumnIndex = state.headers.length
      const newState = {
        headers: [...state.headers, header],
        data: state.data.map((row) => [...row, ""]),
        columnEnrichmentConfigs: config ? {
          ...state.columnEnrichmentConfigs,
          [newColumnIndex]: {
            columnIndex: newColumnIndex,
            columnName: header,
            prompt: config.prompt || "",
            formatMode: config.formatMode || 'strict',
            dataType: config.dataType,
            customFormat: config.customFormat,
            isConfigured: !!config.prompt,
            ...config
          }
        } : state.columnEnrichmentConfigs
      }
      return newState
    }),

  clearData: () =>
    set({
      headers: [],
      data: [],
      hasData: false,
      enrichmentStatus: {},
    }),

  enrichColumn: async (columnIndex, prompt, contextColumns) => {
    const { data, headers } = get()

    // Set enrichment status
    set((state) => ({
      enrichmentStatus: {
        ...state.enrichmentStatus,
        [columnIndex]: { enriching: true, prompt, currentRow: 0 },
      },
    }))

    try {
      // Process each row sequentially
      for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
        // Update current row being processed
        set((state) => ({
          enrichmentStatus: {
            ...state.enrichmentStatus,
            [columnIndex]: { ...state.enrichmentStatus[columnIndex], currentRow: rowIndex },
          },
        }))

        // Create row context with optional column filtering
        const rowContext = {}
        if (contextColumns && contextColumns.size > 0) {
          // Use only selected context columns
          contextColumns.forEach(colIndex => {
            const header = headers[colIndex]
            if (header && data[rowIndex][colIndex]) {
              rowContext[header] = data[rowIndex][colIndex]
            }
          })
        } else {
          // Use all columns (backward compatibility)
          headers.forEach((header, colIndex) => {
            if (header && data[rowIndex][colIndex]) {
              rowContext[header] = data[rowIndex][colIndex]
            }
          })
        }

        const currentValue = data[rowIndex][columnIndex] || ""
        const enrichedValue = await enrichCellWithContext(rowContext, currentValue, prompt, headers)

        // Update the cell with enriched value
        set((state) => {
          const newData = [...state.data]
          newData[rowIndex] = [...newData[rowIndex]]
          newData[rowIndex][columnIndex] = enrichedValue
          return { data: newData }
        })

        // Small delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error("Enrichment failed:", error)
    } finally {
      // Clear enrichment status
      set((state) => ({
        enrichmentStatus: {
          ...state.enrichmentStatus,
          [columnIndex]: { enriching: false },
        },
      }))
    }
  },

  enrichSingleCell: async (rowIndex, columnIndex, prompt, contextColumns) => {
    const { data, headers, columnEnrichmentConfigs } = get()
    
    // Use provided prompt or get from column config
    const enrichmentPrompt = prompt || columnEnrichmentConfigs[columnIndex]?.prompt
    if (!enrichmentPrompt) {
      console.error("No prompt provided for enrichment")
      return
    }

    // Set enrichment status
    set((state) => ({
      enrichmentStatus: {
        ...state.enrichmentStatus,
        [columnIndex]: { enriching: true, prompt: enrichmentPrompt, currentRow: rowIndex },
      },
    }))

    try {
      // Create row context with optional column filtering
      const rowContext = {}
      if (contextColumns && contextColumns.size > 0) {
        // Use only selected context columns
        contextColumns.forEach(colIndex => {
          const header = headers[colIndex]
          if (header && data[rowIndex][colIndex]) {
            rowContext[header] = data[rowIndex][colIndex]
          }
        })
      } else {
        // Use all columns (backward compatibility)
        headers.forEach((header, colIndex) => {
          if (header && data[rowIndex][colIndex]) {
            rowContext[header] = data[rowIndex][colIndex]
          }
        })
      }

      const primaryValue = data[rowIndex][columnIndex] || ""
      const enrichedValue = await enrichCellWithContext(rowContext, primaryValue, enrichmentPrompt, headers)

      // Update the cell
      set((state) => {
        const newData = [...state.data]
        newData[rowIndex] = [...newData[rowIndex]]
        newData[rowIndex][columnIndex] = enrichedValue
        return { data: newData }
      })
    } catch (error) {
      console.error("Single cell enrichment failed:", error)
    } finally {
      // Clear enrichment status
      set((state) => ({
        enrichmentStatus: {
          ...state.enrichmentStatus,
          [columnIndex]: { enriching: false },
        },
      }))
    }
  },

  enrichSelectedCells: async (columnIndex, selectedRows, prompt, contextColumns) => {
    const { data, headers, columnEnrichmentConfigs } = get()
    
    // Use provided prompt or get from column config
    const enrichmentPrompt = prompt || columnEnrichmentConfigs[columnIndex]?.prompt
    if (!enrichmentPrompt) {
      console.error("No prompt provided for enrichment")
      return
    }

    // Set enrichment status
    set((state) => ({
      enrichmentStatus: {
        ...state.enrichmentStatus,
        [columnIndex]: { enriching: true, prompt: enrichmentPrompt, currentRow: 0 },
      },
    }))

    try {
      // Process selected rows
      const rowsToProcess = Array.from(selectedRows).sort((a, b) => a - b)
      
      for (const rowIndex of rowsToProcess) {
        // Update current row being processed
        set((state) => ({
          enrichmentStatus: {
            ...state.enrichmentStatus,
            [columnIndex]: { ...state.enrichmentStatus[columnIndex], currentRow: rowIndex },
          },
        }))

        // Create row context with optional column filtering
        const rowContext = {}
        if (contextColumns && contextColumns.size > 0) {
          // Use only selected context columns
          contextColumns.forEach(colIndex => {
            const header = headers[colIndex]
            if (header && data[rowIndex][colIndex]) {
              rowContext[header] = data[rowIndex][colIndex]
            }
          })
        } else {
          // Use all columns (backward compatibility)
          headers.forEach((header, colIndex) => {
            if (header && data[rowIndex][colIndex]) {
              rowContext[header] = data[rowIndex][colIndex]
            }
          })
        }

        const primaryValue = data[rowIndex][columnIndex] || ""
        const enrichedValue = await enrichCellWithContext(rowContext, primaryValue, enrichmentPrompt, headers)

        // Update the cell
        set((state) => {
          const newData = [...state.data]
          newData[rowIndex] = [...newData[rowIndex]]
          newData[rowIndex][columnIndex] = enrichedValue
          return { data: newData }
        })

        // Small delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error("Selected cells enrichment failed:", error)
    } finally {
      // Clear enrichment status
      set((state) => ({
        enrichmentStatus: {
          ...state.enrichmentStatus,
          [columnIndex]: { enriching: false },
        },
      }))
    }
  },

  enrichExistingColumn: async (columnIndex, scope, selectedRows, rowIndex) => {
    const { enrichColumn, enrichSingleCell, enrichSelectedCells, columnEnrichmentConfigs } = get()
    const config = columnEnrichmentConfigs[columnIndex]
    
    if (!config || !config.prompt) {
      console.error("Column has no enrichment configuration")
      return
    }

    switch (scope) {
      case 'cell':
        if (rowIndex !== undefined) {
          await enrichSingleCell(rowIndex, columnIndex, config.prompt)
        }
        break
      case 'selected':
        if (selectedRows && selectedRows.size > 0) {
          await enrichSelectedCells(columnIndex, selectedRows, config.prompt)
        }
        break
      case 'all':
        await enrichColumn(columnIndex, config.prompt)
        break
    }
  },

  storeColumnEnrichmentConfig: (columnIndex, config) =>
    set((state) => ({
      columnEnrichmentConfigs: {
        ...state.columnEnrichmentConfigs,
        [columnIndex]: {
          columnIndex,
          columnName: state.headers[columnIndex] || "",
          prompt: "",
          formatMode: 'strict' as FormatMode,
          isConfigured: false,
          ...state.columnEnrichmentConfigs[columnIndex],
          ...config,
          isConfigured: !!config.prompt
        }
      }
    })),

  getColumnEnrichmentConfig: (columnIndex) => {
    const { columnEnrichmentConfigs } = get()
    return columnEnrichmentConfigs[columnIndex]
  },

  enrichColumnToNew: async (sourceColumnIndex, newColumnName, prompt, formatMode, customFormat, contextColumns) => {
    const { data, headers, addColumn } = get()

    // First, add the new column
    addColumn(newColumnName)
    const newColumnIndex = headers.length // Will be the index after adding

    // Set enrichment status for the new column
    set((state) => ({
      enrichmentStatus: {
        ...state.enrichmentStatus,
        [newColumnIndex]: { enriching: true, prompt, currentRow: 0 },
      },
    }))

    try {
      // Process each row sequentially
      for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
        // Update current row being processed
        set((state) => ({
          enrichmentStatus: {
            ...state.enrichmentStatus,
            [newColumnIndex]: { ...state.enrichmentStatus[newColumnIndex], currentRow: rowIndex },
          },
        }))

        // Create row context with optional column filtering
        const rowContext = {}
        if (contextColumns && contextColumns.size > 0) {
          // Use only selected context columns
          contextColumns.forEach(colIndex => {
            const header = headers[colIndex]
            if (header && data[rowIndex][colIndex]) {
              rowContext[header] = data[rowIndex][colIndex]
            }
          })
        } else {
          // Use all columns (backward compatibility)
          headers.forEach((header, colIndex) => {
            if (header && data[rowIndex][colIndex]) {
              rowContext[header] = data[rowIndex][colIndex]
            }
          })
        }

        // Get primary value from source column if specified
        const primaryValue = sourceColumnIndex >= 0 ? data[rowIndex][sourceColumnIndex] : ""
        
        const enrichedValue = await enrichCellWithContext(rowContext, primaryValue, prompt, headers, customFormat)

        // Update the new column with enriched value
        set((state) => {
          const newData = [...state.data]
          newData[rowIndex] = [...newData[rowIndex]]
          newData[rowIndex][newColumnIndex] = enrichedValue
          return { data: newData }
        })

        // Small delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error("Enrichment failed:", error)
    } finally {
      // Clear enrichment status
      set((state) => ({
        enrichmentStatus: {
          ...state.enrichmentStatus,
          [newColumnIndex]: { enriching: false },
        },
      }))
    }
  },

  analyzeData: () => {
    const { headers, data } = get()
    
    if (!data.length || !headers.length) {
      return {
        totalRows: 0,
        totalColumns: 0,
        overallCompleteness: 0,
        columnAnalyses: [],
        enrichmentSuggestions: [],
        insights: []
      }
    }

    const columnAnalyses: ColumnAnalysis[] = []
    let totalFilledCells = 0
    let totalCells = 0

    // Analyze each column
    headers.forEach((header, colIndex) => {
      const columnData = data.map(row => row[colIndex] || "")
      const filledCells = columnData.filter(cell => cell.trim() !== "").length
      const emptyCells = columnData.length - filledCells
      
      // Detect data types
      const dataTypes = {
        emails: 0,
        urls: 0,
        numbers: 0,
        dates: 0,
        text: 0
      }

      columnData.forEach(cell => {
        if (!cell) return
        
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cell)) {
          dataTypes.emails++
        } else if (/^https?:\/\//.test(cell) || /^www\./.test(cell)) {
          dataTypes.urls++
        } else if (/^\d{4}-\d{2}-\d{2}/.test(cell) || /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(cell)) {
          dataTypes.dates++
        } else if (/^[\d,.$]+$/.test(cell.replace(/[$,]/g, ''))) {
          dataTypes.numbers++
        } else {
          dataTypes.text++
        }
      })

      // Find unique values and most common
      const valueCount = new Map<string, number>()
      columnData.forEach(cell => {
        if (cell) {
          valueCount.set(cell, (valueCount.get(cell) || 0) + 1)
        }
      })

      const mostCommon = Array.from(valueCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([value, count]) => ({ value, count }))

      columnAnalyses.push({
        columnName: header,
        columnIndex: colIndex,
        totalCells: columnData.length,
        filledCells,
        emptyCells,
        completeness: Math.round((filledCells / columnData.length) * 100),
        dataTypes,
        uniqueValues: valueCount.size,
        mostCommon
      })

      totalFilledCells += filledCells
      totalCells += columnData.length
    })

    // Generate enrichment suggestions
    const enrichmentSuggestions: string[] = []
    
    columnAnalyses.forEach(analysis => {
      if (analysis.completeness < 30) {
        if (analysis.columnName.toLowerCase().includes('email')) {
          enrichmentSuggestions.push(`Enrich "${analysis.columnName}" column to find email addresses`)
        } else if (analysis.columnName.toLowerCase().includes('website') || analysis.columnName.toLowerCase().includes('url')) {
          enrichmentSuggestions.push(`Enrich "${analysis.columnName}" column to find websites`)
        } else if (analysis.emptyCells > 0) {
          enrichmentSuggestions.push(`Fill empty cells in "${analysis.columnName}" column (${analysis.emptyCells} empty)`)
        }
      }
    })

    // Generate insights
    const insights: string[] = []
    
    const overallCompleteness = Math.round((totalFilledCells / totalCells) * 100)
    
    if (overallCompleteness < 50) {
      insights.push(`Your data is ${overallCompleteness}% complete. Consider enriching empty columns.`)
    } else if (overallCompleteness < 80) {
      insights.push(`Good progress! Your data is ${overallCompleteness}% complete.`)
    } else {
      insights.push(`Excellent! Your data is ${overallCompleteness}% complete.`)
    }

    // Check for email columns
    const emailColumns = columnAnalyses.filter(col => 
      col.columnName.toLowerCase().includes('email') && col.completeness < 50
    )
    if (emailColumns.length > 0) {
      insights.push(`${emailColumns.length} email column(s) need enrichment`)
    }

    // Check for URL columns
    const urlColumns = columnAnalyses.filter(col => 
      (col.columnName.toLowerCase().includes('website') || col.columnName.toLowerCase().includes('url')) 
      && col.completeness < 50
    )
    if (urlColumns.length > 0) {
      insights.push(`${urlColumns.length} website column(s) need enrichment`)
    }

    // Check for columns with high uniqueness
    columnAnalyses.forEach(col => {
      if (col.uniqueValues === col.filledCells && col.filledCells > 5) {
        insights.push(`"${col.columnName}" contains all unique values - good for identification`)
      }
    })

    return {
      totalRows: data.length,
      totalColumns: headers.length,
      overallCompleteness,
      columnAnalyses,
      enrichmentSuggestions,
      insights
    }
  },

  setColumnFormat: (columnName, preference) =>
    set((state) => ({
      columnFormats: {
        ...state.columnFormats,
        [columnName]: preference
      }
    })),

  getColumnFormat: (columnName) => {
    const { columnFormats } = get()
    return columnFormats[columnName]
  },

  // Cell selection methods
  toggleCellSelection: (rowIndex, colIndex) =>
    set((state) => {
      const cellKey = `${rowIndex}-${colIndex}`
      const newSelectedCells = new Set(state.selectedCells)
      if (newSelectedCells.has(cellKey)) {
        newSelectedCells.delete(cellKey)
      } else {
        newSelectedCells.add(cellKey)
      }
      return { selectedCells: newSelectedCells }
    }),

  clearCellSelection: () =>
    set({ selectedCells: new Set() }),

  getSelectedCells: () => {
    const { selectedCells } = get()
    return Array.from(selectedCells).map(cellKey => {
      const [row, col] = cellKey.split('-').map(Number)
      return { row, col }
    })
  },

  // Selection methods
  toggleRowSelection: (rowIndex) =>
    set((state) => {
      const newSelectedRows = new Set(state.selectedRows)
      if (newSelectedRows.has(rowIndex)) {
        newSelectedRows.delete(rowIndex)
      } else {
        if (state.selectionMode === 'single') {
          newSelectedRows.clear()
        }
        newSelectedRows.add(rowIndex)
      }
      return { selectedRows: newSelectedRows }
    }),

  toggleColumnSelection: (colIndex) =>
    set((state) => {
      const newSelectedColumns = new Set(state.selectedColumns)
      if (newSelectedColumns.has(colIndex)) {
        newSelectedColumns.delete(colIndex)
      } else {
        newSelectedColumns.add(colIndex)
      }
      return { selectedColumns: newSelectedColumns }
    }),

  selectAllRows: () =>
    set((state) => ({
      selectedRows: new Set(Array.from({ length: state.data.length }, (_, i) => i))
    })),

  clearSelection: () =>
    set({
      selectedRows: new Set(),
      selectedColumns: new Set()
    }),

  setSelectionMode: (mode) =>
    set({ selectionMode: mode }),

  applyFilter: (filter) =>
    set((state) => ({
      filterCriteria: [...state.filterCriteria, filter]
    })),

  removeFilter: (index) =>
    set((state) => ({
      filterCriteria: state.filterCriteria.filter((_, i) => i !== index)
    })),

  getFilteredData: () => {
    const { headers, data, filterCriteria } = get()
    
    if (filterCriteria.length === 0) {
      return { headers, rows: data }
    }

    const filteredRows = data.filter((row) => {
      return filterCriteria.every((filter) => {
        const colIndex = headers.indexOf(filter.column)
        if (colIndex === -1) return true
        
        const cellValue = row[colIndex] || ''
        
        switch (filter.operator) {
          case 'equals':
            return cellValue === filter.value
          case 'contains':
            return cellValue.toLowerCase().includes((filter.value || '').toLowerCase())
          case 'greater':
            return parseFloat(cellValue) > parseFloat(filter.value || '0')
          case 'less':
            return parseFloat(cellValue) < parseFloat(filter.value || '0')
          case 'empty':
            return cellValue.trim() === ''
          case 'not_empty':
            return cellValue.trim() !== ''
          default:
            return true
        }
      })
    })

    return { headers, rows: filteredRows }
  },

  getSelectedData: () => {
    const { headers, data, selectedRows, selectedColumns } = get()
    
    // If no selection, return empty
    if (selectedRows.size === 0 && selectedColumns.size === 0) {
      return { headers: [], rows: [] }
    }
    
    // Filter headers based on selected columns
    const selectedHeaders = selectedColumns.size > 0
      ? headers.filter((_, index) => selectedColumns.has(index))
      : headers
    
    // Filter rows based on selected rows
    const selectedData = selectedRows.size > 0
      ? data.filter((_, index) => selectedRows.has(index))
      : data
    
    // Filter columns in each row if columns are selected
    const finalData = selectedColumns.size > 0
      ? selectedData.map(row => row.filter((_, index) => selectedColumns.has(index)))
      : selectedData
    
    return { headers: selectedHeaders, rows: finalData }
  },

  setCellExplanation: (rowIndex, colIndex, explanation) =>
    set((state) => {
      const key = `${rowIndex}-${colIndex}`
      return {
        cellExplanations: {
          ...state.cellExplanations,
          [key]: explanation
        }
      }
    }),

  getCellExplanation: (rowIndex, colIndex) => {
    const key = `${rowIndex}-${colIndex}`
    return get().cellExplanations[key]
  },

  setColumnExplanations: (colIndex, explanations) =>
    set((state) => {
      const newExplanations = { ...state.cellExplanations }
      explanations.forEach((explanation, rowIndex) => {
        if (explanation) {
          const key = `${rowIndex}-${colIndex}`
          newExplanations[key] = explanation
        }
      })
      return { cellExplanations: newExplanations }
    }),
}))

async function enrichCell(value: string, prompt: string): Promise<string> {
  try {
    console.log("[v0] Enriching cell with value:", value, "and prompt:", prompt)

    const response = await fetch("/api/enrich", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        value,
        prompt,
      }),
    })

    console.log("[v0] API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] API error response:", errorText)
      throw new Error(`API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] API response data:", data)

    if (!data.enrichedValue) {
      throw new Error("No enriched value returned from API")
    }

    return data.enrichedValue
  } catch (error) {
    console.error("[v0] Error enriching cell:", error)
    throw new Error(`Failed to enrich cell: ${error.message}`)
  }
}

async function enrichCellWithContext(
  rowContext: Record<string, string>,
  primaryValue: string,
  prompt: string,
  headers: string[],
  customFormat?: CustomFormat
): Promise<string> {
  try {
    // Replace column placeholders in prompt with actual values
    let processedPrompt = prompt
    headers.forEach((header) => {
      if (header && rowContext[header]) {
        const placeholder = new RegExp(`\\{${header}\\}`, 'gi')
        processedPrompt = processedPrompt.replace(placeholder, rowContext[header])
      }
    })

    console.log("[v0] Enriching with row context:", rowContext, "and prompt:", processedPrompt)

    const response = await fetch("/api/enrich", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        value: primaryValue,
        prompt: processedPrompt,
        rowContext,
        customFormat,
      }),
    })

    console.log("[v0] API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] API error response:", errorText)
      throw new Error(`API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] API response data:", data)

    if (!data.enrichedValue) {
      throw new Error("No enriched value returned from API")
    }

    return data.enrichedValue
  } catch (error) {
    console.error("[v0] Error enriching cell with context:", error)
    throw new Error(`Failed to enrich cell: ${error.message}`)
  }
}
