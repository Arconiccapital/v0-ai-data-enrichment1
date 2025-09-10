"use client"

import React from 'react'
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, Target } from 'lucide-react'
import { DashboardConfig, DataEntity } from '@/lib/dashboard-types'
import { formatValue, formatCurrency, formatLargeNumber } from '@/lib/data-formatter'
import { processData } from '@/lib/data-processing'

interface KPIViewProps {
  config: DashboardConfig
  data: DataEntity[]
}

export function KPIView({ config, data }: KPIViewProps) {
  const processedData = processData(data, config)
  const metrics = config.dataSchema.metrics
  
  // Get icon for metric based on type/name
  const getMetricIcon = (metric: any) => {
    const label = metric.label.toLowerCase()
    if (metric.type === 'currency' || label.includes('revenue') || label.includes('sales')) {
      return DollarSign
    }
    if (label.includes('employee') || label.includes('user') || label.includes('customer')) {
      return Users
    }
    if (label.includes('target') || label.includes('goal')) {
      return Target
    }
    return Activity
  }
  
  // Calculate trend for each metric
  const getMetricTrend = (metric: any) => {
    const aggregate = processedData.aggregates[metric.key]
    return aggregate?.growth || 0
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            {config.title || 'Key Performance Indicators'}
          </h1>
          <p className="text-xl text-gray-300">
            {config.subtitle || 'Real-time Business Metrics Dashboard'}
          </p>
          <div className="mt-4 text-sm text-gray-400">
            Last Updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
        
        {/* Primary KPI Cards - Large */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {metrics.slice(0, 6).map((metric, idx) => {
            const aggregate = processedData.aggregates[metric.key]
            const trend = getMetricTrend(metric)
            const Icon = getMetricIcon(metric)
            
            if (!aggregate) return null
            
            return (
              <div
                key={metric.key}
                className="relative bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-lg rounded-2xl p-8 border border-white/10 transform hover:scale-105 transition-all duration-300"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl" />
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-white/10 rounded-lg">
                      <Icon className="w-8 h-8 text-blue-400" />
                    </div>
                    {trend !== 0 && (
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                        trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span className="text-sm font-semibold">{Math.abs(trend).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Main Value */}
                  <div className="mb-4">
                    <div className="text-5xl font-bold text-white mb-2">
                      {metric.type === 'currency' 
                        ? formatCurrency(aggregate.total || 0)
                        : formatLargeNumber(aggregate.total || 0)
                      }
                    </div>
                    <div className="text-lg text-gray-300">{metric.label}</div>
                  </div>
                  
                  {/* Stats Bar */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Average</div>
                      <div className="text-lg font-semibold text-white">
                        {formatValue(aggregate.average, metric.type)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Range</div>
                      <div className="text-lg font-semibold text-white">
                        {formatValue(aggregate.min, metric.type)} - {formatValue(aggregate.max, metric.type)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000" />
              </div>
            )
          })}
        </div>
        
        {/* Secondary Metrics - Compact */}
        {metrics.length > 6 && (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Additional Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {metrics.slice(6).map(metric => {
                const aggregate = processedData.aggregates[metric.key]
                if (!aggregate) return null
                
                return (
                  <div key={metric.key} className="text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-1">
                      {formatValue(aggregate.total, metric.type)}
                    </div>
                    <div className="text-sm text-gray-400">{metric.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Live Status Indicators */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-500/20 backdrop-blur-lg rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-green-400 text-sm mb-1">System Status</div>
                <div className="text-white text-2xl font-bold">Operational</div>
              </div>
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
          
          <div className="bg-blue-500/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-400 text-sm mb-1">Data Points</div>
                <div className="text-white text-2xl font-bold">{data.length.toLocaleString()}</div>
              </div>
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
            </div>
          </div>
          
          <div className="bg-purple-500/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-purple-400 text-sm mb-1">Active Metrics</div>
                <div className="text-white text-2xl font-bold">{metrics.length}</div>
              </div>
              <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}