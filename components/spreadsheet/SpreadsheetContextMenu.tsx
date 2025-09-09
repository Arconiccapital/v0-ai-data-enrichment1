"use client"

import React from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu'
import {
  Copy,
  Clipboard,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Filter,
  SortAsc,
  SortDesc,
  FileDown,
  Search
} from 'lucide-react'

interface SpreadsheetContextMenuProps {
  children: React.ReactNode
  onCopy?: () => void
  onPaste?: () => void
  onCut?: () => void
  onDelete?: () => void
  onInsertRow?: (position: 'above' | 'below') => void
  onInsertColumn?: (position: 'left' | 'right') => void
  onDeleteRow?: () => void
  onDeleteColumn?: () => void
  onEnrich?: () => void
  onFilter?: () => void
  onSort?: (direction: 'asc' | 'desc') => void
  onExport?: () => void
  onSearch?: () => void
  hasSelection?: boolean
  hasClipboard?: boolean
  isHeaderContext?: boolean
}

export function SpreadsheetContextMenu({
  children,
  onCopy,
  onPaste,
  onCut,
  onDelete,
  onInsertRow,
  onInsertColumn,
  onDeleteRow,
  onDeleteColumn,
  onEnrich,
  onFilter,
  onSort,
  onExport,
  onSearch,
  hasSelection = false,
  hasClipboard = false,
  isHeaderContext = false
}: SpreadsheetContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        {/* Clipboard operations */}
        <ContextMenuItem 
          onClick={onCopy}
          disabled={!hasSelection || !onCopy}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy
          <span className="ml-auto text-xs text-gray-500">Ctrl+C</span>
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={onPaste}
          disabled={!hasClipboard || !onPaste}
        >
          <Clipboard className="mr-2 h-4 w-4" />
          Paste
          <span className="ml-auto text-xs text-gray-500">Ctrl+V</span>
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={onCut}
          disabled={!hasSelection || !onCut}
        >
          <Copy className="mr-2 h-4 w-4" />
          Cut
          <span className="ml-auto text-xs text-gray-500">Ctrl+X</span>
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        {/* Insert operations */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Plus className="mr-2 h-4 w-4" />
            Insert
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => onInsertRow?.('above')}>
              <ArrowUp className="mr-2 h-4 w-4" />
              Row Above
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onInsertRow?.('below')}>
              <ArrowDown className="mr-2 h-4 w-4" />
              Row Below
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onInsertColumn?.('left')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Column Left
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onInsertColumn?.('right')}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Column Right
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        
        {/* Delete operations */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem 
              onClick={onDelete}
              disabled={!hasSelection}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Contents
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem 
              onClick={onDeleteRow}
              className="text-red-600"
            >
              Delete Row
            </ContextMenuItem>
            <ContextMenuItem 
              onClick={onDeleteColumn}
              className="text-red-600"
            >
              Delete Column
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        
        <ContextMenuSeparator />
        
        {/* Data operations */}
        {isHeaderContext && (
          <>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <SortAsc className="mr-2 h-4 w-4" />
                Sort
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem onClick={() => onSort?.('asc')}>
                  <SortAsc className="mr-2 h-4 w-4" />
                  Sort Ascending
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onSort?.('desc')}>
                  <SortDesc className="mr-2 h-4 w-4" />
                  Sort Descending
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            
            <ContextMenuItem onClick={onFilter}>
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </ContextMenuItem>
            
            <ContextMenuSeparator />
          </>
        )}
        
        {/* AI operations */}
        <ContextMenuItem 
          onClick={onEnrich}
          disabled={!hasSelection || !onEnrich}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Enrich with AI
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        {/* Search and export */}
        <ContextMenuItem onClick={onSearch}>
          <Search className="mr-2 h-4 w-4" />
          Find & Replace
          <span className="ml-auto text-xs text-gray-500">Ctrl+F</span>
        </ContextMenuItem>
        
        <ContextMenuItem onClick={onExport}>
          <FileDown className="mr-2 h-4 w-4" />
          Export Selection
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}