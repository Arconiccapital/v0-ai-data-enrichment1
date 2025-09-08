"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { ColumnMapper } from "@/components/column-mapper"
import { VibeGenerator } from "@/components/vibe-generator"
import { flexibleTemplates } from "@/lib/flexible-templates"
import { 
  X, 
  Loader2, 
  Wand2, 
  Sparkles, 
  Layout,
  Database,
  BarChart3,
  Users,
  DollarSign,
  TrendingUp
} from "lucide-react"
import { toast } from "sonner"

interface GenerateSidebarProps {
  onClose: () => void
  onComplete?: () => void
}

export function GenerateSidebar({ onClose, onComplete }: GenerateSidebarProps) {
  const { data, headers, addTab, setActiveTab } = useSpreadsheetStore()
  const [activeMode, setActiveMode] = useState<'templates' | 'vibe'>('templates')
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [showMapper, setShowMapper] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template)
    setShowMapper(true)
  }
  
  const handleMappingComplete = async (mappings: Record<string, string>) => {
    setIsGenerating(true)
    
    try {
      // Generate dashboard with mapped columns
      const response = await fetch('/api/generate-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          data: { headers, rows: data },
          columnMappings: mappings
        })
      })
      
      if (!response.ok) throw new Error('Failed to generate dashboard')
      
      const result = await response.json()
      
      // Create new tab with dashboard
      const tabId = `dashboard-${Date.now()}`
      addTab({
        id: tabId,
        title: selectedTemplate.name,
        type: 'dashboard',
        data: result
      })
      setActiveTab(tabId)
      
      toast.success('Dashboard generated successfully')
      onClose()
      if (onComplete) onComplete()
    } catch (error) {
      console.error('Generation failed:', error)
      toast.error('Failed to generate dashboard')
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handleVibeGenerate = async (prompt: string) => {
    setIsGenerating(true)
    
    try {
      // Detect content type from prompt
      const contentType = prompt.toLowerCase().includes('dashboard') || 
                         prompt.toLowerCase().includes('visualize') || 
                         prompt.toLowerCase().includes('chart') ? 'dashboard' : 'analysis'
      
      const endpoint = contentType === 'analysis' ? '/api/analyze' : '/api/generate-dashboard'
      
      const payload = contentType === 'analysis' 
        ? { prompt, rows: data, headers }
        : { naturalLanguagePrompt: prompt, data: { headers, rows: data } }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) throw new Error('Failed to generate')
      
      const result = await response.json()
      
      // Create new tab
      const tabId = `${contentType}-${Date.now()}`
      addTab({
        id: tabId,
        title: contentType === 'dashboard' ? 'Custom Dashboard' : 'Analysis',
        type: contentType,
        data: result
      })
      setActiveTab(tabId)
      
      toast.success('Generated successfully!')
      onClose()
      if (onComplete) onComplete()
    } catch (error) {
      console.error('Generation failed:', error)
      toast.error('Failed to generate. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }
  
  return (
    <div className="w-96 h-full bg-background border-l flex flex-col shadow-xl relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Create from Data</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as any)} className="h-full flex flex-col">
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="vibe" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Describe It
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-auto">
            <TabsContent value="templates" className="h-full p-4 pt-2">
              {showMapper && selectedTemplate ? (
                <ColumnMapper
                  template={selectedTemplate}
                  onMappingComplete={handleMappingComplete}
                  onCancel={() => {
                    setShowMapper(false)
                    setSelectedTemplate(null)
                  }}
                />
              ) : (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Choose a Template</h3>
                    <p className="text-xs text-muted-foreground">
                      Select a template and we'll help you map your data
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {flexibleTemplates.map(template => (
                      <Card
                        key={template.id}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <CardHeader className="p-3">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{template.icon}</span>
                            <div className="flex-1">
                              <CardTitle className="text-sm">{template.name}</CardTitle>
                              <CardDescription className="text-xs mt-1">
                                {template.description}
                              </CardDescription>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {template.requiredFields.length} required fields
                                </Badge>
                                {template.optionalFields && template.optionalFields.length > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {template.optionalFields.length} optional
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                    
                    {/* Add more templates hint */}
                    <Card className="border-dashed">
                      <CardHeader className="p-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Database className="h-4 w-4" />
                          <p className="text-xs">More templates coming soon...</p>
                        </div>
                      </CardHeader>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="vibe" className="h-full p-4 pt-2">
              <VibeGenerator
                onGenerate={handleVibeGenerate}
                onCancel={onClose}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      {/* Loading Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Generating...</p>
            <p className="text-xs text-muted-foreground">This may take a moment</p>
          </div>
        </div>
      )}
    </div>
  )
}