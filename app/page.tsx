"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CSVUploader } from "@/components/csv-uploader"
import { FindDataDialog } from "@/components/dialogs/find-data-dialog"
import { SpreadsheetView } from "@/components/spreadsheet-view"
import { AppNavigation } from "@/components/app-navigation"
import { WorkflowIndicator } from "@/components/workflow-indicator"
import { SidebarNav } from "@/components/sidebar-nav"
import { EnrichSidebar } from "@/components/enrich-sidebar"
import { AnalyzeSidebar } from "@/components/analyze-sidebar"
import { LovableOutput } from "@/components/lovable-output"
import { ExportSidebar } from "@/components/export-sidebar"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { Sparkles, Search } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { hasData } = useSpreadsheetStore()
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [hasOpenedEnrich, setHasOpenedEnrich] = useState(false)
  const [showFindDataDialog, setShowFindDataDialog] = useState(false)

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
      <div className="min-h-screen bg-white flex flex-col">
        <AppNavigation />
        
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
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
                Start with a template or upload your own CSV data
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => router.push('/templates')}
                  className="h-32 text-lg"
                  variant="outline"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Sparkles className="h-8 w-8" />
                    <span>Choose Template</span>
                    <span className="text-sm text-gray-500">Pre-built templates</span>
                  </div>
                </Button>
                
                <Button
                  onClick={() => setShowFindDataDialog(true)}
                  className="h-32 text-lg"
                  variant="outline"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8" />
                    <span>Find Data</span>
                    <span className="text-sm text-gray-500">Search for data</span>
                  </div>
                </Button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>
              
              <CSVUploader />
            </div>
            
            <FindDataDialog
              open={showFindDataDialog}
              onClose={() => setShowFindDataDialog(false)}
            />
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <AppNavigation />
      
      {/* Workflow Indicator */}
      <WorkflowIndicator 
        onStepClick={handleWorkflowStepClick}
        activeStep={activeWorkflowStep}
      />
      
      {/* Main Content with Sidebar */}
      <div className="flex-1 flex relative">
        {/* Left Sidebar */}
        <SidebarNav />
        
        {/* Content Area */}
        <div className="flex-1 flex min-w-0">
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
                <LovableOutput 
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