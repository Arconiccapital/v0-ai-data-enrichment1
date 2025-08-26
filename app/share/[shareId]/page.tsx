"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Loader2, ExternalLink } from "lucide-react"
import { dashboardTemplates } from "@/lib/dashboard-templates"
import Link from "next/link"

// Reuse widget components from dashboard viewer
function KPIWidget({ widget, data }: any) {
  const metrics = widget.config?.metrics || []
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric: any, idx: number) => (
            <div key={idx}>
              <div className="text-2xl font-bold">
                {formatValue(Math.floor(Math.random() * 10000), metric.format)}
              </div>
              <div className="text-xs text-gray-600">{metric.label}</div>
              <div className="flex items-center gap-1 mt-1">
                {Math.random() > 0.5 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className="text-xs text-gray-500">
                  {Math.floor(Math.random() * 30) + 1}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ScoreCardWidget({ widget, data }: any) {
  const criteria = widget.config?.criteria || []
  const totalScore = criteria.reduce((acc: number, criterion: any) => {
    const score = Math.floor(Math.random() * criterion.max)
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
            const score = Math.floor(Math.random() * criterion.max)
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
            const conversion = 100 - (idx * 20)
            remaining = remaining * 0.7
            
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
              className="flex-1 bg-blue-500 rounded-t"
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
                  {row.map((cell, cellIdx) => (
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

export default function SharedDashboardPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = use(params)
  const [dashboard, setDashboard] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load shared dashboard from localStorage (in production, this would be an API call)
    const sharedData = localStorage.getItem(shareId)
    if (sharedData) {
      setDashboard(JSON.parse(sharedData))
    }
    setIsLoading(false)
  }, [shareId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-semibold mb-2">Dashboard Not Found</h1>
        <p className="text-gray-600 mb-4">This dashboard may have been removed or the link is invalid.</p>
        <Link href="/" className="text-blue-600 hover:underline flex items-center gap-1">
          <ExternalLink className="h-4 w-4" />
          Go to main app
        </Link>
      </div>
    )
  }

  const template = dashboardTemplates[dashboard.template]
  if (!template) {
    return <div>Template not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">{dashboard.name}</h1>
              <Badge variant="secondary">{template.name}</Badge>
              <Badge variant="outline">Shared Dashboard</Badge>
            </div>
            <div className="text-sm text-gray-500">
              Shared on {new Date(dashboard.sharedAt || dashboard.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content - Read Only */}
      <div className="container mx-auto px-6 py-8">
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

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-sm text-gray-600 mb-2">
            This dashboard was created with Lighthouse AI
          </p>
          <Link href="/" className="text-blue-600 hover:underline text-sm flex items-center justify-center gap-1">
            <ExternalLink className="h-4 w-4" />
            Create your own dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}