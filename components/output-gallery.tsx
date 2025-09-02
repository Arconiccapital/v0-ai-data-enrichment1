"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  getPopularTemplates, 
  getTemplatesByCategory,
  type OutputTemplate,
  allOutputTemplates
} from "@/lib/output-templates-v2"
import { 
  Search,
  Clock,
  ArrowLeft,
  Sparkles,
  BarChart3,
  Mail,
  MessageSquare,
  FileText,
  TrendingUp,
  Users,
  Settings,
  Package,
  Bot
} from "lucide-react"

const categoryIcons: Record<string, React.ReactNode> = {
  analytics: <BarChart3 className="h-4 w-4" />,
  marketing: <MessageSquare className="h-4 w-4" />,
  sales: <Mail className="h-4 w-4" />,
  presentations: <TrendingUp className="h-4 w-4" />,
  operations: <Settings className="h-4 w-4" />,
  documents: <FileText className="h-4 w-4" />,
  automation: <Bot className="h-4 w-4" />
}

const categories = [
  { id: 'popular', name: 'Most Popular', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'analytics', name: 'Analytics & Visualization', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'marketing', name: 'Marketing & Social', icon: <MessageSquare className="h-4 w-4" /> },
  { id: 'sales', name: 'Sales & Outreach', icon: <Mail className="h-4 w-4" /> },
  { id: 'presentations', name: 'Presentations', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'operations', name: 'Operations', icon: <Settings className="h-4 w-4" /> },
  { id: 'documents', name: 'Documents', icon: <FileText className="h-4 w-4" /> },
  { id: 'automation', name: 'Automation', icon: <Bot className="h-4 w-4" /> }
]

function OutputCard({ template, onClick }: { template: OutputTemplate; onClick: () => void }) {
  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{template.icon}</span>
              <CardTitle className="text-lg">{template.name}</CardTitle>
            </div>
            <CardDescription className="text-sm">
              {template.description}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2">
            <Clock className="h-3 w-3 mr-1" />
            {template.timeEstimate}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Examples */}
          {template.examples && template.examples.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Examples:</p>
              <div className="flex flex-wrap gap-1">
                {template.examples.slice(0, 3).map((example, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {example}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Data Requirements Summary */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Data needed:</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-600 dark:text-green-400">
                {template.dataRequirements.required.length} required
              </span>
              {template.dataRequirements.optional.length > 0 && (
                <span className="text-blue-600 dark:text-blue-400">
                  {template.dataRequirements.optional.length} optional
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function OutputGallery() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("popular")
  
  // Get templates based on selected category
  const getTemplatesForCategory = (categoryId: string) => {
    if (categoryId === 'popular') {
      return getPopularTemplates(9)
    }
    return getTemplatesByCategory(categoryId as any)
  }
  
  // Filter templates based on search
  const filterTemplates = (templates: OutputTemplate[]) => {
    if (!searchQuery) return templates
    
    const query = searchQuery.toLowerCase()
    return templates.filter(template => 
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.examples?.some(ex => ex.toLowerCase().includes(query))
    )
  }
  
  const handleSelectTemplate = (template: OutputTemplate) => {
    // Navigate to data requirements page for this template
    router.push(`/create/output/${template.id}`)
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">What would you like to create?</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Choose your output and we'll help you get the perfect data
        </p>
        
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search outputs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1">
          {categories.map(cat => (
            <TabsTrigger 
              key={cat.id} 
              value={cat.id}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              {cat.icon}
              <span>{cat.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map(cat => (
          <TabsContent key={cat.id} value={cat.id} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterTemplates(getTemplatesForCategory(cat.id)).map(template => (
                <OutputCard
                  key={template.id}
                  template={template}
                  onClick={() => handleSelectTemplate(template)}
                />
              ))}
            </div>
            
            {filterTemplates(getTemplatesForCategory(cat.id)).length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No outputs found matching "{searchQuery}"
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Quick Stats */}
      <div className="mt-8 pt-8 border-t">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{allOutputTemplates.length} output types available</span>
          <span>Most popular: Dashboard, Email Campaign, Pitch Deck</span>
        </div>
      </div>
    </div>
  )
}