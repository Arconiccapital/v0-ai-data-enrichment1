"use client"

import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, Plus, Loader2, Info, X, Settings, Zap, Play, Paperclip 
} from "lucide-react"
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
import { cn } from "@/lib/utils"

interface ColumnHeaderProps {
  header: string
  index: number
  columnWidth: number
  highlightColumns: boolean
  showEnrichHint: boolean
  hasInteractedWithColumn: boolean
  attachmentCount: number
  isConfigured: boolean
  isEnriching: boolean
  totalRows: number
  enrichedRows: number
  config: any
  onOpenEnrichment: (scope: 'all' | 'selected') => void
  onOpenAttachments: () => void
  onRename: () => void
  onInsertBefore: () => void
  onInsertAfter: () => void
  onDelete: () => void
  onRunAgain: () => void
  onResize: (width: number) => void
}

export function ColumnHeader({
  header,
  index,
  columnWidth,
  highlightColumns,
  showEnrichHint,
  hasInteractedWithColumn,
  attachmentCount,
  isConfigured,
  isEnriching,
  totalRows,
  enrichedRows,
  config,
  onOpenEnrichment,
  onOpenAttachments,
  onRename,
  onInsertBefore,
  onInsertAfter,
  onDelete,
  onRunAgain,
  onResize,
}: ColumnHeaderProps) {
  
  const handleResize = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startWidth = columnWidth
    
    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX
      const newWidth = Math.max(100, startWidth + diff)
      onResize(newWidth)
    }
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <th
      className={cn(
        "h-12 px-2 sm:px-4 text-left text-xs sm:text-sm font-semibold text-gray-900 border-r border-gray-200 bg-gray-50 group hover:bg-gray-100 transition-colors relative min-w-[100px] overflow-visible",
        highlightColumns && "animate-pulse bg-blue-50 border-blue-300"
      )}
      style={{ width: `${columnWidth}px` }}
    >
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="relative h-full flex items-center">
            <div 
              className="flex items-center gap-2 cursor-pointer flex-1 relative"
              onClick={() => onOpenEnrichment('all')}
            >
              <span className="truncate flex-1">{header}</span>
              
              {/* Enrichment hint for first column */}
              {index === 0 && showEnrichHint && !hasInteractedWithColumn && (
                <div className="absolute -top-10 left-0 z-50 animate-bounce">
                  <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    Click to enrich with AI ✨
                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-blue-600 transform rotate-45"></div>
                  </div>
                </div>
              )}
              
              {/* Attachment count badge */}
              {attachmentCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1 text-[10px] flex items-center gap-1">
                  <Paperclip className="h-2.5 w-2.5" />
                  {attachmentCount}
                </Badge>
              )}
              
              {/* Enrichment configuration tooltip */}
              {isConfigured && (
                <>
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info 
                          className="h-3 w-3 text-blue-500 flex-shrink-0 cursor-help" 
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="p-0 max-w-none">
                        <ColumnEnrichmentTooltip
                          config={config}
                          columnName={header}
                          totalRows={totalRows}
                          enrichedRows={enrichedRows}
                          onReconfigure={() => onOpenEnrichment('all')}
                          onRunAgain={onRunAgain}
                        />
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Zap className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                </>
              )}
              
              {/* Loading indicator */}
              {isEnriching && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-600 flex-shrink-0" />
              )}
              
              {/* Hover icons */}
              {!isConfigured && !isEnriching && (
                <Sparkles className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              )}
              {isConfigured && !isEnriching && (
                <Play className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              )}
            </div>
            
            {/* Column resize handle */}
            <div
              className="absolute -right-[1px] top-0 h-full w-[3px] cursor-col-resize hover:bg-blue-500 transition-colors z-10"
              onMouseDown={handleResize}
            />
          </div>
        </ContextMenuTrigger>
        
        <ContextMenuContent>
          <ContextMenuLabel>{header}</ContextMenuLabel>
          <ContextMenuSeparator />
          
          {/* Column Operations */}
          <ContextMenuItem onClick={onRename}>
            <Settings className="h-4 w-4 mr-2" />
            Rename Column
          </ContextMenuItem>
          
          <ContextMenuItem onClick={onInsertBefore}>
            <Plus className="h-4 w-4 mr-2" />
            Insert Column Before
          </ContextMenuItem>
          
          <ContextMenuItem onClick={onInsertAfter}>
            <Plus className="h-4 w-4 mr-2" />
            Insert Column After
          </ContextMenuItem>
          
          <ContextMenuItem onClick={onDelete} className="text-red-600">
            <X className="h-4 w-4 mr-2" />
            Delete Column
          </ContextMenuItem>
          
          <ContextMenuSeparator />
          
          {/* Attachment Management */}
          <ContextMenuItem onClick={onOpenAttachments}>
            <Paperclip className="h-4 w-4 mr-2" />
            Manage Attachments {attachmentCount > 0 && `(${attachmentCount})`}
          </ContextMenuItem>
          
          <ContextMenuSeparator />
          
          {/* Enrichment Operations */}
          <ContextMenuItem onClick={() => onOpenEnrichment('all')}>
            <Sparkles className="h-4 w-4 mr-2" />
            {isConfigured ? 'Enrich All Cells' : 'Configure & Enrich'}
          </ContextMenuItem>
          
          {isConfigured && (
            <>
              <ContextMenuItem onClick={() => onOpenEnrichment('selected')}>
                <Sparkles className="h-4 w-4 mr-2" />
                Enrich Selected Cells
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => onOpenEnrichment('all')}>
                <Zap className="h-4 w-4 mr-2" />
                Edit Enrichment Config
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </th>
  )
}