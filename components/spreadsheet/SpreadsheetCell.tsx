"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Cell, EnrichmentConfig } from '@/types/spreadsheet'

interface SpreadsheetCellProps {
  value: string | number | null
  rowIndex: number
  columnIndex: number
  isSelected: boolean
  isEditing: boolean
  isEnriched?: boolean
  enrichmentStatus?: 'pending' | 'processing' | 'completed' | 'error'
  enrichmentConfig?: EnrichmentConfig
  onChange: (value: string) => void
  onStartEdit: () => void
  onEndEdit: () => void
  onMouseDown: (e: React.MouseEvent) => void
  onMouseEnter: () => void
  onDoubleClick: () => void
  className?: string
}

export function SpreadsheetCell({
  value,
  rowIndex,
  columnIndex,
  isSelected,
  isEditing,
  isEnriched,
  enrichmentStatus,
  enrichmentConfig,
  onChange,
  onStartEdit,
  onEndEdit,
  onMouseDown,
  onMouseEnter,
  onDoubleClick,
  className
}: SpreadsheetCellProps) {
  const [editValue, setEditValue] = useState(value?.toString() || '')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Update edit value when prop value changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value?.toString() || '')
    }
  }, [value, isEditing])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onChange(editValue)
      onEndEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setEditValue(value?.toString() || '')
      onEndEdit()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      onChange(editValue)
      onEndEdit()
    }
  }

  const handleBlur = () => {
    onChange(editValue)
    onEndEdit()
  }

  const getCellClassName = () => {
    const classes = [
      'relative border-r border-b border-gray-200 bg-white',
      'hover:bg-gray-50 transition-colors'
    ]

    if (isSelected) {
      classes.push('bg-blue-50 hover:bg-blue-100')
    }

    if (isEnriched) {
      classes.push('bg-green-50')
    }

    if (enrichmentStatus === 'processing') {
      classes.push('bg-yellow-50 animate-pulse')
    }

    if (enrichmentStatus === 'error') {
      classes.push('bg-red-50')
    }

    if (className) {
      classes.push(className)
    }

    return cn(...classes)
  }

  const renderEnrichmentIndicator = () => {
    if (!enrichmentStatus || enrichmentStatus === 'completed') return null

    const indicators = {
      pending: (
        <div className="absolute top-1 right-1 text-gray-400">
          <div className="h-2 w-2 rounded-full bg-gray-400" />
        </div>
      ),
      processing: (
        <div className="absolute top-1 right-1 text-blue-500">
          <Loader2 className="h-3 w-3 animate-spin" />
        </div>
      ),
      error: (
        <div className="absolute top-1 right-1 text-red-500">
          <AlertCircle className="h-3 w-3" />
        </div>
      )
    }

    return indicators[enrichmentStatus]
  }

  const formatDisplayValue = (val: string | number | null): string => {
    if (val === null || val === undefined) return ''
    
    // Format numbers with commas if needed
    if (typeof val === 'number') {
      if (Number.isInteger(val)) {
        return val.toLocaleString()
      }
      return val.toLocaleString(undefined, { maximumFractionDigits: 2 })
    }
    
    return val.toString()
  }

  return (
    <td
      className={getCellClassName()}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onDoubleClick={onDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="w-full h-full px-2 py-1 text-sm border-2 border-blue-500 rounded-none outline-none bg-white"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="relative px-2 py-1 min-h-[32px] flex items-center">
          <span className={cn(
            "text-sm truncate",
            !value && "text-gray-400"
          )}>
            {formatDisplayValue(value) || ''}
          </span>
          {renderEnrichmentIndicator()}
          {isEnriched && enrichmentStatus === 'completed' && (
            <div className="absolute top-1 right-1 text-green-500">
              <Check className="h-3 w-3" />
            </div>
          )}
        </div>
      )}
    </td>
  )
}