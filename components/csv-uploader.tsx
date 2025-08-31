"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, AlertCircle, FileSpreadsheet } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { parseCSV } from "@/lib/csv-parser"

export function CSVUploader() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [uploadingMessage, setUploadingMessage] = useState("Processing file...")
  const { setData } = useSpreadsheetStore()

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      processFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const processFile = async (file: File) => {
    const fileName = file.name.toLowerCase()
    const isCSV = fileName.endsWith(".csv")
    const isPitchDeck = fileName.match(/\.(pdf|pptx?)$/i)
    
    if (!isCSV && !isPitchDeck) {
      setError("Please select a CSV file or Pitch Deck (PDF/PPTX)")
      return
    }

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      if (isCSV) {
        // Process CSV file
        setUploadingMessage("Processing CSV file...")
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90))
        }, 100)

        const text = await file.text()
        const { headers, rows } = parseCSV(text)

        clearInterval(progressInterval)
        setProgress(100)

        // Set data in store
        setData(headers, rows)

        setTimeout(() => {
          setUploading(false)
          setProgress(0)
        }, 500)
        
      } else if (isPitchDeck) {
        // Process Pitch Deck
        setUploadingMessage("Uploading pitch deck...")
        setProgress(10)
        
        // Parse pitch deck with AI
        setUploadingMessage("Analyzing pitch deck with AI...")
        setProgress(30)
        
        // Dynamic import to avoid build issues
        const { parsePitchDeck } = await import("@/lib/pitch-deck-parser")
        const { headers, rows, extractionNote } = await parsePitchDeck(file)
        
        setProgress(90)
        setUploadingMessage("Structuring data...")
        
        // Set data in store
        setData(headers, rows)
        
        // Show extraction note if present (e.g., when using mock data)
        if (extractionNote) {
          setError(`Note: ${extractionNote}. Sample data has been loaded for demonstration.`)
        }
        
        setProgress(100)
        setTimeout(() => {
          setUploading(false)
          setProgress(0)
          setUploadingMessage("Processing file...")
        }, 500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file")
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          uploading && "pointer-events-none opacity-50",
        )}
      >
        <input
          type="file"
          accept=".csv,.pdf,.ppt,.pptx"
          onChange={handleFileSelect}
          className="hidden"
          id="csv-upload"
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-4">
            <div className="animate-spin mx-auto">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">{uploadingMessage}</p>
              <Progress value={progress} className="w-full max-w-xs mx-auto" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium">{isDragActive ? "Drop your file here" : "Upload your data file"}</p>
              <p className="text-sm text-muted-foreground">Drag and drop a CSV or Pitch Deck (PDF/PPTX) here, or click to select</p>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>CSV</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>PDF/PPTX</span>
                </div>
              </div>
            </div>
            <Button variant="outline" className="mt-4 bg-transparent" asChild>
              <label htmlFor="csv-upload" className="cursor-pointer">
                Choose File
              </label>
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  )
}
