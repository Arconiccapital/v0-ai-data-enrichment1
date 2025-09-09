"use client"

import React from 'react'
import { SpreadsheetCell } from './SpreadsheetCell'
import { EnrichmentConfig } from '@/types/spreadsheet'

interface MemoizedSpreadsheetCellProps {
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
}

// Memoized version of SpreadsheetCell for better performance
export const MemoizedSpreadsheetCell = React.memo(
  SpreadsheetCell,
  (prevProps, nextProps) => {
    // Custom comparison function
    // Only re-render if these specific props change
    return (
      prevProps.value === nextProps.value &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isEditing === nextProps.isEditing &&
      prevProps.isEnriched === nextProps.isEnriched &&
      prevProps.enrichmentStatus === nextProps.enrichmentStatus
    )
  }
)

MemoizedSpreadsheetCell.displayName = 'MemoizedSpreadsheetCell'