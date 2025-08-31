"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { X, Download, Share2, Maximize2, Minimize2, RefreshCw, TrendingUp, TrendingDown, AlertCircle, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { VCInvestmentDashboard } from "./vc-investment-dashboard"
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  ScatterChart, Scatter, ComposedChart, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from "recharts"
import {
  ETF_LIST,
  generateTimeSeriesData,
  generateSectorAllocation,
  generateTopHoldings,
  generateMonthlyReturns,
  generateRiskReturnData,
  generateExpenseComparison,
  generateRollingVolatility,
  generateFundFlows,
  generateDividendHistory
} from "@/lib/etf-dummy-data"

interface DashboardPreviewProps {
  dashboard: any
  onClose: () => void
  onRefresh?: () => void
  isLoading?: boolean
}

// Modern color palette
const colors = {
  primary: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'],
  gradient: ['#818cf8', '#a78bfa', '#f9a8d4', '#fbbf24', '#34d399', '#60a5fa'],
  muted: ['#e0e7ff', '#ede9fe', '#fce7f3', '#fef3c7', '#d1fae5', '#dbeafe']
}

// Custom tooltip with glassmorphism effect
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 border border-gray-200 rounded-lg shadow-xl">
        <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-600">{entry.name}:</span>
            <span className="text-xs font-medium" style={{ color: entry.color }}>
              {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function DashboardPreview({ dashboard, onClose, onRefresh, isLoading }: DashboardPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState("1Y")
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null)
  
  // Generate dummy data
  const timeSeriesData = useMemo(() => generateTimeSeriesData(12), [])
  const sectorData = useMemo(() => generateSectorAllocation(), [])
  const holdingsData = useMemo(() => generateTopHoldings("SPY"), [])
  const monthlyReturns = useMemo(() => generateMonthlyReturns(12), [])
  const riskReturnData = useMemo(() => generateRiskReturnData(), [])
  const expenseData = useMemo(() => generateExpenseComparison(), [])
  const volatilityData = useMemo(() => generateRollingVolatility(90), [])
  const fundFlowData = useMemo(() => generateFundFlows(12), [])
  const dividendData = useMemo(() => generateDividendHistory(), [])

  // Generate chart data based on widget type
  const generateChartData = (widget: any) => {
    const chartType = widget.config?.chartType || widget.type
    
    switch(chartType) {
      case 'line':
        return timeSeriesData.map(d => ({
          name: d.date.slice(5),
          value: d.value,
          benchmark: d.benchmark
        }))
      case 'bar':
        if (widget.title?.includes('Expense') || widget.title?.includes('Cost')) {
          return expenseData
        }
        return monthlyReturns
      case 'pie':
        return sectorData
      case 'area':
        return volatilityData.map(d => ({
          name: d.date.slice(5),
          value: d.value
        }))
      case 'scatter':
        return riskReturnData.map(d => ({
          x: d.risk,
          y: d.return,
          name: d.name,
          size: d.size
        }))
      case 'combo':
        return fundFlowData.map(d => ({
          name: d.date.slice(5),
          value: d.inflows,
          secondary: d.net
        }))
      case 'table':
        return holdingsData
      default:
        return monthlyReturns
    }
  }

  // Format value based on type
  const formatValue = (value: any, format?: string) => {
    if (format === 'currency') return `$${value.toLocaleString()}`
    if (format === 'percentage') return `${value}%`
    if (format === 'number') return value.toLocaleString()
    return value
  }
  
  // Render chart with modern styling
  const renderChart = (widget: any) => {
    const chartData = generateChartData(widget)
    
    // Common chart props for consistent styling
    const commonProps = {
      margin: { top: 20, right: 30, left: 20, bottom: 60 }
    }

    switch(widget.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} {...commonProps}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#6366f1" 
                strokeWidth={3}
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="Portfolio"
              />
              {chartData[0]?.benchmark && (
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Benchmark"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} {...commonProps}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              <Bar 
                dataKey="value" 
                fill="url(#barGradient)"
                radius={[8, 8, 0, 0]}
                name="Value"
              />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <defs>
                {colors.primary.map((color, index) => (
                  <linearGradient key={`pieGradient${index}`} id={`pieGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={1}/>
                    <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {chartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={`url(#pieGradient${index % colors.primary.length})`} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} {...commonProps}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#6366f1" 
                strokeWidth={2}
                fill="url(#areaGradient)"
                name="Value"
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart {...commonProps}>
              <defs>
                {colors.primary.map((color, index) => (
                  <radialGradient key={`scatterGradient${index}`} id={`scatterGradient${index}`}>
                    <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
                    <stop offset="100%" stopColor={color} stopOpacity={0.4}/>
                  </radialGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="x" 
                name="Risk" 
                unit="%"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                dataKey="y" 
                name="Return" 
                unit="%"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Scatter name="ETFs" data={chartData} fill="#8884d8">
                {chartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={`url(#scatterGradient${index % colors.primary.length})`} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )

      case 'combo':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData} {...commonProps}>
              <defs>
                <linearGradient id="comboBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.6}/>
                </linearGradient>
                <linearGradient id="comboLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Bar 
                yAxisId="left" 
                dataKey="value" 
                fill="url(#comboBarGradient)"
                radius={[6, 6, 0, 0]}
                name="Volume"
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="secondary" 
                stroke="url(#comboLineGradient)"
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="Price"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )

      case 'table':
        return (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  {Object.keys(chartData[0] || {}).map((key) => (
                    <th key={key} className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {chartData.map((row: any, idx: number) => (
                  <tr 
                    key={idx} 
                    className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-colors"
                  >
                    {Object.entries(row).map(([key, value]: [string, any], cellIdx: number) => {
                      const isPositive = typeof value === 'number' && value > 0
                      const isNegative = typeof value === 'number' && value < 0
                      const isPercentage = key.toLowerCase().includes('return') || key.toLowerCase().includes('yield')
                      
                      return (
                        <td key={cellIdx} className="px-4 py-3">
                          {typeof value === 'number' ? (
                            <span className={`
                              font-medium
                              ${isPercentage && isPositive ? 'text-green-600' : ''}
                              ${isPercentage && isNegative ? 'text-red-600' : ''}
                              ${!isPercentage ? 'text-gray-900' : ''}
                            `}>
                              {isPercentage ? `${value.toFixed(2)}%` : value.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-900">{value}</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
              <YAxis tick={{ fill: '#6b7280' }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )
    }
  }
  
  // Sort table data
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }
  
  const sortedData = useMemo(() => {
    if (!sortConfig) return holdingsData
    
    return [...holdingsData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof typeof a]
      const bValue = b[sortConfig.key as keyof typeof b]
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [holdingsData, sortConfig])

  // Render widget based on type
  const renderWidget = (widget: any) => {
    switch (widget.type) {
      case 'kpi':
      case 'metric':
        // Use dummy ETF data for KPIs
        const etfData = ETF_LIST[0] // SPY data
        const metricValues: Record<string, any> = {
          'Portfolio Return': { value: etfData.ytdReturn, format: 'percentage', trend: 'up', change: 3.2 },
          'Portfolio Risk': { value: etfData.volatility, format: 'percentage', trend: 'down', change: -1.5 },
          'Portfolio Cost': { value: etfData.expenseRatio, format: 'percentage', trend: 'down', change: -0.02 },
          'AUM': { value: etfData.aum / 1000000000, format: 'currency', trend: 'up', change: 12.5 },
          'Sharpe Ratio': { value: etfData.sharpeRatio, format: 'number', trend: 'up', change: 0.15 },
          'Dividend Yield': { value: etfData.dividendYield, format: 'percentage', trend: 'up', change: 0.1 }
        }
        
        const currentMetric = metricValues[widget.title] || { 
          value: widget.data?.value || Math.random() * 100, 
          format: widget.config?.format,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          change: (Math.random() * 10 - 5).toFixed(2)
        }
        
        return (
          <Card key={widget.id} className={cn(
            "h-full hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50",
            widget.size === 'large' && "col-span-2",
            widget.size === 'full' && "col-span-full"
          )}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {formatValue(currentMetric.value, currentMetric.format)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{widget.title}</p>
              <div className="flex items-center mt-3">
                {currentMetric.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={cn(
                  "text-sm font-medium",
                  currentMetric.trend === 'up' ? "text-green-600" : "text-red-600"
                )}>
                  {currentMetric.trend === 'up' ? '+' : ''}{currentMetric.change}%
                </span>
              </div>
            </CardContent>
          </Card>
        )

      case 'chart':
        return (
          <Card key={widget.id} className={cn(
            "h-full hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50 border-gray-200",
            widget.size === 'large' && "col-span-2",
            widget.size === 'full' && "col-span-full"
          )}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-900">{widget.title}</CardTitle>
                {widget.metrics && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {widget.metrics.length} metrics
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {renderChart(widget)}
            </CardContent>
          </Card>
        )

      case 'table':
        return (
          <Card key={widget.id} className={cn(
            "h-full overflow-auto hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50",
            widget.size === 'large' && "col-span-2",
            widget.size === 'full' && "col-span-full"
          )}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-900">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                    <tr>
                      <th 
                        className="text-left p-3 cursor-pointer hover:bg-indigo-100 transition-colors font-semibold text-gray-700"
                        onClick={() => handleSort('ticker')}
                      >
                        <div className="flex items-center gap-1">
                          Ticker
                          {sortConfig?.key === 'ticker' && (
                            sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="text-left p-3 cursor-pointer hover:bg-indigo-100 transition-colors font-semibold text-gray-700"
                        onClick={() => handleSort('company')}
                      >
                        <div className="flex items-center gap-1">
                          Company
                          {sortConfig?.key === 'company' && (
                            sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="text-left p-3 cursor-pointer hover:bg-indigo-100 transition-colors font-semibold text-gray-700"
                        onClick={() => handleSort('weight')}
                      >
                        <div className="flex items-center gap-1">
                          Weight %
                          {sortConfig?.key === 'weight' && (
                            sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="text-left p-3 cursor-pointer hover:bg-indigo-100 transition-colors font-semibold text-gray-700"
                        onClick={() => handleSort('sector')}
                      >
                        <div className="flex items-center gap-1">
                          Sector
                          {sortConfig?.key === 'sector' && (
                            sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="text-left p-3 cursor-pointer hover:bg-indigo-100 transition-colors font-semibold text-gray-700"
                        onClick={() => handleSort('performanceContribution')}
                      >
                        <div className="flex items-center gap-1">
                          Perf. Contrib.
                          {sortConfig?.key === 'performanceContribution' && (
                            sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {sortedData.slice(0, 10).map((holding, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-colors">
                        <td className="p-3 font-medium text-gray-900">{holding.ticker}</td>
                        <td className="p-3 text-gray-700">{holding.company}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{holding.weight.toFixed(2)}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                                style={{ width: `${(holding.weight / 8) * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                            {holding.sector}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <span className={cn(
                            "font-semibold",
                            holding.performanceContribution > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {holding.performanceContribution > 0 ? '+' : ''}{holding.performanceContribution.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )

      case 'progress':
        return (
          <Card key={widget.id} className={cn(
            "h-full hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50",
            widget.size === 'large' && "col-span-2",
            widget.size === 'full' && "col-span-full"
          )}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-900">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(widget.data || {}).map(([key, value]: [string, any]) => (
                <div key={key} className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">{key}</span>
                    <span className="text-sm font-semibold text-gray-900">{value}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )

      default:
        return (
          <Card key={widget.id} className={cn(
            "h-full hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50",
            widget.size === 'large' && "col-span-2",
            widget.size === 'full' && "col-span-full"
          )}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-900">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                <span className="text-gray-500">{widget.type}: {widget.title}</span>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error Generating Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2">
              <Button onClick={onRefresh} variant="outline">Try Again</Button>
              <Button onClick={onClose}>Close</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <Card className="p-8">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <h3 className="font-semibold">Generating Dashboard</h3>
              <p className="text-sm text-gray-600 mt-1">Claude is analyzing your data...</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Check if this is an ETF dashboard
  if (dashboard?.type === 'etf-dashboard') {
    const ETFDashboard = require('./etf-dashboard').default
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-auto">
        <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
          <Button onClick={onClose} variant="outline" size="sm">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
        <ETFDashboard />
      </div>
    )
  }

  // Check if this is a VC dashboard
  if (dashboard?.type === 'vc-dashboard') {
    const VCDashboard = require('./vc-dashboard').default
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-auto">
        <VCDashboard onClose={onClose} />
      </div>
    )
  }

  // Check if this is a VC Investment dashboard
  if (dashboard?.type === 'vc-investment') {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-auto">
        <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold">VC Investment Analysis</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <VCInvestmentDashboard 
          companyName={dashboard?.data?.companyName || "Target Company"}
          data={dashboard?.data}
          onRefresh={onRefresh}
        />
      </div>
    )
  }

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-white flex flex-col",
      isFullscreen ? "p-0" : "p-4 md:p-8"
    )}>
      {/* Overlay Background */}
      {!isFullscreen && (
        <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      )}

      {/* Dashboard Container */}
      <div className={cn(
        "relative bg-white rounded-lg shadow-xl flex flex-col",
        isFullscreen ? "h-full w-full rounded-none" : "max-w-7xl mx-auto w-full h-full max-h-[90vh]"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">{dashboard?.title || "AI Generated Dashboard"}</h2>
            {dashboard?.description && (
              <p className="text-sm text-gray-600 mt-1">{dashboard.description}</p>
            )}
            {dashboard?.theme && (
              <Badge variant="outline" className="mt-2">{dashboard.theme}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Export functionality
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Share functionality
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6">
          {dashboard?.sections?.map((section: any, sectionIdx: number) => (
            <div key={sectionIdx} className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-1 w-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
              </div>
              {section.description && (
                <p className="text-sm text-gray-600 mb-4">{section.description}</p>
              )}
              <div className={cn(
                "grid gap-4",
                section.layout === 'single' ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              )}>
                {section.widgets?.map((widget: any) => renderWidget(widget))}
              </div>
            </div>
          ))}

          {/* Insights Section */}
          {dashboard?.insights && dashboard.insights.length > 0 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <h3 className="font-semibold mb-3 text-gray-900">Key Insights</h3>
              <ul className="list-disc list-inside space-y-2">
                {dashboard.insights.map((insight: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-700">{insight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}