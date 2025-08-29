"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  FileSpreadsheet,
  Home,
  FileText,
  Mail,
  Share2,
  Users,
  Plus,
  Settings,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Clock,
  Star,
  Folder,
  PanelLeftClose,
  PanelLeft
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"

interface SidebarSection {
  title: string
  items: {
    id: string
    label: string
    icon?: React.ElementType
    onClick?: () => void
    isActive?: boolean
  }[]
}

export function SidebarNav() {
  const { hasData, clearData } = useSpreadsheetStore()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["files", "recent"])
  )

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed')
    if (savedState === 'true') {
      setIsCollapsed(true)
    }
  }, [])

  // Save collapsed state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', newState.toString())
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  const sections: SidebarSection[] = [
    {
      title: "Files",
      items: [
        {
          id: "current",
          label: hasData ? "Current Spreadsheet" : "No file loaded",
          icon: FileSpreadsheet,
          isActive: hasData
        },
        {
          id: "new",
          label: "New File",
          icon: Plus,
          onClick: () => {
            clearData()
            window.location.reload()
          }
        }
      ]
    },
    {
      title: "Recent",
      items: [
        {
          id: "recent1",
          label: "Company Data.csv",
          icon: Clock
        },
        {
          id: "recent2",
          label: "Sales Report.csv",
          icon: Clock
        },
        {
          id: "recent3",
          label: "Customer List.csv",
          icon: Clock
        }
      ]
    },
    {
      title: "Shared",
      items: [
        {
          id: "shared-with-me",
          label: "Shared with me",
          icon: Share2
        },
        {
          id: "public",
          label: "Public sheets",
          icon: Users
        }
      ]
    }
  ]

  return (
    <div className={cn(
      "hidden lg:flex bg-gray-50 border-r border-gray-200 flex-col h-full transition-all duration-300 flex-shrink-0",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Toggle Button */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapse}
          className="h-8 w-8 p-0"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
        {!isCollapsed && (
          <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
            Files
          </span>
        )}
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title.toLowerCase()}>
              {!isCollapsed && (
                <button
                  className="flex items-center justify-between w-full px-1 sm:px-2 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => toggleSection(section.title.toLowerCase())}
                >
                  <span className="uppercase tracking-wider text-[10px] sm:text-xs truncate">
                    {section.title}
                  </span>
                  <span className="hidden sm:block">
                    {expandedSections.has(section.title.toLowerCase()) ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </span>
                </button>
              )}
              
              {(isCollapsed || expandedSections.has(section.title.toLowerCase())) && (
                <div className={cn("space-y-1", !isCollapsed && "mt-2")}>
                  {section.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <Button
                        key={item.id}
                        variant={item.isActive ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "w-full h-7 sm:h-8",
                          isCollapsed ? "justify-center px-0" : "justify-start gap-1 sm:gap-2 px-1 sm:px-2",
                          item.isActive && "bg-white shadow-sm"
                        )}
                        onClick={item.onClick}
                        disabled={!item.onClick && !item.isActive}
                        title={isCollapsed ? item.label : undefined}
                      >
                        {Icon && <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />}
                        {!isCollapsed && (
                          <span className="truncate text-[11px] sm:text-sm hidden sm:block">{item.label}</span>
                        )}
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Settings at bottom */}
      <div className="border-t border-gray-200 p-2 sm:p-3">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full h-7 sm:h-8",
            isCollapsed ? "justify-center px-0" : "justify-start gap-1 sm:gap-2 px-1 sm:px-2"
          )}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-[11px] sm:text-sm hidden sm:block">Settings</span>
          )}
        </Button>
      </div>
    </div>
  )
}