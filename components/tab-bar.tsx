"use client"

import { cn } from "@/lib/utils"
import { X, FileSpreadsheet, LayoutDashboard, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface Tab {
  id: string
  type: 'spreadsheet' | 'dashboard' | 'analysis'
  title: string
  permanent?: boolean
  metadata?: {
    sourceColumns?: string[]
    createdAt?: Date
    prompt?: string
  }
}

interface TabBarProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  onTabClose: (tabId: string) => void
}

export function TabBar({ tabs, activeTab, onTabChange, onTabClose }: TabBarProps) {
  // Don't show tab bar if only one tab
  if (tabs.length <= 1) return null

  const getTabIcon = (type: Tab['type']) => {
    switch (type) {
      case 'spreadsheet':
        return FileSpreadsheet
      case 'dashboard':
        return LayoutDashboard
      case 'analysis':
        return Calculator
      default:
        return FileSpreadsheet
    }
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-center gap-1 px-4 py-2">
        {tabs.map((tab) => {
          const Icon = getTabIcon(tab.type)
          const isActive = tab.id === activeTab
          
          return (
            <div
              key={tab.id}
              className={cn(
                "group flex items-center gap-2 px-3 py-1.5 rounded-t-md cursor-pointer transition-colors",
                isActive 
                  ? "bg-gray-50 border-t border-x border-gray-200" 
                  : "hover:bg-gray-100"
              )}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className="h-4 w-4 text-gray-600" />
              <span className={cn(
                "text-sm font-medium",
                isActive ? "text-gray-900" : "text-gray-600"
              )}>
                {tab.title}
              </span>
              
              {/* Source indicator for non-data tabs */}
              {tab.metadata?.sourceColumns && tab.metadata.sourceColumns.length > 0 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                  {tab.metadata.sourceColumns.length} cols
                </span>
              )}
              
              {/* Close button for non-permanent tabs */}
              {!tab.permanent && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    onTabClose(tab.id)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}