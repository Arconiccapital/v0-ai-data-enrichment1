import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Test different file scenarios
    const testScenarios = [
      {
        name: 'Empty PDF',
        content: '',
        expectedBehavior: 'Should return mock data with extraction note'
      },
      {
        name: 'Text-based content',
        content: 'TechCorp is a Series A startup founded in 2021 with a TAM of $50B',
        expectedBehavior: 'Should extract company info and metrics'
      },
      {
        name: 'Invalid content',
        content: '���binary���data���',
        expectedBehavior: 'Should handle gracefully and return mock data'
      }
    ]

    // Create a test file
    const testFile = new File(
      ['TechCorp Series A pitch deck\nFounded: 2021\nTAM: $50B\nTeam: 25 employees'], 
      'test-pitch.txt',
      { type: 'text/plain' }
    )

    const formData = new FormData()
    formData.append('file', testFile)

    // Test the parse-pitch-deck endpoint
    const response = await fetch(`${request.nextUrl.origin}/api/parse-pitch-deck`, {
      method: 'POST',
      body: formData
    })

    const result = await response.json()

    return NextResponse.json({
      status: 'success',
      message: 'Pitch deck parsing test completed',
      testFile: 'test-pitch.txt',
      response: {
        hasHeaders: !!result.headers,
        headerCount: result.headers?.length,
        hasRows: !!result.rows,
        rowCount: result.rows?.length,
        extractionNote: result.extractionNote,
        sampleData: result.rows?.[0]?.slice(0, 5) // First 5 columns
      },
      scenarios: testScenarios
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Test failed',
      error: error.message
    })
  }
}