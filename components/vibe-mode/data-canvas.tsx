"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface DataCanvasProps {
  headers: string[]
  data: string[][]
  selectedCells: Set<string>
  onCellSelect: (cells: Set<string>) => void
}

export function DataCanvas({ headers, data, selectedCells, onCellSelect }: DataCanvasProps) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    const cellKey = `${rowIndex}-${colIndex}`
    const newSelection = new Set(selectedCells)
    
    if (newSelection.has(cellKey)) {
      newSelection.delete(cellKey)
    } else {
      newSelection.add(cellKey)
    }
    
    onCellSelect(newSelection)
  }

  const getCellStyle = (value: string) => {
    // Simple monochrome styling based on value
    const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''))
    
    if (!isNaN(numValue)) {
      if (numValue > 1000) {
        return "bg-gray-100"
      } else if (numValue > 100) {
        return "bg-gray-50"
      }
    }
    
    return "bg-white"
  }

  return (
    <div className="flex-1 overflow-auto bg-white">
      {/* Data Table */}
      <div className="p-6">
        <div className="space-y-4">
          {/* Headers */}
          <div className="flex gap-3 mb-2">
            {headers.map((header, index) => (
              <div
                key={index}
                className="flex-1 min-w-[150px] px-4 py-3 bg-gray-100 rounded border border-gray-300"
              >
                <h3 className="text-sm font-semibold text-gray-800">{header}</h3>
              </div>
            ))}
          </div>

          {/* Data Rows */}
          {data.slice(0, 10).map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex gap-3"
            >
              {row.map((cell, colIndex) => {
                const cellKey = `${rowIndex}-${colIndex}`
                const isSelected = selectedCells.has(cellKey)
                const isHovered = hoveredCell === cellKey

                return (
                  <div
                    key={colIndex}
                    className={cn(
                      "flex-1 min-w-[150px] px-4 py-3 rounded",
                      "border transition-all cursor-pointer",
                      getCellStyle(cell),
                      isSelected 
                        ? "border-black bg-gray-100" 
                        : "border-gray-300 hover:border-gray-400",
                      isHovered && "bg-gray-50"
                    )}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onMouseEnter={() => setHoveredCell(cellKey)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <div className="text-sm text-gray-700">
                      {cell || <span className="text-gray-400">empty</span>}
                    </div>
                    
                    {/* Value indicator */}
                    {!isNaN(parseFloat(cell)) && parseFloat(cell) > 1000 && (
                      <div className="mt-1">
                        <span className="text-xs text-gray-500">High value</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}

          {data.length > 10 && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                ... and {data.length - 10} more rows
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}