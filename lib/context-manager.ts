/**
 * Context manager for handling attachment content within LLM token limits
 */

const MAX_CONTEXT_CHARS = 8000  // Conservative limit for context (roughly 2000 tokens)
const PRIORITY_CHARS = 2000     // Characters to prioritize from each document

export function prepareAttachmentContext(attachments: Array<{
  filename: string
  parsedContent?: string
}>): string {
  if (!attachments || attachments.length === 0) {
    return ""
  }

  const validAttachments = attachments.filter(att => att.parsedContent)
  if (validAttachments.length === 0) {
    return ""
  }

  // If only one attachment, use as much as possible
  if (validAttachments.length === 1) {
    const content = validAttachments[0].parsedContent!
    if (content.length <= MAX_CONTEXT_CHARS) {
      return `[${validAttachments[0].filename}]:\n${content}`
    }
    // Truncate single attachment
    return `[${validAttachments[0].filename}]:\n${truncateContent(content, MAX_CONTEXT_CHARS)}`
  }

  // Multiple attachments - distribute context space
  const charsPerDoc = Math.floor(MAX_CONTEXT_CHARS / validAttachments.length)
  const contextParts: string[] = []
  let totalChars = 0

  // First pass: add priority content from each document
  for (const att of validAttachments) {
    const content = att.parsedContent!
    const priorityContent = content.substring(0, Math.min(PRIORITY_CHARS, charsPerDoc))
    const docContext = `[${att.filename}]:\n${priorityContent}`
    contextParts.push(docContext)
    totalChars += docContext.length
  }

  // Second pass: add more content if space available
  const remainingSpace = MAX_CONTEXT_CHARS - totalChars
  if (remainingSpace > 500) {  // Only bother if significant space left
    const extraCharsPerDoc = Math.floor(remainingSpace / validAttachments.length)
    
    for (let i = 0; i < validAttachments.length; i++) {
      const att = validAttachments[i]
      const content = att.parsedContent!
      
      // Skip if we already included everything
      if (content.length <= PRIORITY_CHARS) continue
      
      // Add extra content
      const extraContent = content.substring(PRIORITY_CHARS, PRIORITY_CHARS + extraCharsPerDoc)
      if (extraContent.length > 0) {
        contextParts[i] += extraContent
        if (content.length > PRIORITY_CHARS + extraCharsPerDoc) {
          contextParts[i] += "\n[... truncated ...]"
        }
      }
    }
  }

  return contextParts.join('\n\n---\n\n')
}

function truncateContent(content: string, maxChars: number): string {
  if (content.length <= maxChars) {
    return content
  }

  // Try to truncate at a sentence boundary
  const truncated = content.substring(0, maxChars)
  const lastPeriod = truncated.lastIndexOf('.')
  const lastNewline = truncated.lastIndexOf('\n')
  
  const cutPoint = Math.max(lastPeriod, lastNewline)
  if (cutPoint > maxChars * 0.8) {  // Only use boundary if it's not too far back
    return truncated.substring(0, cutPoint + 1) + "\n[... content truncated for token limits ...]"
  }

  return truncated + "... [content truncated for token limits]"
}

export function estimateTokenCount(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}