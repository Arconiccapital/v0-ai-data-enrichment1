import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307'
const MAX_TOKENS = Number(process.env.VIBE_MAX_TOKENS || 3000)

// Helper function to extract code from various response formats
function extractCodeFromResponse(response: string): string | null {
  // First, try to extract from markdown code blocks
  const codeBlockRegex = /```(?:javascript|jsx|js|typescript|tsx)?\n?([\s\S]*?)```/
  const codeBlockMatch = response.match(codeBlockRegex)
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim()
  }

  // Second, look for function definition directly
  const functionRegex = /function\s+GeneratedVisualization[\s\S]*?^}/m
  const functionMatch = response.match(functionRegex)
  if (functionMatch) {
    return functionMatch[0]
  }

  // Third, if the response starts with function, assume it's all code
  if (response.trim().startsWith('function GeneratedVisualization')) {
    return response.trim()
  }

  // Last resort: try to find anything between function and the last closing brace
  const lastResortRegex = /function GeneratedVisualization[\s\S]*\n}/
  const lastResortMatch = response.match(lastResortRegex)
  if (lastResortMatch) {
    return lastResortMatch[0]
  }

  return null
}

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

CRITICAL INSTRUCTIONS:
- Return ONLY the function code, nothing else
- Do NOT include any explanatory text before or after the code
- Do NOT wrap the code in markdown code blocks
- Do NOT include comments outside the function
- Start directly with: function GeneratedVisualization
- End with the closing brace of the function

CORRECT EXAMPLE:
function GeneratedVisualization({ data, headers }) {
  return <div>...</div>
}

INCORRECT EXAMPLE (DO NOT DO THIS):
Here is a React component:
\`\`\`javascript
function GeneratedVisualization({ data, headers }) {
  return <div>...</div>
}
\`\`\`

AVAILABLE IMPORTS (already available in scope, do not import):
- React and all React hooks (useState, useEffect, useMemo, useCallback)
- All Recharts components (BarChart, LineChart, PieChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell)
- All Lucide icons (ArrowUp, ArrowDown, TrendingUp, Users, DollarSign, Activity, etc.)
- UI components: Card, CardContent, CardHeader, CardTitle, CardDescription, Badge

STYLING:
- Use Tailwind CSS classes for all styling
- Make it responsive and beautiful

REQUIREMENTS:
1. Generate ONLY the component code, no explanations
2. Component must accept props: data and headers (without type annotations)
3. The data array contains objects where keys are the header names (e.g., data[0].Company, data[0].Revenue)
4. Create a beautiful UI that matches the user's intent
5. Use real data values from the actual data objects
6. DO NOT include TypeScript type annotations - use pure JavaScript

START YOUR RESPONSE WITH:
function GeneratedVisualization({ data, headers }) {

END YOUR RESPONSE WITH:
}`

    const userPrompt = `USER REQUEST: "${prompt}"

DATA STRUCTURE:
Columns: ${headers.join(', ')}
Total Rows: ${data.length}

SAMPLE DATA (first 10 rows):
${JSON.stringify(sampleData, null, 2)}

Generate the React component code ONLY. No explanations, no markdown, just the function code.`

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.3, // Lower temperature for more consistent output format
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userPrompt
      }]
    })
    
    // Extract the component code from Claude's response
    const content = response.content[0]
    let rawResponse = content?.type === 'text' ? content.text : ''
    
    console.log('📝 Raw response length:', rawResponse.length)
    console.log('📝 First 100 chars:', rawResponse.substring(0, 100))
    
    // Extract code from the response
    const extractedCode = extractCodeFromResponse(rawResponse)
    
    if (extractedCode) {
      // Additional validation
      if (extractedCode.includes('function GeneratedVisualization') && 
          extractedCode.includes('return') &&
          !extractedCode.includes('```')) {
        console.log('✅ Successfully extracted and validated React component')
        return NextResponse.json({
          success: true,
          code: extractedCode,
          model: MODEL
        })
      }
    }
    
    // If extraction failed, log the issue
    console.error('❌ Failed to extract valid code from response')
    console.error('Raw response:', rawResponse.substring(0, 500))
    
    // Try one more time with stricter prompt
    const retryResponse = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.1, // Even lower temperature
      system: 'Return ONLY a JavaScript function named GeneratedVisualization. Start with "function GeneratedVisualization" and end with "}". No other text.',
      messages: [{
        role: 'user',
        content: `Create a React component for: "${prompt}". Data has columns: ${headers.join(', ')}. Return ONLY the function code.`
      }]
    })
    
    const retryContent = retryResponse.content[0]
    const retryRawResponse = retryContent?.type === 'text' ? retryContent.text : ''
    const retryExtractedCode = extractCodeFromResponse(retryRawResponse)
    
    if (retryExtractedCode && retryExtractedCode.includes('function GeneratedVisualization')) {
      console.log('✅ Retry successful')
      return NextResponse.json({
        success: true,
        code: retryExtractedCode,
        model: MODEL
      })
    }
    
    // Final fallback
    return NextResponse.json({
      success: false,
      error: 'Failed to generate valid React component',
      rawResponse: rawResponse.substring(0, 1000) // Include for debugging
    })
    
  } catch (error) {
    console.error('Vibe generation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed'
    })
  }
}