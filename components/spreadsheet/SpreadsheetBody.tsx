"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { SpreadsheetCell } from './SpreadsheetCell'
import { Selection } from '@/types/spreadsheet'

interface SpreadsheetBodyProps {
  data: (string | number | null)[][]
  headers: string[]
  selection: Selection | null
  editingCell: { row: number; col: number } | null
  enrichedCells: Set<string>
  enrichmentStatus: Record<string, 'pending' | 'processing' | 'completed' | 'error'>
  columnEnrichmentConfigs: Record<number, any>
  onCellEdit: (row: number, col: number, value: string) => void
  onCellSelect: (row: number, col: number, shiftKey: boolean) => void
  onCellDoubleClick: (row: number, col: number) => void
  onStartEdit: (row: number, col: number) => void
  onEndEdit: () => void
  className?: string
}

export function SpreadsheetBody({
  data,
  headers,
  selection,
  editingCell,
  enrichedCells,
  enrichmentStatus,
  columnEnrichmentConfigs,
  onCellEdit,
  onCellSelect,
  onCellDoubleClick,
  onStartEdit,
  onEndEdit,
  className
}: SpreadsheetBodyProps) {
  const isCellSelected = (row: number, col: number): boolean => {
    if (!selection) return false
    return (
      row >= selection.startRow &&
      row <= selection.endRow &&
      col >= selection.startCol &&
      col <= selection.endCol
    )
  }

  const getCellKey = (row: number, col: number): string => {
    return `${row}-${col}`
  }

  const handleCellMouseDown = (row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault()
    onCellSelect(row, col, e.shiftKey || e.metaKey)
  }

  const handleCellChange = (row: number, col: number, value: string) => {
    onCellEdit(row, col, value)
  }

  return (
    <tbody className={cn("bg-white", className)}>
      {data.map((row, rowIndex) => (
        <tr key={rowIndex} className="border-b border-gray-200 hover:bg-gray-50">
          {/* Row number */}
          <td className="sticky left-0 z-10 w-12 min-w-[48px] bg-gray-100 border-r border-gray-200 text-center">
            <div className="px-2 py-1 text-xs text-gray-500">
              {rowIndex + 1}
            </div>
          </td>
          
          {/* Data cells */}
          {row.map((cell, colIndex) => {
            const cellKey = getCellKey(rowIndex, colIndex)
            const isSelected = isCellSelected(rowIndex, colIndex)
            const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex
            const isEnriched = enrichedCells.has(cellKey)
            const status = enrichmentStatus[cellKey]
            
            return (
              <SpreadsheetCell
                key={`${rowIndex}-${colIndex}`}
                value={cell}
                rowIndex={rowIndex}
                columnIndex={colIndex}
                isSelected={isSelected}
                isEditing={isEditing}
                isEnriched={isEnriched}
                enrichmentStatus={status}
                enrichmentConfig={columnEnrichmentConfigs[colIndex]}
                onChange={(value) => handleCellChange(rowIndex, colIndex, value)}
                onStartEdit={() => onStartEdit(rowIndex, colIndex)}
                onEndEdit={onEndEdit}
                onMouseDown={(e) => handleCellMouseDown(rowIndex, colIndex, e)}
                onMouseEnter={() => {
                  // Handle selection drag if needed
                }}
                onDoubleClick={() => onCellDoubleClick(rowIndex, colIndex)}
              />
            )
          })}
        </tr>
      ))}
      
      {/* Empty state */}
      {data.length === 0 && (
        <tr>
          <td colSpan={headers.length + 1} className="text-center py-8 text-gray-500">
            No data available. Add rows to get started.
          </td>
        </tr>
      )}
    </tbody>
  )
}