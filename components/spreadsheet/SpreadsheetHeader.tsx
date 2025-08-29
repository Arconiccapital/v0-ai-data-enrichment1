"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Zap, Play, Loader2, Paperclip } from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

interface SpreadsheetHeaderProps {
  headers: string[]
  data: string[][]
  selectedRows: Set<number>
  enrichmentStatus: Record<number, any>
  columnEnrichmentConfigs: Record<number, any>
  columnWidths: Record<number, number>
  onSelectAllRows: () => void
  onClearSelection: () => void
  onColumnAction: (action: string, colIndex: number) => void
  onOpenEnrichment: (colIndex: number) => void
  onColumnResize: (colIndex: number, width: number) => void
  getColumnAttachments: (colIndex: number) => any[]
}

export function SpreadsheetHeader({
  headers,
  data,
  selectedRows,
  enrichmentStatus,
  columnEnrichmentConfigs,
  columnWidths,
  onSelectAllRows,
  onClearSelection,
  onColumnAction,
  onOpenEnrichment,
  onColumnResize,
  getColumnAttachments,
}: SpreadsheetHeaderProps) {
  const handleResizeStart = (e: React.MouseEvent, colIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    const startX = e.clientX
    const startWidth = columnWidths[colIndex] || 200
    
    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX
      const newWidth = Math.max(50, Math.min(500, startWidth + diff))
      onColumnResize(colIndex, newWidth)
    }
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  return (
    <thead className="sticky top-0 z-20">
      <tr className="bg-gray-50 border-b border-gray-200">
        {/* Select All Checkbox */}
        <th className="text-center border-r border-gray-200 bg-white sticky left-0 z-30" 
            style={{ width: '40px', height: '48px', boxSizing: 'border-box' }}>
          <Checkbox
            checked={selectedRows.size === data.length && data.length > 0}
            onCheckedChange={(checked) => {
              if (checked) {
                onSelectAllRows()
              } else {
                onClearSelection()
              }
            }}
          />
        </th>
        
        {/* Row Number Header */}
        <th className="text-center text-xs font-medium text-gray-600 border-r border-gray-200 bg-white sticky left-[40px] z-30" 
            style={{ width: '48px', height: '48px', boxSizing: 'border-box' }}>
          #
        </th>
        
        {/* Column Headers */}
        {headers.map((header, index) => (
          <th
            key={index}
            className="h-12 px-2 sm:px-4 text-left text-xs sm:text-sm font-semibold text-gray-900 border-r border-gray-200 bg-gray-50 group hover:bg-gray-100 transition-colors relative min-w-[100px]"
            style={{ width: `${columnWidths[index] || 200}px` }}
          >
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <div className="relative h-full flex items-center">
                  <div 
                    className="flex items-center gap-2 cursor-pointer flex-1"
                    onClick={() => onOpenEnrichment(index)}
                  >
                    <span className="truncate flex-1">{header}</span>
                    
                    {/* Attachment Badge */}
                    {getColumnAttachments(index).length > 0 && (
                      <Badge variant="secondary" className="h-5 px-1 text-[10px] flex items-center gap-1">
                        <Paperclip className="h-2.5 w-2.5" />
                        {getColumnAttachments(index).length}
                      </Badge>
                    )}
                    
                    {/* Status Icons */}
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
                  
                  {/* Column Resize Handle */}
                  <div
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-blue-400 group-hover:bg-gray-300 transition-colors"
                    onMouseDown={(e) => handleResizeStart(e, index)}
                  />
                </div>
              </ContextMenuTrigger>
              
              <ContextMenuContent>
                <ContextMenuLabel>{header}</ContextMenuLabel>
                <ContextMenuSeparator />
                
                <ContextMenuItem onClick={() => onColumnAction('insertBefore', index)}>
                  Insert Column Before
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onColumnAction('insertAfter', index)}>
                  Insert Column After
                </ContextMenuItem>
                
                <ContextMenuSeparator />
                
                <ContextMenuItem onClick={() => onColumnAction('enrich', index)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Enrich Column
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onColumnAction('attachments', index)}>
                  <Paperclip className="h-4 w-4 mr-2" />
                  Manage Attachments
                </ContextMenuItem>
                
                <ContextMenuSeparator />
                
                <ContextMenuItem 
                  className="text-red-600"
                  onClick={() => onColumnAction('delete', index)}
                >
                  Delete Column
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </th>
        ))}
      </tr>
    </thead>
  )
}