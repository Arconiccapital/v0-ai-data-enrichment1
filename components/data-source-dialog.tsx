"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Sparkles, 
  Search, 
  Upload, 
  Link,
  Globe,
  Building,
  Users,
  TrendingUp,
  MapPin,
  DollarSign,
  Calendar,
  Loader2,
  Eye,
  AlertCircle,
  Check
} from 'lucide-react'
import { useSpreadsheetStore } from '@/lib/spreadsheet-store'
import { cn } from '@/lib/utils'

interface DataSourceDialogProps {
  open: boolean
  onClose: () => void
}

interface GeneratorPreset {
  id: string
  label: string
  icon: React.ElementType
  prompt: string
  category: string
}

const generatorPresets: GeneratorPreset[] = [
  {
    id: 'b2b-saas',
    label: 'B2B SaaS Companies',
    icon: Building,
    prompt: 'Generate {count} B2B SaaS companies',
    category: 'company'
  },
  {
    id: 'vc-firms',
    label: 'VC Firms',
    icon: DollarSign,
    prompt: 'Generate {count} venture capital firms',
    category: 'investor'
  },
  {
    id: 'startup-founders',
    label: 'Startup Founders',
    icon: Users,
    prompt: 'Generate {count} startup founder names',
    category: 'people'
  },
  {
    id: 'tech-companies',
    label: 'Tech Companies',
    icon: TrendingUp,
    prompt: 'Generate {count} technology companies',
    category: 'company'
  },
  {
    id: 'real-estate',
    label: 'Property Addresses',
    icon: MapPin,
    prompt: 'Generate {count} property addresses',
    category: 'real-estate'
  },
  {
    id: 'recent-startups',
    label: 'Recent Startups',
    icon: Calendar,
    prompt: 'Generate {count} startups founded in the last 2 years',
    category: 'company'
  }
]

export function DataSourceDialog({ open, onClose }: DataSourceDialogProps) {
  const [activeTab, setActiveTab] = useState('generate')
  const [generating, setGenerating] = useState(false)
  const [previewData, setPreviewData] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // Generation settings
  const [generationPrompt, setGenerationPrompt] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [count, setCount] = useState(20)
  const [industry, setIndustry] = useState('')
  const [location, setLocation] = useState('')
  const [additionalFilters, setAdditionalFilters] = useState('')
  
  // Import settings
  const [importUrl, setImportUrl] = useState('')
  const [pastedText, setPastedText] = useState('')
  
  const { setDataFromTemplate, headers, data } = useSpreadsheetStore()

  const handlePresetSelect = (preset: GeneratorPreset) => {
    setSelectedPreset(preset.id)
    setGenerationPrompt(preset.prompt.replace('{count}', count.toString()))
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    
    try {
      // Build the full prompt with filters
      let fullPrompt = generationPrompt || `Generate ${count} items`
      
      if (industry) {
        fullPrompt += ` in the ${industry} industry`
      }
      
      if (location) {
        fullPrompt += ` located in ${location}`
      }
      
      if (additionalFilters) {
        fullPrompt += `. Additional criteria: ${additionalFilters}`
      }
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          count: count,
          type: 'first-column'
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate data')
      }
      
      const result = await response.json()
      setPreviewData(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate data')
    } finally {
      setGenerating(false)
    }
  }

  const handleExtractFromUrl = async () => {
    if (!importUrl) return
    
    setGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl })
      })
      
      if (!response.ok) {
        throw new Error('Failed to extract data from URL')
      }
      
      const result = await response.json()
      setPreviewData(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract data')
    } finally {
      setGenerating(false)
    }
  }

  const handlePastedTextExtract = () => {
    if (!pastedText) return
    
    // Simple extraction - split by newlines and clean
    const lines = pastedText
      .split(/[\n,;]/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
    
    setPreviewData(lines)
  }

  const handleImportToSpreadsheet = () => {
    if (previewData.length === 0) return
    
    // Create a simple template with the generated data
    const newData = previewData.map(item => [item])
    const newHeaders = ['Generated Data']
    
    // If there's existing data, add as a new column
    if (headers.length > 0 && data.length > 0) {
      // Add to existing data as a new column
      const updatedHeaders = [...headers, 'Generated Data']
      const updatedData = data.map((row, idx) => [
        ...row,
        idx < previewData.length ? previewData[idx] : ''
      ])
      
      // Add any extra rows if preview has more data
      for (let i = data.length; i < previewData.length; i++) {
        const newRow = new Array(headers.length).fill('')
        newRow.push(previewData[i])
        updatedData.push(newRow)
      }
      
      setDataFromTemplate({
        id: 'custom',
        name: 'Custom Generated',
        description: 'Generated data',
        icon: '✨',
        category: 'business',
        columns: updatedHeaders.map(h => ({ name: h, type: 'text' })),
        sampleData: updatedData.map(row => 
          updatedHeaders.reduce((obj, header, idx) => {
            obj[header] = row[idx]
            return obj
          }, {} as Record<string, any>)
        )
      })
    } else {
      // Create new spreadsheet with generated data
      setDataFromTemplate({
        id: 'custom',
        name: 'Custom Generated',
        description: 'Generated data',
        icon: '✨',
        category: 'business',
        columns: [{ name: 'Generated Data', type: 'text' }],
        sampleData: previewData.map(item => ({ 'Generated Data': item }))
      })
    }
    
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[700px] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">Generate First Column Data</DialogTitle>
          <DialogDescription>
            Generate or import data to populate your spreadsheet's first column
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="mx-6 mt-4">
              <TabsTrigger value="generate" className="gap-2">
                <Sparkles className="h-4 w-4" />
                AI Generate
              </TabsTrigger>
              <TabsTrigger value="search" className="gap-2">
                <Search className="h-4 w-4" />
                Search & Discover
              </TabsTrigger>
              <TabsTrigger value="import" className="gap-2">
                <Upload className="h-4 w-4" />
                Import
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto px-6 py-4">
              <TabsContent value="generate" className="mt-0 h-full">
                <div className="space-y-4">
                  {/* Presets */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Quick Presets</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {generatorPresets.map(preset => {
                        const Icon = preset.icon
                        return (
                          <Card
                            key={preset.id}
                            className={cn(
                              "p-3 cursor-pointer hover:bg-gray-50 transition-colors",
                              selectedPreset === preset.id && "border-primary bg-primary/5"
                            )}
                            onClick={() => handlePresetSelect(preset)}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span className="text-sm font-medium">{preset.label}</span>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </div>

                  {/* Custom Prompt */}
                  <div>
                    <Label htmlFor="prompt">Generation Prompt</Label>
                    <Textarea
                      id="prompt"
                      placeholder="e.g., Generate 50 Fortune 500 companies in technology sector"
                      value={generationPrompt}
                      onChange={(e) => setGenerationPrompt(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="count">Number of Items</Label>
                      <Input
                        id="count"
                        type="number"
                        value={count}
                        onChange={(e) => setCount(parseInt(e.target.value) || 20)}
                        min={1}
                        max={1000}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry (Optional)</Label>
                      <Input
                        id="industry"
                        placeholder="e.g., Healthcare"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location (Optional)</Label>
                      <Input
                        id="location"
                        placeholder="e.g., San Francisco"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Additional Filters */}
                  <div>
                    <Label htmlFor="filters">Additional Filters (Optional)</Label>
                    <Input
                      id="filters"
                      placeholder="e.g., Founded after 2020, Revenue > $10M"
                      value={additionalFilters}
                      onChange={(e) => setAdditionalFilters(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={generating || !generationPrompt}
                    className="w-full"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Data
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="search" className="mt-0 h-full">
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">Search functionality coming soon</p>
                    <p className="text-xs mt-2">Will integrate with LinkedIn, Crunchbase, and other databases</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="import" className="mt-0 h-full">
                <div className="space-y-4">
                  {/* URL Import */}
                  <div>
                    <Label htmlFor="url">Extract from URL</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="url"
                        type="url"
                        placeholder="https://example.com/company-list"
                        value={importUrl}
                        onChange={(e) => setImportUrl(e.target.value)}
                      />
                      <Button
                        onClick={handleExtractFromUrl}
                        disabled={generating || !importUrl}
                      >
                        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Text Import */}
                  <div>
                    <Label htmlFor="paste">Paste Text (One item per line)</Label>
                    <Textarea
                      id="paste"
                      placeholder="Paste your list here...&#10;Company A&#10;Company B&#10;Company C"
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      className="mt-1 font-mono text-sm"
                      rows={6}
                    />
                    <Button
                      onClick={handlePastedTextExtract}
                      disabled={!pastedText}
                      className="mt-2 w-full"
                      variant="outline"
                    >
                      Extract Items
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Preview Section */}
          {previewData.length > 0 && (
            <div className="border-t p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm font-medium">Preview ({previewData.length} items)</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewData([])}
                >
                  Clear
                </Button>
              </div>
              <ScrollArea className="h-32 border p-3">
                <div className="space-y-1">
                  {previewData.slice(0, 50).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-8">{idx + 1}.</span>
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                  {previewData.length > 50 && (
                    <div className="text-xs text-gray-500 mt-2">
                      ...and {previewData.length - 50} more items
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mx-6 mb-4 flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImportToSpreadsheet}
            disabled={previewData.length === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            Import {previewData.length} Items
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}