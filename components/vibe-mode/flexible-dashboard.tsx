"use client"

import React, { useState, useMemo, useCallback } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, ScatterChart, Scatter
} from 'recharts'
import { cn } from '@/lib/utils'
import { 
  DashboardConfig, 
  DataEntity,
  MetricConfig,
  ChartConfig,
  DashboardState
} from '@/lib/dashboard-types'
import { 
  processData, 
  applyFilters, 
  sortData,
  formatMetricValue 
} from '@/lib/data-processing'
import { formatValue, formatCurrency, formatLargeNumber } from '@/lib/data-formatter'
import { BaseCard } from './base/BaseCard'

interface FlexibleDashboardProps {
  config: DashboardConfig
  data: DataEntity[]
}

// Enhanced color palette with gradients
const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6']
const GRADIENT_COLORS = [
  { start: '#3b82f6', end: '#2563eb' },
  { start: '#8b5cf6', end: '#7c3aed' },
  { start: '#ec4899', end: '#db2777' },
  { start: '#10b981', end: '#059669' },
  { start: '#f59e0b', end: '#d97706' },
  { start: '#ef4444', end: '#dc2626' }
]

export function FlexibleDashboard({ config, data }: FlexibleDashboardProps) {
  // State management
  const [selectedEntity, setSelectedEntity] = useState<DataEntity | null>(null)
  const [activeView, setActiveView] = useState(config.views[0]?.id || 'overview')
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [sortBy, setSortBy] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  // Process data
  const filteredData = useMemo(() => {
    let result = applyFilters(data, activeFilters)
    if (sortBy) {
      result = sortData(result, sortBy)
    }
    return result
  }, [data, activeFilters, sortBy])

  const processedData = useMemo(() => 
    processData(filteredData, config),
    [filteredData, config]
  )

  // Get current view configuration
  const currentView = config.views.find(v => v.id === activeView)
  const visibleCharts = currentView?.charts 
    ? config.charts.filter(c => currentView.charts?.includes(c.id))
    : config.charts

  // Render metric card
  const renderMetricCard = (metric: MetricConfig) => {
    const aggregate = processedData.aggregates[metric.key]
    const value = aggregate?.total || aggregate?.average || 0
    const Icon = metric.icon

    return (
      <BaseCard key={metric.key} className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {Icon && <Icon className="h-5 w-5 text-gray-500" />}
              <p className="text-sm font-medium text-gray-600">{metric.label}</p>
            </div>
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {metric.type === 'currency' ? formatCurrency(value) : formatLargeNumber(value)}
              {metric.unit && <span className="text-lg ml-1 text-gray-500">{metric.unit}</span>}
            </p>
            {aggregate && (
              <div className="mt-2 text-xs text-gray-500">
                <span>Avg: {formatLargeNumber(aggregate.average || 0)}</span>
                {aggregate.min !== undefined && aggregate.max !== undefined && (
                  <span className="ml-3">
                    Range: {formatLargeNumber(aggregate.min)} - {formatLargeNumber(aggregate.max)}
                  </span>
                )}
              </div>
            )}
          </div>
          {aggregate?.growth && (
            <div className={cn(
              "text-sm font-medium",
              aggregate.growth > 0 ? "text-green-600" : "text-red-600"
            )}>
              {aggregate.growth > 0 ? '↑' : '↓'} {Math.abs(aggregate.growth).toFixed(1)}%
            </div>
          )}
        </div>
      </BaseCard>
    )
  }

  // Render chart
  const renderChart = (chart: ChartConfig) => {
    const chartData = processedData.chartData[chart.id] || []
    
    const formatAxis = (value: any) => {
      if (chart.valueType === 'currency') return formatCurrency(value)
      if (typeof value === 'number' && value >= 1000) return formatLargeNumber(value)
      return value
    }

    const renderChartContent = () => {
      switch (chart.type) {
        case 'bar':
          return (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" opacity={0.5} />
              <XAxis dataKey={chart.xAxisKey || 'name'} stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={formatAxis} />
              <Tooltip formatter={formatAxis} />
              {Array.isArray(chart.dataKey) ? (
                chart.dataKey.map((key, i) => (
                  <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} />
                ))
              ) : (
                <Bar dataKey={chart.dataKey} fill={chart.color || COLORS[0]} />
              )}
            </BarChart>
          )

        case 'line':
          return (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" opacity={0.5} />
              <XAxis dataKey={chart.xAxisKey || 'name'} stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={formatAxis} />
              <Tooltip formatter={formatAxis} />
              {Array.isArray(chart.dataKey) ? (
                chart.dataKey.map((key, i) => (
                  <Line 
                    key={key} 
                    type="monotone" 
                    dataKey={key} 
                    stroke={COLORS[i % COLORS.length]} 
                    strokeWidth={2} 
                  />
                ))
              ) : (
                <Line 
                  type="monotone" 
                  dataKey={chart.dataKey} 
                  stroke={chart.color || COLORS[0]} 
                  strokeWidth={2} 
                />
              )}
            </LineChart>
          )

        case 'pie':
          return (
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={formatAxis} />
            </PieChart>
          )

        case 'area':
          return (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" opacity={0.5} />
              <XAxis dataKey={chart.xAxisKey || 'name'} stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={formatAxis} />
              <Tooltip formatter={formatAxis} />
              <Area 
                type="monotone" 
                dataKey={chart.dataKey as string} 
                stroke={chart.color || COLORS[0]} 
                fill={chart.color || COLORS[0]} 
                fillOpacity={0.3} 
              />
            </AreaChart>
          )

        default:
          return null
      }
    }

    return (
      <BaseCard key={chart.id} className="p-5 hover:shadow-lg transition-shadow duration-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{chart.title}</h3>
        <ResponsiveContainer width="100%" height={chart.height || 250}>
          {renderChartContent()}
        </ResponsiveContainer>
      </BaseCard>
    )
  }

  // Render entity card
  const renderEntityCard = (entity: DataEntity) => {
    const cardConfig = config.entityCard
    const title = cardConfig.title(entity)
    const subtitle = cardConfig.subtitle?.(entity)
    const primaryValue = cardConfig.primaryMetric 
      ? entity[cardConfig.primaryMetric.key]
      : null

    return (
      <BaseCard
        key={entity.id || entity.name}
        isSelected={selectedEntity?.id === entity.id}
        onClick={() => setSelectedEntity(entity)}
        className="p-4"
      >
        <div className="space-y-2">
          <div>
            <h4 className="font-semibold text-gray-900">{title}</h4>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          
          {primaryValue && (
            <div className="text-2xl font-bold text-gray-900">
              {cardConfig.primaryMetric?.format 
                ? cardConfig.primaryMetric.format(primaryValue)
                : formatValue(primaryValue)
              }
            </div>
          )}

          {cardConfig.secondaryMetrics && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              {cardConfig.secondaryMetrics.map(key => {
                const metric = config.dataSchema.metrics.find(m => m.key === key)
                return (
                  <div key={key}>
                    <p className="text-xs text-gray-500">{metric?.label || key}</p>
                    <p className="text-sm font-medium">
                      {formatValue(entity[key], metric?.type)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </BaseCard>
    )
  }

  // Render insights
  const renderInsights = () => {
    if (processedData.insights.length === 0) return null

    return (
      <BaseCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <div className="space-y-3">
          {processedData.insights.slice(0, 5).map((insight, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={cn(
                "w-2 h-2 rounded-full mt-1.5",
                insight.severity === 'success' && "bg-green-500",
                insight.severity === 'warning' && "bg-yellow-500",
                insight.severity === 'error' && "bg-red-500",
                insight.severity === 'info' && "bg-blue-500"
              )} />
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">{insight.title}</p>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      </BaseCard>
    )
  }

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {config.title}
          </h1>
          {config.subtitle && (
            <p className="text-gray-600 mt-2 text-sm">{config.subtitle}</p>
          )}
        </div>

        {/* View Tabs */}
        {config.views.length > 1 && (
          <div className="flex gap-2 border-b">
            {config.views.map(view => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={cn(
                  "px-4 py-2 font-medium transition-colors",
                  activeView === view.id 
                    ? "text-blue-600 border-b-2 border-blue-600" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {view.name}
              </button>
            ))}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {config.dataSchema.metrics
            .filter(m => !currentView?.metrics || currentView.metrics.includes(m.key))
            .map(renderMetricCard)
          }
        </div>

        {/* Charts and Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visibleCharts.map(renderChart)}
          {renderInsights()}
        </div>

        {/* Entity Cards Grid */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            All {config.title.replace('Dashboard', '').trim()}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredData.slice(0, 12).map(renderEntityCard)}
          </div>
        </div>

        {/* Selected Entity Detail */}
        {selectedEntity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
            <BaseCard className="max-w-2xl w-full max-h-[80vh] overflow-auto p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">
                  {config.entityCard.title(selectedEntity)}
                </h2>
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {Object.entries(selectedEntity).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-4">
                    <p className="font-medium text-gray-600">{key}</p>
                    <p className="col-span-2 text-gray-900">{formatValue(value)}</p>
                  </div>
                ))}
              </div>
            </BaseCard>
          </div>
        )}
      </div>
    </div>
  )
}