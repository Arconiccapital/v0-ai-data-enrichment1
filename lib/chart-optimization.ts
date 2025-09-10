/**
 * Chart optimization utilities for handling large datasets
 * Implements data decimation and aggregation strategies for performant charts
 */

export interface ChartOptimizationOptions {
  maxDataPoints?: number
  aggregationMethod?: 'average' | 'sum' | 'min' | 'max' | 'first' | 'last'
  decimationAlgorithm?: 'lttb' | 'nth' | 'minmax' | 'average'
  groupBy?: 'auto' | 'day' | 'week' | 'month' | 'year' | number
}

export interface OptimizedChartData {
  data: any[]
  originalSize: number
  optimizedSize: number
  aggregationApplied: boolean
  decimationApplied: boolean
  method: string
}

/**
 * Optimize chart data for rendering performance
 */
export function optimizeChartData(
  data: any[],
  xKey: string,
  yKey: string | string[],
  options: ChartOptimizationOptions = {}
): OptimizedChartData {
  const {
    maxDataPoints = 500,
    aggregationMethod = 'average',
    decimationAlgorithm = 'lttb',
    groupBy = 'auto'
  } = options

  const originalSize = data.length

  // If data is small enough, return as-is
  if (originalSize <= maxDataPoints) {
    return {
      data,
      originalSize,
      optimizedSize: originalSize,
      aggregationApplied: false,
      decimationApplied: false,
      method: 'none'
    }
  }

  // Check if x-axis is time-based for aggregation
  const isTimeSeries = isTimeBasedData(data, xKey)
  
  if (isTimeSeries && groupBy !== 'auto') {
    // Apply time-based aggregation
    const aggregated = aggregateTimeSeries(data, xKey, yKey, groupBy as any, aggregationMethod)
    
    if (aggregated.length <= maxDataPoints) {
      return {
        data: aggregated,
        originalSize,
        optimizedSize: aggregated.length,
        aggregationApplied: true,
        decimationApplied: false,
        method: `time-aggregation-${groupBy}`
      }
    }
    
    // If still too many points, apply decimation
    data = aggregated
  }

  // Apply decimation algorithm
  let decimated: any[]
  
  switch (decimationAlgorithm) {
    case 'lttb':
      decimated = largestTriangleThreeBuckets(data, xKey, yKey, maxDataPoints)
      break
    case 'minmax':
      decimated = minMaxDecimation(data, xKey, yKey, maxDataPoints)
      break
    case 'average':
      decimated = averageDecimation(data, xKey, yKey, maxDataPoints, aggregationMethod)
      break
    case 'nth':
    default:
      decimated = nthPointDecimation(data, maxDataPoints)
      break
  }

  return {
    data: decimated,
    originalSize,
    optimizedSize: decimated.length,
    aggregationApplied: isTimeSeries && groupBy !== 'auto',
    decimationApplied: true,
    method: decimationAlgorithm
  }
}

/**
 * Largest Triangle Three Buckets (LTTB) decimation
 * Preserves visual characteristics of the data
 */
function largestTriangleThreeBuckets(
  data: any[],
  xKey: string,
  yKey: string | string[],
  threshold: number
): any[] {
  if (data.length <= threshold) return data
  
  const yKeys = Array.isArray(yKey) ? yKey : [yKey]
  const firstYKey = yKeys[0]
  
  // Convert data to points
  const points = data.map((d, i) => ({
    x: i,
    y: parseFloat(d[firstYKey]) || 0,
    data: d
  }))
  
  const bucketSize = (data.length - 2) / (threshold - 2)
  const sampled = []
  
  // Always keep first point
  sampled.push(data[0])
  
  let a = 0 // First point in triangle
  for (let i = 1; i < threshold - 1; i++) {
    // Calculate bucket boundaries
    const bucketStart = Math.floor((i - 1) * bucketSize) + 1
    const bucketEnd = Math.floor(i * bucketSize) + 1
    
    // Get average point of next bucket for triangle calculation
    const nextBucketStart = Math.floor(i * bucketSize) + 1
    const nextBucketEnd = Math.floor((i + 1) * bucketSize) + 1
    
    let avgX = 0
    let avgY = 0
    let nextBucketLength = 0
    
    for (let j = nextBucketStart; j < nextBucketEnd && j < points.length; j++) {
      avgX += points[j].x
      avgY += points[j].y
      nextBucketLength++
    }
    
    if (nextBucketLength > 0) {
      avgX /= nextBucketLength
      avgY /= nextBucketLength
    }
    
    // Find point in current bucket with largest triangle area
    let maxArea = -1
    let maxAreaPoint = -1
    
    for (let j = bucketStart; j < bucketEnd && j < points.length; j++) {
      // Calculate triangle area
      const area = Math.abs(
        (points[a].x - avgX) * (points[j].y - points[a].y) -
        (points[a].x - points[j].x) * (avgY - points[a].y)
      ) * 0.5
      
      if (area > maxArea) {
        maxArea = area
        maxAreaPoint = j
      }
    }
    
    if (maxAreaPoint !== -1) {
      sampled.push(points[maxAreaPoint].data)
      a = maxAreaPoint
    }
  }
  
  // Always keep last point
  sampled.push(data[data.length - 1])
  
  return sampled
}

/**
 * Min/Max decimation - preserves extremes in each bucket
 */
function minMaxDecimation(
  data: any[],
  xKey: string,
  yKey: string | string[],
  maxPoints: number
): any[] {
  const yKeys = Array.isArray(yKey) ? yKey : [yKey]
  const firstYKey = yKeys[0]
  const bucketSize = Math.ceil(data.length / (maxPoints / 2))
  const result = []
  
  for (let i = 0; i < data.length; i += bucketSize) {
    const bucket = data.slice(i, i + bucketSize)
    if (bucket.length === 0) continue
    
    // Find min and max in bucket
    let min = bucket[0]
    let max = bucket[0]
    
    for (const item of bucket) {
      const value = parseFloat(item[firstYKey]) || 0
      if (value < (parseFloat(min[firstYKey]) || 0)) min = item
      if (value > (parseFloat(max[firstYKey]) || 0)) max = item
    }
    
    // Add both min and max to preserve shape
    if (min !== max) {
      result.push(min)
      result.push(max)
    } else {
      result.push(min)
    }
  }
  
  return result
}

/**
 * Average decimation - averages values in each bucket
 */
function averageDecimation(
  data: any[],
  xKey: string,
  yKey: string | string[],
  maxPoints: number,
  method: 'average' | 'sum' | 'min' | 'max' | 'first' | 'last'
): any[] {
  const yKeys = Array.isArray(yKey) ? yKey : [yKey]
  const bucketSize = Math.ceil(data.length / maxPoints)
  const result = []
  
  for (let i = 0; i < data.length; i += bucketSize) {
    const bucket = data.slice(i, i + bucketSize)
    if (bucket.length === 0) continue
    
    const aggregated: any = { ...bucket[0] }
    
    // Aggregate each y-key
    for (const key of yKeys) {
      const values = bucket.map(item => parseFloat(item[key]) || 0)
      
      switch (method) {
        case 'sum':
          aggregated[key] = values.reduce((a, b) => a + b, 0)
          break
        case 'min':
          aggregated[key] = Math.min(...values)
          break
        case 'max':
          aggregated[key] = Math.max(...values)
          break
        case 'first':
          aggregated[key] = bucket[0][key]
          break
        case 'last':
          aggregated[key] = bucket[bucket.length - 1][key]
          break
        case 'average':
        default:
          aggregated[key] = values.reduce((a, b) => a + b, 0) / values.length
          break
      }
    }
    
    result.push(aggregated)
  }
  
  return result
}

/**
 * Nth point decimation - simple sampling every Nth point
 */
function nthPointDecimation(data: any[], maxPoints: number): any[] {
  const step = Math.ceil(data.length / maxPoints)
  const result = []
  
  for (let i = 0; i < data.length; i += step) {
    result.push(data[i])
  }
  
  // Always include last point
  if (result[result.length - 1] !== data[data.length - 1]) {
    result.push(data[data.length - 1])
  }
  
  return result
}

/**
 * Check if data is time-based
 */
function isTimeBasedData(data: any[], xKey: string): boolean {
  if (data.length === 0) return false
  
  // Check first few values
  const sample = data.slice(0, Math.min(5, data.length))
  
  return sample.every(item => {
    const value = item[xKey]
    if (!value) return false
    
    // Check if it's a valid date
    const date = new Date(value)
    return date instanceof Date && !isNaN(date.getTime())
  })
}

/**
 * Aggregate time series data
 */
function aggregateTimeSeries(
  data: any[],
  xKey: string,
  yKey: string | string[],
  groupBy: 'day' | 'week' | 'month' | 'year',
  method: 'average' | 'sum' | 'min' | 'max' | 'first' | 'last'
): any[] {
  const yKeys = Array.isArray(yKey) ? yKey : [yKey]
  const groups = new Map<string, any[]>()
  
  // Group data by time period
  for (const item of data) {
    const date = new Date(item[xKey])
    const groupKey = getTimeGroupKey(date, groupBy)
    
    if (!groups.has(groupKey)) {
      groups.set(groupKey, [])
    }
    groups.get(groupKey)!.push(item)
  }
  
  // Aggregate each group
  const result = []
  
  for (const [groupKey, items] of groups) {
    const aggregated: any = {
      [xKey]: groupKey,
      _count: items.length
    }
    
    // Aggregate each y-key
    for (const key of yKeys) {
      const values = items.map(item => parseFloat(item[key]) || 0)
      
      switch (method) {
        case 'sum':
          aggregated[key] = values.reduce((a, b) => a + b, 0)
          break
        case 'min':
          aggregated[key] = Math.min(...values)
          break
        case 'max':
          aggregated[key] = Math.max(...values)
          break
        case 'first':
          aggregated[key] = items[0][key]
          break
        case 'last':
          aggregated[key] = items[items.length - 1][key]
          break
        case 'average':
        default:
          aggregated[key] = values.reduce((a, b) => a + b, 0) / values.length
          break
      }
    }
    
    result.push(aggregated)
  }
  
  // Sort by date
  result.sort((a, b) => new Date(a[xKey]).getTime() - new Date(b[xKey]).getTime())
  
  return result
}

/**
 * Get time group key for aggregation
 */
function getTimeGroupKey(date: Date, groupBy: 'day' | 'week' | 'month' | 'year'): string {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  
  switch (groupBy) {
    case 'year':
      return `${year}`
    case 'month':
      return `${year}-${String(month + 1).padStart(2, '0')}`
    case 'week':
      const weekNumber = getWeekNumber(date)
      return `${year}-W${String(weekNumber).padStart(2, '0')}`
    case 'day':
    default:
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }
}

/**
 * Get ISO week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

/**
 * Determine optimal decimation strategy based on data characteristics
 */
export function getOptimalStrategy(
  data: any[],
  xKey: string,
  chartType: 'line' | 'bar' | 'area' | 'scatter'
): ChartOptimizationOptions {
  const dataSize = data.length
  const isTimeSeries = isTimeBasedData(data, xKey)
  
  // For small datasets, no optimization needed
  if (dataSize <= 500) {
    return { maxDataPoints: dataSize }
  }
  
  // For time series data
  if (isTimeSeries) {
    if (dataSize > 10000) {
      return {
        maxDataPoints: 500,
        groupBy: 'month',
        aggregationMethod: 'average',
        decimationAlgorithm: 'lttb'
      }
    } else if (dataSize > 5000) {
      return {
        maxDataPoints: 500,
        groupBy: 'week',
        aggregationMethod: 'average',
        decimationAlgorithm: 'lttb'
      }
    } else {
      return {
        maxDataPoints: 500,
        groupBy: 'day',
        aggregationMethod: 'average',
        decimationAlgorithm: 'lttb'
      }
    }
  }
  
  // For non-time series data
  switch (chartType) {
    case 'scatter':
      // Scatter plots can handle more points
      return {
        maxDataPoints: 1000,
        decimationAlgorithm: 'nth'
      }
    case 'bar':
      // Bar charts need fewer points for readability
      return {
        maxDataPoints: 100,
        decimationAlgorithm: 'average',
        aggregationMethod: 'sum'
      }
    case 'line':
    case 'area':
    default:
      // Line/area charts work well with LTTB
      return {
        maxDataPoints: 500,
        decimationAlgorithm: 'lttb'
      }
  }
}