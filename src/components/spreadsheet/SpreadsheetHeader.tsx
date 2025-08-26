"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  ChevronDown, 
  Plus, 
  Settings2, 
  Type, 
  Hash, 
  AtSign, 
  Link2, 
  Calendar,
  Phone,
  MapPin,
  ToggleLeft
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { DATA_TYPES } from '@/src/constants'

interface SpreadsheetHeaderProps {
  headers: string[]
  selectedColumns: Set<number>
  columnWidths: Record<number, number>
  onColumnSelect: (index: number) => void
  onAddColumn: () => void
  onColumnResize: (index: number, width: number) => void
  onColumnRename: (index: number, newName: string) => void
  onConfigureColumn: (index: number) => void
}

const DATA_TYPE_ICONS = {
  [DATA_TYPES.TEXT]: Type,
  [DATA_TYPES.NUMBER]: Hash,
  [DATA_TYPES.EMAIL]: AtSign,
  [DATA_TYPES.URL]: Link2,
  [DATA_TYPES.DATE]: Calendar,
  [DATA_TYPES.PHONE]: Phone,
  [DATA_TYPES.ADDRESS]: MapPin,
  [DATA_TYPES.BOOLEAN]: ToggleLeft,
}

export function SpreadsheetHeader({
  headers,
  selectedColumns,
  columnWidths,
  onColumnSelect,
  onAddColumn,
  onColumnResize,
  onColumnRename,
  onConfigureColumn,
}: SpreadsheetHeaderProps) {
  const [editingColumn, setEditingColumn] = React.useState<number | null>(null)
  const [resizingColumn, setResizingColumn] = React.useState<number | null>(null)

  const handleColumnDoubleClick = (index: number) => {
    setEditingColumn(index)
  }

  const handleColumnRename = (index: number, newName: string) => {
    onColumnRename(index, newName)
    setEditingColumn(null)
  }

  const handleResizeStart = (index: number, startX: number) => {
    setResizingColumn(index)
    const startWidth = columnWidths[index] || 150

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const newWidth = Math.max(50, Math.min(500, startWidth + deltaX))
      onColumnResize(index, newWidth)
    }

    const handleMouseUp = () => {
      setResizingColumn(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="flex border-b bg-gray-50">
      <div className="w-12 border-r bg-gray-100 flex items-center justify-center">
        <span className="text-xs text-gray-500">#</span>
      </div>
      
      {headers.map((header, index) => (
        <div
          key={index}
          className={cn(
            "relative border-r flex items-center group",
            selectedColumns.has(index) && "bg-blue-50"
          )}
          style={{ width: columnWidths[index] || 150 }}
        >
          {editingColumn === index ? (
            <Input
              value={header}
              onChange={(e) => onColumnRename(index, e.target.value)}
              onBlur={() => handleColumnRename(index, header)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleColumnRename(index, header)
                }
              }}
              className="h-8 border-0 focus:ring-2"
              autoFocus
            />
          ) : (
            <div
              className="flex-1 px-2 py-2 flex items-center justify-between cursor-pointer"
              onDoubleClick={() => handleColumnDoubleClick(index)}
              onClick={() => onColumnSelect(index)}
            >
              <span className="font-medium text-sm truncate">{header}</span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingColumn(index)}>
                    Rename Column
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onConfigureColumn(index)}>
                    <Settings2 className="mr-2 h-4 w-4" />
                    Configure Enrichment
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    Delete Column
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          
          {/* Resize handle */}
          <div
            className={cn(
              "absolute right-0 top-0 bottom-0 w-1 hover:bg-blue-500 cursor-col-resize",
              resizingColumn === index && "bg-blue-500"
            )}
            onMouseDown={(e) => handleResizeStart(index, e.clientX)}
          />
        </div>
      ))}
      
      {/* Add column button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onAddColumn}
        className="m-1"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}