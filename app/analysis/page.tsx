"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { 
  TrendingUp, 
  Calculator, 
  Tag, 
  Lightbulb,
  ArrowLeft,
  FileSpreadsheet
} from "lucide-react"
import Link from "next/link"

export default function AnalysisPage() {
  const router = useRouter()
  const { hasData, data, headers } = useSpreadsheetStore()

  // Redirect to home if no data
  if (!hasData) {
    router.push("/")
    return null
  }

  const analysisOptions = [
    {
      id: "score",
      icon: TrendingUp,
      title: "Score & Rank",
      description: "Find the best opportunities in your data",
      examples: ["Lead scoring", "Customer value", "Risk assessment"],
      route: "/analysis/score",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: "calculate",
      icon: Calculator,
      title: "Calculate Metrics",
      description: "Create business metrics and KPIs",
      examples: ["ROI calculation", "Efficiency scores", "Growth rates"],
      route: "/analysis/calculate",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      id: "categorize",
      icon: Tag,
      title: "Categorize & Segment",
      description: "Group your data into meaningful segments",
      examples: ["Customer segments", "Size categories", "Priority levels"],
      route: "/analysis/categorize",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      id: "insights",
      icon: Lightbulb,
      title: "Generate Insights",
      description: "Create summaries and recommendations",
      examples: ["Executive summary", "Action items", "Key findings"],
      route: "/analysis/insights",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Spreadsheet
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">
                  {data.length} rows × {headers.length} columns loaded
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              What do you want to find out?
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose how you'd like to analyze your data. We'll guide you through the process.
            </p>
          </div>

          {/* Analysis Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysisOptions.map((option) => {
              const Icon = option.icon
              return (
                <Card 
                  key={option.id}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-gray-300"
                  onClick={() => router.push(option.route)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className={`${option.bgColor} p-3 rounded-lg`}>
                        <Icon className={`h-6 w-6 ${option.color}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{option.title}</CardTitle>
                        <CardDescription className="text-base">
                          {option.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Popular templates:</p>
                      <div className="flex flex-wrap gap-2">
                        {option.examples.map((example) => (
                          <span 
                            key={example}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md"
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Help Section */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Not sure which to choose?
            </p>
            <Button variant="outline" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Help me decide
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}