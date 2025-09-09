"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  Download, 
  Upload, 
  Plus, 
  Undo, 
  Redo,
  Copy,
  Clipboard,
  Trash2,
  Search,
  Filter,
  Save,
  Share2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpreadsheetToolbarProps {
  hasSelection: boolean
  canUndo: boolean
  canRedo: boolean
  hasClipboard: boolean
  onAddRow: () => void
  onAddColumn: () => void
  onDeleteSelected: () => void
  onCopy: () => void
  onPaste: () => void
  onUndo: () => void
  onRedo: () => void
  onExport: () => void
  onImport: () => void
  onSearch: () => void
  onFilter: () => void
  onSave?: () => void
  onShare?: () => void
  className?: string
}

export function SpreadsheetToolbar({
  hasSelection,
  canUndo,
  canRedo,
  hasClipboard,
  onAddRow,
  onAddColumn,
  onDeleteSelected,
  onCopy,
  onPaste,
  onUndo,
  onRedo,
  onExport,
  onImport,
  onSearch,
  onFilter,
  onSave,
  onShare,
  className
}: SpreadsheetToolbarProps) {
  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200",
      className
    )}>
      <div className="flex items-center gap-1">
        {/* Edit operations */}
        <div className="flex items-center gap-1 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="h-8 w-8 p-0"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="h-8 w-8 p-0"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-200" />

        {/* Clipboard operations */}
        <div className="flex items-center gap-1 mx-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopy}
            disabled={!hasSelection}
            title="Copy (Ctrl+C)"
            className="h-8 w-8 p-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onPaste}
            disabled={!hasClipboard}
            title="Paste (Ctrl+V)"
            className="h-8 w-8 p-0"
          >
            <Clipboard className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-200" />

        {/* Add/Delete operations */}
        <div className="flex items-center gap-1 mx-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddRow}
            title="Add Row"
          >
            <Plus className="h-4 w-4 mr-1" />
            Row
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddColumn}
            title="Add Column"
          >
            <Plus className="h-4 w-4 mr-1" />
            Column
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeleteSelected}
            disabled={!hasSelection}
            title="Delete Selected"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-200" />

        {/* Search and Filter */}
        <div className="flex items-center gap-1 mx-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSearch}
            title="Search"
            className="h-8 w-8 p-0"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onFilter}
            title="Filter"
            className="h-8 w-8 p-0"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* File operations */}
        {onSave && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            title="Save"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        )}
        {onShare && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            title="Share"
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        )}
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={onImport}
          title="Import Data"
        >
          <Upload className="h-4 w-4 mr-1" />
          Import
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onExport}
          title="Export Data"
        >
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>
    </div>
  )
}