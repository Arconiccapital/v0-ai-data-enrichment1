import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307'

// Template-specific schemas
const templateSchemas = {
  'sales-dashboard': {
    headers: ['Month', 'Revenue', 'Units_Sold', 'Region', 'Product_Category', 'Sales_Rep', 'Target', 'Achievement_Percent'],
    description: 'Sales performance tracking with revenue, targets, and regional breakdowns'
  },
  'customer-analytics': {
    headers: ['Customer_ID', 'Segment', 'Lifetime_Value', 'Churn_Risk', 'Last_Purchase_Date', 'Total_Purchases', 'Satisfaction_Score', 'Support_Tickets'],
    description: 'Customer behavior analysis with segmentation and retention metrics'
  },
  'marketing-metrics': {
    headers: ['Campaign_Name', 'Channel', 'Impressions', 'Clicks', 'Conversions', 'Cost', 'ROI', 'Start_Date', 'End_Date'],
    description: 'Marketing campaign performance with ROI and channel attribution'
  },
  'product-usage': {
    headers: ['Feature_Name', 'Daily_Active_Users', 'Weekly_Active_Users', 'Adoption_Rate', 'Engagement_Score', 'Date', 'User_Segment'],
    description: 'Product feature adoption and user engagement metrics'
  }
}

// Generate realistic sample data based on schema
function generateSampleData(headers: string[], rowCount: number = 10): any[] {
  const data = []
  
  for (let i = 0; i < rowCount; i++) {
    const row: any = {}
    
    headers.forEach(header => {
      const lowerHeader = header.toLowerCase()
      
      // Generate appropriate data based on column name
      if (lowerHeader.includes('id')) {
        row[header] = `ID${1000 + i}`
      } else if (lowerHeader.includes('date')) {
        const date = new Date()
        date.setDate(date.getDate() - (rowCount - i) * 30)
        row[header] = date.toISOString().split('T')[0]
      } else if (lowerHeader.includes('month')) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        row[header] = months[i % 12]
      } else if (lowerHeader.includes('revenue') || lowerHeader.includes('value') || lowerHeader.includes('cost')) {
        row[header] = Math.floor(Math.random() * 100000) + 10000
      } else if (lowerHeader.includes('percent') || lowerHeader.includes('rate')) {
        row[header] = Math.floor(Math.random() * 100)
      } else if (lowerHeader.includes('score')) {
        row[header] = (Math.random() * 5).toFixed(1)
      } else if (lowerHeader.includes('count') || lowerHeader.includes('units') || lowerHeader.includes('users')) {
        row[header] = Math.floor(Math.random() * 1000) + 100
      } else if (lowerHeader.includes('name')) {
        row[header] = `${header.replace(/_/g, ' ')} ${i + 1}`
      } else if (lowerHeader.includes('region')) {
        const regions = ['North', 'South', 'East', 'West', 'Central']
        row[header] = regions[i % regions.length]
      } else if (lowerHeader.includes('category') || lowerHeader.includes('segment')) {
        const categories = ['Premium', 'Standard', 'Basic', 'Enterprise', 'Professional']
        row[header] = categories[i % categories.length]
      } else if (lowerHeader.includes('channel')) {
        const channels = ['Email', 'Social Media', 'Direct', 'Organic Search', 'Paid Ads']
        row[header] = channels[i % channels.length]
      } else if (lowerHeader.includes('risk')) {
        const risks = ['Low', 'Medium', 'High']
        row[header] = risks[i % risks.length]
      } else {
        row[header] = `${header} ${i + 1}`
      }
    })
    
    data.push(row)
  }
  
  return data
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, template } = await request.json()
    
    console.log('🎨 Vibe Schema API called with:', { prompt, template })
    
    // If a template is selected, use predefined schema
    if (template && templateSchemas[template]) {
      const schema = templateSchemas[template]
      const sampleData = generateSampleData(schema.headers)
      
      return NextResponse.json({
        success: true,
        schema: {
          headers: schema.headers,
          sampleData,
          description: schema.description
        }
      })
    }
    
    // Otherwise, use AI to generate schema from prompt
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
    if (!apiKey || apiKey === 'your-claude-api-key-here') {
      // Fallback to a generic schema if no API key
      const genericHeaders = ['Date', 'Category', 'Value', 'Count', 'Status', 'Description']
      return NextResponse.json({
        success: true,
        schema: {
          headers: genericHeaders,
          sampleData: generateSampleData(genericHeaders),
          description: 'Generic data schema for visualization'
        }
      })
    }
    
    const anthropic = new Anthropic({ apiKey })
    
    const systemPrompt = `You are a data schema designer. Based on the user's visualization request, generate an appropriate data schema.

Return a JSON object with:
1. headers: Array of column names (use underscores for spaces)
2. description: Brief description of what this data represents

Guidelines:
- Column names should be clear and descriptive
- Include appropriate columns for the requested visualization
- Consider time-based columns if trends are mentioned
- Include categorical columns for grouping/segmentation
- Include numeric columns for metrics
- Maximum 10 columns

Example response:
{
  "headers": ["Date", "Sales_Amount", "Region", "Product_Category"],
  "description": "Sales data with regional and product breakdowns"
}`

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 500,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Generate a data schema for this visualization request: "${prompt}"`
      }]
    })
    
    const content = response.content[0]
    const rawResponse = content?.type === 'text' ? content.text : ''
    
    try {
      // Parse the JSON response
      const schemaData = JSON.parse(rawResponse)
      
      // Generate sample data
      const sampleData = generateSampleData(schemaData.headers, 10)
      
      return NextResponse.json({
        success: true,
        schema: {
          headers: schemaData.headers,
          sampleData,
          description: schemaData.description || 'Custom data schema for your visualization'
        }
      })
    } catch (parseError) {
      // Fallback if JSON parsing fails
      console.error('Failed to parse schema response:', parseError)
      
      const fallbackHeaders = ['Date', 'Metric_1', 'Metric_2', 'Category', 'Value']
      return NextResponse.json({
        success: true,
        schema: {
          headers: fallbackHeaders,
          sampleData: generateSampleData(fallbackHeaders),
          description: 'Data schema generated for your visualization'
        }
      })
    }
    
  } catch (error) {
    console.error('Schema generation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Schema generation failed'
    })
  }
}