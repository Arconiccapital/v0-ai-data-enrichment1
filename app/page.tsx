"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { ProjectSpace } from "@/components/project-space"
import { cn } from "@/lib/utils"
import { 
  Sparkles, 
  Search, 
  Upload, 
  Database, 
  ArrowRight,
  BarChart3,
  Mail,
  FileText,
  MessageSquare,
  Table2,
  Layout
} from "lucide-react"
import { toast } from "sonner"

export default function HomePage() {
  const router = useRouter()
  const { hasData, tabs, activeTab, setActiveTab, removeTab } = useSpreadsheetStore()
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [showFindDataDialog, setShowFindDataDialog] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)
  const [showCsvUploader, setShowCsvUploader] = useState(false)
  const [csvUploaderMode, setCsvUploaderMode] = useState<'data' | 'enrich'>('data')
  const [shouldActivateEnrich, setShouldActivateEnrich] = useState(false)
  
  // Activate enrichment workflow when data is loaded via enrichment path
  useEffect(() => {
    if (hasData && shouldActivateEnrich) {
      setActiveWorkflowStep('enrich')
      setShouldActivateEnrich(false)
      toast.info('Data loaded! Click any column header to start enriching', {
        description: 'You can add emails, companies, categories, and more with AI',
        duration: 5000
      })
    }
  }, [hasData, shouldActivateEnrich])
  
  // Popular output shortcuts
  const popularOutputs = [
    { icon: <BarChart3 className="h-4 w-4" />, name: 'Dashboard', time: '5 min', route: '/create/output' },
    { icon: <Mail className="h-4 w-4" />, name: 'Email Campaign', time: '10 min', route: '/create/output' },
    { icon: <FileText className="h-4 w-4" />, name: 'Report', time: '15 min', route: '/create/output' },
    { icon: <MessageSquare className="h-4 w-4" />, name: 'Social Post', time: '2 min', route: '/create/output/social_media_post' },
  ]

  // Show unified starting page if no data
  if (!hasData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
        <AppNavigation />
        
        <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <div className="flex flex-col items-center gap-4 mb-6">
              <Image 
                src="/arconic-logo.svg" 
                alt="Arconic" 
                width={200} 
                height={50}
                className="h-12 w-auto"
              />
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome to Lighthouse AI
              </h1>
            </div>
            <p className="text-xl text-gray-600">
              Transform your data into anything
            </p>
          </div>
          
          {/* Main Pathways */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Path 1: Start with Your Data */}
            <Card
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
              onMouseEnter={() => setHoveredPath('data-first')}
              onMouseLeave={() => setHoveredPath(null)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Table2 className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-lg">Start Fresh</CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      Find datasets or use templates to begin
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Start from:</p>
                  <div className="space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowFindDataDialog(true)
                      }}
                      className="w-full flex items-center gap-2 p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors text-left"
                    >
                      <Search className="h-4 w-4" />
                      <span className="text-sm">Find Data</span>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push('/templates')
                      }}
                      className="w-full flex items-center gap-2 p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors text-left"
                    >
                      <Database className="h-4 w-4" />
                      <span className="text-sm">Data Templates</span>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Perfect when you:</p>
                  <ul className="space-y-1">
                    <li className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Starting from scratch</span>
                    </li>
                    <li className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Need to find relevant data</span>
                    </li>
                    <li className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Want data templates</span>
                    </li>
                  </ul>
                </div>

                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push('/create/data')
                  }}
                >
                  Start Fresh
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Path 2: Enhance Existing Data */}
            <Card
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
              onMouseEnter={() => setHoveredPath('enrich-first')}
              onMouseLeave={() => setHoveredPath(null)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-lg">Enhance Your Data</CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      Upload your CSV and enrich with AI
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">How it works:</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setCsvUploaderMode('enrich')
                      setShouldActivateEnrich(true)
                      setShowCsvUploader(true)
                    }}
                    className="w-full flex items-center gap-2 p-2 bg-primary/10 rounded-md hover:bg-primary/20 transition-colors text-left mb-3 border border-primary/20"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="text-sm font-medium">Upload Your CSV</span>
                  </button>
                  <p className="text-sm font-medium mb-2">Then enrich with:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">Emails</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                      <Database className="h-4 w-4" />
                      <span className="text-sm">Companies</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                      <BarChart3 className="h-4 w-4" />
                      <span className="text-sm">Categories</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">Locations</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Perfect when you:</p>
                  <ul className="space-y-1">
                    <li className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Have incomplete datasets</span>
                    </li>
                    <li className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Need to add context to raw data</span>
                    </li>
                    <li className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Want AI-powered enhancement</span>
                    </li>
                  </ul>
                </div>

                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCsvUploaderMode('enrich')
                    setShouldActivateEnrich(true)
                    setShowCsvUploader(true)
                  }}
                >
                  Upload & Enrich
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Path 3: Create from Templates */}
            <Card
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
              onMouseEnter={() => setHoveredPath('output-first')}
              onMouseLeave={() => setHoveredPath(null)}
              onClick={() => router.push('/create/output')}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Layout className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-lg">Create from Templates</CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      Choose your output, then get the data
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Popular outputs:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {popularOutputs.slice(0, 4).map((output, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
                      >
                        {output.icon}
                        <span className="text-sm">{output.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Perfect when you:</p>
                  <ul className="space-y-1">
                    <li className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Know what you want to create</span>
                    </li>
                    <li className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Need results quickly</span>
                    </li>
                    <li className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Prefer guided process</span>
                    </li>
                  </ul>
                </div>

                <Button className="w-full" variant={hoveredPath === 'output-first' ? "default" : "outline"}>
                  Choose Template
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/templates')}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Browse Templates
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFindDataDialog(true)}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Find Data
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCsvUploader(true)}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload CSV
              </Button>
            </div>
          </div>

          {/* Project Space */}
          <div className="border-t pt-6">
            <ProjectSpace />
          </div>
          
          {/* CSV Upload Modal */}
          {showCsvUploader && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    {csvUploaderMode === 'enrich' ? 'Upload Data to Enhance' : 'Upload CSV File'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCsvUploader(false)}
                  >
                    <span className="text-2xl">×</span>
                  </Button>
                </div>
                {csvUploaderMode === 'enrich' && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      After uploading, you'll be taken directly to the enrichment workflow where you can add missing information with AI.
                    </p>
                  </div>
                )}
                <CSVUploader />
              </div>
            </div>
          )}
          
          <FindDataDialog
            open={showFindDataDialog}
            onClose={() => setShowFindDataDialog(false)}
          />
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
    const workflowSteps = ['enrich', 'generate', 'export']
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
              {activeWorkflowStep === 'generate' && (
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