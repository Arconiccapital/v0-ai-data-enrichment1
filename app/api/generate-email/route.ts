import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { EmailTemplate } from '@/lib/output-templates'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const { template, emails, tone } = await request.json()

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      // Return original emails if no API key
      return NextResponse.json({ emails })
    }

    // Enhance emails with AI
    const enhancedEmails = await Promise.all(
      emails.map(async (email: any) => {
        try {
          const enhancementPrompt = `
You are helping to create professional business emails. 

Original email:
To: ${email.to}
Subject: ${email.subject}
Body: ${email.body}

Please enhance this email to be more ${tone || 'professional'}. 
- Make it more engaging and personalized
- Ensure proper business email etiquette
- Keep the core message and all personalization tokens intact
- Maintain a ${tone} tone throughout

Return the enhanced email in JSON format:
{
  "subject": "enhanced subject line",
  "body": "enhanced email body"
}`

          const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an expert business communication specialist. Enhance emails while maintaining their core message and personalization tokens.'
              },
              {
                role: 'user',
                content: enhancementPrompt
              }
            ],
            temperature: 0.5,
            max_tokens: 400,
          })

          const response = completion.choices[0]?.message?.content || ''
          
          try {
            const enhanced = JSON.parse(response)
            return {
              ...email,
              subject: enhanced.subject || email.subject,
              body: enhanced.body || email.body,
              enhanced: true
            }
          } catch (parseError) {
            // If parsing fails, return original
            console.error('Failed to parse AI response:', parseError)
            return email
          }
        } catch (error) {
          console.error('Error enhancing email:', error)
          return email
        }
      })
    )

    return NextResponse.json({ 
      emails: enhancedEmails,
      enhanced: true 
    })
  } catch (error: any) {
    console.error('Email generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate emails', message: error.message },
      { status: 500 }
    )
  }
}

// Optional: Add a send email endpoint
export async function PUT(request: NextRequest) {
  try {
    const { emails, test } = await request.json()
    
    // In a real implementation, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Mailgun
    // - Postmark
    
    if (test) {
      // Send test email (first email only)
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully',
        sent: 1
      })
    } else {
      // Send all emails
      
      // Mock implementation - in reality, you'd batch send through email service
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return NextResponse.json({ 
        success: true, 
        message: `Successfully queued ${emails.length} emails`,
        sent: emails.length,
        queued: emails.length
      })
    }
  } catch (error: any) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { error: 'Failed to send emails', message: error.message },
      { status: 500 }
    )
  }
}