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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Loader2, Sparkles, ChevronRight, ChevronDown } from "lucide-react"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { generateSmartPrompt, detectDataType, formatTemplates } from "@/lib/enrichment-utils"

interface AIEnrichmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  columnIndex?: number
  enrichmentScope?: 'cell' | 'selected' | 'all'
  selectedRowCount?: number
  currentRow?: number
}

export function AIEnrichmentDialog({ 
  open, 
  onOpenChange, 
  columnIndex, 
  enrichmentScope = 'all',
  selectedRowCount = 0,
  currentRow
}: AIEnrichmentDialogProps) {
  const { 
    headers, 
    data, 
    enrichColumnToNew,
    setColumnFormat,
    storeColumnEnrichmentConfig,
    getColumnEnrichmentConfig,
    selectedRows,
    enrichSingleCell,
    enrichSelectedCells,
    enrichColumn
  } = useSpreadsheetStore()
  
  const [columnName, setColumnName] = useState("")
  const [prompt, setPrompt] = useState("")
  const [dataType, setDataType] = useState("free")
  const [isEnriching, setIsEnriching] = useState(false)
  const [isNewColumn, setIsNewColumn] = useState(true)
  const [enrichmentRange, setEnrichmentRange] = useState<'first' | 'all'>('first')
  const [firstN, setFirstN] = useState(10)
  const [selectedContextColumns, setSelectedContextColumns] = useState<string[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Initialize based on whether we're enriching an existing column or creating a new one
  useEffect(() => {
    // Check for enrichment configuration from sidebar
    const storedFormat = sessionStorage.getItem('enrichmentFormat')
    const storedPrompt = sessionStorage.getItem('enrichmentPrompt')
    const storedContextColumns = sessionStorage.getItem('enrichmentContextColumns')
    
    if (columnIndex !== undefined && columnIndex >= 0) {
      setIsNewColumn(false)
      const existingColumnName = headers[columnIndex]
      setColumnName(existingColumnName)
      
      // Load existing config if available but don't pre-fill prompt
      const existingConfig = getColumnEnrichmentConfig(columnIndex)
      if (existingConfig?.dataType) {
        setDataType(existingConfig.dataType || "free")
      }
      
      // Set enrichment range based on scope
      if (enrichmentScope === 'all') {
        setEnrichmentRange('all')
      } else if (enrichmentScope === 'selected' || enrichmentScope === 'cell') {
        setEnrichmentRange('first')
        if (enrichmentScope === 'cell') {
          setFirstN(1)
        } else if (selectedRowCount > 0) {
          setFirstN(selectedRowCount)
        }
      }
    } else {
      setIsNewColumn(true)
      setColumnName("")
      
      // Use stored values from sidebar if available
      if (storedPrompt) {
        setPrompt(storedPrompt)
        sessionStorage.removeItem('enrichmentPrompt')
      } else {
        setPrompt("")
      }
      
      if (storedFormat) {
        // Map format values to dialog's dataType values
        const formatMapping: Record<string, string> = {
          'name': 'text',
          'email': 'email',
          'url': 'url',
          'phone': 'phone',
          'company': 'company',
          'jobtitle': 'title',
          'address': 'location',
          'currency': 'currency',
          'percentage': 'percentage',
          'number': 'number',
          'date': 'date',
          'linkedin': 'url',
          'twitter': 'text',
          'score': 'number',
          'status': 'text',
          'yesno': 'text',
          'category': 'text',
          'country': 'location',
          'description': 'text',
          'list': 'text',
          'json': 'text',
          'text': 'text'
        }
        setDataType(formatMapping[storedFormat] || 'free')
        sessionStorage.removeItem('enrichmentFormat')
      } else {
        setDataType("free")
      }
      
      if (storedContextColumns) {
        try {
          const columns = JSON.parse(storedContextColumns)
          const columnNames = columns.map((idx: number) => headers[idx]).filter(Boolean)
          setSelectedContextColumns(columnNames)
        } catch (e) {
          console.error('Failed to parse context columns', e)
        }
        sessionStorage.removeItem('enrichmentContextColumns')
      }
    }
  }, [columnIndex, headers, getColumnEnrichmentConfig, enrichmentScope, selectedRowCount])

  // Auto-detect data type when column name changes (for new columns)
  useEffect(() => {
    if (isNewColumn && columnName) {
      const detectedType = detectDataType(columnName)
      if (detectedType !== "text") {
        setDataType(detectedType)
      }
    }
  }, [columnName, isNewColumn])

  const handleEnrich = async () => {
    if (!prompt) return
    if (isNewColumn && !columnName) return

    setIsEnriching(true)
    onOpenChange(false) // Close dialog immediately when enriching starts
    
    try {
      // Determine format mode and prepare prompt
      let fullPrompt = prompt
      let formatMode = 'free'
      let actualDataType = dataType
      
      // Add format instructions based on selected type
      if (dataType === "free") {
        // Free text - no format constraints
        formatMode = 'free'
        // No additional instructions needed
      } else if (dataType === "data_only") {
        // Data only - just the value, no explanation
        formatMode = 'strict'
        fullPrompt = `${fullPrompt}\n\nIMPORTANT: Return ONLY the requested data value, no additional text, explanation, or sentences.`
      } else if (formatTemplates[dataType]) {
        // Specific format selected
        formatMode = 'strict'
        const formatInstruction = formatTemplates[dataType].instruction
        if (!fullPrompt.includes(formatInstruction)) {
          fullPrompt = `${fullPrompt}\n\nIMPORTANT: ${formatInstruction}`
        }
        fullPrompt = `${fullPrompt}\n[Expected type: ${dataType}]`
      }

      // Build context columns if selected
      let contextColumns: Set<number> | undefined
      if (selectedContextColumns.length > 0) {
        contextColumns = new Set<number>()
        selectedContextColumns.forEach(headerName => {
          const idx = headers.indexOf(headerName)
          if (idx >= 0) contextColumns!.add(idx)
        })
        
        fullPrompt = `${fullPrompt}\n[Context columns: ${selectedContextColumns.join(', ')}]`
      }

      if (isNewColumn) {
        // Store format preference for new column
        if (dataType !== "free") {
          setColumnFormat(columnName, {
            formatMode: formatMode as any,
            dataType: actualDataType
          })
        }
        
        // Creating a new enriched column
        if (enrichmentRange === 'first') {
          // Create column and enrich only first N rows
          await enrichColumnToNew(-1, columnName, fullPrompt, formatMode as any, undefined, contextColumns)
          // Note: This will enrich all by default, we'd need to modify the store method to support partial enrichment
        } else {
          await enrichColumnToNew(-1, columnName, fullPrompt, formatMode as any, undefined, contextColumns)
        }
      } else if (columnIndex !== undefined) {
        // Enriching an existing column
        
        // Store the configuration
        storeColumnEnrichmentConfig(columnIndex, {
          columnIndex,
          columnName: headers[columnIndex],
          prompt: fullPrompt,
          formatMode: formatMode as any,
          dataType: actualDataType,
          isConfigured: true
        })
        
        // Execute enrichment based on scope and range
        if (enrichmentScope === 'cell' && currentRow !== undefined) {
          // Enrich single cell
          await enrichSingleCell(currentRow, columnIndex, fullPrompt, contextColumns)
        } else if (enrichmentScope === 'selected' && selectedRows.size > 0) {
          // Enrich selected cells
          await enrichSelectedCells(columnIndex, selectedRows, fullPrompt, contextColumns)
        } else if (enrichmentRange === 'first' && enrichmentScope !== 'cell' && enrichmentScope !== 'selected') {
          // Enrich first N cells (only when not in cell or selected mode)
          const rowsToEnrich = new Set<number>()
          for (let i = 0; i < Math.min(firstN, data.length); i++) {
            rowsToEnrich.add(i)
          }
          await enrichSelectedCells(columnIndex, rowsToEnrich, fullPrompt, contextColumns)
        } else {
          // Enrich all cells
          await enrichColumn(columnIndex, fullPrompt, contextColumns)
        }
      }
      
      // Reset form state after enrichment
      setPrompt("")
      setColumnName("")
      setDataType("free")
      setSelectedContextColumns([])
      setShowAdvanced(false)
    } catch (error) {
      console.error("Enrichment failed:", error)
    } finally {
      setIsEnriching(false)
    }
  }

  // Get available columns for context
  const availableColumns = headers.filter((header, index) => 
    header && header.trim() !== "" && (!isNewColumn ? index !== columnIndex : true)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isNewColumn ? "Create Enriched Column" : `Enrich: ${columnName}`}
          </DialogTitle>
          <DialogDescription>
            {isNewColumn 
              ? "Create a new column and fill it with AI-generated data"
              : "Fill this column with AI-generated data"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isNewColumn && (
            <div className="space-y-2">
              <Label>Column Name</Label>
              <Input
                placeholder="e.g., Company Website, Contact Email, Industry"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>What data do you want?</Label>
            <Textarea
              placeholder="Describe what information to generate for each row..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Advanced Options */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start p-2 h-auto font-normal text-sm"
              >
                {showAdvanced ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                Advanced Options
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              {/* Output Format - Now in Advanced Options */}
              <div className="space-y-2">
                <Label className="text-sm">Output Format (Optional)</Label>
                <Select value={dataType} onValueChange={setDataType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free Text</SelectItem>
                    <SelectItem value="data_only">Data Only</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="currency">Currency</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Optional formatting for the output. Leave as "Free Text" for natural responses.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Select context columns (optional)</Label>
                <Select
                  value={selectedContextColumns.length > 0 ? selectedContextColumns.join(',') : 'none'}
                  onValueChange={(value) => {
                    if (value === 'none') {
                      setSelectedContextColumns([])
                    } else if (value) {
                      setSelectedContextColumns(value.split(',').filter(v => v))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose columns for context..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {availableColumns.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                    <SelectItem value={availableColumns.join(',')}>
                      All columns
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select which columns the AI should use as context. Leave empty to use all.
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Simplified Range Selection at Bottom */}
          <div className="space-y-2 pt-2 border-t">
            <Label>How many cells to enrich?</Label>
            {enrichmentScope === 'cell' ? (
              <div className="text-sm text-gray-600 py-2">
                Will enrich only the selected cell
              </div>
            ) : enrichmentScope === 'selected' && selectedRows.size > 0 ? (
              <div className="text-sm text-gray-600 py-2">
                Will enrich {selectedRows.size} selected row{selectedRows.size !== 1 ? 's' : ''}
              </div>
            ) : (
              <RadioGroup value={enrichmentRange} onValueChange={(value) => setEnrichmentRange(value as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="first" id="first" />
                  <div className="flex items-center gap-2">
                    <Label htmlFor="first" className="text-sm font-normal cursor-pointer">
                      Run first
                    </Label>
                    <Input 
                      type="number" 
                      value={firstN} 
                      onChange={(e) => setFirstN(parseInt(e.target.value) || 10)}
                      onClick={() => setEnrichmentRange('first')}
                      className="w-16 h-8" 
                      min="1"
                      max={data.length || 100}
                    />
                    <span className="text-sm">cells</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="text-sm font-normal cursor-pointer">
                    Run all cells
                  </Label>
                </div>
              </RadioGroup>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isEnriching}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEnrich}
            disabled={!prompt || (isNewColumn && !columnName) || isEnriching}
          >
            {isEnriching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enriching...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Enrich
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}