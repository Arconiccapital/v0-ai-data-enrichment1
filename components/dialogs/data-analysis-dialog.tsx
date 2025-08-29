"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Sparkles,
  Download,
  Info
} from "lucide-react"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { cn } from "@/lib/utils"

interface DataAnalysisDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DataAnalysisDialog({ open, onOpenChange }: DataAnalysisDialogProps) {
  const { analyzeData } = useSpreadsheetStore()
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeData> | null>(null)
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null)

  useEffect(() => {
    if (open) {
      const result = analyzeData()
      setAnalysis(result)
      setSelectedColumn(null)
    }
  }, [open, analyzeData])

  const handleExportAnalysis = () => {
    if (!analysis) return
    
    const report = {
      timestamp: new Date().toISOString(),
      ...analysis
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `data-analysis-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getCompletenessColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getCompletenessIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (percentage >= 50) return <AlertCircle className="h-4 w-4 text-yellow-600" />
    return <AlertCircle className="h-4 w-4 text-red-600" />
  }

  if (!analysis) return null

  const selectedColumnAnalysis = selectedColumn !== null 
    ? analysis.columnAnalyses[selectedColumn] 
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Data Analysis Report
          </DialogTitle>
          <DialogDescription>
            Comprehensive analysis of your spreadsheet data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Rows</p>
                  <p className="text-2xl font-bold">{analysis.totalRows}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Columns</p>
                  <p className="text-2xl font-bold">{analysis.totalColumns}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data Completeness</p>
                  <p className={cn("text-2xl font-bold", getCompletenessColor(analysis.overallCompleteness))}>
                    {analysis.overallCompleteness}%
                  </p>
                </div>
              </div>
              <Progress value={analysis.overallCompleteness} className="h-2" />
            </CardContent>
          </Card>

          {/* Insights */}
          {analysis.insights.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="mt-0.5">{getCompletenessIcon(analysis.overallCompleteness)}</div>
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Column Analysis */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Column Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.columnAnalyses.map((col, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-colors",
                      selectedColumn === index ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedColumn(index === selectedColumn ? null : index)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{col.columnName}</span>
                        <Badge variant="outline" className="text-xs">
                          {col.filledCells}/{col.totalCells} filled
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {getCompletenessIcon(col.completeness)}
                        <span className={cn("font-medium", getCompletenessColor(col.completeness))}>
                          {col.completeness}%
                        </span>
                      </div>
                    </div>
                    <Progress value={col.completeness} className="h-1.5" />
                    
                    {selectedColumn === index && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Unique values:</span> {col.uniqueValues}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Empty cells:</span> {col.emptyCells}
                          </div>
                        </div>
                        
                        {/* Data Types */}
                        <div>
                          <p className="text-sm font-medium mb-1">Data Types Detected:</p>
                          <div className="flex flex-wrap gap-1">
                            {col.dataTypes.emails > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                Emails: {col.dataTypes.emails}
                              </Badge>
                            )}
                            {col.dataTypes.urls > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                URLs: {col.dataTypes.urls}
                              </Badge>
                            )}
                            {col.dataTypes.numbers > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                Numbers: {col.dataTypes.numbers}
                              </Badge>
                            )}
                            {col.dataTypes.dates > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                Dates: {col.dataTypes.dates}
                              </Badge>
                            )}
                            {col.dataTypes.text > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                Text: {col.dataTypes.text}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Most Common Values */}
                        {col.mostCommon.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-1">Most Common Values:</p>
                            <div className="space-y-1">
                              {col.mostCommon.map((item, i) => (
                                <div key={i} className="text-xs text-muted-foreground">
                                  "{item.value}" ({item.count} times)
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enrichment Suggestions */}
          {analysis.enrichmentSuggestions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Enrichment Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.enrichmentSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  ))}
                </div>
                <Button 
                  size="sm" 
                  className="mt-4"
                  onClick={() => {
                    onOpenChange(false)
                    // This will trigger the enrichment dialog to open
                    document.querySelector<HTMLButtonElement>('[data-enrich-button]')?.click()
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Enriching
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleExportAnalysis}>
            <Download className="h-4 w-4 mr-2" />
            Export Analysis
          </Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}