"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sparkles, Wand2, Database, ArrowRight, Lightbulb, 
  BarChart3, LineChart, PieChart, TrendingUp, Layout,
  Loader2, Check, Upload, FileSpreadsheet
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DesignFirstInterfaceProps {
  onGenerateVisualization: (prompt: string, template?: string) => void
  onSwitchToDataMode: () => void
  isGenerating?: boolean
  generatedSchema?: {
    headers: string[]
    sampleData: any[]
    description: string
  }
}

export function DesignFirstInterface({ 
  onGenerateVisualization, 
  onSwitchToDataMode,
  isGenerating = false,
  generatedSchema
}: DesignFirstInterfaceProps) {
  const [prompt, setPrompt] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const templates = [
    {
      id: 'sales-dashboard',
      name: 'Sales Dashboard',
      icon: TrendingUp,
      description: 'Track revenue, deals, and performance',
      example: 'Monthly revenue trends, top performers, pipeline analysis'
    },
    {
      id: 'customer-analytics',
      name: 'Customer Analytics',
      icon: BarChart3,
      description: 'Understand customer behavior and segments',
      example: 'Churn analysis, lifetime value, acquisition channels'
    },
    {
      id: 'marketing-metrics',
      name: 'Marketing Metrics',
      icon: LineChart,
      description: 'Campaign performance and ROI',
      example: 'Campaign effectiveness, conversion funnels, channel attribution'
    },
    {
      id: 'product-usage',
      name: 'Product Usage',
      icon: PieChart,
      description: 'Feature adoption and user engagement',
      example: 'Feature usage, user activity patterns, retention metrics'
    },
    {
      id: 'custom',
      name: 'Custom Visualization',
      icon: Layout,
      description: 'Describe your own visualization',
      example: 'Any dashboard or chart you can imagine'
    }
  ]

  const examplePrompts = [
    "Create a customer churn dashboard with monthly trends, risk segments, and predictive indicators",
    "Show me sales performance by region with year-over-year comparisons and forecasts",
    "Design a social media analytics dashboard tracking engagement, reach, and sentiment",
    "Build an inventory management dashboard with stock levels, turnover rates, and alerts",
    "Visualize employee satisfaction survey results with department breakdowns and trends"
  ]

  const handleGenerate = () => {
    if (prompt.trim() || selectedTemplate) {
      const finalPrompt = selectedTemplate && selectedTemplate !== 'custom' 
        ? `${templates.find(t => t.id === selectedTemplate)?.example}: ${prompt}`
        : prompt
      onGenerateVisualization(finalPrompt, selectedTemplate || undefined)
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Design-First Mode</h2>
              <p className="text-sm text-gray-600">Describe your visualization idea</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onSwitchToDataMode}
            className="text-sm"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Switch to Data Mode
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose a Template (Optional)</CardTitle>
              <CardDescription>
                Start with a template or describe your own visualization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {templates.map((template) => {
                  const Icon = template.icon
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={cn(
                        "p-4 rounded-lg border-2 text-left transition-all hover:shadow-md",
                        selectedTemplate === template.id 
                          ? "border-purple-500 bg-purple-50" 
                          : "border-gray-200 bg-white hover:border-gray-300"
                      )}
                    >
                      <Icon className={cn(
                        "h-5 w-5 mb-2",
                        selectedTemplate === template.id ? "text-purple-600" : "text-gray-600"
                      )} />
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Prompt Input */}
          <Card>
            <CardHeader>
              <CardTitle>Describe Your Visualization</CardTitle>
              <CardDescription>
                Tell us what you want to see and we'll create it for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="E.g., 'I want a dashboard showing customer acquisition costs by channel with monthly trends and ROI calculations'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-medium">Example prompts:</p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.slice(0, 3).map((example, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => setPrompt(example)}
                      className="text-xs h-auto py-2 px-3 text-left justify-start whitespace-normal"
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={(!prompt.trim() && !selectedTemplate) || isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Visualization...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Visualization
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Schema Preview */}
          {generatedSchema && (
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-purple-600" />
                    Generated Data Schema
                  </CardTitle>
                  <Badge className="bg-green-100 text-green-700">Ready</Badge>
                </div>
                <CardDescription>{generatedSchema.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="schema" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="schema">Schema</TabsTrigger>
                    <TabsTrigger value="sample">Sample Data</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="schema" className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-2">Required Columns:</h4>
                      <div className="flex flex-wrap gap-2">
                        {generatedSchema.headers.map((header, idx) => (
                          <Badge key={idx} variant="outline">
                            {header}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sample">
                    <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                      <table className="text-sm w-full">
                        <thead>
                          <tr className="border-b">
                            {generatedSchema.headers.map((header, idx) => (
                              <th key={idx} className="text-left p-2 font-medium">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {generatedSchema.sampleData.slice(0, 3).map((row, rowIdx) => (
                            <tr key={rowIdx} className="border-b">
                              {generatedSchema.headers.map((header, colIdx) => (
                                <td key={colIdx} className="p-2">
                                  {row[header] || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-3 mt-4">
                  <Button className="flex-1" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Matching Data
                  </Button>
                  <Button className="flex-1 bg-black text-white hover:bg-gray-800">
                    <Check className="h-4 w-4 mr-2" />
                    Use Sample Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}