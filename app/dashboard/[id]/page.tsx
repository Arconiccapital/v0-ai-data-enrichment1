"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Share2, Edit3, Download, RefreshCw, Sparkles, TrendingUp, TrendingDown, Loader2, Filter, X } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { dashboardTemplates } from "@/lib/dashboard-templates"
import { processDashboardData, type ProcessedDashboardData } from "@/lib/dashboard-data-processor"
import {
  MetricCard,
  InvestmentScoring,
  DealFlowFunnel,
  PortfolioDistribution,
  RiskMatrix,
  GrowthTrends,
  CompanyComparison,
  FinancialMetrics
} from "@/components/dashboard/vc-widgets"

// Widget Components
function KPIWidget({ widget, data }: any) {
  const metrics = widget.config?.metrics || []
  const widgetData = widget.data || {}
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric: any, idx: number) => {
            const value = widgetData[metric.key] || Math.floor(Math.random() * 10000)
            const trend = Math.random() > 0.5
            return (
              <div key={idx}>
                <div className="text-2xl font-bold">
                  {formatValue(value, metric.format)}
                </div>
                <div className="text-xs text-gray-600">{metric.label}</div>
                <div className="flex items-center gap-1 mt-1">
                  {trend ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className="text-xs text-gray-500">
                    {Math.floor(Math.random() * 30) + 1}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function ScoreCardWidget({ widget, data }: any) {
  const criteria = widget.config?.criteria || []
  const widgetData = widget.data || {}
  
  const totalScore = criteria.reduce((acc: number, criterion: any) => {
    const score = parseFloat(widgetData[criterion.name] || Math.floor(Math.random() * criterion.max))
    return acc + (score * criterion.weight)
  }, 0)
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
        <div className="text-2xl font-bold mt-2">{totalScore.toFixed(1)}/10</div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {criteria.map((criterion: any, idx: number) => {
            const score = parseFloat(widgetData[criterion.name] || Math.floor(Math.random() * criterion.max))
            return (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{criterion.name}</span>
                  <span className="font-medium">{score}/{criterion.max}</span>
                </div>
                <Progress value={(score / criterion.max) * 100} className="h-2" />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function FunnelWidget({ widget, data }: any) {
  const stages = widget.config?.stages || []
  let remaining = 100
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {stages.map((stage: string, idx: number) => {
            const width = remaining
            const conversion = 100 - (idx * 20) // Mock conversion rate
            remaining = remaining * 0.7 // Each stage loses 30%
            
            return (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{stage}</span>
                  <span className="font-medium">{Math.floor(remaining * 10)}</span>
                </div>
                <div className="h-8 bg-gray-100 rounded">
                  <div 
                    className="h-full bg-blue-500 rounded flex items-center justify-end pr-2"
                    style={{ width: `${width}%` }}
                  >
                    <span className="text-xs text-white">{conversion}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function ChartWidget({ widget, data }: any) {
  // Mock chart visualization
  const points = Array.from({ length: 12 }, () => Math.floor(Math.random() * 100))
  const max = Math.max(...points)
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 flex items-end gap-1">
          {points.map((point, idx) => (
            <div
              key={idx}
              className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
              style={{ height: `${(point / max) * 100}%` }}
              title={`${point}`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Jan</span>
          <span>Jun</span>
          <span>Dec</span>
        </div>
      </CardContent>
    </Card>
  )
}

function TableWidget({ widget, data }: any) {
  const columns = widget.config?.columns || []
  const rows = Array.from({ length: 5 }, (_, i) => 
    columns.map((col: string) => `${col} ${i + 1}`)
  )
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {columns.map((col: string, idx: number) => (
                  <th key={idx} className="text-left pb-2 pr-4 font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b last:border-0">
                  {row.map((cell: string | number | null, cellIdx: number) => (
                    <td key={cellIdx} className="py-2 pr-4">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function ProgressWidget({ widget, data }: any) {
  const categories = widget.config?.categories || []
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category: string, idx: number) => {
            const value = Math.floor(Math.random() * 100)
            return (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{category}</span>
                  <span className="font-medium">{value}%</span>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function formatValue(value: number, format?: string) {
  switch (format) {
    case 'currency':
      return `$${value.toLocaleString()}`
    case 'percentage':
      return `${value}%`
    case 'multiplier':
      return `${(value / 100).toFixed(2)}x`
    case 'months':
      return `${value} months`
    case 'days':
      return `${value} days`
    default:
      return value.toLocaleString()
  }
}

function renderWidget(widget: any, data: any) {
  switch (widget.type) {
    case 'kpi':
      return <KPIWidget widget={widget} data={data} />
    case 'scorecard':
      return <ScoreCardWidget widget={widget} data={data} />
    case 'funnel':
      return <FunnelWidget widget={widget} data={data} />
    case 'chart':
      return <ChartWidget widget={widget} data={data} />
    case 'table':
      return <TableWidget widget={widget} data={data} />
    case 'progress':
      return <ProgressWidget widget={widget} data={data} />
    default:
      return <Card className="h-full"><CardContent>Widget: {widget.type}</CardContent></Card>
  }
}

export default function DashboardViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [dashboard, setDashboard] = useState<any>(null)
  const [processedData, setProcessedData] = useState<ProcessedDashboardData | null>(null)
  const [promptValue, setPromptValue] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [filters, setFilters] = useState({
    stage: 'all',
    sector: 'all',
    risk: 'all'
  })

  useEffect(() => {
    // Load dashboard from localStorage (in production, this would be an API call)
    const dashboardData = localStorage.getItem(id)
    if (dashboardData) {
      const parsed = JSON.parse(dashboardData)
      setDashboard(parsed)
      
      // Process the data for visualization
      if (parsed.data?.headers && parsed.data?.rows) {
        const processed = processDashboardData(
          parsed.data.headers,
          parsed.data.rows,
          parsed.config?.template
        )
        setProcessedData(processed)
      }
    } else {
      router.push('/')
    }
  }, [id, router])

  const handleUpdateDashboard = async () => {
    if (!promptValue) return
    
    setIsUpdating(true)
    // Simulate AI update
    setTimeout(() => {
      setIsUpdating(false)
      setPromptValue("")
      // In production, this would update the dashboard based on the prompt
    }, 2000)
  }

  const handleShare = async () => {
    setIsSharing(true)
    const shareId = `share_${Date.now()}`
    
    // Store share data
    const shareData = {
      ...dashboard,
      shareId,
      isPublic: true,
      sharedAt: new Date().toISOString()
    }
    
    localStorage.setItem(shareId, JSON.stringify(shareData))
    
    // Copy link to clipboard
    const shareUrl = `${window.location.origin}/share/${shareId}`
    await navigator.clipboard.writeText(shareUrl)
    
    setTimeout(() => {
      setIsSharing(false)
      alert(`Share link copied to clipboard!\n${shareUrl}`)
    }, 1000)
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const template = dashboard?.config?.template || dashboardTemplates[dashboard?.template]
  if (!template) {
    return <div>Template not found</div>
  }

  // Apply filters to companies
  const filteredCompanies = processedData?.companies.filter(company => {
    if (filters.stage !== 'all' && company.stage !== filters.stage) return false
    if (filters.sector !== 'all' && company.sector !== filters.sector) return false
    if (filters.risk !== 'all' && company.risks?.overall !== filters.risk) return false
    return true
  }) || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Exit Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-200" />
              <h1 className="text-lg font-semibold">{dashboard.name}</h1>
              <Badge variant="secondary">{template.name}</Badge>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShare}
                disabled={isSharing}
              >
                {isSharing ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Share2 className="h-4 w-4 mr-1" />
                )}
                Share
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/dashboard/${id}/edit`)}
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Natural Language Update Bar */}
      <div className="bg-white border-b px-6 py-3">
        <div className="container mx-auto">
          <div className="flex gap-2">
            <Input
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              placeholder="Update dashboard with natural language... (e.g., 'Show only Series A companies' or 'Add revenue growth chart')"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateDashboard()
                }
              }}
            />
            <Button 
              onClick={handleUpdateDashboard}
              disabled={isUpdating || !promptValue}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Update
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      {processedData && (
        <div className="bg-white border-b px-6 py-3">
          <div className="container mx-auto">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-gray-500" />
              
              <Select value={filters.stage} onValueChange={(value) => setFilters({...filters, stage: value})}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {Object.keys(processedData.metrics.stages).map(stage => (
                    <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filters.sector} onValueChange={(value) => setFilters({...filters, sector: value})}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {Object.keys(processedData.metrics.sectors).map(sector => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filters.risk} onValueChange={(value) => setFilters({...filters, risk: value})}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="Low">Low Risk</SelectItem>
                  <SelectItem value="Medium">Medium Risk</SelectItem>
                  <SelectItem value="High">High Risk</SelectItem>
                </SelectContent>
              </Select>
              
              {(filters.stage !== 'all' || filters.sector !== 'all' || filters.risk !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({ stage: 'all', sector: 'all', risk: 'all' })}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="container mx-auto px-6 py-6">
        {processedData && template.id === 'vc_investment' ? (
          // VC Investment Dashboard Layout
          <div className="space-y-6">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Portfolio Value"
                value={processedData.metrics.totalValuation}
                format="currency"
                change={23}
                trend="up"
              />
              <MetricCard
                title="Active Investments"
                value={filteredCompanies.length}
                format="number"
                change={12}
                trend="up"
              />
              <MetricCard
                title="Average Growth Rate"
                value={processedData.metrics.averageGrowth}
                format="percentage"
                change={-5}
                trend="down"
              />
              <MetricCard
                title="Average Runway"
                value={`${processedData.metrics.averageRunway.toFixed(0)} months`}
                format="text"
              />
            </div>

            {/* Deal Flow and Portfolio Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DealFlowFunnel
                data={[
                  { stage: "Sourcing", value: 150, percentage: 100 },
                  { stage: "Screening", value: 75, percentage: 50 },
                  { stage: "Due Diligence", value: 30, percentage: 20 },
                  { stage: "Term Sheet", value: 10, percentage: 7 },
                  { stage: "Closed", value: filteredCompanies.length, percentage: 3 }
                ]}
                title="Deal Flow Pipeline"
                description="Conversion through investment stages"
              />
              <PortfolioDistribution
                data={processedData.distributions.bySector}
                title="Portfolio by Sector"
                description="Investment distribution across industries"
              />
            </div>

            {/* Investment Scoring */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <InvestmentScoring
                data={[
                  { criteria: "TAM", score: 8, fullMark: 10 },
                  { criteria: "SAM", score: 7, fullMark: 10 },
                  { criteria: "SOM", score: 6, fullMark: 10 },
                  { criteria: "Growth", score: 9, fullMark: 10 },
                  { criteria: "Timing", score: 7, fullMark: 10 }
                ]}
                title="Market Assessment"
                description="Market opportunity analysis"
              />
              <InvestmentScoring
                data={[
                  { criteria: "Experience", score: 8, fullMark: 10 },
                  { criteria: "Execution", score: 7, fullMark: 10 },
                  { criteria: "Domain", score: 9, fullMark: 10 },
                  { criteria: "Chemistry", score: 8, fullMark: 10 },
                  { criteria: "Coachability", score: 7, fullMark: 10 }
                ]}
                title="Team Assessment"
                description="Founder and team evaluation"
              />
              <InvestmentScoring
                data={[
                  { criteria: "Innovation", score: 9, fullMark: 10 },
                  { criteria: "Traction", score: 6, fullMark: 10 },
                  { criteria: "Moat", score: 7, fullMark: 10 },
                  { criteria: "Scalability", score: 8, fullMark: 10 },
                  { criteria: "IP", score: 7, fullMark: 10 }
                ]}
                title="Product/Technology"
                description="Product and technology evaluation"
              />
            </div>

            {/* Growth and Risk Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GrowthTrends
                data={processedData.trends.map(t => ({
                  month: t.date.slice(5),
                  revenue: t.revenue || 0,
                  growth: t.growth || 0,
                  deals: t.dealCount || 0
                }))}
                title="Portfolio Performance Trends"
                description="Revenue and growth over time"
              />
              <RiskMatrix
                data={filteredCompanies.map(c => ({
                  company: c.name,
                  executionRisk: c.risks?.execution || 5,
                  marketRisk: c.risks?.market || 5,
                  financialRisk: c.risks?.financial || 5,
                  overallRisk: c.risks?.overall || 'Medium'
                }))}
                title="Risk Assessment Matrix"
                description="Multi-dimensional risk analysis"
              />
            </div>

            {/* Company Comparison and Financial Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CompanyComparison
                data={filteredCompanies.slice(0, 10).map(c => ({
                  company: c.name,
                  revenue: (c.revenue || 0) / 1000000,
                  growth: c.growth || 0,
                  valuation: (c.valuation || 0) / 1000000,
                  score: c.scores?.overall || 0
                }))}
                title="Portfolio Company Analysis"
                description="Revenue vs Growth comparison"
              />
              <FinancialMetrics
                metrics={{
                  revenue: processedData.metrics.totalRevenue,
                  growth: processedData.metrics.averageGrowth,
                  burnRate: processedData.metrics.averageBurnRate,
                  runway: processedData.metrics.averageRunway,
                  valuation: processedData.metrics.averageValuation,
                  ltvcac: 3.2
                }}
                title="Portfolio Financial Summary"
                description="Aggregated financial metrics"
              />
            </div>
          </div>
        ) : dashboard?.dashboard ? (
          // Render Claude-generated dashboard
          <div className="space-y-8">
            {dashboard.dashboard.sections?.map((section: any, sectionIdx: number) => (
              <div key={sectionIdx}>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                  {section.description && (
                    <p className="text-sm text-gray-600">{section.description}</p>
                  )}
                </div>
                
                <div className={`grid gap-4 ${
                  section.widgets.length === 1 ? 'grid-cols-1' :
                  section.widgets.length === 2 ? 'grid-cols-1 lg:grid-cols-2' :
                  section.widgets.length === 3 ? 'grid-cols-1 lg:grid-cols-3' :
                  'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                }`}>
                  {section.widgets.map((widget: any, widgetIdx: number) => (
                    <div key={widgetIdx} className={
                      widget.type === 'table' || widget.type === 'chart' ? 'lg:col-span-2' : ''
                    }>
                      {renderWidget(widget, widget.data || dashboard.data)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : template ? (
          // Fallback to generic template layout
          <div className="space-y-8">
            {template.sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                  {section.description && (
                    <p className="text-sm text-gray-600">{section.description}</p>
                  )}
                </div>
                
                <div className={`grid gap-4 ${
                  section.widgets.length === 1 ? 'grid-cols-1' :
                  section.widgets.length === 2 ? 'grid-cols-1 lg:grid-cols-2' :
                  section.widgets.length === 3 ? 'grid-cols-1 lg:grid-cols-3' :
                  'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                }`}>
                  {section.widgets.map((widget, widgetIdx) => (
                    <div key={widgetIdx} className={
                      widget.type === 'table' || widget.type === 'chart' ? 'lg:col-span-2' : ''
                    }>
                      {renderWidget(widget, dashboard.data)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No dashboard data available</p>
          </div>
        )}
      </div>
    </div>
  )
}