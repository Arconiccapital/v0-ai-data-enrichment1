export interface ColumnAttachment {
  id: string
  filename: string
  filepath: string
  mimeType: string
  size: number
  uploadedAt: Date
  parsedContent?: string
}

export interface AttachmentUploadResponse {
  success: boolean
  attachment?: ColumnAttachment
  error?: string
}