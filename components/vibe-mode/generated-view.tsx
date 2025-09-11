"use client"

import { Loader2 } from "lucide-react"
import { DynamicComponentRenderer } from "./dynamic-component-renderer"
import { ArtifactViewer } from "./artifact-viewer"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { useCallback, useState } from "react"

interface GeneratedViewProps {
  code?: string
  artifactHtml?: string
  isLoading?: boolean
  error?: string
  lastPrompt?: string
}

export function GeneratedView({ code, artifactHtml, isLoading, error, lastPrompt }: GeneratedViewProps) {
  const { headers, data } = useSpreadsheetStore()
  const [artifactOnError, setArtifactOnError] = useState<string>('')
  
  // Must call hooks unconditionally at the top level
  const handleRendererError = useCallback(async () => {
    // Attempt artifact fallback using lastPrompt or a generic instruction
    try {
      const prompt = lastPrompt || `Create a clean dashboard using columns: ${headers.join(', ')}`
      const res = await fetch('/api/vibe-artifact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, headers, data })
      })
      const json = await res.json()
      if (json.success && json.html) {
        setArtifactOnError(json.html)
      }
    } catch (e) {
      // ignore; SafeFallbackComponent remains visible
      console.warn('Artifact fallback after renderer error failed', e)
    }
  }, [lastPrompt, headers, data])
  
  console.log('🎨 GeneratedView:', {
    hasCode: !!code,
    hasArtifact: !!artifactHtml || !!artifactOnError,
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
  
  if (!code && !artifactHtml && !artifactOnError) {
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
  
  // Prefer artifact if present, else use dynamic component
  if (artifactHtml || artifactOnError) {
    return <ArtifactViewer html={artifactHtml || artifactOnError} headers={headers} data={data} />
  }

  // Convert spreadsheet data to array of objects for dynamic component
  const dataObjects = data.map(row => {
    const obj: any = {}
    headers.forEach((header, index) => {
      obj[header] = row[index]
    })
    return obj
  })

  return <DynamicComponentRenderer code={code!} data={dataObjects} headers={headers} onError={handleRendererError} />
}
