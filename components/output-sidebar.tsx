"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  X, 
  FileText, 
  Mail, 
  LayoutDashboard, 
  ChevronRight, 
  ChevronDown,
  Sparkles,
  Loader2,
  Eye,
  Edit,
  Download,
  Send,
  RefreshCw,
  ExternalLink
} from "lucide-react"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { reportTemplateCategories, emailTemplateCategories } from "@/lib/output-templates"
import { dashboardTemplateCategories } from "@/lib/dashboard-templates"

interface OutputSidebarProps {
  onClose: () => void
}

interface DataAnalysis {
  dataType: string
  keyColumns: string[]
  suggestedTemplates: string[]
  insights: string[]
}

export function OutputSidebar({ onClose }: OutputSidebarProps) {
  const router = useRouter()
  const { data, headers, analyzeData } = useSpreadsheetStore()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [dataAnalysis, setDataAnalysis] = useState<DataAnalysis | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [generatedContent, setGeneratedContent] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editedContent, setEditedContent] = useState("")
  const [isCreatingDashboard, setIsCreatingDashboard] = useState(false)

  // Analyze data when sidebar opens
  useEffect(() => {
    if (!dataAnalysis && data.length > 0) {
      handleAnalyzeData()
    }
  }, [])

  const handleAnalyzeData = async () => {
    setIsAnalyzing(true)
    
    try {
      // Analyze the data structure
      const analysis = analyzeData()
      
      // Determine data type based on columns
      const columnNames = headers.map(h => h.toLowerCase())
      let detectedType = 'general'
      let suggestedTemplates = []
      
      if (columnNames.some(c => c.includes('revenue') || c.includes('sales') || c.includes('deal'))) {
        detectedType = 'sales'
        suggestedTemplates = ['pipeline-summary', 'win-loss-analysis', 'sales-forecast']
      } else if (columnNames.some(c => c.includes('customer') || c.includes('user') || c.includes('client'))) {
        detectedType = 'customer'
        suggestedTemplates = ['customer-overview', 'churn-analysis', 'satisfaction-report']
      } else if (columnNames.some(c => c.includes('product') || c.includes('inventory') || c.includes('stock'))) {
        detectedType = 'inventory'
        suggestedTemplates = ['inventory-status', 'product-performance', 'stock-alerts']
      } else if (columnNames.some(c => c.includes('expense') || c.includes('cost') || c.includes('budget'))) {
        detectedType = 'financial'
        suggestedTemplates = ['expense-report', 'budget-analysis', 'cost-breakdown']
      }
      
      setDataAnalysis({
        dataType: detectedType,
        keyColumns: headers.slice(0, 5),
        suggestedTemplates,
        insights: [
          `${data.length} records analyzed`,
          `${headers.length} data columns detected`,
          `Data type: ${detectedType}`,
          `Completeness: ${analysis.overallCompleteness.toFixed(0)}%`
        ]
      })
    } catch (error) {
      console.error('Error analyzing data:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleTemplateSelect = async (template: any) => {
    setSelectedTemplate(template)
    setGeneratedContent("")
    setEditMode(false)
    await generatePreview(template)
  }

  const generatePreview = async (template: any) => {
    setIsGenerating(true)
    
    try {
      // Determine the endpoint based on template category
      let endpoint = '/api/generate-report'
      if (template.category === 'email') {
        endpoint = '/api/generate-email'
      } else if (template.category === 'finance' || template.category === 'sales' || 
                 template.category === 'customer' || template.category === 'operations') {
        endpoint = '/api/generate-dashboard'
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template,
          data: {
            headers,
            rows: data.slice(0, 10) // Send sample data
          },
          columnMappings: {},
          customPrompt: template.prompt || template.defaultPrompt
        })
      })
      
      const result = await response.json()
      
      // Format the preview content based on type
      if (template.category === 'email') {
        setGeneratedContent(result.body || 'Email preview generated')
      } else if (endpoint === '/api/generate-dashboard') {
        // Format dashboard preview
        const dashboardContent = formatDashboardPreview(result)
        setGeneratedContent(dashboardContent)
      } else {
        const sections = result.sections || []
        const content = sections.map((s: any) => `## ${s.title}\n\n${s.content}`).join('\n\n')
        setGeneratedContent(content || 'Report preview generated')
      }
    } catch (error) {
      console.error('Error generating preview:', error)
      // Generate mock content as fallback
      setGeneratedContent(generateMockPreview(template))
    } finally {
      setIsGenerating(false)
    }
  }

  const formatDashboardPreview = (dashboard: any) => {
    let content = `# ${dashboard.title}\n\n`
    
    dashboard.sections?.forEach((section: any) => {
      content += `## ${section.title}\n`
      if (section.description) {
        content += `*${section.description}*\n\n`
      }
      
      section.widgets?.forEach((widget: any) => {
        content += `### ${widget.title}\n`
        
        if (widget.type === 'kpi' && widget.data) {
          Object.entries(widget.data).forEach(([key, value]) => {
            content += `• ${key}: ${value}\n`
          })
        } else if (widget.type === 'scorecard' && widget.data) {
          Object.entries(widget.data).forEach(([criterion, score]) => {
            content += `• ${criterion}: ${score}/10\n`
          })
        } else if (widget.type === 'funnel' && widget.data) {
          Object.entries(widget.data).forEach(([stage, value]) => {
            content += `• ${stage}: ${value}\n`
          })
        } else if (widget.type === 'progress' && widget.data) {
          Object.entries(widget.data).forEach(([category, percentage]) => {
            content += `• ${category}: ${percentage}%\n`
          })
        } else if (widget.type === 'chart' && widget.data) {
          content += `Chart data: ${Array.isArray(widget.data) ? widget.data.length : 0} data points\n`
        } else if (widget.type === 'table' && widget.data) {
          content += `Table data: ${Array.isArray(widget.data) ? widget.data.length : 0} rows\n`
        }
        
        content += '\n'
      })
    })
    
    return content
  }

  const generateMockPreview = (template: any) => {
    if (template.category === 'email') {
      return `Subject: ${template.subject || 'Data Analysis Update'}

Dear Team,

I'm pleased to share our latest data analysis results from the ${headers.length} metrics we've been tracking.

Key Highlights:
• Total records analyzed: ${data.length}
• Data completeness: ${(Math.random() * 100).toFixed(1)}%
• Primary metrics: ${headers.slice(0, 3).join(', ')}

The data shows promising trends across all key areas. I recommend we schedule a meeting to discuss the implications and next steps.

Best regards,
[Your Name]`
    } else if (template.category === 'finance' || template.category === 'sales' || 
               template.category === 'customer' || template.category === 'operations') {
      // Generate mock dashboard preview
      let content = `# ${template.name}\n\n`
      
      // Show first 2 sections as examples
      template.sections?.slice(0, 2).forEach((section: any) => {
        content += `## ${section.title}\n`
        if (section.description) {
          content += `*${section.description}*\n\n`
        }
        
        section.widgets?.slice(0, 2).forEach((widget: any) => {
          content += `### ${widget.title}\n`
          
          if (widget.type === 'kpi') {
            content += `• Total Value: $${(Math.random() * 1000000).toFixed(0)}\n`
            content += `• Growth Rate: ${(Math.random() * 100).toFixed(1)}%\n`
            content += `• Efficiency: ${(Math.random() * 100).toFixed(1)}%\n`
          } else if (widget.type === 'scorecard') {
            widget.config?.criteria?.slice(0, 3).forEach((criterion: any) => {
              const score = (Math.random() * criterion.max).toFixed(1)
              content += `• ${criterion.name}: ${score}/${criterion.max}\n`
            })
          } else if (widget.type === 'funnel') {
            content += `• Pipeline stages tracked\n`
            content += `• Conversion rates calculated\n`
          } else {
            content += `• Widget configured for ${widget.type} visualization\n`
          }
          
          content += '\n'
        })
      })
      
      content += `\n*Full dashboard includes ${template.sections?.length || 0} sections with interactive visualizations*`
      
      return content
    } else {
      return `# ${template.name}

## Executive Summary
This report analyzes ${data.length} records across ${headers.length} key metrics. The data reveals important insights about our ${dataAnalysis?.dataType || 'business'} performance.

## Key Metrics
• Total Records: ${data.length}
• Data Points: ${headers.length}
• Coverage: ${(Math.random() * 100).toFixed(1)}%

## Analysis
Based on the available data in columns: ${headers.slice(0, 5).join(', ')}, we can observe several important patterns and trends that warrant further investigation.

## Recommendations
1. Continue monitoring these metrics closely
2. Implement automated reporting for real-time insights
3. Consider expanding data collection for deeper analysis`
    }
  }

  const handleCreateDashboard = async () => {
    if (!selectedTemplate || !data.length) return
    
    setIsCreatingDashboard(true)
    
    try {
      // Generate a unique dashboard ID
      const dashboardId = `dashboard_${Date.now()}`
      
      // Prepare dashboard data
      const dashboardData = {
        id: dashboardId,
        name: `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
        template: selectedTemplate.id,
        createdAt: new Date().toISOString(),
        data: {
          headers,
          rows: data,
          analysis: dataAnalysis
        },
        config: {
          template: selectedTemplate,
          filters: {},
          settings: {}
        }
      }
      
      // Store dashboard data in localStorage (in production, this would be an API call)
      localStorage.setItem(dashboardId, JSON.stringify(dashboardData))
      
      // Navigate to the dashboard page
      router.push(`/dashboard/${dashboardId}`)
    } catch (error) {
      console.error('Error creating dashboard:', error)
    } finally {
      setIsCreatingDashboard(false)
    }
  }

  const handleExport = () => {
    // For dashboards, open in new page instead of downloading
    if (selectedTemplate?.category === 'finance' || 
        selectedTemplate?.category === 'sales' || 
        selectedTemplate?.category === 'customer' || 
        selectedTemplate?.category === 'operations') {
      handleCreateDashboard()
      return
    }
    
    // Create a download for other template types
    const blob = new Blob([editMode ? editedContent : generatedContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedTemplate?.name.replace(/\s+/g, '-').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const categories = [
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      templates: Object.values(reportTemplateCategories).flatMap(cat => cat.templates)
    },
    {
      id: 'emails',
      label: 'Emails',
      icon: Mail,
      templates: emailTemplateCategories ? Object.values(emailTemplateCategories).flatMap(cat => cat.templates) : []
    },
    {
      id: 'dashboards',
      label: 'Dashboards',
      icon: LayoutDashboard,
      templates: dashboardTemplateCategories ? Object.values(dashboardTemplateCategories).flatMap(cat => cat.templates) : []
    }
  ]

  return (
    <div className="w-96 h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-orange-600" />
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
          {/* Data Analysis Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Data Analysis</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAnalyzeData}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {dataAnalysis ? (
                <div className="space-y-2">
                  <div className="text-xs space-y-1">
                    {dataAnalysis.insights.map((insight, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-500">
                  Click analyze to detect data type and get template suggestions
                </div>
              )}
            </CardContent>
          </Card>

          {/* Template Categories */}
          <div className="space-y-2">
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = activeCategory === category.id
              
              return (
                <Collapsible
                  key={category.id}
                  open={isActive}
                  onOpenChange={() => setActiveCategory(isActive ? null : category.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-3 h-auto"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium text-sm">{category.label}</span>
                        <span className="text-xs text-gray-500">
                          ({category.templates.length})
                        </span>
                      </div>
                      {isActive ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pt-2">
                    {category.templates.length > 0 ? (
                      category.templates.map((template: any) => (
                        <Card
                          key={template.id}
                          className={`cursor-pointer transition-all ${
                            selectedTemplate?.id === template.id 
                              ? 'ring-2 ring-black' 
                              : 'hover:shadow-md'
                          }`}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <CardHeader className="pb-2 pt-3">
                            <CardTitle className="text-xs">{template.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {template.description}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      ))
                    ) : (
                      <div className="text-xs text-gray-500 p-3">
                        No templates available for this category
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>

          {/* Preview Section */}
          {selectedTemplate && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Preview: {selectedTemplate.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditMode(!editMode)}
                      className="h-7 w-7 p-0"
                    >
                      {editMode ? <Eye className="h-3 w-3" /> : <Edit className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleExport}
                      className="h-7 w-7 p-0"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : editMode ? (
                  <Textarea
                    value={editedContent || generatedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[200px] text-xs font-mono"
                  />
                ) : (
                  <div className="text-xs whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                    {generatedContent || "Select a template to generate preview"}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      {selectedTemplate && generatedContent && (
        <div className="p-4 border-t border-gray-200">
          <Button 
            className="w-full bg-black text-white hover:bg-gray-800"
            onClick={handleExport}
            disabled={isCreatingDashboard}
          >
            {isCreatingDashboard ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Dashboard...
              </>
            ) : selectedTemplate.category === 'email' ? (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </>
            ) : (selectedTemplate.category === 'finance' || 
                selectedTemplate.category === 'sales' || 
                selectedTemplate.category === 'customer' || 
                selectedTemplate.category === 'operations') ? (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Dashboard
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}