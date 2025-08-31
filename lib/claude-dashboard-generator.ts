import Anthropic from '@anthropic-ai/sdk'
import { DashboardTemplate, DashboardWidget } from './dashboard-templates'

// Model configuration from environment
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022'
// Use 4096 max tokens for Haiku model, 8000 for Sonnet
const MAX_TOKENS = MODEL.includes('haiku') ? 4096 : parseInt(process.env.ANTHROPIC_MAX_TOKENS || '8000')
const TEMPERATURE = parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.7')

// Expert system prompt for all interactions
const EXPERT_SYSTEM_PROMPT = `You are a Principal Data Scientist at McKinsey with 15 years experience in dashboard design, combining expertise in:
- Statistical analysis and machine learning
- Business strategy and KPI frameworks (OKRs, Balanced Scorecard, North Star metrics)
- Information design following Tufte, Few, and Cairo principles
- UX principles and WCAG accessibility standards
- Industry-specific metrics and benchmarks across verticals

Your approach:
1. Detect data domain automatically (Sales, HR, Finance, Operations, Marketing, etc.)
2. Apply industry best practices and benchmarks
3. Follow visual hierarchy and progressive disclosure
4. Ensure mobile-first responsive design
5. Structure outputs for immediate implementation with exact schemas

Always respond with valid JSON only, no explanations or markdown formatting.`

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
    const prompt = `Perform comprehensive analysis as a senior data analyst and business intelligence expert:

=== DATASET OVERVIEW ===
Columns: ${data.headers.join(', ')}
Row Count: ${data.rows.length}
Sample Data (first 10 rows):
${data.rows.slice(0, 10).map((row, idx) => 
  `Row ${idx + 1}: ${row.map((cell, i) => `${data.headers[i]}: ${cell}`).join(', ')}`
).join('\n')}

=== REQUIRED ANALYSIS ===

1. DOMAIN CLASSIFICATION
   - Primary domain (Sales/HR/Finance/Operations/Marketing/Customer/Product)
   - Industry vertical detection
   - Business function identification
   - Data maturity level (raw/processed/aggregated)

2. STATISTICAL PROFILE
   - Data types per column (numeric/categorical/temporal/text/identifier)
   - Distributions and ranges
   - Null/missing value analysis
   - Outlier detection
   - Correlations matrix for numeric columns

3. BUSINESS METRICS DISCOVERY
   - Automatically identified KPIs
   - Calculated fields needed (ratios, percentages, aggregations)
   - Time-based metrics (YoY, MoM, trends)
   - Segmentation opportunities
   - Benchmarkable metrics

4. DATA QUALITY ASSESSMENT
   - Completeness score (0-100)
   - Consistency score (0-100)
   - Accuracy indicators
   - Timeliness assessment
   - Improvement recommendations

5. RELATIONSHIP MAPPING
   - Primary keys/identifiers
   - Foreign key relationships
   - Hierarchical structures
   - Temporal relationships
   - Correlation insights

6. ACTIONABLE INSIGHTS
   - Top 5 key findings
   - Anomalies detected
   - Trends and patterns
   - Predictive opportunities
   - Risk indicators

7. DASHBOARD STRATEGY
   - Recommended dashboard type (Executive/Operational/Analytical)
   - User personas and their needs
   - Information architecture
   - Key story to tell with data
   - Success metrics for dashboard

Return as structured JSON with all sections.`

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      temperature: TEMPERATURE,
      messages: [{
        role: 'user',
        content: prompt
      }],
      system: EXPERT_SYSTEM_PROMPT
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
        model: MODEL
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
  const prompt = `=== WIDGET GENERATION CONTEXT ===
Dashboard Type: ${template.name}
Section: ${section.title}
Widget: ${widget.title}
Widget Type: ${widget.type}
${customPrompt ? `User Intent: ${customPrompt}` : ''}

=== DATA CONTEXT ===
Columns: ${data.headers.join(', ')}
Total Rows: ${data.rows.length}
Data Sample (first 10 rows for better pattern detection):
${data.rows.slice(0, 10).map((row, idx) => 
  row.map((cell, i) => `${data.headers[i]}: ${cell}`).join(' | ')
).join('\n')}

=== WIDGET REQUIREMENTS ===
Type: ${widget.type}
Configuration: ${JSON.stringify(widget.config, null, 2)}

=== GENERATION INSTRUCTIONS ===
${getEnhancedWidgetInstructions(widget.type)}

=== QUALITY CRITERIA ===
1. Use ACTUAL data values from the sample, not generic placeholders
2. Ensure statistical accuracy (sums, averages, percentages must be correct)
3. Apply business logic (e.g., revenue = quantity × price)
4. Include comparative metrics (vs previous period, vs target)
5. Add context indicators (trending up/down, alerts for anomalies)
6. Ensure accessibility (color contrast, alt text for visual elements)
7. Optimize for mobile display

=== OUTPUT SCHEMA ===
${getWidgetSchema(widget.type)}

Generate production-ready widget data following the exact schema above.`

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2500,
      temperature: TEMPERATURE,
      messages: [{
        role: 'user',
        content: prompt
      }],
      system: EXPERT_SYSTEM_PROMPT
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

function getEnhancedWidgetInstructions(type: string): string {
  const instructions: Record<string, string> = {
    'metric': `
      - Calculate the EXACT metric value from the data
      - Include percentage change vs previous period
      - Add trend indicator (up/down/stable)
      - Provide context (good/warning/critical threshold)
      - Include sparkline data for last 7-30 periods
      - Add comparison to target/benchmark if applicable`,
    'chart': `
      - Use real data points, not placeholders
      - Include at least 7-12 data points for trends
      - Add comparison series (previous period, target)
      - Include data labels for key points
      - Ensure color accessibility (WCAG AA compliant)
      - Add annotations for significant events`,
    'table': `
      - Include 5-10 most relevant rows
      - Sort by importance/value by default
      - Add summary row with totals/averages
      - Include % of total column where relevant
      - Add visual indicators (badges, colors) for status
      - Ensure responsive column widths`,
    'heatmap': `
      - Use actual data correlations
      - Include clear axis labels
      - Use colorblind-friendly palette
      - Add value labels on cells
      - Include legend with clear ranges
      - Highlight significant patterns`,
    'gauge': `
      - Calculate actual percentage of target
      - Include clear zones (critical/warning/good)
      - Add context labels
      - Show min/max/current values
      - Include trend arrow
      - Add benchmark line if applicable`,
    'default': `
      - Use actual data from the sample
      - Ensure statistical accuracy
      - Include comparative context
      - Add visual hierarchy
      - Optimize for quick scanning
      - Include drill-down hints`
  }
  
  return instructions[type] || instructions.default
}

function getWidgetSchema(type: string): string {
  const schemas: Record<string, string> = {
    'metric': `{
      "value": number | string,
      "label": string,
      "change": { "value": number, "percentage": number, "trend": "up" | "down" | "stable" },
      "sparkline": number[],
      "status": "good" | "warning" | "critical",
      "target": number (optional),
      "unit": string (optional)
    }`,
    'chart': `{
      "type": "line" | "bar" | "area" | "scatter",
      "data": {
        "labels": string[],
        "datasets": [{
          "label": string,
          "data": number[],
          "borderColor": string,
          "backgroundColor": string,
          "tension": number
        }]
      },
      "options": { "responsive": true, "plugins": {...} }
    }`,
    'table': `{
      "columns": [{ "key": string, "label": string, "type": string, "width": string }],
      "rows": [{ [key]: any }],
      "summary": { [key]: any },
      "sorting": { "column": string, "direction": "asc" | "desc" }
    }`,
    'default': `{
      "type": string,
      "data": any,
      "config": object,
      "metadata": { "lastUpdated": string, "source": string }
    }`
  }
  
  return schemas[type] || schemas.default
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
    // First, analyze the data to understand context
    const dataAnalysis = await analyzeDataWithClaude(data)
    
    const systemPrompt = `${EXPERT_SYSTEM_PROMPT}

You are creating an executive-ready dashboard following these principles:
1. McKinsey Pyramid Principle - Start with key insights, drill down to details
2. Gestalt Principles - Visual hierarchy, proximity, and similarity
3. F-Pattern/Z-Pattern reading flow for optimal scanning
4. Progressive Disclosure - Overview first, details on demand
5. Mobile-First Responsive Design

Dashboard Structure Requirements:
{
  title: string (concise, action-oriented)
  description: string (one-line value proposition)
  theme: "executive" | "operational" | "analytical" | "monitoring"
  sections: Array<{
    title: string
    description?: string
    layout: "grid" | "single" | "split"
    priority: number (1-5, for mobile collapse order)
    widgets: Array<{
      id: string (unique identifier)
      type: 'kpi' | 'chart' | 'table' | 'scorecard' | 'funnel' | 'progress' | 'heatmap' | 'gauge'
      title: string
      subtitle?: string
      dataKey: string
      size: "small" | "medium" | "large" | "full"
      config: {
        visualization?: object
        thresholds?: object
        comparisons?: object
        interactions?: object
      }
      data: any (actual computed data from the dataset)
      insights?: string[] (key takeaways)
      actions?: string[] (recommended actions)
    }>
  }>
  filters?: Array<{
    type: "date" | "select" | "search"
    field: string
    label: string
    default?: any
  }>
  alerts?: Array<{
    condition: string
    message: string
    severity: "info" | "warning" | "critical"
  }>
}`

    const userPrompt = `=== USER REQUEST ===
"${prompt}"

=== DATA CONTEXT ===
Domain: ${dataAnalysis?.domain || 'General'}
Industry: ${dataAnalysis?.industry || 'Unknown'}
Key Metrics Detected: ${dataAnalysis?.metrics?.join(', ') || 'Various'}

Columns: ${data.headers.join(', ')}
Row Count: ${data.rows.length}
Data Sample (first 15 rows for comprehensive analysis):
${data.rows.slice(0, 15).map((row, idx) => 
  row.map((cell, i) => `${data.headers[i]}: ${cell}`).join(' | ')
).join('\n')}

=== DASHBOARD REQUIREMENTS ===

1. INFORMATION ARCHITECTURE
   - Determine primary user persona (Executive/Manager/Analyst/Operations)
   - Structure sections by importance and logical flow
   - Group related metrics together
   - Ensure mobile-responsive layout

2. KEY METRICS (Top Section)
   - Identify 3-5 North Star metrics
   - Include trend indicators and comparisons
   - Add sparklines for context
   - Show progress to goals

3. ANALYTICAL DEPTH (Middle Sections)
   - Trend analysis with time series
   - Comparative analysis (segments, periods, competitors)
   - Correlation and causation insights
   - Predictive indicators where applicable

4. OPERATIONAL DETAIL (Lower Sections)
   - Detailed tables with sorting/filtering
   - Drill-down capabilities
   - Exception reporting
   - Action items and recommendations

5. VISUAL EXCELLENCE
   - Choose appropriate chart types for data
   - Ensure colorblind accessibility
   - Maintain consistent visual language
   - Use annotations for key insights

6. INTERACTIVITY
   - Global filters for date/segment
   - Hover details and tooltips
   - Click-through to details
   - Export capabilities hint

Generate a production-ready dashboard that tells a compelling data story.`

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      messages: [{
        role: 'user',
        content: userPrompt
      }],
      system: systemPrompt
    })

    const content = response.content[0]
    if (content.type === 'text') {
      try {
        
        // More robust JSON extraction
        let jsonText = content.text
        
        // Try to find JSON object in the response
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
        
        // Clean up the text
        jsonText = jsonText
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .replace(/^[^{]*/, '') // Remove everything before first {
          .replace(/[^}]*$/, '') // Remove everything after last }
          .trim()
        
        // Attempt to fix common JSON issues
        jsonText = jsonText
          .replace(/,\s*}/, '}') // Remove trailing commas before }
          .replace(/,\s*]/, ']') // Remove trailing commas before ]
          .replace(/([^"]),\s*,/g, '$1,') // Remove duplicate commas
          
        
        const dashboard = JSON.parse(jsonText)
        
        // Validate required structure
        if (!dashboard.title || !dashboard.sections) {
          console.error('Invalid dashboard structure - missing title or sections')
          throw new Error('Invalid dashboard structure')
        }
        
        // Add metadata
        dashboard.metadata = {
          generatedAt: new Date().toISOString(),
          rowCount: data.rows.length,
          model: MODEL,
          fromPrompt: true
        }
        
        return dashboard
      } catch (error: any) {
        console.error('Failed to parse dashboard JSON:', error.message)
        console.error('Full response was:', content.text)
        
        // Return a better fallback dashboard with actual data insights
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
  const lowerPrompt = prompt.toLowerCase()
  
  // Check if this is a VC investment analysis request
  if (lowerPrompt.includes('vc') || lowerPrompt.includes('venture') || 
      lowerPrompt.includes('investment') || lowerPrompt.includes('scoring') ||
      lowerPrompt.includes('diligence')) {
    return generateVCInvestmentDashboard(data)
  }
  
  // Check for other specific dashboard types
  if (lowerPrompt.includes('sales') || lowerPrompt.includes('revenue')) {
    return generateSalesDashboard(data)
  }
  
  if (lowerPrompt.includes('customer') || lowerPrompt.includes('user')) {
    return generateCustomerDashboard(data)
  }
  
  if (lowerPrompt.includes('finance') || lowerPrompt.includes('financial')) {
    return generateFinancialDashboard(data)
  }
  
  // Default generic dashboard
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

function generateVCInvestmentDashboard(data: DataContext) {
  return {
    title: "VC Investment Analysis Dashboard",
    type: "vc-investment",
    sections: [
      {
        title: "Investment Scoring Framework",
        description: "Comprehensive VC investment criteria evaluation",
        layout: "single",
        widgets: [
          {
            id: "vc_scoring_matrix",
            type: "vc-scoring" as const,
            title: "VC Investment Scoring Matrix",
            dataKey: "scoring",
            config: {
              framework: "comprehensive",
              categories: ["MARKET", "TEAM", "PRODUCT", "GTM", "TECH", "BUSINESS & DEAL"]
            },
            data: {
              companyName: data.rows[0]?.[0] || "Target Company",
              scores: {}
            }
          }
        ]
      }
    ],
    metadata: {
      generatedAt: new Date().toISOString(),
      rowCount: data.rows.length,
      model: 'vc-framework',
      fromPrompt: true,
      mock: true
    }
  }
}

function generateSalesDashboard(data: DataContext) {
  return {
    title: "Sales Performance Dashboard",
    sections: [
      {
        title: "Sales Overview",
        description: "Key sales metrics and KPIs",
        widgets: [
          {
            id: "sales_kpis",
            type: "kpi" as const,
            title: "Sales Metrics",
            dataKey: "sales_metrics",
            config: {
              metrics: [
                { label: "Total Revenue", key: "revenue", format: "currency" },
                { label: "Deals Closed", key: "deals", format: "number" },
                { label: "Win Rate", key: "win_rate", format: "percentage" },
                { label: "Avg Deal Size", key: "avg_deal", format: "currency" }
              ]
            },
            data: {
              revenue: 2500000,
              deals: 47,
              win_rate: 32,
              avg_deal: 53191
            }
          },
          {
            id: "sales_funnel",
            type: "funnel" as const,
            title: "Sales Pipeline",
            dataKey: "pipeline",
            config: {
              stages: ["Leads", "Qualified", "Proposal", "Negotiation", "Closed"]
            },
            data: {
              "Leads": 1000,
              "Qualified": 450,
              "Proposal": 200,
              "Negotiation": 100,
              "Closed": 47
            }
          }
        ]
      }
    ],
    metadata: {
      generatedAt: new Date().toISOString(),
      rowCount: data.rows.length,
      model: 'sales',
      fromPrompt: true,
      mock: true
    }
  }
}

function generateCustomerDashboard(data: DataContext) {
  return {
    title: "Customer Analytics Dashboard",
    sections: [
      {
        title: "Customer Overview",
        description: "Customer metrics and engagement",
        widgets: [
          {
            id: "customer_kpis",
            type: "kpi" as const,
            title: "Customer Metrics",
            dataKey: "customer_metrics",
            config: {
              metrics: [
                { label: "Total Customers", key: "total", format: "number" },
                { label: "Active Users", key: "active", format: "number" },
                { label: "NPS Score", key: "nps", format: "number" },
                { label: "Churn Rate", key: "churn", format: "percentage" }
              ]
            },
            data: {
              total: 5420,
              active: 3891,
              nps: 72,
              churn: 5.2
            }
          }
        ]
      }
    ],
    metadata: {
      generatedAt: new Date().toISOString(),
      rowCount: data.rows.length,
      model: 'customer',
      fromPrompt: true,
      mock: true
    }
  }
}

function generateFinancialDashboard(data: DataContext) {
  return {
    title: "Financial Overview Dashboard",
    sections: [
      {
        title: "Financial Summary",
        description: "P&L and key financial metrics",
        widgets: [
          {
            id: "financial_kpis",
            type: "kpi" as const,
            title: "Financial Metrics",
            dataKey: "financial_metrics",
            config: {
              metrics: [
                { label: "Revenue", key: "revenue", format: "currency" },
                { label: "Expenses", key: "expenses", format: "currency" },
                { label: "Net Profit", key: "profit", format: "currency" },
                { label: "Margin", key: "margin", format: "percentage" }
              ]
            },
            data: {
              revenue: 5000000,
              expenses: 3500000,
              profit: 1500000,
              margin: 30
            }
          }
        ]
      }
    ],
    metadata: {
      generatedAt: new Date().toISOString(),
      rowCount: data.rows.length,
      model: 'financial',
      fromPrompt: true,
      mock: true
    }
  }
}