"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  FileSpreadsheet,
  Table2,
  Search,
  BarChart3,
  Mail,
  MessageSquare,
  FileText,
  Layout,
  Clock,
  TrendingUp,
  Database,
  Calendar,
  Video,
  Image as ImageIcon,
  ChevronRight,
  Plus,
  Grid3x3,
  List
} from "lucide-react"

interface ProjectItem {
  id: string
  name: string
  type: 'data' | 'output'
  subtype: string
  icon: React.ReactNode
  lastModified: Date
  status: 'draft' | 'in_progress' | 'complete' | 'published'
  metadata?: {
    rows?: number
    columns?: number
    platform?: string
    views?: number
    engagement?: number
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-700 border-gray-300'
    case 'in_progress': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    case 'complete': return 'bg-green-100 text-green-700 border-green-300'
    case 'published': return 'bg-blue-100 text-blue-700 border-blue-300'
    default: return 'bg-gray-100 text-gray-700 border-gray-300'
  }
}

const getTypeIcon = (subtype: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'spreadsheet': <FileSpreadsheet className="h-4 w-4" />,
    'dataset': <Table2 className="h-4 w-4" />,
    'search': <Search className="h-4 w-4" />,
    'dashboard': <BarChart3 className="h-4 w-4" />,
    'email': <Mail className="h-4 w-4" />,
    'social_post': <MessageSquare className="h-4 w-4" />,
    'report': <FileText className="h-4 w-4" />,
    'presentation': <Layout className="h-4 w-4" />,
    'calendar': <Calendar className="h-4 w-4" />,
    'video': <Video className="h-4 w-4" />,
    'infographic': <ImageIcon className="h-4 w-4" />
  }
  return iconMap[subtype] || <Database className="h-4 w-4" />
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

// Demo projects for display
const getDemoProjects = (): ProjectItem[] => [
  {
    id: '1',
    name: 'Q4 Sales Analysis',
    type: 'data',
    subtype: 'spreadsheet',
    icon: getTypeIcon('spreadsheet'),
    lastModified: new Date(Date.now() - 2 * 3600000),
    status: 'in_progress',
    metadata: { rows: 1250, columns: 15 }
  },
  {
    id: '2',
    name: 'Customer Insights Dashboard',
    type: 'output',
    subtype: 'dashboard',
    icon: getTypeIcon('dashboard'),
    lastModified: new Date(Date.now() - 5 * 3600000),
    status: 'published',
    metadata: { views: 342, engagement: 8.5 }
  },
  {
    id: '3',
    name: 'VC Firm Research',
    type: 'data',
    subtype: 'search',
    icon: getTypeIcon('search'),
    lastModified: new Date(Date.now() - 24 * 3600000),
    status: 'complete',
    metadata: { rows: 89, columns: 12 }
  },
  {
    id: '4',
    name: 'Product Launch Campaign',
    type: 'output',
    subtype: 'email',
    icon: getTypeIcon('email'),
    lastModified: new Date(Date.now() - 48 * 3600000),
    status: 'draft',
    metadata: { platform: 'Mailchimp' }
  }
]

export function ProjectSpace() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'all' | 'data' | 'outputs'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  // Initialize with demo projects immediately
  const [projects, setProjects] = useState<ProjectItem[]>(getDemoProjects())
  
  // Optionally load saved projects from localStorage on mount
  useEffect(() => {
    // Check for saved projects after mount
    const savedProjects = localStorage.getItem('lighthouse_projects')
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects)
        setProjects(parsed.map((p: any) => ({
          ...p,
          lastModified: new Date(p.lastModified),
          icon: getTypeIcon(p.subtype)
        })))
      } catch (e) {
        console.error('Failed to parse saved projects:', e)
        // Keep demo projects on error
      }
    }
    // If no saved projects, keep the demo projects
  }, [])
  
  const filteredProjects = projects.filter(project => {
    if (activeTab === 'all') return true
    if (activeTab === 'data') return project.type === 'data'
    if (activeTab === 'outputs') return project.type === 'output'
    return true
  })
  
  const dataCount = projects.filter(p => p.type === 'data').length
  const outputCount = projects.filter(p => p.type === 'output').length
  
  const handleProjectClick = (project: ProjectItem) => {
    // For demo purposes, just show a toast or visual feedback
    // In a real app, this would navigate to the project
    console.log(`Opening project: ${project.name}`)
    
    // Optional: You could show a toast notification
    // toast.info(`Opening ${project.name}...`)
    
    // For now, just prevent navigation to avoid errors
    // if (project.type === 'data') {
    //   router.push('/')
    // } else {
    //   router.push(`/create/output/${project.subtype}`)
    // }
  }
  
  // No loading state needed - we start with demo projects
  
  const renderProjectGrid = (projectList: ProjectItem[]) => {
    if (projectList.length === 0) {
      return <EmptyState />
    }
    
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projectList.map(project => (
            <Card
              key={project.id}
              className="cursor-pointer hover:shadow-md transition-all hover:border-primary group"
              onClick={() => handleProjectClick(project)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    {project.icon}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", getStatusColor(project.status))}
                  >
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <h4 className="font-medium text-sm mb-1 line-clamp-1">
                  {project.name}
                </h4>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(project.lastModified)}
                </div>
                
                {project.metadata && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {project.metadata.rows && (
                      <span>{project.metadata.rows.toLocaleString()} rows</span>
                    )}
                    {project.metadata.views && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {project.metadata.views}
                      </span>
                    )}
                    {project.metadata.platform && (
                      <span>{project.metadata.platform}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }
    
    // List view
    return (
      <div className="space-y-2">
        {projectList.map(project => (
          <Card
            key={project.id}
            className="cursor-pointer hover:shadow-md transition-all hover:border-primary"
            onClick={() => handleProjectClick(project)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {project.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {project.name}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getStatusColor(project.status))}
                    >
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(project.lastModified)}
                    </span>
                    
                    {project.metadata?.rows && (
                      <span>{project.metadata.rows.toLocaleString()} rows</span>
                    )}
                    {project.metadata?.views && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {project.metadata.views} views
                      </span>
                    )}
                  </div>
                </div>
                
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 p-4 bg-muted rounded-full">
        <Database className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        {activeTab === 'data' 
          ? "Start by uploading data or searching for information"
          : activeTab === 'outputs'
          ? "Create your first dashboard, report, or campaign"
          : "Get started by creating your first project"}
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => router.push('/create/data')}>
          <Plus className="h-4 w-4 mr-2" />
          New Data Project
        </Button>
        <Button size="sm" variant="outline" onClick={() => router.push('/create/output')}>
          <Plus className="h-4 w-4 mr-2" />
          New Output
        </Button>
      </div>
    </div>
  )
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Space</h3>
          <p className="text-sm text-muted-foreground">
            Continue working on your data and outputs
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode('grid')}
            className={cn(viewMode === 'grid' && 'bg-muted')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode('list')}
            className={cn(viewMode === 'list' && 'bg-muted')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            View all
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full max-w-[400px] grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All Projects
            {projects.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {projects.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            Data
            {dataCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {dataCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="outputs" className="flex items-center gap-2">
            Outputs
            {outputCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {outputCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          {renderProjectGrid(projects)}
        </TabsContent>
        
        <TabsContent value="data" className="mt-4">
          {renderProjectGrid(projects.filter(p => p.type === 'data'))}
        </TabsContent>
        
        <TabsContent value="outputs" className="mt-4">
          {renderProjectGrid(projects.filter(p => p.type === 'output'))}
        </TabsContent>
      </Tabs>
    </div>
  )
}