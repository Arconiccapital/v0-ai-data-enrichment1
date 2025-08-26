"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search,
  Filter,
  Download,
  Upload,
  Copy,
  Trash2,
  RotateCcw,
  Eye,
  EyeOff
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SpreadsheetToolbarProps {
  totalRows: number
  totalColumns: number
  selectedCount: number
  searchQuery: string
  onSearchChange: (query: string) => void
  onExport: () => void
  onImport: () => void
  onClearSelection: () => void
  onDeleteSelected: () => void
  onUndo?: () => void
  onRedo?: () => void
  viewMode: 'all' | 'filtered' | 'selected'
  onViewModeChange: (mode: 'all' | 'filtered' | 'selected') => void
}

export function SpreadsheetToolbar({
  totalRows,
  totalColumns,
  selectedCount,
  searchQuery,
  onSearchChange,
  onExport,
  onImport,
  onClearSelection,
  onDeleteSelected,
  onUndo,
  onRedo,
  viewMode,
  onViewModeChange,
}: SpreadsheetToolbarProps) {
  return (
    <div className="border-b bg-white px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search data..."
              className="pl-8 h-8"
            />
          </div>

          {/* View mode selector */}
          <Select value={viewMode} onValueChange={(value: any) => onViewModeChange(value)}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center">
                  <Eye className="mr-2 h-3 w-3" />
                  All Data
                </div>
              </SelectItem>
              <SelectItem value="filtered">
                <div className="flex items-center">
                  <Filter className="mr-2 h-3 w-3" />
                  Filtered
                </div>
              </SelectItem>
              <SelectItem value="selected">
                <div className="flex items-center">
                  <Copy className="mr-2 h-3 w-3" />
                  Selected
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Stats */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Badge variant="secondary" className="font-normal">
              {totalRows} rows
            </Badge>
            <Badge variant="secondary" className="font-normal">
              {totalColumns} columns
            </Badge>
            {selectedCount > 0 && (
              <Badge variant="default" className="font-normal">
                {selectedCount} selected
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Selection actions */}
          {selectedCount > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
              >
                <EyeOff className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDeleteSelected}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </>
          )}

          {/* Undo/Redo */}
          {onUndo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              title="Undo"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          {onRedo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              title="Redo"
            >
              <RotateCcw className="h-4 w-4 scale-x-[-1]" />
            </Button>
          )}

          <div className="w-px h-6 bg-gray-200" />

          {/* Import/Export */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onImport}
          >
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExport}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>
    </div>
  )
}