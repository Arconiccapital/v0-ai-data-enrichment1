"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Plus, Loader2, Info, X, Download, Settings } from "lucide-react"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { AIEnrichmentDialog } from "@/components/ai-enrichment-dialog"
import { cn } from "@/lib/utils"

export function SpreadsheetView() {
  const { headers, data, updateCell, enrichmentStatus, addColumn } = useSpreadsheetStore()
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [enrichmentDialogOpen, setEnrichmentDialogOpen] = useState(false)
  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")
  const [showCellDetails, setShowCellDetails] = useState(false)

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setSelectedCell({ row: rowIndex, col: colIndex })
    setShowCellDetails(true)
  }

  const handleCellChange = (value: string, rowIndex: number, colIndex: number) => {
    updateCell(rowIndex, colIndex, value)
  }

  const isCellEnriching = (rowIndex: number, colIndex: number) => {
    return enrichmentStatus[colIndex]?.enriching && enrichmentStatus[colIndex]?.currentRow === rowIndex
  }

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      addColumn(newColumnName.trim())
      setNewColumnName("")
      setAddColumnDialogOpen(false)
    }
  }

  const handleExport = () => {
    const csvContent = [
      headers.join(","),
      ...data.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "enriched-data.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectedCellValue = selectedCell ? data[selectedCell.row]?.[selectedCell.col] || "" : ""
  const selectedColumnName = selectedCell ? headers[selectedCell.col] || "" : ""

  return (
    <div className="flex h-full bg-white">
      {/* Main Content */}
      <div className={cn("flex flex-col transition-all duration-300", showCellDetails ? "flex-1" : "w-full")}>
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">Spreadsheet</h1>
              <Badge variant="secondary" className="text-xs font-medium">
                {data.length} rows × {headers.length} columns
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Dialog open={addColumnDialogOpen} onOpenChange={setAddColumnDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-sm bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Column
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Column</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="column-name">Column Name</Label>
                      <Input
                        id="column-name"
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        placeholder="Enter column name..."
                        onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setAddColumnDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddColumn} disabled={!newColumnName.trim()}>
                        Add Column
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm" className="text-sm bg-transparent">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} className="text-sm bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                onClick={() => setEnrichmentDialogOpen(true)}
                className="bg-black text-white hover:bg-gray-800"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Enrich Data
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-gray-50">
          <div className="h-full overflow-auto">
            <div className="min-w-full">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="w-12 h-10 text-center text-xs font-medium text-gray-500 border-r border-gray-200 bg-gray-50 sticky left-0 z-20">
                      #
                    </th>
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className="h-10 px-4 text-left text-sm font-medium text-gray-700 border-r border-gray-200 bg-gray-50 min-w-[150px]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="truncate">{header}</span>
                          {enrichmentStatus[index]?.enriching && (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50 border-b border-gray-100">
                      <td className="w-12 h-10 text-center text-xs font-medium text-gray-500 border-r border-gray-200 bg-gray-50 sticky left-0 z-10">
                        {rowIndex + 1}
                      </td>
                      {row.map((cell, colIndex) => (
                        <td
                          key={colIndex}
                          className={cn(
                            "h-10 border-r border-gray-200 cursor-pointer relative min-w-[150px] group",
                            selectedCell?.row === rowIndex &&
                              selectedCell?.col === colIndex &&
                              "bg-blue-50 ring-2 ring-blue-500 ring-inset",
                            isCellEnriching(rowIndex, colIndex) && "bg-blue-50",
                          )}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                        >
                          {isCellEnriching(rowIndex, colIndex) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-blue-50 z-10">
                              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            </div>
                          )}
                          <div className="px-4 py-2 text-sm text-gray-900 truncate group-hover:bg-gray-50">{cell}</div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 bg-white px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-6">
              <span>{data.length} rows loaded</span>
              {selectedCell && (
                <span className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Row {selectedCell.row + 1}, Column {selectedColumnName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span>Ready for AI enrichment</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {showCellDetails && selectedCell && (
        <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Cell Details</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowCellDetails(false)} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 p-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Position</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Row:</span>
                    <span className="font-medium">{selectedCell.row + 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Column:</span>
                    <span className="font-medium">{selectedColumnName}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Content</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Textarea
                  value={selectedCellValue}
                  onChange={(e) => handleCellChange(e.target.value, selectedCell.row, selectedCell.col)}
                  placeholder="Enter cell content..."
                  className="min-h-[100px] text-sm"
                  disabled={isCellEnriching(selectedCell.row, selectedCell.col)}
                />
                <div className="mt-2 text-xs text-gray-500">{selectedCellValue.length} characters</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setEnrichmentDialogOpen(true)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Enrich this column
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-transparent"
                  onClick={() => handleCellChange("", selectedCell.row, selectedCell.col)}
                >
                  Clear cell
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <AIEnrichmentDialog open={enrichmentDialogOpen} onOpenChange={setEnrichmentDialogOpen} />
    </div>
  )
}
