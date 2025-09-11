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

// Helper function to AGGRESSIVELY fix ALL issues in generated code
function fixRechartsCode(code: string): string {
  let fixedCode = code
  
  // 1. Remove ALL TypeScript annotations - be VERY aggressive
  fixedCode = fixedCode.replace(/:\s*(?:React\.)?(?:FC|FunctionComponent|ComponentType|ReactElement|ReactNode|JSX\.Element)(?:<[^>]*>)?/g, '')
  fixedCode = fixedCode.replace(/:\s*(?:string|number|boolean|any|void|undefined|null|object|Array)(?:\[\])?(?:<[^>]*>)?/g, '')
  fixedCode = fixedCode.replace(/interface\s+\w+\s*{[^}]*}/g, '')
  fixedCode = fixedCode.replace(/type\s+\w+\s*=[^;]*;/g, '')
  fixedCode = fixedCode.replace(/as\s+\w+/g, '') // Remove type assertions
  
  // 2. Fix broken JSX tags
  // Find all opening tags and ensure they have closing tags
  const openingTags = [...fixedCode.matchAll(/<(\w+)(?:\s[^>]*)?>/g)]
  const selfClosingTags = ['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr']
  
  openingTags.forEach(match => {
    const tagName = match[1]
    if (!selfClosingTags.includes(tagName.toLowerCase())) {
      // Check if closing tag exists
      const closingTagRegex = new RegExp(`</${tagName}>`, 'g')
      const openCount = (fixedCode.match(new RegExp(`<${tagName}(?:\\s[^>]*)?>`, 'g')) || []).length
      const closeCount = (fixedCode.match(closingTagRegex) || []).length
      
      // Add missing closing tags at the end if needed
      if (openCount > closeCount) {
        console.log(`⚠️ Fixing missing closing tag for <${tagName}>`)
        // Try to find where to insert the closing tag
        const tagStart = fixedCode.indexOf(match[0])
        // Find the next closing tag or end of component
        let insertPoint = fixedCode.length - 1
        const afterTag = fixedCode.substring(tagStart + match[0].length)
        const nextClosingMatch = afterTag.match(/<\/\w+>/)
        if (nextClosingMatch) {
          insertPoint = tagStart + match[0].length + nextClosingMatch.index!
          fixedCode = fixedCode.substring(0, insertPoint) + `</${tagName}>` + fixedCode.substring(insertPoint)
        }
      }
    }
  })
  
  // 2. Fix ALL Recharts issues - SUPER AGGRESSIVE
  // First, let's identify ALL chart components in the code
  const chartComponentRegex = /<(XAxis|YAxis|Bar|Line|Area|Pie|CartesianGrid|Tooltip|Legend|Cell)(?:\s[^>]*)?(?:\/?>|>[\s\S]*?<\/\1>)/g
  const chartMatches = [...fixedCode.matchAll(chartComponentRegex)]
  
  if (chartMatches.length === 0) {
    return fixedCode // No charts, return as is
  }
  
  console.log(`🔍 Found ${chartMatches.length} chart components to fix`)

  // Check if ANY chart containers exist
  const chartContainers = ['BarChart', 'LineChart', 'PieChart', 'AreaChart', 'ComposedChart', 'ScatterChart', 'RadarChart']
  const hasAnyContainer = chartContainers.some(c => fixedCode.includes(`<${c}`))
  
  if (!hasAnyContainer && chartMatches.length > 0) {
    console.log('⚠️ NO chart containers found! Wrapping ALL chart components')
    
    // Determine chart type from components
    let chartType = 'BarChart'
    const componentsStr = chartMatches.map(m => m[1]).join(',')
    if (componentsStr.includes('Line')) chartType = 'LineChart'
    else if (componentsStr.includes('Area')) chartType = 'AreaChart'
    else if (componentsStr.includes('Pie')) chartType = 'PieChart'
    
    // Collect ALL chart components
    const allComponents = chartMatches.map(m => m[0]).join('\n          ')
    
    // Remove all original chart components
    chartMatches.forEach(match => {
      fixedCode = fixedCode.replace(match[0], '')
    })
    
    // Add properly wrapped version
    const wrappedChart = `
      <ResponsiveContainer width="100%" height={300}>
        <${chartType} data={data}>
          ${allComponents}
        </${chartType}>
      </ResponsiveContainer>
    `
    
    // Insert wrapped chart where the first component was
    const insertPoint = fixedCode.indexOf('return') + 'return'.length
    const beforeReturn = fixedCode.substring(0, insertPoint)
    const afterReturn = fixedCode.substring(insertPoint)
    
    // Find the opening tag after return
    const openingTagMatch = afterReturn.match(/^\s*\(\s*</)  
    if (openingTagMatch) {
      const tagStart = openingTagMatch[0].length
      fixedCode = beforeReturn + afterReturn.substring(0, tagStart) + wrappedChart + afterReturn.substring(tagStart)
    }
  }

  // Fix charts missing ResponsiveContainer
  chartContainers.forEach(chartType => {
    const chartRegex = new RegExp(`(<${chartType}[\\s>][\\s\\S]*?</${chartType}>)`, 'g')
    fixedCode = fixedCode.replace(chartRegex, (match) => {
      // Check if this chart is already wrapped in ResponsiveContainer
      const beforeChart = fixedCode.substring(Math.max(0, fixedCode.indexOf(match) - 100), fixedCode.indexOf(match))
      if (beforeChart.includes('<ResponsiveContainer')) {
        return match // Already wrapped
      }
      console.log(`⚠️ Adding ResponsiveContainer to ${chartType}`)
      return `<ResponsiveContainer width="100%" height={300}>
        ${match}
      </ResponsiveContainer>`
    })
  })
  
  // CRITICAL: Find any standalone XAxis, YAxis, etc. that are still orphaned
  // This catches cases where they appear outside of any chart context
  const standaloneComponentRegex = /(?<!<(?:Bar|Line|Area|Pie|Composed|Scatter|Radar)Chart[^>]*>[\s\S]*?)(<(?:XAxis|YAxis|Bar|Line|Area|CartesianGrid|Tooltip|Legend)\s[^>]*\/?>(?:<\/(?:XAxis|YAxis|Bar|Line|Area|CartesianGrid|Tooltip|Legend)>)?)/g
  
  const standaloneMatches = [...fixedCode.matchAll(standaloneComponentRegex)]
  if (standaloneMatches.length > 0) {
    console.log('⚠️ Found standalone chart components, wrapping them in a chart container')
    
    // Collect all standalone components
    const components = standaloneMatches.map(m => m[1]).join('\n          ')
    
    // Determine chart type based on components
    let chartType = 'BarChart'
    if (components.includes('<Line ')) chartType = 'LineChart'
    else if (components.includes('<Area ')) chartType = 'AreaChart'
    
    // Create wrapped version
    const wrappedComponents = `<ResponsiveContainer width="100%" height={300}>
        <${chartType} data={data}>
          ${components}
        </${chartType}>
      </ResponsiveContainer>`
    
    // Replace first standalone component with wrapped version, remove others
    let replaced = false
    fixedCode = fixedCode.replace(standaloneComponentRegex, (match) => {
      if (!replaced) {
        replaced = true
        return wrappedComponents
      }
      return '' // Remove duplicate standalone components
    })
  }
  
  // Fix improperly closed self-closing tags
  fixedCode = fixedCode.replace(/<(XAxis|YAxis|CartesianGrid|Tooltip|Legend|Cell)([^>]*?)\/>/g, '<$1$2 />')
  
  // Ensure data prop is passed correctly
  chartContainers.forEach(chartType => {
    const regex = new RegExp(`<${chartType}(?![^>]*data=)`, 'g')
    fixedCode = fixedCode.replace(regex, `<${chartType} data={data}`)
  })
  
  return fixedCode
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, headers, data, previousCode, isModification } = await request.json()
    
    console.log('🎨 Vibe Generate API called with prompt:', prompt)
    console.log('📝 Is modification:', isModification)
    
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
    
    const systemPrompt = isModification && previousCode ? 
      `You are an expert React developer. The user wants to modify an existing React component. 
      
CURRENT COMPONENT CODE:
${previousCode}

Your task is to MODIFY the above component based on the user's new request. Keep the overall structure but make the requested changes.

CRITICAL: Return ONLY the modified function. No explanations.`
      : `You are an expert React developer creating a data visualization component.

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

AVAILABLE (DO NOT IMPORT - already in scope):
React, useState, useEffect, useMemo, useCallback
BarChart, LineChart, PieChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Pie
Card, CardContent, CardHeader, CardTitle, CardDescription, Badge
All Lucide icons
COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042']

RECHARTS STRUCTURE (MANDATORY):
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey={headers[0]} />
    <YAxis />
    <Tooltip />
    <Bar dataKey={headers[1]} fill="#8884d8" />
  </BarChart>
</ResponsiveContainer>

CORRECT EXAMPLES:
// Bar Chart
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey={headers[0]} />
    <YAxis />
    <Tooltip />
    <Bar dataKey={headers[1]} fill="#8884d8" />
  </BarChart>
</ResponsiveContainer>

// Line Chart
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey={headers[0]} />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey={headers[1]} stroke="#8884d8" />
  </LineChart>
</ResponsiveContainer>

// Pie Chart
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie data={data} dataKey={headers[1]} nameKey={headers[0]} cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
      {data.map((entry, index) => (
        <Cell key={index} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
</ResponsiveContainer>

NEVER DO THIS:
<div>
  <XAxis /> // ERROR: XAxis must be inside BarChart/LineChart
  <Bar />   // ERROR: Bar must be inside BarChart
</div>

STYLING:
- Use Tailwind CSS classes for all styling
- Make it responsive and beautiful

DATA TRANSFORMATION FOR CHARTS:
- The incoming data is an array of objects with keys matching the headers
- For charts, you often need to transform or process this data
- Example: If headers are ['Month', 'Sales', 'Costs'], data looks like:
  [{ Month: 'Jan', Sales: '1000', Costs: '500' }, ...]
- For numeric values, parse them: parseInt(item.Sales) or parseFloat(item.Sales)
- For aggregations, use reduce/map/filter as needed

THREE SIMPLE RULES:
1. Return ONLY a function named GeneratedVisualization
2. NO TypeScript, NO imports, NO exports, NO markdown
3. Charts MUST be inside ResponsiveContainer and chart containers

WRITE YOUR CODE LIKE THIS:
function GeneratedVisualization({ data, headers }) {
  // Your code here
  return <div>...</div>
}`

    const userPrompt = isModification && previousCode ? 
      `USER'S MODIFICATION REQUEST: "${prompt}"

The user wants you to modify the existing component shown above. Make the changes requested while keeping the rest of the component intact.

DATA STRUCTURE (for reference):
Columns: ${headers.join(', ')}
Total Rows: ${data.length}

SAMPLE DATA (first 10 rows):
${JSON.stringify(sampleData, null, 2)}

Return the MODIFIED React component code ONLY. No explanations, no markdown, just the updated function code.`
      : `USER REQUEST: "${prompt}"

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
    let extractedCode = extractCodeFromResponse(rawResponse)
    
    if (extractedCode) {
      // Additional validation
      if (extractedCode.includes('function GeneratedVisualization') && 
          extractedCode.includes('return') &&
          !extractedCode.includes('```')) {
        
        // Fix common Recharts mistakes
        const fixedCode = fixRechartsCode(extractedCode)
        if (fixedCode !== extractedCode) {
          console.log('🔧 Applied Recharts fixes to generated code')
          console.log('📊 Fixed code preview:', fixedCode.substring(0, 500))
          extractedCode = fixedCode
        }
        
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
    
    // Try again with more specific instructions about what went wrong
    let retryPrompt = `The previous attempt to generate a React component failed. Common issues:
1. Code was wrapped in markdown blocks - DO NOT use \`\`\`
2. Code included TypeScript types - use pure JavaScript only
3. Chart components were not properly nested - ensure XAxis, YAxis, Bar, Line are INSIDE chart containers

Please generate a React component for: "${prompt}". 
Data has columns: ${headers.join(', ')}.

Return ONLY the function code starting with "function GeneratedVisualization" and ending with "}".`

    // If we detected specific issues, mention them
    if (rawResponse.includes('```')) {
      retryPrompt = `DO NOT wrap code in markdown blocks. ${retryPrompt}`
    }
    if (rawResponse.includes(': string') || rawResponse.includes(': number')) {
      retryPrompt = `DO NOT use TypeScript type annotations. ${retryPrompt}`
    }
    
    const retryResponse = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.1, // Even lower temperature
      system: 'Return ONLY a JavaScript function named GeneratedVisualization. Start with "function GeneratedVisualization" and end with "}". No other text.',
      messages: [{
        role: 'user',
        content: retryPrompt
      }]
    })
    
    const retryContent = retryResponse.content[0]
    const retryRawResponse = retryContent?.type === 'text' ? retryContent.text : ''
    let retryExtractedCode = extractCodeFromResponse(retryRawResponse)
    
    if (retryExtractedCode && retryExtractedCode.includes('function GeneratedVisualization')) {
      // Fix common Recharts mistakes in retry
      const fixedRetryCode = fixRechartsCode(retryExtractedCode)
      if (fixedRetryCode !== retryExtractedCode) {
        console.log('🔧 Applied Recharts fixes to retry code')
        retryExtractedCode = fixedRetryCode
      }
      
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