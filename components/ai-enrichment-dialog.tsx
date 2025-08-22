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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"

interface AIEnrichmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AIEnrichmentDialog({ open, onOpenChange }: AIEnrichmentDialogProps) {
  const { headers, data, enrichColumnToNew } = useSpreadsheetStore()
  const [selectedColumn, setSelectedColumn] = useState<string>("")
  const [columnName, setColumnName] = useState("")
  const [dataType, setDataType] = useState("text")
  const [prompt, setPrompt] = useState("")
  const [formatInstructions, setFormatInstructions] = useState("")
  const [showFormatInstructions, setShowFormatInstructions] = useState(false)
  const [isEnriching, setIsEnriching] = useState(false)

  const handleEnrich = async () => {
    if (!selectedColumn || !prompt || !columnName) return

    setIsEnriching(true)
    try {
      const columnIndex = headers.indexOf(selectedColumn)
      const fullPrompt = formatInstructions ? `${prompt}\n\nFormat instructions: ${formatInstructions}` : prompt
      await enrichColumnToNew(columnIndex, columnName, fullPrompt)
      onOpenChange(false)
      setPrompt("")
      setFormatInstructions("")
      setSelectedColumn("")
      setColumnName("")
      setShowFormatInstructions(false)
    } catch (error) {
      console.error("Enrichment failed:", error)
    } finally {
      setIsEnriching(false)
    }
  }

  const validHeaders = headers.filter((header) => header && header.trim() !== "")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Enrich Column</DialogTitle>
          <DialogDescription>Create a new column with AI-enriched data based on an existing column.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">New Column Name</Label>
            <Input
              placeholder="Enter name for the new enriched column"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Source Column</Label>
            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Select column to use as source..." />
              </SelectTrigger>
              <SelectContent>
                {validHeaders.map((header, index) => (
                  <SelectItem key={`${header}-${index}`} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Type</Label>
            <Select value={dataType} onValueChange={setDataType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="url">URL</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Prompt</Label>
            <Textarea
              placeholder="Add specific instructions for the agent, e.g., 'Find the email from Apollo.'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Format Instructions (Collapsible) */}
          <Collapsible open={showFormatInstructions} onOpenChange={setShowFormatInstructions}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-0 h-auto text-blue-600 hover:text-blue-700">
                {showFormatInstructions ? (
                  <ChevronDown className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" />
                )}
                Add format instructions
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              <Textarea
                placeholder="Add format instructions for the agent, e.g., 'Twitter username without the @'"
                value={formatInstructions}
                onChange={(e) => setFormatInstructions(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </CollapsibleContent>
          </Collapsible>
        </div>

        <DialogFooter className="mt-6">
          <Button
            onClick={handleEnrich}
            disabled={!selectedColumn || !prompt || !columnName || isEnriching}
            className="w-full"
          >
            {isEnriching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enriching...
              </>
            ) : (
              "Enrich Column"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
