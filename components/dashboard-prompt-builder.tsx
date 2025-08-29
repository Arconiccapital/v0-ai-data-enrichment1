"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart,
  PieChart,
  Activity,
  Target,
  Lightbulb,
  Wand2,
  RefreshCw
} from "lucide-react"

interface DashboardPromptBuilderProps {
  data: {
    headers: string[]
    rows: string[][]
  }
  onGenerate: (prompt: string) => void
  isGenerating?: boolean
  className?: string
}

interface PromptSuggestion {
  label: string
  prompt: string
  icon: React.ReactNode
  category: string
}

export function DashboardPromptBuilder({ 
  data, 
  onGenerate, 
  isGenerating = false,
  className 
}: DashboardPromptBuilderProps) {
  const [prompt, setPrompt] = useState("")
  const [suggestions, setSuggestions] = useState<PromptSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [dataInsights, setDataInsights] = useState<string[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Analyze data and generate suggestions on mount
  useEffect(() => {
    analyzeDataAndGenerateSuggestions()
  }, [data])

  const analyzeDataAndGenerateSuggestions = () => {
    const columnNames = data.headers.map(h => h.toLowerCase())
    const insights: string[] = []
    const newSuggestions: PromptSuggestion[] = []

    // Generate data insights
    insights.push(`${data.rows.length} rows of data`)
    insights.push(`${data.headers.length} columns available`)
    
    // Detect data patterns and suggest appropriate dashboards
    if (columnNames.some(c => c.includes('revenue') || c.includes('sales') || c.includes('deal'))) {
      insights.push("Sales/Revenue data detected")
      newSuggestions.push({
        label: "Sales Performance Dashboard",
        prompt: "Create a comprehensive sales performance dashboard with revenue trends, pipeline funnel, top performers leaderboard, and deal conversion metrics. Include month-over-month growth charts and forecast projections.",
        icon: <TrendingUp className="h-4 w-4 text-gray-600" />,
        category: "sales"
      })
    }

    if (columnNames.some(c => c.includes('customer') || c.includes('user') || c.includes('client'))) {
      insights.push("Customer data detected")
      newSuggestions.push({
        label: "Customer Analytics Dashboard",
        prompt: "Build a customer analytics dashboard showing customer segmentation, lifetime value analysis, churn predictions, satisfaction scores, and engagement metrics. Include retention cohort analysis and customer journey visualization.",
        icon: <Users className="h-4 w-4 text-gray-600" />,
        category: "customer"
      })
    }

    if (columnNames.some(c => c.includes('expense') || c.includes('cost') || c.includes('budget'))) {
      insights.push("Financial data detected")
      newSuggestions.push({
        label: "Financial Overview Dashboard",
        prompt: "Generate a financial dashboard with P&L summary, expense breakdown by category, budget vs actual comparisons, cash flow projections, and key financial ratios. Show trends and variance analysis.",
        icon: <DollarSign className="h-4 w-4 text-gray-600" />,
        category: "finance"
      })
    }

    if (columnNames.some(c => c.includes('product') || c.includes('inventory') || c.includes('sku'))) {
      insights.push("Product/Inventory data detected")
      newSuggestions.push({
        label: "Inventory Management Dashboard",
        prompt: "Create an inventory management dashboard with stock levels, turnover rates, product performance metrics, demand forecasting, and reorder alerts. Include ABC analysis and seasonal trends.",
        icon: <BarChart className="h-4 w-4 text-gray-600" />,
        category: "operations"
      })
    }

    // Add generic suggestions
    newSuggestions.push({
      label: "KPI Overview",
      prompt: `Create a KPI dashboard focusing on the most important metrics from these columns: ${data.headers.slice(0, 5).join(', ')}. Show current values, trends, and comparisons.`,
      icon: <Target className="h-4 w-4 text-gray-600" />,
      category: "general"
    })

    newSuggestions.push({
      label: "Data Analysis Dashboard",
      prompt: "Build a comprehensive data analysis dashboard with distribution charts, correlation matrices, outlier detection, and statistical summaries. Include filters and drill-down capabilities.",
      icon: <Activity className="h-4 w-4 text-gray-600" />,
      category: "analysis"
    })

    newSuggestions.push({
      label: "Executive Summary",
      prompt: "Create an executive-level dashboard with high-level KPIs, trend indicators, performance scorecards, and actionable insights. Focus on strategic metrics and business impact.",
      icon: <PieChart className="h-4 w-4 text-gray-600" />,
      category: "executive"
    })

    setDataInsights(insights)
    setSuggestions(newSuggestions)
  }

  const handleSuggestionClick = (suggestion: PromptSuggestion) => {
    setPrompt(suggestion.prompt)
    setShowSuggestions(false)
    textareaRef.current?.focus()
  }

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt.trim())
    }
  }

  const examplePrompts = [
    "Show me key performance metrics with trend analysis",
    "Create a dashboard to track customer acquisition and retention",
    "Build a financial overview with revenue, costs, and profitability",
    "Generate a sales pipeline dashboard with conversion rates",
    "Design an operations dashboard for efficiency tracking"
  ]

  return (
    <div className={className}>
      {/* Main Prompt Input Card */}
      <Card className="border border-gray-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-black">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Create Dashboard with Natural Language</CardTitle>
                <CardDescription>
                  Describe what you want to see and Claude will build it for you
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-1 border-gray-300">
              <Sparkles className="h-3 w-3" />
              Claude-Powered
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Data Insights */}
          {dataInsights.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dataInsights.map((insight, idx) => (
                <Badge key={idx} variant="outline" className="text-xs border-gray-300">
                  {insight}
                </Badge>
              ))}
            </div>
          )}

          {/* Prompt Textarea */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Create a sales dashboard with monthly revenue trends, top products, customer segments, and conversion funnel..."
              className="min-h-[120px] pr-12 text-base resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) {
                  handleGenerate()
                }
              }}
            />
            {prompt && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPrompt("")}
                className="absolute right-2 top-2"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Example Prompts */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.slice(0, 3).map((example, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(example)}
                  className="text-xs h-7 border-gray-300 hover:bg-gray-50"
                >
                  <Lightbulb className="h-3 w-3 mr-1" />
                  {example}
                </Button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-black hover:bg-gray-800 text-white"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Creating Dashboard...
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5 mr-2" />
                Generate Dashboard
                <kbd className="ml-2 px-2 py-0.5 text-xs bg-white/20 rounded">⌘↵</kbd>
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Suggested Dashboards */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Suggested Dashboards</CardTitle>
            <CardDescription>
              Based on your data, these dashboards might be useful
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {suggestions.map((suggestion, idx) => (
                <Card
                  key={idx}
                  className="cursor-pointer hover:border-gray-400 transition-all border border-gray-200"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-50 border border-gray-200">
                        {suggestion.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{suggestion.label}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {suggestion.prompt}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Card */}
      <Card className="mt-6 bg-gray-50 border-gray-300">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Pro Tips</h4>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Be specific about metrics and visualizations you want</li>
                <li>• Mention time periods for trend analysis (daily, monthly, yearly)</li>
                <li>• Request comparisons, benchmarks, or targets for context</li>
                <li>• Ask for filters or drill-down capabilities for interactivity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}