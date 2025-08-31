"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { X, BarChart3, Play, TrendingUp, Users, DollarSign, ChevronRight, ChevronDown, Loader2 } from "lucide-react"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"

interface AnalyzeSidebarProps {
  onClose: () => void
  onComplete?: () => void
}

const analysisTemplates = {
  sales: [
    { name: "Lead Scoring", prompt: "Score leads from 1-10 based on company size and engagement" },
    { name: "Deal Size Prediction", prompt: "Predict deal size based on company metrics" },
    { name: "Win Probability", prompt: "Calculate win probability for each opportunity" }
  ],
  customer: [
    { name: "Churn Risk", prompt: "Identify customers at risk of churning" },
    { name: "Segmentation", prompt: "Segment customers by value and behavior" },
    { name: "Lifetime Value", prompt: "Calculate customer lifetime value" }
  ],
  financial: [
    { name: "Revenue Forecast", prompt: "Forecast revenue based on historical data" },
    { name: "Risk Assessment", prompt: "Assess financial risk level" },
    { name: "Profitability Analysis", prompt: "Analyze profitability by segment" }
  ]
}

export function AnalyzeSidebar({ onClose }: AnalyzeSidebarProps) {
  const { addTab, setActiveTab } = useSpreadsheetStore()
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof analysisTemplates>("sales")
  const [customPrompt, setCustomPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    templates: true,
    custom: false
  })

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const generateAnalysis = async (templateName: string, prompt: string, analysisType: string) => {
    setIsGenerating(true)
    
    // Simulate analysis generation
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Create a new tab for the analysis
    const tabId = `analysis-${Date.now()}`
    const newTab = {
      id: tabId,
      type: 'analysis' as const,
      title: templateName,
      metadata: {
        analysisType,
        prompt,
        createdAt: new Date(),
        sourceColumns: [] // Would be populated based on actual data columns used
      },
      data: {
        // This would contain actual analysis results
        type: analysisType,
        results: {}
      }
    }
    
    // Add the tab and switch to it
    addTab(newTab)
    setActiveTab(tabId)
    
    setIsGenerating(false)
    
    // Keep sidebar open for more generation
    // onClose() // Don't close automatically
  }

  const handleTemplateClick = async (template: { name: string; prompt: string }, category: string) => {
    // Map template names to analysis types
    const analysisTypeMap: Record<string, string> = {
      'Lead Scoring': 'lead-scoring',
      'Deal Size Prediction': 'deal-prediction',
      'Win Probability': 'win-probability',
      'Churn Risk': 'churn-risk',
      'Segmentation': 'segmentation',
      'Lifetime Value': 'lifetime-value',
      'Revenue Forecast': 'revenue-forecast',
      'Risk Assessment': 'risk-assessment',
      'Profitability Analysis': 'profitability',
      'DCF Model': 'dcf-model'
    }
    
    const analysisType = analysisTypeMap[template.name] || 'custom'
    await generateAnalysis(template.name, template.prompt, analysisType)
  }

  const handleCustomAnalyze = async () => {
    if (!customPrompt.trim()) return
    await generateAnalysis('Custom Analysis', customPrompt, 'custom')
    setCustomPrompt('')
  }

  const categoryIcons = {
    sales: TrendingUp,
    customer: Users,
    financial: DollarSign
  }

  return (
    <div className="w-full sm:w-80 md:w-96 max-w-[400px] flex-shrink-0 h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold">Analyze Data</h2>
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
          {/* Analysis Templates Section */}
          <Collapsible 
            open={openSections.templates} 
            onOpenChange={() => toggleSection('templates')}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Analysis Templates</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Pre-built analysis patterns for common use cases
                      </CardDescription>
                    </div>
                    {openSections.templates ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  {/* Category Tabs */}
                  <div className="flex gap-2 mb-3">
                    {Object.keys(analysisTemplates).map((category) => {
                      const Icon = categoryIcons[category as keyof typeof categoryIcons]
                      return (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category as keyof typeof analysisTemplates)}
                          className="flex-1"
                        >
                          <Icon className="h-4 w-4 mr-1" />
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Button>
                      )
                    })}
                  </div>

                  {/* Template Cards */}
                  <div className="space-y-2">
                    {analysisTemplates[selectedCategory].map((template, idx) => (
                      <Card 
                        key={idx}
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleTemplateClick(template, selectedCategory)}
                      >
                        <CardHeader className="pb-2 pt-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-xs">{template.name}</CardTitle>
                            <Play className="h-3 w-3 text-gray-400" />
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <CardDescription className="text-xs">
                            {template.prompt}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Custom Analysis Section */}
          <Collapsible 
            open={openSections.custom} 
            onOpenChange={() => toggleSection('custom')}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Custom Analysis</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Write your own analysis prompt
                      </CardDescription>
                    </div>
                    {openSections.custom ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <Textarea
                    placeholder="Describe the analysis you want to perform..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="min-h-[120px]"
                  />
                  {customPrompt && (
                    <div className="mt-2 text-xs text-gray-500">
                      {customPrompt.length} characters
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Quick Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs text-blue-900">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-blue-800 space-y-1">
              <p>• Click any template to generate that analysis</p>
              <p>• Each analysis opens in a new tab</p>
              <p>• Switch between analyses using the tab bar</p>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button 
          className="w-full bg-blue-600 text-white hover:bg-blue-700"
          onClick={handleCustomAnalyze}
          disabled={!customPrompt.trim() || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Custom Analysis
            </>
          )}
        </Button>
      </div>
    </div>
  )
}