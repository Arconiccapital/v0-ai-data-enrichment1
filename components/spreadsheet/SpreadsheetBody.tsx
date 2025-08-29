"use client"

import { Plus } from "lucide-react"
import { SpreadsheetRow } from "./SpreadsheetRow"

interface SpreadsheetBodyProps {
  data: string[][]
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
  onAddRow: () => void
  getCellExplanation: (rowIndex: number, colIndex: number) => string | undefined
  getCellMetadata: (rowIndex: number, colIndex: number) => any
  getCellAttachments: (rowIndex: number, colIndex: number) => any[]
}

export function SpreadsheetBody({
  data,
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
  onAddRow,
  getCellExplanation,
  getCellMetadata,
  getCellAttachments,
}: SpreadsheetBodyProps) {
  return (
    <tbody>
      {data.map((row, rowIndex) => (
        <SpreadsheetRow
          key={rowIndex}
          row={row}
          rowIndex={rowIndex}
          headers={headers}
          selectedRows={selectedRows}
          selectedCells={selectedCells}
          selectedCell={selectedCell}
          enrichmentStatus={enrichmentStatus}
          columnEnrichmentConfigs={columnEnrichmentConfigs}
          columnWidths={columnWidths}
          onToggleRowSelection={onToggleRowSelection}
          onCellClick={onCellClick}
          onCellChange={onCellChange}
          onToggleCellSelection={onToggleCellSelection}
          onEnrichCell={onEnrichCell}
          onManageAttachments={onManageAttachments}
          getCellExplanation={getCellExplanation}
          getCellMetadata={getCellMetadata}
          getCellAttachments={getCellAttachments}
        />
      ))}
      
      {/* Add Row Button */}
      <tr className="border-t-2 border-gray-300 hover:bg-gray-50 bg-gray-50/50">
        <td 
          colSpan={headers.length + 2}
          className="text-center py-3 cursor-pointer transition-colors"
          onClick={onAddRow}
        >
          <div className="flex items-center justify-center text-gray-600 hover:text-gray-900">
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Add Row</span>
          </div>
        </td>
      </tr>
    </tbody>
  )
}