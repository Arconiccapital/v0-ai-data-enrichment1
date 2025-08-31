"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { X, Loader2, Wand2, Sparkles, BarChart3, FileText, TrendingUp, Users, DollarSign } from "lucide-react"
import { toast } from "sonner"

interface GenerateSidebarProps {
  onClose: () => void
  onComplete?: () => void
}

// Example prompts for quick access
const examplePrompts = [
  {
    icon: <BarChart3 className="h-4 w-4" />,
    text: "Create a sales performance dashboard with revenue trends and top performers",
    category: "dashboard"
  },
  {
    icon: <TrendingUp className="h-4 w-4" />,
    text: "Show me what's interesting in this data",
    category: "analysis"
  },
  {
    icon: <FileText className="h-4 w-4" />,
    text: "Generate an executive summary report with key insights",
    category: "report"
  },
  {
    icon: <Users className="h-4 w-4" />,
    text: "Analyze customer segments and identify patterns",
    category: "analysis"
  },
  {
    icon: <DollarSign className="h-4 w-4" />,
    text: "Create an ETF comparison dashboard with performance, risk, and cost analysis",
    category: "dashboard"
  },
  {
    icon: <DollarSign className="h-4 w-4" />,
    text: "Build a financial overview with P&L and cash flow",
    category: "dashboard"
  }
]

export function GenerateSidebar({ onClose }: GenerateSidebarProps) {
  const { data, headers, addTab, setActiveTab } = useSpreadsheetStore()
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingType, setGeneratingType] = useState<string>("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // Detect content type from prompt
  const detectContentType = (promptText: string): 'dashboard' | 'analysis' | 'report' => {
    const lowerPrompt = promptText.toLowerCase()
    
    // Dashboard keywords
    if (lowerPrompt.includes('dashboard') || 
        lowerPrompt.includes('visualize') || 
        lowerPrompt.includes('chart') || 
        lowerPrompt.includes('kpi') ||
        lowerPrompt.includes('metrics') ||
        lowerPrompt.includes('overview') ||
        lowerPrompt.includes('build') ||
        lowerPrompt.includes('create a') ||
        lowerPrompt.includes('generate a')) {
      return 'dashboard'
    }
    
    // Report keywords
    if (lowerPrompt.includes('report') || 
        lowerPrompt.includes('summary') || 
        lowerPrompt.includes('document') ||
        lowerPrompt.includes('presentation')) {
      return 'report'
    }
    
    // Analysis keywords
    if (lowerPrompt.includes('analyze') || 
        lowerPrompt.includes('analysis') || 
        lowerPrompt.includes('insights') ||
        lowerPrompt.includes('patterns') ||
        lowerPrompt.includes('trends') ||
        lowerPrompt.includes('what') ||
        lowerPrompt.includes('why') ||
        lowerPrompt.includes('how') ||
        lowerPrompt.includes('interesting') ||
        lowerPrompt.includes('find') ||
        lowerPrompt.includes('identify')) {
      return 'analysis'
    }
    
    // Default to dashboard for ambiguous prompts
    return 'dashboard'
  }

  const generateContent = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt")
      return
    }

    const contentType = detectContentType(prompt)
    const displayType = contentType === 'analysis' ? 'Analysis' : 
                       contentType === 'report' ? 'Report' : 'Dashboard'
    
    setIsGenerating(true)
    setGeneratingType(displayType)
    
    try {
      // Determine the API endpoint based on content type
      const endpoint = contentType === 'analysis' ? '/api/analyze' : '/api/generate-dashboard'
      
      const payload = contentType === 'analysis' 
        ? { prompt, rows: data, headers }
        : { naturalLanguagePrompt: prompt, data: { headers, rows: data } }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Generation failed:', response.status, errorText)
        throw new Error(`Failed to generate ${displayType}`)
      }

      const result = await response.json()
      
      // Create a new tab for the generated content
      const tabId = `${contentType}-${Date.now()}`
      
      addTab({
        id: tabId,
        type: contentType === 'analysis' ? 'analysis' : 'dashboard',
        title: `AI ${displayType}`,
        data: result,
        metadata: {
          analysisType: contentType === 'analysis' ? 'quick-insight' : contentType,
          sourceColumns: headers.slice(0, 3),
          createdAt: new Date(),
          prompt
        }
      })
      
      setActiveTab(tabId)
      
      toast.success(`${displayType} generated successfully!`, {
        description: `Your ${displayType.toLowerCase()} is ready to view`
      })
      
      // Clear prompt and close sidebar
      setPrompt("")
      onClose()
      
    } catch (error: any) {
      console.error('Generation error:', error)
      toast.error(`Failed to generate ${displayType}`, {
        description: error.message || 'Please try again with a different prompt'
      })
    } finally {
      setIsGenerating(false)
      setGeneratingType("")
    }
  }

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt)
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      generateContent()
    }
  }

  return (
    <div className="w-full sm:w-96 md:w-[450px] max-w-[450px] flex-shrink-0 h-full bg-white border-l border-gray-200 flex flex-col relative">
      {/* Loading Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Generating {generatingType}</h3>
            <p className="text-sm text-gray-600">Analyzing your data...</p>
            <p className="text-xs text-gray-500 mt-2">This may take a few moments</p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-indigo-600" />
          <h2 className="font-semibold">Generate with AI</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
          disabled={isGenerating}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Main prompt input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              What would you like to create?
            </label>
            <Textarea
              ref={textareaRef}
              placeholder="Describe what you want to generate... (e.g., 'Create a sales dashboard with revenue trends' or 'Analyze customer behavior patterns')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[120px] resize-none"
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-500">
              Press {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Enter to generate
            </p>
          </div>

          {/* Example prompts */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Try these examples:
            </p>
            <div className="space-y-2">
              {examplePrompts.map((example, idx) => (
                <Card
                  key={idx}
                  className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleExampleClick(example.text)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-indigo-100 rounded">
                      {example.icon}
                    </div>
                    <p className="text-sm text-gray-700 flex-1">
                      {example.text}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Data context */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <p className="text-xs font-medium text-gray-600">Your data:</p>
            <p className="text-xs text-gray-500">
              {data.length} rows × {headers.length} columns
            </p>
            <p className="text-xs text-gray-500">
              Columns: {headers.slice(0, 3).join(', ')}
              {headers.length > 3 && `, +${headers.length - 3} more`}
            </p>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button 
          className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
          disabled={isGenerating || !prompt.trim()}
          onClick={generateContent}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate
            </>
          )}
        </Button>
      </div>
    </div>
  )
}