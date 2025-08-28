"use client"

import { useState } from "react"
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
  Clock,
  Star,
  Folder
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["files", "recent"])
  )

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
    <div className="w-16 sm:w-48 md:w-56 lg:w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full transition-all duration-300 flex-shrink-0">
      <ScrollArea className="flex-1 px-2 sm:px-3 py-4">
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title.toLowerCase()}>
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
              
              {expandedSections.has(section.title.toLowerCase()) && (
                <div className="mt-2 space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <Button
                        key={item.id}
                        variant={item.isActive ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "w-full justify-start gap-1 sm:gap-2 h-7 sm:h-8 px-1 sm:px-2",
                          item.isActive && "bg-white shadow-sm"
                        )}
                        onClick={item.onClick}
                        disabled={!item.onClick && !item.isActive}
                      >
                        {Icon && <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />}
                        <span className="truncate text-[11px] sm:text-sm hidden sm:block">{item.label}</span>
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
          className="w-full justify-start gap-1 sm:gap-2 h-7 sm:h-8 px-1 sm:px-2"
        >
          <Settings className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="text-[11px] sm:text-sm hidden sm:block">Settings</span>
        </Button>
      </div>
    </div>
  )
}