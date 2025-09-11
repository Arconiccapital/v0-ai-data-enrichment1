import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307'
const MAX_TOKENS = Number(process.env.VIBE_ARTIFACT_MAX_TOKENS || 2500)
const SAMPLE_MAX_ROWS = Number(process.env.VIBE_ARTIFACT_SAMPLE_MAX_ROWS || 200)

export async function POST(request: NextRequest) {
  try {
    const { prompt, headers, data } = await request.json()

    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'No API key configured' }, { status: 400 })
    }

    const anthropic = new Anthropic({ apiKey })

    // Sample rows to keep artifact small
    const sampleSize = Math.min(data?.length || 0, SAMPLE_MAX_ROWS)
    const sampled = (data || []).slice(0, sampleSize).map((row: string[]) => {
      const obj: Record<string, string> = {}
      headers.forEach((h: string, i: number) => { obj[h] = row[i] })
      return obj
    })

    // System prompt to return a self-contained HTML artifact (no external deps)
    const systemPrompt = `You produce a single, self-contained HTML artifact.

REQUIREMENTS:
- Return ONLY raw HTML (no markdown fences)
- No external resources: no <link>, <script src>, <img src> to remote URLs
- Inline CSS and JS only
- JavaScript must read dataset from window.__DATA__ (object with { headers: string[], rows: Array<Record<string,string>> })
- No network calls (no fetch, WebSocket, etc.)
- No imports or modules
- Keep total size reasonable

RECOMMENDATIONS:
- Use lightweight, vanilla JS for charts (simple SVG/canvas) or plain tables/cards
- Provide a clean, modern layout with responsive CSS
- Format numbers and currencies nicely when appropriate
`

    const userPrompt = `USER REQUEST: "${prompt}"

DATASET:
Headers: ${headers.join(', ')}
Rows: ${sampled.length}
window.__DATA__ = { headers: [...], rows: [...] }

Build an elegant dashboard or report that uses the data meaningfully (tables, cards, simple charts).
`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })

    const content = response.content[0]
    let html = content?.type === 'text' ? content.text : ''
    // Strip code fences if present
    html = html.replace(/```html\n?/gi, '').replace(/```\n?/g, '').trim()

    // Basic safety checks: block external references
    if (/\b(src|href)\s*=\s*"?https?:/i.test(html)) {
      // Remove external references crudely
      html = html.replace(/\b(src|href)\s*=\s*"https?:[^"]*"/gi, '')
    }

    return NextResponse.json({
      success: true,
      html,
      model: MODEL,
      meta: { sampled: sampled.length, total: data?.length || 0 }
    })
  } catch (error) {
    console.error('Artifact generation error:', error)
    return NextResponse.json({ success: false, error: 'Artifact generation failed' }, { status: 500 })
  }
}

