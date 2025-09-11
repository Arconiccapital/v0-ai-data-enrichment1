"use client"

import { Loader2 } from "lucide-react"
import { DynamicComponentRenderer } from "./dynamic-component-renderer"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"

interface GeneratedViewProps {
  code?: string
  isLoading?: boolean
  error?: string
}

export function GeneratedView({ code, isLoading, error }: GeneratedViewProps) {
  const { headers, data } = useSpreadsheetStore()
  
  console.log('🎨 GeneratedView:', {
    hasCode: !!code,
    isLoading,
    hasError: !!error,
    dataRows: data.length,
    headers: headers.length
  })
  
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Generating your visualization...</p>
          <p className="text-sm text-gray-500 mt-2">Claude is writing custom code for your request</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Generation Error</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }
  
  if (!code) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            AI Code Canvas
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            I'll write custom React components for any visualization you imagine. No templates, no limits.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700">Try:</p>
              <p className="text-xs text-gray-500 mt-1">"Create a beautiful executive report"</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700">Try:</p>
              <p className="text-xs text-gray-500 mt-1">"Build a dark mode dashboard"</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700">Try:</p>
              <p className="text-xs text-gray-500 mt-1">"Show this like Apple's website"</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700">Try:</p>
              <p className="text-xs text-gray-500 mt-1">"Make it fun and colorful"</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-8">
            Each request generates completely unique code - no predefined templates
          </p>
        </div>
      </div>
    )
  }
  
  // Convert spreadsheet data to array of objects for easier use in components
  const dataObjects = data.map(row => {
    const obj: any = {}
    headers.forEach((header, index) => {
      obj[header] = row[index]
    })
    return obj
  })
  
  // Render the dynamically generated component
  return <DynamicComponentRenderer code={code} data={dataObjects} headers={headers} />
}