"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DashboardPromptBuilder } from "@/components/dashboard-prompt-builder"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { X, Sparkles } from "lucide-react"

interface LovableOutputProps {
  onClose: () => void
  onComplete?: () => void
}

export function LovableOutput({ onClose, onComplete }: LovableOutputProps) {
  const router = useRouter()
  const { data, headers } = useSpreadsheetStore()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true)
    
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

      const dashboard = await response.json()
      
      // Generate a unique dashboard ID
      const dashboardId = `dashboard_${Date.now()}`
      
      // Store dashboard data
      const dashboardData = {
        id: dashboardId,
        name: dashboard.title || 'AI Generated Dashboard',
        template: 'ai-generated',
        data: { headers, rows: data },
        dashboard: dashboard,
        prompt: prompt,
        createdAt: new Date().toISOString()
      }
      
      // Store in localStorage for now
      localStorage.setItem(dashboardId, JSON.stringify(dashboardData))
      
      // Navigate to the dashboard page
      router.push(`/dashboard/${dashboardId}`)
      
      // Call completion callback if provided
      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      // Error handled silently - could show toast notification if needed
    } finally {
      setIsGenerating(false)
    }
  }

  return (
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
  )
}