"use client"

import { useState } from "react"
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

  // Show upload page if no data
  if (!hasData) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
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
                  AI DataEnrich
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
      setActiveWorkflowStep(stepId)
    }
  }

  // Main application with data loaded
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
          <div className="flex-1 flex flex-col overflow-hidden">
            <SpreadsheetView activeWorkflowStep={activeWorkflowStep} />
          </div>
          
          {/* Right Sidebar based on active workflow step */}
          {activeWorkflowStep === 'enrich' && (
            <EnrichSidebar onClose={() => setActiveWorkflowStep(null)} />
          )}
          {activeWorkflowStep === 'analyze' && (
            <AnalyzeSidebar onClose={() => setActiveWorkflowStep(null)} />
          )}
          {activeWorkflowStep === 'output' && (
            <OutputSidebar onClose={() => setActiveWorkflowStep(null)} />
          )}
          {activeWorkflowStep === 'export' && (
            <ExportSidebar onClose={() => setActiveWorkflowStep(null)} />
          )}
        </div>
      </div>
    </div>
  )
}