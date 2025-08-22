"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Filter, Loader2, ChevronRight } from "lucide-react"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"

interface SmartSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SmartSelectionDialog({ open, onOpenChange }: SmartSelectionDialogProps) {
  const { 
    headers, 
    data, 
    applyFilter, 
    toggleRowSelection,
    clearSelection,
    selectedRows 
  } = useSpreadsheetStore()
  
  const [prompt, setPrompt] = useState("")
  const [filterColumn, setFilterColumn] = useState("")
  const [filterOperator, setFilterOperator] = useState<"equals" | "contains" | "greater" | "less" | "empty" | "not_empty">("contains")
  const [filterValue, setFilterValue] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectionMode, setSelectionMode] = useState<"prompt" | "filter">("prompt")

  const handleSmartSelection = async () => {
    if (selectionMode === "prompt" && prompt) {
      setIsProcessing(true)
      try {
        // Call API to process prompt and get row indices
        const response = await fetch("/api/filter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            headers,
            data
          })
        })
        
        if (response.ok) {
          const { selectedIndices } = await response.json()
          
          // Clear current selection and apply new
          clearSelection()
          selectedIndices.forEach((index: number) => {
            toggleRowSelection(index)
          })
          
          onOpenChange(false)
        }
      } catch (error) {
        console.error("Smart selection failed:", error)
      } finally {
        setIsProcessing(false)
      }
    } else if (selectionMode === "filter" && filterColumn) {
      // Apply filter criteria
      clearSelection()
      
      // Apply filter and select matching rows
      data.forEach((row, rowIndex) => {
        const colIndex = headers.indexOf(filterColumn)
        if (colIndex === -1) return
        
        const cellValue = row[colIndex] || ""
        let matches = false
        
        switch (filterOperator) {
          case "equals":
            matches = cellValue === filterValue
            break
          case "contains":
            matches = cellValue.toLowerCase().includes(filterValue.toLowerCase())
            break
          case "greater":
            matches = parseFloat(cellValue) > parseFloat(filterValue)
            break
          case "less":
            matches = parseFloat(cellValue) < parseFloat(filterValue)
            break
          case "empty":
            matches = cellValue.trim() === ""
            break
          case "not_empty":
            matches = cellValue.trim() !== ""
            break
        }
        
        if (matches) {
          toggleRowSelection(rowIndex)
        }
      })
      
      onOpenChange(false)
    }
  }

  const examplePrompts = [
    "Select all companies with revenue greater than $10M",
    "Find all rows with empty email addresses",
    "Select companies in Technology industry",
    "Find all entries from California",
    "Select top 10 companies by employee count"
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Smart Selection</DialogTitle>
          <DialogDescription>
            Use AI or filters to intelligently select rows from your data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode Selection */}
          <div className="flex gap-2">
            <Button
              variant={selectionMode === "prompt" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectionMode("prompt")}
              className="flex-1"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Prompt
            </Button>
            <Button
              variant={selectionMode === "filter" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectionMode("filter")}
              className="flex-1"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {selectionMode === "prompt" ? (
            <>
              <div className="space-y-2">
                <Label>Describe what rows to select</Label>
                <Textarea
                  placeholder="e.g., Select all companies with revenue over $50M and more than 100 employees"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Example prompts:</Label>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((example, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="cursor-pointer text-xs hover:bg-gray-100"
                      onClick={() => setPrompt(example)}
                    >
                      {example}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Column</Label>
                <Select value={filterColumn} onValueChange={setFilterColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select column to filter..." />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Condition</Label>
                <Select value={filterOperator} onValueChange={(value: any) => setFilterOperator(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="greater">Greater than</SelectItem>
                    <SelectItem value="less">Less than</SelectItem>
                    <SelectItem value="empty">Is empty</SelectItem>
                    <SelectItem value="not_empty">Is not empty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filterOperator !== "empty" && filterOperator !== "not_empty" && (
                <div className="space-y-2">
                  <Label>Value</Label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter value..."
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              {selectedRows.size > 0 ? (
                <>Currently {selectedRows.size} rows selected. This will replace your selection.</>
              ) : (
                <>No rows currently selected. This will create a new selection.</>
              )}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSmartSelection}
            disabled={
              isProcessing || 
              (selectionMode === "prompt" && !prompt) ||
              (selectionMode === "filter" && !filterColumn)
            }
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ChevronRight className="h-4 w-4 mr-2" />
                Apply Selection
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}