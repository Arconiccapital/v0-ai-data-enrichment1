"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CSVUploader } from "@/components/csv-uploader"
import { SpreadsheetView } from "@/components/spreadsheet-view"
import { AppNavigation } from "@/components/app-navigation"
import { WorkflowIndicator } from "@/components/workflow-indicator"
import { SidebarNav } from "@/components/sidebar-nav"
import { EnrichSidebar } from "@/components/enrich-sidebar"
import { AnalyzeSidebar } from "@/components/analyze-sidebar"
import { OutputSidebar } from "@/components/output-sidebar"
import { ExportSidebar } from "@/components/export-sidebar"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"

export default function HomePage() {
  const { hasData } = useSpreadsheetStore()
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [hasOpenedEnrich, setHasOpenedEnrich] = useState(false)

  // Auto-open enrich sidebar when data is first loaded
  useEffect(() => {
    if (hasData && !hasOpenedEnrich) {
      setActiveWorkflowStep('enrich')
      setHasOpenedEnrich(true)
    }
  }, [hasData, hasOpenedEnrich])

  // Show upload page if no data
  if (!hasData) {
    return (
      <div className="h-screen bg-white flex flex-col overflow-hidden">
        <AppNavigation />
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <div className="flex flex-col items-center gap-4 mb-6">
                <Image 
                  src="/arconic-logo.svg" 
                  alt="Arconic" 
                  width={200} 
                  height={50}
                  className="h-12 w-auto"
                />
                <h1 className="text-3xl font-bold text-gray-900">
                  Lighthouse AI
                </h1>
              </div>
              <p className="text-lg text-gray-600">
                Upload your CSV data to get started with AI-powered enrichment and analysis
              </p>
            </div>
            
            <CSVUploader />
          </div>
        </div>
      </div>
    )
  }

  const handleWorkflowStepClick = (stepId: string) => {
    // If clicking the same step, close it
    if (activeWorkflowStep === stepId) {
      setActiveWorkflowStep(null)
    } else {
      // Mark the previous step as completed when moving to a new step
      if (activeWorkflowStep) {
        setCompletedSteps(prev => new Set([...prev, activeWorkflowStep]))
      }
      setActiveWorkflowStep(stepId)
    }
  }

  // Function to progress to the next workflow step
  const progressToNextStep = () => {
    const workflowSteps = ['enrich', 'analyze', 'output', 'export']
    const currentIndex = workflowSteps.indexOf(activeWorkflowStep || '')
    
    if (currentIndex !== -1 && currentIndex < workflowSteps.length - 1) {
      // Mark current step as completed
      if (activeWorkflowStep) {
        setCompletedSteps(prev => new Set([...prev, activeWorkflowStep]))
      }
      // Move to next step
      setActiveWorkflowStep(workflowSteps[currentIndex + 1])
    }
  }

  // Main application with data loaded
  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <AppNavigation />
      
      {/* Workflow Indicator */}
      <WorkflowIndicator 
        onStepClick={handleWorkflowStepClick}
        activeStep={activeWorkflowStep}
      />
      
      {/* Main Content with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <SidebarNav />
        
        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 min-w-0 flex flex-col">
            <SpreadsheetView activeWorkflowStep={activeWorkflowStep} />
          </div>
          
          {/* Right Sidebar based on active workflow step */}
          {activeWorkflowStep && (
            <div className="flex-shrink-0">
              {activeWorkflowStep === 'enrich' && (
                <EnrichSidebar 
                  onClose={() => setActiveWorkflowStep(null)}
                  onComplete={progressToNextStep}
                />
              )}
              {activeWorkflowStep === 'analyze' && (
                <AnalyzeSidebar 
                  onClose={() => setActiveWorkflowStep(null)}
                  onComplete={progressToNextStep}
                />
              )}
              {activeWorkflowStep === 'output' && (
                <OutputSidebar 
                  onClose={() => setActiveWorkflowStep(null)}
                  onComplete={progressToNextStep}
                />
              )}
              {activeWorkflowStep === 'export' && (
                <ExportSidebar 
                  onClose={() => setActiveWorkflowStep(null)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}