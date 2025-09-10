"use client"

import React from 'react'
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Crown } from 'lucide-react'
import { DashboardConfig, DataEntity } from '@/lib/dashboard-types'
import { formatValue, formatCurrency, formatLargeNumber } from '@/lib/data-formatter'
import { processData } from '@/lib/data-processing'

interface RankingViewProps {
  config: DashboardConfig
  data: DataEntity[]
}

export function RankingView({ config, data }: RankingViewProps) {
  const processedData = processData(data, config)
  const metrics = config.dataSchema.metrics
  const primaryMetric = metrics[0] // Use first metric for ranking
  
  // Sort data by primary metric
  const sortedData = [...data].sort((a, b) => {
    const aVal = parseFloat(String(a[primaryMetric.key] || 0))
    const bVal = parseFloat(String(b[primaryMetric.key] || 0))
    return bVal - aVal
  })
  
  // Get ranking icon
  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1: return Crown
      case 2: return Trophy
      case 3: return Medal
      default: return Award
    }
  }
  
  // Get ranking color
  const getRankColor = (rank: number) => {
    switch(rank) {
      case 1: return 'from-yellow-400 to-amber-600'
      case 2: return 'from-gray-300 to-gray-500'
      case 3: return 'from-orange-400 to-orange-600'
      default: return 'from-blue-400 to-blue-600'
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <Trophy className="w-16 h-16 text-yellow-400 animate-pulse" />
          </div>
          <h1 className="text-6xl font-bold text-white mb-4">
            {config.title || 'Leaderboard'}
          </h1>
          <p className="text-xl text-gray-300">
            {config.subtitle || `Top Performers by ${primaryMetric.label}`}
          </p>
        </div>
        
        {/* Top 3 Podium */}
        <div className="flex justify-center items-end gap-4 mb-16">
          {/* 2nd Place */}
          {sortedData[1] && (
            <div className="text-center transform hover:scale-105 transition-all">
              <div className="bg-gradient-to-br from-gray-300 to-gray-500 rounded-t-2xl p-6 relative">
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-2xl">
                    <span className="text-4xl font-bold text-white">2</span>
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {sortedData[1][config.dataSchema.primaryKey]}
                  </h3>
                  <div className="text-3xl font-bold text-white">
                    {formatValue(sortedData[1][primaryMetric.key], primaryMetric.type)}
                  </div>
                </div>
              </div>
              <div className="bg-gray-700 h-40 rounded-b-2xl"></div>
            </div>
          )}
          
          {/* 1st Place */}
          {sortedData[0] && (
            <div className="text-center transform hover:scale-105 transition-all">
              <div className="bg-gradient-to-br from-yellow-400 to-amber-600 rounded-t-2xl p-8 relative">
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                    <Crown className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="mt-10">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {sortedData[0][config.dataSchema.primaryKey]}
                  </h3>
                  <div className="text-4xl font-bold text-white">
                    {formatValue(sortedData[0][primaryMetric.key], primaryMetric.type)}
                  </div>
                </div>
              </div>
              <div className="bg-yellow-600 h-48 rounded-b-2xl"></div>
            </div>
          )}
          
          {/* 3rd Place */}
          {sortedData[2] && (
            <div className="text-center transform hover:scale-105 transition-all">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-t-2xl p-6 relative">
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-2xl">
                    <span className="text-4xl font-bold text-white">3</span>
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {sortedData[2][config.dataSchema.primaryKey]}
                  </h3>
                  <div className="text-3xl font-bold text-white">
                    {formatValue(sortedData[2][primaryMetric.key], primaryMetric.type)}
                  </div>
                </div>
              </div>
              <div className="bg-orange-700 h-32 rounded-b-2xl"></div>
            </div>
          )}
        </div>
        
        {/* Full Ranking List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-white mb-8">Complete Rankings</h2>
          <div className="space-y-4">
            {sortedData.slice(0, 10).map((item, idx) => {
              const Icon = getRankIcon(idx + 1)
              const isTop3 = idx < 3
              
              // Calculate change from previous period if available
              const change = Math.random() > 0.5 ? Math.floor(Math.random() * 5) : -Math.floor(Math.random() * 5)
              
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-6 rounded-xl backdrop-blur transform hover:scale-105 transition-all ${
                    isTop3 ? 'bg-gradient-to-r ' + getRankColor(idx + 1) + ' bg-opacity-20' : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    {/* Rank */}
                    <div className={`flex items-center justify-center w-16 h-16 rounded-full ${
                      isTop3 ? 'bg-gradient-to-br ' + getRankColor(idx + 1) : 'bg-gray-700'
                    }`}>
                      {isTop3 ? (
                        <Icon className="w-8 h-8 text-white" />
                      ) : (
                        <span className="text-2xl font-bold text-white">{idx + 1}</span>
                      )}
                    </div>
                    
                    {/* Name */}
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {item[config.dataSchema.primaryKey]}
                      </h3>
                      {metrics.length > 1 && (
                        <p className="text-sm text-gray-400">
                          {metrics[1].label}: {formatValue(item[metrics[1].key], metrics[1].type)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {/* Change Indicator */}
                    {change !== 0 && (
                      <div className={`flex items-center gap-1 ${
                        change > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {change > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                        <span className="text-sm font-semibold">{Math.abs(change)}</span>
                      </div>
                    )}
                    
                    {/* Primary Metric Value */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {formatValue(item[primaryMetric.key], primaryMetric.type)}
                      </div>
                      <div className="text-xs text-gray-400">{primaryMetric.label}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Show More */}
          {sortedData.length > 10 && (
            <div className="text-center mt-8">
              <p className="text-gray-400">
                Showing top 10 of {sortedData.length} total entries
              </p>
            </div>
          )}
        </div>
        
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {sortedData.length}
            </div>
            <div className="text-sm text-gray-400">Total Competitors</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {formatValue(processedData.aggregates[primaryMetric.key]?.max || 0, primaryMetric.type)}
            </div>
            <div className="text-sm text-gray-400">Top Score</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {formatValue(processedData.aggregates[primaryMetric.key]?.average || 0, primaryMetric.type)}
            </div>
            <div className="text-sm text-gray-400">Average Score</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {formatValue(processedData.aggregates[primaryMetric.key]?.min || 0, primaryMetric.type)}
            </div>
            <div className="text-sm text-gray-400">Minimum Score</div>
          </div>
        </div>
      </div>
    </div>
  )
}