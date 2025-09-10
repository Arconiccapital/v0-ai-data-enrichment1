"use client"

import React from 'react'
import { DashboardConfig, DataEntity } from '@/lib/dashboard-types'
import { formatValue, formatCurrency, formatLargeNumber } from '@/lib/data-formatter'
import { processData } from '@/lib/data-processing'

interface ReportViewProps {
  config: DashboardConfig
  data: DataEntity[]
}

export function ReportView({ config, data }: ReportViewProps) {
  const processedData = processData(data, config)
  const metrics = config.dataSchema.metrics
  
  return (
    <div className="min-h-screen bg-white">
      {/* Document Container */}
      <div className="max-w-5xl mx-auto px-8 py-12">
        
        {/* Report Header */}
        <div className="border-b-4 border-gray-800 pb-6 mb-8">
          <h1 className="text-4xl font-serif text-gray-900 mb-2">
            {config.title || 'Business Intelligence Report'}
          </h1>
          <p className="text-lg text-gray-600">
            {config.subtitle || `Comprehensive analysis of ${data.length} records`}
          </p>
          <div className="flex justify-between mt-4 text-sm text-gray-500">
            <span>Generated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
            <span>Records Analyzed: {data.length}</span>
          </div>
        </div>

        {/* Executive Summary Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif mb-6 text-gray-800 border-l-4 border-blue-600 pl-4">
            Executive Summary
          </h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {metrics.slice(0, 3).map(metric => {
                const aggregate = processedData.aggregates[metric.key]
                if (!aggregate) return null
                
                return (
                  <div key={metric.key} className="text-center">
                    <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {metric.type === 'currency' 
                        ? formatCurrency(aggregate.total || 0)
                        : formatLargeNumber(aggregate.total || 0)
                      }
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Avg: {metric.type === 'currency' 
                        ? formatCurrency(aggregate.average || 0)
                        : formatLargeNumber(aggregate.average || 0)
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Key Findings Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif mb-6 text-gray-800 border-l-4 border-blue-600 pl-4">
            Key Findings
          </h2>
          <div className="prose max-w-none">
            <ul className="space-y-3">
              {processedData.insights.slice(0, 5).map((insight, i) => (
                <li key={i} className="text-gray-700">
                  <strong>{insight.title}:</strong> {insight.description}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Data Analysis Table */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif mb-6 text-gray-800 border-l-4 border-blue-600 pl-4">
            Detailed Data Analysis
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-y-2 border-gray-300">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    {config.dataSchema.primaryKey}
                  </th>
                  {metrics.map(metric => (
                    <th key={metric.key} className="text-right px-4 py-3 font-semibold text-gray-700">
                      {metric.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 10).map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3 font-medium text-gray-900 border-b border-gray-200">
                      {item[config.dataSchema.primaryKey]}
                    </td>
                    {metrics.map(metric => (
                      <td key={metric.key} className="text-right px-4 py-3 text-gray-700 border-b border-gray-200">
                        {formatValue(item[metric.key], metric.type)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {/* Table Footer with Totals */}
              <tfoot>
                <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                  <td className="px-4 py-3 text-gray-900">Total</td>
                  {metrics.map(metric => {
                    const aggregate = processedData.aggregates[metric.key]
                    return (
                      <td key={metric.key} className="text-right px-4 py-3 text-gray-900">
                        {metric.type === 'currency' 
                          ? formatCurrency(aggregate?.total || 0)
                          : formatLargeNumber(aggregate?.total || 0)
                        }
                      </td>
                    )
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Statistical Summary */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif mb-6 text-gray-800 border-l-4 border-blue-600 pl-4">
            Statistical Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metrics.map(metric => {
              const aggregate = processedData.aggregates[metric.key]
              if (!aggregate) return null
              
              return (
                <div key={metric.key} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">{metric.label}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Average:</div>
                    <div className="text-right font-medium">
                      {formatValue(aggregate.average, metric.type)}
                    </div>
                    <div className="text-gray-600">Minimum:</div>
                    <div className="text-right font-medium">
                      {formatValue(aggregate.min, metric.type)}
                    </div>
                    <div className="text-gray-600">Maximum:</div>
                    <div className="text-right font-medium">
                      {formatValue(aggregate.max, metric.type)}
                    </div>
                    {aggregate.percentile && (
                      <>
                        <div className="text-gray-600">Median (P50):</div>
                        <div className="text-right font-medium">
                          {formatValue(aggregate.percentile.p50, metric.type)}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Report Footer */}
        <div className="border-t-2 border-gray-300 pt-6 mt-12 text-center text-sm text-gray-500">
          <p>Confidential Report - Generated by AI Analytics System</p>
          <p className="mt-2">© {new Date().getFullYear()} All Rights Reserved</p>
        </div>
      </div>
    </div>
  )
}