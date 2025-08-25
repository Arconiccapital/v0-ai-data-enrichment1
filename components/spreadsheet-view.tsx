"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkles, Plus, Loader2, Info, X, Download, BarChart3, ArrowRight, Filter, Play, Zap, ChevronDown, FileSpreadsheet, FileJson, FileText, CheckSquare, MousePointer, Settings } from "lucide-react"
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
import { cn } from "@/lib/utils"

export function SpreadsheetView() {
  const { 
    headers, 
    data, 
    updateCell, 
    enrichmentStatus, 
    addColumn,
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
    clearCellSelection
  } = useSpreadsheetStore()
  const router = useRouter()
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [enrichmentDialogOpen, setEnrichmentDialogOpen] = useState(false)
  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false)
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")
  const [showCellDetails, setShowCellDetails] = useState(false)
  const [showSelectionTools, setShowSelectionTools] = useState(false)
  const [smartSelectionOpen, setSmartSelectionOpen] = useState(false)
  const [enrichmentColumnIndex, setEnrichmentColumnIndex] = useState<number | undefined>()
  const [enrichmentScope, setEnrichmentScope] = useState<'cell' | 'selected' | 'all'>('all')
  const [currentEnrichRow, setCurrentEnrichRow] = useState<number | undefined>()
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null)
  const [editValue, setEditValue] = useState("")
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({})
  const [resizingColumn, setResizingColumn] = useState<number | null>(null)
  
  const hasSelection = selectedRows.size > 0 || selectedColumns.size > 0
  const selectedRowCount = selectedRows.size
  const selectedColumnCount = selectedColumns.size

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setSelectedCell({ row: rowIndex, col: colIndex })
    setShowCellDetails(true)
  }

  const handleCellChange = (value: string, rowIndex: number, colIndex: number) => {
    updateCell(rowIndex, colIndex, value)
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

  return (
    <div className="flex h-full bg-white">
      {/* Main Content */}
      <div className={cn("flex flex-col transition-all duration-300", showCellDetails ? "flex-1" : "w-full")}>
        <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-black">Spreadsheet</h1>
              <Badge className="text-xs font-medium bg-gray-100 text-gray-700 border-gray-300">
                {data.length} rows × {headers.length} columns
              </Badge>
              {hasSelection && (
                <Badge className="text-xs font-medium bg-black text-white border-0 shadow-md">
                  {selectedRowCount} rows, {selectedColumnCount} columns selected
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Selection Group */}
              <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
                {!hasSelection ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="text-sm">
                        <MousePointer className="h-4 w-4 mr-2" />
                        Select
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={handleSelectAll}>
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Select All
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSmartSelectionOpen(true)}>
                        <Filter className="h-4 w-4 mr-2" />
                        Smart Select...
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
                      {selectedRowCount} rows, {selectedColumnCount} columns
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSelection}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>

              {/* Data Actions Group */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setAddColumnDialogOpen(true)}
                  className="text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="text-sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleExport}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      CSV File
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      // Export as Excel
                      const csvContent = [
                        headers.join("\t"),
                        ...data.map((row) => row.join("\t")),
                      ].join("\n")
                      const blob = new Blob([csvContent], { type: "application/vnd.ms-excel" })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = "enriched-data.xls"
                      a.click()
                      URL.revokeObjectURL(url)
                    }}>
                      <FileText className="h-4 w-4 mr-2" />
                      Excel File
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      // Export as JSON
                      const jsonData = data.map(row => 
                        headers.reduce((obj, header, index) => {
                          obj[header] = row[index]
                          return obj
                        }, {} as Record<string, string>)
                      )
                      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = "enriched-data.json"
                      a.click()
                      URL.revokeObjectURL(url)
                    }}>
                      <FileJson className="h-4 w-4 mr-2" />
                      JSON File
                    </DropdownMenuItem>
                    {hasSelection && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleGenerateOutput}>
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Generate Output ({selectedRowCount} rows)
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* AI Features Group */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-black text-white hover:bg-gray-800 shadow-md"
                    data-enrich-button
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Enrich & Analyze
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>AI Features</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setEnrichmentDialogOpen(true)}>
                    <Zap className="h-4 w-4 mr-2" />
                    Enrich Data
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAnalysisDialogOpen(true)}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analyze Data
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Add Column Dialog - Keep existing */}
              <Dialog open={addColumnDialogOpen} onOpenChange={setAddColumnDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Add New Column</DialogTitle>
                    <DialogDescription>
                      Add a new column to your spreadsheet. You can configure AI enrichment after adding.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="column-name">Column Name</Label>
                      <Input
                        id="column-name"
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        placeholder="e.g., Company Website, Contact Email, Industry"
                        onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
                        autoFocus
                      />
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Info className="h-4 w-4 text-gray-500" />
                      <p className="text-sm text-gray-600">
                        After adding the column, right-click its header to configure AI enrichment.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setAddColumnDialogOpen(false)
                      setNewColumnName("")
                    }}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddColumn} 
                      disabled={!newColumnName.trim()}
                    >
                      Add Column
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-gray-50">
          <div className="h-full overflow-auto">
            <div className="w-full">
              <table className="table-fixed border-collapse bg-white" style={{ width: 'max-content' }}>
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="w-10 h-10 text-center border-r border-gray-200 bg-gray-50 sticky left-0 z-20">
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
                    <th className="w-12 h-10 text-center text-xs font-medium text-gray-600 border-r border-gray-200 bg-gray-50 sticky left-[40px] z-20">
                      #
                    </th>
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className="h-10 px-4 text-left text-sm font-medium text-gray-700 border-r border-gray-200 bg-gray-50 group hover:bg-gray-100 transition-colors relative"
                        style={{ width: columnWidths[index] || 200, minWidth: 100, maxWidth: 500 }}
                      >
                        <ContextMenu>
                          <ContextMenuTrigger asChild>
                            <div className="relative h-full">
                              <div 
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => handleOpenEnrichmentForColumn(index, 'all')}
                              >
                                <span className="truncate">{header}</span>
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
                                className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setResizingColumn(index)
                                  const startX = e.clientX
                                  const startWidth = columnWidths[index] || 200
                                  
                                  const handleMouseMove = (e: MouseEvent) => {
                                    const diff = e.clientX - startX
                                    const newWidth = Math.max(100, Math.min(500, startWidth + diff))
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
                                  <Settings className="h-4 w-4 mr-2" />
                                  Edit Enrichment Config
                                </ContextMenuItem>
                              </>
                            )}
                          </ContextMenuContent>
                        </ContextMenu>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex} className={cn(
                      "hover:bg-gray-50 border-b border-gray-100",
                      selectedRows.has(rowIndex) && "bg-gray-100"
                    )}>
                      <td className="w-10 h-10 text-center border-r border-gray-200 bg-gray-50 sticky left-0 z-10">
                        <Checkbox
                          checked={selectedRows.has(rowIndex)}
                          onCheckedChange={() => toggleRowSelection(rowIndex)}
                        />
                      </td>
                      <td className="w-12 h-10 text-center text-xs font-medium text-gray-600 border-r border-gray-200 bg-gray-50 sticky left-[40px] z-10">
                        {rowIndex + 1}
                      </td>
                      {row.map((cell, colIndex) => (
                        <td
                          key={colIndex}
                          className={cn(
                            "h-10 border-r border-gray-200 cursor-pointer relative group",
                            selectedCell?.row === rowIndex &&
                              selectedCell?.col === colIndex &&
                              "bg-blue-50 ring-2 ring-blue-500 ring-inset",
                            isCellEnriching(rowIndex, colIndex) && "bg-blue-50",
                            selectedCells.has(`${rowIndex}-${colIndex}`) && "bg-yellow-50"
                          )}
                          style={{ width: columnWidths[colIndex] || 200, minWidth: 100, maxWidth: 500 }}
                        >
                          <ContextMenu>
                            <ContextMenuTrigger asChild>
                              <div 
                                className="h-full"
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                onDoubleClick={() => {
                                  setEditingCell({ row: rowIndex, col: colIndex })
                                  setEditValue(cell)
                                }}
                              >
                                {isCellEnriching(rowIndex, colIndex) && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-blue-50 z-10">
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                  </div>
                                )}
                                {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                                  <Input
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={() => {
                                      handleCellChange(editValue, rowIndex, colIndex)
                                      setEditingCell(null)
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleCellChange(editValue, rowIndex, colIndex)
                                        setEditingCell(null)
                                      } else if (e.key === 'Escape') {
                                        setEditingCell(null)
                                      }
                                    }}
                                    className="h-full w-full border-0 focus:ring-2 focus:ring-blue-500 text-sm"
                                    autoFocus
                                  />
                                ) : (
                                  <div 
                                    className="px-4 py-2 text-sm text-gray-900 truncate group-hover:bg-gray-50 overflow-hidden"
                                    title={cell}
                                  >
                                    {cell}
                                  </div>
                                )}
                              </div>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                              <ContextMenuLabel>Cell Actions</ContextMenuLabel>
                              <ContextMenuSeparator />
                              {columnEnrichmentConfigs[colIndex]?.isConfigured && (
                                <>
                                  <ContextMenuItem onClick={() => handleOpenEnrichmentForColumn(colIndex, 'cell', rowIndex)}>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Enrich This Cell
                                  </ContextMenuItem>
                                  <ContextMenuItem onClick={() => {
                                    toggleCellSelection(rowIndex, colIndex)
                                    handleOpenEnrichmentForColumn(colIndex, 'selected')
                                  }}>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Enrich Selected Cells
                                  </ContextMenuItem>
                                  <ContextMenuSeparator />
                                </>
                              )}
                              <ContextMenuItem onClick={() => toggleCellSelection(rowIndex, colIndex)}>
                                {selectedCells.has(`${rowIndex}-${colIndex}`) ? 'Deselect Cell' : 'Select Cell'}
                              </ContextMenuItem>
                              <ContextMenuItem onClick={() => handleCellChange("", rowIndex, colIndex)}>
                                Clear Cell
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        </td>
                      ))}
                    </tr>
                  ))}
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
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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
                  onClick={() => setEnrichmentDialogOpen(true)}
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
    </div>
  )
}
