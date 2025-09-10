"use client"

import React from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, ScatterChart, Scatter
} from 'recharts'
import { cn } from '@/lib/utils'
import { formatValue, formatCurrency, formatLargeNumber } from '@/lib/data-formatter'

interface DashboardConfig {
  title: string
  layout: {
    type: 'grid' | 'flex' | 'dashboard'
    columns?: number
  }
  components: ComponentConfig[]
}

interface ComponentConfig {
  type: 'metric' | 'chart' | 'table' | 'text'
  id: string
  props: any
}

interface DashboardRendererProps {
  config: DashboardConfig
}

// Color palette for charts
const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6']

// Metric Card Component
function MetricCard({ props }: { props: any }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  }
  
  const bgClass = colorClasses[props.color as keyof typeof colorClasses] || colorClasses.blue
  
  // Format the value based on its type
  const displayValue = (() => {
    if (typeof props.value === 'number') {
      // Check if it has a unit or is currency
      if (props.unit === 'USD' || props.unit === '$' || props.isCurrency) {
        return formatCurrency(props.value)
      }
      // Check if it's a percentage
      if (props.unit === '%' || props.isPercentage) {
        return `${props.value}%`
      }
      // Otherwise format as large number
      return formatLargeNumber(props.value)
    }
    return formatValue(props.value, props.type)
  })()
  
  return (
    <div className={cn("rounded-lg border p-6", bgClass)}>
      <div className="space-y-2">
        <p className="text-sm font-medium opacity-80">{props.title}</p>
        <p className="text-3xl font-bold">
          {displayValue}
          {props.unit && !displayValue.includes(props.unit) && props.unit !== 'USD' && props.unit !== '$' && (
            <span className="text-lg ml-1">{props.unit}</span>
          )}
        </p>
        {props.subtitle && (
          <p className="text-xs opacity-70">{props.subtitle}</p>
        )}
        {props.trend && (
          <div className="flex items-center gap-1">
            <span className={cn("text-sm font-medium", props.trend > 0 ? "text-green-600" : "text-red-600")}>
              {props.trend > 0 ? '↑' : '↓'} {Math.abs(props.trend)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// Chart Component
function ChartComponent({ props }: { props: any }) {
  const { chartType, title, data, dataKey, xAxisKey, color = '#6366f1', yAxisKey, colors, valueType } = props
  
  // Format tick values for Y axis
  const formatYAxisTick = (value: any) => {
    if (valueType === 'currency' || props.isCurrency) {
      return formatCurrency(value)
    }
    if (typeof value === 'number' && value >= 1000) {
      return formatLargeNumber(value)
    }
    return value
  }
  
  // Custom tooltip formatter
  const customTooltipFormatter = (value: any) => {
    if (valueType === 'currency' || props.isCurrency) {
      return formatCurrency(value)
    }
    if (typeof value === 'number' && value >= 1000) {
      return formatLargeNumber(value)
    }
    return value.toLocaleString()
  }
  
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xAxisKey || 'name'} stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} tickFormatter={formatYAxisTick} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              labelStyle={{ color: '#111827', fontWeight: 600 }}
              formatter={customTooltipFormatter}
            />
            <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
          </BarChart>
        )
      
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xAxisKey || 'name'} stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} tickFormatter={formatYAxisTick} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              labelStyle={{ color: '#111827', fontWeight: 600 }}
              formatter={customTooltipFormatter}
            />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ fill: color, r: 4 }} />
          </LineChart>
        )
      
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xAxisKey || 'name'} stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} tickFormatter={formatYAxisTick} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              labelStyle={{ color: '#111827', fontWeight: 600 }}
              formatter={customTooltipFormatter}
            />
            <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.3} />
          </AreaChart>
        )
      
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey || 'value'}
              nameKey={xAxisKey || 'name'}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={colors?.[index] || CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
          </PieChart>
        )
        
      case 'scatter':
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xAxisKey || 'x'} stroke="#6b7280" fontSize={12} />
            <YAxis dataKey={yAxisKey || 'y'} stroke="#6b7280" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Scatter data={data} fill={color} />
          </ScatterChart>
        )
      
      default:
        return null
    }
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  )
}

// Table Component
function TableComponent({ props }: { props: any }) {
  const { title, columns, data, limit } = props
  const displayData = limit ? data.slice(0, limit) : data
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((col: string) => (
                <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.map((row: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((col: string) => (
                  <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {row[col] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Text Component
function TextComponent({ props }: { props: any }) {
  const { text, size = 'medium', weight = 'normal' } = props
  
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-2xl',
    xlarge: 'text-4xl'
  }
  
  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }
  
  return (
    <div className={cn(
      "text-gray-900",
      sizeClasses[size as keyof typeof sizeClasses],
      weightClasses[weight as keyof typeof weightClasses]
    )}>
      {text}
    </div>
  )
}

// Main Dashboard Renderer
export function DashboardRenderer({ config }: DashboardRendererProps) {
  if (!config || !config.components) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">No dashboard configuration available</p>
      </div>
    )
  }
  
  const getLayoutClass = () => {
    if (config.layout.type === 'grid') {
      const cols = config.layout.columns || 3
      return `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${cols} gap-6`
    }
    if (config.layout.type === 'flex') {
      return 'flex flex-col gap-6'
    }
    // Dashboard layout: metrics at top, charts below, table at bottom
    return 'space-y-6'
  }
  
  const renderComponent = (component: ComponentConfig) => {
    switch (component.type) {
      case 'metric':
        return <MetricCard key={component.id} props={component.props} />
      case 'chart':
        return <ChartComponent key={component.id} props={component.props} />
      case 'table':
        return <TableComponent key={component.id} props={component.props} />
      case 'text':
        return <TextComponent key={component.id} props={component.props} />
      default:
        return null
    }
  }
  
  // For dashboard layout, group components by type
  if (config.layout.type === 'dashboard') {
    const metrics = config.components.filter(c => c.type === 'metric')
    const charts = config.components.filter(c => c.type === 'chart')
    const tables = config.components.filter(c => c.type === 'table')
    const texts = config.components.filter(c => c.type === 'text')
    
    return (
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Title */}
          {texts.length > 0 && (
            <div className="mb-6">
              {texts.map(renderComponent)}
            </div>
          )}
          
          {/* Metrics */}
          {metrics.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map(renderComponent)}
            </div>
          )}
          
          {/* Charts */}
          {charts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {charts.map(renderComponent)}
            </div>
          )}
          
          {/* Tables */}
          {tables.length > 0 && (
            <div className="space-y-6">
              {tables.map(renderComponent)}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  // For grid or flex layouts
  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {config.title && (
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{config.title}</h1>
        )}
        <div className={getLayoutClass()}>
          {config.components.map(renderComponent)}
        </div>
      </div>
    </div>
  )
}