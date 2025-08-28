"use client"

import { useState, memo } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
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
        isSelected ? "text-gray-900 font-medium" : "text-gray-900",
        !isSelected && "group-hover:bg-gray-50"
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
        <TooltipContent className="max-w-lg p-4 space-y-3">
          {metadata ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-sm">Enrichment Details</span>
              </div>
              
              <div className="space-y-3">
                <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                  <p className="text-[11px] text-blue-700 mb-1">
                    Searched for: <span className="font-medium">{metadata.query.includes('Find') ? metadata.query.split('Find')[1]?.split('for')[0]?.trim() : 'information'}</span>
                  </p>
                  {metadata.query.includes('for') && (
                    <p className="text-[10px] text-blue-600">
                      Entity: <span className="font-medium">{metadata.query.split('for')[1]?.trim()}</span>
                    </p>
                  )}
                </div>
                
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Conclusion:</p>
                  <div className="text-xs bg-green-50 p-2 rounded border border-green-200">
                    <p className="font-medium text-gray-900">{value}</p>
                  </div>
                  {metadata.response !== value && metadata.response.length > 100 && (
                    <details className="mt-2">
                      <summary className="text-[10px] text-gray-500 cursor-pointer hover:text-gray-700">View full response</summary>
                      <p className="text-[10px] text-gray-600 mt-1 p-2 bg-gray-50 rounded">{metadata.response}</p>
                    </details>
                  )}
                </div>
                
                {metadata.citations && metadata.citations.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Sources:</p>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {metadata.citations.map((citation: any, idx: number) => {
                        // Handle both string URLs and citation objects
                        const isUrl = typeof citation === 'string' && citation.startsWith('http')
                        const url = isUrl ? citation : citation?.url
                        const title = citation?.title || (isUrl ? new URL(citation).hostname : citation)
                        
                        return (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-blue-500 text-[10px] font-medium mt-0.5">[{idx + 1}]</span>
                            {url ? (
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 underline break-all flex-1"
                                title={url}
                              >
                                {title}
                              </a>
                            ) : (
                              <span className="text-xs text-gray-600 flex-1">{title}</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                <div className="pt-2 border-t flex items-center justify-between">
                  <p className="text-[10px] text-gray-400">
                    Enriched: {new Date(metadata.timestamp).toLocaleTimeString()}
                  </p>
                  <p className="text-[10px] text-blue-600 font-medium">
                    Verified with {metadata.citations?.length || 0} sources
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
        "border-r border-gray-200 cursor-pointer relative group transition-all duration-150",
        isSelected && "bg-blue-100 ring-2 ring-blue-500 ring-offset-1 ring-offset-white z-10",
        isEnriching && "bg-blue-50",
        isMultiSelected && "bg-yellow-50"
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
