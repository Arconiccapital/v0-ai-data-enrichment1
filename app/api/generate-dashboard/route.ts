import { NextRequest, NextResponse } from 'next/server'
import { DashboardTemplate } from '@/lib/dashboard-templates'
import { 
  generateDashboardWithClaude, 
  generateDashboardFromPrompt,
  analyzeDataWithClaude 
} from '@/lib/claude-dashboard-generator'

export async function POST(request: NextRequest) {
  try {
    const { template, data, columnMappings, customPrompt, naturalLanguagePrompt } = await request.json()

    // If natural language prompt is provided, generate dashboard from prompt
    if (naturalLanguagePrompt && !template) {
      const dashboard = await generateDashboardFromPrompt(naturalLanguagePrompt, {
        headers: data.headers,
        rows: data.rows
      })
      return NextResponse.json(dashboard)
    }

    // Check if API key is configured
    const hasClaudeKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
    const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here'
    
    if (!hasClaudeKey && !hasOpenAIKey) {
      // Return mock dashboard if no API key
      console.log('No API key configured, returning mock dashboard')
      return NextResponse.json({
        title: template.name,
        sections: template.sections.map((section: any) => ({
          ...section,
          widgets: section.widgets.map((widget: any) => ({
            ...widget,
            data: generateMockWidgetData(widget, data)
          }))
        }))
      })
    }

    // Use Claude API if available, otherwise fall back to mock data
    if (hasClaudeKey) {
      const dashboard = await generateDashboardWithClaude(
        template,
        {
          headers: data.headers,
          rows: data.rows
        },
        customPrompt
      )
      return NextResponse.json(dashboard)
    } else if (hasOpenAIKey) {
      // Fall back to OpenAI if Claude is not available
      return generateWithOpenAI(template, data, columnMappings, customPrompt)
    } else {
      // Return mock dashboard
      const sections = template.sections.map((section: any) => ({
        ...section,
        widgets: section.widgets.map((widget: any) => ({
          ...widget,
          data: generateMockWidgetData(widget, data)
        }))
      }))
      
      return NextResponse.json({
        title: template.name,
        sections,
        metadata: {
          generatedAt: new Date().toISOString(),
          rowCount: data.rows.length,
          template: template.id,
          mock: true
        }
      })
    }
  } catch (error: any) {
    console.error('Dashboard generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate dashboard', message: error.message },
      { status: 500 }
    )
  }
}

// OpenAI fallback function
async function generateWithOpenAI(
  template: any,
  data: any,
  columnMappings: Record<string, string>,
  customPrompt?: string
) {
  const OpenAI = (await import('openai')).default
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  })
  
  const dataContext = prepareDataContext(data, columnMappings)
  
  const sections = await Promise.all(
    template.sections.map(async (section: any) => {
      const widgets = await Promise.all(
        section.widgets.map(async (widget: any) => {
          const widgetPrompt = `
You are creating data for a dashboard widget.
Dashboard: ${template.name}
Section: ${section.title}
Widget: ${widget.title}
Widget Type: ${widget.type}

Data available:
${dataContext}

Instructions: ${customPrompt || template.defaultPrompt}

Generate appropriate data for this ${widget.type} widget based on the configuration:
${JSON.stringify(widget.config, null, 2)}

For widget type ${widget.type}:
- kpi: Return an object with the metrics values
- scorecard: Return scores for each criteria (0-10)
- chart: Return data points for the chart
- table: Return rows of data
- funnel: Return values for each stage
- progress: Return percentage values

Format the response as JSON data that fits the widget configuration.`

          try {
            const completion = await openai.chat.completions.create({
              model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: 'You are a data analyst creating dashboard visualizations. Return only JSON data that matches the widget configuration.'
                },
                {
                  role: 'user',
                  content: widgetPrompt
                }
              ],
              temperature: 0.3,
              max_tokens: 400,
            })

            let response = completion.choices[0]?.message?.content || '{}'
            
            // Remove markdown code blocks if present
            response = response.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
            
            try {
              const widgetData = JSON.parse(response)
              return {
                ...widget,
                data: widgetData
              }
            } catch (parseError) {
              console.error('Failed to parse widget data:', response.substring(0, 200))
              return {
                ...widget,
                data: generateMockWidgetData(widget, data)
              }
            }
          } catch (error) {
            console.error('Error generating widget:', widget.title, error)
            return {
              ...widget,
              data: generateMockWidgetData(widget, data)
            }
          }
        })
      )

      return {
        ...section,
        widgets
      }
    })
  )

  return NextResponse.json({
    title: template.name,
    sections,
    metadata: {
      generatedAt: new Date().toISOString(),
      rowCount: data.rows.length,
      template: template.id,
      model: 'openai'
    }
  })
}

function prepareDataContext(data: any, columnMappings: Record<string, string>) {
  const { headers, rows } = data
  
  // Create a summary of the data
  const summary = []
  
  // Add column information
  summary.push(`Columns: ${headers.join(', ')}`)
  summary.push(`Total rows: ${rows.length}`)
  
  // Add sample data (first 5 rows)
  summary.push('\nSample data:')
  rows.slice(0, 5).forEach((row: string[], idx: number) => {
    const rowData = headers.map((header: string, colIdx: number) => `${header}: ${row[colIdx]}`).join(', ')
    summary.push(`Row ${idx + 1}: ${rowData}`)
  })
  
  // Add basic statistics
  summary.push('\nBasic statistics:')
  headers.forEach((header: string, colIdx: number) => {
    const columnData = rows.map((row: string[]) => row[colIdx])
    const uniqueValues = new Set(columnData).size
    const emptyValues = columnData.filter((v: string) => !v || v.trim() === '').length
    summary.push(`${header}: ${uniqueValues} unique values, ${emptyValues} empty`)
  })
  
  return summary.join('\n')
}

function generateMockWidgetData(widget: any, data: any) {
  const { type, config } = widget
  const rowCount = data.rows.length
  
  switch (type) {
    case 'kpi':
      const kpiData: any = {}
      if (config?.metrics) {
        config.metrics.forEach((metric: any) => {
          if (metric.format === 'currency') {
            kpiData[metric.key] = Math.floor(Math.random() * 1000000)
          } else if (metric.format === 'percentage') {
            kpiData[metric.key] = (Math.random() * 100).toFixed(1)
          } else if (metric.format === 'months') {
            kpiData[metric.key] = Math.floor(Math.random() * 24) + 1
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
      
    case 'table':
      const tableData = []
      for (let i = 0; i < 5; i++) {
        const row: any = {}
        if (config?.columns) {
          config.columns.forEach((col: string) => {
            row[col] = `Value ${i + 1}`
          })
        }
        tableData.push(row)
      }
      return tableData
      
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
      return { value: rowCount }
  }
}