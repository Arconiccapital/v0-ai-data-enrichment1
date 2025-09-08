"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSpreadsheetStore } from '@/lib/spreadsheet-store'
import { useRouter } from 'next/navigation'
import { SpreadsheetView } from '@/components/spreadsheet-view'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar,
  CalendarDays,
  LayoutGrid,
  BarChart3,
  Clock,
  User,
  CheckCircle2,
  Circle,
  AlertCircle,
  Edit3,
  Send,
  Archive,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Search,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContentItem {
  publish_date: string
  publish_time: string
  content_type: string
  title: string
  status: string
  platform: string
  author: string
  reviewer: string
  approver: string
  content_pillar: string
  campaign: string
  theme: string
  primary_keyword: string
  secondary_keywords: string
  content_length: string
  visual_requirements: string
  draft_deadline: string
  review_deadline: string
  notes: string
  brief_link: string
  asset_folder: string
  primary_channel: string
  cross_promotion: string
  paid_promotion: string
  performance_score: string
  views: string
  engagement_rate: string
  click_through_rate: string
  conversion_rate: string
  [key: string]: string // Allow dynamic fields
}

// Define calendar headers
const contentCalendarHeaders = [
  'publish_date',
  'publish_time',
  'content_type',
  'title',
  'status',
  'platform',
  'author',
  'reviewer',
  'approver',
  'content_pillar',
  'campaign',
  'theme',
  'primary_keyword',
  'secondary_keywords',
  'content_length',
  'visual_requirements',
  'draft_deadline',
  'review_deadline',
  'notes',
  'brief_link',
  'asset_folder',
  'primary_channel',
  'cross_promotion',
  'paid_promotion',
  'performance_score',
  'views',
  'engagement_rate',
  'click_through_rate',
  'conversion_rate'
]

// Sample calendar data
const sampleContentCalendarData: ContentItem[] = [
  {
    publish_date: '2024-01-15',
    publish_time: '09:00',
    content_type: 'Blog Post',
    title: 'AI Marketing Trends 2024: What You Need to Know',
    status: 'scheduled',
    platform: 'Blog',
    author: 'Sarah Chen',
    reviewer: 'Mike Johnson',
    approver: 'Lisa Park',
    content_pillar: 'Thought Leadership',
    campaign: 'Q1 AI Series',
    theme: 'Future of Marketing',
    primary_keyword: 'AI marketing trends',
    secondary_keywords: 'machine learning, automation, personalization',
    content_length: '2000 words',
    visual_requirements: 'Hero image, 3 infographics',
    draft_deadline: '2024-01-10',
    review_deadline: '2024-01-12',
    notes: 'Include case studies from top clients',
    brief_link: 'https://docs.google.com/brief-123',
    asset_folder: '/content/2024/01/ai-trends',
    primary_channel: 'Blog',
    cross_promotion: 'LinkedIn, Twitter, Newsletter',
    paid_promotion: '$500',
    performance_score: '',
    views: '',
    engagement_rate: '',
    click_through_rate: '',
    conversion_rate: ''
  },
  {
    publish_date: '2024-01-15',
    publish_time: '12:00',
    content_type: 'Social Post',
    title: 'LinkedIn: AI Marketing Trends Announcement',
    status: 'approved',
    platform: 'LinkedIn',
    author: 'Sarah Chen',
    reviewer: 'David Kim',
    approver: 'Lisa Park',
    content_pillar: 'Thought Leadership',
    campaign: 'Q1 AI Series',
    theme: 'Future of Marketing',
    primary_keyword: 'AI marketing',
    secondary_keywords: 'innovation, technology',
    content_length: '1200 characters',
    visual_requirements: 'Data visualization graphic',
    draft_deadline: '2024-01-13',
    review_deadline: '2024-01-14',
    notes: 'Link to blog post',
    brief_link: '',
    asset_folder: '/content/2024/01/social',
    primary_channel: 'LinkedIn',
    cross_promotion: 'Twitter',
    paid_promotion: '$100',
    performance_score: '',
    views: '',
    engagement_rate: '',
    click_through_rate: '',
    conversion_rate: ''
  },
  {
    publish_date: '2024-01-16',
    publish_time: '14:00',
    content_type: 'Email',
    title: 'Newsletter: This Week in AI Marketing',
    status: 'in_review',
    platform: 'Email',
    author: 'Mike Johnson',
    reviewer: 'Sarah Chen',
    approver: 'Lisa Park',
    content_pillar: 'Industry News',
    campaign: 'Weekly Newsletter',
    theme: 'Industry Updates',
    primary_keyword: 'AI marketing news',
    secondary_keywords: 'weekly roundup, insights',
    content_length: '800 words',
    visual_requirements: 'Header image, section dividers',
    draft_deadline: '2024-01-14',
    review_deadline: '2024-01-15',
    notes: 'Include top 5 stories from the week',
    brief_link: 'https://docs.google.com/brief-124',
    asset_folder: '/content/2024/01/newsletter',
    primary_channel: 'Email',
    cross_promotion: 'Blog excerpt',
    paid_promotion: '0',
    performance_score: '',
    views: '',
    engagement_rate: '',
    click_through_rate: '',
    conversion_rate: ''
  },
  {
    publish_date: '2024-01-17',
    publish_time: '10:00',
    content_type: 'Video',
    title: 'Webinar: Implementing AI in Your Marketing Stack',
    status: 'draft',
    platform: 'YouTube',
    author: 'David Kim',
    reviewer: 'Sarah Chen',
    approver: 'Lisa Park',
    content_pillar: 'Product Education',
    campaign: 'Product Launch',
    theme: 'Implementation Guide',
    primary_keyword: 'AI marketing implementation',
    secondary_keywords: 'tutorial, how-to, webinar',
    content_length: '45 minutes',
    visual_requirements: 'Slides, screen recording, lower thirds',
    draft_deadline: '2024-01-12',
    review_deadline: '2024-01-14',
    notes: 'Include live Q&A session',
    brief_link: 'https://docs.google.com/brief-125',
    asset_folder: '/content/2024/01/webinar',
    primary_channel: 'YouTube',
    cross_promotion: 'LinkedIn, Email, Blog',
    paid_promotion: '$1000',
    performance_score: '',
    views: '',
    engagement_rate: '',
    click_through_rate: '',
    conversion_rate: ''
  },
  {
    publish_date: '2024-01-10',
    publish_time: '11:00',
    content_type: 'Infographic',
    title: 'The State of AI Marketing 2024',
    status: 'published',
    platform: 'Instagram',
    author: 'Lisa Park',
    reviewer: 'Mike Johnson',
    approver: 'Sarah Chen',
    content_pillar: 'Data & Research',
    campaign: 'Q1 AI Series',
    theme: 'Market Research',
    primary_keyword: 'AI marketing statistics',
    secondary_keywords: 'data, infographic, research',
    content_length: '10 data points',
    visual_requirements: 'Full infographic design',
    draft_deadline: '2024-01-05',
    review_deadline: '2024-01-08',
    notes: 'Based on our annual survey',
    brief_link: 'https://docs.google.com/brief-120',
    asset_folder: '/content/2024/01/infographic',
    primary_channel: 'Instagram',
    cross_promotion: 'Pinterest, LinkedIn, Twitter',
    paid_promotion: '$200',
    performance_score: '92',
    views: '15420',
    engagement_rate: '8.5',
    click_through_rate: '3.2',
    conversion_rate: '1.8'
  }
]

// Sample data for demonstration
const generateSampleCalendarData = (): ContentItem[] => {
  // Return sample data (no longer needed as we use spreadsheet data)
  return sampleContentCalendarData
}

export function ContentCalendarGenerator({ templateId }: { templateId: string }) {
  const router = useRouter()
  const { data, headers, setData } = useSpreadsheetStore()
  const [viewMode, setViewMode] = useState<'calendar' | 'pipeline'>('calendar')
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedFilters, setSelectedFilters] = useState({
    platform: 'all',
    status: 'all'
  })
  
  // Initialize with sample data if empty
  useEffect(() => {
    if (templateId === 'content_calendar' && data.length === 0) {
      // Convert sample data objects to 2D array for spreadsheet
      const rows: string[][] = sampleContentCalendarData.map(item => 
        contentCalendarHeaders.map(header => String(item[header] || ''))
      )
      setData(contentCalendarHeaders, rows)
    }
  }, [templateId, data.length, setData])
  
  // Convert spreadsheet data back to ContentItem objects for views
  const getContentItems = (): ContentItem[] => {
    if (data.length === 0 || !headers.length) return sampleContentCalendarData
    
    return data.map(row => {
      const item: ContentItem = {} as ContentItem
      headers.forEach((header, idx) => {
        item[header] = row[idx] || ''
      })
      return item
    })
  }
  
  const contentItems = getContentItems()
  
  // Get calendar data for current view
  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }
  
  // Filter content items
  const filteredItems = contentItems.filter(item => {
    if (selectedFilters.platform !== 'all' && item.platform !== selectedFilters.platform) return false
    if (selectedFilters.status !== 'all' && item.status !== selectedFilters.status) return false
    return true
  })
  
  // Get items for a specific date
  const getItemsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return filteredItems.filter(item => item.publish_date === dateStr)
  }
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit3 className="h-3 w-3" />
      case 'in_review': return <Clock className="h-3 w-3" />
      case 'approved': return <CheckCircle2 className="h-3 w-3" />
      case 'scheduled': return <Send className="h-3 w-3" />
      case 'published': return <CheckCircle2 className="h-3 w-3 text-green-600" />
      case 'archived': return <Archive className="h-3 w-3" />
      default: return <Circle className="h-3 w-3" />
    }
  }
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'in_review': return 'bg-yellow-100 text-yellow-700'
      case 'approved': return 'bg-blue-100 text-blue-700'
      case 'scheduled': return 'bg-purple-100 text-purple-700'
      case 'published': return 'bg-green-100 text-green-700'
      case 'archived': return 'bg-gray-100 text-gray-500'
      default: return 'bg-gray-100 text-gray-700'
    }
  }
  
  // Get platform color
  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      LinkedIn: 'bg-blue-500',
      Twitter: 'bg-sky-400',
      Instagram: 'bg-pink-500',
      Facebook: 'bg-indigo-600',
      Blog: 'bg-green-500',
      Email: 'bg-orange-500'
    }
    return colors[platform] || 'bg-gray-500'
  }
  
  // Handle using template - data is already loaded
  const handleUseTemplate = () => {
    router.push('/')
  }
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              Content Calendar
            </h1>
            <p className="text-gray-600 mt-1">
              Plan, schedule, and track your content across all platforms
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Back to Gallery
            </Button>
            <Button onClick={handleUseTemplate}>
              Use This Template
            </Button>
          </div>
        </div>
        
      </div>
      
      {/* Data Preview Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Template Data</CardTitle>
          <CardDescription>
            {data.length} content items loaded. Click "Use This Template" to start editing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {headers.length} columns × {data.length} rows
            </div>
            <Button onClick={handleUseTemplate}>
              Use This Template
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Visualization Section - Secondary */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Calendar Views</h2>
          <p className="text-sm text-muted-foreground">
            Visualize your content calendar in different formats
          </p>
        </div>
        
        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
          <TabsList className="grid grid-cols-2 w-full max-w-[300px]">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Pipeline
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select 
          value={selectedFilters.platform} 
          onValueChange={(v) => setSelectedFilters(prev => ({ ...prev, platform: v }))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
            <SelectItem value="Twitter">Twitter</SelectItem>
            <SelectItem value="Instagram">Instagram</SelectItem>
            <SelectItem value="Blog">Blog</SelectItem>
            <SelectItem value="Email">Email</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={selectedFilters.status} 
          onValueChange={(v) => setSelectedFilters(prev => ({ ...prev, status: v }))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      
      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => {
                  const newDate = new Date(currentDate)
                  newDate.setMonth(newDate.getMonth() - 1)
                  setCurrentDate(newDate)
                }}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => {
                  const newDate = new Date(currentDate)
                  newDate.setMonth(newDate.getMonth() + 1)
                  setCurrentDate(newDate)
                }}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <Select value={calendarView} onValueChange={(v) => setCalendarView(v as any)}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-7 gap-px bg-gray-200 p-px rounded-lg overflow-hidden">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {getCalendarDays().map((date, idx) => {
                const items = getItemsForDate(date)
                const isToday = date.toDateString() === new Date().toDateString()
                const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                
                return (
                  <div
                    key={idx}
                    className={cn(
                      "bg-white p-2 min-h-[100px] border border-gray-100",
                      !isCurrentMonth && "bg-gray-50",
                      isToday && "bg-blue-50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-sm",
                        !isCurrentMonth && "text-gray-400",
                        isToday && "font-bold text-blue-600"
                      )}>
                        {date.getDate()}
                      </span>
                      {items.length > 0 && (
                        <Badge variant="secondary" className="text-xs h-5 px-1">
                          {items.length}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {items.slice(0, 3).map((item, itemIdx) => (
                        <div
                          key={`${date.toISOString()}-${itemIdx}`}
                          className="group relative cursor-pointer"
                        >
                          <div className={cn(
                            "h-1.5 rounded-full",
                            getPlatformColor(item.platform)
                          )} />
                          
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full left-0 mb-1 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                            <div className="font-medium">{item.title}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={cn("text-xs h-4", getStatusColor(item.status))}>
                                {item.status}
                              </Badge>
                              <span>{item.platform}</span>
                              <span>{item.publish_time}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {items.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{items.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Pipeline View */}
      {viewMode === 'pipeline' && (
        <div className="grid grid-cols-5 gap-4">
          {['draft', 'in_review', 'approved', 'scheduled', 'published'].map(status => {
            const statusItems = filteredItems.filter(item => item.status === status)
            
            return (
              <Card key={status} className="h-[600px] flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span className="capitalize">{status.replace('_', ' ')}</span>
                    <Badge variant="secondary">{statusItems.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden pb-2">
                  <ScrollArea className="h-full pr-4">
                    <div className="space-y-2">
                      {statusItems.map((item, itemIdx) => (
                        <Card key={`${status}-${itemIdx}`} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-1">
                              {getStatusIcon(item.status)}
                              <Badge className={cn("text-xs h-5", getStatusColor(item.status))}>
                                {item.status}
                              </Badge>
                            </div>
                            <div className={cn("w-2 h-2 rounded-full", getPlatformColor(item.platform))} />
                          </div>
                          
                          <h4 className="text-sm font-medium mb-1 line-clamp-2">{item.title}</h4>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.publish_date).toLocaleDateString()}
                              {item.publish_time && ` at ${item.publish_time}`}
                            </div>
                            
                            {item.author && (
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <User className="h-3 w-3" />
                                {item.author}
                              </div>
                            )}
                            
                            <div className="flex flex-wrap gap-1 mt-2">
                              <Badge variant="outline" className="text-xs h-5">
                                {item.platform}
                              </Badge>
                              <Badge variant="outline" className="text-xs h-5">
                                {item.content_type}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
      
    </div>
  )
}