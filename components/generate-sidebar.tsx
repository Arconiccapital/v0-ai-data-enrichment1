"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { X, Sparkles, FileText, LayoutDashboard, Presentation, BarChart3, Zap, Play, Loader2, Wand2 } from "lucide-react"
import { toast } from "sonner"

interface GenerateSidebarProps {
  onClose: () => void
  onComplete?: () => void
}

// Quick Insights - One-click analysis for immediate value
const quickInsights = [
  {
    name: "What's Interesting?",
    prompt: "Analyze this data and tell me the most interesting patterns, outliers, and insights",
    icon: Sparkles,
    description: "Find patterns automatically"
  },
  {
    name: "Summary Stats",
    prompt: "Generate comprehensive summary statistics and key metrics for this dataset",
    icon: BarChart3,
    description: "Key metrics overview"
  },
  {
    name: "Quick Report",
    prompt: "Create a one-page executive summary with the most important findings",
    icon: FileText,
    description: "Executive summary"
  }
]

// Analysis templates organized by business function
const analysisTemplates = {
  sales: [
    { name: "Win Rate Analysis", prompt: "Analyze why deals are won or lost", description: "Understand sales success" },
    { name: "Sales Rep Performance", prompt: "Rank reps by performance metrics", description: "Find top performers" },
    { name: "Pipeline Health", prompt: "Assess pipeline quality and forecast", description: "Hit your targets" }
  ],
  customer: [
    { name: "Customer Health Score", prompt: "Calculate health scores to prevent churn", description: "Prevent churn early" },
    { name: "Best Customers", prompt: "Identify most valuable customer segments", description: "Focus on high value" },
    { name: "Usage Patterns", prompt: "Analyze customer behavior patterns", description: "Understand behavior" }
  ],
  operations: [
    { name: "Process Bottlenecks", prompt: "Find where processes slow down", description: "Fix operational delays" },
    { name: "Quality Metrics", prompt: "Analyze quality issues and root causes", description: "Improve quality" },
    { name: "Resource Utilization", prompt: "Assess resource efficiency", description: "Optimize allocation" }
  ],
  financial: [
    { name: "Unit Economics", prompt: "Calculate CAC, LTV, and payback period", description: "Profitable growth" },
    { name: "Burn Rate", prompt: "Analyze cash burn and runway", description: "Cash management" },
    { name: "ROI Analysis", prompt: "Calculate return on investments", description: "Investment returns" }
  ]
}

// Output templates for reports, dashboards, and presentations
const outputTemplates = {
  reports: [
    { name: "Financial Report", prompt: "Generate comprehensive financial statements", description: "P&L and balance sheet" },
    { name: "Sales Report", prompt: "Create sales performance report", description: "Revenue and pipeline" },
    { name: "Marketing Report", prompt: "Build marketing performance report", description: "Campaign ROI" },
    { name: "Operations Report", prompt: "Generate operations metrics report", description: "KPIs and efficiency" }
  ],
  dashboards: [
    { name: "Executive Dashboard", prompt: "Create CEO dashboard with KPIs", description: "C-suite overview" },
    { name: "Sales Dashboard", prompt: "Build real-time sales dashboard", description: "Live performance" },
    { name: "Customer Dashboard", prompt: "Design customer success dashboard", description: "Health and NPS" },
    { name: "Financial Dashboard", prompt: "Create financial health dashboard", description: "Cash and metrics" }
  ],
  presentations: [
    { name: "Board Deck", prompt: "Generate board presentation", description: "Quarterly board meeting" },
    { name: "Investor Update", prompt: "Create investor update deck", description: "Monthly newsletter" },
    { name: "Team All-Hands", prompt: "Build all-hands presentation", description: "Company updates" },
    { name: "Client QBR", prompt: "Generate quarterly business review", description: "Client success" }
  ]
}

export function GenerateSidebar({ onClose }: GenerateSidebarProps) {
  const { data, headers, addTab, setActiveTab } = useSpreadsheetStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<'quick' | 'analysis' | 'output'>('quick')

  const generateContent = async (name: string, prompt: string, contentType: string) => {
    setIsGenerating(true)
    
    try {
      // Determine the API endpoint based on content type
      const endpoint = contentType === 'analysis' ? '/api/analyze' : '/api/generate-dashboard'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          outputType: contentType,
          data: { headers, rows: data }
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to generate ${contentType}`)
      }

      const result = await response.json()
      
      // Create a new tab for the generated content
      const tabId = `${contentType}-${Date.now()}`
      
      addTab({
        id: tabId,
        type: contentType === 'analysis' ? 'analysis' : 'dashboard',
        title: name,
        data: result,
        metadata: {
          contentType,
          sourceColumns: headers.slice(0, 3),
          createdAt: new Date(),
          prompt
        }
      })
      
      setActiveTab(tabId)
      
      toast.success(`${name} generated successfully!`, {
        description: `Your ${contentType} is ready to view`
      })
      
    } catch (error: any) {
      toast.error(`Failed to generate ${contentType}`, {
        description: error.message || 'Please try again'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="w-full sm:w-96 md:w-[450px] max-w-[450px] flex-shrink-0 h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-indigo-600" />
          <h2 className="font-semibold">Generate Insights</h2>
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
        <div className="p-4">
          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quick">
                <Zap className="h-4 w-4 mr-1" />
                Quick
              </TabsTrigger>
              <TabsTrigger value="analysis">
                <BarChart3 className="h-4 w-4 mr-1" />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="output">
                <FileText className="h-4 w-4 mr-1" />
                Output
              </TabsTrigger>
            </TabsList>

            {/* Quick Insights Tab */}
            <TabsContent value="quick" className="space-y-3 mt-4">
              <p className="text-sm text-gray-600 mb-3">
                Get instant insights with one click
              </p>
              {quickInsights.map((insight) => {
                const Icon = insight.icon
                return (
                  <Card 
                    key={insight.name}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => generateContent(insight.name, insight.prompt, 'quick-insight')}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded">
                          <Icon className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-sm">{insight.name}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {insight.description}
                          </CardDescription>
                        </div>
                        <Play className="h-4 w-4 text-gray-400" />
                      </div>
                    </CardHeader>
                  </Card>
                )
              })}
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-3 mt-4">
              <p className="text-sm text-gray-600 mb-3">
                Deep-dive analysis by business function
              </p>
              {Object.entries(analysisTemplates).map(([category, templates]) => (
                <Card key={category}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs uppercase text-gray-500">
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {templates.map((template) => (
                      <div
                        key={template.name}
                        className="p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                        onClick={() => generateContent(template.name, template.prompt, 'analysis')}
                      >
                        <p className="text-sm font-medium">{template.name}</p>
                        <p className="text-xs text-gray-500">{template.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Output Tab */}
            <TabsContent value="output" className="space-y-3 mt-4">
              <p className="text-sm text-gray-600 mb-3">
                Professional reports and presentations
              </p>
              {Object.entries(outputTemplates).map(([category, templates]) => (
                <Card key={category}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs uppercase text-gray-500">
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {templates.map((template) => (
                      <div
                        key={template.name}
                        className="p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                        onClick={() => generateContent(template.name, template.prompt, category)}
                      >
                        <p className="text-sm font-medium">{template.name}</p>
                        <p className="text-xs text-gray-500">{template.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button 
          className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Click a template to generate
            </>
          )}
        </Button>
      </div>
    </div>
  )
}