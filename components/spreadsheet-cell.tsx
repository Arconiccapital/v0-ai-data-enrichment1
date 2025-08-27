"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Loader2, Copy, Clipboard, Scissors, Sparkles, Info } from "lucide-react"
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

interface CellMetadata {
  query: string
  response: string
  timestamp: string
  isEnriched: boolean
}

interface SpreadsheetCellProps {
  value: string
  rowIndex: number
  colIndex: number
  isSelected: boolean
  isEnriching: boolean
  isMultiSelected: boolean
  explanation?: string
  metadata?: CellMetadata
  columnWidth: number
  isColumnConfigured?: boolean
  onCellClick: (rowIndex: number, colIndex: number) => void
  onCellChange: (value: string, rowIndex: number, colIndex: number) => void
  onCopyCell: (value: string) => void
  onPasteCell: (rowIndex: number, colIndex: number) => void
  onCutCell: (rowIndex: number, colIndex: number) => void
  onToggleSelection: (rowIndex: number, colIndex: number) => void
  onEnrichCell?: (colIndex: number, scope: 'cell' | 'selected', rowIndex?: number) => void
}

export function SpreadsheetCell({
  value,
  rowIndex,
  colIndex,
  isSelected,
  isEnriching,
  isMultiSelected,
  explanation,
  metadata,
  columnWidth,
  isColumnConfigured = false,
  onCellClick,
  onCellChange,
  onCopyCell,
  onPasteCell,
  onCutCell,
  onToggleSelection,
  onEnrichCell,
}: SpreadsheetCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)

  const handleDoubleClick = () => {
    setIsEditing(true)
    setEditValue(value)
  }

  const handleEditComplete = () => {
    onCellChange(editValue, rowIndex, colIndex)
    setIsEditing(false)
  }

  const handleEditCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const cellContent = (
    <div 
      className={cn(
        "px-4 py-2 text-sm truncate relative",
        isSelected ? "text-gray-900 font-medium" : "text-gray-900",
        !isSelected && "group-hover:bg-gray-50"
      )}
      title={value}
    >
      {metadata?.isEnriched && (
        <Info className="absolute top-1 right-1 h-3 w-3 text-blue-500" />
      )}
      {value}
    </div>
  )

  const cellWithTooltip = (metadata || explanation) ? (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {cellContent}
        </TooltipTrigger>
        <TooltipContent className="max-w-md p-3 space-y-2">
          {metadata ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-sm">Enrichment Details</span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Search Query:</p>
                  <p className="text-xs bg-gray-50 p-2 rounded">{metadata.query}</p>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Result:</p>
                  <p className="text-xs bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">{metadata.response}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">
                    Enriched at: {new Date(metadata.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm">{explanation}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : cellContent

  return (
    <td
      className={cn(
        "h-12 border-r border-gray-200 cursor-pointer relative group transition-all duration-150",
        isSelected && "bg-blue-100 ring-2 ring-blue-500 ring-offset-1 ring-offset-white z-20",
        isEnriching && "bg-blue-50",
        isMultiSelected && "bg-yellow-50"
      )}
      style={{ width: `${columnWidth}px`, minWidth: '100px' }}
    >
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div 
            className="h-full"
            onClick={() => onCellClick(rowIndex, colIndex)}
            onDoubleClick={handleDoubleClick}
          >
            {isEnriching && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-50 z-10">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              </div>
            )}
            {isEditing ? (
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleEditComplete}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleEditComplete()
                  } else if (e.key === 'Escape') {
                    handleEditCancel()
                  }
                }}
                className="h-full w-full border-0 focus:ring-2 focus:ring-blue-500 text-sm"
                autoFocus
              />
            ) : (
              cellWithTooltip
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Cell Actions</ContextMenuLabel>
          <ContextMenuSeparator />
          
          {/* Copy/Paste/Cut actions */}
          <ContextMenuItem onClick={() => onCopyCell(value)}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onPasteCell(rowIndex, colIndex)}>
            <Clipboard className="h-4 w-4 mr-2" />
            Paste
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onCutCell(rowIndex, colIndex)}>
            <Scissors className="h-4 w-4 mr-2" />
            Cut
          </ContextMenuItem>
          <ContextMenuSeparator />
          
          {/* Edit actions */}
          <ContextMenuItem onClick={() => {
            setIsEditing(true)
            setEditValue(value)
          }}>
            Edit Cell
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onCellChange("", rowIndex, colIndex)}>
            Clear Cell
          </ContextMenuItem>
          <ContextMenuSeparator />
          
          {/* Selection actions */}
          <ContextMenuItem onClick={() => onToggleSelection(rowIndex, colIndex)}>
            {isMultiSelected ? 'Deselect Cell' : 'Select Cell'}
          </ContextMenuItem>
          
          {/* Enrichment actions (if configured) */}
          {isColumnConfigured && onEnrichCell && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => onEnrichCell(colIndex, 'cell', rowIndex)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Enrich This Cell
              </ContextMenuItem>
              <ContextMenuItem onClick={() => {
                onToggleSelection(rowIndex, colIndex)
                onEnrichCell(colIndex, 'selected')
              }}>
                <Sparkles className="h-4 w-4 mr-2" />
                Enrich Selected Cells
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </td>
  )
}