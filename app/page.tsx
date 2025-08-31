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
import { GenerateSidebar } from "@/components/generate-sidebar"
import { ExportSidebar } from "@/components/export-sidebar"
import { TabBar } from "@/components/tab-bar"
import { TabContent } from "@/components/tab-content"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { Sparkles, Search } from "lucide-react"
import { toast } from "sonner"

export default function HomePage() {
  const router = useRouter()
  const { hasData, tabs, activeTab, setActiveTab, removeTab } = useSpreadsheetStore()
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [showFindDataDialog, setShowFindDataDialog] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Show upload page if no data
  if (!hasData) {
    return (
      <div className="min-h-screen bg-white flex flex-col overflow-y-auto">
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
    // Special handling for enrich - show guidance
    if (stepId === 'enrich') {
      // Show helpful toast with guidance
      toast.info('Click any column header to enrich data', {
        description: 'Right-click for more options or click the sparkles icon to configure AI enrichment',
        duration: 5000,
        action: {
          label: 'Got it',
          onClick: () => {}
        }
      })
      
      // Trigger column header highlight effect
      const event = new CustomEvent('highlightEnrichment')
      window.dispatchEvent(event)
      return
    }
    
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
    const workflowSteps = ['enrich', 'analyze', 'export']
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
        activeStep={activeWorkflowStep || undefined}
      />
      
      {/* Main Content with Sidebar */}
      <div className="flex-1 flex relative overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <SidebarNav />
        
        {/* Content Area */}
        <div className="flex-1 flex min-w-0 overflow-hidden">
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Tab Bar */}
            <TabBar 
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onTabClose={removeTab}
            />
            
            {/* Tab Content */}
            <TabContent activeWorkflowStep={activeWorkflowStep} />
          </div>
          
          {/* Right Sidebar based on active workflow step */}
          {activeWorkflowStep && (
            <div className="absolute lg:relative inset-0 lg:inset-auto z-30 lg:z-auto flex-shrink-0">
              {(activeWorkflowStep === 'analyze' || activeWorkflowStep === 'output') && (
                <GenerateSidebar 
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