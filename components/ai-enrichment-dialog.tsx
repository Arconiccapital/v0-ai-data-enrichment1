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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDown, ChevronRight, Loader2, Sparkles, Wand2, Info, AlertCircle, CheckCircle2 } from "lucide-react"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { generateSmartPrompt, detectDataType, formatTemplates, improvePrompt, validateCustomFormat, FormatMode, CustomFormat, commonPatterns } from "@/lib/enrichment-utils"

interface AIEnrichmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AIEnrichmentDialog({ open, onOpenChange }: AIEnrichmentDialogProps) {
  const { headers, data, enrichColumnToNew, setColumnFormat } = useSpreadsheetStore()
  const [selectedColumn, setSelectedColumn] = useState<string>("")
  const [columnName, setColumnName] = useState("")
  const [dataType, setDataType] = useState("text")
  const [prompt, setPrompt] = useState("")
  const [formatInstructions, setFormatInstructions] = useState("")
  const [showFormatInstructions, setShowFormatInstructions] = useState(false)
  const [isEnriching, setIsEnriching] = useState(false)
  const [useSmartPrompt, setUseSmartPrompt] = useState(true)
  const [strictFormat, setStrictFormat] = useState(true)
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [formatMode, setFormatMode] = useState<FormatMode>('strict')
  const [customPattern, setCustomPattern] = useState("")
  const [customExample, setCustomExample] = useState("")
  const [customInstruction, setCustomInstruction] = useState("")
  const [patternValid, setPatternValid] = useState(true)
  const [patternError, setPatternError] = useState("")

  const handleEnrich = async () => {
    if (!prompt || !columnName) return
    
    // Use -1 for "all columns" selection
    const columnIndex = selectedColumn === "__all__" ? -1 : headers.indexOf(selectedColumn)

    setIsEnriching(true)
    try {
      let fullPrompt = prompt
      let customFormat: CustomFormat | undefined
      
      // Handle different format modes
      if (formatMode === 'strict' && strictFormat && formatTemplates[dataType]) {
        const formatInstruction = formatTemplates[dataType].instruction
        if (!fullPrompt.includes(formatInstruction)) {
          fullPrompt = `${fullPrompt}\n\nIMPORTANT: ${formatInstruction}`
        }
        fullPrompt = `${fullPrompt}\n[Expected type: ${dataType}]`
      } else if (formatMode === 'custom' && customPattern) {
        customFormat = {
          pattern: customPattern,
          example: customExample,
          instruction: customInstruction || `Return value matching pattern: ${customPattern}`
        }
        fullPrompt = `${fullPrompt}\n\nIMPORTANT: ${customFormat.instruction}\nExample: ${customFormat.example}`
        fullPrompt = `${fullPrompt}\n[Format mode: custom]\n[Pattern: ${customPattern}]`
      } else if (formatMode === 'free') {
        fullPrompt = `${fullPrompt}\n[Format mode: free]`
      }
      
      // Add any additional format instructions
      if (formatInstructions) {
        fullPrompt = `${fullPrompt}\n\nAdditional format: ${formatInstructions}`
      }
      
      // Store column format preference
      setColumnFormat(columnName, {
        formatMode,
        dataType: formatMode === 'strict' ? dataType : undefined,
        customFormat
      })
      
      await enrichColumnToNew(columnIndex, columnName, fullPrompt, formatMode, customFormat)
      onOpenChange(false)
      
      // Reset form
      setPrompt("")
      setFormatInstructions("")
      setSelectedColumn("")
      setColumnName("")
      setShowFormatInstructions(false)
      setGeneratedPrompt("")
      setCustomPattern("")
      setCustomExample("")
      setCustomInstruction("")
      setFormatMode('strict')
    } catch (error) {
      console.error("Enrichment failed:", error)
    } finally {
      setIsEnriching(false)
    }
  }

  const validHeaders = headers.filter((header) => header && header.trim() !== "")

  // Auto-detect data type when column name changes
  useEffect(() => {
    if (columnName) {
      const detectedType = detectDataType(columnName)
      setDataType(detectedType)
    }
  }, [columnName])

  // Generate smart prompt when inputs change
  useEffect(() => {
    if (useSmartPrompt && columnName && selectedColumn !== "__all__") {
      const columnIndex = headers.indexOf(selectedColumn)
      if (columnIndex >= 0 && data.length > 0) {
        // Build row context from first non-empty row
        const rowContext: Record<string, string> = {}
        const sampleRow = data.find(row => row.some(cell => cell?.trim()))
        if (sampleRow) {
          headers.forEach((header, idx) => {
            if (header && sampleRow[idx]) {
              rowContext[header] = sampleRow[idx]
            }
          })
        }
        
        const smartPrompt = generateSmartPrompt(columnName, dataType, rowContext)
        setGeneratedPrompt(smartPrompt)
        setPrompt(smartPrompt)
      }
    }
  }, [useSmartPrompt, columnName, selectedColumn, dataType, headers, data])

  // Validate custom pattern
  useEffect(() => {
    if (customPattern && customExample) {
      const validation = validateCustomFormat(customPattern, customExample)
      setPatternValid(validation.valid)
      setPatternError(validation.error || "")
    } else {
      setPatternValid(true)
      setPatternError("")
    }
  }, [customPattern, customExample])

  const handleImprovePrompt = () => {
    const improved = improvePrompt(prompt, dataType)
    setPrompt(improved)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Enrich Column</DialogTitle>
          <DialogDescription>Create a new column with AI-enriched data using all row information for context.</DialogDescription>
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
            <Label className="text-sm font-medium">Primary Column (Optional)</Label>
            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger>
                <SelectValue placeholder="All columns will be used for context..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Use all columns equally</SelectItem>
                {validHeaders.map((header, index) => (
                  <SelectItem key={`${header}-${index}`} value={header}>
                    Focus on: {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">All row data will be available as context. Select a primary column to focus on, or use all equally.</p>
          </div>

          {/* Smart Prompt Toggle */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <Label htmlFor="smart-prompt" className="text-sm font-medium">Use Smart Prompt (AI-Generated)</Label>
            </div>
            <Switch
              id="smart-prompt"
              checked={useSmartPrompt}
              onCheckedChange={setUseSmartPrompt}
            />
          </div>

          {/* Data Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Data Type</Label>
            <Select value={dataType} onValueChange={setDataType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="email">Email Address</SelectItem>
                <SelectItem value="url">Website/URL</SelectItem>
                <SelectItem value="phone">Phone Number</SelectItem>
                <SelectItem value="currency">Currency/Money</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="number">Number</SelectItem>
              </SelectContent>
            </Select>
            {formatTemplates[dataType] && (
              <div className="flex items-start gap-2 p-2 bg-gray-50 rounded text-xs">
                <Info className="h-3 w-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-600">Expected format: <code className="bg-white px-1 py-0.5 rounded">{formatTemplates[dataType].example}</code></p>
                </div>
              </div>
            )}
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Prompt</Label>
              {!useSmartPrompt && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleImprovePrompt}
                  className="h-7 text-xs"
                >
                  <Wand2 className="h-3 w-3 mr-1" />
                  Improve Prompt
                </Button>
              )}
            </div>
            <Textarea
              placeholder={useSmartPrompt ? "Smart prompt will be generated automatically..." : "Add instructions. Use {Column Name} to reference any column"}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={useSmartPrompt}
            />
            {useSmartPrompt && generatedPrompt && (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <Sparkles className="h-3 w-3" />
                <span>Smart prompt generated based on column name and data type</span>
              </div>
            )}
          </div>

          {/* Format Control */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Output Format Control</Label>
            <Tabs value={formatMode} onValueChange={(value) => setFormatMode(value as FormatMode)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="strict">Strict</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
                <TabsTrigger value="free">Free Text</TabsTrigger>
              </TabsList>
              
              <TabsContent value="strict" className="space-y-2 mt-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-blue-900">Predefined Format</p>
                      <p className="text-xs text-blue-700">Uses strict validation for the selected data type above.</p>
                      {formatTemplates[dataType] && (
                        <p className="text-xs text-blue-600 mt-1">
                          Pattern: <code className="bg-white px-1 py-0.5 rounded">{formatTemplates[dataType].example}</code>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="custom" className="space-y-3 mt-3">
                <div className="space-y-3">
                  {/* Quick Templates */}
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Quick Templates</Label>
                    <Select 
                      onValueChange={(templateKey) => {
                        const template = commonPatterns[templateKey as keyof typeof commonPatterns]
                        if (template) {
                          setCustomPattern(template.pattern)
                          setCustomExample(template.example)
                          setCustomInstruction(template.instruction)
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select a template..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(commonPatterns).map(([key, template]) => (
                          <SelectItem key={key} value={key} className="text-xs">
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Regex Pattern</Label>
                    <Input
                      placeholder="e.g., ^[A-Z]{3}-\\d{4}$"
                      value={customPattern}
                      onChange={(e) => setCustomPattern(e.target.value)}
                      className="font-mono text-xs h-8"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Example Output</Label>
                    <Input
                      placeholder="e.g., ABC-1234"
                      value={customExample}
                      onChange={(e) => setCustomExample(e.target.value)}
                      className="text-xs h-8"
                    />
                    {customPattern && customExample && (
                      <div className="flex items-center gap-2 text-xs">
                        {patternValid ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">Pattern matches example</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 text-red-600" />
                            <span className="text-red-600">{patternError || "Pattern doesn't match example"}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Instruction (Optional)</Label>
                    <Input
                      placeholder="e.g., Format as product SKU"
                      value={customInstruction}
                      onChange={(e) => setCustomInstruction(e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="free" className="space-y-2 mt-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-green-900">Free Text Format</p>
                      <p className="text-xs text-green-700">AI will return natural language responses without format restrictions.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
            disabled={!prompt || !columnName || isEnriching}
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
