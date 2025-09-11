import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307'
const MAX_TOKENS = Number(process.env.VIBE_MAX_TOKENS || 3000)

export async function POST(request: NextRequest) {
  try {
    const { prompt, headers, data } = await request.json()
    
    console.log('🎨 Vibe Generate API called with prompt:', prompt)
    
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
    if (!apiKey || apiKey === 'your-claude-api-key-here') {
      console.log('⚠️ No API key configured')
      return NextResponse.json({
        success: false,
        error: 'No API key configured'
      })
    }
    
    const anthropic = new Anthropic({ apiKey })
    
    // Prepare sample data for Claude (first 10 rows to keep token usage reasonable)
    // Convert to object format to match what the component will receive
    const sampleData = data.slice(0, 10).map(row => {
      const obj: any = {}
      headers.forEach((header, index) => {
        obj[header] = row[index]
      })
      return obj
    })
    
    const systemPrompt = `You are an expert React developer. Generate a complete, self-contained React component based on the user's request and data.

IMPORTANT: Generate pure JavaScript without TypeScript type annotations. Do NOT include type definitions like ": { data: any[], headers: string[] }" in the function signature.

AVAILABLE IMPORTS:
- import { BarChart, LineChart, PieChart, AreaChart, RadarChart, ComposedChart, Treemap, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
- import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
- import { Badge } from '@/components/ui/badge'
- import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Users, DollarSign, Activity, CreditCard, Package, ShoppingCart, Calendar, Clock, Globe, Mail, Phone, MapPin, Star, Heart, AlertCircle, CheckCircle, Info } from 'lucide-react'

STYLING:
- Use Tailwind CSS classes for all styling
- Use modern, clean design principles
- Make it responsive and beautiful

REQUIREMENTS:
1. Generate ONLY the component code, no explanations
2. Component must accept props: data and headers (without type annotations)
3. The data array contains objects where keys are the header names (e.g., data[0].Company, data[0].Revenue)
4. Process and transform the data as needed for visualizations
5. Create a beautiful UI that matches the user's intent
6. Use real data values from the actual data objects, not placeholders
7. DO NOT include TypeScript type annotations - use pure JavaScript

INTERPRETING USER REQUESTS:
- "report" → Create formal document-style layout with sections and summaries
- "dashboard" → Create grid layout with multiple charts and KPI cards
- "presentation" → Create slide-like sections with large, impactful visuals
- "analysis" → Focus on detailed charts with insights
- "summary" → Create concise overview with key metrics
- Creative requests → Interpret and create matching unique designs

START YOUR RESPONSE WITH:
function GeneratedVisualization({ data, headers }) {

END YOUR RESPONSE WITH:
}
`

    const userPrompt = `USER REQUEST: "${prompt}"

DATA STRUCTURE:
Columns: ${headers.join(', ')}
Total Rows: ${data.length}

SAMPLE DATA (first 10 rows):
${JSON.stringify(sampleData, null, 2)}

Based on the user's request "${prompt}", generate a React component that visualizes this data exactly as requested. Make it beautiful, functional, and perfectly matched to what the user asked for.`

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userPrompt
      }]
    })
    
    // Extract the component code from Claude's response
    const content = response.content[0]
    const componentCode = content?.type === 'text' ? content.text : ''
    
    // Basic validation that it looks like a React component
    if (componentCode.includes('function GeneratedVisualization') && componentCode.includes('return')) {
      console.log('✅ Successfully generated React component')
      return NextResponse.json({
        success: true,
        code: componentCode,
        model: MODEL
      })
    } else {
      console.error('❌ Generated code does not appear to be a valid React component')
      return NextResponse.json({
        success: false,
        error: 'Failed to generate valid React component',
        code: componentCode // Still return it for debugging
      })
    }
    
  } catch (error) {
    console.error('Vibe generation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed'
    })
  }
}