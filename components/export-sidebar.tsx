"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { X, Download, FileSpreadsheet, FileJson, FileText, Check } from "lucide-react"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"

interface ExportSidebarProps {
  onClose: () => void
}

export function ExportSidebar({ onClose }: ExportSidebarProps) {
  const { data, headers } = useSpreadsheetStore()
  const [format, setFormat] = useState("csv")
  const [isExporting, setIsExporting] = useState(false)
  const [exported, setExported] = useState(false)

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
      description: "Comma-separated values",
      icon: FileSpreadsheet
    },
    {
      value: "json",
      label: "JSON",
      description: "JavaScript Object Notation",
      icon: FileJson
    },
    {
      value: "excel",
      label: "Excel",
      description: "Microsoft Excel format",
      icon: FileText
    }
  ]

  return (
    <div className="w-96 h-full bg-white border-l border-gray-200 flex flex-col">
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

      <div className="flex-1 p-4 space-y-4">
        {/* Data Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Data Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Rows:</span>
                <span className="font-medium">{data.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Columns:</span>
                <span className="font-medium">{headers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total cells:</span>
                <span className="font-medium">{data.length * headers.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Format Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Export Format</CardTitle>
            <CardDescription className="text-xs">
              Choose the file format for your export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={format} onValueChange={setFormat}>
              <div className="space-y-3">
                {formats.map((fmt) => {
                  const Icon = fmt.icon
                  return (
                    <label
                      key={fmt.value}
                      className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50"
                    >
                      <RadioGroupItem value={fmt.value} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gray-600" />
                          <span className="font-medium text-sm">{fmt.label}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{fmt.description}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      {/* Export Button */}
      <div className="p-4 border-t border-gray-200">
        <Button 
          className={cn(
            "w-full",
            exported ? "bg-green-600 hover:bg-green-700" : "bg-black hover:bg-gray-800",
            "text-white"
          )}
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Download className="h-4 w-4 mr-2 animate-bounce" />
              Exporting...
            </>
          ) : exported ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Exported Successfully!
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

import { cn } from "@/lib/utils"