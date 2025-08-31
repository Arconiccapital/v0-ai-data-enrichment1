"use client"

import { Calendar, FileText, Zap, RotateCw, Settings, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ColumnEnrichmentConfig } from "@/lib/spreadsheet-store"

interface ColumnEnrichmentTooltipProps {
  config: ColumnEnrichmentConfig
  columnName: string
  totalRows: number
  enrichedRows: number
  onReconfigure: () => void
  onRunAgain: () => void
}

export function ColumnEnrichmentTooltip({
  config,
  columnName,
  totalRows,
  enrichedRows,
  onReconfigure,
  onRunAgain
}: ColumnEnrichmentTooltipProps) {
  const lastRunDate = config.prompt ? new Date().toLocaleString() : null
  const percentComplete = Math.round((enrichedRows / totalRows) * 100)
  
  return (
    <div className="w-80 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b">
        <FileText className="h-4 w-4 text-blue-500" />
        <span className="font-semibold text-sm">Enrichment Configuration</span>
      </div>
      
      {/* Prompt */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">Prompt:</label>
        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
          {config.prompt || "No prompt configured"}
        </p>
      </div>
      
      {/* Format */}
      {config.dataType && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Format:</label>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {config.dataType}
            </Badge>
            {config.formatMode && (
              <Badge variant="outline" className="text-xs">
                {config.formatMode} mode
              </Badge>
            )}
          </div>
        </div>
      )}
      
      {/* Context Columns */}
      {config.attachments && config.attachments.length > 0 && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Context:</label>
          <p className="text-xs text-gray-700">
            Using {config.attachments.length} attachment{config.attachments.length !== 1 ? 's' : ''} as context
          </p>
        </div>
      )}
      
      {/* Status */}
      <div className="space-y-2 pt-2 border-t">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Status:</span>
          <span className="font-medium">
            {enrichedRows}/{totalRows} cells enriched
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-blue-600 h-1.5 rounded-full transition-all"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
        
        {lastRunDate && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>Last run: {lastRunDate}</span>
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onReconfigure}
          className="flex-1"
        >
          <Settings className="h-3 w-3 mr-1" />
          Re-configure
        </Button>
        <Button
          size="sm"
          onClick={onRunAgain}
          className="flex-1"
        >
          <PlayCircle className="h-3 w-3 mr-1" />
          Run Again
        </Button>
      </div>
    </div>
  )
}