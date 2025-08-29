"use client"

import React from 'react'
import { Card } from '@/components/ui/card'
import { TemplateDefinition } from '@/src/types/templates'
import { cn } from '@/lib/utils'

interface TemplateCardProps {
  template: TemplateDefinition
  onSelect: (template: TemplateDefinition) => void
}

export function TemplateCard({ template, onSelect }: TemplateCardProps) {
  // Get first few columns and rows for preview
  const previewColumns = template.columns.slice(0, 3)
  const previewData = template.sampleData.slice(0, 4)

  return (
    <Card 
      className="p-0 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onSelect(template)}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b bg-gray-50">
        <h3 className="font-medium text-sm">{template.name}</h3>
      </div>

      {/* Preview Table */}
      <div className="overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-gray-50">
              {previewColumns.map((col, idx) => (
                <th 
                  key={idx} 
                  className="text-left font-medium text-gray-700 px-3 py-2 truncate max-w-[120px]"
                  title={col.name}
                >
                  {col.name}
                </th>
              ))}
              {template.columns.length > 3 && (
                <th className="text-left font-medium text-gray-400 px-3 py-2">
                  ...
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b hover:bg-gray-50">
                {previewColumns.map((col, colIdx) => (
                  <td 
                    key={colIdx} 
                    className="px-3 py-2 truncate max-w-[120px] text-gray-600"
                    title={String(row[col.name] || '')}
                  >
                    {formatCellValue(row[col.name], col.type)}
                  </td>
                ))}
                {template.columns.length > 3 && (
                  <td className="px-3 py-2 text-gray-400">
                    ...
                  </td>
                )}
              </tr>
            ))}
            {template.sampleData.length > 4 && (
              <tr className="border-b">
                <td colSpan={previewColumns.length + 1} className="px-3 py-2 text-center text-gray-400 text-xs">
                  ... {template.sampleData.length - 4} more rows
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-end">
        <div className="text-xs text-gray-500">
          {template.columns.length} columns • {template.sampleData.length} sample rows
        </div>
      </div>
    </Card>
  )
}

function formatCellValue(value: any, type: string): string {
  if (value === null || value === undefined) return ''
  
  switch (type) {
    case 'currency':
      if (typeof value === 'number') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: value >= 1000000 ? 'compact' : 'standard',
          maximumFractionDigits: 0
        }).format(value)
      }
      return String(value)
    
    case 'number':
      if (typeof value === 'number') {
        return new Intl.NumberFormat('en-US', {
          notation: value >= 10000 ? 'compact' : 'standard'
        }).format(value)
      }
      return String(value)
    
    case 'date':
      if (value instanceof Date) {
        return value.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        })
      }
      // Try to parse string dates
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        })
      }
      return String(value)
    
    case 'boolean':
      return value ? '✓' : '✗'
    
    case 'url':
      // Extract domain for cleaner display
      try {
        const url = new URL(value)
        return url.hostname.replace('www.', '')
      } catch {
        return String(value)
      }
    
    case 'email':
      // Truncate long emails
      const email = String(value)
      if (email.length > 20) {
        return email.substring(0, 17) + '...'
      }
      return email
    
    default:
      // Truncate long text
      const text = String(value)
      if (text.length > 25) {
        return text.substring(0, 22) + '...'
      }
      return text
  }
}