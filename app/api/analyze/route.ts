import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, rows, headers, contextColumns } = await request.json()

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      // Return mock data if no API key
      const mockResults = rows.map((_: any, index: number) => {
        // Generate mock results based on prompt
        if (prompt.toLowerCase().includes('score')) {
          return String(Math.floor(Math.random() * 10) + 1)
        } else if (prompt.toLowerCase().includes('category') || prompt.toLowerCase().includes('size')) {
          return ['Small', 'Medium', 'Large', 'Enterprise'][index % 4]
        } else if (prompt.toLowerCase().includes('risk')) {
          return ['Low', 'Medium', 'High'][index % 3]
        } else if (prompt.toLowerCase().includes('priority')) {
          return ['High', 'Medium', 'Low'][index % 3]
        } else if (prompt.toLowerCase().includes('percentage') || prompt.toLowerCase().includes('%')) {
          return `${(Math.random() * 100).toFixed(1)}%`
        }
        return `Result ${index + 1}`
      })
      
      const mockExplanations = mockResults.map((result: any, index: number) => {
        return `Mock data: Assigned ${result} based on row ${index + 1} characteristics.`
      })
      
      return NextResponse.json({
        results: mockResults,
        explanations: mockExplanations,
        mock: true
      })
    }

    // Prepare context for each row
    const results = []
    const explanations = []
    const batchSize = 5 // Process 5 rows at a time to avoid token limits
    
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize)
      
      // Create a structured prompt for the batch
      const batchPrompt = `
You are a data analyst. Analyze the following data and provide the requested output.

Instructions: ${prompt}

Data Headers: ${headers.join(', ')}

Data Rows:
${batch.map((row: any, idx: number) => `Row ${i + idx + 1}: ${row.join(', ')}`).join('\n')}

${contextColumns ? `Focus on these columns: ${contextColumns.join(', ')}` : ''}

IMPORTANT: 
- Return a JSON object with two arrays: "results" and "explanations"
- "results": An array with exactly ${batch.length} values (the analysis results)
- "explanations": An array with exactly ${batch.length} brief explanations (1-2 sentences each)
- Each explanation should describe WHY that result was chosen based on the data
- Keep results concise and consistent
- Follow the exact format requested in the instructions

Example response format: 
{
  "results": ["Result1", "Result2", "Result3"],
  "explanations": ["Brief reason for Result1", "Brief reason for Result2", "Brief reason for Result3"]
}
`

      try {
        const completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a precise data analyst. Always return results as a JSON object with "results" and "explanations" arrays, with no additional text.'
            },
            {
              role: 'user',
              content: batchPrompt
            }
          ],
          temperature: 0.3, // Lower temperature for more consistent results
          max_tokens: 500,
        })

        const response = completion.choices[0]?.message?.content || '[]'
        
        // Parse the response
        try {
          const parsed = JSON.parse(response)
          if (parsed.results && Array.isArray(parsed.results)) {
            results.push(...parsed.results)
            if (parsed.explanations && Array.isArray(parsed.explanations)) {
              explanations.push(...parsed.explanations)
            } else {
              // Add empty explanations if not provided
              for (let j = 0; j < batch.length; j++) {
                explanations.push('')
              }
            }
          } else if (Array.isArray(parsed)) {
            // Backward compatibility: if it's just an array, treat as results
            results.push(...parsed)
            for (let j = 0; j < batch.length; j++) {
              explanations.push('')
            }
          } else {
            // Fallback if format is unexpected
            for (let j = 0; j < batch.length; j++) {
              results.push('Processing...')
              explanations.push('')
            }
          }
        } catch (parseError) {
          // If parsing fails, try to extract values
          console.error('Failed to parse AI response:', response)
          for (let j = 0; j < batch.length; j++) {
            results.push('Error')
            explanations.push('')
          }
        }
      } catch (apiError: any) {
        console.error('OpenAI API error:', apiError)
        // Add error results for this batch
        for (let j = 0; j < batch.length; j++) {
          results.push('API Error')
          explanations.push('')
        }
      }
    }

    return NextResponse.json({ results, explanations, mock: false })
  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze data', message: error.message },
      { status: 500 }
    )
  }
}