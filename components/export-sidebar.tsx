"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Download, FileSpreadsheet, FileJson, FileText, Check, ChevronRight, ChevronDown } from "lucide-react"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"

interface ExportSidebarProps {
  onClose: () => void
}

export function ExportSidebar({ onClose }: ExportSidebarProps) {
  const { data, headers } = useSpreadsheetStore()
  const [format, setFormat] = useState("csv")
  const [isExporting, setIsExporting] = useState(false)
  const [exported, setExported] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    format: false,
    options: false,
    summary: false
  })

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleExport = () => {
    setIsExporting(true)
    
    setTimeout(() => {
      if (format === "csv") {
        const csvRows = []
        csvRows.push(headers.join(","))
        
        for (const row of data) {
          const values = row.map(cell => {
            const escaped = ('' + (cell || '')).replace(/"/g, '""')
            return `"${escaped}"`
          })
          csvRows.push(values.join(","))
        }
        
        const csvContent = csvRows.join("\n")
        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "enriched-data.csv"
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === "json") {
        const jsonData = data.map(row => 
          headers.reduce((obj, header, index) => {
            obj[header] = row[index]
            return obj
          }, {} as Record<string, string>)
        )
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "enriched-data.json"
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === "excel") {
        // Simplified Excel export (tab-separated)
        const tsvContent = [
          headers.join("\t"),
          ...data.map((row) => row.join("\t")),
        ].join("\n")
        const blob = new Blob([tsvContent], { type: "application/vnd.ms-excel" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "enriched-data.xls"
        a.click()
        URL.revokeObjectURL(url)
      }
      
      setIsExporting(false)
      setExported(true)
      
      setTimeout(() => {
        setExported(false)
      }, 3000)
    }, 1000)
  }

  const formats = [
    {
      value: "csv",
      label: "CSV",
      description: "Comma-separated values, compatible with Excel",
      icon: FileSpreadsheet
    },
    {
      value: "json",
      label: "JSON",
      description: "JavaScript Object Notation, for developers",
      icon: FileJson
    },
    {
      value: "excel",
      label: "Excel",
      description: "Tab-separated values, opens in Excel",
      icon: FileText
    }
  ]

  return (
    <div className="w-96 flex-shrink-0 h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-green-600" />
          <h2 className="font-semibold">Export Data</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Export Format */}
          <Collapsible
            open={openSections.format}
            onOpenChange={() => toggleSection('format')}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Export Format</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Choose the file format for your export
                      </CardDescription>
                    </div>
                    {openSections.format ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <RadioGroup value={format} onValueChange={setFormat}>
                    <div className="space-y-3">
                      {formats.map((f) => {
                        const Icon = f.icon
                        return (
                          <label
                            key={f.value}
                            className="flex items-start gap-3 cursor-pointer p-2 hover:bg-gray-50"
                          >
                            <RadioGroupItem value={f.value} className="mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span className="text-sm font-medium">{f.label}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {f.description}
                              </p>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </RadioGroup>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Export Options */}
          <Collapsible
            open={openSections.options}
            onOpenChange={() => toggleSection('options')}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Export Options</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Additional settings for your export
                      </CardDescription>
                    </div>
                    {openSections.options ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="" />
                      <Label className="text-sm font-normal cursor-pointer">
                        Include column headers
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="" />
                      <Label className="text-sm font-normal cursor-pointer">
                        Export only selected rows
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="" />
                      <Label className="text-sm font-normal cursor-pointer">
                        Include empty cells
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Export Summary */}
          <Collapsible
            open={openSections.summary}
            onOpenChange={() => toggleSection('summary')}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Export Summary</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Details about your export
                      </CardDescription>
                    </div>
                    {openSections.summary ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Rows:</span>
                      <span className="font-medium">{data.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Columns:</span>
                      <span className="font-medium">{headers.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Cells:</span>
                      <span className="font-medium">{data.length * headers.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Selected Format:</span>
                      <span className="font-medium">{format.toUpperCase()}</span>
                    </div>
                    <div className="mt-3 p-2 bg-gray-50 text-xs text-gray-600">
                      Your data is ready to export. Click the button below to download.
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Quick Tips */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs text-green-900">Export Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-green-800 space-y-1">
              <p>• CSV format works best with Excel and Google Sheets</p>
              <p>• JSON format is ideal for web applications</p>
              <p>• Export includes all enriched data</p>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button 
          className="w-full bg-green-600 text-white hover:bg-green-700"
          onClick={handleExport}
          disabled={isExporting || !data.length}
        >
          {exported ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Exported!
            </>
          ) : isExporting ? (
            <>
              <Download className="h-4 w-4 mr-2 animate-pulse" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </>
          )}
        </Button>
      </div>
    </div>
  )
}