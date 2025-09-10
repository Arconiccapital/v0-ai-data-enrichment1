import { DashboardConfig, MetricConfig, ChartConfig, ViewConfig } from './dashboard-types'
import { DollarSign, Users, TrendingUp, Calendar, Building, Globe } from 'lucide-react'

/**
 * Generate a DashboardConfig from simple component array format
 * This bridges the current implementation with the new flexible system
 */

export function generateDashboardConfig(simpleConfig: any): DashboardConfig {
  // Extract data info from the simple config
  const hasTitle = simpleConfig.title || 'Data Dashboard'
  const components = simpleConfig.components || []
  
  // Extract metrics from metric components
  const metrics: MetricConfig[] = []
  const metricComponents = components.filter((c: any) => c.type === 'metric')
  
  // First, try to extract the actual data keys from chart components
  const chartComponents = components.filter((c: any) => c.type === 'chart')
  const usedDataKeys = new Set<string>()
  chartComponents.forEach((comp: any) => {
    if (comp.props?.dataKey) {
      if (Array.isArray(comp.props.dataKey)) {
        comp.props.dataKey.forEach((key: string) => usedDataKeys.add(key))
      } else {
        usedDataKeys.add(comp.props.dataKey)
      }
    }
  })
  
  metricComponents.forEach((comp: any) => {
    const isCurrency = comp.props?.isCurrency || comp.props?.unit === 'USD'
    const isHeadcount = comp.props?.unit === 'Headcount'
    
    // Get the title from the component
    const title = comp.props?.title || 'Metric'
    
    // Try multiple strategies to find the data key
    let dataKey = comp.id || title
    
    // Check if this metric's title matches any chart data keys
    for (const key of usedDataKeys) {
      const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '')
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (normalizedKey === normalizedTitle || 
          normalizedKey.includes(normalizedTitle) ||
          normalizedTitle.includes(normalizedKey)) {
        dataKey = key
        break
      }
    }
    
    // Also use the title as a label since it's more readable
    metrics.push({
      key: dataKey,
      label: title,
      type: isCurrency ? 'currency' : 'number',
      icon: isCurrency ? DollarSign : isHeadcount ? Users : TrendingUp,
      color: comp.props?.color || 'blue',
      unit: comp.props?.unit,
      isCurrency: isCurrency
    })
  })

  // Extract charts
  const charts: ChartConfig[] = []
  
  chartComponents.forEach((comp: any, index: number) => {
    charts.push({
      id: comp.id || `chart-${index}`,
      type: comp.props?.chartType || 'bar',
      title: comp.props?.title || 'Chart',
      dataKey: comp.props?.dataKey || 'value',
      xAxisKey: comp.props?.xAxisKey || 'name',
      color: comp.props?.color,
      valueType: comp.props?.valueType,
      height: 300
    })
  })

  // Extract table data for entity cards
  const tableComponent = components.find((c: any) => c.type === 'table')
  const columns = tableComponent?.props?.columns || []
  
  // Detect primary key (usually first column)
  const primaryKey = columns[0] || 'id'
  
  // Generate views
  const views: ViewConfig[] = [
    {
      id: 'overview',
      name: 'Overview',
      description: 'Complete dashboard view',
      charts: charts.map(c => c.id),
      metrics: metrics.map(m => m.key)
    }
  ]
  
  // If we have many charts, create specialized views
  if (charts.length > 4) {
    views.push({
      id: 'metrics',
      name: 'Metrics',
      description: 'Key performance indicators',
      metrics: metrics.map(m => m.key),
      charts: []
    })
    
    views.push({
      id: 'analytics',
      name: 'Analytics',
      description: 'Charts and trends',
      charts: charts.map(c => c.id),
      metrics: []
    })
  }

  // Build the complete config
  const config: DashboardConfig = {
    title: hasTitle,
    subtitle: `Comprehensive view of your ${columns.length > 0 ? columns.join(', ') : 'data'}`,
    
    dataSchema: {
      primaryKey: primaryKey,
      metrics: metrics,
      dimensions: columns.filter((c: string) => !metrics.find(m => m.key === c))
    },
    
    views: views,
    charts: charts,
    
    entityCard: {
      title: (item) => item[primaryKey] || item.name || 'Entity',
      subtitle: (item) => {
        // Try to find a good subtitle field
        const subtitleFields = ['industry', 'category', 'type', 'location', 'headquarters']
        for (const field of subtitleFields) {
          if (item[field]) return item[field]
        }
        return null
      },
      primaryMetric: metrics[0] ? {
        key: metrics[0].key,
        label: metrics[0].label
      } : undefined,
      secondaryMetrics: metrics.slice(1, 3).map(m => m.key)
    },
    
    layout: {
      type: simpleConfig.layout?.type || 'dashboard',
      columns: simpleConfig.layout?.columns || 3,
      spacing: 'normal'
    },
    
    features: {
      search: true,
      export: true,
      share: false,
      comparison: true,
      drilldown: true
    }
  }
  
  return config
}

/**
 * Generate config directly from data analysis
 */
export function generateConfigFromData(headers: string[], data: any[][]): DashboardConfig {
  const metrics: MetricConfig[] = []
  const charts: ChartConfig[] = []
  
  // Analyze each column
  headers.forEach((header, index) => {
    const columnData = data.map(row => row[index]).filter(Boolean)
    
    // Check if numeric
    const hasNumbers = columnData.some(val => !isNaN(parseFloat(String(val).replace(/[,$]/g, ''))))
    const hasCurrency = columnData.some(val => String(val).includes('$') || String(val).match(/^\d+\.\d{2}$/))
    
    if (hasNumbers && index > 0) { // Skip first column (usually ID/name)
      const icon = header.toLowerCase().includes('revenue') || hasCurrency ? DollarSign :
                   header.toLowerCase().includes('employee') || header.toLowerCase().includes('count') ? Users :
                   header.toLowerCase().includes('year') || header.toLowerCase().includes('date') ? Calendar :
                   header.toLowerCase().includes('location') || header.toLowerCase().includes('headquarters') ? Building :
                   TrendingUp
      
      metrics.push({
        key: header, // Keep original header as key
        label: header,
        type: hasCurrency ? 'currency' : 'number',
        icon: icon,
        color: ['blue', 'green', 'purple', 'orange'][metrics.length % 4],
        isCurrency: hasCurrency
      })
      
      // Create chart for this metric
      if (metrics.length <= 4) {
        charts.push({
          id: `chart-${header.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          type: metrics.length === 1 ? 'bar' : metrics.length === 2 ? 'line' : 'area',
          title: `${header} Analysis`,
          dataKey: header, // Use original header as dataKey
          xAxisKey: 'name',
          valueType: hasCurrency ? 'currency' : 'numeric',
          color: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'][charts.length % 4]
        })
      }
    }
  })
  
  // If we found numeric columns, add a comparison chart
  if (metrics.length >= 2) {
    charts.push({
      id: 'comparison-chart',
      type: 'bar',
      title: 'Comparison',
      dataKey: metrics.map(m => m.key),
      xAxisKey: 'name',
      stacked: false
    })
  }
  
  return {
    title: 'Data Dashboard',
    subtitle: `Analysis of ${data.length} entries across ${headers.length} dimensions`,
    
    dataSchema: {
      primaryKey: headers[0], // Use original header
      metrics: metrics,
      dimensions: headers.filter((h, i) => 
        !metrics.find(m => m.key === h)
      )
    },
    
    views: [
      {
        id: 'overview',
        name: 'Overview',
        charts: charts.map(c => c.id),
        metrics: metrics.map(m => m.key)
      },
      {
        id: 'details',
        name: 'Details',
        charts: charts.slice(0, 2).map(c => c.id),
        metrics: metrics.slice(0, 4).map(m => m.key)
      }
    ],
    
    charts: charts,
    
    entityCard: {
      title: (item) => item[headers[0]] || 'Item',
      subtitle: (item) => {
        // Find first text field that's not the primary key
        for (let i = 1; i < headers.length; i++) {
          const key = headers[i]
          if (!metrics.find(m => m.key === key) && item[key]) {
            return item[key]
          }
        }
        return null
      },
      primaryMetric: metrics[0] ? {
        key: metrics[0].key,
        label: metrics[0].label
      } : undefined,
      secondaryMetrics: metrics.slice(1, 3).map(m => m.key)
    },
    
    layout: {
      type: 'dashboard',
      columns: 3,
      spacing: 'normal'
    },
    
    features: {
      search: true,
      export: true,
      comparison: true,
      drilldown: true
    }
  }
}