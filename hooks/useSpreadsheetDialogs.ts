import { useState, useCallback } from 'react'

interface DialogState {
  enrichmentDialogOpen: boolean
  addColumnDialogOpen: boolean
  analysisDialogOpen: boolean
  attachmentManagerOpen: boolean
  cellAttachmentOpen: boolean
  smartSelectionOpen: boolean
  showCellDetails: boolean
  showSelectionTools: boolean
}

interface AttachmentTarget {
  row: number
  col: number
}

export function useSpreadsheetDialogs() {
  // Dialog states
  const [enrichmentDialogOpen, setEnrichmentDialogOpen] = useState(false)
  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false)
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false)
  const [attachmentManagerOpen, setAttachmentManagerOpen] = useState(false)
  const [cellAttachmentOpen, setCellAttachmentOpen] = useState(false)
  const [smartSelectionOpen, setSmartSelectionOpen] = useState(false)
  const [showCellDetails, setShowCellDetails] = useState(false)
  const [showSelectionTools, setShowSelectionTools] = useState(false)

  // Dialog-specific state
  const [attachmentColumnIndex, setAttachmentColumnIndex] = useState<number | null>(null)
  const [selectedCellForAttachment, setSelectedCellForAttachment] = useState<AttachmentTarget | null>(null)
  const [enrichmentColumnIndex, setEnrichmentColumnIndex] = useState<number | undefined>()
  const [enrichmentScope, setEnrichmentScope] = useState<'cell' | 'selected' | 'all'>('all')
  const [currentEnrichRow, setCurrentEnrichRow] = useState<number | undefined>()

  // Open handlers
  const openEnrichmentDialog = useCallback((columnIndex?: number, scope?: 'cell' | 'selected' | 'all', rowIndex?: number) => {
    setEnrichmentColumnIndex(columnIndex)
    setEnrichmentScope(scope || 'all')
    setCurrentEnrichRow(rowIndex)
    setEnrichmentDialogOpen(true)
  }, [])

  const openColumnAttachments = useCallback((columnIndex: number) => {
    setAttachmentColumnIndex(columnIndex)
    setAttachmentManagerOpen(true)
  }, [])

  const openCellAttachments = useCallback((rowIndex: number, colIndex: number) => {
    setSelectedCellForAttachment({ row: rowIndex, col: colIndex })
    setCellAttachmentOpen(true)
  }, [])

  // Close handlers
  const closeEnrichmentDialog = useCallback(() => {
    setEnrichmentDialogOpen(false)
    setEnrichmentColumnIndex(undefined)
    setEnrichmentScope('all')
    setCurrentEnrichRow(undefined)
  }, [])

  const closeColumnAttachments = useCallback(() => {
    setAttachmentManagerOpen(false)
    setAttachmentColumnIndex(null)
  }, [])

  const closeCellAttachments = useCallback(() => {
    setCellAttachmentOpen(false)
    setSelectedCellForAttachment(null)
  }, [])

  // Toggle handlers
  const toggleCellDetails = useCallback(() => {
    setShowCellDetails(prev => !prev)
  }, [])

  const toggleSelectionTools = useCallback(() => {
    setShowSelectionTools(prev => !prev)
  }, [])

  // Get all dialog states
  const getDialogStates = useCallback((): DialogState => ({
    enrichmentDialogOpen,
    addColumnDialogOpen,
    analysisDialogOpen,
    attachmentManagerOpen,
    cellAttachmentOpen,
    smartSelectionOpen,
    showCellDetails,
    showSelectionTools,
  }), [
    enrichmentDialogOpen,
    addColumnDialogOpen,
    analysisDialogOpen,
    attachmentManagerOpen,
    cellAttachmentOpen,
    smartSelectionOpen,
    showCellDetails,
    showSelectionTools,
  ])

  return {
    // States
    enrichmentDialogOpen,
    addColumnDialogOpen,
    analysisDialogOpen,
    attachmentManagerOpen,
    cellAttachmentOpen,
    smartSelectionOpen,
    showCellDetails,
    showSelectionTools,
    
    // Dialog-specific state
    attachmentColumnIndex,
    selectedCellForAttachment,
    enrichmentColumnIndex,
    enrichmentScope,
    currentEnrichRow,
    
    // Setters (for direct control)
    setEnrichmentDialogOpen,
    setAddColumnDialogOpen,
    setAnalysisDialogOpen,
    setAttachmentManagerOpen,
    setCellAttachmentOpen,
    setSmartSelectionOpen,
    setShowCellDetails,
    setShowSelectionTools,
    
    // Open handlers
    openEnrichmentDialog,
    openColumnAttachments,
    openCellAttachments,
    
    // Close handlers
    closeEnrichmentDialog,
    closeColumnAttachments,
    closeCellAttachments,
    
    // Toggle handlers
    toggleCellDetails,
    toggleSelectionTools,
    
    // Utility
    getDialogStates,
  }
}