"use client"

import { Check, X, AlertCircle, ExternalLink, Globe, Calendar, Shield, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface EnrichmentDetailsProps {
  value: string
  metadata: any
  className?: string
}

export function EnrichmentDetails({ value, metadata, className }: EnrichmentDetailsProps) {
  if (!metadata) return null

  // Parse verification data if it exists
  const verification = metadata.verification || {}
  const confidence = metadata.confidence || 0
  const status = metadata.status || 'unknown'
  const provider = metadata.provider || 'unknown'
  
  // Parse sources/citations
  const sources = metadata.citations || []
  const hasVerifiedSources = sources.length > 0
  
  // Parse the response to get verification details
  let responseData: any = {}
  try {
    if (metadata.response && metadata.response.startsWith('{')) {
      responseData = JSON.parse(metadata.response)
    }
  } catch (e) {
    // Response is not JSON, that's okay
  }

  // Determine credibility of sources
  const getSourceCredibility = (source: any) => {
    const domain = source.domain || new URL(source.uri || source).hostname
    // High credibility domains
    if (domain.includes('.gov') || domain.includes('.edu') || 
        domain.includes('wikipedia.org') || domain.includes('reuters.com') ||
        domain.includes('bloomberg.com') || domain.includes('forbes.com')) {
      return 'high'
    }
    // Medium credibility
    if (domain.includes('.com') || domain.includes('.org')) {
      return 'medium'
    }
    return 'low'
  }

  // Format source for display
  const formatSource = (source: any) => {
    if (typeof source === 'string') {
      try {
        const url = new URL(source)
        return {
          uri: source,
          domain: url.hostname.replace('www.', ''),
          title: url.hostname
        }
      } catch {
        return { uri: source, domain: 'Unknown', title: source }
      }
    }
    return source
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 border-b pb-2">
        <Sparkles className="h-4 w-4 text-blue-500" />
        <span className="font-semibold text-sm">Enrichment Details</span>
        <Badge variant="outline" className="ml-auto text-xs">
          {provider.toUpperCase()}
        </Badge>
      </div>

      {/* Search Context */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-700 mb-1">
          <span className="font-medium">Searched for:</span>{' '}
          {metadata.query || 'information'}
        </p>
        {metadata.entity && (
          <p className="text-xs text-blue-600">
            <span className="font-medium">Entity:</span> {metadata.entity}
          </p>
        )}
      </div>

      {/* Result Value */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-700">Result:</p>
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <p className="font-medium text-sm text-gray-900">{value}</p>
        </div>
      </div>

      {/* Verification Status */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-700">Verification:</p>
        <div className="space-y-2">
          {/* Entity Verification */}
          {verification.entity_matched && (
            <div className="flex items-center gap-2 text-xs">
              <Check className="h-3 w-3 text-green-600" />
              <span className="text-gray-600">
                Entity verified: <span className="font-medium">{verification.entity_matched}</span>
              </span>
            </div>
          )}
          
          {/* Location Verification */}
          {verification.location_matched && (
            <div className="flex items-center gap-2 text-xs">
              <Check className="h-3 w-3 text-green-600" />
              <span className="text-gray-600">
                Location: <span className="font-medium">{verification.location_matched}</span>
              </span>
            </div>
          )}
          
          {/* Domain Verification */}
          {verification.domain_matched && (
            <div className="flex items-center gap-2 text-xs">
              <Check className="h-3 w-3 text-green-600" />
              <span className="text-gray-600">
                Domain: <span className="font-medium">{verification.domain_matched}</span>
              </span>
            </div>
          )}

          {/* Confidence Score */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Confidence:</span>
              <span className="font-medium">{Math.round(confidence * 100)}%</span>
            </div>
            <Progress value={confidence * 100} className="h-1.5" />
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {status === 'success' && (
              <Badge variant="default" className="text-xs bg-green-600">
                <Check className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            {status === 'needs_review' && (
              <Badge variant="secondary" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Needs Review
              </Badge>
            )}
            {status === 'not_found' && (
              <Badge variant="destructive" className="text-xs">
                <X className="h-3 w-3 mr-1" />
                Not Found
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Sources */}
      {sources.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-700">Sources:</p>
            <span className="text-xs text-gray-500">
              {hasVerifiedSources ? `${sources.length} sources` : 'No sources'}
            </span>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sources.map((source: any, idx: number) => {
              const formattedSource = formatSource(source)
              const credibility = getSourceCredibility(formattedSource)
              
              return (
                <Card key={idx} className="p-2.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-2">
                    {/* Source Icon */}
                    <div className="mt-0.5">
                      {credibility === 'high' && (
                        <Shield className="h-3.5 w-3.5 text-green-600" />
                      )}
                      {credibility === 'medium' && (
                        <Globe className="h-3.5 w-3.5 text-blue-600" />
                      )}
                      {credibility === 'low' && (
                        <Globe className="h-3.5 w-3.5 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Source Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-gray-900 truncate">
                          {formattedSource.title || formattedSource.domain}
                        </span>
                        {credibility === 'high' && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      {formattedSource.snippet && (
                        <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">
                          "{formattedSource.snippet}"
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-400">
                          {formattedSource.domain}
                        </span>
                        {formattedSource.date && (
                          <>
                            <span className="text-[10px] text-gray-300">•</span>
                            <span className="text-[10px] text-gray-400">
                              {formattedSource.date}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* View Source Link */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => window.open(formattedSource.uri, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Additional Metadata */}
      <div className="pt-2 border-t space-y-1">
        <div className="flex items-center justify-between text-[10px] text-gray-400">
          <span>Provider: {provider}</span>
          <span>Model: {metadata.model}</span>
        </div>
        {metadata.timestamp && (
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <Calendar className="h-3 w-3" />
            <span>Enriched: {new Date(metadata.timestamp).toLocaleString()}</span>
          </div>
        )}
        {metadata.routerType && (
          <div className="text-[10px] text-gray-400">
            Router: {metadata.routerType} • Cost: ${(metadata.estimatedCost || 0).toFixed(6)}
          </div>
        )}
      </div>

      {/* Full Response (Expandable) */}
      {metadata.response && metadata.response !== value && (
        <details className="text-xs">
          <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
            View raw response
          </summary>
          <pre className="mt-2 p-2 bg-gray-50 rounded text-[10px] overflow-x-auto">
            {typeof metadata.response === 'string' 
              ? metadata.response 
              : JSON.stringify(metadata.response, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}