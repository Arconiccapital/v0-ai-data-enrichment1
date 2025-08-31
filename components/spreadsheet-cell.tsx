"use client"

import { useState, memo } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { EnrichmentDetails } from "@/components/enrichment-details"
import { Loader2, Copy, Clipboard, Scissors, Sparkles, Info, Paperclip } from "lucide-react"
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
  citations?: any[]
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
  attachmentCount?: number
  onCellClick: (rowIndex: number, colIndex: number) => void
  onCellChange: (value: string, rowIndex: number, colIndex: number) => void
  onCopyCell: (value: string) => void
  onPasteCell: (rowIndex: number, colIndex: number) => void
  onCutCell: (rowIndex: number, colIndex: number) => void
  onToggleSelection: (rowIndex: number, colIndex: number) => void
  onEnrichCell?: (colIndex: number, scope: 'cell' | 'selected', rowIndex?: number) => void
  onManageAttachments?: (rowIndex: number, colIndex: number) => void
}

export const SpreadsheetCell = memo(function SpreadsheetCell({
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
  attachmentCount = 0,
  onCellClick,
  onCellChange,
  onCopyCell,
  onPasteCell,
  onCutCell,
  onToggleSelection,
  onEnrichCell,
  onManageAttachments,
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
        isSelected && "text-gray-900 font-medium",
        isMultiSelected && "bg-blue-50 border-blue-400",
        !isSelected && !isMultiSelected && "group-hover:bg-gray-50"
      )}
      title={value}
    >
      <div className="absolute top-1 right-1 flex items-center gap-1">
        {metadata?.isEnriched && (
          <Info className="h-3 w-3 text-blue-500" />
        )}
        {attachmentCount > 0 && (
          <div className="flex items-center gap-0.5 bg-gray-100 px-1 py-0.5 rounded">
            <Paperclip className="h-3 w-3 text-gray-600" />
            <span className="text-[10px] text-gray-600">{attachmentCount}</span>
          </div>
        )}
      </div>
      {value}
    </div>
  )

  const cellWithTooltip = (metadata || explanation) ? (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {cellContent}
        </TooltipTrigger>
        <TooltipContent className="max-w-2xl p-0 max-h-[700px] overflow-hidden">
          {metadata ? (
            <EnrichmentDetails value={value} metadata={metadata} className="p-4" />
          ) : (
            <p className="text-sm p-4">{explanation}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : cellContent

  return (
    <td
      className={cn(
        "border-r border-gray-200 cursor-pointer relative group transition-all duration-150",
        isSelected && "bg-blue-100 ring-2 ring-blue-500 ring-offset-1 ring-offset-white z-10",
        isMultiSelected && !isSelected && "bg-blue-50/70 ring-1 ring-blue-300 ring-inset",
        isEnriching && "bg-yellow-50/70",
        !isSelected && !isMultiSelected && !isEnriching && "hover:bg-gray-50"
      )}
      style={{ width: `${columnWidth}px`, height: '48px', maxWidth: `${columnWidth}px` }}
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
          
          {/* Attachment management */}
          {onManageAttachments && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => onManageAttachments(rowIndex, colIndex)}>
                <Paperclip className="h-4 w-4 mr-2" />
                Manage Attachments
                {attachmentCount > 0 && (
                  <span className="ml-auto text-xs text-gray-500">({attachmentCount})</span>
                )}
              </ContextMenuItem>
            </>
          )}
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
})
