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
    { 
      name: "Win Rate Analysis", 
      prompt: "Analyze why deals are won or lost, identify patterns in successful deals",
      description: "Understand what drives sales success"
    },
    { 
      name: "Sales Rep Performance", 
      prompt: "Rank sales reps by performance, identify top performers and coaching opportunities",
      description: "Find your top performers and coaching needs"
    },
    { 
      name: "Pipeline Health Check", 
      prompt: "Assess pipeline quality, identify risks and opportunities to hit targets",
      description: "Will you hit your sales targets?"
    }
  ],
  customer: [
    { 
      name: "Customer Health Score", 
      prompt: "Calculate health scores to identify at-risk customers before they churn",
      description: "Prevent churn before it happens"
    },
    { 
      name: "Best Customer Analysis", 
      prompt: "Identify your most valuable customers and what makes them successful",
      description: "Focus on your best customers"
    },
    { 
      name: "Usage Pattern Analysis", 
      prompt: "Analyze how customers use your product to improve engagement",
      description: "Understand customer behavior"
    }
  ],
  operations: [
    { 
      name: "Process Bottlenecks", 
      prompt: "Identify where processes slow down and impact efficiency",
      description: "Find and fix operational delays"
    },
    { 
      name: "Quality Metrics", 
      prompt: "Analyze quality issues, defect rates, and root causes",
      description: "Improve product/service quality"
    },
    { 
      name: "Resource Utilization", 
      prompt: "Assess how efficiently resources are being used",
      description: "Optimize resource allocation"
    }
  ],
  financial: [
    { 
      name: "Unit Economics", 
      prompt: "Calculate unit economics including CAC, LTV, and payback period",
      description: "Is your business model profitable?"
    },
    { 
      name: "Burn Rate Analysis", 
      prompt: "Analyze cash burn rate and runway projections",
      description: "How long will your cash last?"
    },
    { 
      name: "ROI Analysis", 
      prompt: "Calculate return on investment for different initiatives",
      description: "What's working and what's not?"
    }
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

  const handleTemplateClick = async (template: { name: string; prompt: string; description?: string }, category: string) => {
    // Map template names to analysis types
    const analysisTypeMap: Record<string, string> = {
      'Win Rate Analysis': 'win-rate',
      'Sales Rep Performance': 'rep-performance',
      'Pipeline Health Check': 'pipeline-health',
      'Customer Health Score': 'customer-health',
      'Best Customer Analysis': 'best-customers',
      'Usage Pattern Analysis': 'usage-patterns',
      'Process Bottlenecks': 'bottlenecks',
      'Quality Metrics': 'quality-metrics',
      'Resource Utilization': 'resource-utilization',
      'Unit Economics': 'unit-economics',
      'Burn Rate Analysis': 'burn-rate',
      'ROI Analysis': 'roi-analysis'
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
    operations: BarChart3,
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
                          {category === 'sales' ? 'Sales Performance' :
                           category === 'customer' ? 'Customer Intelligence' :
                           category === 'operations' ? 'Operational Excellence' :
                           category === 'financial' ? 'Financial Analysis' :
                           category.charAt(0).toUpperCase() + category.slice(1)}
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
                            {template.description || template.prompt}
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