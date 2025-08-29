"use client"

import { useState, useEffect, useRef } from "react"
import { SpreadsheetHeader } from "./SpreadsheetHeader"
import { SpreadsheetBody } from "./SpreadsheetBody"
import { SpreadsheetStatusBar } from "./SpreadsheetStatusBar"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { useEnhancedClipboard } from "@/hooks/useEnhancedClipboard"
import { cn } from "@/lib/utils"

interface SpreadsheetContainerProps {
  activeWorkflowStep?: string | null
}

export function SpreadsheetContainer({ activeWorkflowStep }: SpreadsheetContainerProps) {
  const {
    headers,
    data,
    updateCell,
    addRow,
    addColumn,
    insertColumnBefore,
    insertColumnAfter,
    deleteColumn,
    selectedRows,
    selectedCells,
    toggleRowSelection,
    toggleCellSelection,
    clearSelection,
    selectAllRows,
    enrichmentStatus,
    columnEnrichmentConfigs,
    getCellExplanation,
    getCellMetadata,
    getCellAttachments,
    getColumnAttachments,
  } = useSpreadsheetStore()

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({})
  const [smartSelectionOpen, setSmartSelectionOpen] = useState(false)
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false)
  const enhancedClipboard = useEnhancedClipboard()
  const tableRef = useRef<HTMLDivElement>(null)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifier = isMac ? e.metaKey : e.ctrlKey
      
      if (modifier) {
        if (e.key === 'c' && (selectedCells.size > 0 || selectedCell)) {
          e.preventDefault()
          enhancedClipboard.copySelection(selectedCell || undefined)
        } else if (e.key === 'x' && (selectedCells.size > 0 || selectedCell)) {
          e.preventDefault()
          enhancedClipboard.cut(selectedCell || undefined)
        } else if (e.key === 'a') {
          e.preventDefault()
          selectAllRows()
        }
      }
      
      // Arrow key navigation
      if (selectedCell && !e.ctrlKey && !e.metaKey) {
        let newRow = selectedCell.row
        let newCol = selectedCell.col
        
        switch(e.key) {
          case 'ArrowUp':
            e.preventDefault()
            newRow = Math.max(0, newRow - 1)
            break
          case 'ArrowDown':
            e.preventDefault()
            newRow = Math.min(data.length - 1, newRow + 1)
            break
          case 'ArrowLeft':
            e.preventDefault()
            newCol = Math.max(0, newCol - 1)
            break
          case 'ArrowRight':
            e.preventDefault()
            newCol = Math.min(headers.length - 1, newCol + 1)
            break
          case 'Enter':
            e.preventDefault()
            newRow = Math.min(data.length - 1, newRow + 1)
            break
          case 'Tab':
            e.preventDefault()
            if (e.shiftKey) {
              newCol = Math.max(0, newCol - 1)
            } else {
              newCol = Math.min(headers.length - 1, newCol + 1)
            }
            break
        }
        
        if (newRow !== selectedCell.row || newCol !== selectedCell.col) {
          setSelectedCell({ row: newRow, col: newCol })
        }
      }
    }
    
    const handlePaste = (e: ClipboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA') {
        return
      }
      
      if (selectedCell || selectedCells.size > 0) {
        enhancedClipboard.handlePasteEvent(e, selectedCell || undefined)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('paste', handlePaste)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('paste', handlePaste)
    }
  }, [selectedCell, selectedCells, data.length, headers.length, enhancedClipboard])

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setSelectedCell({ row: rowIndex, col: colIndex })
  }

  const handleColumnAction = (action: string, colIndex: number) => {
    switch (action) {
      case 'insertBefore':
        insertColumnBefore(colIndex, `Column ${headers.length + 1}`)
        break
      case 'insertAfter':
        insertColumnAfter(colIndex, `Column ${headers.length + 1}`)
        break
      case 'delete':
        if (confirm(`Delete column "${headers[colIndex]}"?`)) {
          deleteColumn(colIndex)
        }
        break
      case 'enrich':
        // Open enrichment dialog
        break
      case 'attachments':
        // Open attachments dialog
        break
    }
  }

  const handleColumnResize = (colIndex: number, width: number) => {
    setColumnWidths(prev => ({ ...prev, [colIndex]: width }))
  }

  const handleExport = () => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'spreadsheet_data.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
        <p className="text-lg">No data loaded</p>
      </div>
    )
  }

  const handleCreateDashboard = () => {
    // Store the current data in session storage for the dashboard creation page
    sessionStorage.setItem('dashboardData', JSON.stringify({
      headers,
      rows: data
    }))
    router.push('/dashboard/create')
  }

  const handleAnalyze = () => {
    setAnalysisDialogOpen(true)
  }

  const handleSmartSelection = () => {
    setSmartSelectionOpen(true)
  }

  const handleExport = (format: 'csv' | 'json' | 'excel') => {
    // Export functionality here
    console.log('Export as:', format)
  }

  const handleGenerateOutput = () => {
    // Open output sidebar
    console.log('Generate output')
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <SpreadsheetToolbar
        hasData={data.length > 0}
        hasSelection={selectedRows.size > 0 || selectedCells.size > 0}
        selectedRowCount={selectedRows.size}
        selectedColumnCount={selectedCells.size}
        showSelectionTools={selectedRows.size > 0 || selectedCells.size > 0}
        showCellDetails={showCellDetails}
        selectedCell={selectedCell}
        onAnalyze={handleAnalyze}
        onSmartSelection={handleSmartSelection}
        onSelectAll={selectAllRows}
        onClearSelection={clearSelection}
        onExport={handleExport}
        onGenerateOutput={handleGenerateOutput}
        onCreateDashboard={handleCreateDashboard}
        onToggleCellDetails={() => setShowCellDetails(!showCellDetails)}
      />
      
      {/* Main Spreadsheet Area */}
      <div className="flex-1 overflow-auto" ref={tableRef}>
        <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }} tabIndex={0}>
          <SpreadsheetHeader
            headers={headers}
            data={data}
            selectedRows={selectedRows}
            enrichmentStatus={enrichmentStatus}
            columnEnrichmentConfigs={columnEnrichmentConfigs}
            columnWidths={columnWidths}
            onSelectAllRows={selectAllRows}
            onClearSelection={clearSelection}
            onColumnAction={handleColumnAction}
            onOpenEnrichment={(colIndex) => {}}
            onColumnResize={handleColumnResize}
            getColumnAttachments={getColumnAttachments}
          />
          
          <SpreadsheetBody
            data={data}
            headers={headers}
            selectedRows={selectedRows}
            selectedCells={selectedCells}
            selectedCell={selectedCell}
            enrichmentStatus={enrichmentStatus}
            columnEnrichmentConfigs={columnEnrichmentConfigs}
            columnWidths={columnWidths}
            onToggleRowSelection={toggleRowSelection}
            onCellClick={handleCellClick}
            onCellChange={updateCell}
            onToggleCellSelection={toggleCellSelection}
            onEnrichCell={() => {}}
            onManageAttachments={() => {}}
            onAddRow={addRow}
            getCellExplanation={getCellExplanation}
            getCellMetadata={getCellMetadata}
            getCellAttachments={getCellAttachments}
          />
        </table>
      </div>
      
      {/* Status Bar */}
      <SpreadsheetStatusBar
        totalRows={data.length}
        totalColumns={headers.length}
        selectedRowCount={selectedRows.size}
        selectedCellCount={selectedCells.size}
        selectedColumnCount={0}
        onClearSelection={clearSelection}
        onSmartSelect={() => setSmartSelectionOpen(true)}
        onAnalyze={() => setAnalysisDialogOpen(true)}
        onExport={handleExport}
      />
    </div>
  )
}