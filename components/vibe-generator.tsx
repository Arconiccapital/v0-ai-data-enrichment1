"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { 
  Wand2, 
  Sparkles,
  Loader2,
  Info,
  TrendingUp,
  BarChart3,
  FileText,
  Users,
  DollarSign,
  Target,
  Zap
} from "lucide-react"
import { toast } from "sonner"

interface VibeGeneratorProps {
  onGenerate: (prompt: string) => Promise<void>
  onCancel: () => void
}

// Example prompts to inspire users
const examplePrompts = [
  {
    icon: <TrendingUp className="h-4 w-4" />,
    text: "Show me what's interesting in this data",
    category: 'discovery'
  },
  {
    icon: <BarChart3 className="h-4 w-4" />,
    text: "Create a dashboard showing our top performers",
    category: 'performance'
  },
  {
    icon: <Users className="h-4 w-4" />,
    text: "Analyze customer behavior patterns",
    category: 'analysis'
  },
  {
    icon: <DollarSign className="h-4 w-4" />,
    text: "Show revenue trends and forecasts",
    category: 'financial'
  },
  {
    icon: <Target className="h-4 w-4" />,
    text: "Identify opportunities for growth",
    category: 'strategic'
  },
  {
    icon: <FileText className="h-4 w-4" />,
    text: "Generate an executive summary with key insights",
    category: 'reporting'
  }
]

export function VibeGenerator({ onGenerate, onCancel }: VibeGeneratorProps) {
  const { headers, data } = useSpreadsheetStore()
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedExample, setSelectedExample] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])
  
  // Data context for better AI understanding
  const getDataContext = () => {
    const rowCount = data.length
    const columnCount = headers.length
    const columnTypes = headers.map((header, idx) => {
      // Simple type detection
      const samples = data.slice(0, 5).map(row => row[idx])
      const hasNumbers = samples.some(val => !isNaN(Number(val)))
      const hasDates = samples.some(val => /\d{4}-\d{2}-\d{2}/.test(val))
      
      return {
        name: header,
        type: hasDates ? 'date' : hasNumbers ? 'numeric' : 'text',
        samples: samples.slice(0, 3)
      }
    })
    
    return {
      rowCount,
      columnCount,
      columns: columnTypes
    }
  }
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe what you'd like to create")
      return
    }
    
    setIsGenerating(true)
    
    try {
      // Add data context to the prompt for better AI understanding
      const context = getDataContext()
      const enhancedPrompt = `
        User request: ${prompt}
        
        Available data:
        - ${context.rowCount} rows, ${context.columnCount} columns
        - Columns: ${context.columns.map(c => `${c.name} (${c.type})`).join(', ')}
        
        Generate a dashboard that best addresses the user's request using this data.
      `
      
      await onGenerate(enhancedPrompt)
    } catch (error) {
      console.error('Generation failed:', error)
      toast.error("Failed to generate dashboard. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handleExampleClick = (example: typeof examplePrompts[0]) => {
    setPrompt(example.text)
    setSelectedExample(example.text)
    textareaRef.current?.focus()
  }
  
  // Smart suggestions based on data
  const getSmartSuggestions = () => {
    const suggestions = []
    
    // Check for date columns
    if (headers.some(h => h.toLowerCase().includes('date'))) {
      suggestions.push("Show trends over time")
    }
    
    // Check for revenue/amount columns
    if (headers.some(h => h.toLowerCase().includes('revenue') || h.toLowerCase().includes('amount'))) {
      suggestions.push("Analyze revenue performance")
    }
    
    // Check for customer columns
    if (headers.some(h => h.toLowerCase().includes('customer') || h.toLowerCase().includes('client'))) {
      suggestions.push("Customer segmentation analysis")
    }
    
    return suggestions
  }
  
  const smartSuggestions = getSmartSuggestions()
  
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Create with Natural Language
        </CardTitle>
        <CardDescription>
          Describe what you want to create and AI will build it from your data
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Data Context Info */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Working with {data.length} rows across {headers.length} columns:
            <span className="font-medium ml-1">
              {headers.slice(0, 3).join(', ')}
              {headers.length > 3 && '...'}
            </span>
          </AlertDescription>
        </Alert>
        
        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            What would you like to create?
          </label>
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., 'Show me customer churn patterns with risk scores' or 'Create a sales performance dashboard with regional breakdown'"
            className="min-h-[100px] resize-none"
            disabled={isGenerating}
          />
        </div>
        
        {/* Smart Suggestions */}
        {smartSuggestions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Zap className="h-4 w-4 text-yellow-600" />
              Based on your data, you might want to:
            </div>
            <div className="flex flex-wrap gap-2">
              {smartSuggestions.map((suggestion, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(suggestion)}
                  disabled={isGenerating}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Example Prompts */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Or try these examples:</p>
          <div className="grid grid-cols-1 gap-2">
            {examplePrompts.map((example, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleClick(example)}
                disabled={isGenerating}
                className={`flex items-center gap-3 p-3 text-left border rounded-lg hover:bg-accent transition-colors ${
                  selectedExample === example.text ? 'border-primary bg-accent' : ''
                } ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="text-primary">{example.icon}</div>
                <span className="text-sm">{example.text}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Advanced Options (Optional) */}
        <details className="space-y-2">
          <summary className="text-sm font-medium cursor-pointer">
            Advanced Options
          </summary>
          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="include-insights"
                className="rounded"
                defaultChecked
              />
              <label htmlFor="include-insights" className="text-sm">
                Include AI-generated insights
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="include-predictions"
                className="rounded"
              />
              <label htmlFor="include-predictions" className="text-sm">
                Add predictive analytics (if applicable)
              </label>
            </div>
          </div>
        </details>
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}