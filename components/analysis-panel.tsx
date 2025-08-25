"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { 
  X,
  Sparkles,
  TrendingUp,
  Play,
  Check
} from "lucide-react"

interface AnalysisPanelProps {
  onClose: () => void
}

const templateCategories = {
  sales: {
    name: "Sales",
    templates: [
      { id: "lead-score", name: "Lead Score", prompt: "Score leads from 1-10 based on company size, industry, and engagement level" },
      { id: "deal-size", name: "Deal Size Category", prompt: "Categorize as Small ($0-10k), Medium ($10k-100k), Large ($100k-1M), Enterprise ($1M+)" },
      { id: "sales-stage", name: "Sales Stage", prompt: "Classify as Prospect, Qualified, Proposal, Negotiation, or Closed based on current status" },
      { id: "win-probability", name: "Win Probability", prompt: "Calculate win probability percentage based on deal stage, competitor presence, and budget fit" },
      { id: "customer-priority", name: "Customer Priority", prompt: "Rank as Platinum, Gold, Silver, Bronze based on revenue potential and strategic value" },
      { id: "territory", name: "Territory Assignment", prompt: "Assign to sales territory based on geographic location and industry vertical" },
      { id: "commission", name: "Commission Calculation", prompt: "Calculate commission amount based on deal size and commission rate structure" },
      { id: "pipeline-value", name: "Pipeline Value", prompt: "Calculate weighted pipeline value using deal amount multiplied by stage probability" },
      { id: "follow-up", name: "Follow-up Priority", prompt: "Set follow-up priority as Urgent, High, Medium, Low based on last contact and deal stage" }
    ]
  },
  finance: {
    name: "Finance",
    templates: [
      { id: "revenue-recognition", name: "Revenue Recognition", prompt: "Determine revenue recognition timing as Immediate, Deferred, or Subscription based on contract terms" },
      { id: "cash-flow", name: "Cash Flow Status", prompt: "Classify cash flow as Positive, Neutral, or Negative based on payment terms and collection" },
      { id: "payment-terms", name: "Payment Terms", prompt: "Categorize payment terms as Net-30, Net-60, Net-90, or Immediate based on contract" },
      { id: "credit-risk", name: "Credit Risk Score", prompt: "Score credit risk from 1-10 based on payment history, company size, and industry" },
      { id: "profitability", name: "Profitability Tier", prompt: "Classify as High Margin (>30%), Medium (10-30%), Low (0-10%), or Loss based on profit margins" },
      { id: "budget-variance", name: "Budget Variance", prompt: "Calculate variance percentage between actual spend and budgeted amount" },
      { id: "roi-calc", name: "ROI Calculation", prompt: "Calculate return on investment percentage based on investment cost and returns" },
      { id: "expense-category", name: "Expense Category", prompt: "Categorize expenses as Operating, Capital, R&D, Marketing, or Administrative" },
      { id: "invoice-status", name: "Invoice Status", prompt: "Mark as Paid, Pending, Overdue, or Disputed based on payment date and terms" }
    ]
  },
  operations: {
    name: "Operations",
    templates: [
      { id: "efficiency-score", name: "Efficiency Score", prompt: "Calculate efficiency score from 0-100% based on output versus input metrics" },
      { id: "capacity-util", name: "Capacity Utilization", prompt: "Calculate capacity utilization percentage based on actual vs maximum capacity" },
      { id: "quality-rating", name: "Quality Rating", prompt: "Rate quality as Excellent, Good, Acceptable, or Poor based on defect rates and standards" },
      { id: "delivery-priority", name: "Delivery Priority", prompt: "Set priority as Rush, Standard, or Economy based on customer tier and urgency" },
      { id: "inventory-level", name: "Inventory Level", prompt: "Classify inventory as Overstocked, Optimal, Low, or Critical based on turnover rates" },
      { id: "resource-allocation", name: "Resource Allocation", prompt: "Allocate resources as High, Medium, or Low priority based on project importance" },
      { id: "bottleneck", name: "Process Bottleneck", prompt: "Identify if process step is a Bottleneck, Constraint, or Optimal based on throughput" },
      { id: "supplier-rating", name: "Supplier Rating", prompt: "Rate suppliers A, B, C, or D based on quality, delivery, and price performance" },
      { id: "maintenance", name: "Maintenance Priority", prompt: "Classify maintenance need as Critical, Preventive, or Routine based on equipment status" }
    ]
  },
  marketing: {
    name: "Marketing",
    templates: [
      { id: "campaign-perf", name: "Campaign Performance", prompt: "Rate campaign as High Performing, Average, or Underperforming based on KPIs" },
      { id: "customer-segment", name: "Customer Segment", prompt: "Segment customers as Enterprise, Mid-Market, SMB, or Consumer based on company size" },
      { id: "engagement-score", name: "Engagement Score", prompt: "Score engagement from 1-10 based on email opens, clicks, and website visits" },
      { id: "channel-attribution", name: "Channel Attribution", prompt: "Attribute to Organic, Paid, Social, Direct, or Referral based on traffic source" },
      { id: "content-perf", name: "Content Performance", prompt: "Rate content as Viral, High, Medium, or Low engagement based on shares and views" },
      { id: "market-potential", name: "Market Potential", prompt: "Assess market potential as High Growth, Stable, Declining based on market indicators" },
      { id: "brand-sentiment", name: "Brand Sentiment", prompt: "Classify sentiment as Positive, Neutral, or Negative based on mentions and reviews" },
      { id: "conversion-rate", name: "Conversion Rate", prompt: "Calculate conversion rate percentage from leads to customers" },
      { id: "lifetime-value", name: "Customer LTV", prompt: "Calculate customer lifetime value based on average purchase and retention rate" }
    ]
  },
  hr: {
    name: "HR/People",
    templates: [
      { id: "performance", name: "Performance Rating", prompt: "Rate performance as Exceeds, Meets, or Below expectations based on KPIs" },
      { id: "retention-risk", name: "Retention Risk", prompt: "Assess retention risk as High, Medium, or Low based on engagement and tenure" },
      { id: "comp-band", name: "Compensation Band", prompt: "Assign to compensation band 1-5 based on role level and experience" },
      { id: "skill-level", name: "Skill Level", prompt: "Rate skill level as Expert, Proficient, Intermediate, or Beginner" },
      { id: "team-size", name: "Team Size Category", prompt: "Categorize team as Large (>20), Medium (5-20), or Small (<5) based on headcount" },
      { id: "succession", name: "Succession Planning", prompt: "Mark as Ready Now, Ready in 1-2 Years, or Development Needed for succession" },
      { id: "training-priority", name: "Training Priority", prompt: "Set training priority as Critical, Important, or Optional based on skill gaps" },
      { id: "employee-type", name: "Employee Type", prompt: "Classify as Full-time, Part-time, Contractor, or Intern based on employment status" },
      { id: "tenure-category", name: "Tenure Category", prompt: "Categorize as New (<1yr), Experienced (1-5yr), or Veteran (>5yr) based on hire date" }
    ]
  },
  customer: {
    name: "Customer",
    templates: [
      { id: "satisfaction", name: "Satisfaction Score", prompt: "Score satisfaction from 1-10 based on survey responses and support tickets" },
      { id: "churn-risk", name: "Churn Risk", prompt: "Assess churn risk as High, Medium, or Low based on usage patterns and engagement" },
      { id: "support-tier", name: "Support Tier", prompt: "Assign to Premium, Standard, or Basic support based on contract level" },
      { id: "nps-category", name: "NPS Category", prompt: "Classify as Promoter (9-10), Passive (7-8), or Detractor (0-6) based on NPS score" },
      { id: "account-health", name: "Account Health", prompt: "Rate account health as Green, Yellow, or Red based on multiple indicators" },
      { id: "upsell-potential", name: "Upsell Potential", prompt: "Score upsell potential from 1-10 based on usage, needs, and budget" },
      { id: "customer-maturity", name: "Customer Maturity", prompt: "Classify maturity as Advanced, Intermediate, or Beginner based on product usage" },
      { id: "renewal-probability", name: "Renewal Probability", prompt: "Calculate renewal probability percentage based on satisfaction and engagement" }
    ]
  }
}

export function AnalysisPanel({ onClose }: AnalysisPanelProps) {
  const { data, headers, addColumn, updateCell, setColumnExplanations } = useSpreadsheetStore()
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof templateCategories>("sales")
  const [prompt, setPrompt] = useState("")
  const [columnName, setColumnName] = useState("Analysis_Result")
  const [previewResults, setPreviewResults] = useState<string[]>([])
  const [previewExplanations, setPreviewExplanations] = useState<string[]>([])
  const [allExplanations, setAllExplanations] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [selectedContextColumns, setSelectedContextColumns] = useState<string[]>([])

  const handleTemplateClick = (template: { name: string; prompt: string }) => {
    setPrompt(template.prompt)
    setColumnName(template.name.replace(/ /g, "_"))
  }

  const handlePreview = async () => {
    if (!prompt) return
    
    setIsProcessing(true)
    
    try {
      // Get first 5 rows for preview
      const previewData = data.slice(0, 5)
      
      // Call the analyze API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          rows: previewData,
          headers,
          contextColumns: selectedContextColumns.length > 0 ? selectedContextColumns : null
        }),
      })
      
      if (!response.ok) {
        throw new Error('Analysis failed')
      }
      
      const result = await response.json()
      
      console.log('Preview API Response:', result)
      
      if (result.mock) {
        console.log('Using mock data (no API key configured)')
      } else {
        console.log('Using real OpenAI results for preview')
      }
      
      // Ensure results are strings
      const stringResults = result.results.map((r: any) => String(r))
      setPreviewResults(stringResults)
      
      // Store explanations if available
      if (result.explanations && Array.isArray(result.explanations)) {
        setPreviewExplanations(result.explanations.map((e: any) => String(e)))
      }
    } catch (error) {
      console.error('Preview error:', error)
      // Fallback to mock data on error
      const mockResults = data.slice(0, 5).map((_, idx) => `Result ${idx + 1}`)
      setPreviewResults(mockResults)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApplyToAll = async () => {
    if (!prompt || previewResults.length === 0) return
    
    setIsProcessing(true)
    
    try {
      // Add new column and get its index
      const newColumnIndex = addColumn(columnName)
      console.log(`Created new column "${columnName}" at index ${newColumnIndex}`)
      
      // Call the analyze API with all data
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          rows: data,
          headers,
          contextColumns: selectedContextColumns.length > 0 ? selectedContextColumns : null
        }),
      })
      
      if (!response.ok) {
        throw new Error('Analysis failed')
      }
      
      const result = await response.json()
      
      console.log('API Response:', result)
      
      if (result.mock) {
        console.log('Using mock data (no API key configured)')
      } else {
        console.log('Using real OpenAI results')
      }
      
      // Apply results to cells
      if (result.results && Array.isArray(result.results)) {
        console.log(`Applying ${result.results.length} results to column ${newColumnIndex}`)
        console.log('Current data length:', data.length)
        console.log('Current headers:', headers)
        
        // Store explanations in the store for tooltips
        if (result.explanations && Array.isArray(result.explanations)) {
          setColumnExplanations(newColumnIndex, result.explanations.map((e: any) => String(e)))
        }
        
        result.results.forEach((value: any, rowIndex: number) => {
          if (rowIndex < data.length) {
            // Convert value to string if it's not already
            const stringValue = String(value)
            console.log(`Setting cell [${rowIndex}, ${newColumnIndex}] to: "${stringValue}"`)
            updateCell(rowIndex, newColumnIndex, stringValue)
          }
        })
        
        // Force a small delay to ensure state updates
        setTimeout(() => {
          console.log('Cell updates should be complete')
        }, 100)
      } else {
        console.error('No results array in response:', result)
      }
      
      setIsProcessing(false)
      setHasApplied(true)
      
      // Reset after success
      setTimeout(() => {
        setPrompt("")
        setPreviewResults([])
        setPreviewExplanations([])
        setAllExplanations([])
        setHasApplied(false)
        setColumnName("Analysis_Result")
      }, 2000)
    } catch (error) {
      console.error('Apply to all error:', error)
      setIsProcessing(false)
      alert('Failed to apply analysis. Please check your API key configuration.')
    }
  }

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold">Analysis</h2>
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

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {hasApplied ? (
          // Success state
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Applied Successfully!</h3>
            <p className="text-sm text-gray-600">
              Added "{columnName}" column with {data.length} results
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
            {/* Template Categories */}
            <div className="flex-shrink-0">
              <Label className="text-sm font-medium mb-2 block">Template Library</Label>
              <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as keyof typeof templateCategories)}>
                <TabsList className="grid grid-cols-3 w-full mb-3">
                  <TabsTrigger value="sales" className="text-xs">Sales</TabsTrigger>
                  <TabsTrigger value="finance" className="text-xs">Finance</TabsTrigger>
                  <TabsTrigger value="operations" className="text-xs">Ops</TabsTrigger>
                </TabsList>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="marketing" className="text-xs">Marketing</TabsTrigger>
                  <TabsTrigger value="hr" className="text-xs">HR</TabsTrigger>
                  <TabsTrigger value="customer" className="text-xs">Customer</TabsTrigger>
                </TabsList>
                
                <ScrollArea className="h-48 mt-3 border rounded-md p-2">
                  {Object.entries(templateCategories).map(([key, category]) => (
                    <TabsContent key={key} value={key} className="mt-0 space-y-1">
                      {category.templates.map(template => (
                        <Button
                          key={template.id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-auto py-1.5 px-2 text-xs hover:bg-gray-100"
                          onClick={() => handleTemplateClick(template)}
                        >
                          {template.name}
                        </Button>
                      ))}
                    </TabsContent>
                  ))}
                </ScrollArea>
              </Tabs>
            </div>

            {/* Natural Language Input */}
            <div className="flex-shrink-0">
              <Label className="text-sm font-medium">Custom Analysis</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to calculate or categorize..."
                className="mt-2 min-h-[60px] text-sm"
              />
            </div>

            {/* Column Name */}
            <div className="flex-shrink-0">
              <Label className="text-sm font-medium">Column name</Label>
              <Input
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                placeholder="Result column name"
                className="mt-2 text-sm"
              />
            </div>

            {/* Preview Button */}
            {!previewResults.length && (
              <Button
                onClick={handlePreview}
                disabled={!prompt || isProcessing}
                className="w-full flex-shrink-0"
                size="sm"
              >
                {isProcessing ? (
                  <>
                    <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-2" />
                    Preview Results
                  </>
                )}
              </Button>
            )}

            {/* Preview Results */}
            {previewResults.length > 0 && (
              <Card className="bg-gray-50 flex-shrink-0">
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Preview (first 5 rows)</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="space-y-1">
                    {previewResults.map((result, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-gray-600">Row {idx + 1}</span>
                        <span className="font-medium">{result}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Apply Button */}
            {previewResults.length > 0 && (
              <Button
                onClick={handleApplyToAll}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 flex-shrink-0"
                size="sm"
              >
                {isProcessing ? (
                  <>
                    <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Applying to {data.length} rows...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-2" />
                    Apply to All {data.length} Rows
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}