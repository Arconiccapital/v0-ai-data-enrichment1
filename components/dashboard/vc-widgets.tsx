"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  FunnelChart, Funnel, LabelList, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, ScatterChart, Scatter
} from "recharts"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, DollarSign, Users, Calendar, Target } from "lucide-react"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1']

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  format?: 'currency' | 'percentage' | 'number'
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

export function MetricCard({ title, value, change, format, icon, trend }: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (format === 'currency') {
      return typeof val === 'number' ? `$${val.toLocaleString()}` : val
    }
    if (format === 'percentage') {
      return typeof val === 'number' ? `${val}%` : val
    }
    return val.toLocaleString()
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : trend === 'down' ? (
              <TrendingDown className="h-4 w-4 text-red-600" />
            ) : null}
            <span className={`text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface InvestmentScoringProps {
  data: Array<{
    criteria: string
    score: number
    fullMark: number
  }>
  title: string
  description?: string
}

export function InvestmentScoring({ data, title, description }: InvestmentScoringProps) {
  const averageScore = data.reduce((sum, d) => sum + d.score, 0) / data.length
  const maxScore = data[0]?.fullMark || 10

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}</div>
            <div className="text-sm text-gray-500">/ {maxScore}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="criteria" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, maxScore]} tick={{ fontSize: 10 }} />
            <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface DealFlowFunnelProps {
  data: Array<{
    stage: string
    value: number
    percentage: number
  }>
  title: string
  description?: string
}

export function DealFlowFunnel({ data, title, description }: DealFlowFunnelProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <FunnelChart>
            <Tooltip />
            <Funnel
              dataKey="value"
              data={data}
              isAnimationActive
            >
              <LabelList position="center" fill="#fff" />
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span>{item.stage}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium">{item.value}</span>
                <span className="text-gray-500">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface PortfolioDistributionProps {
  data: Array<{
    name: string
    value: number
  }>
  title: string
  description?: string
}

export function PortfolioDistribution({ data, title, description }: PortfolioDistributionProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface RiskMatrixProps {
  data: Array<{
    company: string
    executionRisk: number
    marketRisk: number
    financialRisk: number
    overallRisk: 'Low' | 'Medium' | 'High'
  }>
  title: string
  description?: string
}

export function RiskMatrix({ data, title, description }: RiskMatrixProps) {
  const getRiskColor = (level: string) => {
    switch(level) {
      case 'Low': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'High': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskIcon = (level: string) => {
    switch(level) {
      case 'Low': return <CheckCircle className="h-4 w-4" />
      case 'Medium': return <AlertTriangle className="h-4 w-4" />
      case 'High': return <XCircle className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(0, 5).map((item, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{item.company}</h4>
                <Badge className={getRiskColor(item.overallRisk)} variant="secondary">
                  <span className="flex items-center gap-1">
                    {getRiskIcon(item.overallRisk)}
                    {item.overallRisk}
                  </span>
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Execution:</span>
                  <Progress value={item.executionRisk * 10} className="h-2 mt-1" />
                </div>
                <div>
                  <span className="text-gray-500">Market:</span>
                  <Progress value={item.marketRisk * 10} className="h-2 mt-1" />
                </div>
                <div>
                  <span className="text-gray-500">Financial:</span>
                  <Progress value={item.financialRisk * 10} className="h-2 mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface GrowthTrendsProps {
  data: Array<{
    month: string
    revenue: number
    growth: number
    deals: number
  }>
  title: string
  description?: string
}

export function GrowthTrends({ data, title, description }: GrowthTrendsProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="deals" fill="#8884d8" name="Deals" />
            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="growth" stroke="#ffc658" name="Growth %" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface CompanyComparisonProps {
  data: Array<{
    company: string
    revenue: number
    growth: number
    valuation: number
    score: number
  }>
  title: string
  description?: string
}

export function CompanyComparison({ data, title, description }: CompanyComparisonProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="revenue" name="Revenue" unit="M" tick={{ fontSize: 12 }} />
            <YAxis dataKey="growth" name="Growth" unit="%" tick={{ fontSize: 12 }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Companies" data={data} fill="#8884d8">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {data.slice(0, 4).map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="truncate">{item.company}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface FinancialMetricsProps {
  metrics: {
    revenue: number
    growth: number
    burnRate: number
    runway: number
    valuation: number
    ltvcac?: number
  }
  title: string
  description?: string
}

export function FinancialMetrics({ metrics, title, description }: FinancialMetricsProps) {
  const items = [
    { label: 'Revenue', value: metrics.revenue, format: 'currency', icon: <DollarSign className="h-4 w-4" /> },
    { label: 'Growth Rate', value: metrics.growth, format: 'percentage', icon: <TrendingUp className="h-4 w-4" /> },
    { label: 'Burn Rate', value: metrics.burnRate, format: 'currency', icon: <TrendingDown className="h-4 w-4" /> },
    { label: 'Runway', value: `${metrics.runway} months`, format: 'text', icon: <Calendar className="h-4 w-4" /> },
    { label: 'Valuation', value: metrics.valuation, format: 'currency', icon: <Target className="h-4 w-4" /> },
    { label: 'LTV/CAC', value: metrics.ltvcac || 'N/A', format: 'text', icon: <Users className="h-4 w-4" /> }
  ]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {items.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <div className="text-xl font-semibold">
                {item.format === 'currency' ? `$${item.value.toLocaleString()}` :
                 item.format === 'percentage' ? `${item.value}%` :
                 item.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}