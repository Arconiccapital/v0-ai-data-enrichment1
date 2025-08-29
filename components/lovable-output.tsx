"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DashboardPromptBuilder } from "@/components/dashboard-prompt-builder"
import { DashboardPreview } from "@/components/dashboard-preview"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { X, Sparkles, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface LovableOutputProps {
  onClose: () => void
  onComplete?: () => void
}

export function LovableOutput({ onClose, onComplete }: LovableOutputProps) {
  const { data, headers } = useSpreadsheetStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDashboard, setGeneratedDashboard] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastPrompt, setLastPrompt] = useState<string>('')

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true)
    setError(null)
    setLastPrompt(prompt)
    
    try {
      // Call API to generate dashboard with natural language prompt
      const response = await fetch('/api/generate-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          naturalLanguagePrompt: prompt,
          data: {
            headers,
            rows: data
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to generate dashboard (${response.status})`)
      }

      const dashboard = await response.json()
      
      
      // More lenient validation - just check if we got something
      if (!dashboard) {
        throw new Error('No dashboard data received')
      }
      
      // Set dashboard regardless of structure to see what we got
      setGeneratedDashboard(dashboard)
      setShowPreview(true)
      
      // Show success toast
      toast.success('Dashboard generated successfully!', {
        description: `Created "${dashboard.title || 'AI Dashboard'}" with ${dashboard.sections?.length || 0} sections`
      })
      
    } catch (error: any) {
      console.error('Dashboard generation error:', error)
      setError(error.message || 'Failed to generate dashboard')
      
      // Show error toast
      toast.error('Failed to generate dashboard', {
        description: error.message || 'Please try again with a different prompt'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRefresh = async () => {
    if (lastPrompt) {
      await handleGenerate(lastPrompt)
    }
  }

  const handleClosePreview = () => {
    setShowPreview(false)
    // Don't clear the dashboard data so user can reopen it
  }

  return (
    <>
      <div className="w-full lg:w-96 xl:w-[28rem] h-full flex flex-col bg-white border-l border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black rounded">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">AI Dashboard Builder</h2>
              <p className="text-sm text-gray-600">Create custom dashboards with natural language</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Content - Full Lovable Experience */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6">
            {/* Error Message */}
            {error && (
              <Card className="border-red-200 bg-red-50 mb-4">
                <div className="p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Generation Failed</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Success Message with Preview Button */}
            {generatedDashboard && !showPreview && (
              <Card className="border-green-200 bg-green-50 mb-4">
                <div className="p-4">
                  <p className="text-sm font-medium text-green-800 mb-2">
                    Dashboard Generated Successfully!
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setShowPreview(true)}
                    className="w-full"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    View Dashboard
                  </Button>
                </div>
              </Card>
            )}

            <Card className="border-0 shadow-none">
              <DashboardPromptBuilder
                data={{ headers, rows: data }}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                className="w-full"
              />
            </Card>
          
            {/* Additional Help Text */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold mb-3 text-gray-700">How it works</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-gray-400">1.</span>
                  <span>Describe your dashboard in natural language - be as specific or general as you like</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-400">2.</span>
                  <span>Claude AI analyzes your data and understands your requirements</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-400">3.</span>
                  <span>Your custom dashboard is generated with relevant charts, metrics, and insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Preview Overlay */}
      {showPreview && generatedDashboard && (
        <>
          <DashboardPreview
            dashboard={generatedDashboard}
            onClose={handleClosePreview}
            onRefresh={handleRefresh}
            isLoading={isGenerating}
          />
        </>
      )}
    </>
  )
}