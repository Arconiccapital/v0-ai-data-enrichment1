"use client"

import { SpreadsheetContainer } from "./spreadsheet/SpreadsheetContainer"
import { AIEnrichmentDialog } from "@/components/ai-enrichment-dialog"
import { DataAnalysisDialog } from "@/components/data-analysis-dialog"
import { SmartSelectionDialog } from "@/components/smart-selection-dialog"
import { GenerationInfoBanner } from "@/components/generation-info-banner"
import { ColumnAttachmentManager } from "@/components/column-attachment-manager"
import { CellAttachmentManager } from "@/components/cell-attachment-manager"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { useState } from "react"

interface SpreadsheetViewProps {
  activeWorkflowStep?: string | null
}

/**
 * Refactored SpreadsheetView - Now a thin wrapper that handles dialogs
 * The main spreadsheet logic is in SpreadsheetContainer
 */
export function SpreadsheetView({ activeWorkflowStep }: SpreadsheetViewProps) {
  const { headers, data, getGenerationMetadata } = useSpreadsheetStore()
  
  const [enrichmentDialogOpen, setEnrichmentDialogOpen] = useState(false)
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false)
  const [smartSelectionOpen, setSmartSelectionOpen] = useState(false)
  const [attachmentManagerOpen, setAttachmentManagerOpen] = useState(false)
  const [cellAttachmentOpen, setCellAttachmentOpen] = useState(false)
  const [showGenerationInfo, setShowGenerationInfo] = useState(true)
  
  const [enrichmentColumnIndex, setEnrichmentColumnIndex] = useState<number>()
  const [enrichmentScope, setEnrichmentScope] = useState<'cell' | 'selected' | 'all'>('all')
  const [currentEnrichRow, setCurrentEnrichRow] = useState<number>()
  const [attachmentColumnIndex, setAttachmentColumnIndex] = useState<number | null>(null)
  const [selectedCellForAttachment, setSelectedCellForAttachment] = useState<{row: number, col: number} | null>(null)
  
  const generationMetadata = getGenerationMetadata()
  
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
        <p className="text-lg">No data loaded</p>
      </div>
    )
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Generation Info Banner */}
      {generationMetadata && showGenerationInfo && (
        <GenerationInfoBanner
          metadata={generationMetadata}
          onClose={() => setShowGenerationInfo(false)}
        />
      )}
      
      {/* Main Spreadsheet */}
      <div className="flex-1 overflow-hidden">
        <SpreadsheetContainer activeWorkflowStep={activeWorkflowStep} />
      </div>
      
      {/* Dialogs */}
      <AIEnrichmentDialog 
        open={enrichmentDialogOpen} 
        onOpenChange={setEnrichmentDialogOpen}
        columnIndex={enrichmentColumnIndex}
        enrichmentScope={enrichmentScope}
        selectedRowCount={0}
        currentRow={currentEnrichRow}
      />
      
      <DataAnalysisDialog 
        open={analysisDialogOpen} 
        onOpenChange={setAnalysisDialogOpen} 
      />
      
      <SmartSelectionDialog 
        open={smartSelectionOpen} 
        onOpenChange={setSmartSelectionOpen} 
      />
      
      {attachmentColumnIndex !== null && (
        <ColumnAttachmentManager
          open={attachmentManagerOpen}
          onClose={() => {
            setAttachmentManagerOpen(false)
            setAttachmentColumnIndex(null)
          }}
          columnIndex={attachmentColumnIndex}
          columnName={headers[attachmentColumnIndex] || ''}
        />
      )}
      
      {cellAttachmentOpen && selectedCellForAttachment && (
        <CellAttachmentManager
          open={cellAttachmentOpen}
          onClose={() => {
            setCellAttachmentOpen(false)
            setSelectedCellForAttachment(null)
          }}
          rowIndex={selectedCellForAttachment.row}
          columnIndex={selectedCellForAttachment.col}
          cellValue={data[selectedCellForAttachment.row]?.[selectedCellForAttachment.col] || ''}
          columnName={headers[selectedCellForAttachment.col] || ''}
        />
      )}
    </div>
  )
}