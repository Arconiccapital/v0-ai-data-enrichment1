import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { sampleDataForAPI, prepareLLMContext } from '@/lib/data-sampling'

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307'
const MAX_TOKENS = Number(process.env.VIBE_MAX_TOKENS || 1800)
const SAMPLE_MAX_ROWS = Number(process.env.VIBE_SAMPLE_MAX_ROWS || 250)

// Detect the expected layout type based on prompt keywords
function detectLayoutType(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()
  
  if (lowerPrompt.includes('report') || 
      lowerPrompt.includes('summary') || 
      lowerPrompt.includes('document') ||
      lowerPrompt.includes('analysis') ||
      lowerPrompt.includes('review')) {
    return 'report'
  }
  
  if (lowerPrompt.includes('presentation') || 
      lowerPrompt.includes('slide') || 
      lowerPrompt.includes('pitch') ||
      lowerPrompt.includes('deck') ||
      lowerPrompt.includes('showcase')) {
    return 'presentation'
  }
  
  if (lowerPrompt.includes('kpi') || 
      lowerPrompt.includes('metric') || 
      lowerPrompt.includes('scorecard') ||
      lowerPrompt.includes('indicator') ||
      lowerPrompt.includes('performance')) {
    return 'kpi'
  }
  
  if (lowerPrompt.includes('ranking') || 
      lowerPrompt.includes('leaderboard') || 
      lowerPrompt.includes('top') ||
      lowerPrompt.includes('best') ||
      lowerPrompt.includes('winner') ||
      lowerPrompt.includes('highest') ||
      lowerPrompt.includes('lowest')) {
    return 'ranking'
  }
  
  return 'dashboard'
}

// Try to extract a JSON object/array from a model's text output
function tryExtractJSON(text: string): any | null {
  if (!text) return null
  const cleaned = text
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/g, '')
    .trim()

  // Fast path: try direct parse first
  try {
    return JSON.parse(cleaned)
  } catch {}

  // Find the first top-level JSON object or array using a simple stack parser
  const startIdxCandidates = [cleaned.indexOf('{'), cleaned.indexOf('[')].filter(i => i >= 0)
  if (startIdxCandidates.length === 0) return null
  const start = Math.min(...startIdxCandidates)

  const stack: string[] = []
  let inString = false
  let escape = false
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i]
    if (inString) {
      if (escape) {
        escape = false
      } else if (ch === '\\') {
        escape = true
      } else if (ch === '"') {
        inString = false
      }
      continue
    }
    if (ch === '"') {
      inString = true
      continue
    }
    if (ch === '{' || ch === '[') stack.push(ch)
    else if (ch === '}' || ch === ']') {
      const last = stack.pop()
      if ((last === '{' && ch !== '}') || (last === '[' && ch !== ']')) {
        // mismatched, abort
        break
      }
      if (stack.length === 0) {
        const candidate = cleaned.slice(start, i + 1)
        try {
          return JSON.parse(candidate)
        } catch {}
      }
    }
  }
  return null
}

// Helper function to analyze data types and patterns
function analyzeData(headers: string[], data: string[][]) {
  const analysis: any = {
    totalRows: data.length,
    columns: {},
    insights: []
  }
  
  headers.forEach((header, index) => {
    const columnData = data.map(row => row[index]).filter(Boolean)
    const sample = columnData.slice(0, 10)
    
    // Detect data type
    const hasNumbers = columnData.some(val => !isNaN(parseFloat(val.replace(/[,$]/g, ''))))
    const hasDates = columnData.some(val => !isNaN(Date.parse(val)))
    const hasUrls = columnData.some(val => val?.startsWith('http'))
    const hasCurrency = columnData.some(val => val?.includes('$') || val?.match(/^\d+(\.\d{2})?$/))
    const hasEmails = columnData.some(val => val?.includes('@'))
    
    // Calculate stats for numeric columns
    let stats = null
    if (hasNumbers) {
      const numbers = columnData.map(val => parseFloat(val.replace(/[,$]/g, ''))).filter(n => !isNaN(n))
      if (numbers.length > 0) {
        const sum = numbers.reduce((a, b) => a + b, 0)
        const avg = sum / numbers.length
        const min = Math.min(...numbers)
        const max = Math.max(...numbers)
        const range = max - min
        
        stats = { min, max, avg, sum, range, count: numbers.length }
        
        // Add insights
        if (range > 0) {
          const topValue = max
          const topIndex = columnData.findIndex(v => parseFloat(v.replace(/[,$]/g, '')) === topValue)
          if (topIndex >= 0 && data[topIndex]) {
            analysis.insights.push({
              type: 'max',
              column: header,
              value: topValue,
              row: data[topIndex][0] // Assuming first column is identifier
            })
          }
        }
      }
    }
    
    // Get unique values for categorical data
    const uniqueValues = [...new Set(columnData)]
    const uniqueCount = uniqueValues.length
    
    // Determine if this looks like an ID or name column
    const isIdentifier = index === 0 || header.toLowerCase().includes('name') || 
                        header.toLowerCase().includes('company') || 
                        header.toLowerCase().includes('id')
    
    analysis.columns[header] = {
      type: hasCurrency ? 'currency' : 
            hasNumbers && !isIdentifier ? 'numeric' : 
            hasDates ? 'date' : 
            hasUrls ? 'url' : 
            hasEmails ? 'email' : 'text',
      uniqueCount,
      sample,
      stats,
      uniqueValues: uniqueCount <= 20 ? uniqueValues : null,
      isIdentifier
    }
  })
  
  // Generate cross-column insights
  const numericColumns = Object.entries(analysis.columns)
    .filter(([_, col]: [string, any]) => col.type === 'numeric' || col.type === 'currency')
    .map(([name, _]) => name)
  
  if (numericColumns.length >= 2) {
    analysis.insights.push({
      type: 'correlation_opportunity',
      columns: numericColumns,
      description: 'Multiple numeric columns available for correlation analysis'
    })
  }
  
  return analysis
}

// Generate visualization suggestions based on data
function getVisualizationSuggestions(analysis: any) {
  const suggestions = []
  const columnTypes = Object.values(analysis.columns).map((col: any) => col.type)
  
  if (columnTypes.includes('numeric') || columnTypes.includes('currency')) {
    suggestions.push('bar chart', 'line graph', 'area chart', 'scatter plot', 'bubble chart')
  }
  
  if (columnTypes.filter((t: string) => t === 'text').length >= 2) {
    suggestions.push('relationship network', 'hierarchical tree', 'comparison table')
  }
  
  if (columnTypes.includes('date')) {
    suggestions.push('timeline', 'gantt chart', 'time series', 'trend analysis')
  }
  
  if (analysis.totalRows > 5) {
    suggestions.push('data cards', 'metric dashboard', 'KPI overview', 'ranking list')
  }
  
  suggestions.push('interactive table', 'comparison matrix', 'summary statistics')
  
  return suggestions
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, headers, data } = await request.json()
    
    console.log('🎯 Vibe Generate API called with prompt:', prompt)
    
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
    if (!apiKey || apiKey === 'your-claude-api-key-here') {
      console.log('⚠️ No API key, using fallback')
      // Return a fallback dashboard configuration
      const fallbackConfig = generateFallbackConfig(prompt, headers, data)
      console.log('📊 Fallback config layout type:', fallbackConfig.layout?.type)
      return NextResponse.json({
        success: true,
        config: fallbackConfig,
        model: 'fallback'
      })
    }
    
    const anthropic = new Anthropic({ apiKey })
    
    // Analyze the data to understand its structure
    const dataAnalysis = analyzeData(headers, data)
    const vizSuggestions = getVisualizationSuggestions(dataAnalysis)
    
    // Sample data for large datasets to prevent API limits
    const sampledResult = sampleDataForAPI(data, headers, {
      maxRows: SAMPLE_MAX_ROWS,
      strategy: 'smart'
    })
    
    // Prepare dataset for Claude (using sampled data)
    const fullData = sampledResult.samples.map((row: string[]) => 
      row.reduce((acc, cell, i) => ({
        ...acc,
        [headers[i]]: cell
      }), {})
    )
    
    // Add sampling context if data was sampled
    const samplingContext = sampledResult.totalRows > sampledResult.sampleSize 
      ? prepareLLMContext(sampledResult)
      : ''
    
    const systemPrompt = `You are an expert data visualization designer. Your FIRST and MOST IMPORTANT task is to determine the correct layout type based on the user's request.

STEP 1 - LAYOUT TYPE DETECTION (CRITICAL):
Analyze the user's request and select the appropriate layout type:

Examples of layout type selection:
- User says "generate a report" → layout.type = "report"
- User says "create a presentation" → layout.type = "presentation"  
- User says "show KPIs" or "metrics dashboard" → layout.type = "kpi"
- User says "show top performers" or "ranking" → layout.type = "ranking"
- User says "dashboard" or general request → layout.type = "dashboard"

Keywords to detect:
- REPORT keywords: report, summary, document, analysis, review
- PRESENTATION keywords: presentation, slides, pitch, deck, showcase
- KPI keywords: kpi, metrics, scorecard, indicators, performance
- RANKING keywords: ranking, leaderboard, top, best, winners, highest, lowest
- DASHBOARD keywords: dashboard, overview, analytics (or no specific keyword)

STEP 2 - GENERATE VISUALIZATION:
1. Use EVERY column from the data in meaningful ways
2. Always use ACTUAL values from the dataset, never placeholders
3. Format large numbers properly (e.g., 14400000 → "$14.4M")
4. Create diverse visualizations that tell a complete story
5. Generate insights and comparisons between data points

OUTPUT FORMAT:
Return ONLY valid JSON. The layout.type field MUST match the user's request intent:

{
  "title": "Title based on the data and request",
  "layout": {
    "type": "[MUST BE: report|presentation|kpi|ranking|dashboard based on user request]",
    "columns": 3
  },
  "components": [component objects]
}

COMPONENT TYPES TO USE:

1. METRIC CARDS (use for key statistics):
{
  "type": "metric",
  "id": "unique-id",
  "props": {
    "title": "Metric Name",
    "value": numeric_value_from_data,
    "unit": "USD" | "$" | "%" | "Headcount" | null,
    "subtitle": "Context or comparison",
    "isCurrency": true/false,
    "color": "blue" | "green" | "purple" | "orange"
  }
}

2. CHARTS (use actual data arrays):
{
  "type": "chart",
  "id": "unique-id", 
  "props": {
    "chartType": "bar" | "line" | "pie" | "area",
    "title": "Chart Title",
    "data": [full array of data objects],
    "dataKey": "column_name_for_values",
    "xAxisKey": "column_name_for_x_axis",
    "valueType": "currency" | "numeric",
    "isCurrency": true/false,
    "color": "#6366f1"
  }
}

3. TABLES (show all columns):
{
  "type": "table",
  "id": "unique-id",
  "props": {
    "title": "Table Title",
    "columns": [all column names],
    "data": [array of row objects using ALL columns],
    "limit": 10
  }
}

4. TEXT/INSIGHTS:
{
  "type": "text",
  "id": "unique-id",
  "props": {
    "text": "Insight or description",
    "size": "large" | "medium" | "small",
    "weight": "bold" | "semibold" | "normal"
  }
}

SMART DATA USAGE RULES:
1. For revenue/funding/money columns: Set isCurrency: true and unit: "USD"
2. For employee/headcount columns: Set unit: "Headcount"
3. Calculate meaningful metrics: totals, averages, growth rates, comparisons
4. Show top performers and outliers
5. Use ALL columns - if there's a CEO column, show it; if there's description, use it
6. Create comparisons like "Company A has 2.3x the revenue of Company B"
7. Group related metrics together

Remember: Return ONLY the JSON configuration, no explanations.`

    const userPrompt = `User Request: "${prompt}"

YOUR FIRST TASK - DETERMINE LAYOUT TYPE:
The user said: "${prompt}"

EXAMPLES OF CORRECT LAYOUT TYPE SELECTION:
- "generate a report" → YOU MUST SET layout.type = "report"
- "create a business report" → YOU MUST SET layout.type = "report"
- "build a presentation" → YOU MUST SET layout.type = "presentation"
- "show me slides" → YOU MUST SET layout.type = "presentation"
- "display KPIs" → YOU MUST SET layout.type = "kpi"
- "show metrics" → YOU MUST SET layout.type = "kpi"
- "show top performers" → YOU MUST SET layout.type = "ranking"
- "create a leaderboard" → YOU MUST SET layout.type = "ranking"
- "build a dashboard" → YOU MUST SET layout.type = "dashboard"
- "visualize this data" → YOU MUST SET layout.type = "dashboard"

For this specific request "${prompt}", you MUST set the layout.type to: ${
  prompt.toLowerCase().includes('report') ? '"report"' :
  prompt.toLowerCase().includes('presentation') || prompt.toLowerCase().includes('slide') ? '"presentation"' :
  prompt.toLowerCase().includes('kpi') || prompt.toLowerCase().includes('metric') || prompt.toLowerCase().includes('scorecard') ? '"kpi"' :
  prompt.toLowerCase().includes('ranking') || prompt.toLowerCase().includes('leaderboard') || prompt.toLowerCase().includes('top') || prompt.toLowerCase().includes('best') ? '"ranking"' :
  '"dashboard"'
}

DATA STRUCTURE:
Columns: ${headers.join(', ')}
Total Rows: ${sampledResult.totalRows}
${samplingContext ? `\nSAMPLING INFO:\n${samplingContext}\n` : ''}

DATASET${sampledResult.totalRows > sampledResult.sampleSize ? ' (SAMPLED)' : ''}:
${JSON.stringify(fullData, null, 2)}

DATA ANALYSIS:
${JSON.stringify(dataAnalysis, null, 2)}

VISUALIZATION OPTIONS: ${vizSuggestions.join(', ')}

Create a comprehensive visualization that:
1. Uses EVERY column from the data (${headers.join(', ')})
2. Shows actual values from the dataset
3. Includes totals, averages, and comparisons
4. Highlights top performers and interesting patterns
5. Provides multiple visualization types
6. Tells the complete story of this data
7. MATCHES THE USER'S REQUEST INTENT (report vs dashboard vs presentation etc)

IMPORTANT: 
- Select the correct layout.type based on the user's request keywords
- For large numbers like 14400000, store as number but mark isCurrency: true
- Include ALL ${headers.length} columns in visualizations
- Create at least 3-4 metric cards with key statistics
- Include at least 2 different chart types
- Add a comprehensive data table showing all columns`

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userPrompt
      }]
    })
    
    // Extract and parse the JSON configuration
    const content = response.content[0]
    const configText = content?.type === 'text' ? content.text : ''

    const parsed = tryExtractJSON(configText)
    if (parsed) {
      // Override layout type if Claude didn't follow instructions
      const expectedLayoutType = detectLayoutType(prompt)
      if (parsed.layout && parsed.layout.type !== expectedLayoutType) {
        console.log(`⚠️ Claude returned layout type '${parsed.layout.type}' but expected '${expectedLayoutType}' based on prompt. Overriding...`)
        parsed.layout.type = expectedLayoutType
      }
      
      console.log('✅ Claude generated config with layout type:', parsed.layout?.type)
      return NextResponse.json({
        success: true,
        config: parsed,
        model: MODEL,
        meta: { source: 'anthropic', sampled: sampledResult.sampleSize, total: sampledResult.totalRows }
      })
    }

    console.error('Failed to parse Claude response (showing first 500 chars):', configText?.slice(0, 500))
    console.log('⚠️ Parsing failed, using fallback')
    // Return fallback if parsing fails
    const fallbackConfig = generateFallbackConfig(prompt, headers, data)
    console.log('📊 Fallback config layout type:', fallbackConfig.layout?.type)
    return NextResponse.json({
      success: true,
      config: fallbackConfig,
      model: 'fallback',
      meta: { source: 'fallback', sampled: sampledResult.sampleSize, total: sampledResult.totalRows }
    })
    
  } catch (error) {
    console.error('Vibe generation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
      config: generateFallbackConfig('Dashboard', [], [])
    })
  }
}

function generateFallbackConfig(prompt: string, headers: string[], data: string[][]) {
  // Analyze data for the fallback
  const analysis = analyzeData(headers, data)
  const lowerPrompt = prompt.toLowerCase()
  
  // Build metrics array
  const metrics: any[] = []
  const charts: any[] = []
  
  Object.entries(analysis.columns).forEach(([header, col]: [string, any]) => {
    if ((col.type === 'numeric' || col.type === 'currency') && col.stats) {
      const isCurrency = col.type === 'currency' || 
                         header.toLowerCase().includes('revenue') || 
                         header.toLowerCase().includes('price') ||
                         header.toLowerCase().includes('cost') ||
                         header.toLowerCase().includes('usd')
      
      metrics.push({
        key: header,
        label: header,
        type: isCurrency ? 'currency' : 'number',
        icon: null,
        color: ['blue', 'green', 'purple', 'orange'][metrics.length % 4],
        isCurrency: isCurrency
      })
    }
  })
  
  // Determine dashboard type based on prompt - more robust detection
  const isReport = lowerPrompt.includes('report') || 
                   lowerPrompt.includes('build a report') || 
                   lowerPrompt.includes('create a report') ||
                   lowerPrompt.includes('generate a report') ||
                   lowerPrompt.includes('formal') ||
                   lowerPrompt.includes('document')
                   
  const isPresentation = lowerPrompt.includes('presentation') || 
                        lowerPrompt.includes('present') ||
                        lowerPrompt.includes('slide') ||
                        lowerPrompt.includes('pitch') ||
                        lowerPrompt.includes('deck')
                        
  const isDashboard = lowerPrompt.includes('dashboard') ||
                     lowerPrompt.includes('build a dashboard') ||
                     lowerPrompt.includes('create dashboard')
                     
  const isKPI = lowerPrompt.includes('kpi') || 
               lowerPrompt.includes('key metric') ||
               lowerPrompt.includes('key performance') ||
               lowerPrompt.includes('metric') ||
               lowerPrompt.includes('big numbers')
               
  const isSales = lowerPrompt.includes('sale') || 
                 lowerPrompt.includes('revenue') || 
                 lowerPrompt.includes('deal') ||
                 lowerPrompt.includes('performance')
                 
  const isRanking = lowerPrompt.includes('top') || 
                   lowerPrompt.includes('best') || 
                   lowerPrompt.includes('rank') || 
                   lowerPrompt.includes('leaderboard') || 
                   lowerPrompt.includes('winner') ||
                   lowerPrompt.includes('performers') ||
                   lowerPrompt.includes('highest') ||
                   lowerPrompt.includes('lowest')
                   
  const isComparison = lowerPrompt.includes('compar') || 
                      lowerPrompt.includes('versus') || 
                      lowerPrompt.includes('vs')
                      
  const isTrend = lowerPrompt.includes('trend') || 
                 lowerPrompt.includes('over time') || 
                 lowerPrompt.includes('timeline')
                 
  const isExecutive = lowerPrompt.includes('executive') || 
                     lowerPrompt.includes('summary')
  
  console.log('🎨 Detected dashboard type:', {
    isReport, isPresentation, isDashboard, isKPI, isRanking,
    prompt: lowerPrompt.substring(0, 50) + '...'
  })
  
  // Create charts based on dashboard type (using supported chart types only)
  if (isReport) {
    // Report: Formal layout with comprehensive data
    if (metrics.length > 0) {
      // Use bar chart for main analysis
      charts.push({
        id: 'report-analysis',
        type: 'bar',
        title: 'Performance Analysis',
        dataKey: metrics[0].key,
        xAxisKey: headers[0],
        height: 350
      })
      // Add line chart for trends
      if (metrics.length > 1) {
        charts.push({
          id: 'report-trends',
          type: 'line',
          title: 'Trend Analysis',
          dataKey: metrics.slice(0, 2).map(m => m.key),
          xAxisKey: headers[0],
          height: 300
        })
      }
      // Add pie chart for distribution
      if (metrics.length > 0) {
        charts.push({
          id: 'report-distribution',
          type: 'pie',
          title: 'Distribution Analysis',
          dataKey: metrics[0].key,
          height: 300
        })
      }
    }
  } else if (isPresentation) {
    // Presentation: Visual-heavy with impact
    if (metrics.length > 0) {
      // Big impactful bar chart
      charts.push({
        id: 'visual-impact',
        type: 'bar',
        title: 'Key Performance Metrics',
        dataKey: metrics[0]?.key,
        xAxisKey: headers[0],
        height: 400,
        color: '#3b82f6'
      })
    }
    if (metrics.length > 1) {
      // Beautiful area chart for trends
      charts.push({
        id: 'trend-story',
        type: 'area',
        title: 'Growth Trajectory',
        dataKey: metrics[0].key,
        xAxisKey: headers[0],
        height: 350
      })
    }
    if (metrics.length > 2) {
      // Pie chart for visual appeal
      charts.push({
        id: 'distribution',
        type: 'pie',
        title: 'Market Share',
        dataKey: metrics[0].key,
        height: 350
      })
    }
  } else if (isDashboard && !isKPI && !isSales && !isRanking) {
    // Generic Dashboard: Balanced mix
    if (metrics.length > 0) {
      charts.push({
        id: 'main-visual',
        type: 'bar',
        title: `${metrics[0].label} Overview`,
        dataKey: metrics[0].key,
        xAxisKey: headers[0],
        height: 300
      })
      if (metrics.length > 1) {
        charts.push({
          id: 'secondary-visual',
          type: 'line',
          title: 'Performance Trends',
          dataKey: metrics.slice(0, Math.min(3, metrics.length)).map(m => m.key),
          xAxisKey: headers[0],
          height: 280
        })
      }
      if (metrics.length > 2) {
        charts.push({
          id: 'comparison',
          type: 'bar',
          title: 'Comparative Analysis',
          dataKey: metrics.slice(0, 2).map(m => m.key),
          xAxisKey: headers[0],
          height: 280
        })
      }
    }
  } else if (isKPI) {
    // KPI Dashboard: Focus on metrics with small trend charts
    if (metrics.length > 0) {
      // Single line chart showing all KPIs
      charts.push({
        id: 'kpi-trends',
        type: 'line',
        title: 'KPI Trends',
        dataKey: metrics.slice(0, 3).map(m => m.key),
        xAxisKey: headers[0],
        height: 200
      })
    }
  } else if (isSales) {
    // Sales Dashboard: Revenue focused
    const revenueMetric = metrics.find(m => m.isCurrency) || metrics[0]
    if (revenueMetric) {
      // Revenue bar chart
      charts.push({
        id: 'revenue-breakdown',
        type: 'bar',
        title: 'Revenue by ' + headers[0],
        dataKey: revenueMetric.key,
        xAxisKey: headers[0],
        height: 350,
        color: '#10b981'
      })
      // Revenue trend
      charts.push({
        id: 'revenue-trend',
        type: 'area',
        title: 'Revenue Trend',
        dataKey: revenueMetric.key,
        xAxisKey: headers[0],
        height: 300
      })
    }
    // Performance comparison
    if (metrics.length > 1) {
      charts.push({
        id: 'performance-metrics',
        type: 'bar',
        title: 'Performance Metrics',
        dataKey: metrics.slice(0, 2).map(m => m.key),
        xAxisKey: headers[0],
        height: 300
      })
    }
  } else if (isRanking) {
    // Ranking Dashboard: Top performers
    if (metrics.length > 0) {
      charts.push({
        id: 'ranking-chart',
        type: 'bar',
        title: `Top Performers by ${metrics[0]?.label || 'Value'}`,
        dataKey: metrics[0]?.key,
        xAxisKey: headers[0],
        height: 400,
        color: '#f59e0b'
      })
      if (metrics.length > 1) {
        charts.push({
          id: 'ranking-comparison',
          type: 'line',
          title: 'Performance Comparison',
          dataKey: metrics.slice(0, 2).map(m => m.key),
          xAxisKey: headers[0],
          height: 300
        })
      }
    }
  } else if (isComparison) {
    // Comparison Dashboard: Multi-series bars
    charts.push({
      id: 'comparison-chart',
      type: 'bar',
      title: 'Comparison Analysis',
      dataKey: metrics.slice(0, Math.min(3, metrics.length)).map(m => m.key),
      xAxisKey: headers[0],
      stacked: false
    })
    if (metrics.length >= 2) {
      charts.push({
        id: 'comparison-trend',
        type: 'line',
        title: 'Trend Comparison',
        dataKey: metrics.slice(0, 2).map(m => m.key),
        xAxisKey: headers[0],
        height: 300
      })
    }
  } else if (isTrend) {
    // Trend Dashboard: Line and area charts
    metrics.slice(0, 3).forEach((metric, i) => {
      charts.push({
        id: `trend-${i}`,
        type: i === 0 ? 'area' : 'line',
        title: `${metric.label} Trend`,
        dataKey: metric.key,
        xAxisKey: headers[0],
        height: 280
      })
    })
  } else if (isExecutive) {
    // Executive Dashboard: Clean metrics and single trend
    charts.push({
      id: 'executive-overview',
      type: 'line',
      title: 'Performance Overview',
      dataKey: metrics.slice(0, 2).map(m => m.key),
      xAxisKey: headers[0],
      height: 250
    })
  } else {
    // Default: Balanced mix
    if (metrics.length > 0) {
      charts.push({
        id: 'main-chart',
        type: 'bar',
        title: `${metrics[0].label} by ${headers[0]}`,
        dataKey: metrics[0].key,
        xAxisKey: headers[0],
        height: 300
      })
    }
    if (metrics.length > 1) {
      charts.push({
        id: 'secondary-chart',
        type: 'line',
        title: 'Trends Analysis',
        dataKey: metrics.slice(0, Math.min(3, metrics.length)).map(m => m.key),
        xAxisKey: headers[0],
        height: 250
      })
    }
    if (metrics.length > 2) {
      charts.push({
        id: 'distribution',
        type: 'pie',
        title: `${metrics[0].label} Distribution`,
        dataKey: metrics[0].key,
        height: 250
      })
    }
  }
  
  // Generate dynamic title and subtitle based on prompt
  let title = 'Data Dashboard'
  let subtitle = `Analysis of ${data.length} records`
  
  if (isReport) {
    title = 'Business Intelligence Report'
    subtitle = `Comprehensive analysis of ${headers[0]} performance metrics`
  } else if (isPresentation) {
    title = 'Executive Presentation'
    subtitle = 'Key insights and strategic recommendations'
  } else if (isDashboard && !isKPI && !isSales) {
    title = 'Interactive Dashboard'
    subtitle = `Real-time visualization of ${metrics.length} key metrics`
  } else if (isKPI) {
    title = 'Key Performance Indicators'
    subtitle = 'Real-time monitoring of critical business metrics'
  } else if (isSales) {
    title = 'Sales Performance Dashboard'
    subtitle = 'Revenue tracking, pipeline analysis, and team performance'
  } else if (isRanking) {
    title = `Top ${data.length > 10 ? '10' : data.length} Rankings`
    subtitle = `Performance leaderboard by ${metrics[0]?.label || 'metrics'}`
  } else if (isComparison) {
    title = 'Comparative Analysis'
    subtitle = 'Side-by-side performance comparison'
  } else if (isTrend) {
    title = 'Trend Analysis Dashboard'
    subtitle = 'Historical patterns and future projections'
  } else if (isExecutive) {
    title = 'Executive Summary'
    subtitle = 'High-level business intelligence overview'
  } else if (prompt.length > 10) {
    // Use the prompt as title if it's descriptive enough
    title = prompt.charAt(0).toUpperCase() + prompt.slice(1)
    subtitle = `Custom visualization of ${data.length} data points`
  }
  
  // Generate views based on dashboard type
  function generateViews() {
    if (isReport) {
      return [
        {
          id: 'summary',
          name: 'Executive Summary',
          description: 'High-level findings and recommendations',
          charts: ['summary-table', 'report-metrics'],
          metrics: metrics.slice(0, 3).map(m => m.key)
        },
        {
          id: 'analysis',
          name: 'Detailed Analysis',
          description: 'In-depth data exploration',
          charts: ['report-chart'],
          metrics: metrics.map(m => m.key)
        }
      ]
    } else if (isPresentation) {
      return [
        {
          id: 'story',
          name: 'Story',
          description: 'Visual narrative',
          charts: charts.map(c => c.id),
          metrics: [metrics[0]?.key].filter(Boolean),
          layout: 'presentation'
        }
      ]
    } else if (isDashboard && !isKPI && !isSales) {
      return [
        {
          id: 'overview',
          name: 'Overview',
          description: 'Dashboard overview',
          charts: charts.map(c => c.id),
          metrics: metrics.map(m => m.key)
        }
      ]
    } else if (isKPI) {
      return [
        {
          id: 'kpis',
          name: 'KPIs',
          description: 'Key performance indicators',
          charts: charts.map(c => c.id),
          metrics: metrics.map(m => m.key),
          layout: 'metrics-focused'
        }
      ]
    } else if (isSales) {
      return [
        {
          id: 'pipeline',
          name: 'Pipeline',
          description: 'Sales funnel and pipeline',
          charts: ['sales-funnel', 'revenue-trend'],
          metrics: metrics.slice(0, 3).map(m => m.key)
        },
        {
          id: 'performance',
          name: 'Team Performance',
          description: 'Individual and team metrics',
          charts: ['top-performers'],
          metrics: metrics.map(m => m.key)
        }
      ]
    } else if (isRanking) {
      return [
        {
          id: 'leaderboard',
          name: 'Leaderboard',
          description: 'Top performers ranking',
          charts: charts.map(c => c.id),
          metrics: [metrics[0]?.key].filter(Boolean),
          layout: 'ranking'
        }
      ]
    } else {
      return [
        {
          id: 'main',
          name: 'Dashboard',
          description: 'Main dashboard view',
          charts: charts.map(c => c.id),
          metrics: metrics.map(m => m.key)
        }
      ]
    }
  }
  
  // Generate entity card configuration
  function generateEntityCard() {
    if (isExecutive) {
      // No entity cards for executive view
      return null
    }
    
    if (isRanking) {
      // Ranking cards with position
      return {
        title: (item: any) => item[headers[0]] || 'Item',
        subtitle: (item: any) => `Rank #${data.indexOf(data.find(d => d[0] === item[headers[0]])) + 1}`,
        primaryMetric: metrics[0] ? {
          key: metrics[0].key,
          label: metrics[0].label
        } : undefined,
        showRank: true,
        highlight: (item: any, index: number) => index < 3 // Highlight top 3
      }
    }
    
    // Default entity card
    return {
      title: (item: any) => item[headers[0]] || 'Item',
      subtitle: (item: any) => {
        // Find first non-numeric field for subtitle
        for (let i = 1; i < headers.length; i++) {
          if (!metrics.find(m => m.key === headers[i]) && item[headers[i]]) {
            return item[headers[i]]
          }
        }
        return null
      },
      primaryMetric: metrics[0] ? {
        key: metrics[0].key,
        label: metrics[0].label
      } : undefined,
      secondaryMetrics: metrics.slice(1, 3).map(m => m.key)
    }
  }
  
  // Generate layout configuration
  function generateLayout() {
    if (isReport) {
      return {
        type: 'report',
        columns: 1,
        spacing: 'normal',
        formal: true,
        printable: true
      }
    } else if (isPresentation) {
      return {
        type: 'presentation',
        columns: 1,
        spacing: 'spacious',
        fullscreen: true,
        animated: true
      }
    } else if (isDashboard && !isKPI && !isSales) {
      return {
        type: 'dashboard',
        columns: 3,
        spacing: 'normal',
        interactive: true
      }
    } else if (isKPI) {
      return {
        type: 'kpi',
        columns: 4,
        spacing: 'compact',
        metricsSize: 'large'
      }
    } else if (isSales) {
      return {
        type: 'sales',
        columns: 3,
        spacing: 'normal',
        emphasis: 'charts'
      }
    } else if (isRanking) {
      return {
        type: 'ranking',
        columns: 2,
        spacing: 'normal',
        orientation: 'vertical'
      }
    } else if (isExecutive) {
      return {
        type: 'executive',
        columns: 2,
        spacing: 'spacious',
        minimal: true
      }
    } else if (isComparison) {
      return {
        type: 'comparison',
        columns: 2,
        spacing: 'normal',
        sideBySide: true
      }
    } else {
      return {
        type: 'dashboard',
        columns: 3,
        spacing: 'normal'
      }
    }
  }
  
  // Return the new flexible dashboard config format
  return {
    dataSchema: {
      primaryKey: headers[0] || 'id',
      metrics: metrics,
      dimensions: headers.filter(h => !metrics.find(m => m.key === h))
    },
    
    title: title,
    subtitle: subtitle,
    
    views: generateViews(),
    charts: charts,
    entityCard: generateEntityCard(),
    layout: generateLayout(),
    
    features: {
      search: true,
      export: true,
      comparison: true,
      drilldown: true
    }
  }
}
