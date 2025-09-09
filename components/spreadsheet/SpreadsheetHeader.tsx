"use client"

import React, { useState, useRef, useEffect } from 'react'
import { 
  Settings, 
  Plus, 
  X, 
  Sparkles, 
  Paperclip,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Column } from '@/types/spreadsheet'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

interface SpreadsheetHeaderProps {
  columns: Column[]
  columnWidths: Record<number, number>
  selectedColumns: Set<number>
  columnEnrichmentConfigs: Record<number, any>
  onColumnResize: (index: number, width: number) => void
  onColumnRename: (index: number, newName: string) => void
  onColumnAdd: (index: number, position: 'before' | 'after') => void
  onColumnDelete: (index: number) => void
  onColumnSelect: (index: number, multiSelect?: boolean) => void
  onEnrichColumn: (index: number, mode: 'all' | 'selected' | 'config') => void
  onManageAttachments: (index: number) => void
  getColumnAttachments: (index: number) => any[]
}

export function SpreadsheetHeader({
  columns,
  columnWidths,
  selectedColumns,
  columnEnrichmentConfigs,
  onColumnResize,
  onColumnRename,
  onColumnAdd,
  onColumnDelete,
  onColumnSelect,
  onEnrichColumn,
  onManageAttachments,
  getColumnAttachments
}: SpreadsheetHeaderProps) {
  const [resizingColumn, setResizingColumn] = useState<number | null>(null)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)

  // Handle column resize
  const handleResizeStart = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setResizingColumn(index)
    setResizeStartX(e.clientX)
    setResizeStartWidth(columnWidths[index] || 200)
  }

  useEffect(() => {
    if (resizingColumn === null) return

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizeStartX
      const newWidth = Math.max(50, resizeStartWidth + diff)
      onColumnResize(resizingColumn, newWidth)
    }

    const handleMouseUp = () => {
      setResizingColumn(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizingColumn, resizeStartX, resizeStartWidth, onColumnResize])

  return (
    <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
      <tr>
        <th className="sticky left-0 z-20 w-12 min-w-[48px] bg-gray-100 border-r border-b border-gray-200">
          <div className="h-10 flex items-center justify-center text-xs text-gray-500">
            #
          </div>
        </th>
        {columns.map((column, index) => (
          <th
            key={`header-${index}`}
            className={cn(
              "relative group bg-gray-50 border-r border-gray-200",
              selectedColumns.has(index) && "bg-blue-50"
            )}
            style={{ width: `${columnWidths[index] || 200}px` }}
          >
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <div className="relative h-full flex items-center">
                  <div 
                    className="flex-1 px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100"
                    onClick={(e) => onColumnSelect(index, e.shiftKey || e.metaKey)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-medium text-sm truncate">
                        {column.name}
                      </span>
                      {columnEnrichmentConfigs[index]?.isConfigured && (
                        <Sparkles className="h-3 w-3 text-purple-500" />
                      )}
                      {getColumnAttachments(index).length > 0 && (
                        <div className="flex items-center gap-1">
                          <Paperclip className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {getColumnAttachments(index).length}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Settings className="h-3 w-3 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Resize handle */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 hover:bg-blue-500 cursor-col-resize group-hover:bg-gray-300"
                    onMouseDown={(e) => handleResizeStart(e, index)}
                  />
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuLabel>{column.name}</ContextMenuLabel>
                <ContextMenuSeparator />
                
                {/* Column Operations */}
                <ContextMenuItem onClick={() => {
                  const newName = prompt('Enter new column name:', column.name)
                  if (newName && newName.trim() && newName.trim() !== column.name) {
                    onColumnRename(index, newName.trim())
                  }
                }}>
                  <Settings className="h-4 w-4 mr-2" />
                  Rename Column
                </ContextMenuItem>
                
                <ContextMenuItem onClick={() => {
                  const newColumnName = prompt('Enter new column name:')
                  if (newColumnName && newColumnName.trim()) {
                    onColumnAdd(index, 'before')
                  }
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Insert Column Before
                </ContextMenuItem>
                
                <ContextMenuItem onClick={() => {
                  const newColumnName = prompt('Enter new column name:')
                  if (newColumnName && newColumnName.trim()) {
                    onColumnAdd(index, 'after')
                  }
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Insert Column After
                </ContextMenuItem>
                
                <ContextMenuItem 
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete the column "${column.name}"? This action cannot be undone.`)) {
                      onColumnDelete(index)
                    }
                  }}
                  className="text-red-600"
                >
                  <X className="h-4 w-4 mr-2" />
                  Delete Column
                </ContextMenuItem>
                
                <ContextMenuSeparator />
                
                {/* Attachment Management */}
                <ContextMenuItem onClick={() => onManageAttachments(index)}>
                  <Paperclip className="h-4 w-4 mr-2" />
                  Manage Attachments {getColumnAttachments(index).length > 0 && `(${getColumnAttachments(index).length})`}
                </ContextMenuItem>
                
                <ContextMenuSeparator />
                
                {/* Enrichment Operations */}
                <ContextMenuItem onClick={() => onEnrichColumn(index, 'all')}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {columnEnrichmentConfigs[index]?.isConfigured ? 'Enrich All Cells' : 'Configure & Enrich'}
                </ContextMenuItem>
                {columnEnrichmentConfigs[index]?.isConfigured && (
                  <>
                    <ContextMenuItem onClick={() => onEnrichColumn(index, 'selected')}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Enrich Selected Cells
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => onEnrichColumn(index, 'config')}>
                      <Zap className="h-4 w-4 mr-2" />
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
  )
}