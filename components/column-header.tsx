"use client"

import { memo } from "react"
import { Sparkles, Plus, Settings, X, Loader2, Play, Zap } from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

interface ColumnHeaderProps {
  header: string
  index: number
  width: number
  isConfigured: boolean
  isEnriching: boolean
  onOpenEnrichment: (scope: 'all' | 'selected') => void
  onRename: () => void
  onInsertBefore: () => void
  onInsertAfter: () => void
  onDelete: () => void
  onResize: (e: React.MouseEvent) => void
}

export const ColumnHeader = memo(function ColumnHeader({
  header,
  index,
  width,
  isConfigured,
  isEnriching,
  onOpenEnrichment,
  onRename,
  onInsertBefore,
  onInsertAfter,
  onDelete,
  onResize
}: ColumnHeaderProps) {
  return (
    <th
      className="h-12 px-4 text-left text-sm font-semibold text-gray-900 border-r border-gray-200 bg-gray-50 group hover:bg-gray-100 transition-colors relative"
      style={{ width: `${width}px`, minWidth: '100px' }}
    >
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="relative h-full flex items-center">
            <div 
              className="flex items-center gap-2 cursor-pointer flex-1"
              onClick={() => onOpenEnrichment('all')}
            >
              <span className="truncate flex-1">{header}</span>
              {isConfigured && (
                <Zap className="h-3 w-3 text-yellow-600 flex-shrink-0" title="Enrichment configured" />
              )}
              {isEnriching && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-600 flex-shrink-0" />
              )}
              {!isConfigured && !isEnriching && (
                <Sparkles className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              )}
              {isConfigured && !isEnriching && (
                <Play className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              )}
            </div>
            {/* Column resize handle */}
            <div
              className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-blue-400 group-hover:bg-gray-300 transition-colors"
              onMouseDown={onResize}
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
})