"use client"

import { useRef, useState, useCallback, useMemo } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkles, Plus, Loader2, Info, X, Settings, Zap, Play, Filter, Paperclip, Eye, Download, Copy, Trash2, Edit3, BarChart3, Wand2 } from "lucide-react"
import { SpreadsheetCell } from "./spreadsheet-cell"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ColumnEnrichmentTooltip } from "@/components/column-enrichment-tooltip"

interface VirtualizedSpreadsheetProps {
  onOpenEnrichmentDialog: (columnIndex?: number, scope?: 'cell' | 'selected' | 'all', rowIndex?: number) => void
  onOpenAttachmentManager: (columnIndex: number) => void
  onOpenCellAttachment: (row: number, col: number) => void
  onOpenVibeMode: () => void
  selectedCell: { row: number; col: number } | null
  setSelectedCell: (cell: { row: number; col: number } | null) => void
  columnWidths: Record<number, number>
  setColumnWidths: (widths: Record<number, number>) => void
}

export function VirtualizedSpreadsheet({
  onOpenEnrichmentDialog,
  onOpenAttachmentManager,
  onOpenCellAttachment,
  onOpenVibeMode,
  selectedCell,
  setSelectedCell,
  columnWidths,
  setColumnWidths,
}: VirtualizedSpreadsheetProps) {
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
    columnEnrichmentConfigs,
    selectedCells,
    toggleCellSelection,
    getCellExplanation,
    getCellAttachments,
    getCellMetadata,
    getGenerationMetadata,
    getColumnAttachments
  } = useSpreadsheetStore()

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [resizingColumn, setResizingColumn] = useState<number | null>(null)
  const [showPerformanceInfo, setShowPerformanceInfo] = useState(true)
  
  // Performance metrics
  const totalRows = data.length
  const totalCells = totalRows * headers.length
  const isLargeDataset = totalRows > 5000
  
  // Virtual row configuration
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 40, // Estimated row height
    overscan: 10, // Render 10 extra rows for smoother scrolling
  })

  // Virtual column configuration (for horizontal scrolling)
  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: headers.length + 1, // +1 for row number column
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: (index) => {
      if (index === 0) return 60 // Row number column
      return columnWidths[index - 1] || 150 // Default column width
    },
    overscan: 3, // Render 3 extra columns
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const virtualColumns = columnVirtualizer.getVirtualItems()

  // Handle column resize
  const handleColumnResize = useCallback((columnIndex: number, newWidth: number) => {
    setColumnWidths({
      ...columnWidths,
      [columnIndex]: Math.max(50, Math.min(500, newWidth))
    })
    columnVirtualizer.measure()
  }, [columnWidths, setColumnWidths, columnVirtualizer])

  // Handle cell edit
  const handleCellEdit = useCallback((row: number, col: number, value: string) => {
    updateCell(row, col, value)
  }, [updateCell])

  // Handle row selection
  const handleRowSelection = useCallback((rowIndex: number) => {
    toggleRowSelection(rowIndex)
  }, [toggleRowSelection])

  // Select all rows (optimized for large datasets)
  const handleSelectAll = useCallback(() => {
    if (isLargeDataset) {
      const confirmSelect = window.confirm(`Select all ${totalRows} rows? This may take a moment.`)
      if (!confirmSelect) return
    }
    selectAllRows()
  }, [selectAllRows, isLargeDataset, totalRows])

  // Add new column with auto-scroll
  const handleAddColumn = useCallback(async () => {
    const newColumnIndex = addColumn(`Column ${headers.length + 1}`)
    
    // Scroll to new column
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const totalWidth = headers.reduce((sum, _, idx) => sum + (columnWidths[idx] || 150), 60)
        scrollContainerRef.current.scrollLeft = totalWidth
      }
    }, 100)
    
    toast.success(`Added new column at position ${newColumnIndex + 1}`)
  }, [addColumn, headers, columnWidths])

  // Add new row
  const handleAddRow = useCallback(() => {
    addRow()
    // Scroll to bottom
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
      }
    }, 100)
    toast.success(`Added new row at position ${data.length + 1}`)
  }, [addRow, data.length])

  // Check if column has enrichment config
  const hasEnrichmentConfig = useCallback((columnIndex: number) => {
    return columnEnrichmentConfigs.some(config => config.columnIndex === columnIndex)
  }, [columnEnrichmentConfigs])

  // Memoize header row for performance
  const headerRow = useMemo(() => (
    <div 
      className="sticky top-0 z-20 flex bg-gray-50 border-b border-gray-200"
      style={{ 
        width: `${columnVirtualizer.getTotalSize()}px`,
        minWidth: '100%' 
      }}
    >
      {/* Select all checkbox */}
      <div className="sticky left-0 z-30 w-[60px] bg-gray-50 border-r border-gray-200 flex items-center justify-center h-10">
        <Checkbox 
          checked={selectedRows.size === data.length && data.length > 0}
          onCheckedChange={handleSelectAll}
          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
      </div>
      
      {/* Virtual columns */}
      {virtualColumns.slice(1).map((virtualColumn) => {
        const columnIndex = virtualColumn.index - 1
        const enrichmentConfig = columnEnrichmentConfigs.find(c => c.columnIndex === columnIndex)
        const hasAttachments = getColumnAttachments(columnIndex).length > 0
        
        return (
          <div
            key={virtualColumn.key}
            className="relative group"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              transform: `translateX(${virtualColumn.start}px)`,
              width: `${virtualColumn.size}px`,
            }}
          >
            <ContextMenuTrigger>
              <div className="h-10 px-2 flex items-center justify-between border-r border-gray-200 bg-gray-50 font-medium text-sm">
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <span className="truncate">{headers[columnIndex]}</span>
                  {enrichmentConfig && (
                    <ColumnEnrichmentTooltip config={enrichmentConfig}>
                      <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                        <Sparkles className="w-3 h-3" />
                      </Badge>
                    </ColumnEnrichmentTooltip>
                  )}
                  {hasAttachments && (
                    <Badge variant="outline" className="ml-1 px-1 py-0 text-xs">
                      <Paperclip className="w-3 h-3" />
                    </Badge>
                  )}
                </div>
                
                {/* Column resize handle */}
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 bg-gray-300 opacity-0 group-hover:opacity-100 cursor-col-resize hover:bg-blue-500 transition-opacity"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    setResizingColumn(columnIndex)
                    const startX = e.clientX
                    const startWidth = columnWidths[columnIndex] || 150
                    
                    const handleMouseMove = (e: MouseEvent) => {
                      const diff = e.clientX - startX
                      handleColumnResize(columnIndex, startWidth + diff)
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
              <ContextMenuLabel>Column Actions</ContextMenuLabel>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => onOpenEnrichmentDialog(columnIndex, 'all')}>
                <Sparkles className="w-4 h-4 mr-2" />
                Enrich Column
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onOpenAttachmentManager(columnIndex)}>
                <Paperclip className="w-4 h-4 mr-2" />
                Manage Attachments
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => insertColumnBefore(columnIndex)}>
                Insert Column Before
              </ContextMenuItem>
              <ContextMenuItem onClick={() => insertColumnAfter(columnIndex)}>
                Insert Column After
              </ContextMenuItem>
              <ContextMenuItem onClick={() => {
                const newName = prompt('Enter new column name:', headers[columnIndex])
                if (newName) renameColumn(columnIndex, newName)
              }}>
                <Edit3 className="w-4 h-4 mr-2" />
                Rename Column
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={() => deleteColumn(columnIndex)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Column
              </ContextMenuItem>
            </ContextMenuContent>
          </div>
        )
      })}
    </div>
  ), [virtualColumns, headers, columnWidths, data.length, selectedRows.size, columnEnrichmentConfigs, getColumnAttachments, handleSelectAll, handleColumnResize])

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Performance indicator for large datasets */}
      {isLargeDataset && showPerformanceInfo && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Info className="w-4 h-4" />
            <span>
              Performance mode enabled: Displaying {totalRows.toLocaleString()} rows with virtual scrolling
            </span>
            <Badge variant="secondary" className="ml-2">
              {virtualRows.length} rows rendered
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPerformanceInfo(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      {/* Toolbar */}
      <div className="border-b border-gray-200 px-4 py-2 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {totalRows.toLocaleString()} rows × {headers.length} columns = {totalCells.toLocaleString()} cells
          </span>
          {selectedRows.size > 0 && (
            <Badge variant="secondary">
              {selectedRows.size} row{selectedRows.size !== 1 ? 's' : ''} selected
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleAddColumn}
            size="sm"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Column
          </Button>
          <Button
            onClick={handleAddRow}
            size="sm"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Row
          </Button>
          <Button
            onClick={() => onOpenEnrichmentDialog()}
            size="sm"
            variant="outline"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Enrich
          </Button>
          <Button
            onClick={onOpenVibeMode}
            size="sm"
            variant="outline"
          >
            <Wand2 className="w-4 h-4 mr-1" />
            Vibe Mode
          </Button>
        </div>
      </div>
      
      {/* Virtualized spreadsheet */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-auto relative"
        style={{ contain: 'strict' }}
      >
        {/* Header row */}
        {headerRow}
        
        {/* Virtual rows container */}
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: `${columnVirtualizer.getTotalSize()}px`,
            position: 'relative',
            minWidth: '100%'
          }}
        >
          {virtualRows.map((virtualRow) => {
            const rowIndex = virtualRow.index
            const isSelected = selectedRows.has(rowIndex)
            
            return (
              <div
                key={virtualRow.key}
                className={cn(
                  "absolute top-0 left-0 w-full flex",
                  isSelected && "bg-blue-50"
                )}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {/* Row number and checkbox */}
                <div className="sticky left-0 z-10 w-[60px] bg-gray-50 border-r border-b border-gray-200 flex items-center justify-center">
                  <div className="flex items-center gap-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleRowSelection(rowIndex)}
                      className="data-[state=checked]:bg-primary"
                    />
                    <span className="text-xs text-gray-500">{rowIndex + 1}</span>
                  </div>
                </div>
                
                {/* Virtual columns for this row */}
                {virtualColumns.slice(1).map((virtualColumn) => {
                  const columnIndex = virtualColumn.index - 1
                  const cellValue = data[rowIndex]?.[columnIndex] || ""
                  const isSelectedCell = selectedCell?.row === rowIndex && selectedCell?.col === columnIndex
                  const explanation = getCellExplanation(rowIndex, columnIndex)
                  const attachments = getCellAttachments(rowIndex, columnIndex)
                  const metadata = getCellMetadata(rowIndex, columnIndex)
                  const generationMeta = getGenerationMetadata(rowIndex, columnIndex)
                  
                  return (
                    <div
                      key={virtualColumn.key}
                      className={cn(
                        "absolute border-r border-b border-gray-200",
                        isSelectedCell && "ring-2 ring-blue-500 z-10"
                      )}
                      style={{
                        left: `${virtualColumn.start}px`,
                        width: `${virtualColumn.size}px`,
                        height: '100%',
                      }}
                      onClick={() => setSelectedCell({ row: rowIndex, col: columnIndex })}
                    >
                      <SpreadsheetCell
                        value={cellValue}
                        onChange={(value) => handleCellEdit(rowIndex, columnIndex, value)}
                        isSelected={isSelectedCell}
                        isEnriching={enrichmentStatus.enriching && enrichmentStatus.currentRow === rowIndex}
                        hasExplanation={!!explanation}
                        hasAttachments={attachments.length > 0}
                        metadata={metadata}
                        generationMetadata={generationMeta}
                        onViewDetails={() => {
                          if (attachments.length > 0) {
                            onOpenCellAttachment(rowIndex, columnIndex)
                          }
                        }}
                        className={cn(
                          metadata?.isGenerated && "bg-green-50",
                          metadata?.isEnriched && "bg-blue-50"
                        )}
                      />
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Status bar */}
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>
            Showing rows {virtualRows[0]?.index + 1 || 0} - {virtualRows[virtualRows.length - 1]?.index + 1 || 0} of {totalRows.toLocaleString()}
          </span>
          {enrichmentStatus.enriching && (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enriching row {enrichmentStatus.currentRow + 1}...</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Virtual Scrolling Active
          </Badge>
        </div>
      </div>
    </div>
  )
}