"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { X, Download, Share2, Maximize2, Minimize2, RefreshCw, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardPreviewProps {
  dashboard: any
  onClose: () => void
  onRefresh?: () => void
  isLoading?: boolean
}

export function DashboardPreview({ dashboard, onClose, onRefresh, isLoading }: DashboardPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Format value based on type
  const formatValue = (value: any, format?: string) => {
    if (format === 'currency') return `$${value.toLocaleString()}`
    if (format === 'percentage') return `${value}%`
    if (format === 'number') return value.toLocaleString()
    return value
  }

  // Render widget based on type
  const renderWidget = (widget: any) => {
    switch (widget.type) {
      case 'kpi':
      case 'metric':
        return (
          <Card key={widget.id} className={cn(
            "h-full",
            widget.size === 'large' && "col-span-2",
            widget.size === 'full' && "col-span-full"
          )}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {formatValue(widget.data?.value || 0, widget.config?.format)}
              </div>
              <p className="text-xs text-muted-foreground">{widget.title}</p>
              {widget.data?.change && (
                <div className="flex items-center mt-2">
                  {widget.data.change.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={cn(
                    "text-sm",
                    widget.data.change.trend === 'up' ? "text-green-600" : "text-red-600"
                  )}>
                    {widget.data.change.percentage}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 'chart':
        return (
          <Card key={widget.id} className={cn(
            "h-full",
            widget.size === 'large' && "col-span-2",
            widget.size === 'full' && "col-span-full"
          )}>
            <CardHeader>
              <CardTitle className="text-sm">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center bg-gray-50 rounded">
                <span className="text-gray-500">Chart: {widget.title}</span>
              </div>
            </CardContent>
          </Card>
        )

      case 'table':
        return (
          <Card key={widget.id} className={cn(
            "h-full overflow-auto",
            widget.size === 'large' && "col-span-2",
            widget.size === 'full' && "col-span-full"
          )}>
            <CardHeader>
              <CardTitle className="text-sm">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {widget.data?.columns?.map((col: any) => (
                        <th key={col.key} className="text-left p-2">{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {widget.data?.rows?.slice(0, 5).map((row: any, idx: number) => (
                      <tr key={idx} className="border-b">
                        {widget.data?.columns?.map((col: any) => (
                          <td key={col.key} className="p-2">{row[col.key]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )

      case 'progress':
        return (
          <Card key={widget.id} className={cn(
            "h-full",
            widget.size === 'large' && "col-span-2",
            widget.size === 'full' && "col-span-full"
          )}>
            <CardHeader>
              <CardTitle className="text-sm">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(widget.data || {}).map(([key, value]: [string, any]) => (
                <div key={key} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{key}</span>
                    <span className="text-sm font-medium">{value}%</span>
                  </div>
                  <Progress value={value} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        )

      default:
        return (
          <Card key={widget.id} className={cn(
            "h-full",
            widget.size === 'large' && "col-span-2",
            widget.size === 'full' && "col-span-full"
          )}>
            <CardHeader>
              <CardTitle className="text-sm">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center bg-gray-50 rounded">
                <span className="text-gray-500">{widget.type}: {widget.title}</span>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error Generating Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2">
              <Button onClick={onRefresh} variant="outline">Try Again</Button>
              <Button onClick={onClose}>Close</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <Card className="p-8">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <h3 className="font-semibold">Generating Dashboard</h3>
              <p className="text-sm text-gray-600 mt-1">Claude is analyzing your data...</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-white flex flex-col",
      isFullscreen ? "p-0" : "p-4 md:p-8"
    )}>
      {/* Overlay Background */}
      {!isFullscreen && (
        <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      )}

      {/* Dashboard Container */}
      <div className={cn(
        "relative bg-white rounded-lg shadow-xl flex flex-col",
        isFullscreen ? "h-full w-full rounded-none" : "max-w-7xl mx-auto w-full h-full max-h-[90vh]"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">{dashboard?.title || "AI Generated Dashboard"}</h2>
            {dashboard?.description && (
              <p className="text-sm text-gray-600 mt-1">{dashboard.description}</p>
            )}
            {dashboard?.theme && (
              <Badge variant="outline" className="mt-2">{dashboard.theme}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Export functionality
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Share functionality
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6">
          {dashboard?.sections?.map((section: any, sectionIdx: number) => (
            <div key={sectionIdx} className="mb-8">
              {section.title && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  {section.description && (
                    <p className="text-sm text-gray-600">{section.description}</p>
                  )}
                </div>
              )}
              <div className={cn(
                "grid gap-4",
                section.layout === 'single' ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              )}>
                {section.widgets?.map((widget: any) => renderWidget(widget))}
              </div>
            </div>
          ))}

          {/* Insights Section */}
          {dashboard?.insights && dashboard.insights.length > 0 && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Key Insights</h3>
              <ul className="list-disc list-inside space-y-1">
                {dashboard.insights.map((insight: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-700">{insight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}