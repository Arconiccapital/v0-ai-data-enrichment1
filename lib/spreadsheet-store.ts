import { create } from "zustand"
import { FormatMode, CustomFormat } from "@/lib/enrichment-utils"
import { TemplateDefinition } from "@/src/types/templates"
import { prepareAttachmentContext } from "./context-manager"
import { useHistoryStore } from "@/lib/stores/history-store"

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

interface ColumnAttachment {
  id: string
  filename: string
  fileType: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'image' | 'text'
  uploadedAt: string
  size: number
  parsedContent?: string
  filepath?: string  // Internal filepath for deletion
  url?: string       // Deprecated - no longer using public URLs
}

interface ColumnEnrichmentConfig {
  columnIndex: number
  columnName: string
  prompt: string
  formatMode: FormatMode
  dataType?: string
  customFormat?: CustomFormat
  isConfigured: boolean
  attachments?: ColumnAttachment[]
  useAttachmentsAsContext?: boolean
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

interface ProjectMetadata {
  id: string
  name: string
  type: 'data' | 'output'
  subtype: string
  createdAt: Date
  lastModified: Date
  status: 'draft' | 'in_progress' | 'complete' | 'published'
  metadata?: {
    rows?: number
    columns?: number
    platform?: string
    views?: number
    engagement?: number
  }
}

interface FilterCriteria {
  column: string
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'empty' | 'not_empty'
  value?: string
}

type SelectionMode = 'single' | 'multiple' | 'range'

interface CellMetadata {
  query: string
  response: string
  citations?: Array<{ uri: string; title: string; snippet?: string }>
  timestamp: string
  isEnriched: boolean
  provider?: string
  model?: string
  confidence?: number
  status?: string
  verification?: Record<string, unknown>
  entity?: string
  routerType?: string
  estimatedCost?: number
}

interface GenerationMetadata {
  prompt: string
  query: string
  response: string
  citations: string[]
  timestamp: string
  itemsFound: number
  requestedCount: number
  source: string
}

export interface Tab {
  id: string
  type: 'spreadsheet' | 'dashboard' | 'analysis'
  title: string
  permanent?: boolean
  data?: Record<string, unknown> // Store dashboard or analysis data
  metadata?: {
    sourceColumns?: string[]
    createdAt?: Date
    prompt?: string
    analysisType?: string // For analysis tabs
  }
}

interface SpreadsheetStore {
  headers: string[]
  data: string[][]
  hasData: boolean
  currentTemplate?: TemplateDefinition
  generationMetadata?: GenerationMetadata // Store generation process info
  
  // Project tracking
  currentProject?: ProjectMetadata
  
  // Tab management
  tabs: Tab[]
  activeTab: string
  enrichmentStatus: Record<number, EnrichmentStatus>
  columnFormats: Record<string, ColumnFormatPreference>
  columnEnrichmentConfigs: Record<number, ColumnEnrichmentConfig>
  selectedCells: Set<string> // Format: "row-col"
  cellExplanations: Record<string, string> // Format: "row-col" -> explanation
  cellMetadata: Map<string, CellMetadata> // Format: "row-col" -> full process info
  cellAttachments: Map<string, ColumnAttachment[]> // Format: "row-col" -> attachments for that cell
  // Selection state
  selectedRows: Set<number>
  selectedColumns: Set<number>
  selectionMode: SelectionMode
  filterCriteria: FilterCriteria[]
  // Data methods
  setData: (headers: string[], rows: string[][]) => void
  setDataFromTemplate: (template: TemplateDefinition, generationMetadata?: GenerationMetadata) => void
  updateCell: (rowIndex: number, colIndex: number, value: string) => void
  addColumn: (header: string) => number
  addColumnWithEnrichment: (header: string, config?: Partial<ColumnEnrichmentConfig>) => void
  insertColumnBefore: (index: number, header: string) => void
  insertColumnAfter: (index: number, header: string) => void
  deleteColumn: (index: number) => void
  renameColumn: (index: number, newName: string) => void
  addRow: () => void
  clearData: () => void
  // Enrichment methods
  enrichColumn: (columnIndex: number, prompt: string, contextColumns?: Set<number>) => Promise<void>
  enrichColumnToNew: (sourceColumnIndex: number, newColumnName: string, prompt: string, formatMode?: FormatMode, customFormat?: CustomFormat, contextColumns?: Set<number>) => Promise<void>
  enrichSingleCell: (rowIndex: number, columnIndex: number, prompt?: string, contextColumns?: Set<number>) => Promise<void>
  enrichSelectedCells: (columnIndex: number, selectedRows: Set<number>, prompt?: string, contextColumns?: Set<number>) => Promise<void>
  enrichExistingColumn: (columnIndex: number, scope: 'cell' | 'selected' | 'all', selectedRows?: Set<number>, rowIndex?: number) => Promise<void>
  storeColumnEnrichmentConfig: (columnIndex: number, config: Partial<ColumnEnrichmentConfig>) => void
  getColumnEnrichmentConfig: (columnIndex: number) => ColumnEnrichmentConfig | undefined
  // Column attachment methods (legacy - for column-level context)
  addColumnAttachment: (columnIndex: number, attachment: ColumnAttachment) => void
  removeColumnAttachment: (columnIndex: number, attachmentId: string) => void
  getColumnAttachments: (columnIndex: number) => ColumnAttachment[]
  toggleAttachmentContext: (columnIndex: number, useAttachments: boolean) => void
  // Cell attachment methods (new - for cell-specific documents)
  addCellAttachment: (rowIndex: number, columnIndex: number, attachment: ColumnAttachment) => void
  removeCellAttachment: (rowIndex: number, columnIndex: number, attachmentId: string) => void
  getCellAttachments: (rowIndex: number, columnIndex: number) => ColumnAttachment[]
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
  // Metadata methods
  getCellMetadata: (rowIndex: number, colIndex: number) => CellMetadata | undefined
  getGenerationMetadata: () => GenerationMetadata | undefined
  
  // Tab management methods
  addTab: (tab: Tab) => void
  removeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  getTab: (tabId: string) => Tab | undefined
  updateTab: (tabId: string, updates: Partial<Tab>) => void
  // Undo/Redo
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  
  // Project management
  setCurrentProject: (project: ProjectMetadata) => void
  updateProjectMetadata: (updates: Partial<ProjectMetadata>) => void
  saveProjectToStorage: () => void
}

export const useSpreadsheetStore = create<SpreadsheetStore>((set, get) => ({
  headers: [],
  data: [],
  hasData: false,
  currentProject: undefined,
  enrichmentStatus: {},
  columnFormats: {},
  columnEnrichmentConfigs: {},
  selectedCells: new Set(),
  cellExplanations: {},
  cellMetadata: new Map(),
  cellAttachments: new Map(),
  selectedRows: new Set(),
  selectedColumns: new Set(),
  selectionMode: 'multiple',
  filterCriteria: [],
  
  // Initialize with data tab
  tabs: [{ id: 'data', type: 'spreadsheet', title: 'Data', permanent: true }],
  activeTab: 'data',

  setData: (headers, rows) =>
    set({
      headers,
      data: rows,
      hasData: true,
      enrichmentStatus: {},
      currentTemplate: undefined,
    }),

  setDataFromTemplate: (template, generationMetadata) => {
    // Extract headers from template columns
    const headers = template.columns.map(col => col.name)
    
    // Convert template sample data to array format
    const data = template.sampleData.map(row => 
      headers.map(header => String(row[header] ?? ''))
    )

    set({
      headers,
      data,
      hasData: true,
      selectedCells: new Set(),
      cellExplanations: {},
      currentTemplate: template,
      enrichmentStatus: {},
      generationMetadata: generationMetadata || undefined,
    })
  },

  updateCell: (rowIndex, colIndex, value) => {
    const state = get()
    const oldValue = state.data[rowIndex]?.[colIndex] || ''
    
    // Track in history
    useHistoryStore.getState().pushHistory({
      type: 'cell_update',
      timestamp: Date.now(),
      data: {
        rowIndex,
        colIndex,
        oldValue,
        newValue: value,
        header: state.headers[colIndex]
      },
      description: `Updated cell at row ${rowIndex + 1}, column "${state.headers[colIndex]}"`
    })
    
    set((state) => {
      const newData = [...state.data]
      newData[rowIndex] = [...newData[rowIndex]]
      newData[rowIndex][colIndex] = value
      return { data: newData }
    })
  },

  addColumn: (header) => {
    const state = get()
    const newColumnIndex = state.headers.length
    
    // Track in history
    useHistoryStore.getState().pushHistory({
      type: 'column_add',
      timestamp: Date.now(),
      data: {
        columnIndex: newColumnIndex,
        header,
        previousHeaders: [...state.headers],
        previousData: state.data.map(row => [...row])
      },
      description: `Added column "${header}"`
    })
    
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

  insertColumnBefore: (index, header) =>
    set((state) => {
      const newHeaders = [...state.headers]
      newHeaders.splice(index, 0, header)
      
      const newData = state.data.map(row => {
        const newRow = [...row]
        newRow.splice(index, 0, "")
        return newRow
      })
      
      // Shift enrichment configs for columns after the insertion point
      const newConfigs: Record<number, ColumnEnrichmentConfig> = {}
      Object.entries(state.columnEnrichmentConfigs).forEach(([colIndexStr, config]) => {
        const colIndex = parseInt(colIndexStr)
        if (colIndex >= index) {
          newConfigs[colIndex + 1] = { ...config, columnIndex: colIndex + 1 }
        } else {
          newConfigs[colIndex] = config
        }
      })
      
      return {
        headers: newHeaders,
        data: newData,
        columnEnrichmentConfigs: newConfigs
      }
    }),

  insertColumnAfter: (index, header) =>
    set((state) => {
      const insertIndex = index + 1
      const newHeaders = [...state.headers]
      newHeaders.splice(insertIndex, 0, header)
      
      const newData = state.data.map(row => {
        const newRow = [...row]
        newRow.splice(insertIndex, 0, "")
        return newRow
      })
      
      // Shift enrichment configs for columns after the insertion point
      const newConfigs: Record<number, ColumnEnrichmentConfig> = {}
      Object.entries(state.columnEnrichmentConfigs).forEach(([colIndexStr, config]) => {
        const colIndex = parseInt(colIndexStr)
        if (colIndex >= insertIndex) {
          newConfigs[colIndex + 1] = { ...config, columnIndex: colIndex + 1 }
        } else {
          newConfigs[colIndex] = config
        }
      })
      
      return {
        headers: newHeaders,
        data: newData,
        columnEnrichmentConfigs: newConfigs
      }
    }),

  deleteColumn: (index) =>
    set((state) => {
      const newHeaders = state.headers.filter((_, i) => i !== index)
      const newData = state.data.map(row => row.filter((_, i) => i !== index))
      
      // Update enrichment configs - remove deleted column and shift indices
      const newConfigs: Record<number, ColumnEnrichmentConfig> = {}
      Object.entries(state.columnEnrichmentConfigs).forEach(([colIndexStr, config]) => {
        const colIndex = parseInt(colIndexStr)
        if (colIndex < index) {
          newConfigs[colIndex] = config
        } else if (colIndex > index) {
          newConfigs[colIndex - 1] = { ...config, columnIndex: colIndex - 1 }
        }
        // Skip the deleted column (colIndex === index)
      })
      
      return {
        headers: newHeaders,
        data: newData,
        columnEnrichmentConfigs: newConfigs
      }
    }),

  renameColumn: (index, newName) =>
    set((state) => {
      const newHeaders = [...state.headers]
      newHeaders[index] = newName
      
      // Update enrichment config with new column name
      const newConfigs = { ...state.columnEnrichmentConfigs }
      if (newConfigs[index]) {
        newConfigs[index] = { ...newConfigs[index], columnName: newName }
      }
      
      return {
        headers: newHeaders,
        columnEnrichmentConfigs: newConfigs
      }
    }),
  
  addRow: () =>
    set((state) => ({
      data: [...state.data, new Array(state.headers.length).fill('')]
    })),

  clearData: () =>
    set({
      headers: [],
      data: [],
      hasData: false,
      enrichmentStatus: {},
    }),

  enrichColumn: async (columnIndex, prompt, contextColumns) => {
    const { data, headers, columnEnrichmentConfigs, getCellAttachments } = get()

    // Set enrichment status
    set((state) => ({
      enrichmentStatus: {
        ...state.enrichmentStatus,
        [columnIndex]: { enriching: true, prompt, currentRow: 0 },
      },
    }))

    const columnConfig = columnEnrichmentConfigs[columnIndex]

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
        
        // Get attachment context for this specific row
        let attachmentContext = ""
        const cellAttachments = getCellAttachments(rowIndex, columnIndex)
        
        // Prioritize cell attachments, fall back to column attachments
        if (cellAttachments.length > 0) {
          attachmentContext = prepareAttachmentContext(cellAttachments)
        } else if (columnConfig?.useAttachmentsAsContext && columnConfig.attachments) {
          attachmentContext = prepareAttachmentContext(columnConfig.attachments)
        }

        const currentValue = data[rowIndex][columnIndex] || ""
        const result = await enrichCellWithContext(rowContext, currentValue, prompt, headers, undefined, attachmentContext)
        const enrichedValue = result.value

        // Update the cell with enriched value and metadata
        set((state) => {
          const newData = [...state.data]
          newData[rowIndex] = [...newData[rowIndex]]
          newData[rowIndex][columnIndex] = enrichedValue
          
          const updates: any = { data: newData }
          if (result.process) {
            const cellKey = `${rowIndex}-${columnIndex}`
            const newMetadata = new Map(state.cellMetadata)
            newMetadata.set(cellKey, {
              query: result.process.query,
              response: result.process.response,
              citations: result.process.citations,
              timestamp: result.process.timestamp,
              isEnriched: true,
              provider: result.process.provider,
              model: result.process.model,
              confidence: result.process.confidence,
              status: result.process.status,
              verification: result.process.verification,
              entity: result.process.entity,
              routerType: result.process.routerType,
              estimatedCost: result.process.estimatedCost
            })
            updates.cellMetadata = newMetadata
          }
          
          return updates
        })

        // Small delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    } catch (error) {
      // Enrichment failed
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
    const { data, headers, columnEnrichmentConfigs, getCellAttachments } = get()
    
    // Use provided prompt or get from column config
    const enrichmentPrompt = prompt || columnEnrichmentConfigs[columnIndex]?.prompt
    if (!enrichmentPrompt) {
      // No prompt provided for enrichment
      return
    }

    // Get both cell and column attachment context
    let attachmentContext = ""
    const cellAttachments = getCellAttachments(rowIndex, columnIndex)
    const columnConfig = columnEnrichmentConfigs[columnIndex]
    
    // Prioritize cell attachments, fall back to column attachments
    if (cellAttachments.length > 0) {
      attachmentContext = prepareAttachmentContext(cellAttachments)
    } else if (columnConfig?.useAttachmentsAsContext && columnConfig.attachments) {
      attachmentContext = prepareAttachmentContext(columnConfig.attachments)
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
      const result = await enrichCellWithContext(rowContext, primaryValue, enrichmentPrompt, headers, undefined, attachmentContext)

      // Update the cell and metadata
      set((state) => {
        const newData = [...state.data]
        newData[rowIndex] = [...newData[rowIndex]]
        newData[rowIndex][columnIndex] = result.value
        
        // Store cell metadata if process information is available
        const updates: any = { data: newData }
        if (result.process) {
          const cellKey = `${rowIndex}-${columnIndex}`
          const newMetadata = new Map(state.cellMetadata)
          newMetadata.set(cellKey, {
            query: result.process.query,
            response: result.process.response,
            citations: result.process.citations,
            timestamp: result.process.timestamp,
            isEnriched: true,
            provider: result.process.provider,
            model: result.process.model,
            confidence: result.process.confidence,
            status: result.process.status,
            verification: result.process.verification,
            entity: result.process.entity,
            routerType: result.process.routerType,
            estimatedCost: result.process.estimatedCost
          })
          updates.cellMetadata = newMetadata
        }
        
        return updates
      })
    } catch (error) {
      // Single cell enrichment failed
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
      // No prompt provided for enrichment
      return
    }

    // Get attachment context if enabled for this column
    let attachmentContext = ""
    const config = columnEnrichmentConfigs[columnIndex]
    if (config?.useAttachmentsAsContext && config.attachments) {
      attachmentContext = prepareAttachmentContext(config.attachments)
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
        const result = await enrichCellWithContext(rowContext, primaryValue, enrichmentPrompt, headers, undefined, attachmentContext)
        const enrichedValue = result.value

        // Update the cell and metadata
        set((state) => {
          const newData = [...state.data]
          newData[rowIndex] = [...newData[rowIndex]]
          newData[rowIndex][columnIndex] = enrichedValue
          
          const updates: any = { data: newData }
          if (result.process) {
            const cellKey = `${rowIndex}-${columnIndex}`
            const newMetadata = new Map(state.cellMetadata)
            newMetadata.set(cellKey, {
              query: result.process.query,
              response: result.process.response,
              citations: result.process.citations,
              timestamp: result.process.timestamp,
              isEnriched: true,
              provider: result.process.provider,
              model: result.process.model,
              confidence: result.process.confidence,
              status: result.process.status,
              verification: result.process.verification,
              entity: result.process.entity,
              routerType: result.process.routerType,
              estimatedCost: result.process.estimatedCost
            })
            updates.cellMetadata = newMetadata
          }
          
          return updates
        })

        // Small delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    } catch (error) {
      // Selected cells enrichment failed
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
      // Column has no enrichment configuration
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

  // Attachment methods implementation
  addColumnAttachment: (columnIndex, attachment) =>
    set((state) => {
      const config = state.columnEnrichmentConfigs[columnIndex] || {
        columnIndex,
        columnName: state.headers[columnIndex],
        prompt: '',
        formatMode: 'strict' as FormatMode,
        isConfigured: false,
        attachments: []
      }
      
      return {
        columnEnrichmentConfigs: {
          ...state.columnEnrichmentConfigs,
          [columnIndex]: {
            ...config,
            attachments: [...(config.attachments || []), attachment]
          }
        }
      }
    }),

  removeColumnAttachment: (columnIndex, attachmentId) =>
    set((state) => {
      const config = state.columnEnrichmentConfigs[columnIndex]
      if (!config || !config.attachments) return state
      
      return {
        columnEnrichmentConfigs: {
          ...state.columnEnrichmentConfigs,
          [columnIndex]: {
            ...config,
            attachments: config.attachments.filter(a => a.id !== attachmentId)
          }
        }
      }
    }),

  getColumnAttachments: (columnIndex) => {
    const { columnEnrichmentConfigs } = get()
    const config = columnEnrichmentConfigs[columnIndex]
    return config?.attachments || []
  },

  toggleAttachmentContext: (columnIndex, useAttachments) =>
    set((state) => {
      const config = state.columnEnrichmentConfigs[columnIndex]
      if (!config) return state
      
      return {
        columnEnrichmentConfigs: {
          ...state.columnEnrichmentConfigs,
          [columnIndex]: {
            ...config,
            useAttachmentsAsContext: useAttachments
          }
        }
      }
    }),

  // Cell attachment methods implementation
  addCellAttachment: (rowIndex, columnIndex, attachment) =>
    set((state) => {
      const cellKey = `${rowIndex}-${columnIndex}`
      const currentAttachments = state.cellAttachments.get(cellKey) || []
      const newMap = new Map(state.cellAttachments)
      newMap.set(cellKey, [...currentAttachments, attachment])
      return { cellAttachments: newMap }
    }),

  removeCellAttachment: (rowIndex, columnIndex, attachmentId) =>
    set((state) => {
      const cellKey = `${rowIndex}-${columnIndex}`
      const currentAttachments = state.cellAttachments.get(cellKey) || []
      const filtered = currentAttachments.filter(a => a.id !== attachmentId)
      const newMap = new Map(state.cellAttachments)
      
      if (filtered.length === 0) {
        newMap.delete(cellKey)
      } else {
        newMap.set(cellKey, filtered)
      }
      
      return { cellAttachments: newMap }
    }),

  getCellAttachments: (rowIndex, columnIndex) => {
    const { cellAttachments } = get()
    const cellKey = `${rowIndex}-${columnIndex}`
    return cellAttachments.get(cellKey) || []
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
        
        const result = await enrichCellWithContext(rowContext, primaryValue, prompt, headers, customFormat)
        const enrichedValue = result.value

        // Update the new column with enriched value and metadata
        set((state) => {
          const newData = [...state.data]
          newData[rowIndex] = [...newData[rowIndex]]
          newData[rowIndex][newColumnIndex] = enrichedValue
          
          const updates: any = { data: newData }
          if (result.process) {
            const cellKey = `${rowIndex}-${newColumnIndex}`
            const newMetadata = new Map(state.cellMetadata)
            newMetadata.set(cellKey, {
              query: result.process.query,
              response: result.process.response,
              citations: result.process.citations,
              timestamp: result.process.timestamp,
              isEnriched: true,
              provider: result.process.provider,
              model: result.process.model,
              confidence: result.process.confidence,
              status: result.process.status,
              verification: result.process.verification,
              entity: result.process.entity,
              routerType: result.process.routerType,
              estimatedCost: result.process.estimatedCost
            })
            updates.cellMetadata = newMetadata
          }
          
          return updates
        })

        // Small delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    } catch (error) {
      // Enrichment failed
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

  getCellMetadata: (rowIndex, colIndex) => {
    const key = `${rowIndex}-${colIndex}`
    return get().cellMetadata.get(key)
  },
  
  getGenerationMetadata: () => {
    return get().generationMetadata
  },
  
  // Tab management methods
  addTab: (tab) =>
    set((state) => ({
      tabs: [...state.tabs, tab],
      activeTab: tab.id // Automatically switch to new tab
    })),
  
  removeTab: (tabId) =>
    set((state) => {
      const newTabs = state.tabs.filter(t => t.id !== tabId)
      const newActiveTab = state.activeTab === tabId 
        ? 'data' // Return to data tab if closing active tab
        : state.activeTab
      return {
        tabs: newTabs,
        activeTab: newActiveTab
      }
    }),
  
  setActiveTab: (tabId) =>
    set({ activeTab: tabId }),
  
  getTab: (tabId) => {
    return get().tabs.find(t => t.id === tabId)
  },
  
  updateTab: (tabId, updates) =>
    set((state) => ({
      tabs: state.tabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, ...updates }
          : tab
      )
    })),

  // Undo/Redo Implementation
  undo: () => {
    const historyStore = useHistoryStore.getState()
    const entry = historyStore.undo()
    
    if (!entry) return
    
    const state = get()
    
    switch (entry.type) {
      case 'cell_update':
        // Restore previous cell value
        const { rowIndex, colIndex, oldValue } = entry.data
        set((state) => {
          const newData = [...state.data]
          newData[rowIndex] = [...newData[rowIndex]]
          newData[rowIndex][colIndex] = oldValue
          return { data: newData }
        })
        break
        
      case 'column_add':
        // Remove the added column
        const { columnIndex } = entry.data
        set((state) => ({
          headers: state.headers.filter((_, i) => i !== columnIndex),
          data: state.data.map(row => row.filter((_, i) => i !== columnIndex))
        }))
        break
        
      case 'column_delete':
        // Restore deleted column
        const { previousHeaders, previousData } = entry.data
        set({
          headers: previousHeaders,
          data: previousData
        })
        break
        
      case 'row_add':
        // Remove the added row
        set((state) => ({
          data: state.data.slice(0, -1)
        }))
        break
        
      case 'bulk_paste':
        // Restore previous data
        const { previousData: prevData } = entry.data
        set({ data: prevData })
        break
    }
  },
  
  redo: () => {
    const historyStore = useHistoryStore.getState()
    const entry = historyStore.redo()
    
    if (!entry) return
    
    const state = get()
    
    switch (entry.type) {
      case 'cell_update':
        // Apply the cell update again
        const { rowIndex, colIndex, newValue } = entry.data
        set((state) => {
          const newData = [...state.data]
          newData[rowIndex] = [...newData[rowIndex]]
          newData[rowIndex][colIndex] = newValue
          return { data: newData }
        })
        break
        
      case 'column_add':
        // Re-add the column
        const { header } = entry.data
        set((state) => ({
          headers: [...state.headers, header],
          data: state.data.map(row => [...row, ""])
        }))
        break
        
      case 'column_delete':
        // Re-delete the column
        const { columnIndex } = entry.data
        set((state) => ({
          headers: state.headers.filter((_, i) => i !== columnIndex),
          data: state.data.map(row => row.filter((_, i) => i !== columnIndex))
        }))
        break
        
      case 'row_add':
        // Re-add the row
        set((state) => ({
          data: [...state.data, new Array(state.headers.length).fill("")]
        }))
        break
        
      case 'bulk_paste':
        // Re-apply the paste
        const { newData } = entry.data
        set({ data: newData })
        break
    }
  },
  
  canUndo: () => useHistoryStore.getState().canUndo(),
  canRedo: () => useHistoryStore.getState().canRedo(),
  
  // Project management
  setCurrentProject: (project) => {
    set({ currentProject: project })
    // Save to localStorage
    const projects = JSON.parse(localStorage.getItem('lighthouse_projects') || '[]')
    const existingIndex = projects.findIndex((p: any) => p.id === project.id)
    if (existingIndex >= 0) {
      projects[existingIndex] = project
    } else {
      projects.push(project)
    }
    localStorage.setItem('lighthouse_projects', JSON.stringify(projects))
  },
  
  updateProjectMetadata: (updates) => {
    const current = get().currentProject
    if (current) {
      const updated = {
        ...current,
        ...updates,
        lastModified: new Date()
      }
      get().setCurrentProject(updated)
    }
  },
  
  saveProjectToStorage: () => {
    const { currentProject, data, headers } = get()
    if (currentProject) {
      const updated = {
        ...currentProject,
        lastModified: new Date(),
        metadata: {
          ...currentProject.metadata,
          rows: data.length,
          columns: headers.length
        }
      }
      get().setCurrentProject(updated)
    }
  },
}))

async function enrichCell(value: string, prompt: string): Promise<string> {
  try {
    // Enriching cell with value and prompt

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

    // API response status

    if (!response.ok) {
      const errorText = await response.text()
      // API error response
      throw new Error(`API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    // API response data

    if (!data.enrichedValue) {
      throw new Error("No enriched value returned from API")
    }

    return data.enrichedValue
  } catch (error) {
    // Error enriching cell
    throw new Error(`Failed to enrich cell: ${error.message}`)
  }
}

async function enrichCellWithContext(
  rowContext: Record<string, string>,
  primaryValue: string,
  prompt: string,
  headers: string[],
  customFormat?: CustomFormat,
  attachmentContext?: string
): Promise<{ value: string; process?: { 
  query: string; 
  response: string; 
  citations?: Array<{ uri: string; title: string; snippet?: string }>; 
  timestamp: string;
  provider?: string;
  model?: string;
  confidence?: number;
  status?: string;
  verification?: Record<string, unknown>;
  entity?: string;
  routerType?: string;
  estimatedCost?: number;
} }> {
  try {
    // Replace column placeholders in prompt with actual values
    let processedPrompt = prompt
    headers.forEach((header) => {
      if (header && rowContext[header]) {
        const placeholder = new RegExp(`\\{${header}\\}`, 'gi')
        processedPrompt = processedPrompt.replace(placeholder, rowContext[header])
      }
    })

    // Enriching with row context and prompt
    if (attachmentContext) {
      // Using attachment context
    }

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
        attachmentContext,
      }),
    })

    // API response status

    if (!response.ok) {
      const errorText = await response.text()
      // API error response
      throw new Error(`API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    // API response data

    if (!data.enrichedValue) {
      throw new Error("No enriched value returned from API")
    }

    return { 
      value: data.enrichedValue,
      process: data.process 
    }
  } catch (error) {
    // Error enriching cell with context
    throw new Error(`Failed to enrich cell: ${error.message}`)
  }
}
