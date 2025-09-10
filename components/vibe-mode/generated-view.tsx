"use client"

import { Loader2 } from "lucide-react"
import { DashboardRenderer } from "./dashboard-renderer"
import { FlexibleDashboard } from "./flexible-dashboard"
import { KPIView } from "./views/KPIView"
import { ReportView } from "./views/ReportView"
import { PresentationView } from "./views/PresentationView"
import { RankingView } from "./views/RankingView"
import { generateDashboardConfig, generateConfigFromData } from "@/lib/config-generator"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"

interface GeneratedViewProps {
  config?: any
  isLoading?: boolean
  error?: string
}

export function GeneratedView({ config, isLoading, error }: GeneratedViewProps) {
  const { headers, data } = useSpreadsheetStore()
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Generating your visualization...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Generation Error</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }
  
  if (!config) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Dynamic Canvas
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            I can generate any visualization you imagine. Try these:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700">Dashboard</p>
              <p className="text-xs text-gray-500 mt-1">"Create a KPI dashboard"</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700">Report</p>
              <p className="text-xs text-gray-500 mt-1">"Generate an executive summary"</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700">Visualization</p>
              <p className="text-xs text-gray-500 mt-1">"Show revenue trends"</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700">Analysis</p>
              <p className="text-xs text-gray-500 mt-1">"Analyze top performers"</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Check if config has the new structure (dataSchema property)
  if (config.dataSchema) {
    // New flexible dashboard config
    const entities = data.map((row, index) => {
      const entity: any = { id: index, name: row[0] }
      headers.forEach((header, i) => {
        // Keep BOTH original header name AND normalized key
        entity[header] = row[i]
        const normalizedKey = header.toLowerCase().replace(/[^a-z0-9]/g, '_')
        entity[normalizedKey] = row[i]
      })
      return entity
    })
    
    // Route to appropriate view component based on layout type
    const layoutType = config.layout?.type
    
    switch(layoutType) {
      case 'report':
        return <ReportView config={config} data={entities} />
      case 'presentation':
        return <PresentationView config={config} data={entities} />
      case 'kpi':
        return <KPIView config={config} data={entities} />
      case 'ranking':
      case 'leaderboard':
        return <RankingView config={config} data={entities} />
      case 'dashboard':
      default:
        return <FlexibleDashboard config={config} data={entities} />
    }
  }
  
  // Check if config is in simple format (components array)
  if (config.components) {
    // Try to use flexible dashboard by converting the config
    try {
      const flexConfig = generateDashboardConfig(config)
      const entities = data.map((row, index) => {
        const entity: any = { id: index, name: row[0] }
        headers.forEach((header, i) => {
          // Keep BOTH original header name AND normalized key
          entity[header] = row[i]
          const normalizedKey = header.toLowerCase().replace(/[^a-z0-9]/g, '_')
          entity[normalizedKey] = row[i]
        })
        return entity
      })
      
      return <FlexibleDashboard config={flexConfig} data={entities} />
    } catch (e) {
      // Fallback to original renderer if conversion fails
      return <DashboardRenderer config={config} />
    }
  }
  
  // Fallback: generate config from data
  const flexConfig = generateConfigFromData(headers, data)
  const entities = data.map((row, index) => {
    const entity: any = { id: index, name: row[0] }
    headers.forEach((header, i) => {
      // Keep BOTH original header name AND normalized key
      entity[header] = row[i]
      const normalizedKey = header.toLowerCase().replace(/[^a-z0-9]/g, '_')
      entity[normalizedKey] = row[i]
    })
    return entity
  })
  
  return <FlexibleDashboard config={flexConfig} data={entities} />
}