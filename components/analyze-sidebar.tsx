"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { X, BarChart3, Play, TrendingUp, Users, DollarSign } from "lucide-react"

interface AnalyzeSidebarProps {
  onClose: () => void
}

const analysisTemplates = {
  sales: [
    { name: "Lead Scoring", prompt: "Score leads from 1-10 based on company size and engagement" },
    { name: "Deal Size Prediction", prompt: "Predict deal size based on company metrics" },
    { name: "Win Probability", prompt: "Calculate win probability for each opportunity" }
  ],
  customer: [
    { name: "Churn Risk", prompt: "Identify customers at risk of churning" },
    { name: "Segmentation", prompt: "Segment customers by value and behavior" },
    { name: "Lifetime Value", prompt: "Calculate customer lifetime value" }
  ],
  financial: [
    { name: "Revenue Forecast", prompt: "Forecast revenue based on historical data" },
    { name: "Risk Assessment", prompt: "Assess financial risk level" },
    { name: "Profitability Analysis", prompt: "Analyze profitability by segment" }
  ]
}

export function AnalyzeSidebar({ onClose }: AnalyzeSidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof analysisTemplates>("sales")
  const [customPrompt, setCustomPrompt] = useState("")

  const handleAnalyze = () => {
    // Trigger analysis dialog in the spreadsheet view
    const analyzeButton = document.querySelector('[data-analysis-trigger]') as HTMLButtonElement
    if (analyzeButton) {
      analyzeButton.click()
    }
    // Store the analysis prompt for the dialog to use if needed
    if (customPrompt) {
      sessionStorage.setItem('analysisPrompt', customPrompt)
    }
  }

  const categoryIcons = {
    sales: TrendingUp,
    customer: Users,
    financial: DollarSign
  }

  return (
    <div className="w-96 h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold">Analyze Data</h2>
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
          {/* Category Tabs */}
          <div className="flex gap-2">
            {Object.keys(analysisTemplates).map((category) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons]
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category as keyof typeof analysisTemplates)}
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
            {analysisTemplates[selectedCategory].map((template, idx) => (
              <Card 
                key={idx}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setCustomPrompt(template.prompt)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">
                    {template.prompt}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Custom Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Custom Analysis</CardTitle>
              <CardDescription className="text-xs">
                Write your own analysis prompt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe the analysis you want to perform..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button 
          className="w-full bg-blue-600 text-white hover:bg-blue-700"
          onClick={handleAnalyze}
          disabled={!customPrompt.trim()}
        >
          <Play className="h-4 w-4 mr-2" />
          Run Analysis
        </Button>
      </div>
    </div>
  )
}