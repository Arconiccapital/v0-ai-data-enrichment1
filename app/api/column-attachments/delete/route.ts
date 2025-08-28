import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const { filepath, columnIndex, rowIndex, attachmentId } = await request.json()
    
    if (!filepath || !columnIndex || !attachmentId) {
      return NextResponse.json(
        { error: 'Filepath, column index, and attachment ID are required' },
        { status: 400 }
      )
    }

    // Security check: ensure the filepath is within our uploads directory
    const baseDir = join(process.cwd(), '.uploads')
    if (!filepath.startsWith(baseDir)) {
      return NextResponse.json(
        { error: 'Invalid filepath' },
        { status: 403 }
      )
    }

    // Delete the file from disk
    try {
      await unlink(filepath)
    } catch (err) {
      // File might not exist, that's okay
      console.warn('File deletion warning:', err)
    }

    return NextResponse.json({
      success: true,
      message: 'Attachment deleted successfully'
    })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete attachment' },
      { status: 500 }
    )
  }
}