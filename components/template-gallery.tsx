"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Search,
  Star,
  Clock,
  TrendingUp,
  Users,
  ArrowRight,
  Sparkles,
  Grid,
  List,
  Filter,
  X,
  Eye,
  Download,
  Share2,
  Heart,
  Copy
} from "lucide-react"
import { templateCategories, allIndustryTemplates } from "@/lib/templates/industry-templates"
import { dashboardTemplates } from "@/lib/dashboard-templates"
import { DashboardTemplate } from "@/lib/dashboard-templates"
import { toast } from "sonner"

interface TemplateGalleryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: DashboardTemplate) => void
  currentData?: {
    headers: string[]
    rows: string[][]
  }
}

export function TemplateGallery({
  open,
  onOpenChange,
  onSelectTemplate,
  currentData
}: TemplateGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [previewTemplate, setPreviewTemplate] = useState<DashboardTemplate | null>(null)
  const [favoriteTemplates, setFavoriteTemplates] = useState<Set<string>>(new Set())
  const [recentTemplates, setRecentTemplates] = useState<string[]>([])

  // Combine all templates
  const allTemplates = [
    ...Object.values(dashboardTemplates),
    ...allIndustryTemplates
  ]

  // Filter templates based on search and category
  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = searchQuery === "" || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || 
      template.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Get recommended templates based on data
  const getRecommendedTemplates = () => {
    if (!currentData) return []
    
    const columnNames = currentData.headers.map(h => h.toLowerCase())
    const recommendations: DashboardTemplate[] = []
    
    // Check for specific data patterns
    if (columnNames.some(c => c.includes('revenue') || c.includes('sales'))) {
      const salesTemplate = allTemplates.find(t => t.id === 'sales_performance')
      if (salesTemplate) recommendations.push(salesTemplate)
    }
    
    if (columnNames.some(c => c.includes('customer') || c.includes('user'))) {
      const customerTemplate = allTemplates.find(t => t.id === 'customer_analytics')
      if (customerTemplate) recommendations.push(customerTemplate)
    }
    
    if (columnNames.some(c => c.includes('product') || c.includes('sku'))) {
      const productTemplate = allTemplates.find(t => t.id === 'product_performance')
      if (productTemplate) recommendations.push(productTemplate)
    }
    
    if (columnNames.some(c => c.includes('employee') || c.includes('staff'))) {
      const hrTemplate = allTemplates.find(t => t.id === 'employee_engagement')
      if (hrTemplate) recommendations.push(hrTemplate)
    }
    
    return recommendations.slice(0, 3)
  }

  const handleSelectTemplate = (template: DashboardTemplate) => {
    // Add to recent templates
    setRecentTemplates(prev => [
      template.id,
      ...prev.filter(id => id !== template.id)
    ].slice(0, 5))
    
    onSelectTemplate(template)
    onOpenChange(false)
    toast.success(`Selected ${template.name} template`)
  }

  const toggleFavorite = (templateId: string) => {
    setFavoriteTemplates(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(templateId)) {
        newFavorites.delete(templateId)
        toast.success("Removed from favorites")
      } else {
        newFavorites.add(templateId)
        toast.success("Added to favorites")
      }
      return newFavorites
    })
  }

  const renderTemplateCard = (template: DashboardTemplate) => {
    const isFavorite = favoriteTemplates.has(template.id)
    const isRecent = recentTemplates.includes(template.id)
    
    return (
      <Card
        key={template.id}
        className={`cursor-pointer transition-all hover:shadow-lg ${
          viewMode === 'list' ? 'flex items-center' : ''
        }`}
      >
        <CardHeader className={viewMode === 'list' ? 'flex-1' : ''}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{template.icon}</span>
              <div>
                <CardTitle className="text-base">{template.name}</CardTitle>
                <CardDescription className="text-xs mt-1">
                  {template.description}
                </CardDescription>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(template.id)
              }}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className={viewMode === 'list' ? 'flex items-center gap-4' : ''}>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Badge variant="secondary" className="text-xs">
              {template.category}
            </Badge>
            {isRecent && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Recent
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {template.sections.length} sections
            </Badge>
            <Badge variant="outline" className="text-xs">
              {template.sections.reduce((acc, s) => acc + s.widgets.length, 0)} widgets
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                setPreviewTemplate(template)
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleSelectTemplate(template)
              }}
            >
              <ArrowRight className="h-4 w-4 mr-1" />
              Use Template
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const recommendedTemplates = getRecommendedTemplates()

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Grid className="h-5 w-5" />
              Dashboard Template Gallery
            </DialogTitle>
            <DialogDescription>
              Choose from our collection of pre-built dashboards or start from scratch
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Search and Filters */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={viewMode === "grid" ? "default" : "outline"}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "list" ? "default" : "outline"}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
                <TabsTrigger value="all">All Templates</TabsTrigger>
                <TabsTrigger value="recommended" className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Recommended
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  Favorites
                </TabsTrigger>
                {Object.entries(templateCategories).map(([key, category]) => (
                  <TabsTrigger key={key} value={key}>
                    <span className="mr-1">{category.icon}</span>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <ScrollArea className="flex-1 mt-4">
                <TabsContent value="all" className="mt-0">
                  <div className={`grid gap-4 ${
                    viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                  }`}>
                    {filteredTemplates.map(renderTemplateCard)}
                  </div>
                </TabsContent>

                <TabsContent value="recommended" className="mt-0">
                  {recommendedTemplates.length > 0 ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4">
                        <h3 className="font-medium flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          Based on your data structure
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          These templates match your column names and data patterns
                        </p>
                      </div>
                      <div className={`grid gap-4 ${
                        viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                      }`}>
                        {recommendedTemplates.map(renderTemplateCard)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No specific recommendations based on your data</p>
                      <p className="text-sm mt-1">Browse all templates to find the best fit</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="favorites" className="mt-0">
                  {favoriteTemplates.size > 0 ? (
                    <div className={`grid gap-4 ${
                      viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                    }`}>
                      {allTemplates
                        .filter(t => favoriteTemplates.has(t.id))
                        .map(renderTemplateCard)}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Heart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No favorite templates yet</p>
                      <p className="text-sm mt-1">Click the heart icon to save templates</p>
                    </div>
                  )}
                </TabsContent>

                {Object.entries(templateCategories).map(([key, category]) => (
                  <TabsContent key={key} value={key} className="mt-0">
                    <div className={`grid gap-4 ${
                      viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                    }`}>
                      {category.templates.map(renderTemplateCard)}
                    </div>
                  </TabsContent>
                ))}
              </ScrollArea>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl">{previewTemplate.icon}</span>
                {previewTemplate.name}
              </DialogTitle>
              <DialogDescription>{previewTemplate.description}</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {previewTemplate.sections.map((section, idx) => (
                <div key={idx}>
                  <h3 className="font-semibold mb-1">{section.title}</h3>
                  {section.description && (
                    <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {section.widgets.map((widget) => (
                      <Card key={widget.id} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium">{widget.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {widget.type}
                          </Badge>
                        </div>
                        {widget.description && (
                          <p className="text-xs text-gray-500">{widget.description}</p>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                Close
              </Button>
              <Button onClick={() => {
                handleSelectTemplate(previewTemplate)
                setPreviewTemplate(null)
              }}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Use This Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}