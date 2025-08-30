"use client"

import { SpreadsheetView } from "./spreadsheet-view"
import { DashboardPreview } from "./dashboard-preview"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileSpreadsheet, LayoutDashboard, Calculator, Info } from "lucide-react"

interface TabContentProps {
  activeWorkflowStep?: string | null
}

export function TabContent({ activeWorkflowStep }: TabContentProps) {
  const { activeTab, getTab } = useSpreadsheetStore()
  const currentTab = getTab(activeTab)
  
  if (!currentTab) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-500">No tab selected</p>
        </Card>
      </div>
    )
  }
  
  // Render based on tab type
  switch (currentTab.type) {
    case 'spreadsheet':
      return <SpreadsheetView activeWorkflowStep={activeWorkflowStep} />
      
    case 'dashboard':
      // Show dashboard with data source indicator
      return (
        <div className="flex-1 flex flex-col">
          {/* Data source indicator bar */}
          {currentTab.metadata?.sourceColumns && (
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Using data from: 
                </span>
                <div className="flex gap-1">
                  {currentTab.metadata.sourceColumns.map((col, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {col}
                    </Badge>
                  ))}
                </div>
                {currentTab.metadata.prompt && (
                  <span className="text-xs text-gray-500 ml-auto">
                    Generated from: "{currentTab.metadata.prompt.substring(0, 50)}..."
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Dashboard content */}
          {currentTab.data ? (
            <DashboardPreview 
              dashboard={currentTab.data}
              onClose={() => {
                // Don't close, just switch back to data tab
                const { setActiveTab } = useSpreadsheetStore.getState()
                setActiveTab('data')
              }}
              onRefresh={() => {
                // Could regenerate dashboard here
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Card className="p-8 text-center">
                <LayoutDashboard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Dashboard data not available</p>
              </Card>
            </div>
          )}
        </div>
      )
      
    case 'analysis':
      // Show analysis model (DCF, etc.)
      return (
        <div className="flex-1 flex flex-col">
          {/* Data source indicator bar */}
          {currentTab.metadata?.sourceColumns && (
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Analysis using: 
                </span>
                <div className="flex gap-1">
                  {currentTab.metadata.sourceColumns.map((col, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {col}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Analysis content placeholder */}
          <div className="flex-1 flex items-center justify-center">
            <Card className="p-8 text-center">
              <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{currentTab.title}</h3>
              <p className="text-gray-500">Analysis model coming soon</p>
              <p className="text-sm text-gray-400 mt-2">
                DCF models, financial analysis, and more
              </p>
            </Card>
          </div>
        </div>
      )
      
    default:
      return (
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center">
            <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Unknown tab type: {currentTab.type}</p>
          </Card>
        </div>
      )
  }
}