"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Sparkles, LayoutDashboard, TrendingUp, Users, DollarSign, Settings2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { dashboardTemplates } from "@/lib/dashboard-templates"

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

  const handleCreateDashboard = async () => {
    if (!selectedData || !selectedTemplate) return

    setIsGenerating(true)
    try {
      // Generate a unique dashboard ID
      const dashboardId = `dashboard_${Date.now()}`
      
      // Store dashboard data
      const dashboardData = {
        id: dashboardId,
        name: dashboardName,
        template: selectedTemplate,
        data: selectedData,
        prompt: customPrompt,
        createdAt: new Date().toISOString()
      }
      
      // Store in localStorage for now (in production, this would be an API call)
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
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
              <h1 className="text-xl font-semibold">Create Dashboard</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Dashboard Name */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-2">Dashboard Name</label>
            <Input
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              placeholder="Enter dashboard name..."
              className="max-w-md"
            />
          </div>

          {/* Template Selection */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Select Dashboard Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(dashboardTemplates).map(([key, template]) => {
                const Icon = templateIcons[key as keyof typeof templateIcons] || LayoutDashboard
                return (
                  <Card
                    key={key}
                    className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                      selectedTemplate === key 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTemplate(key)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <Icon className="h-6 w-6 text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        <div className="mt-3 text-xs text-gray-500">
                          {template.sections.length} sections • {
                            template.sections.reduce((acc, section) => acc + section.widgets.length, 0)
                          } widgets
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Template Preview */}
          {selectedTemplate && dashboardTemplates[selectedTemplate] && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Template Sections</h3>
              <div className="bg-white rounded-lg border p-6">
                <div className="space-y-4">
                  {dashboardTemplates[selectedTemplate].sections.map((section, idx) => (
                    <div key={idx} className="border-b last:border-0 pb-4 last:pb-0">
                      <h4 className="font-medium mb-2">{section.title}</h4>
                      {section.description && (
                        <p className="text-sm text-gray-600 mb-2">{section.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {section.widgets.map((widget) => (
                          <span
                            key={widget.id}
                            className="px-2 py-1 bg-gray-100 rounded text-xs"
                          >
                            {widget.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Custom Prompt */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Customize with Natural Language</h3>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe any specific requirements or customizations for your dashboard..."
              className="h-32"
            />
            <p className="text-sm text-gray-500 mt-2">
              Example: "Focus on deals in Series A stage, highlight companies with high growth rates, add comparison charts for portfolio companies"
            </p>
          </div>

          {/* Data Preview */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Selected Data Preview</h3>
            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b bg-gray-50">
                <span className="text-sm text-gray-600">
                  {selectedData.rows.length} rows × {selectedData.headers.length} columns
                </span>
              </div>
              <ScrollArea className="h-64">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 border-b">
                    <tr>
                      {selectedData.headers.map((header, idx) => (
                        <th key={idx} className="text-left px-4 py-2 font-medium text-gray-700">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedData.rows.slice(0, 10).map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-b hover:bg-gray-50">
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="px-4 py-2 text-gray-900">
                            {cell || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.push('/')}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateDashboard}
              disabled={isGenerating || !dashboardName}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Dashboard...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Dashboard
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}