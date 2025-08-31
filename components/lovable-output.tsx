"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { X, FileText, LayoutDashboard, Presentation, ChevronRight, ChevronDown, Play, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface LovableOutputProps {
  onClose: () => void
  onComplete?: () => void
}

const outputTemplates = {
  reports: [
    {
      name: "Financial Report",
      prompt: "Generate a comprehensive financial report with P&L, balance sheet, and key metrics",
      description: "Monthly/Quarterly financial statements"
    },
    {
      name: "Sales Report", 
      prompt: "Create a sales performance report with revenue trends, pipeline analysis, and forecasts",
      description: "Track sales metrics and performance"
    },
    {
      name: "Marketing Report",
      prompt: "Build a marketing performance report with campaign ROI, lead generation, and conversion metrics",
      description: "Campaign effectiveness and ROI"
    },
    {
      name: "Operations Report",
      prompt: "Generate operations metrics report with efficiency, quality, and productivity KPIs",
      description: "Operational performance metrics"
    }
  ],
  dashboards: [
    {
      name: "Executive Dashboard",
      prompt: "Create a CEO dashboard with high-level KPIs, revenue, growth, and strategic metrics",
      description: "C-suite level overview"
    },
    {
      name: "Sales Dashboard",
      prompt: "Build a real-time sales dashboard with pipeline, quotas, and rep performance",
      description: "Live sales team performance"
    },
    {
      name: "Customer Dashboard",
      prompt: "Design a customer success dashboard with NPS, churn, usage, and health scores",
      description: "Customer health and satisfaction"
    },
    {
      name: "Financial Dashboard",
      prompt: "Create a financial dashboard with cash flow, burn rate, and runway metrics",
      description: "Real-time financial health"
    }
  ],
  presentations: [
    {
      name: "Board Deck",
      prompt: "Generate a board presentation with financials, strategy updates, and key initiatives",
      description: "Quarterly board meeting deck"
    },
    {
      name: "Investor Update",
      prompt: "Create an investor update with metrics, milestones, and fundraising progress",
      description: "Monthly investor newsletter"
    },
    {
      name: "Team All-Hands",
      prompt: "Build an all-hands presentation with company updates, wins, and goals",
      description: "Company-wide meeting deck"
    },
    {
      name: "Client QBR",
      prompt: "Generate a quarterly business review for clients with performance and value metrics",
      description: "Client success review"
    }
  ]
}

export function LovableOutput({ onClose }: LovableOutputProps) {
  const { data, headers, addTab, setActiveTab } = useSpreadsheetStore()
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof outputTemplates>('reports')
  const [isGenerating, setIsGenerating] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    templates: true
  })

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const generateOutput = async (templateName: string, prompt: string, outputType: string) => {
    setIsGenerating(true)
    
    try {
      // Call API to generate output based on type
      const response = await fetch('/api/generate-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          naturalLanguagePrompt: prompt,
          outputType: outputType,
          data: {
            headers,
            rows: data
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to generate ${outputType}`)
      }

      const output = await response.json()
      
      // Create a new tab for this output
      const tabId = `${outputType}-${Date.now()}`
      
      addTab({
        id: tabId,
        type: 'dashboard',
        title: templateName,
        data: output,
        metadata: {
          outputType,
          sourceColumns: headers.slice(0, 3),
          createdAt: new Date(),
          prompt: prompt
        }
      })
      
      // Switch to the new tab
      setActiveTab(tabId)
      
      // Show success toast
      toast.success(`${templateName} generated successfully!`, {
        description: `Created ${templateName} with ${output.sections?.length || 0} sections`
      })
      
    } catch (error: any) {
      console.error('Output generation error:', error)
      toast.error(`Failed to generate ${outputType}`, {
        description: error.message || 'Please try again'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTemplateClick = async (template: { name: string; prompt: string; description?: string }, category: string) => {
    await generateOutput(template.name, template.prompt, category)
  }


  const categoryIcons = {
    reports: FileText,
    dashboards: LayoutDashboard,
    presentations: Presentation
  }

  return (
    <div className="w-full sm:w-80 md:w-96 max-w-[400px] flex-shrink-0 h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-purple-600" />
          <h2 className="font-semibold">Generate Output</h2>
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
          {/* Output Templates Section */}
          <Collapsible 
            open={openSections.templates} 
            onOpenChange={() => toggleSection('templates')}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Output Templates</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Pre-built templates for reports, dashboards, and presentations
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
                    {Object.keys(outputTemplates).map((category) => {
                      const Icon = categoryIcons[category as keyof typeof categoryIcons]
                      return (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category as keyof typeof outputTemplates)}
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
                    {outputTemplates[selectedCategory].map((template, idx) => (
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
                            {template.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Quick Tips */}
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs text-purple-900">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-purple-800 space-y-1">
              <p>• Choose a template that matches your needs</p>
              <p>• Reports are static documents with detailed analysis</p>
              <p>• Dashboards are interactive with real-time data</p>
              <p>• Presentations are slide-based for meetings</p>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button 
          className="w-full bg-purple-600 text-white hover:bg-purple-700"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Select a Template
            </>
          )}
        </Button>
      </div>
    </div>
  )
}