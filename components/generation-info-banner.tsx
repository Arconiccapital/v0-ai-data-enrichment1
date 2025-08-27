"use client"

import React, { useState } from 'react'
import { X, Search, Globe, Info, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface GenerationMetadata {
  prompt: string
  query: string
  response: string
  citations: string[]
  timestamp: string
  itemsFound: number
  requestedCount: number
  source: string
}

interface GenerationInfoBannerProps {
  metadata: GenerationMetadata
  onDismiss?: () => void
}

export function GenerationInfoBanner({ metadata, onDismiss }: GenerationInfoBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showFullDetails, setShowFullDetails] = useState(false)

  return (
    <>
      {/* Banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2.5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Search className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              {/* Main Info Line */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-blue-900">Data Generated</span>
                <span className="text-sm text-blue-700">
                  Query: "{metadata.prompt}"
                </span>
                <span className="text-xs text-blue-600">
                  • Found {metadata.itemsFound} of {metadata.requestedCount} requested
                </span>
              </div>

              {/* Expandable Details */}
              {isExpanded && (
                <div className="mt-2 space-y-2">
                  {/* Sources */}
                  {metadata.citations && metadata.citations.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-blue-700">Sources:</span>
                      <div className="flex flex-wrap gap-1">
                        {metadata.citations.slice(0, 3).map((citation, idx) => {
                          const isUrl = citation.startsWith('http')
                          const displayText = isUrl ? new URL(citation).hostname : citation
                          
                          return (
                            <a
                              key={idx}
                              href={isUrl ? citation : '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                "inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded",
                                isUrl 
                                  ? "bg-white border border-blue-200 text-blue-600 hover:bg-blue-50"
                                  : "bg-blue-100 text-blue-700"
                              )}
                            >
                              [{idx + 1}] {displayText}
                              {isUrl && <ExternalLink className="h-2.5 w-2.5" />}
                            </a>
                          )
                        })}
                        {metadata.citations.length > 3 && (
                          <span className="text-xs text-blue-600">
                            +{metadata.citations.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-xs text-blue-600">
                    Generated at: {new Date(metadata.timestamp).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 px-2 text-blue-700 hover:text-blue-900 hover:bg-blue-100"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  More
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullDetails(true)}
              className="h-7 px-2 text-blue-700 hover:text-blue-900 hover:bg-blue-100"
            >
              <Info className="h-3 w-3 mr-1" />
              Full Details
            </Button>

            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-7 w-7 p-0 text-blue-600 hover:text-blue-900 hover:bg-blue-100"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Full Details Dialog */}
      <Dialog open={showFullDetails} onOpenChange={setShowFullDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              Generation Audit Trail
            </DialogTitle>
            <DialogDescription>
              Complete details about how this data was generated
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Search Details */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Search Details</h3>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm mb-2">
                  <span className="font-medium">Original Prompt:</span> {metadata.prompt}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Search Query:</span> {metadata.query}
                </p>
              </div>
            </div>

            {/* Results Summary */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Results</h3>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm">
                  Found <span className="font-medium">{metadata.itemsFound}</span> items 
                  (requested: {metadata.requestedCount})
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Source: {metadata.source}
                </p>
              </div>
            </div>

            {/* Sources */}
            {metadata.citations && metadata.citations.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">
                  Sources ({metadata.citations.length})
                </h3>
                <div className="space-y-1 max-h-48 overflow-y-auto bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {metadata.citations.map((citation, idx) => {
                    const isUrl = citation.startsWith('http')
                    const displayText = isUrl ? new URL(citation).hostname : citation
                    
                    return (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 text-xs font-medium">[{idx + 1}]</span>
                        {isUrl ? (
                          <a
                            href={citation}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline break-all"
                          >
                            {displayText}
                            <span className="text-gray-400 ml-1">({citation})</span>
                          </a>
                        ) : (
                          <span className="text-xs text-gray-700">{citation}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Raw Response (Collapsible) */}
            {metadata.response && (
              <details className="space-y-2">
                <summary className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-gray-900">
                  Raw Response from Perplexity
                </summary>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {metadata.response}
                  </pre>
                </div>
              </details>
            )}

            {/* Metadata */}
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500">
                Generated at: {new Date(metadata.timestamp).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                Data source: {metadata.source}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}