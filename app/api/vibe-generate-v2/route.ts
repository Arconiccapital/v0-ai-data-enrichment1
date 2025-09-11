import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307'
const MAX_TOKENS = 1000 // Much smaller since we're just generating config

export async function POST(request: NextRequest) {
  try {
    const { prompt, headers, data } = await request.json()
    
    console.log('🎨 Vibe Generate V2 API called with prompt:', prompt)
    
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
    if (!apiKey || apiKey === 'your-claude-api-key-here') {
      return NextResponse.json({
        success: false,
        error: 'No API key configured'
      })
    }
    
    const anthropic = new Anthropic({ apiKey })
    
    // Prepare sample data for Claude
    const sampleData = data.slice(0, 5).map(row => {
      const obj: any = {}
      headers.forEach((header, index) => {
        obj[header] = row[index]
      })
      return obj
    })
    
    const systemPrompt = `You are a data visualization expert. Based on the user's request, generate a JSON configuration for data visualization.

AVAILABLE VISUALIZATION TYPES:
- "bar": Bar chart for comparing values
- "line": Line chart for trends over time
- "pie": Pie chart for showing proportions
- "kpi": KPI cards for key metrics
- "table": Data table for detailed view
- "dashboard": Multi-chart dashboard combining multiple visualizations

RESPONSE FORMAT:
You must respond with ONLY valid JSON (no markdown, no explanations). The JSON should have this structure:
{
  "type": "bar|line|pie|kpi|table|dashboard",
  "config": {
    "title": "Chart Title",
    "description": "Optional description",
    "dataKey": "column_name_for_values",
    "nameKey": "column_name_for_labels",
    // Additional config based on type
  }
}

For dashboard type, include a "charts" array:
{
  "type": "dashboard",
  "config": {
    "title": "Dashboard Title",
    "charts": [
      { "type": "kpi", "config": { "title": "Metrics" } },
      { "type": "bar", "config": { "title": "Comparison" } }
    ]
  }
}

RULES:
- Return ONLY valid JSON
- Choose the most appropriate visualization type for the request
- Use actual column names from the data
- Keep configurations simple and focused`

    const userPrompt = `User request: "${prompt}"

Available columns: ${headers.join(', ')}
Sample data: ${JSON.stringify(sampleData, null, 2)}

Generate a JSON configuration for the best visualization. Return ONLY the JSON, no other text.`

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.2, // Low temperature for consistent JSON
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userPrompt
      }]
    })
    
    const content = response.content[0]
    const rawResponse = content?.type === 'text' ? content.text : ''
    
    try {
      // Try to parse as JSON
      const config = JSON.parse(rawResponse)
      
      // Validate the config has required fields
      if (!config.type || !config.config) {
        throw new Error('Invalid configuration structure')
      }
      
      console.log('✅ Successfully generated visualization config:', config.type)
      
      return NextResponse.json({
        success: true,
        visualizationConfig: config,
        model: MODEL
      })
      
    } catch (parseError) {
      // Try to extract JSON from the response if it has extra text
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const config = JSON.parse(jsonMatch[0])
          if (config.type && config.config) {
            console.log('✅ Extracted valid config from response')
            return NextResponse.json({
              success: true,
              visualizationConfig: config,
              model: MODEL
            })
          }
        } catch (e) {
          // Continue to error response
        }
      }
      
      console.error('❌ Failed to parse configuration:', parseError)
      
      // Fallback to a simple table view
      return NextResponse.json({
        success: true,
        visualizationConfig: {
          type: 'table',
          config: {
            title: 'Data View',
            description: `Showing data for: ${prompt}`
          }
        },
        model: MODEL,
        fallback: true
      })
    }
    
  } catch (error) {
    console.error('Vibe generation error:', error)
    
    // Even on error, return a basic table view
    return NextResponse.json({
      success: true,
      visualizationConfig: {
        type: 'table',
        config: {
          title: 'Data View',
          description: 'Default view'
        }
      },
      model: 'fallback',
      fallback: true
    })
  }
}