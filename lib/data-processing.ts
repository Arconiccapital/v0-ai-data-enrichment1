import {
  DataEntity,
  MetricConfig,
  ChartConfig,
  ProcessedData,
  AggregateData,
  ChartData,
  Insight,
  FilterOption,
  MetricType,
  DashboardConfig
} from './dashboard-types'

/**
 * Data Processing Pipeline
 * Transform raw data into dashboard-ready format
 */

// ============ Main Processing Function ============

export function processData(
  rawData: DataEntity[],
  config: DashboardConfig
): ProcessedData {
  const aggregates = calculateAggregates(rawData, config.dataSchema.metrics)
  const chartData = transformForCharts(rawData, config.charts, config.dataSchema.metrics)
  const insights = generateInsights(rawData, config.dataSchema.metrics, aggregates)
  const filters = extractFilterOptions(rawData, config.filters || [])

  return {
    entities: rawData,
    aggregates,
    chartData,
    insights,
    filters
  }
}

// ============ Aggregation Functions ============

export function calculateAggregates(
  data: DataEntity[],
  metrics: MetricConfig[]
): AggregateData {
  const aggregates: AggregateData = {}

  metrics.forEach(metric => {
    // Enhanced value finding with multiple strategies
    const values = data
      .map(item => {
        // Try exact key match first
        let value = item[metric.key]
        
        // Try with label if key doesn't work
        if (value === undefined || value === null) {
          value = item[metric.label]
        }
        
        // Try with spaces instead of underscores
        if (value === undefined || value === null) {
          const spaceKey = metric.key.replace(/_/g, ' ')
          value = item[spaceKey]
        }
        
        // Try normalized key
        if (value === undefined || value === null) {
          const normalizedKey = metric.key.toLowerCase().replace(/[^a-z0-9]/g, '_')
          value = item[normalizedKey]
        }
        
        // Try case-insensitive match
        if (value === undefined || value === null) {
          const keys = Object.keys(item)
          const exactMatch = keys.find(k => k.toLowerCase() === metric.key.toLowerCase())
          if (exactMatch) {
            value = item[exactMatch]
          }
        }
        
        // Try partial match
        if (value === undefined || value === null) {
          const keys = Object.keys(item)
          const matchingKey = keys.find(k => {
            const kLower = k.toLowerCase().replace(/[^a-z0-9]/g, '')
            const keyLower = metric.key.toLowerCase().replace(/[^a-z0-9]/g, '')
            return kLower.includes(keyLower) || keyLower.includes(kLower)
          })
          if (matchingKey) {
            value = item[matchingKey]
          }
        }
        
        return parseValue(value, metric.type)
      })
      .filter(val => val !== null && val !== undefined && !isNaN(Number(val)))
      .map(Number)

    if (values.length === 0) {
      aggregates[metric.key] = { count: 0 }
      return
    }

    const sorted = [...values].sort((a, b) => a - b)
    const sum = values.reduce((acc, val) => acc + val, 0)

    aggregates[metric.key] = {
      total: sum,
      average: sum / values.length,
      max: Math.max(...values),
      min: Math.min(...values),
      count: values.length,
      percentile: {
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p90: sorted[Math.floor(sorted.length * 0.9)],
        p99: sorted[Math.floor(sorted.length * 0.99)]
      }
    }

    // Calculate growth if there's a time dimension
    if (data.length >= 2) {
      const firstValue = parseValue(data[0][metric.key], metric.type)
      const lastValue = parseValue(data[data.length - 1][metric.key], metric.type)
      if (firstValue && lastValue) {
        aggregates[metric.key].growth = ((Number(lastValue) - Number(firstValue)) / Number(firstValue)) * 100
      }
    }
  })

  return aggregates
}

// ============ Chart Data Transformation ============

export function transformForCharts(
  data: DataEntity[],
  charts: ChartConfig[],
  metrics: MetricConfig[]
): ChartData {
  const chartData: ChartData = {}

  charts.forEach(chart => {
    switch (chart.type) {
      case 'bar':
      case 'line':
      case 'area':
        chartData[chart.id] = transformTimeSeriesData(data, chart, metrics)
        break
      
      case 'pie':
        chartData[chart.id] = transformPieData(data, chart, metrics)
        break
      
      case 'scatter':
      case 'bubble':
        chartData[chart.id] = transformScatterData(data, chart, metrics)
        break
      
      default:
        chartData[chart.id] = data
    }

    // Apply custom transform if provided
    if (chart.dataTransform) {
      chartData[chart.id] = chart.dataTransform(chartData[chart.id])
    }
  })

  return chartData
}

function transformTimeSeriesData(
  data: DataEntity[],
  chart: ChartConfig,
  metrics: MetricConfig[]
): any[] {
  // Filter out invalid data
  const validData = data.filter(item => item && typeof item === 'object')
  if (validData.length === 0) return []

  return validData.map(item => {
    // Get the name/label for x-axis
    const xKey = chart.xAxisKey || 'name'
    const firstNonIdKey = Object.keys(item).find(k => k !== 'id')
    const xValue = item[xKey] || item.name || (firstNonIdKey ? item[firstNonIdKey] : null) || 'Item'
    
    const transformed: any = {
      name: xValue
    }

    // Helper function to find value with multiple fallback strategies
    const findValue = (key: string) => {
      // Direct match
      if (item[key] !== undefined && item[key] !== null) return item[key]
      
      // Try with spaces instead of underscores
      const spaceKey = key.replace(/_/g, ' ')
      if (item[spaceKey] !== undefined && item[spaceKey] !== null) return item[spaceKey]
      
      // Try normalized key
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '_')
      if (item[normalizedKey] !== undefined && item[normalizedKey] !== null) return item[normalizedKey]
      
      // Try case-insensitive exact match
      const keys = Object.keys(item)
      const exactMatch = keys.find(k => k.toLowerCase() === key.toLowerCase())
      if (exactMatch && item[exactMatch] !== undefined && item[exactMatch] !== null) {
        return item[exactMatch]
      }
      
      // Try partial match
      const partialMatch = keys.find(k => {
        const kLower = k.toLowerCase().replace(/[^a-z0-9]/g, '')
        const keyLower = key.toLowerCase().replace(/[^a-z0-9]/g, '')
        return kLower.includes(keyLower) || keyLower.includes(kLower)
      })
      if (partialMatch && item[partialMatch] !== undefined && item[partialMatch] !== null) {
        return item[partialMatch]
      }
      
      return null
    }

    // Handle multiple data keys
    if (Array.isArray(chart.dataKey)) {
      chart.dataKey.forEach(key => {
        const value = findValue(key)
        const metric = metrics.find(m => m.key === key || m.label === key)
        const parsed = parseValue(value, metric?.type || 'number')
        transformed[key] = parsed !== null ? parsed : 0
      })
    } else {
      const value = findValue(chart.dataKey)
      const metric = metrics.find(m => m.key === chart.dataKey || m.label === chart.dataKey)
      const parsed = parseValue(value, metric?.type || 'number')
      transformed[chart.dataKey] = parsed !== null ? parsed : 0
    }

    return transformed
  })
}

function transformPieData(
  data: DataEntity[],
  chart: ChartConfig,
  metrics: MetricConfig[]
): any[] {
  const dataKey = Array.isArray(chart.dataKey) ? chart.dataKey[0] : chart.dataKey
  const metric = metrics.find(m => m.key === dataKey || m.label === dataKey)
  
  const validData = data.filter(item => item && typeof item === 'object')
  if (validData.length === 0) return []

  return validData.map(item => {
    // Find the name value
    const xKey = chart.xAxisKey || 'name'
    const firstNonIdKey = Object.keys(item).find(k => k !== 'id')
    const name = item[xKey] || item.name || (firstNonIdKey ? item[firstNonIdKey] : null) || 'Item'
    
    // Find the data value with multiple strategies
    let value = item[dataKey]
    if (value === undefined || value === null) {
      // Try normalized key
      const normalizedKey = dataKey.toLowerCase().replace(/[^a-z0-9]/g, '_')
      value = item[normalizedKey]
    }
    if (value === undefined || value === null) {
      // Try case-insensitive match
      const keys = Object.keys(item)
      const matchingKey = keys.find(k => k.toLowerCase() === dataKey.toLowerCase())
      if (matchingKey) value = item[matchingKey]
    }
    
    const parsedValue = parseValue(value, metric?.type || 'number')
    
    return {
      name: name,
      value: parsedValue !== null ? parsedValue : 0
    }
  }).filter(item => item.value > 0) // Filter out zero values for pie charts
}

function transformScatterData(
  data: DataEntity[],
  chart: ChartConfig,
  metrics: MetricConfig[]
): any[] {
  const xKey = chart.xAxisKey || 'x'
  const yKey = chart.yAxisKey || 'y'
  
  return data.map(item => ({
    x: parseValue(item[xKey], 'number'),
    y: parseValue(item[yKey], 'number'),
    name: item.name || 'Data Point'
  }))
}

// ============ Insight Generation ============

export function generateInsights(
  data: DataEntity[],
  metrics: MetricConfig[],
  aggregates: AggregateData
): Insight[] {
  const insights: Insight[] = []

  // Find top performers for each metric
  metrics.forEach(metric => {
    if (metric.type === 'number' || metric.type === 'currency') {
      const sorted = [...data].sort((a, b) => {
        const aVal = parseValue(a[metric.key], metric.type) || 0
        const bVal = parseValue(b[metric.key], metric.type) || 0
        return Number(bVal) - Number(aVal)
      })

      if (sorted.length > 0) {
        const topEntity = sorted[0]
        const topValue = parseValue(topEntity[metric.key], metric.type)
        
        insights.push({
          type: 'top',
          title: `Top ${metric.label}`,
          description: `${topEntity.name} leads with ${formatMetricValue(topValue, metric)}`,
          value: topValue,
          entities: [topEntity],
          metric: metric.key,
          severity: 'success'
        })
      }

      // Find outliers (values > 2 standard deviations)
      const agg = aggregates[metric.key]
      if (agg && agg.average) {
        const stdDev = calculateStandardDeviation(
          data.map(d => Number(parseValue(d[metric.key], metric.type) || 0))
        )
        
        const outliers = data.filter(item => {
          const value = Number(parseValue(item[metric.key], metric.type) || 0)
          return Math.abs(value - agg.average!) > 2 * stdDev
        })

        if (outliers.length > 0) {
          insights.push({
            type: 'anomaly',
            title: `Outliers in ${metric.label}`,
            description: `${outliers.length} entities show unusual ${metric.label.toLowerCase()} values`,
            entities: outliers,
            metric: metric.key,
            severity: 'warning'
          })
        }
      }
    }
  })

  // Generate comparisons between top entities
  if (data.length >= 2) {
    const revenueMetric = metrics.find(m => 
      m.key.toLowerCase().includes('revenue') || 
      m.key.toLowerCase().includes('sales')
    )
    
    if (revenueMetric) {
      const sorted = [...data].sort((a, b) => {
        const aVal = parseValue(a[revenueMetric.key], revenueMetric.type) || 0
        const bVal = parseValue(b[revenueMetric.key], revenueMetric.type) || 0
        return Number(bVal) - Number(aVal)
      })

      if (sorted.length >= 2) {
        const first = sorted[0]
        const second = sorted[1]
        const firstVal = Number(parseValue(first[revenueMetric.key], revenueMetric.type) || 0)
        const secondVal = Number(parseValue(second[revenueMetric.key], revenueMetric.type) || 0)
        
        if (secondVal > 0) {
          const ratio = (firstVal / secondVal).toFixed(1)
          insights.push({
            type: 'comparison',
            title: 'Market Leader',
            description: `${first.name} has ${ratio}x the ${revenueMetric.label.toLowerCase()} of ${second.name}`,
            value: ratio,
            entities: [first, second],
            severity: 'info'
          })
        }
      }
    }
  }

  // Detect trends if we have growth data
  Object.entries(aggregates).forEach(([key, agg]) => {
    if (agg.growth) {
      const metric = metrics.find(m => m.key === key)
      if (metric) {
        const trend = agg.growth > 0 ? 'increased' : 'decreased'
        insights.push({
          type: 'trend',
          title: `${metric.label} Trend`,
          description: `${metric.label} has ${trend} by ${Math.abs(agg.growth).toFixed(1)}%`,
          value: agg.growth,
          metric: key,
          severity: agg.growth > 0 ? 'success' : 'warning'
        })
      }
    }
  })

  return insights
}

// ============ Filter Extraction ============

export function extractFilterOptions(
  data: DataEntity[],
  filterConfigs: any[]
): FilterOption[] {
  const filters: FilterOption[] = []

  // Extract unique values for each filterable field
  const allKeys = new Set<string>()
  data.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key))
  })

  allKeys.forEach(key => {
    const values = [...new Set(data.map(item => item[key]).filter(Boolean))]
    const type = detectType(values)
    
    filters.push({
      key,
      values,
      type
    })
  })

  return filters
}

// ============ Utility Functions ============

export function parseValue(value: any, type: MetricType): any {
  if (value === null || value === undefined) return null

  switch (type) {
    case 'number':
    case 'currency':
      const num = typeof value === 'string' 
        ? parseFloat(value.replace(/[,$]/g, ''))
        : Number(value)
      return isNaN(num) ? null : num
    
    case 'percentage':
      const pct = typeof value === 'string'
        ? parseFloat(value.replace('%', ''))
        : Number(value)
      return isNaN(pct) ? null : pct
    
    case 'date':
      return new Date(value)
    
    case 'boolean':
      return Boolean(value)
    
    default:
      return value
  }
}

export function formatMetricValue(value: any, metric: MetricConfig): string {
  if (metric.format) {
    return metric.format(value)
  }

  switch (metric.type) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    
    case 'percentage':
      return `${value.toFixed(1)}%`
    
    case 'number':
      return new Intl.NumberFormat('en-US').format(value)
    
    default:
      return String(value)
  }
}

export function detectType(values: any[]): MetricType {
  if (values.length === 0) return 'text'

  // Check if all values are numbers
  const allNumbers = values.every(v => !isNaN(Number(v)))
  if (allNumbers) return 'number'

  // Check for dates
  const allDates = values.every(v => !isNaN(Date.parse(v)))
  if (allDates) return 'date'

  // Check for booleans
  const allBooleans = values.every(v => 
    typeof v === 'boolean' || v === 'true' || v === 'false'
  )
  if (allBooleans) return 'boolean'

  // Check for URLs
  const allUrls = values.every(v => 
    typeof v === 'string' && (v.startsWith('http://') || v.startsWith('https://'))
  )
  if (allUrls) return 'url'

  // Check for emails
  const allEmails = values.every(v => 
    typeof v === 'string' && v.includes('@')
  )
  if (allEmails) return 'email'

  return 'text'
}

export function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  return Math.sqrt(variance)
}

// ============ Data Filtering ============

export function applyFilters(
  data: DataEntity[],
  filters: Record<string, any>
): DataEntity[] {
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true
      
      const itemValue = item[key]
      
      // Handle array filters (multi-select)
      if (Array.isArray(value)) {
        return value.includes(itemValue)
      }
      
      // Handle range filters
      if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
        const numValue = Number(itemValue)
        return numValue >= value.min && numValue <= value.max
      }
      
      // Handle search filters
      if (typeof value === 'string' && typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(value.toLowerCase())
      }
      
      return itemValue === value
    })
  })
}

// ============ Data Sorting ============

export function sortData(
  data: DataEntity[],
  sortBy: { key: string; direction: 'asc' | 'desc' }
): DataEntity[] {
  return [...data].sort((a, b) => {
    const aVal = a[sortBy.key]
    const bVal = b[sortBy.key]
    
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1
    
    const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
    return sortBy.direction === 'asc' ? comparison : -comparison
  })
}