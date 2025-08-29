import mammoth from 'mammoth'
import * as XLSX from 'xlsx'
import sharp from 'sharp'

export type SupportedFileType = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'image' | 'text'

export class DocumentParser {
  /**
   * Parse PDF files and extract text content
   */
  async parsePDF(buffer: Buffer): Promise<string> {
    try {
      // Dynamic import to avoid build-time issues
      const pdfParse = (await import('pdf-parse')).default
      const data = await pdfParse(buffer)
      return data.text.trim()
    } catch (error) {
      console.error('Error parsing PDF:', error)
      return ''
    }
  }

  /**
   * Parse Word documents (.docx) and extract text
   */
  async parseWord(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer })
      return result.value.trim()
    } catch (error) {
      console.error('Error parsing Word document:', error)
      return ''
    }
  }

  /**
   * Parse Excel spreadsheets and extract text from all sheets
   */
  async parseExcel(buffer: Buffer): Promise<string> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      let allText = ''
      
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName]
        const csvData = XLSX.utils.sheet_to_csv(sheet)
        allText += `Sheet: ${sheetName}\n${csvData}\n\n`
      })
      
      return allText.trim()
    } catch (error) {
      console.error('Error parsing Excel:', error)
      return ''
    }
  }

  /**
   * Parse PowerPoint presentations
   * Note: This is a simplified version - for full support, consider using a dedicated library
   */
  async parsePowerPoint(buffer: Buffer): Promise<string> {
    try {
      // For now, we'll try to extract as plain text
      // In production, you might want to use a library like node-pptx-parser
      const text = buffer.toString('utf-8', 0, Math.min(buffer.length, 10000))
      // Extract readable text patterns
      const readable = text.match(/[\x20-\x7E]+/g)
      return readable ? readable.join(' ').trim() : ''
    } catch (error) {
      console.error('Error parsing PowerPoint:', error)
      return ''
    }
  }

  /**
   * Extract text from images using OCR (placeholder - requires tesseract.js setup)
   */
  async parseImage(buffer: Buffer): Promise<string> {
    try {
      // For now, just return metadata
      // In production, you would use tesseract.js for OCR
      const metadata = await sharp(buffer).metadata()
      return `Image: ${metadata.width}x${metadata.height} ${metadata.format}`
    } catch (error) {
      console.error('Error parsing image:', error)
      return ''
    }
  }

  /**
   * Parse plain text files
   */
  async parseText(buffer: Buffer): Promise<string> {
    try {
      return buffer.toString('utf-8').trim()
    } catch (error) {
      console.error('Error parsing text file:', error)
      return ''
    }
  }

  /**
   * Detect file type from buffer and filename
   */
  detectFileType(filename: string, buffer?: Buffer): SupportedFileType | null {
    const extension = filename.toLowerCase().split('.').pop()
    
    switch (extension) {
      case 'pdf':
        return 'pdf'
      case 'docx':
      case 'doc':
        return 'docx'
      case 'xlsx':
      case 'xls':
        return 'xlsx'
      case 'pptx':
      case 'ppt':
        return 'pptx'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return 'image'
      case 'txt':
      case 'md':
      case 'csv':
        return 'text'
      default:
        return null
    }
  }

  /**
   * Main parsing method that routes to appropriate parser
   */
  async parseDocument(buffer: Buffer, filename: string): Promise<{
    content: string
    type: SupportedFileType | null
    error?: string
  }> {
    const type = this.detectFileType(filename)
    
    if (!type) {
      return {
        content: '',
        type: null,
        error: 'Unsupported file type'
      }
    }

    let content = ''
    
    try {
      switch (type) {
        case 'pdf':
          content = await this.parsePDF(buffer)
          break
        case 'docx':
          content = await this.parseWord(buffer)
          break
        case 'xlsx':
          content = await this.parseExcel(buffer)
          break
        case 'pptx':
          content = await this.parsePowerPoint(buffer)
          break
        case 'image':
          content = await this.parseImage(buffer)
          break
        case 'text':
          content = await this.parseText(buffer)
          break
      }
      
      // Truncate content if it's too long (for LLM context limits)
      const maxLength = 10000 // Adjust based on your LLM limits
      if (content.length > maxLength) {
        content = content.substring(0, maxLength) + '... [truncated]'
      }
      
      return { content, type }
    } catch (error) {
      return {
        content: '',
        type,
        error: `Failed to parse ${type} file: ${error}`
      }
    }
  }

  /**
   * Summarize long documents for context
   */
  summarizeForContext(content: string, maxTokens: number = 2000): string {
    // Simple truncation for now
    // In production, you might want to use an LLM to create a proper summary
    const estimatedTokens = content.length / 4 // Rough estimate
    
    if (estimatedTokens <= maxTokens) {
      return content
    }
    
    // Take beginning and end of document
    const halfLength = (maxTokens * 2) // Convert back to characters
    const beginning = content.substring(0, halfLength)
    const ending = content.substring(content.length - halfLength)
    
    return `${beginning}\n\n[... content truncated ...]\n\n${ending}`
  }
}

// Export singleton instance
export const documentParser = new DocumentParser()