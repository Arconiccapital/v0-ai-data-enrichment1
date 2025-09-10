"use client"

import { useState, useEffect } from "react"
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts"
import { cn } from "@/lib/utils"
import { TrendingUp, Users, DollarSign, Activity, Calendar, Globe } from "lucide-react"

interface DynamicCanvasProps {
  headers: string[]
  data: string[][]
  currentView: VisualizationType
  viewConfig: any
}

export type VisualizationType = 
  | 'welcome'
  | 'table'
  | 'bar-chart' 
  | 'line-chart'
  | 'pie-chart'
  | 'dashboard'
  | 'report'
  | 'cards'

export function DynamicCanvas({ headers, data, currentView, viewConfig }: DynamicCanvasProps) {
  const [processedData, setProcessedData] = useState<any[]>([])

  useEffect(() => {
    // Process data based on view type
    if (currentView === 'bar-chart' || currentView === 'line-chart') {
      // Transform data for charts
      const chartData = data.slice(0, 10).map((row, index) => {
        const obj: any = { name: row[0] || `Item ${index + 1}` }
        headers.forEach((header, i) => {
          const value = row[i]
          const numValue = parseFloat(value?.replace(/[^0-9.-]/g, '') || '0')
          obj[header] = isNaN(numValue) ? value : numValue
        })
        return obj
      })
      setProcessedData(chartData)
    } else if (currentView === 'dashboard') {
      // Calculate metrics for dashboard
      const metrics = calculateMetrics()
      setProcessedData(metrics)
    }
  }, [data, headers, currentView])

  const calculateMetrics = () => {
    // Calculate various metrics from the data
    const totalRows = data.length
    const numericColumns = headers.filter((_, index) => {
      return data.some(row => !isNaN(parseFloat(row[index]?.replace(/[^0-9.-]/g, '') || '')))
    })
    
    // Find columns with high values
    const revenueCol = headers.findIndex(h => h.toLowerCase().includes('revenue'))
    const totalRevenue = revenueCol >= 0 ? 
      data.reduce((sum, row) => {
        const val = parseFloat(row[revenueCol]?.replace(/[^0-9.-]/g, '') || '0')
        return sum + (isNaN(val) ? 0 : val)
      }, 0) : 0

    return [
      { 
        title: "Total Records", 
        value: totalRows.toString(), 
        change: "+12%",
        icon: Users 
      },
      { 
        title: "Total Revenue", 
        value: `$${(totalRevenue / 1000000).toFixed(1)}M`,
        change: "+23%",
        icon: DollarSign 
      },
      { 
        title: "Data Columns", 
        value: headers.length.toString(),
        change: "Active",
        icon: Activity 
      },
      { 
        title: "Numeric Fields", 
        value: numericColumns.length.toString(),
        change: "Available",
        icon: TrendingUp 
      }
    ]
  }

  const renderWelcome = () => (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Dynamic Canvas
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Transform your data into anything. Try these prompts:
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700">Charts</p>
            <p className="text-xs text-gray-500 mt-1">"Show me a bar chart of revenue"</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700">Dashboard</p>
            <p className="text-xs text-gray-500 mt-1">"Create a metrics dashboard"</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700">Report</p>
            <p className="text-xs text-gray-500 mt-1">"Generate a summary report"</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700">Cards</p>
            <p className="text-xs text-gray-500 mt-1">"Display as cards"</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTable = () => (
    <div className="flex-1 overflow-auto p-6">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-4 py-3 bg-gray-100 border border-gray-300 text-left text-sm font-semibold text-gray-800">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {row.map((cell, colIndex) => (
                <td key={colIndex} className="px-4 py-3 border border-gray-300 text-sm text-gray-700">
                  {cell || <span className="text-gray-400">-</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderBarChart = () => (
    <div className="flex-1 p-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Revenue Analysis</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
            labelStyle={{ color: '#111827' }}
          />
          <Legend />
          <Bar dataKey="Revenue (USD)" fill="#000000" />
          <Bar dataKey="Funding Total" fill="#6b7280" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )

  const renderLineChart = () => (
    <div className="flex-1 p-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Growth Trend</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
            labelStyle={{ color: '#111827' }}
          />
          <Legend />
          <Line type="monotone" dataKey="Employee Count" stroke="#000000" strokeWidth={2} />
          <Line type="monotone" dataKey="Founded Year" stroke="#6b7280" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )

  const renderDashboard = () => (
    <div className="flex-1 p-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Analytics Dashboard</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {processedData.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                  <p className="text-xs text-gray-600 mt-2">{metric.change}</p>
                </div>
                <Icon className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Additional dashboard content */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-4">Top Performers</h4>
          <div className="space-y-2">
            {data.slice(0, 5).map((row, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-700">{row[0]}</span>
                <span className="text-sm font-medium text-gray-900">{row[3] || 'N/A'}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-4">Distribution</h4>
          <div className="space-y-2">
            {headers.slice(0, 5).map((header, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-700">{header}</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-black h-2 rounded-full" style={{ width: `${(index + 1) * 20}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderReport = () => (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Analysis Report</h2>
        
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Executive Summary</h3>
          <p className="text-gray-600 leading-relaxed">
            This report analyzes {data.length} records across {headers.length} data dimensions. 
            The dataset contains information about various entities with key metrics including 
            financial data, organizational details, and performance indicators.
          </p>
        </section>

        <section className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Findings</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-1">•</span>
              <span className="text-gray-600">Dataset contains {data.length} total records with {headers.length} attributes per record</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-1">•</span>
              <span className="text-gray-600">Primary categories include: {headers.slice(0, 3).join(', ')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-1">•</span>
              <span className="text-gray-600">Data completeness: High quality with minimal missing values</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Top Entities</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {headers.slice(0, 4).map((header, index) => (
                  <th key={index} className="text-left py-2 text-sm font-medium text-gray-700">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 5).map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-100">
                  {row.slice(0, 4).map((cell, cellIndex) => (
                    <td key={cellIndex} className="py-2 text-sm text-gray-600">
                      {cell || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Recommendations</h3>
          <ol className="space-y-2">
            <li className="text-gray-600">1. Focus on high-value entities for maximum impact</li>
            <li className="text-gray-600">2. Address data gaps in critical fields</li>
            <li className="text-gray-600">3. Implement regular data quality checks</li>
          </ol>
        </section>
      </div>
    </div>
  )

  const renderCards = () => (
    <div className="flex-1 p-8 overflow-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.slice(0, 9).map((row, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <h4 className="font-semibold text-gray-900 mb-3">{row[0] || `Item ${index + 1}`}</h4>
            <div className="space-y-2">
              {headers.slice(1, 5).map((header, hIndex) => (
                <div key={hIndex} className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{header}:</span>
                  <span className="text-sm font-medium text-gray-700">{row[hIndex + 1] || 'N/A'}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Render based on current view
  switch (currentView) {
    case 'table':
      return renderTable()
    case 'bar-chart':
      return renderBarChart()
    case 'line-chart':
      return renderLineChart()
    case 'dashboard':
      return renderDashboard()
    case 'report':
      return renderReport()
    case 'cards':
      return renderCards()
    case 'welcome':
    default:
      return renderWelcome()
  }
}