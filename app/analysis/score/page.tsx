"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { 
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Check,
  ChevronRight
} from "lucide-react"
import Link from "next/link"

const scoringTemplates = [
  {
    id: "lead-scoring",
    name: "Lead Scoring",
    description: "Score prospects based on company size and engagement",
    prompt: "Score each company from 1-10 based on their potential as a customer. Higher revenue and more employees indicate better prospects.",
    icon: "🎯"
  },
  {
    id: "customer-value",
    name: "Customer Value",
    description: "Identify your most valuable customers",
    prompt: "Calculate a value score from 1-100 based on purchase history, frequency, and total spend. Higher scores mean more valuable customers.",
    icon: "💎"
  },
  {
    id: "risk-assessment",
    name: "Risk Assessment",
    description: "Evaluate risk levels for accounts or transactions",
    prompt: "Assess risk level as Low, Medium, or High based on payment history, account age, and transaction patterns.",
    icon: "⚠️"
  },
  {
    id: "priority-ranking",
    name: "Priority Ranking",
    description: "Rank items by importance or urgency",
    prompt: "Rank items from 1 (highest priority) to 10 (lowest priority) based on deadline, impact, and resource requirements.",
    icon: "📊"
  }
]

export default function ScoreAnalysisPage() {
  const router = useRouter()
  const { hasData, data, headers, addColumn, updateCell } = useSpreadsheetStore()
  const [step, setStep] = useState<'template' | 'customize' | 'preview' | 'apply'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [previewResults, setPreviewResults] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultColumnName, setResultColumnName] = useState("Score")

  // Redirect if no data
  if (!hasData) {
    router.push("/")
    return null
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = scoringTemplates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setCustomPrompt(template.prompt)
      setResultColumnName(template.name.replace(" ", "_"))
    }
  }

  const handleGeneratePreview = async () => {
    setIsProcessing(true)
    
    // Simulate AI processing - in real app, this would call your API
    setTimeout(() => {
      // Generate mock preview results for first 5 rows
      const mockResults = data.slice(0, 5).map((row, idx) => {
        // Simple mock scoring logic
        const scores = ["8", "6", "9", "7", "5"]
        const categories = ["High", "Medium", "High", "Medium", "Low"]
        
        if (selectedTemplate === "risk-assessment") {
          return categories[idx]
        } else if (selectedTemplate === "priority-ranking") {
          return `${idx + 1}`
        } else {
          return scores[idx]
        }
      })
      
      setPreviewResults(mockResults)
      setIsProcessing(false)
      setStep('preview')
    }, 1500)
  }

  const handleApplyToAll = async () => {
    setIsProcessing(true)
    
    // Add new column for results
    const newColumnIndex = addColumn(resultColumnName)
    
    // Simulate applying to all rows
    setTimeout(() => {
      // In real app, this would process all rows with the AI model
      data.forEach((row, rowIndex) => {
        // Mock scoring for demo
        const score = Math.floor(Math.random() * 10) + 1
        updateCell(rowIndex, newColumnIndex, score.toString())
      })
      
      setIsProcessing(false)
      setStep('apply')
      
      // Redirect back to spreadsheet after 2 seconds
      setTimeout(() => {
        router.push("/")
      }, 2000)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/analysis">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Analysis
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Score & Rank</span>
              </div>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 ${step === 'template' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === 'template' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="text-sm hidden sm:inline">Choose</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <div className={`flex items-center gap-1 ${step === 'customize' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === 'customize' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="text-sm hidden sm:inline">Customize</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <div className={`flex items-center gap-1 ${step === 'preview' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="text-sm hidden sm:inline">Preview</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <div className={`flex items-center gap-1 ${step === 'apply' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === 'apply' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  4
                </div>
                <span className="text-sm hidden sm:inline">Apply</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Template Selection */}
        {step === 'template' && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Choose a scoring template
              </h1>
              <p className="text-lg text-gray-600">
                Select a template to get started, or create your own custom scoring
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {scoringTemplates.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedTemplate === template.id ? 'border-blue-500 border-2' : 'border-gray-200'
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                      {selectedTemplate === template.id && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Custom Option */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md mb-8 ${
                selectedTemplate === 'custom' ? 'border-blue-500 border-2' : 'border-gray-200'
              }`}
              onClick={() => {
                setSelectedTemplate('custom')
                setCustomPrompt("")
                setResultColumnName("Custom_Score")
              }}
            >
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Create custom scoring</p>
                      <p className="text-sm text-gray-600">Write your own scoring logic in plain English</p>
                    </div>
                  </div>
                  {selectedTemplate === 'custom' && (
                    <Check className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                onClick={() => setStep('customize')}
                disabled={!selectedTemplate}
                className="gap-2"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Customize Step */}
        {step === 'customize' && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Customize your scoring
              </h1>
              <p className="text-lg text-gray-600">
                Describe how you want to score your data in plain English
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Scoring Instructions</CardTitle>
                <CardDescription>
                  Tell us what makes a high score vs a low score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Your scoring logic</Label>
                    <Textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Example: Score each company from 1-10. Companies with more than 100 employees get higher scores. Add extra points for companies in technology or healthcare sectors."
                      className="mt-2 min-h-[150px]"
                    />
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-900 font-medium mb-2">
                      💡 Tips for better results:
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Be specific about what makes something "good" or "bad"</li>
                      <li>• Mention which columns contain the relevant data</li>
                      <li>• Specify the scoring range (1-10, A-F, High/Medium/Low)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setStep('template')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={handleGeneratePreview}
                disabled={!customPrompt || isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Preview...
                  </>
                ) : (
                  <>
                    Preview Results
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Preview your results
              </h1>
              <p className="text-lg text-gray-600">
                Here's how the scoring looks for your first 5 rows
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Preview Results</CardTitle>
                <CardDescription>
                  Review these scores and adjust if needed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Row</th>
                        {headers.slice(0, 3).map((header, idx) => (
                          <th key={idx} className="text-left py-2 px-3 text-sm font-medium text-gray-700">
                            {header}
                          </th>
                        ))}
                        <th className="text-left py-2 px-3 text-sm font-medium text-blue-600">
                          {resultColumnName} (New)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-2 px-3 text-sm text-gray-600">{idx + 1}</td>
                          {row.slice(0, 3).map((cell, cellIdx) => (
                            <td key={cellIdx} className="py-2 px-3 text-sm">
                              {cell || "-"}
                            </td>
                          ))}
                          <td className="py-2 px-3 text-sm font-medium text-blue-600">
                            {previewResults[idx] || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Ready to apply?</strong> This will add a new column "{resultColumnName}" to your spreadsheet with scores for all {data.length} rows.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setStep('customize')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Adjust Scoring
              </Button>
              <Button 
                onClick={handleApplyToAll}
                disabled={isProcessing}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Applying to all rows...
                  </>
                ) : (
                  <>
                    Apply to All Rows
                    <Check className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'apply' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Successfully Applied!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Your scoring has been added to the spreadsheet
            </p>
            <p className="text-sm text-gray-500">
              Redirecting you back to the spreadsheet...
            </p>
          </div>
        )}
      </main>
    </div>
  )
}