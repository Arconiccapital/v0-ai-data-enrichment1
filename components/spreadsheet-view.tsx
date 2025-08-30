"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AddColumnDialog } from "@/components/add-column-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkles, Plus, Loader2, Info, X, Settings, Zap, Play, Filter, Paperclip } from "lucide-react"
import { SpreadsheetCell } from "./spreadsheet-cell"
import { useEnhancedClipboard } from "@/hooks/useEnhancedClipboard"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { AIEnrichmentDialog } from "@/components/dialogs/ai-enrichment-dialog"
import { DataAnalysisDialog } from "@/components/dialogs/data-analysis-dialog"
import { SmartSelectionDialog } from "@/components/dialogs/smart-selection-dialog"
import { GenerationInfoBanner } from "@/components/generation-info-banner"
import { ColumnAttachmentManager } from "@/components/column-attachment-manager"
import { CellAttachmentManager } from "@/components/cell-attachment-manager"
import { cn } from "@/lib/utils"

interface SpreadsheetViewProps {
  activeWorkflowStep?: string | null
}

export function SpreadsheetView({ }: SpreadsheetViewProps) {
  const { 
    headers, 
    data, 
    updateCell, 
    enrichmentStatus, 
    addColumn,
    addRow,
    insertColumnBefore,
    insertColumnAfter,
    deleteColumn,
    renameColumn,
    selectedRows,
    selectedColumns,
    toggleRowSelection,
    selectAllRows,
    clearSelection,
    getSelectedData,
    columnEnrichmentConfigs,
    selectedCells,
    toggleCellSelection,
    getCellExplanation,
    getCellAttachments,
    getCellMetadata,
    getGenerationMetadata
  } = useSpreadsheetStore()
  const { getColumnAttachments } = useSpreadsheetStore()
  const enhancedClipboard = useEnhancedClipboard()
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [enrichmentDialogOpen, setEnrichmentDialogOpen] = useState(false)
  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false)
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false)
  const [attachmentManagerOpen, setAttachmentManagerOpen] = useState(false)
  const [attachmentColumnIndex, setAttachmentColumnIndex] = useState<number | null>(null)
  const [cellAttachmentOpen, setCellAttachmentOpen] = useState(false)
  const [selectedCellForAttachment, setSelectedCellForAttachment] = useState<{row: number, col: number} | null>(null)
  const [smartSelectionOpen, setSmartSelectionOpen] = useState(false)
  const [enrichmentColumnIndex, setEnrichmentColumnIndex] = useState<number | undefined>()
  const [enrichmentScope, setEnrichmentScope] = useState<'cell' | 'selected' | 'all'>('all')
  const [currentEnrichRow, setCurrentEnrichRow] = useState<number | undefined>()
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({})
  const [, setResizingColumn] = useState<number | null>(null)
  const [showGenerationInfo, setShowGenerationInfo] = useState(true)

  // Keyboard shortcuts and paste handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.userAgent.toUpperCase().indexOf('MAC') >= 0
      const modifier = isMac ? e.metaKey : e.ctrlKey
      
      if (modifier) {
        // Copy/paste/cut operations
        if (e.key === 'c' && (selectedCells.size > 0 || selectedCell)) {
          e.preventDefault()
          enhancedClipboard.copySelection(selectedCell || undefined)
        } else if (e.key === 'x' && (selectedCells.size > 0 || selectedCell)) {
          e.preventDefault()
          enhancedClipboard.cut(selectedCell || undefined)
        }
        // Select all cells with Cmd/Ctrl + A
        else if (e.key === 'a') {
          e.preventDefault()
          // Select all cells in the table
          const allCells = new Set<string>()
          for (let r = 0; r < data.length; r++) {
            for (let c = 0; c < headers.length; c++) {
              allCells.add(`${r}-${c}`)
            }
          }
          // This would need a new method in the store to set selectedCells directly
          selectAllRows()
        }
      }
      
      // Add row with Enter or Tab in last cell
      if (selectedCell && selectedCell.row === data.length - 1) {
        if (e.key === 'Enter' || (e.key === 'Tab' && selectedCell.col === headers.length - 1)) {
          e.preventDefault()
          addRow()
          // Move to first cell of new row
          handleCellClick(data.length, 0)
        }
      }
    }
    
    const handlePaste = (e: ClipboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA') {
        return // Don't intercept paste in input fields
      }
      
      if (selectedCell || selectedCells.size > 0) {
        enhancedClipboard.handlePasteEvent(e, selectedCell || undefined)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('paste', handlePaste)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('paste', handlePaste)
    }
  }, [selectedCell, selectedCells, data.length, headers.length, enhancedClipboard, addRow])
  
  const hasSelection = selectedRows.size > 0 || selectedColumns.size > 0
  const selectedRowCount = selectedRows.size
  const selectedColumnCount = selectedColumns.size

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setSelectedCell({ row: rowIndex, col: colIndex })
  }

  const handleCellChange = (value: string, rowIndex: number, colIndex: number) => {
    updateCell(rowIndex, colIndex, value)
  }

  // Copy/Paste/Cut handlers
  const handleCopyCell = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      // You could show a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handlePasteCell = async (rowIndex: number, colIndex: number) => {
    try {
      const text = await navigator.clipboard.readText()
      handleCellChange(text, rowIndex, colIndex)
    } catch (err) {
      console.error('Failed to paste:', err)
    }
  }

  const handleCutCell = async (rowIndex: number, colIndex: number) => {
    const value = data[rowIndex][colIndex]
    await handleCopyCell(value)
    handleCellChange("", rowIndex, colIndex)
  }

  const handleManageCellAttachments = (rowIndex: number, colIndex: number) => {
    setSelectedCellForAttachment({ row: rowIndex, col: colIndex })
    setCellAttachmentOpen(true)
  }

  const isCellEnriching = (rowIndex: number, colIndex: number) => {
    return enrichmentStatus[colIndex]?.enriching && enrichmentStatus[colIndex]?.currentRow === rowIndex
  }


  const handleOpenEnrichmentForColumn = (colIndex: number, scope: 'cell' | 'selected' | 'all', rowIndex?: number) => {
    setEnrichmentColumnIndex(colIndex)
    setEnrichmentScope(scope)
    setCurrentEnrichRow(rowIndex)
    setEnrichmentDialogOpen(true)
  }

  const handleOpenAttachmentManager = (colIndex: number) => {
    setAttachmentColumnIndex(colIndex)
    setAttachmentManagerOpen(true)
  }

  const generationMetadata = getGenerationMetadata()
  const selectedColumnName = selectedCell ? headers[selectedCell.col] || "" : ""

  return (
    <div className="flex h-full bg-white overflow-hidden">
      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 transition-all duration-300 w-full">
        {/* Generation Info Banner */}
        {generationMetadata && showGenerationInfo && (
          <GenerationInfoBanner 
            metadata={generationMetadata}
            onDismiss={() => setShowGenerationInfo(false)}
          />
        )}
        
        {/* Status Bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                {data.length} rows × {headers.length} columns
              </Badge>
              {hasSelection && (
                <>
                  <Badge variant="secondary" className="text-xs">
                    {selectedRowCount} {selectedRowCount === 1 ? 'row' : 'rows'} selected
                  </Badge>
                  {selectedColumnCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedColumnCount} {selectedColumnCount === 1 ? 'column' : 'columns'}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="h-8 md:h-6 text-sm md:text-xs min-w-[44px] md:min-w-0"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSmartSelectionOpen(true)}
              className="h-8 md:h-6 text-sm md:text-xs min-w-[44px] md:min-w-0"
            >
              <Filter className="h-3 w-3 mr-1" />
              Smart Select
            </Button>
          </div>
        </div>



        <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-auto relative">
            <div className="min-w-full overflow-x-auto">
              <table className="w-full border-collapse bg-white" style={{ tableLayout: 'fixed' }} tabIndex={0}>
                <thead className="sticky top-0 z-20">
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-center border-r border-gray-200 bg-white sticky left-0 z-30" style={{ width: '40px', height: '48px', boxSizing: 'border-box' }}>
                      <Checkbox
                        checked={selectedRows.size === data.length && data.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            selectAllRows()
                          } else {
                            clearSelection()
                          }
                        }}
                      />
                    </th>
                    <th className="text-center text-xs font-medium text-gray-600 border-r border-gray-200 bg-white sticky left-[40px] z-30" style={{ width: '48px', height: '48px', boxSizing: 'border-box' }}>
                      #
                    </th>
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className="h-12 px-2 sm:px-4 text-left text-xs sm:text-sm font-semibold text-gray-900 border-r border-gray-200 bg-gray-50 group hover:bg-gray-100 transition-colors relative min-w-[100px] overflow-visible"
                        style={{ width: `${columnWidths[index] || 200}px` }}
                      >
                        <ContextMenu>
                          <ContextMenuTrigger asChild>
                            <div className="relative h-full flex items-center">
                              <div 
                                className="flex items-center gap-2 cursor-pointer flex-1"
                                onClick={() => handleOpenEnrichmentForColumn(index, 'all')}
                              >
                                <span className="truncate flex-1">{header}</span>
                                {getColumnAttachments(index).length > 0 && (
                                  <Badge variant="secondary" className="h-5 px-1 text-[10px] flex items-center gap-1">
                                    <Paperclip className="h-2.5 w-2.5" />
                                    {getColumnAttachments(index).length}
                                  </Badge>
                                )}
                                {columnEnrichmentConfigs[index]?.isConfigured && (
                                  <Zap className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                                )}
                                {enrichmentStatus[index]?.enriching && (
                                  <Loader2 className="h-4 w-4 animate-spin text-blue-600 flex-shrink-0" />
                                )}
                                {!columnEnrichmentConfigs[index]?.isConfigured && !enrichmentStatus[index]?.enriching && (
                                  <Sparkles className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                )}
                                {columnEnrichmentConfigs[index]?.isConfigured && !enrichmentStatus[index]?.enriching && (
                                  <Play className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                )}
                              </div>
                              {/* Column resize handle */}
                              <div
                                className="absolute -right-[1px] top-0 h-full w-[3px] cursor-col-resize hover:bg-blue-500 transition-colors z-10"
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setResizingColumn(index)
                                  const startX = e.clientX
                                  const startWidth = columnWidths[index] || 200
                                  
                                  const handleMouseMove = (e: MouseEvent) => {
                                    const diff = e.clientX - startX
                                    const newWidth = Math.max(100, startWidth + diff)
                                    setColumnWidths(prev => ({ ...prev, [index]: newWidth }))
                                  }
                                  
                                  const handleMouseUp = () => {
                                    setResizingColumn(null)
                                    document.removeEventListener('mousemove', handleMouseMove)
                                    document.removeEventListener('mouseup', handleMouseUp)
                                  }
                                  
                                  document.addEventListener('mousemove', handleMouseMove)
                                  document.addEventListener('mouseup', handleMouseUp)
                                }}
                              />
                            </div>
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                            <ContextMenuLabel>{header}</ContextMenuLabel>
                            <ContextMenuSeparator />
                            
                            {/* Column Operations */}
                            <ContextMenuItem onClick={() => {
                              const newName = prompt('Enter new column name:', header)
                              if (newName && newName.trim() && newName.trim() !== header) {
                                renameColumn(index, newName.trim())
                              }
                            }}>
                              <Settings className="h-4 w-4 mr-2" />
                              Rename Column
                            </ContextMenuItem>
                            
                            <ContextMenuItem onClick={() => {
                              const newColumnName = prompt('Enter new column name:')
                              if (newColumnName && newColumnName.trim()) {
                                insertColumnBefore(index, newColumnName.trim())
                              }
                            }}>
                              <Plus className="h-4 w-4 mr-2" />
                              Insert Column Before
                            </ContextMenuItem>
                            
                            <ContextMenuItem onClick={() => {
                              const newColumnName = prompt('Enter new column name:')
                              if (newColumnName && newColumnName.trim()) {
                                insertColumnAfter(index, newColumnName.trim())
                              }
                            }}>
                              <Plus className="h-4 w-4 mr-2" />
                              Insert Column After
                            </ContextMenuItem>
                            
                            <ContextMenuItem 
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete the column "${header}"? This action cannot be undone.`)) {
                                  deleteColumn(index)
                                }
                              }}
                              className="text-red-600"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Delete Column
                            </ContextMenuItem>
                            
                            <ContextMenuSeparator />
                            
                            {/* Attachment Management */}
                            <ContextMenuItem onClick={() => handleOpenAttachmentManager(index)}>
                              <Paperclip className="h-4 w-4 mr-2" />
                              Manage Attachments {getColumnAttachments(index).length > 0 && `(${getColumnAttachments(index).length})`}
                            </ContextMenuItem>
                            
                            <ContextMenuSeparator />
                            
                            {/* Enrichment Operations */}
                            <ContextMenuItem onClick={() => handleOpenEnrichmentForColumn(index, 'all')}>
                              <Sparkles className="h-4 w-4 mr-2" />
                              {columnEnrichmentConfigs[index]?.isConfigured ? 'Enrich All Cells' : 'Configure & Enrich'}
                            </ContextMenuItem>
                            {columnEnrichmentConfigs[index]?.isConfigured && (
                              <>
                                <ContextMenuItem onClick={() => handleOpenEnrichmentForColumn(index, 'selected')}>
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Enrich Selected Cells
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem onClick={() => handleOpenEnrichmentForColumn(index, 'all')}>
                                  <Zap className="h-4 w-4 mr-2" />
                                  Edit Enrichment Config
                                </ContextMenuItem>
                              </>
                            )}
                          </ContextMenuContent>
                        </ContextMenu>
                      </th>
                    ))}
                    {/* Add Column Button */}
                    <th 
                      className="h-12 px-4 text-center bg-white hover:bg-gray-50 transition-all cursor-pointer sticky right-0 z-20 shadow-[-2px_0_8px_rgba(0,0,0,0.05)]"
                      style={{ width: '120px', minWidth: '120px' }}
                    >
                      {isAddingColumn ? (
                        <input
                          type="text"
                          className="w-full h-8 px-3 text-sm font-semibold text-gray-900 bg-white border-2 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Column name..."
                          value={newColumnName}
                          onChange={(e) => setNewColumnName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newColumnName.trim()) {
                              addColumn(newColumnName.trim())
                              setNewColumnName("")
                              setIsAddingColumn(false)
                            } else if (e.key === 'Escape') {
                              setNewColumnName("")
                              setIsAddingColumn(false)
                            }
                          }}
                          onBlur={() => {
                            if (newColumnName.trim()) {
                              addColumn(newColumnName.trim())
                            }
                            setNewColumnName("")
                            setIsAddingColumn(false)
                          }}
                          autoFocus
                        />
                      ) : (
                        <button
                          onClick={() => setIsAddingColumn(true)}
                          className="w-full h-full flex items-center justify-center gap-1.5 text-gray-500 hover:text-gray-700 transition-all group"
                        >
                          <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-medium">Column</span>
                        </button>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex} className={cn(
                      "hover:bg-gray-50 border-b border-gray-100",
                      selectedRows.has(rowIndex) && "bg-gray-100"
                    )}>
                      <td className="text-center border-r border-gray-200 bg-white sticky left-0 z-10" style={{ width: '40px', height: '48px', boxSizing: 'border-box' }}>
                        <Checkbox
                          checked={selectedRows.has(rowIndex)}
                          onCheckedChange={() => toggleRowSelection(rowIndex)}
                        />
                      </td>
                      <td className="text-center text-xs font-medium text-gray-600 border-r border-gray-200 bg-white sticky left-[40px] z-10" style={{ width: '48px', height: '48px', boxSizing: 'border-box' }}>
                        {rowIndex + 1}
                      </td>
                      {row.map((cell, colIndex) => (
                        <SpreadsheetCell
                          key={colIndex}
                          value={cell}
                          rowIndex={rowIndex}
                          colIndex={colIndex}
                          isSelected={selectedCell?.row === rowIndex && selectedCell?.col === colIndex}
                          isEnriching={isCellEnriching(rowIndex, colIndex)}
                          isMultiSelected={selectedCells.has(`${rowIndex}-${colIndex}`)}
                          explanation={getCellExplanation(rowIndex, colIndex)}
                          metadata={getCellMetadata(rowIndex, colIndex)}
                          columnWidth={columnWidths[colIndex] || 200}
                          isColumnConfigured={columnEnrichmentConfigs[colIndex]?.isConfigured}
                          attachmentCount={getCellAttachments(rowIndex, colIndex).length}
                          onCellClick={handleCellClick}
                          onCellChange={handleCellChange}
                          onCopyCell={handleCopyCell}
                          onPasteCell={handlePasteCell}
                          onCutCell={handleCutCell}
                          onToggleSelection={toggleCellSelection}
                          onEnrichCell={handleOpenEnrichmentForColumn}
                          onManageAttachments={handleManageCellAttachments}
                        />
                      ))}
                      {/* Empty cell for Add Column alignment */}
                      <td 
                        className="bg-white sticky right-0 z-10 shadow-[-2px_0_8px_rgba(0,0,0,0.03)]"
                        style={{ width: '120px', minWidth: '120px' }}
                      />
                    </tr>
                  ))}
                  {/* Add Row button - positioned at bottom right */}
                  <tr className="bg-gradient-to-t from-gray-50 to-transparent">
                    <td colSpan={headers.length + 2} className="h-10"></td>
                    <td 
                      className="text-center cursor-pointer bg-white hover:bg-gray-50 transition-all sticky right-0 z-10 shadow-[-2px_0_8px_rgba(0,0,0,0.05)] group"
                      style={{ width: '120px', minWidth: '120px' }}
                      onClick={() => addRow()}
                    >
                      <div className="flex items-center justify-center text-gray-500 hover:text-gray-700 py-2.5">
                        <Plus className="h-4 w-4 mr-1.5 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium">Row</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 bg-white px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-6">
              <span>{data.length} rows loaded</span>
              {selectedCell && (
                <span className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Row {selectedCell.row + 1}, Column {selectedColumnName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span>Ready for AI enrichment</span>
              <div className="w-2 h-2 bg-green-500"></div>
            </div>
          </div>
        </div>
      </div>

      <AIEnrichmentDialog 
        open={enrichmentDialogOpen} 
        onOpenChange={setEnrichmentDialogOpen}
        columnIndex={enrichmentColumnIndex}
        enrichmentScope={enrichmentScope}
        selectedRowCount={selectedRows.size + selectedCells.size}
        currentRow={currentEnrichRow}
      />
      <DataAnalysisDialog open={analysisDialogOpen} onOpenChange={setAnalysisDialogOpen} />
      <SmartSelectionDialog open={smartSelectionOpen} onOpenChange={setSmartSelectionOpen} />
      <AddColumnDialog 
        open={addColumnDialogOpen} 
        onClose={() => setAddColumnDialogOpen(false)}
        onAdd={(name) => {
          addColumn(name)
          setAddColumnDialogOpen(false)
        }}
      />
      {attachmentColumnIndex !== null && (
        <ColumnAttachmentManager
          open={attachmentManagerOpen}
          onClose={() => {
            setAttachmentManagerOpen(false)
            setAttachmentColumnIndex(null)
          }}
          columnIndex={attachmentColumnIndex}
          columnName={headers[attachmentColumnIndex] || ''}
        />
      )}
      {cellAttachmentOpen && selectedCellForAttachment && (
        <CellAttachmentManager
          open={cellAttachmentOpen}
          onClose={() => {
            setCellAttachmentOpen(false)
            setSelectedCellForAttachment(null)
          }}
          rowIndex={selectedCellForAttachment.row}
          columnIndex={selectedCellForAttachment.col}
          cellValue={data[selectedCellForAttachment.row]?.[selectedCellForAttachment.col] || ''}
          columnName={headers[selectedCellForAttachment.col] || ''}
        />
      )}
    </div>
  )
}
