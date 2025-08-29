"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Sparkles, LayoutDashboard, TrendingUp, Users, DollarSign, Settings2, Loader2, MessageSquare, Grid, Eye, Code } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { dashboardTemplates } from "@/lib/dashboard-templates"
import { DashboardPromptBuilder } from "@/components/dashboard-prompt-builder"

const templateIcons = {
  vc_investment: DollarSign,
  sales_performance: TrendingUp,
  customer_analytics: Users,
  financial_overview: DollarSign,
  operations_efficiency: Settings2
}

export default function CreateDashboardPage() {
  const router = useRouter()
  const [selectedData, setSelectedData] = useState<{ headers: string[]; rows: string[][] } | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("vc_investment")
  const [dashboardName, setDashboardName] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDashboard, setGeneratedDashboard] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("prompt")

  useEffect(() => {
    // Load selected data from session storage
    const storedData = sessionStorage.getItem('dashboardData')
    if (storedData) {
      setSelectedData(JSON.parse(storedData))
    } else {
      // If no data, redirect back to main page
      router.push('/')
    }
  }, [router])

  useEffect(() => {
    // Set default dashboard name based on template
    if (selectedTemplate && dashboardTemplates[selectedTemplate]) {
      setDashboardName(dashboardTemplates[selectedTemplate].name)
      setCustomPrompt(dashboardTemplates[selectedTemplate].defaultPrompt || "")
    }
  }, [selectedTemplate])

  const handleCreateDashboard = async (template?: string, prompt?: string) => {
    if (!selectedData) return

    setIsGenerating(true)
    try {
      // Call API to generate dashboard
      const response = await fetch('/api/generate-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: template ? dashboardTemplates[template] : null,
          naturalLanguagePrompt: prompt,
          data: selectedData,
          customPrompt: customPrompt || prompt
        })
      })

      const dashboard = await response.json()
      setGeneratedDashboard(dashboard)
      
      // Generate a unique dashboard ID
      const dashboardId = `dashboard_${Date.now()}`
      
      // Store dashboard data
      const dashboardData = {
        id: dashboardId,
        name: dashboardName || dashboard.title || 'Custom Dashboard',
        template: template || 'custom',
        data: selectedData,
        dashboard: dashboard,
        prompt: prompt || customPrompt,
        createdAt: new Date().toISOString()
      }
      
      // Store in localStorage for now
      localStorage.setItem(dashboardId, JSON.stringify(dashboardData))
      
      // Navigate to dashboard view
      setTimeout(() => {
        router.push(`/dashboard/${dashboardId}`)
      }, 1500)
    } catch (error) {
      console.error('Error creating dashboard:', error)
      setIsGenerating(false)
    }
  }

  const handlePromptGenerate = async (prompt: string) => {
    await handleCreateDashboard(undefined, prompt)
  }

  const handleTemplateGenerate = async () => {
    await handleCreateDashboard(selectedTemplate, customPrompt)
  }

  if (!selectedData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No data selected</h2>
          <p className="text-gray-600 mb-4">Please select data from the spreadsheet first</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Spreadsheet
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-xl font-semibold">AI Dashboard Builder</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Split View Layout */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Side - Input */}
            <div className="space-y-6">
              {/* Dashboard Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Dashboard Name (Optional)</label>
                <Input
                  value={dashboardName}
                  onChange={(e) => setDashboardName(e.target.value)}
                  placeholder="My Custom Dashboard"
                  className="w-full"
                />
              </div>

              {/* Tabs for Prompt vs Template */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="prompt" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Natural Language
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="flex items-center gap-2">
                    <Grid className="h-4 w-4" />
                    Templates
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="prompt" className="mt-6">
                  <DashboardPromptBuilder
                    data={selectedData!}
                    onGenerate={handlePromptGenerate}
                    isGenerating={isGenerating}
                  />
                </TabsContent>

                <TabsContent value="templates" className="mt-6 space-y-6">
                  {/* Template Selection */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Choose a Template</h3>
                    <div className="grid gap-3">
                      {Object.entries(dashboardTemplates).map(([key, template]) => {
                        const Icon = templateIcons[key as keyof typeof templateIcons] || LayoutDashboard
                        return (
                          <Card
                            key={key}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedTemplate === key 
                                ? 'ring-2 ring-purple-500 bg-purple-50' 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedTemplate(key)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                  <Icon className="h-5 w-5 text-gray-700" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                                  <p className="text-xs text-gray-600 line-clamp-2">{template.description}</p>
                                  <div className="mt-2 text-xs text-gray-500">
                                    {template.sections.length} sections • {
                                      template.sections.reduce((acc, section) => acc + section.widgets.length, 0)
                                    } widgets
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>

                  {/* Generate Button for Templates */}
                  <Button
                    onClick={handleTemplateGenerate}
                    disabled={isGenerating || !selectedTemplate}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Creating Dashboard...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Generate from Template
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Side - Preview */}
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Live Preview Card */}
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Live Preview
                    </CardTitle>
                    {generatedDashboard && (
                      <Button variant="outline" size="sm">
                        <Code className="h-4 w-4 mr-2" />
                        View JSON
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                      <p className="text-sm text-gray-600">Claude is creating your dashboard...</p>
                    </div>
                  ) : generatedDashboard ? (
                    <div className="space-y-4">
                      <h3 className="font-semibold">{generatedDashboard.title}</h3>
                      {generatedDashboard.sections?.slice(0, 2).map((section: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <h4 className="font-medium text-sm mb-2">{section.title}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {section.widgets?.slice(0, 4).map((widget: any, widgetIdx: number) => (
                              <div key={widgetIdx} className="bg-gray-50 p-2 rounded text-xs">
                                {widget.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <p className="text-xs text-gray-500">Full dashboard will be displayed after generation</p>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <LayoutDashboard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">Dashboard preview will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Data Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Your Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-2">
                      {selectedData.rows.length} rows × {selectedData.headers.length} columns
                    </div>
                    <ScrollArea className="h-32">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            {selectedData.headers.slice(0, 5).map((header, idx) => (
                              <th key={idx} className="text-left p-1 font-medium">
                                {header}
                              </th>
                            ))}
                            {selectedData.headers.length > 5 && (
                              <th className="text-left p-1 text-gray-400">...</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedData.rows.slice(0, 5).map((row, rowIdx) => (
                            <tr key={rowIdx} className="border-b">
                              {row.slice(0, 5).map((cell, cellIdx) => (
                                <td key={cellIdx} className="p-1 text-gray-700">
                                  {cell || '-'}
                                </td>
                              ))}
                              {row.length > 5 && (
                                <td className="p-1 text-gray-400">...</td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}