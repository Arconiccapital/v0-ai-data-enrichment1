"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Filter, BarChart3, Download } from "lucide-react"

interface SpreadsheetStatusBarProps {
  totalRows: number
  totalColumns: number
  selectedRowCount: number
  selectedCellCount: number
  selectedColumnCount: number
  onClearSelection: () => void
  onSmartSelect: () => void
  onAnalyze: () => void
  onExport: () => void
}

export function SpreadsheetStatusBar({
  totalRows,
  totalColumns,
  selectedRowCount,
  selectedCellCount,
  selectedColumnCount,
  onClearSelection,
  onSmartSelect,
  onAnalyze,
  onExport,
}: SpreadsheetStatusBarProps) {
  const hasSelection = selectedRowCount > 0 || selectedColumnCount > 0 || selectedCellCount > 0
  
  return (
    <div className="border-t border-gray-200 bg-white px-6 py-3">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            {totalRows} rows × {totalColumns} columns
          </Badge>
          
          {hasSelection && (
            <>
              {selectedRowCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {selectedRowCount} {selectedRowCount === 1 ? 'row' : 'rows'} selected
                </Badge>
              )}
              {selectedColumnCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {selectedColumnCount} {selectedColumnCount === 1 ? 'column' : 'columns'}
                </Badge>
              )}
              {selectedCellCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {selectedCellCount} cells selected
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="h-6 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSmartSelect}
            className="h-6 text-xs"
          >
            <Filter className="h-3 w-3 mr-1" />
            Smart Select
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onAnalyze}
            className="h-6 text-xs"
          >
            <BarChart3 className="h-3 w-3 mr-1" />
            Analyze
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-6 text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>
      </div>
    </div>
  )
}