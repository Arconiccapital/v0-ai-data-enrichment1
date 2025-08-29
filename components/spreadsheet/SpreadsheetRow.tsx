"use client"

import { memo } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { SpreadsheetCell } from "../spreadsheet-cell"

interface SpreadsheetRowProps {
  row: string[]
  rowIndex: number
  headers: string[]
  selectedRows: Set<number>
  selectedCells: Set<string>
  selectedCell: { row: number; col: number } | null
  enrichmentStatus: Record<number, any>
  columnEnrichmentConfigs: Record<number, any>
  columnWidths: Record<number, number>
  onToggleRowSelection: (rowIndex: number) => void
  onCellClick: (rowIndex: number, colIndex: number) => void
  onCellChange: (value: string, rowIndex: number, colIndex: number) => void
  onToggleCellSelection: (rowIndex: number, colIndex: number) => void
  onEnrichCell: (colIndex: number, scope: 'cell' | 'selected' | 'all', rowIndex?: number) => void
  onManageAttachments: (rowIndex: number, colIndex: number) => void
  getCellExplanation: (rowIndex: number, colIndex: number) => string | undefined
  getCellMetadata: (rowIndex: number, colIndex: number) => any
  getCellAttachments: (rowIndex: number, colIndex: number) => any[]
}

export const SpreadsheetRow = memo(function SpreadsheetRow({
  row,
  rowIndex,
  headers,
  selectedRows,
  selectedCells,
  selectedCell,
  enrichmentStatus,
  columnEnrichmentConfigs,
  columnWidths,
  onToggleRowSelection,
  onCellClick,
  onCellChange,
  onToggleCellSelection,
  onEnrichCell,
  onManageAttachments,
  getCellExplanation,
  getCellMetadata,
  getCellAttachments,
}: SpreadsheetRowProps) {
  const isRowSelected = selectedRows.has(rowIndex)
  
  const isCellEnriching = (colIndex: number) => {
    return enrichmentStatus[colIndex]?.enriching && 
           enrichmentStatus[colIndex]?.currentRow === rowIndex
  }
  
  const isCellSelected = (colIndex: number) => {
    return selectedCell?.row === rowIndex && selectedCell?.col === colIndex
  }
  
  const isMultiSelected = (colIndex: number) => {
    return selectedCells.has(`${rowIndex}-${colIndex}`)
  }

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 group">
      {/* Row Checkbox */}
      <td className="text-center border-r border-gray-200 bg-white sticky left-0 z-10" 
          style={{ width: '40px', height: '48px', boxSizing: 'border-box' }}>
        <Checkbox
          checked={isRowSelected}
          onCheckedChange={() => onToggleRowSelection(rowIndex)}
        />
      </td>
      
      {/* Row Number */}
      <td className="text-center text-xs font-medium text-gray-600 border-r border-gray-200 bg-white sticky left-[40px] z-10" 
          style={{ width: '48px', height: '48px', boxSizing: 'border-box' }}>
        {rowIndex + 1}
      </td>
      
      {/* Data Cells */}
      {row.map((cell, colIndex) => (
        <SpreadsheetCell
          key={`${rowIndex}-${colIndex}`}
          value={cell}
          rowIndex={rowIndex}
          colIndex={colIndex}
          isSelected={isCellSelected(colIndex)}
          isEnriching={isCellEnriching(colIndex)}
          isMultiSelected={isMultiSelected(colIndex)}
          explanation={getCellExplanation(rowIndex, colIndex)}
          metadata={getCellMetadata(rowIndex, colIndex)}
          columnWidth={columnWidths[colIndex] || 200}
          isColumnConfigured={columnEnrichmentConfigs[colIndex]?.isConfigured}
          attachmentCount={getCellAttachments(rowIndex, colIndex).length}
          onCellClick={onCellClick}
          onCellChange={onCellChange}
          onCopyCell={() => {}}
          onPasteCell={() => {}}
          onCutCell={() => {}}
          onToggleSelection={onToggleCellSelection}
          onEnrichCell={onEnrichCell}
          onManageAttachments={onManageAttachments}
        />
      ))}
    </tr>
  )
})