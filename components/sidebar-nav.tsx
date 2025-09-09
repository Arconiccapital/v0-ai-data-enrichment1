"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
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
  PanelLeft,
  BarChart3,
  Database,
  MessageSquare,
  Search,
  Table2,
  Layout,
  Calendar,
  Video,
  Image as ImageIcon
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
    badge?: string
    metadata?: {
      time?: string
      status?: string
      type?: string
    }
  }[]
}

interface ProjectItem {
  id: string
  name: string
  type: 'data' | 'output'
  subtype: string
  icon: React.ElementType
  lastModified: Date
  status: 'draft' | 'in_progress' | 'complete' | 'published'
}

const getTypeIcon = (subtype: string) => {
  const iconMap: Record<string, React.ElementType> = {
    'spreadsheet': FileSpreadsheet,
    'dataset': Table2,
    'search': Search,
    'dashboard': BarChart3,
    'email': Mail,
    'social_post': MessageSquare,
    'report': FileText,
    'presentation': Layout,
    'calendar': Calendar,
    'video': Video,
    'infographic': ImageIcon
  }
  return iconMap[subtype] || Database
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function SidebarNav() {
  const router = useRouter()
  const { hasData, clearData } = useSpreadsheetStore()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["projects", "files"])
  )
  const [projects, setProjects] = useState<ProjectItem[]>([])

  // Load collapsed state and projects from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed')
    if (savedState === 'true') {
      setIsCollapsed(true)
    }
    
    // Load projects
    const savedProjects = localStorage.getItem('lighthouse_projects')
    if (savedProjects) {
      const parsed = JSON.parse(savedProjects)
      setProjects(parsed.map((p: any) => ({
        ...p,
        lastModified: new Date(p.lastModified),
        icon: getTypeIcon(p.subtype)
      })).slice(0, 5)) // Only show 5 most recent in sidebar
    } else {
      // Demo projects
      setProjects([
        {
          id: '1',
          name: 'Q4 Sales Analysis',
          type: 'data',
          subtype: 'spreadsheet',
          icon: getTypeIcon('spreadsheet'),
          lastModified: new Date(Date.now() - 2 * 3600000),
          status: 'in_progress'
        },
        {
          id: '2',
          name: 'Customer Dashboard',
          type: 'output',
          subtype: 'dashboard',
          icon: getTypeIcon('dashboard'),
          lastModified: new Date(Date.now() - 5 * 3600000),
          status: 'complete'
        },
        {
          id: '3',
          name: 'VC Firm Research',
          type: 'data',
          subtype: 'search',
          icon: getTypeIcon('search'),
          lastModified: new Date(Date.now() - 24 * 3600000),
          status: 'complete'
        }
      ])
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

  const handleProjectClick = (project: ProjectItem) => {
    if (project.type === 'data') {
      // For data projects, we'd load the data into the spreadsheet
      // For now, just stay on current page
      router.push('/')
    } else {
      // For output projects, navigate to the appropriate output page
      router.push(`/create/output/${project.subtype}`)
    }
  }

  const sections: SidebarSection[] = [
    {
      title: "Projects",
      items: [
        ...projects.map(project => ({
          id: project.id,
          label: project.name,
          icon: project.icon,
          onClick: () => handleProjectClick(project),
          metadata: {
            time: formatTimeAgo(project.lastModified),
            status: project.status,
            type: project.type
          }
        })),
        {
          id: "view-all",
          label: "View all projects",
          icon: Folder,
          onClick: () => {
            clearData()
            router.push('/')
          }
        }
      ]
    },
    {
      title: "Current",
      items: [
        {
          id: "current",
          label: hasData ? "Active Spreadsheet" : "No file loaded",
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
                          "w-full",
                          item.metadata ? "h-auto py-1.5" : "h-7 sm:h-8",
                          isCollapsed ? "justify-center px-0" : "justify-start gap-1 sm:gap-2 px-1 sm:px-2",
                          item.isActive && "bg-white shadow-sm"
                        )}
                        onClick={item.onClick}
                        disabled={!item.onClick && !item.isActive}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <div className={cn(
                          "flex items-center",
                          isCollapsed ? "justify-center" : "justify-start gap-2 w-full"
                        )}>
                          {Icon && <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />}
                          
                          {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="truncate text-[11px] sm:text-xs block">
                                  {item.label}
                                </span>
                                {item.metadata?.time && (
                                  <span className="text-[10px] text-muted-foreground ml-1">
                                    {item.metadata.time}
                                  </span>
                                )}
                              </div>
                              {item.metadata?.status && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <div className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    item.metadata.status === 'complete' && "bg-green-500",
                                    item.metadata.status === 'in_progress' && "bg-yellow-500",
                                    item.metadata.status === 'draft' && "bg-gray-400"
                                  )} />
                                  <span className="text-[10px] text-muted-foreground capitalize">
                                    {item.metadata.type}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
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