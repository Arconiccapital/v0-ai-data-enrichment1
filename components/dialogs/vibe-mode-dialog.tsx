"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { 
  Wand2,
  Sparkles,
  Loader2,
  Info,
  ArrowRight,
  Filter,
  Shuffle,
  Plus,
  Trash2,
  Edit3,
  TrendingUp,
  Users,
  DollarSign,
  Target
} from "lucide-react"
import { toast } from "sonner"

interface VibeModeDialogProps {
  open: boolean
  onClose: () => void
}

// Transform examples specific to data manipulation
const transformExamples = [
  {
    icon: <Filter className="h-4 w-4" />,
    text: "Filter to only show companies with >100 employees",
    category: 'filter'
  },
  {
    icon: <Shuffle className="h-4 w-4" />,
    text: "Combine first and last name into full name",
    category: 'transform'
  },
  {
    icon: <Plus className="h-4 w-4" />,
    text: "Calculate a lead score based on multiple factors",
    category: 'calculate'
  },
  {
    icon: <Edit3 className="h-4 w-4" />,
    text: "Clean and standardize company names",
    category: 'clean'
  },
  {
    icon: <TrendingUp className="h-4 w-4" />,
    text: "Add growth rate calculations",
    category: 'analyze'
  },
  {
    icon: <Target className="h-4 w-4" />,
    text: "Categorize companies by industry and size",
    category: 'categorize'
  }
]

export function VibeModeDialog({ open, onClose }: VibeModeDialogProps) {
  const { headers, data, setData, addColumn } = useSpreadsheetStore()
  const [prompt, setPrompt] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewData, setPreviewData] = useState<any[] | null>(null)
  const [selectedExample, setSelectedExample] = useState<string | null>(null)
  
  const handleTransform = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe the transformation you want")
      return
    }
    
    setIsProcessing(true)
    
    try {
      // Simulate AI transformation
      // In production, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate preview based on prompt
      const transformedData = generateTransformedData(prompt)
      setPreviewData(transformedData)
      
      toast.success("Transformation complete! Review the changes below.")
    } catch (error) {
      console.error('Transformation failed:', error)
      toast.error("Failed to transform data. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }
  
  const generateTransformedData = (userPrompt: string) => {
    // Simulate different transformations based on keywords
    const lowerPrompt = userPrompt.toLowerCase()
    
    if (lowerPrompt.includes('filter')) {
      // Filter example
      return data.slice(0, Math.floor(data.length / 2))
    } else if (lowerPrompt.includes('combine') || lowerPrompt.includes('merge')) {
      // Combine columns example
      return data.map(row => {
        const newRow = [...row]
        if (headers.length > 1) {
          newRow.push(`${row[0]} ${row[1]}`)
        }
        return newRow
      })
    } else if (lowerPrompt.includes('score') || lowerPrompt.includes('calculate')) {
      // Add calculated column
      return data.map(row => {
        const newRow = [...row]
        newRow.push(Math.floor(Math.random() * 100).toString())
        return newRow
      })
    } else if (lowerPrompt.includes('clean') || lowerPrompt.includes('standardize')) {
      // Clean data example
      return data.map(row => 
        row.map(cell => cell.trim().replace(/\s+/g, ' '))
      )
    } else {
      // Default: add a new enriched column
      return data.map(row => {
        const newRow = [...row]
        newRow.push('AI Generated')
        return newRow
      })
    }
  }
  
  const applyTransformation = () => {
    if (!previewData) return
    
    // Check if new columns were added
    const newColumnCount = previewData[0]?.length - headers.length
    if (newColumnCount > 0) {
      for (let i = 0; i < newColumnCount; i++) {
        addColumn(`AI Column ${headers.length + i + 1}`)
      }
    }
    
    // Apply the transformation
    setData(headers, previewData)
    toast.success("Transformation applied successfully!")
    onClose()
  }
  
  const handleExampleClick = (example: typeof transformExamples[0]) => {
    setPrompt(example.text)
    setSelectedExample(example.text)
  }
  
  // Get smart suggestions based on current data
  const getSmartSuggestions = () => {
    const suggestions = []
    
    // Analyze headers for suggestions
    if (headers.some(h => h.toLowerCase().includes('email'))) {
      suggestions.push("Extract domain from email addresses")
    }
    
    if (headers.some(h => h.toLowerCase().includes('name'))) {
      suggestions.push("Split names into first and last")
    }
    
    if (headers.some(h => h.toLowerCase().includes('revenue') || h.toLowerCase().includes('sales'))) {
      suggestions.push("Calculate year-over-year growth")
    }
    
    if (data.length > 100) {
      suggestions.push("Group and summarize by category")
    }
    
    return suggestions
  }
  
  const smartSuggestions = getSmartSuggestions()
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Vibe Mode - Transform Your Data
          </DialogTitle>
          <DialogDescription>
            Use natural language to filter, transform, or enrich your data
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="transform" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transform">Transform</TabsTrigger>
              <TabsTrigger value="preview" disabled={!previewData}>
                Preview {previewData && `(${previewData.length} rows)`}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="transform" className="space-y-4">
              {/* Data Context */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Working with {data.length} rows and {headers.length} columns.
                  Columns: {headers.slice(0, 5).join(', ')}
                  {headers.length > 5 && '...'}
                </AlertDescription>
              </Alert>
              
              {/* Prompt Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Describe your transformation:
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., 'Remove duplicate companies and calculate average deal size per industry'"
                  className="min-h-[100px]"
                  disabled={isProcessing}
                />
              </div>
              
              {/* Smart Suggestions */}
              {smartSuggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-600" />
                    Suggestions based on your data:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {smartSuggestions.map((suggestion, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => setPrompt(suggestion)}
                        disabled={isProcessing}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Example Transformations */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Common transformations:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {transformExamples.map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExampleClick(example)}
                      disabled={isProcessing}
                      className={cn(
                        "flex items-center gap-3 p-3 text-left border rounded-lg",
                        "hover:bg-accent transition-colors",
                        selectedExample === example.text ? "border-primary bg-accent" : "",
                        isProcessing && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="text-primary">{example.icon}</div>
                      <span className="text-sm">{example.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4">
              {previewData && (
                <>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Preview of transformation. Original: {data.length} rows → 
                      Transformed: {previewData.length} rows
                    </AlertDescription>
                  </Alert>
                  
                  {/* Preview Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            {headers.map((header, idx) => (
                              <th key={idx} className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                {header}
                              </th>
                            ))}
                            {previewData[0]?.length > headers.length && (
                              <th className="px-4 py-2 text-left text-xs font-medium text-green-600">
                                New Column
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.slice(0, 5).map((row, rowIdx) => (
                            <tr key={rowIdx} className="border-t">
                              {row.map((cell: string, cellIdx: number) => (
                                <td 
                                  key={cellIdx} 
                                  className={cn(
                                    "px-4 py-2 text-sm",
                                    cellIdx >= headers.length && "bg-green-50"
                                  )}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {previewData.length > 5 && (
                      <div className="px-4 py-2 bg-gray-50 text-center text-sm text-gray-500">
                        ... and {previewData.length - 5} more rows
                      </div>
                    )}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {previewData && (
              <span className="text-green-600">
                ✓ Transformation ready to apply
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {!previewData ? (
              <Button 
                onClick={handleTransform}
                disabled={!prompt.trim() || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Transforming...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Transform
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={applyTransformation}>
                <Check className="h-4 w-4 mr-2" />
                Apply Transformation
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Add missing import
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"