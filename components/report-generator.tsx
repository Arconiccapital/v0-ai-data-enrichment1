"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { reportTemplateCategories, type ReportTemplate } from "@/lib/output-templates"
import { 
  FileText, 
  Download, 
  Eye, 
  Sparkles, 
  CheckCircle,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  BarChart3,
  Loader2
} from "lucide-react"

interface ReportGeneratorProps {
  selectedData: {
    headers: string[]
    rows: string[][]
  }
}

const categoryIcons = {
  sales: TrendingUp,
  finance: DollarSign,
  executive: BarChart3,
  operations: Package,
  customer: Users
}

export function ReportGenerator({ selectedData }: ReportGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReport, setGeneratedReport] = useState<any>(null)
  const [previewMode, setPreviewMode] = useState(false)

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template)
  }

  const handleGenerateReport = async () => {
    if (!selectedTemplate) return
    
    setIsGenerating(true)
    try {
      // Auto-map columns based on template variables
      const columnMappings: Record<string, string> = {}
      selectedTemplate.variables.forEach(variable => {
        const matchedColumn = selectedData.headers.find(header => 
          header.toLowerCase().includes(variable.toLowerCase()) ||
          variable.toLowerCase().includes(header.toLowerCase())
        )
        if (matchedColumn) {
          columnMappings[variable] = matchedColumn
        }
      })

      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          data: selectedData,
          columnMappings,
          customPrompt: selectedTemplate.prompt
        })
      })

      if (!response.ok) throw new Error('Failed to generate report')
      
      const report = await response.json()
      setGeneratedReport(report)
      setPreviewMode(true)
    } catch (error) {
      console.error('Error generating report:', error)
      // Create a mock report
      setGeneratedReport({
        title: selectedTemplate.name,
        sections: selectedTemplate.sections.map(section => ({
          ...section,
          content: `This is sample content for ${section.title}. The report would analyze your ${selectedData.rows.length} rows of data here.`
        }))
      })
      setPreviewMode(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportReport = (format: 'pdf' | 'word' | 'ppt') => {
    console.log(`Exporting report as ${format}`)
    alert(`Report would be exported as ${format.toUpperCase()}`)
  }

  // Preview Mode
  if (previewMode && generatedReport) {
    return (
      <div className="py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{generatedReport.title}</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setPreviewMode(false)}>
              Back
            </Button>
            <Button size="sm" onClick={() => handleExportReport('pdf')}>
              <Download className="h-4 w-4 mr-1" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 space-y-6">
          {generatedReport.sections.map((section: any, idx: number) => (
            <div key={idx}>
              <h4 className="font-semibold mb-2">{section.title}</h4>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Template Selection Mode
  return (
    <div className="py-4 space-y-4">
      <div>
        <h3 className="text-base font-semibold mb-1">Select a Report Template</h3>
        <p className="text-sm text-gray-600">Choose a template to generate your professional report</p>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-4">
          {Object.entries(reportTemplateCategories).map(([categoryKey, category]) => {
            const Icon = categoryIcons[categoryKey as keyof typeof categoryIcons]
            return (
              <div key={categoryKey}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-4 w-4 text-gray-600" />
                  <h4 className="text-sm font-medium text-gray-700">{category.name}</h4>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {category.templates.map((template) => (
                    <Card
                      key={template.id}
                      className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate?.id === template.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{template.name}</div>
                          <div className="text-xs text-gray-600 mt-1">{template.description}</div>
                          <div className="flex gap-1 mt-2">
                            {template.sections.slice(0, 3).map((section, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {section.title}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {selectedTemplate && (
        <div className="pt-4 border-t">
          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="w-full bg-black text-white hover:bg-gray-800"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate {selectedTemplate.name}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}