/**
 * Data sampling utilities for handling large datasets
 * Intelligently samples data to maintain performance while preserving insights
 */

export interface SamplingOptions {
  maxRows?: number
  strategy?: 'random' | 'stratified' | 'systematic' | 'first' | 'smart'
  preserveHeaders?: boolean
  seed?: number
}

export interface SampledData<T = any> {
  samples: T[]
  totalRows: number
  sampleSize: number
  strategy: string
  aggregates?: DataAggregates
}

export interface DataAggregates {
  rowCount: number
  columnStats: ColumnStats[]
  numericalSummary?: NumericalSummary
}

export interface ColumnStats {
  columnName: string
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'mixed'
  uniqueValues: number
  nullCount: number
  topValues?: Array<{ value: any; count: number }>
}

export interface NumericalSummary {
  [columnName: string]: {
    min: number
    max: number
    mean: number
    median: number
    sum: number
    stdDev: number
  }
}

/**
 * Sample data for API calls to prevent token/payload limits
 */
export function sampleDataForAPI<T = any[]>(
  data: T[],
  headers: string[],
  options: SamplingOptions = {}
): SampledData<T> {
  const {
    maxRows = 500,
    strategy = 'smart',
    preserveHeaders = true,
    seed = Date.now()
  } = options

  const totalRows = data.length

  // If data is small enough, return all
  if (totalRows <= maxRows) {
    return {
      samples: data,
      totalRows,
      sampleSize: totalRows,
      strategy: 'full',
      aggregates: computeAggregates(data, headers)
    }
  }

  let samples: T[] = []

  switch (strategy) {
    case 'first':
      samples = data.slice(0, maxRows)
      break

    case 'random':
      samples = randomSample(data, maxRows, seed)
      break

    case 'systematic':
      samples = systematicSample(data, maxRows)
      break

    case 'stratified':
      samples = stratifiedSample(data, headers, maxRows)
      break

    case 'smart':
    default:
      samples = smartSample(data, headers, maxRows)
      break
  }

  return {
    samples,
    totalRows,
    sampleSize: samples.length,
    strategy,
    aggregates: computeAggregates(data, headers)
  }
}

/**
 * Random sampling with seed for reproducibility
 */
function randomSample<T>(data: T[], sampleSize: number, seed: number): T[] {
  const rng = seedRandom(seed)
  const indices = new Set<number>()
  
  while (indices.size < sampleSize && indices.size < data.length) {
    indices.add(Math.floor(rng() * data.length))
  }
  
  return Array.from(indices).map(i => data[i])
}

/**
 * Systematic sampling - take every Nth row
 */
function systematicSample<T>(data: T[], sampleSize: number): T[] {
  const interval = Math.floor(data.length / sampleSize)
  const samples: T[] = []
  
  for (let i = 0; i < data.length && samples.length < sampleSize; i += interval) {
    samples.push(data[i])
  }
  
  return samples
}

/**
 * Stratified sampling - ensure representation across data ranges
 */
function stratifiedSample<T = any[]>(
  data: T[],
  headers: string[],
  sampleSize: number
): T[] {
  // Find a numeric column to stratify by
  const numericColumnIndex = findNumericColumn(data, headers)
  
  if (numericColumnIndex === -1) {
    // Fallback to systematic sampling if no numeric column
    return systematicSample(data, sampleSize)
  }
  
  // Sort by the numeric column
  const sorted = [...data].sort((a: any, b: any) => {
    const aVal = parseFloat(a[numericColumnIndex])
    const bVal = parseFloat(b[numericColumnIndex])
    return aVal - bVal
  })
  
  // Take samples from different strata
  const strataSize = Math.floor(data.length / sampleSize)
  const samples: T[] = []
  
  for (let i = 0; i < sampleSize; i++) {
    const strataStart = i * strataSize
    const strataEnd = Math.min((i + 1) * strataSize, data.length)
    const midPoint = Math.floor((strataStart + strataEnd) / 2)
    samples.push(sorted[midPoint])
  }
  
  return samples
}

/**
 * Smart sampling - combines multiple strategies for best representation
 */
function smartSample<T = any[]>(
  data: T[],
  headers: string[],
  maxRows: number
): T[] {
  const samples: T[] = []
  const totalRows = data.length
  
  // Always include first and last rows for context
  samples.push(data[0])
  if (totalRows > 1) {
    samples.push(data[totalRows - 1])
  }
  
  // Include some rows from beginning, middle, and end
  const sections = 5 // Divide data into 5 sections
  const rowsPerSection = Math.floor((maxRows - 2) / sections)
  const sectionSize = Math.floor(totalRows / sections)
  
  for (let section = 0; section < sections; section++) {
    const sectionStart = section * sectionSize
    const sectionEnd = Math.min((section + 1) * sectionSize, totalRows)
    
    // Random sample within each section
    for (let i = 0; i < rowsPerSection && sectionStart + i < sectionEnd; i++) {
      const randomIndex = sectionStart + Math.floor(Math.random() * (sectionEnd - sectionStart))
      if (!samples.includes(data[randomIndex])) {
        samples.push(data[randomIndex])
      }
    }
  }
  
  // Ensure we don't exceed maxRows
  return samples.slice(0, maxRows)
}

/**
 * Compute aggregates for the full dataset
 */
function computeAggregates<T = any[]>(
  data: T[],
  headers: string[]
): DataAggregates {
  const columnStats: ColumnStats[] = []
  const numericalSummary: NumericalSummary = {}
  
  headers.forEach((header, index) => {
    const columnData = data.map((row: any) => row[index])
    const stats = analyzeColumn(columnData, header)
    columnStats.push(stats)
    
    // If numeric, compute additional statistics
    if (stats.dataType === 'number') {
      const numbers = columnData
        .filter((v: any) => v != null && !isNaN(parseFloat(v)))
        .map((v: any) => parseFloat(v))
      
      if (numbers.length > 0) {
        numericalSummary[header] = {
          min: Math.min(...numbers),
          max: Math.max(...numbers),
          mean: numbers.reduce((a, b) => a + b, 0) / numbers.length,
          median: calculateMedian(numbers),
          sum: numbers.reduce((a, b) => a + b, 0),
          stdDev: calculateStdDev(numbers)
        }
      }
    }
  })
  
  return {
    rowCount: data.length,
    columnStats,
    numericalSummary: Object.keys(numericalSummary).length > 0 ? numericalSummary : undefined
  }
}

/**
 * Analyze a single column
 */
function analyzeColumn(columnData: any[], columnName: string): ColumnStats {
  const uniqueValues = new Set()
  const valueCounts = new Map<any, number>()
  let nullCount = 0
  let dataTypes = new Set<string>()
  
  columnData.forEach(value => {
    if (value == null || value === '') {
      nullCount++
    } else {
      uniqueValues.add(value)
      valueCounts.set(value, (valueCounts.get(value) || 0) + 1)
      
      // Detect data type
      if (!isNaN(parseFloat(value)) && isFinite(value)) {
        dataTypes.add('number')
      } else if (typeof value === 'boolean') {
        dataTypes.add('boolean')
      } else if (isValidDate(value)) {
        dataTypes.add('date')
      } else {
        dataTypes.add('string')
      }
    }
  })
  
  // Get top 5 most frequent values
  const topValues = Array.from(valueCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([value, count]) => ({ value, count }))
  
  // Determine primary data type
  let dataType: ColumnStats['dataType'] = 'string'
  if (dataTypes.size === 1) {
    dataType = Array.from(dataTypes)[0] as ColumnStats['dataType']
  } else if (dataTypes.size > 1) {
    dataType = 'mixed'
  }
  
  return {
    columnName,
    dataType,
    uniqueValues: uniqueValues.size,
    nullCount,
    topValues
  }
}

/**
 * Find the first numeric column for stratification
 */
function findNumericColumn(data: any[], headers: string[]): number {
  for (let i = 0; i < headers.length; i++) {
    const sample = data.slice(0, Math.min(10, data.length))
    const isNumeric = sample.every(row => {
      const value = row[i]
      return value == null || !isNaN(parseFloat(value))
    })
    
    if (isNumeric) {
      return i
    }
  }
  
  return -1
}

/**
 * Simple seeded random number generator
 */
function seedRandom(seed: number) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

/**
 * Calculate median of an array of numbers
 */
function calculateMedian(numbers: number[]): number {
  const sorted = [...numbers].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  
  return sorted[mid]
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(numbers: number[]): number {
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length
  const squaredDiffs = numbers.map(x => Math.pow(x - mean, 2))
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length
  return Math.sqrt(avgSquaredDiff)
}

/**
 * Check if a value is a valid date
 */
function isValidDate(value: any): boolean {
  if (!value) return false
  const date = new Date(value)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Prepare data summary for LLM context
 */
export function prepareLLMContext(sampledData: SampledData): string {
  const { samples, totalRows, sampleSize, strategy, aggregates } = sampledData
  
  let context = `Dataset Overview:
- Total Rows: ${totalRows.toLocaleString()}
- Sample Size: ${sampleSize} (${((sampleSize / totalRows) * 100).toFixed(1)}%)
- Sampling Strategy: ${strategy}
`
  
  if (aggregates) {
    context += `\nColumn Statistics:\n`
    aggregates.columnStats.forEach(stat => {
      context += `- ${stat.columnName}: ${stat.dataType} type, ${stat.uniqueValues} unique values`
      if (stat.nullCount > 0) {
        context += ` (${stat.nullCount} nulls)`
      }
      context += '\n'
    })
    
    if (aggregates.numericalSummary) {
      context += `\nNumerical Summaries:\n`
      Object.entries(aggregates.numericalSummary).forEach(([col, stats]) => {
        context += `- ${col}: min=${stats.min.toFixed(2)}, max=${stats.max.toFixed(2)}, mean=${stats.mean.toFixed(2)}\n`
      })
    }
  }
  
  return context
}