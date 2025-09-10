import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
    
    if (!apiKey || apiKey === 'your-claude-api-key-here') {
      return NextResponse.json({
        status: 'error',
        message: 'No Claude API key configured',
        apiKey: 'Not set'
      })
    }
    
    const anthropic = new Anthropic({ apiKey })
    
    // Test with a simple message
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'Say "API connection successful" if you can read this.'
      }]
    })
    
    return NextResponse.json({
      status: 'success',
      message: 'Claude API is working',
      model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
      response: response.content[0]
    })
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Claude API test failed',
      error: (error instanceof Error ? error.message : String(error)),
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest'
    })
  }
}