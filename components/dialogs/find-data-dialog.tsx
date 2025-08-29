"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { 
  Search,
  Loader2,
  Sparkles,
  Globe,
  Database
} from 'lucide-react'
import { useSpreadsheetStore } from '@/lib/spreadsheet-store'

interface FindDataDialogProps {
  open: boolean
  onClose: () => void
}

export function FindDataDialog({ open, onClose }: FindDataDialogProps) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const { setDataFromTemplate } = useSpreadsheetStore()

  const handleFind = async () => {
    if (!prompt.trim()) return
    
    setLoading(true)
    setProgress('Searching the web for data...')
    
    try {
      // Parse the prompt to determine count and type
      const countMatch = prompt.match(/(\d+)\s+/);
      const count = countMatch ? parseInt(countMatch[1]) : 20;
      
      setProgress(`Finding ${count} items matching your request...`)
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          count: count,
          type: 'first-column'
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to find data')
      }
      
      const result = await response.json()
      
      // Convert to template format and import
      if (result.data && result.data.length > 0) {
        // Show message if fewer results were found
        const statusMessage = result.message || `Found ${result.data.length} verified results`
        setProgress(statusMessage)
        
        // Brief delay to show success message
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Extract generation metadata from API response
        const generationMetadata = result.process ? {
          prompt: result.process.prompt,
          query: result.process.query,
          response: result.process.response,
          citations: result.process.citations || [],
          timestamp: result.process.timestamp,
          itemsFound: result.process.itemsFound,
          requestedCount: result.process.requestedCount,
          source: result.source
        } : undefined
        
        setDataFromTemplate({
          id: 'custom-search',
          name: 'Search Results',
          description: prompt,
          icon: '🔍',
          category: 'business',
          columns: [{ name: 'Results', type: 'text' }],
          sampleData: result.data.map((item: string) => ({ 'Results': item }))
        }, generationMetadata)
        onClose()
      } else {
        setProgress('No data found. Try a different search.')
      }
    } catch (err) {
      console.error('Failed to find data:', err)
      setProgress('Failed to search. Please try again.')
    } finally {
      setLoading(false)
      if (!loading) {
        setTimeout(() => setProgress(''), 2000)
      }
    }
  }

  const examplePrompts = [
    "50 Fortune 500 companies",
    "20 AI startups in San Francisco",
    "30 venture capital firms",
    "25 SaaS companies with over $10M revenue",
    "40 tech company founders",
    "15 real estate properties in Manhattan"
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Find Data</DialogTitle>
          <DialogDescription>
            Describe what data you're looking for and we'll help you find it
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Textarea
              placeholder="e.g., 50 B2B SaaS companies in healthcare"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px]"
              autoFocus
              disabled={loading}
            />
          </div>

          {progress && (
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : progress.includes('Real web data') ? (
                <Globe className="h-4 w-4" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              <span>{progress}</span>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Example searches:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(example)}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleFind}
            disabled={loading || !prompt.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Finding...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Find Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}