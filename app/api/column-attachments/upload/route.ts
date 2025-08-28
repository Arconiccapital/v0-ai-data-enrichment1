import { NextRequest, NextResponse } from 'next/server'
import { documentParser } from '@/lib/document-parser'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const columnIndex = formData.get('columnIndex') as string
    const rowIndex = formData.get('rowIndex') as string | null // Optional - null for column attachments
    
    if (!file || !columnIndex) {
      return NextResponse.json(
        { error: 'File and column index are required' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Generate unique ID for the attachment
    const attachmentId = uuidv4()
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Parse document content
    const { content, type, error } = await documentParser.parseDocument(
      buffer,
      file.name
    )

    if (error) {
      return NextResponse.json(
        { error: `Failed to parse document: ${error}` },
        { status: 400 }
      )
    }

    // Create upload directory based on whether it's cell or column attachment
    const uploadDir = rowIndex !== null 
      ? join(process.cwd(), '.uploads', 'cells', `${columnIndex}-${rowIndex}`)
      : join(process.cwd(), '.uploads', 'columns', columnIndex)
    
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (err) {
      // Directory might already exist, that's okay
    }

    // Save file to local storage (for development)
    const filename = `${attachmentId}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Create attachment metadata (no URL since files are not publicly accessible)
    const attachment = {
      id: attachmentId,
      filename: file.name,
      fileType: type,
      uploadedAt: new Date().toISOString(),
      size: file.size,
      parsedContent: content,
      filepath: filepath  // Store filepath for internal use only
    }

    return NextResponse.json({
      success: true,
      attachment,
      rowIndex: rowIndex,  // Return row index to help client know if it's cell or column attachment
      message: `Successfully parsed ${type} file with ${content.length} characters of text`
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload and process file' },
      { status: 500 }
    )
  }
}