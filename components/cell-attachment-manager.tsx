"use client"

import { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Upload, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  File, 
  Trash2, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Paperclip,
  Eye,
  Folder
} from "lucide-react"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CellAttachmentManagerProps {
  open: boolean
  onClose: () => void
  rowIndex: number
  columnIndex: number
  cellValue: string
  columnName: string
}

const fileTypeIcons = {
  pdf: FileText,
  docx: FileText,
  xlsx: FileSpreadsheet,
  pptx: File,
  image: Image,
  text: FileText,
}

const fileTypeColors = {
  pdf: 'bg-red-100 text-red-700',
  docx: 'bg-blue-100 text-blue-700',
  xlsx: 'bg-green-100 text-green-700',
  pptx: 'bg-orange-100 text-orange-700',
  image: 'bg-purple-100 text-purple-700',
  text: 'bg-gray-100 text-gray-700',
}

export function CellAttachmentManager({ 
  open, 
  onClose, 
  rowIndex,
  columnIndex,
  cellValue,
  columnName 
}: CellAttachmentManagerProps) {
  const { 
    getCellAttachments,
    addCellAttachment,
    removeCellAttachment,
    getColumnAttachments,
    addColumnAttachment,
    removeColumnAttachment
  } = useSpreadsheetStore()

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'cell' | 'column'>('cell')

  const cellAttachments = getCellAttachments(rowIndex, columnIndex)
  const columnAttachments = getColumnAttachments(columnIndex)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await handleFileUpload(files[0])
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    setUploadError(null)
    setUploadSuccess(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('columnIndex', columnIndex.toString())
      
      // Add row index for cell attachments
      if (activeTab === 'cell') {
        formData.append('rowIndex', rowIndex.toString())
      }

      const response = await fetch('/api/column-attachments/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      // Add attachment to appropriate store
      if (activeTab === 'cell') {
        addCellAttachment(rowIndex, columnIndex, data.attachment)
      } else {
        addColumnAttachment(columnIndex, data.attachment)
      }
      
      setUploadSuccess(data.message)
      
      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(null), 3000)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveAttachment = async (attachmentId: string, isCell: boolean) => {
    const attachments = isCell ? cellAttachments : columnAttachments
    const attachment = attachments.find(a => a.id === attachmentId)
    if (!attachment) return
    
    // Call delete API to remove file from disk
    if (attachment.filepath) {
      try {
        await fetch('/api/column-attachments/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filepath: attachment.filepath,
            columnIndex: columnIndex.toString(),
            rowIndex: isCell ? rowIndex.toString() : null,
            attachmentId: attachmentId
          })
        })
      } catch (error) {
        console.error('Failed to delete file from disk:', error)
      }
    }
    
    // Remove from store
    if (isCell) {
      removeCellAttachment(rowIndex, columnIndex, attachmentId)
    } else {
      removeColumnAttachment(columnIndex, attachmentId)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const AttachmentList = ({ attachments, isCell }: { attachments: any[], isCell: boolean }) => (
    <ScrollArea className="flex-1 border rounded-lg">
      {attachments.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No attachments yet</p>
          <p className="text-xs mt-1">
            Upload documents to provide context for {isCell ? 'this cell' : 'this column'}
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-2">
          {attachments.map((attachment) => {
            const Icon = fileTypeIcons[attachment.fileType] || File
            const colorClass = fileTypeColors[attachment.fileType] || 'bg-gray-100 text-gray-700'
            
            return (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className={cn("p-2 rounded", colorClass)}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {attachment.filename}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {attachment.parsedContent?.length || 0} chars
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(attachment.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedPreview(attachment.parsedContent || '')}
                    title="Preview extracted text"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveAttachment(attachment.id, isCell)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </ScrollArea>
  )

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Paperclip className="h-5 w-5" />
              Attachments for Cell [{rowIndex + 1}, {columnName}]
            </DialogTitle>
            <DialogDescription>
              {cellValue ? (
                <>Cell value: "{cellValue.substring(0, 50)}{cellValue.length > 50 ? '...' : ''}"</>
              ) : (
                <>Empty cell - Add attachments to provide context</>
              )}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'cell' | 'column')} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cell" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Cell Attachments ({cellAttachments.length})
              </TabsTrigger>
              <TabsTrigger value="column" className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                Column Context ({columnAttachments.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden flex flex-col gap-4 mt-4">
              {/* Upload Zone */}
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
                  dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
                  uploading && "opacity-50 pointer-events-none"
                )}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="cell-attachment-upload"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv,.jpg,.jpeg,.png,.gif"
                  disabled={uploading}
                />
                
                <label
                  htmlFor="cell-attachment-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  ) : (
                    <Upload className="h-6 w-6 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {uploading 
                        ? 'Processing...' 
                        : `Upload to ${activeTab === 'cell' ? 'this cell' : 'column context'}`
                      }
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Drop files here or click to browse (Max 10MB)
                    </p>
                  </div>
                </label>
              </div>

              {/* Alerts */}
              {uploadError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}
              
              {uploadSuccess && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {uploadSuccess}
                  </AlertDescription>
                </Alert>
              )}

              <TabsContent value="cell" className="flex-1 mt-0">
                <AttachmentList attachments={cellAttachments} isCell={true} />
              </TabsContent>

              <TabsContent value="column" className="flex-1 mt-0">
                <div className="space-y-2">
                  <Alert>
                    <AlertDescription className="text-xs">
                      Column attachments are shared context for all cells in "{columnName}"
                    </AlertDescription>
                  </Alert>
                  <AttachmentList attachments={columnAttachments} isCell={false} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      {selectedPreview && (
        <Dialog open={!!selectedPreview} onOpenChange={() => setSelectedPreview(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Extracted Text Preview</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh]">
              <pre className="text-xs whitespace-pre-wrap font-mono p-4 bg-gray-50 rounded">
                {selectedPreview}
              </pre>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}