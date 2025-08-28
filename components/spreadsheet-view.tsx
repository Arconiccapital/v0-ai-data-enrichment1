"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { AddColumnDialog } from "@/components/add-column-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sparkles, Plus, Loader2, Info, X, Download, BarChart3, ArrowRight, Filter, Play, Zap, ChevronDown, FileSpreadsheet, FileJson, FileText, CheckSquare, MousePointer, Settings, LayoutDashboard, Share2, Mail, Copy, Clipboard, Scissors, PanelRight } from "lucide-react"
import { SpreadsheetCell } from "./spreadsheet-cell"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useRouter } from "next/navigation"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { AIEnrichmentDialog } from "@/components/ai-enrichment-dialog"
import { DataAnalysisDialog } from "@/components/data-analysis-dialog"
import { SmartSelectionDialog } from "@/components/smart-selection-dialog"
import { GenerationInfoBanner } from "@/components/generation-info-banner"
import { cn } from "@/lib/utils"

interface SpreadsheetViewProps {
  activeWorkflowStep?: string | null
}

export function SpreadsheetView({ activeWorkflowStep }: SpreadsheetViewProps) {
  const { 
    headers, 
    data, 
    updateCell, 
    enrichmentStatus, 
    addColumn,
    insertColumnBefore,
    insertColumnAfter,
    deleteColumn,
    renameColumn,
    selectedRows,
    selectedColumns,
    toggleRowSelection,
    toggleColumnSelection,
    selectAllRows,
    clearSelection,
    getSelectedData,
    columnEnrichmentConfigs,
    storeColumnEnrichmentConfig,
    enrichExistingColumn,
    selectedCells,
    toggleCellSelection,
    clearCellSelection,
    getCellExplanation,
    getCellMetadata,
    getGenerationMetadata
  } = useSpreadsheetStore()
  const router = useRouter()
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [enrichmentDialogOpen, setEnrichmentDialogOpen] = useState(false)
  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false)
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false)
  const [showCellDetails, setShowCellDetails] = useState(false)
  const [showSelectionTools, setShowSelectionTools] = useState(false)
  const [smartSelectionOpen, setSmartSelectionOpen] = useState(false)
  const [enrichmentColumnIndex, setEnrichmentColumnIndex] = useState<number | undefined>()
  const [enrichmentScope, setEnrichmentScope] = useState<'cell' | 'selected' | 'all'>('all')
  const [currentEnrichRow, setCurrentEnrichRow] = useState<number | undefined>()
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({})
  const [resizingColumn, setResizingColumn] = useState<number | null>(null)
  const [showGenerationInfo, setShowGenerationInfo] = useState(true)

  // Keyboard shortcuts for copy/paste and cell details
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifier = isMac ? e.metaKey : e.ctrlKey
      
      if (modifier) {
        // Toggle cell details with Cmd/Ctrl + I
        if (e.key === 'i' && selectedCell) {
          e.preventDefault()
          setShowCellDetails(prev => !prev)
        }
        // Copy/paste/cut operations
        else if (selectedCell) {
          if (e.key === 'c') {
            e.preventDefault()
            const value = data[selectedCell.row][selectedCell.col]
            handleCopyCell(value)
          } else if (e.key === 'v') {
            e.preventDefault()
            handlePasteCell(selectedCell.row, selectedCell.col)
          } else if (e.key === 'x') {
            e.preventDefault()
            handleCutCell(selectedCell.row, selectedCell.col)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedCell, data])
  
  const hasSelection = selectedRows.size > 0 || selectedColumns.size > 0
  const selectedRowCount = selectedRows.size
  const selectedColumnCount = selectedColumns.size

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setSelectedCell({ row: rowIndex, col: colIndex })
    // Don't auto-open details panel - let user explicitly open it
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

  const isCellEnriching = (rowIndex: number, colIndex: number) => {
    return enrichmentStatus[colIndex]?.enriching && enrichmentStatus[colIndex]?.currentRow === rowIndex
  }

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      addColumn(newColumnName.trim())
      const newColumnIndex = headers.length // This will be the index of the newly added column
      setNewColumnName("")
      setAddColumnDialogOpen(false)
      
      // Optionally open enrichment dialog for the new column
      // Uncomment the following lines if you want to automatically open enrichment dialog
      // setTimeout(() => {
      //   handleOpenEnrichmentForColumn(newColumnIndex, 'all')
      // }, 100)
    }
  }

  const handleOpenEnrichmentForColumn = (colIndex: number, scope: 'cell' | 'selected' | 'all', rowIndex?: number) => {
    setEnrichmentColumnIndex(colIndex)
    setEnrichmentScope(scope)
    setCurrentEnrichRow(rowIndex)
    setEnrichmentDialogOpen(true)
  }

  const handleGenerateOutput = () => {
    // Store selected data in session storage for the outputs page
    const selectedData = getSelectedData()
    if (selectedData.rows.length > 0) {
      sessionStorage.setItem('selectedData', JSON.stringify(selectedData))
      router.push('/outputs')
    }
  }

  const handleCreateDashboard = () => {
    // Store selected data and navigate to dashboard creation
    const selectedData = getSelectedData()
    if (selectedData.rows.length > 0) {
      sessionStorage.setItem('dashboardData', JSON.stringify(selectedData))
      router.push('/dashboard/create')
    } else if (selectedCell) {
      // If no rows selected but a cell is selected, use that row
      const cellData = {
        headers: headers,
        rows: [data[selectedCell.row]]
      }
      sessionStorage.setItem('dashboardData', JSON.stringify(cellData))
      router.push('/dashboard/create')
    }
  }

  const handleSelectAll = () => {
    selectAllRows()
    // Select all columns too
    headers.forEach((_, index) => {
      if (!selectedColumns.has(index)) {
        toggleColumnSelection(index)
      }
    })
  }

  const handleExport = () => {
    const csvContent = [
      headers.join(","),
      ...data.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "enriched-data.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectedCellValue = selectedCell ? data[selectedCell.row]?.[selectedCell.col] || "" : ""
  const selectedColumnName = selectedCell ? headers[selectedCell.col] || "" : ""
  
  // Calculate total table width
  const calculateTableWidth = () => {
    let totalWidth = 40 + 48 + 150 // checkbox (40px) + row number (48px) + add column (150px)
    headers.forEach((_, index) => {
      totalWidth += columnWidths[index] || 200
    })
    return totalWidth
  }

  const generationMetadata = getGenerationMetadata()

  return (
    <div className="flex h-full bg-white overflow-auto">
      {/* Main Content */}
      <div className={cn("flex flex-col min-w-0 min-h-0 transition-all duration-300", showCellDetails ? "flex-1" : "w-full")}>
        {/* Generation Info Banner */}
        {generationMetadata && showGenerationInfo && (
          <GenerationInfoBanner 
            metadata={generationMetadata}
            onDismiss={() => setShowGenerationInfo(false)}
          />
        )}
        
        {/* Action Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          {activeWorkflowStep ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Import step - only show Add Column */}
                {activeWorkflowStep === 'import' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setAddColumnDialogOpen(true)}
                    data-add-column
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Column
                  </Button>
                )}

                {/* Enrich step - only show Enrich button */}
                {activeWorkflowStep === 'enrich' && (
                  <Button
                    size="sm"
                    className="bg-black text-white hover:bg-gray-800"
                    onClick={() => {
                      setEnrichmentScope('all')
                      setEnrichmentColumnIndex(undefined)
                      setEnrichmentDialogOpen(true)
                    }}
                    data-enrich-button
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Enrich Data
                  </Button>
                )}

                {/* Analyze step - only show Analyze button */}
                {activeWorkflowStep === 'analyze' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setAnalysisDialogOpen(true)}
                    data-analysis-trigger
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analyze Data
                  </Button>
                )}

                {/* Output step - show Report and Dashboard buttons */}
                {activeWorkflowStep === 'output' && (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleGenerateOutput}
                      data-output-trigger
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCreateDashboard}
                      disabled={!hasSelection}
                      data-dashboard-trigger
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Create Dashboard
                    </Button>
                  </>
                )}

                {/* Export step - only show Export button */}
                {activeWorkflowStep === 'export' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleExport}
                    data-export-trigger
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </div>

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
                    className="h-6 text-xs"
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
              className="h-6 text-xs"
            >
              <Filter className="h-3 w-3 mr-1" />
              Smart Select
            </Button>
            
            {selectedCell && (
              <Button
                variant={showCellDetails ? "default" : "outline"}
                size="sm"
                onClick={() => setShowCellDetails(!showCellDetails)}
                className="h-6 text-xs"
                title="Toggle cell details (Cmd/Ctrl + I)"
              >
                <PanelRight className="h-3 w-3 mr-1" />
                Cell Details
              </Button>
            )}
          </div>
        </div>



        <div className="flex-1 bg-gray-50 flex flex-col min-w-0">
          <div className="flex-1 overflow-auto relative">
            <table className="table-fixed border-collapse bg-white" style={{ width: `${calculateTableWidth()}px` }}>
                <thead className="sticky top-0 z-30">
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="w-10 h-12 text-center border-r border-gray-200 bg-gray-50 sticky left-0 z-40">
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
                    <th className="w-12 h-12 text-center text-xs font-medium text-gray-600 border-r border-gray-200 bg-gray-50 sticky left-[40px] z-40">
                      #
                    </th>
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className="h-12 px-4 text-left text-sm font-semibold text-gray-900 border-r border-gray-200 bg-gray-50 group hover:bg-gray-100 transition-colors relative"
                        style={{ width: `${columnWidths[index] || 200}px`, minWidth: '100px' }}
                      >
                        <ContextMenu>
                          <ContextMenuTrigger asChild>
                            <div className="relative h-full flex items-center">
                              <div 
                                className="flex items-center gap-2 cursor-pointer flex-1"
                                onClick={() => handleOpenEnrichmentForColumn(index, 'all')}
                              >
                                <span className="truncate flex-1">{header}</span>
                                {columnEnrichmentConfigs[index]?.isConfigured && (
                                  <Zap className="h-3 w-3 text-yellow-600 flex-shrink-0" title="Enrichment configured" />
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
                                className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-blue-400 group-hover:bg-gray-300 transition-colors"
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
                      className="h-12 px-4 text-center border-r border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      style={{ width: '150px', minWidth: '150px' }}
                    >
                      <button
                        onClick={() => setAddColumnDialogOpen(true)}
                        className="w-full h-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <div className="flex items-center justify-center gap-2 px-3 py-1 border-2 border-dashed border-gray-300 rounded hover:border-gray-400 transition-colors">
                          <Plus className="h-4 w-4" />
                          <span className="text-sm font-medium">Add Column</span>
                        </div>
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex} className={cn(
                      "hover:bg-gray-50 border-b border-gray-100",
                      selectedRows.has(rowIndex) && "bg-gray-100"
                    )}>
                      <td className="w-10 h-12 text-center border-r border-gray-200 bg-gray-50 sticky left-0 z-10">
                        <Checkbox
                          checked={selectedRows.has(rowIndex)}
                          onCheckedChange={() => toggleRowSelection(rowIndex)}
                        />
                      </td>
                      <td className="w-12 h-12 text-center text-xs font-medium text-gray-600 border-r border-gray-200 bg-gray-50 sticky left-[40px] z-10">
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
                          onCellClick={handleCellClick}
                          onCellChange={handleCellChange}
                          onCopyCell={handleCopyCell}
                          onPasteCell={handlePasteCell}
                          onCutCell={handleCutCell}
                          onToggleSelection={toggleCellSelection}
                          onEnrichCell={handleOpenEnrichmentForColumn}
                        />
                      ))}
                      {/* Empty cell for Add Column alignment */}
                      <td 
                        className="border-r border-gray-200 bg-gray-50/50"
                        style={{ width: '150px', minWidth: '150px' }}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {showCellDetails && selectedCell && (
        <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Cell Details</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowCellDetails(false)} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 p-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Position</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Row:</span>
                    <span className="font-medium">{selectedCell.row + 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Column:</span>
                    <span className="font-medium">{selectedColumnName}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Content</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Textarea
                  value={selectedCellValue}
                  onChange={(e) => handleCellChange(e.target.value, selectedCell.row, selectedCell.col)}
                  placeholder="Enter cell content..."
                  className="min-h-[100px] text-sm"
                  disabled={isCellEnriching(selectedCell.row, selectedCell.col)}
                />
                <div className="mt-2 text-xs text-gray-500">{selectedCellValue.length} characters</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-transparent"
                  onClick={() => {
                    if (selectedCell) {
                      handleOpenEnrichmentForColumn(selectedCell.col, 'all')
                    }
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Enrich this column
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-transparent"
                  onClick={() => handleCellChange("", selectedCell.row, selectedCell.col)}
                >
                  Clear cell
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-transparent"
                  onClick={handleCreateDashboard}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Create Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

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
    </div>
  )
}
