"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { X, Sparkles, Play, Plus, Loader2, Check, ChevronRight, ChevronDown } from "lucide-react"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"

interface EnrichSidebarProps {
  onClose: () => void
}

export function EnrichSidebar({ onClose }: EnrichSidebarProps) {
  const { headers, data, addColumn, enrichColumnToNew, enrichSelectedCells } = useSpreadsheetStore()
  const [columnName, setColumnName] = useState("")
  const [prompt, setPrompt] = useState("")
  const [selectedContextColumns, setSelectedContextColumns] = useState<number[]>([])
  const [outputFormat, setOutputFormat] = useState("text")
  const [customFormat, setCustomFormat] = useState("")
  const [isEnriching, setIsEnriching] = useState(false)
  const [columnAdded, setColumnAdded] = useState(false)
  const [enrichmentRange, setEnrichmentRange] = useState<'first' | 'all'>('first')
  const [firstN, setFirstN] = useState(10)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    column: false,
    prompt: false,
    format: false,
    context: false,
    range: false
  })

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleAddColumn = () => {
    if (columnName.trim()) {
      addColumn(columnName.trim())
      setColumnAdded(true)
      // Keep the column name for enrichment
      // setColumnName("")
      // Clear the added indicator after 2 seconds
      setTimeout(() => setColumnAdded(false), 2000)
    }
  }

  const handleEnrich = async () => {
    if (!prompt.trim() || !columnName.trim()) return
    
    setIsEnriching(true)
    try {
      // Build the full prompt with format instructions
      let fullPrompt = prompt
      const format = outputFormat === "custom" ? customFormat : outputFormat
      
      // Add format-specific instructions to the prompt
      const formatInstructions: Record<string, string> = {
        'name': '\n\nIMPORTANT: Return ONLY the name(s), no additional text. Format: First Last (e.g., John Smith)',
        'email': '\n\nIMPORTANT: Return ONLY the email address in standard format (e.g., john@example.com)',
        'url': '\n\nIMPORTANT: Return ONLY the URL/website in standard format (e.g., https://example.com)',
        'phone': '\n\nIMPORTANT: Return ONLY the phone number in standard format',
        'company': '\n\nIMPORTANT: Return ONLY the company name, no additional text',
        'address': '\n\nIMPORTANT: Return ONLY the address in standard format',
        'currency': '\n\nIMPORTANT: Return monetary values in standard currency format (e.g., $1,234.56)',
        'percentage': '\n\nIMPORTANT: Return percentages with % symbol (e.g., 85%)',
        'number': '\n\nIMPORTANT: Return ONLY numeric values',
        'date': '\n\nIMPORTANT: Return dates in MM/DD/YYYY format',
        'linkedin': '\n\nIMPORTANT: Return ONLY the LinkedIn URL (e.g., linkedin.com/in/username)',
        'twitter': '\n\nIMPORTANT: Return ONLY the Twitter/X handle (e.g., @username)',
        'jobtitle': '\n\nIMPORTANT: Return ONLY the job title',
        'score': '\n\nIMPORTANT: Return scores in X/10 format',
        'status': '\n\nIMPORTANT: Return status as Active/Inactive or similar',
        'yesno': '\n\nIMPORTANT: Return ONLY Yes or No',
        'category': '\n\nIMPORTANT: Return ONLY the category/label',
        'country': '\n\nIMPORTANT: Return ONLY the country name',
        'description': '\n\nIMPORTANT: Return a brief text summary',
        'list': '\n\nIMPORTANT: Return as comma-separated list',
        'json': '\n\nIMPORTANT: Return valid JSON format',
        'text': ''
      }
      
      if (formatInstructions[format]) {
        fullPrompt += formatInstructions[format]
      } else if (format === 'custom' && customFormat) {
        fullPrompt += `\n\nIMPORTANT: Format the output as: ${customFormat}`
      }
      
      // Build context columns set
      const contextColumns = selectedContextColumns.length > 0 
        ? new Set(selectedContextColumns)
        : undefined
      
      // Determine format mode
      const formatMode = format === 'text' || format === 'custom' ? 'free' : 'strict'
      
      // Check if we need to enrich only certain rows
      if (enrichmentRange === 'first' && firstN < data.length) {
        // First check if column exists
        let columnIndex = headers.indexOf(columnName)
        
        // Add column if it doesn't exist
        if (columnIndex === -1) {
          addColumn(columnName)
          // After adding, the column will be at the end
          columnIndex = headers.length
        }
        
        // Create a set of row indices to enrich
        const rowsToEnrich = new Set<number>()
        for (let i = 0; i < Math.min(firstN, data.length); i++) {
          rowsToEnrich.add(i)
        }
        
        // Use enrichSelectedCells for partial enrichment
        await enrichSelectedCells(
          columnIndex,
          rowsToEnrich,
          fullPrompt,
          contextColumns
        )
      } else {
        // Enrich all rows using the original method
        await enrichColumnToNew(
          -1, // sourceColumnIndex (-1 for new column)
          columnName,
          fullPrompt,
          formatMode as any,
          undefined, // customFormat
          contextColumns
        )
      }
      
      // Reset form and close sidebar
      setColumnName('')
      setPrompt('')
      setSelectedContextColumns([])
      setOutputFormat('text')
      setCustomFormat('')
      onClose()
    } catch (error) {
      console.error('Enrichment failed:', error)
    } finally {
      setIsEnriching(false)
    }
  }

  // Auto-detect format based on prompt
  const detectFormatFromPrompt = (promptText: string) => {
    const lower = promptText.toLowerCase()
    if (lower.includes('email')) return 'email'
    if (lower.includes('website') || lower.includes('url')) return 'url'
    if (lower.includes('phone') || lower.includes('number')) return 'phone'
    if (lower.includes('name') && (lower.includes('person') || lower.includes('contact'))) return 'name'
    if (lower.includes('company')) return 'company'
    if (lower.includes('address') || lower.includes('location')) return 'address'
    if (lower.includes('linkedin')) return 'linkedin'
    if (lower.includes('twitter') || lower.includes('x handle')) return 'twitter'
    if (lower.includes('title') || lower.includes('position')) return 'jobtitle'
    if (lower.includes('revenue') || lower.includes('price') || lower.includes('cost')) return 'currency'
    if (lower.includes('percentage') || lower.includes('%')) return 'percentage'
    if (lower.includes('score') || lower.includes('rating')) return 'score'
    if (lower.includes('date') || lower.includes('when')) return 'date'
    if (lower.includes('yes') || lower.includes('no')) return 'yesno'
    if (lower.includes('status')) return 'status'
    if (lower.includes('country')) return 'country'
    if (lower.includes('category') || lower.includes('type')) return 'category'
    return 'text'
  }

  const commonPrompts = [
    "Find the email address for this company",
    "Get the LinkedIn URL for this person",
    "Find the company website",
    "Get the phone number",
    "Categorize by industry",
    "Estimate company size",
    "Find funding information",
    "Get company description"
  ]

  const outputFormats = [
    { value: "name", label: "Name", example: "John Smith" },
    { value: "email", label: "Email", example: "john@company.com" },
    { value: "url", label: "Website URL", example: "https://example.com" },
    { value: "phone", label: "Phone Number", example: "+1 (555) 123-4567" },
    { value: "company", label: "Company Name", example: "Acme Corporation" },
    { value: "address", label: "Address", example: "123 Main St, City, ST 12345" },
    { value: "currency", label: "Currency", example: "$1,234.56" },
    { value: "percentage", label: "Percentage", example: "85%" },
    { value: "number", label: "Number", example: "1234" },
    { value: "date", label: "Date", example: "MM/DD/YYYY" },
    { value: "score", label: "Score (1-10)", example: "7/10" },
    { value: "linkedin", label: "LinkedIn URL", example: "linkedin.com/in/username" },
    { value: "twitter", label: "Twitter/X Handle", example: "@username" },
    { value: "jobtitle", label: "Job Title", example: "Senior Manager" },
    { value: "status", label: "Status", example: "Active/Inactive" },
    { value: "yesno", label: "Yes/No", example: "Yes or No" },
    { value: "category", label: "Category/Label", example: "Category A" },
    { value: "country", label: "Country", example: "United States" },
    { value: "description", label: "Description", example: "Brief text summary" },
    { value: "list", label: "List (comma-separated)", example: "item1, item2, item3" },
    { value: "json", label: "JSON", example: '{"key": "value"}' },
    { value: "custom", label: "Custom Format", example: "Specify your format" }
  ]

  return (
    <div className="w-full sm:w-80 md:w-96 max-w-[400px] flex-shrink-0 h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <h2 className="font-semibold">Enrich Data</h2>
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
          {/* Add New Column */}
          <Collapsible
            open={openSections.column}
            onOpenChange={() => toggleSection('column')}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Add New Column</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Create a column to store enriched data
                      </CardDescription>
                    </div>
                    {openSections.column ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
              <div className="flex gap-2">
                <Input
                  placeholder="Column name..."
                  value={columnName}
                  onChange={(e) => setColumnName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
                />
                <Button 
                  onClick={handleAddColumn} 
                  size="sm"
                  variant={columnAdded ? "default" : "outline"}
                  className={columnAdded ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {columnAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Enrichment Prompt */}
          <Collapsible
            open={openSections.prompt}
            onOpenChange={() => toggleSection('prompt')}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Enrichment Prompt</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Describe what data you want to add
                      </CardDescription>
                    </div>
                    {openSections.prompt ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
              <Textarea
                placeholder="E.g., Find the CEO's email address for each company"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value)
                  // Auto-detect format based on prompt
                  const detectedFormat = detectFormatFromPrompt(e.target.value)
                  if (detectedFormat !== outputFormat && outputFormat !== 'custom') {
                    setOutputFormat(detectedFormat)
                  }
                }}
                className="min-h-[100px]"
              />

              {/* Common Prompts */}
              <div>
                <Label className="text-xs text-gray-500 mb-2">Quick prompts:</Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {commonPrompts.map((p, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => setPrompt(p)}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Output Format */}
          <Collapsible
            open={openSections.format}
            onOpenChange={() => toggleSection('format')}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Output Format</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Choose how the data should be formatted
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
              <ScrollArea className="h-64">
                <RadioGroup value={outputFormat} onValueChange={setOutputFormat}>
                  <div className="space-y-2">
                    {outputFormats.map((format) => (
                      <label
                        key={format.value}
                        className="flex items-start gap-3 cursor-pointer p-2 hover:bg-gray-50"
                      >
                        <RadioGroupItem value={format.value} className="mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{format.label}</div>
                          <div className="text-xs text-gray-500">{format.example}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </ScrollArea>
              {outputFormat === "custom" && (
                <Input
                  placeholder="Describe your custom format..."
                  value={customFormat}
                  onChange={(e) => setCustomFormat(e.target.value)}
                  className="mt-2"
                />
              )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Context Columns */}
          <Collapsible
            open={openSections.context}
            onOpenChange={() => toggleSection('context')}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Context Columns</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Select columns to use as context for enrichment
                      </CardDescription>
                    </div>
                    {openSections.context ? (
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
                {headers.map((header, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedContextColumns.includes(idx)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedContextColumns([...selectedContextColumns, idx])
                        } else {
                          setSelectedContextColumns(selectedContextColumns.filter(i => i !== idx))
                        }
                      }}
                      className=""
                    />
                    <span className="text-sm">{header}</span>
                  </label>
                ))}
              </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Enrichment Range */}
          <Collapsible
            open={openSections.range}
            onOpenChange={() => toggleSection('range')}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Enrichment Range</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Choose how many rows to enrich
                      </CardDescription>
                    </div>
                    {openSections.range ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
              <RadioGroup value={enrichmentRange} onValueChange={(value) => setEnrichmentRange(value as 'first' | 'all')}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="first" id="first-rows" />
                    <div className="flex items-center gap-2 flex-1">
                      <Label htmlFor="first-rows" className="text-sm font-normal cursor-pointer">
                        Run first
                      </Label>
                      <Input 
                        type="number" 
                        value={firstN} 
                        onChange={(e) => setFirstN(parseInt(e.target.value) || 10)}
                        onClick={() => setEnrichmentRange('first')}
                        className="w-20 h-8" 
                        min="1"
                        max={data.length || 100}
                      />
                      <span className="text-sm">rows</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all-rows" />
                    <Label htmlFor="all-rows" className="text-sm font-normal cursor-pointer">
                      Run all {data.length} rows
                    </Label>
                  </div>
                </div>
              </RadioGroup>
              
              {/* Show what will be enriched */}
              <div className="mt-3 p-2 bg-gray-50 text-xs text-gray-600">
                {enrichmentRange === 'first' 
                  ? `Will enrich ${Math.min(firstN, data.length)} row${Math.min(firstN, data.length) !== 1 ? 's' : ''}`
                  : `Will enrich all ${data.length} rows`
                }
              </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200">
        <Button 
          className="w-full bg-black text-white hover:bg-gray-800"
          onClick={handleEnrich}
          disabled={!prompt.trim() || !columnName.trim() || isEnriching}
        >
          {isEnriching ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enriching...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Enrichment
            </>
          )}
        </Button>
      </div>
    </div>
  )
}