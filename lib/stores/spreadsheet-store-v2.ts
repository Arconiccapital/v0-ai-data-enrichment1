import { useDataStore } from './data-store'
import { useEnrichmentStore } from './enrichment-store'
import { useSelectionStore } from './selection-store'
import { useAttachmentStore } from './attachment-store'
import { useMetadataStore } from './metadata-store'
import { prepareAttachmentContext } from '../context-manager'
import type { ColumnEnrichmentConfig } from '../types/enrichment'
import type { ColumnAttachment } from '../types/attachments'

// This is the main interface that combines all stores
// It provides the same API as the original spreadsheet store for backward compatibility
export function useSpreadsheetStoreV2() {
  const dataStore = useDataStore()
  const enrichmentStore = useEnrichmentStore()
  const selectionStore = useSelectionStore()
  const attachmentStore = useAttachmentStore()
  const metadataStore = useMetadataStore()
  
  // Enrichment operations that require coordination between stores
  const enrichColumn = async (
    columnIndex: number,
    prompt: string,
    contextColumns?: Set<number>
  ) => {
    const { data, headers } = dataStore
    
    if (columnIndex < 0 || columnIndex >= headers.length) {
      console.error('Invalid column index')
      return
    }
    
    enrichmentStore.setEnrichmentStatus(columnIndex, {
      enriching: true,
      currentRow: 0,
      prompt
    })
    
    // Store the configuration
    enrichmentStore.storeColumnEnrichmentConfig(columnIndex, {
      prompt,
      contextColumns: contextColumns || new Set(),
      useAttachments: attachmentStore.shouldUseAttachments(columnIndex),
      isConfigured: true
    })
    
    // Process each row sequentially
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      enrichmentStore.setEnrichmentStatus(columnIndex, {
        enriching: true,
        currentRow: rowIndex,
        prompt
      })
      
      try {
        // Prepare context from other columns
        const contextData: Record<string, string> = {}
        headers.forEach((header, index) => {
          if (contextColumns?.has(index) || !contextColumns) {
            contextData[header] = data[rowIndex][index] || ''
          }
        })
        
        // Get attachments for context
        const attachments = attachmentStore.getAllAttachmentsForContext(rowIndex, columnIndex)
        const attachmentContext = prepareAttachmentContext(attachments)
        
        // Call enrichment API
        const response = await fetch('/api/enrich', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            context: contextData,
            currentValue: data[rowIndex][columnIndex] || '',
            rowContext: data[rowIndex],
            headers,
            attachmentContext
          })
        })
        
        const result = await response.json()
        
        if (result.success) {
          dataStore.updateCell(rowIndex, columnIndex, result.data)
          
          if (result.explanation) {
            metadataStore.setCellExplanation(rowIndex, columnIndex, result.explanation)
          }
          
          if (result.metadata) {
            metadataStore.setCellMetadata(rowIndex, columnIndex, result.metadata)
          }
        }
      } catch (error) {
        console.error(`Failed to enrich row ${rowIndex}:`, error)
      }
    }
    
    enrichmentStore.clearEnrichmentStatus(columnIndex)
  }
  
  const enrichSingleCell = async (
    rowIndex: number,
    columnIndex: number,
    prompt?: string,
    contextColumns?: Set<number>
  ) => {
    const { data, headers } = dataStore
    const config = enrichmentStore.getColumnEnrichmentConfig(columnIndex)
    const finalPrompt = prompt || config?.prompt || ''
    const finalContextColumns = contextColumns || config?.contextColumns
    
    enrichmentStore.setEnrichmentStatus(columnIndex, {
      enriching: true,
      currentRow: rowIndex,
      prompt: finalPrompt
    })
    
    try {
      const contextData: Record<string, string> = {}
      headers.forEach((header, index) => {
        if (finalContextColumns?.has(index) || !finalContextColumns) {
          contextData[header] = data[rowIndex][index] || ''
        }
      })
      
      const attachments = attachmentStore.getAllAttachmentsForContext(rowIndex, columnIndex)
      const attachmentContext = prepareAttachmentContext(attachments)
      
      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          context: contextData,
          currentValue: data[rowIndex][columnIndex] || '',
          rowContext: data[rowIndex],
          headers,
          attachmentContext
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        dataStore.updateCell(rowIndex, columnIndex, result.data)
        
        if (result.explanation) {
          metadataStore.setCellExplanation(rowIndex, columnIndex, result.explanation)
        }
        
        if (result.metadata) {
          metadataStore.setCellMetadata(rowIndex, columnIndex, result.metadata)
        }
      }
    } catch (error) {
      console.error('Failed to enrich cell:', error)
    } finally {
      enrichmentStore.clearEnrichmentStatus(columnIndex)
    }
  }
  
  const enrichSelectedCells = async (
    columnIndex: number,
    selectedRows: Set<number>,
    prompt?: string,
    contextColumns?: Set<number>
  ) => {
    const config = enrichmentStore.getColumnEnrichmentConfig(columnIndex)
    const finalPrompt = prompt || config?.prompt || ''
    const finalContextColumns = contextColumns || config?.contextColumns
    
    for (const rowIndex of Array.from(selectedRows)) {
      await enrichSingleCell(rowIndex, columnIndex, finalPrompt, finalContextColumns)
    }
  }
  
  const enrichExistingColumn = async (
    columnIndex: number,
    scope: 'cell' | 'selected' | 'all',
    selectedRows?: Set<number>,
    rowIndex?: number
  ) => {
    const config = enrichmentStore.getColumnEnrichmentConfig(columnIndex)
    if (!config) {
      console.error('No enrichment configuration found for column')
      return
    }
    
    switch (scope) {
      case 'cell':
        if (rowIndex !== undefined) {
          await enrichSingleCell(rowIndex, columnIndex)
        }
        break
      case 'selected':
        if (selectedRows && selectedRows.size > 0) {
          await enrichSelectedCells(columnIndex, selectedRows)
        }
        break
      case 'all':
        await enrichColumn(columnIndex, config.prompt, config.contextColumns)
        break
    }
  }
  
  // Return the combined interface
  return {
    // Data operations
    ...dataStore,
    
    // Enrichment operations
    enrichmentStatus: enrichmentStore.enrichmentStatus,
    columnEnrichmentConfigs: enrichmentStore.columnEnrichmentConfigs,
    storeColumnEnrichmentConfig: enrichmentStore.storeColumnEnrichmentConfig,
    getColumnEnrichmentConfig: enrichmentStore.getColumnEnrichmentConfig,
    enrichColumn,
    enrichSingleCell,
    enrichSelectedCells,
    enrichExistingColumn,
    
    // Selection operations
    selectedCells: selectionStore.selectedCells,
    selectedRows: selectionStore.selectedRows,
    selectedColumns: selectionStore.selectedColumns,
    selectedCell: selectionStore.selectedCell,
    toggleCellSelection: selectionStore.toggleCellSelection,
    toggleRowSelection: selectionStore.toggleRowSelection,
    toggleColumnSelection: selectionStore.toggleColumnSelection,
    selectAllRows: selectionStore.selectAllRows,
    clearSelection: selectionStore.clearSelection,
    setSelectedCell: selectionStore.setSelectedCell,
    getSelectedData: selectionStore.getSelectedData,
    
    // Attachment operations
    cellAttachments: attachmentStore.cellAttachments,
    columnAttachments: attachmentStore.columnAttachments,
    columnAttachmentContext: attachmentStore.columnAttachmentContext,
    addCellAttachment: attachmentStore.addCellAttachment,
    removeCellAttachment: attachmentStore.removeCellAttachment,
    getCellAttachments: attachmentStore.getCellAttachments,
    addColumnAttachment: attachmentStore.addColumnAttachment,
    removeColumnAttachment: attachmentStore.removeColumnAttachment,
    getColumnAttachments: attachmentStore.getColumnAttachments,
    toggleAttachmentContext: attachmentStore.toggleAttachmentContext,
    
    // Metadata operations
    cellExplanations: metadataStore.cellExplanations,
    cellMetadata: metadataStore.cellMetadata,
    generationMetadata: metadataStore.generationMetadata,
    getCellExplanation: metadataStore.getCellExplanation,
    getCellMetadata: metadataStore.getCellMetadata,
    getGenerationMetadata: () => metadataStore.generationMetadata,
    setGenerationMetadata: metadataStore.setGenerationMetadata,
    
    // Combined operations
    clearAll: () => {
      dataStore.clearData()
      selectionStore.clearSelection()
      attachmentStore.clearAllAttachments()
      metadataStore.clearAllMetadata()
    }
  }
}