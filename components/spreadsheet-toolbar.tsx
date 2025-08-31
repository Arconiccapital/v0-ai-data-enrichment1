"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, 
  Download, 
  BarChart3, 
  ArrowRight, 
  Filter, 
  Play, 
  FileSpreadsheet, 
  FileJson, 
  FileText, 
  CheckSquare, 
  MousePointer, 
  LayoutDashboard, 
  Share2, 
  Mail, 
  PanelRight,
  Undo,
  Redo
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SpreadsheetToolbarProps {
  hasData: boolean
  hasSelection: boolean
  selectedRowCount: number
  selectedColumnCount: number
  showSelectionTools: boolean
  showCellDetails: boolean
  selectedCell: { row: number; col: number } | null
  onAnalyze: () => void
  onSmartSelection: () => void
  onSelectAll: () => void
  onClearSelection: () => void
  onExport: (format: 'csv' | 'json' | 'excel') => void
  onGenerateOutput: () => void
  onCreateDashboard: () => void
  onToggleCellDetails: () => void
  onGenerateEmail?: () => void
  onShare?: () => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
}

export function SpreadsheetToolbar({
  hasData,
  hasSelection,
  selectedRowCount,
  selectedColumnCount,
  showSelectionTools,
  showCellDetails,
  selectedCell,
  onAnalyze,
  onSmartSelection,
  onSelectAll,
  onClearSelection,
  onExport,
  onGenerateOutput,
  onCreateDashboard,
  onToggleCellDetails,
  onGenerateEmail,
  onShare,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}: SpreadsheetToolbarProps) {
  return (
    <div className="px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Undo/Redo Buttons */}
          {onUndo && (
            <Button
              onClick={onUndo}
              disabled={!canUndo}
              variant="outline"
              size="sm"
              className="gap-2"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>
          )}
          {onRedo && (
            <Button
              onClick={onRedo}
              disabled={!canRedo}
              variant="outline"
              size="sm"
              className="gap-2"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo className="h-4 w-4" />
            </Button>
          )}
          
          {/* Separator */}
          {(onUndo || onRedo) && <div className="h-6 w-px bg-gray-300" />}
          
          {/* Analysis Button */}
          <Button 
            onClick={onAnalyze}
            disabled={!hasData}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analyze Data
          </Button>

          {/* Smart Selection */}
          <Button
            onClick={onSmartSelection}
            disabled={!hasData}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <MousePointer className="h-4 w-4" />
            Smart Selection
          </Button>

          {/* Selection Tools */}
          {showSelectionTools && (
            <>
              <div className="h-6 w-px bg-gray-300" />
              <Button
                onClick={onSelectAll}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <CheckSquare className="h-4 w-4" />
                Select All
              </Button>
              {hasSelection && (
                <>
                  <Button
                    onClick={onClearSelection}
                    variant="outline"
                    size="sm"
                  >
                    Clear Selection
                  </Button>
                  <Badge variant="secondary" className="ml-2">
                    {selectedRowCount > 0 && `${selectedRowCount} rows`}
                    {selectedRowCount > 0 && selectedColumnCount > 0 && ', '}
                    {selectedColumnCount > 0 && `${selectedColumnCount} columns`}
                  </Badge>
                </>
              )}
            </>
          )}

          {/* Cell Details Toggle */}
          {selectedCell && (
            <Button
              onClick={onToggleCellDetails}
              variant={showCellDetails ? "default" : "outline"}
              size="sm"
              className="gap-2"
            >
              <PanelRight className="h-4 w-4" />
              Cell Details
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Generate Output */}
          <Button
            onClick={onGenerateOutput}
            disabled={!hasData}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            Generate Output
          </Button>

          {/* Create Dashboard */}
          <Button
            onClick={onCreateDashboard}
            disabled={!hasData}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            Create Dashboard
          </Button>

          {/* Generate Email */}
          {onGenerateEmail && (
            <Button
              onClick={onGenerateEmail}
              disabled={!hasData}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Generate Email
            </Button>
          )}

          {/* Share */}
          {onShare && (
            <Button
              onClick={onShare}
              disabled={!hasData}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          )}

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                disabled={!hasData}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onExport('csv')}>
                <FileText className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('json')}>
                <FileJson className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('excel')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}