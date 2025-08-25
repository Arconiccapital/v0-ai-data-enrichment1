"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Sparkles, 
  Plus, 
  Download, 
  BarChart3, 
  ArrowRight, 
  ChevronDown, 
  FileSpreadsheet, 
  FileJson, 
  FileText, 
  CheckSquare, 
  MousePointer, 
  Filter,
  Zap
} from "lucide-react"

interface SpreadsheetHeaderProps {
  dataLength: number
  headersLength: number
  hasSelection: boolean
  selectedRowCount: number
  selectedColumnCount: number
  onSelectAll: () => void
  onClearSelection: () => void
  onSmartSelectionOpen: () => void
  onAddColumnOpen: () => void
  onEnrichmentOpen: () => void
  onAnalysisOpen: () => void
  onExport: (format: 'csv' | 'excel' | 'json') => void
  onGenerateOutput: () => void
}

export const SpreadsheetHeader = React.memo(function SpreadsheetHeader({
  dataLength,
  headersLength,
  hasSelection,
  selectedRowCount,
  selectedColumnCount,
  onSelectAll,
  onClearSelection,
  onSmartSelectionOpen,
  onAddColumnOpen,
  onEnrichmentOpen,
  onAnalysisOpen,
  onExport,
  onGenerateOutput
}: SpreadsheetHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-black">Spreadsheet</h1>
          <Badge className="text-xs font-medium bg-gray-100 text-gray-700 border-gray-300">
            {dataLength} rows × {headersLength} columns
          </Badge>
          {hasSelection && (
            <Badge className="text-xs font-medium bg-black text-white border-0 shadow-md">
              {selectedRowCount} rows, {selectedColumnCount} columns selected
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Selection Group */}
          <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
            {!hasSelection ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-sm">
                    <MousePointer className="h-4 w-4 mr-2" />
                    Select
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={onSelectAll}>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Select All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onSmartSelectionOpen}>
                    <Filter className="h-4 w-4 mr-2" />
                    Smart Select...
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Badge className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
                  {selectedRowCount} rows, {selectedColumnCount} columns
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearSelection}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>

          {/* Data Actions Group */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onAddColumnOpen}
              className="text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Column
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onExport('csv')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  CSV File
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('excel')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Excel File
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('json')}>
                  <FileJson className="h-4 w-4 mr-2" />
                  JSON File
                </DropdownMenuItem>
                {hasSelection && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onGenerateOutput}>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Generate Output ({selectedRowCount} rows)
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* AI Features Group */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="bg-black text-white hover:bg-gray-800 shadow-md"
                data-enrich-button
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Enrich & Analyze
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>AI Features</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onEnrichmentOpen}>
                <Zap className="h-4 w-4 mr-2" />
                Enrich Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAnalysisOpen}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analyze Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
})