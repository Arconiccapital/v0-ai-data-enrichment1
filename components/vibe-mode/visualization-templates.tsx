"use client"

import React from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Package } from 'lucide-react'

// Color palette for charts
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042']

interface VisualizationProps {
  data: any[]
  config: any
  headers: string[]
}

// Template 1: Simple Bar Chart
export function BarChartTemplate({ data, config, headers }: VisualizationProps) {
  const { title = "Bar Chart", description = "", dataKey = headers[1], nameKey = headers[0] } = config
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={nameKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={dataKey} fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Template 2: Line Chart
export function LineChartTemplate({ data, config, headers }: VisualizationProps) {
  const { title = "Line Chart", description = "", dataKey = headers[1], nameKey = headers[0] } = config
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={nameKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={dataKey} stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Template 3: Pie Chart
export function PieChartTemplate({ data, config, headers }: VisualizationProps) {
  const { title = "Pie Chart", description = "", valueKey = headers[1], nameKey = headers[0] } = config
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              dataKey={valueKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius={120}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Template 4: KPI Cards
export function KPICardsTemplate({ data, config, headers }: VisualizationProps) {
  const { title = "Key Metrics", kpis = [] } = config
  
  // Auto-generate KPIs if not provided
  const defaultKPIs = data.slice(0, 4).map((row, i) => ({
    label: row[headers[0]],
    value: row[headers[1]],
    change: row[headers[2]] || null,
    icon: [DollarSign, Users, Activity, Package][i] || DollarSign
  }))
  
  const displayKPIs = kpis.length > 0 ? kpis : defaultKPIs
  
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayKPIs.map((kpi: any, index: number) => {
          const Icon = kpi.icon || DollarSign
          const isPositive = kpi.change && parseFloat(kpi.change) > 0
          
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {kpi.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                {kpi.change && (
                  <div className={`flex items-center text-sm mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    {kpi.change}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// Template 5: Data Table
export function DataTableTemplate({ data, config, headers }: VisualizationProps) {
  const { title = "Data Table", description = "", showHeaders = true } = config
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {showHeaders && (
              <thead>
                <tr className="border-b">
                  {headers.map((header, i) => (
                    <th key={i} className="text-left p-2 font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b hover:bg-gray-50">
                  {headers.map((header, colIndex) => (
                    <td key={colIndex} className="p-2">
                      {row[header]}
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

// Template 6: Dashboard Grid
export function DashboardTemplate({ data, config, headers }: VisualizationProps) {
  const { title = "Dashboard", charts = [] } = config
  
  // Default dashboard layout if not specified
  const defaultCharts = [
    { type: 'kpi', config: { title: 'Key Metrics' } },
    { type: 'bar', config: { title: 'Bar Chart Analysis' } },
    { type: 'line', config: { title: 'Trend Analysis' } },
    { type: 'pie', config: { title: 'Distribution' } }
  ]
  
  const displayCharts = charts.length > 0 ? charts : defaultCharts
  
  return (
    <div className="w-full space-y-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {displayCharts.map((chart: any, index: number) => {
          const Component = getTemplateComponent(chart.type)
          return <Component key={index} data={data} config={chart.config || {}} headers={headers} />
        })}
      </div>
    </div>
  )
}

// Template selector
export function getTemplateComponent(type: string) {
  switch (type) {
    case 'bar':
      return BarChartTemplate
    case 'line':
      return LineChartTemplate
    case 'pie':
      return PieChartTemplate
    case 'kpi':
      return KPICardsTemplate
    case 'table':
      return DataTableTemplate
    case 'dashboard':
      return DashboardTemplate
    default:
      return DataTableTemplate // Safe fallback
  }
}