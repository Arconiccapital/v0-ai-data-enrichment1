"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { quickInsights, analysisTemplates, outputTemplates } from "@/lib/templates"
import { X, FileText, LayoutDashboard, Presentation, BarChart3, Zap, Play, Loader2, Wand2, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface GenerateSidebarProps {
  onClose: () => void
  onComplete?: () => void
}

export function GenerateSidebar({ onClose }: GenerateSidebarProps) {
  const { data, headers, addTab, setActiveTab } = useSpreadsheetStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingTemplate, setGeneratingTemplate] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<'quick' | 'analysis' | 'output'>('quick')

  const generateContent = async (name: string, prompt: string, contentType: string) => {
    setIsGenerating(true)
    setGeneratingTemplate(name)
    
    try {
      // Determine the API endpoint and payload based on content type
      const isAnalysis = contentType === 'analysis' || contentType === 'quick-insight'
      const endpoint = isAnalysis ? '/api/analyze' : '/api/generate-dashboard'
      
      const payload = isAnalysis 
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
        throw new Error(`Failed to generate ${name}. Server responded with: ${response.status}`)
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
      console.error('Generation error:', error)
      toast.error(`Failed to generate ${name}`, {
        description: error.message || 'Please try again with different data or template'
      })
    } finally {
      setIsGenerating(false)
      setGeneratingTemplate('')
    }
  }

  return (
    <div className="w-full sm:w-96 md:w-[450px] max-w-[450px] flex-shrink-0 h-full bg-white border-l border-gray-200 flex flex-col relative">
      {/* Loading Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Generating {generatingTemplate}</h3>
            <p className="text-sm text-gray-600">This may take a few moments...</p>
            <p className="text-xs text-gray-500 mt-4">Analyzing your data and creating insights</p>
          </div>
        </div>
      )}
      
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
          disabled={isGenerating}
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
                    className={`cursor-pointer transition-colors ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    onClick={() => !isGenerating && generateContent(insight.name, insight.prompt, 'quick-insight')}
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
                        className={`p-2 rounded cursor-pointer transition-colors ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                        onClick={() => !isGenerating && generateContent(template.name, template.prompt, 'analysis')}
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
                        className={`p-2 rounded cursor-pointer transition-colors ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                        onClick={() => !isGenerating && generateContent(template.name, template.prompt, category)}
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