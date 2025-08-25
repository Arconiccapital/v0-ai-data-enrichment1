"use client"

import React, { useState, useCallback, memo } from "react"
import { Input } from "@/components/ui/input"
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface SpreadsheetCellProps {
  value: string
  rowIndex: number
  colIndex: number
  columnWidth: number
  isSelected: boolean
  isEnriching: boolean
  isHighlighted: boolean
  hasEnrichmentConfig: boolean
  onCellChange: (value: string, rowIndex: number, colIndex: number) => void
  onCellClick: (rowIndex: number, colIndex: number) => void
  onCellSelection: (rowIndex: number, colIndex: number) => void
  onEnrichCell?: (colIndex: number, scope: 'cell' | 'selected', rowIndex: number) => void
}

export const SpreadsheetCell = memo(function SpreadsheetCell({
  value,
  rowIndex,
  colIndex,
  columnWidth,
  isSelected,
  isEnriching,
  isHighlighted,
  hasEnrichmentConfig,
  onCellChange,
  onCellClick,
  onCellSelection,
  onEnrichCell
}: SpreadsheetCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true)
    setEditValue(value)
  }, [value])

  const handleSave = useCallback(() => {
    onCellChange(editValue, rowIndex, colIndex)
    setIsEditing(false)
  }, [editValue, rowIndex, colIndex, onCellChange])

  const handleCancel = useCallback(() => {
    setEditValue(value)
    setIsEditing(false)
  }, [value])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }, [handleSave, handleCancel])

  return (
    <td
      className={cn(
        "h-10 border-r border-gray-200 cursor-pointer relative group",
        isSelected && "bg-blue-50 ring-2 ring-blue-500 ring-inset",
        isEnriching && "bg-blue-50",
        isHighlighted && "bg-yellow-50"
      )}
      style={{ 
        width: columnWidth, 
        minWidth: Math.min(100, columnWidth), 
        maxWidth: Math.max(500, columnWidth) 
      }}
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
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="h-full w-full border-0 focus:ring-2 focus:ring-blue-500 text-sm"
                autoFocus
              />
            ) : (
              <div 
                className="px-4 py-2 text-sm text-gray-900 truncate group-hover:bg-gray-50 overflow-hidden"
                title={value}
              >
                {value}
              </div>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Cell Actions</ContextMenuLabel>
          <ContextMenuSeparator />
          {hasEnrichmentConfig && onEnrichCell && (
            <>
              <ContextMenuItem onClick={() => onEnrichCell(colIndex, 'cell', rowIndex)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Enrich This Cell
              </ContextMenuItem>
              <ContextMenuItem onClick={() => {
                onCellSelection(rowIndex, colIndex)
                onEnrichCell(colIndex, 'selected', rowIndex)
              }}>
                <Sparkles className="h-4 w-4 mr-2" />
                Enrich Selected Cells
              </ContextMenuItem>
              <ContextMenuSeparator />
            </>
          )}
          <ContextMenuItem onClick={() => onCellSelection(rowIndex, colIndex)}>
            {isHighlighted ? 'Deselect Cell' : 'Select Cell'}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onCellChange("", rowIndex, colIndex)}>
            Clear Cell
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </td>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for memo optimization
  return (
    prevProps.value === nextProps.value &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isEnriching === nextProps.isEnriching &&
    prevProps.isHighlighted === nextProps.isHighlighted &&
    prevProps.columnWidth === nextProps.columnWidth &&
    prevProps.hasEnrichmentConfig === nextProps.hasEnrichmentConfig
  )
})