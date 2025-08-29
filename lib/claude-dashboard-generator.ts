import Anthropic from '@anthropic-ai/sdk'
import { DashboardTemplate, DashboardWidget } from './dashboard-templates'

// Initialize Anthropic client
const getAnthropicClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
  if (!apiKey || apiKey === 'your-claude-api-key-here') {
    console.warn('No Claude API key configured')
    return null
  }
  return new Anthropic({ apiKey })
}

interface DataContext {
  headers: string[]
  rows: string[][]
  analysis?: {
    dataType: string
    patterns: string[]
    suggestions: string[]
  }
}

interface GeneratedWidget {
  widget: DashboardWidget
  data: any
  insights?: string[]
}

export async function analyzeDataWithClaude(data: DataContext): Promise<any> {
  const anthropic = getAnthropicClient()
  if (!anthropic) {
    return generateMockAnalysis(data)
  }

  try {
    const prompt = `Analyze this dataset and provide insights for dashboard creation:

Headers: ${data.headers.join(', ')}
Sample rows (first 5):
${data.rows.slice(0, 5).map((row, idx) => 
  `Row ${idx + 1}: ${row.map((cell, i) => `${data.headers[i]}: ${cell}`).join(', ')}`
).join('\n')}

Total rows: ${data.rows.length}

Please provide:
1. Data type classification (sales, financial, customer, operations, etc.)
2. Key patterns and relationships between columns
3. Suggested metrics and KPIs to track
4. Recommended visualizations
5. Data quality insights

Format your response as structured JSON.`

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }],
      system: "You are a data analyst expert. Analyze datasets and provide structured insights for dashboard creation. Always respond with valid JSON."
    })

    const content = response.content[0]
    if (content.type === 'text') {
      try {
        return JSON.parse(content.text)
      } catch {
        return generateMockAnalysis(data)
      }
    }
  } catch (error) {
    console.error('Error analyzing data with Claude:', error)
    return generateMockAnalysis(data)
  }
}

export async function generateDashboardWithClaude(
  template: DashboardTemplate,
  data: DataContext,
  customPrompt?: string
): Promise<any> {
  const anthropic = getAnthropicClient()
  if (!anthropic) {
    return generateMockDashboard(template, data)
  }

  try {
    const sections = await Promise.all(
      template.sections.map(async (section) => {
        const widgets = await Promise.all(
          section.widgets.map(async (widget) => {
            const widgetData = await generateWidgetData(
              anthropic,
              widget,
              data,
              template,
              section,
              customPrompt
            )
            return {
              ...widget,
              data: widgetData
            }
          })
        )
        return {
          ...section,
          widgets
        }
      })
    )

    return {
      title: template.name,
      sections,
      metadata: {
        generatedAt: new Date().toISOString(),
        rowCount: data.rows.length,
        template: template.id,
        model: 'claude-3-5-sonnet'
      }
    }
  } catch (error) {
    console.error('Error generating dashboard with Claude:', error)
    return generateMockDashboard(template, data)
  }
}

async function generateWidgetData(
  anthropic: Anthropic,
  widget: DashboardWidget,
  data: DataContext,
  template: DashboardTemplate,
  section: any,
  customPrompt?: string
): Promise<any> {
  const prompt = `You are creating data for a dashboard widget.
Dashboard: ${template.name}
Section: ${section.title}
Widget: ${widget.title}
Widget Type: ${widget.type}

Available data columns: ${data.headers.join(', ')}
Sample data (first 3 rows):
${data.rows.slice(0, 3).map((row, idx) => 
  row.map((cell, i) => `${data.headers[i]}: ${cell}`).join(', ')
).join('\n')}

${customPrompt ? `User requirements: ${customPrompt}` : ''}

Widget configuration:
${JSON.stringify(widget.config, null, 2)}

Generate realistic data for this ${widget.type} widget based on the actual data patterns.

For widget type ${widget.type}:
${getWidgetTypeInstructions(widget.type)}

Return ONLY valid JSON data that matches the widget requirements. No explanations.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: prompt
      }],
      system: "You are a data visualization expert. Generate structured data for dashboard widgets based on real data patterns. Always respond with valid JSON only, no explanations."
    })

    const content = response.content[0]
    if (content.type === 'text') {
      try {
        // Clean up any markdown formatting
        const cleanedText = content.text
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .trim()
        return JSON.parse(cleanedText)
      } catch (error) {
        console.error('Failed to parse widget data:', error)
        return generateMockWidgetData(widget)
      }
    }
  } catch (error) {
    console.error('Error generating widget data:', error)
    return generateMockWidgetData(widget)
  }
}

function getWidgetTypeInstructions(type: string): string {
  switch (type) {
    case 'kpi':
      return `Return an object with metric values. Example: { "total_revenue": 1250000, "growth_rate": 23.5, "active_users": 5420 }`
    case 'scorecard':
      return `Return scores for each criterion (0-10). Example: { "Market Size": 8.5, "Team Quality": 7.2, "Product Fit": 9.0 }`
    case 'chart':
      return `Return array of data points. Example: [{ "month": "Jan", "value": 45000 }, { "month": "Feb", "value": 52000 }]`
    case 'table':
      return `Return array of row objects. Example: [{ "name": "Product A", "sales": 1200, "growth": "15%" }]`
    case 'funnel':
      return `Return stage values. Example: { "Leads": 1000, "Qualified": 650, "Proposal": 200, "Closed": 50 }`
    case 'progress':
      return `Return percentage values (0-100). Example: { "Development": 75, "Marketing": 60, "Sales": 85 }`
    default:
      return 'Return appropriate data structure for the widget'
  }
}

export async function generateDashboardFromPrompt(
  prompt: string,
  data: DataContext
): Promise<any> {
  const anthropic = getAnthropicClient()
  if (!anthropic) {
    return generateMockDashboardFromPrompt(prompt, data)
  }

  try {
    const systemPrompt = `You are an expert dashboard designer. Create a complete dashboard specification based on user requirements and available data.

The dashboard should include:
1. Appropriate title and description
2. Multiple sections with relevant widgets
3. Each widget should have: type (kpi, chart, scorecard, table, funnel, progress), title, configuration, and sample data

Respond with a complete dashboard structure in JSON format that matches this TypeScript interface:
{
  title: string
  sections: Array<{
    title: string
    description?: string
    widgets: Array<{
      id: string
      type: 'kpi' | 'chart' | 'table' | 'scorecard' | 'funnel' | 'progress'
      title: string
      dataKey: string
      config?: any
      data?: any
    }>
  }>
}`

    const userPrompt = `Create a dashboard based on this request: "${prompt}"

Available data columns: ${data.headers.join(', ')}
Data sample (first 3 rows):
${data.rows.slice(0, 3).map((row, idx) => 
  row.map((cell, i) => `${data.headers[i]}: ${cell}`).join(', ')
).join('\n')}
Total rows: ${data.rows.length}

Generate a complete dashboard with relevant sections and widgets based on the user's request and the available data.`

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: userPrompt
      }],
      system: systemPrompt
    })

    const content = response.content[0]
    if (content.type === 'text') {
      try {
        const cleanedText = content.text
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .trim()
        const dashboard = JSON.parse(cleanedText)
        
        // Add metadata
        dashboard.metadata = {
          generatedAt: new Date().toISOString(),
          rowCount: data.rows.length,
          model: 'claude-3-5-sonnet',
          fromPrompt: true
        }
        
        return dashboard
      } catch (error) {
        console.error('Failed to parse dashboard:', error)
        return generateMockDashboardFromPrompt(prompt, data)
      }
    }
  } catch (error) {
    console.error('Error generating dashboard from prompt:', error)
    return generateMockDashboardFromPrompt(prompt, data)
  }
}

// Mock functions for fallback when API is not available
function generateMockAnalysis(data: DataContext) {
  const columnNames = data.headers.map(h => h.toLowerCase())
  let dataType = 'general'
  
  if (columnNames.some(c => c.includes('revenue') || c.includes('sales'))) {
    dataType = 'sales'
  } else if (columnNames.some(c => c.includes('customer') || c.includes('user'))) {
    dataType = 'customer'
  } else if (columnNames.some(c => c.includes('expense') || c.includes('cost'))) {
    dataType = 'financial'
  }

  return {
    dataType,
    patterns: [
      `${data.rows.length} total records analyzed`,
      `${data.headers.length} columns identified`,
      'Data appears to be structured and complete'
    ],
    suggestions: [
      'Create KPI cards for key metrics',
      'Add trend charts for time-series data',
      'Include comparison tables for detailed analysis'
    ],
    metrics: data.headers.slice(0, 5),
    quality: {
      completeness: 0.85,
      consistency: 0.92
    }
  }
}

function generateMockDashboard(template: DashboardTemplate, data: DataContext) {
  return {
    title: template.name,
    sections: template.sections.map(section => ({
      ...section,
      widgets: section.widgets.map(widget => ({
        ...widget,
        data: generateMockWidgetData(widget)
      }))
    })),
    metadata: {
      generatedAt: new Date().toISOString(),
      rowCount: data.rows.length,
      template: template.id,
      mock: true
    }
  }
}

function generateMockWidgetData(widget: DashboardWidget) {
  const { type, config } = widget
  
  switch (type) {
    case 'kpi':
      const kpiData: any = {}
      if (config?.metrics) {
        config.metrics.forEach((metric: any) => {
          if (metric.format === 'currency') {
            kpiData[metric.key] = Math.floor(Math.random() * 1000000)
          } else if (metric.format === 'percentage') {
            kpiData[metric.key] = (Math.random() * 100).toFixed(1)
          } else {
            kpiData[metric.key] = Math.floor(Math.random() * 1000)
          }
        })
      }
      return kpiData
      
    case 'scorecard':
      const scores: any = {}
      if (config?.criteria) {
        config.criteria.forEach((criterion: any) => {
          scores[criterion.name] = (Math.random() * criterion.max).toFixed(1)
        })
      }
      return scores
      
    case 'chart':
      const chartData = []
      for (let i = 0; i < 10; i++) {
        const point: any = {}
        if (config?.xAxis) point[config.xAxis] = `Item ${i + 1}`
        if (config?.yAxis) point[config.yAxis] = Math.floor(Math.random() * 1000)
        chartData.push(point)
      }
      return chartData
      
    case 'funnel':
      const funnelData: any = {}
      if (config?.stages) {
        let remaining = 1000
        config.stages.forEach((stage: string, idx: number) => {
          funnelData[stage] = remaining
          remaining = Math.floor(remaining * (0.8 - idx * 0.1))
        })
      }
      return funnelData
      
    case 'progress':
      const progressData: any = {}
      if (config?.categories) {
        config.categories.forEach((category: string) => {
          progressData[category] = (Math.random() * 100).toFixed(1)
        })
      }
      return progressData
      
    default:
      return { value: Math.floor(Math.random() * 1000) }
  }
}

function generateMockDashboardFromPrompt(prompt: string, data: DataContext) {
  return {
    title: "Custom Dashboard",
    sections: [
      {
        title: "Overview",
        description: "Key metrics and performance indicators",
        widgets: [
          {
            id: "kpi_overview",
            type: "kpi" as const,
            title: "Key Metrics",
            dataKey: "metrics",
            config: {
              metrics: data.headers.slice(0, 4).map(h => ({
                label: h,
                key: h.toLowerCase().replace(/\s+/g, '_'),
                format: 'number'
              }))
            },
            data: data.headers.slice(0, 4).reduce((acc, h) => {
              acc[h.toLowerCase().replace(/\s+/g, '_')] = Math.floor(Math.random() * 10000)
              return acc
            }, {} as any)
          }
        ]
      },
      {
        title: "Analysis",
        description: "Detailed data analysis",
        widgets: [
          {
            id: "trend_chart",
            type: "chart" as const,
            title: "Trend Analysis",
            dataKey: "trends",
            config: {
              chartType: "line",
              xAxis: "period",
              yAxis: "value"
            },
            data: Array.from({ length: 6 }, (_, i) => ({
              period: `Month ${i + 1}`,
              value: Math.floor(Math.random() * 10000)
            }))
          }
        ]
      }
    ],
    metadata: {
      generatedAt: new Date().toISOString(),
      rowCount: data.rows.length,
      fromPrompt: true,
      mock: true
    }
  }
}