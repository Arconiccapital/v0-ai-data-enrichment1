"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CSVUploader } from "@/components/csv-uploader"
import { FindDataDialog } from "@/components/dialogs/find-data-dialog"
import { SpreadsheetView } from "@/components/spreadsheet-view"
import { AppNavigation } from "@/components/app-navigation"
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
  const [showGenerateSidebar, setShowGenerateSidebar] = useState(false)
  const [showExportSidebar, setShowExportSidebar] = useState(false)
  const [showFindDataDialog, setShowFindDataDialog] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)
  const [showCsvUploader, setShowCsvUploader] = useState(false)
  const [csvUploaderMode, setCsvUploaderMode] = useState<'data' | 'enrich'>('data')
  
  // Popular output shortcuts
  const popularOutputs = [
    { IconComponent: BarChart3, name: 'Dashboard', time: '5 min', route: '/create/output' },
    { IconComponent: Mail, name: 'Email Campaign', time: '10 min', route: '/create/output' },
    { IconComponent: FileText, name: 'Report', time: '15 min', route: '/create/output' },
    { IconComponent: MessageSquare, name: 'Social Post', time: '2 min', route: '/create/output/social_media_post' },
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {/* Path 1: Start with Your Data */}
            <Card
              className={cn(
                "group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden h-full flex flex-col",
                "bg-white border-gray-200 hover:border-gray-400",
                hoveredPath === 'data-first' && "ring-2 ring-gray-400 ring-opacity-50"
              )}
              onMouseEnter={() => setHoveredPath('data-first')}
              onMouseLeave={() => setHoveredPath(null)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 bg-black rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <Table2 className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">Start Fresh</CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      Find datasets or use templates to begin
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Start from:</p>
                  <div className="space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowFindDataDialog(true)
                      }}
                      className="w-full flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left border border-gray-200"
                    >
                      <Search className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Find Data</span>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push('/templates')
                      }}
                      className="w-full flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left border border-gray-200"
                    >
                      <Database className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Data Templates</span>
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
                  className="w-full mt-auto bg-black hover:bg-gray-800 text-white border-0 transition-all" 
                  size="lg"
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
              className={cn(
                "group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden h-full flex flex-col",
                "bg-white border-gray-200 hover:border-gray-400",
                hoveredPath === 'enrich-first' && "ring-2 ring-gray-400 ring-opacity-50"
              )}
              onMouseEnter={() => setHoveredPath('enrich-first')}
              onMouseLeave={() => setHoveredPath(null)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 bg-black rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">Enhance Your Data</CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      Upload your CSV and enrich with AI
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">How it works:</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setCsvUploaderMode('enrich')
                      setShowCsvUploader(true)
                    }}
                    className="w-full flex items-center gap-2 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all text-left mb-3 border border-gray-300"
                  >
                    <Upload className="h-4 w-4 text-gray-700" />
                    <span className="text-sm font-medium text-gray-800">Upload Your CSV</span>
                  </button>
                  <p className="text-sm font-medium mb-2">Then enrich with:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-gray-600">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="text-xs">Emails</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-gray-600">
                      <Database className="h-3.5 w-3.5" />
                      <span className="text-xs">Companies</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-gray-600">
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span className="text-xs">Categories</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-gray-600">
                      <FileText className="h-3.5 w-3.5" />
                      <span className="text-xs">Locations</span>
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
                  className="w-full mt-auto bg-black hover:bg-gray-800 text-white border-0 transition-all" 
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCsvUploaderMode('enrich')
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
              className={cn(
                "group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden h-full flex flex-col",
                "bg-white border-gray-200 hover:border-gray-400",
                hoveredPath === 'output-first' && "ring-2 ring-gray-400 ring-opacity-50"
              )}
              onMouseEnter={() => setHoveredPath('output-first')}
              onMouseLeave={() => setHoveredPath(null)}
              onClick={() => router.push('/create/output')}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 bg-black rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <Layout className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">Create from Templates</CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      Choose your output, then get the data
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Popular outputs:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {popularOutputs.slice(0, 4).map((output, idx) => {
                      const Icon = output.IconComponent
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded text-gray-600"
                        >
                          <div className="text-gray-500">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs">{output.name}</span>
                        </div>
                      )
                    })}
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

                <Button 
                  className="w-full mt-auto bg-black hover:bg-gray-800 text-white border-0 transition-all" 
                  size="lg"
                >
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
                <Database className="h-4 w-4" />
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



  // Main application with data loaded
  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <AppNavigation />
      
      
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
            <TabContent activeWorkflowStep={null} />
          </div>
          
          {/* Right Sidebar based on active state */}
          {(showGenerateSidebar || showExportSidebar) && (
            <div className="absolute lg:relative inset-0 lg:inset-auto z-30 lg:z-auto flex-shrink-0">
              {showGenerateSidebar && (
                <GenerateSidebar 
                  onClose={() => setShowGenerateSidebar(false)}
                  onComplete={() => {
                    setShowGenerateSidebar(false)
                    setShowExportSidebar(true)
                  }}
                />
              )}
              {showExportSidebar && (
                <ExportSidebar 
                  onClose={() => setShowExportSidebar(false)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}