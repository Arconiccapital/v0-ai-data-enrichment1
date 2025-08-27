"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { templates } from '@/src/data/templates'
import { TemplateDefinition } from '@/src/types/templates'
import { Search, X, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface TemplateSelectorProps {
  open: boolean
  onClose: () => void
  onSelectTemplate: (template: TemplateDefinition) => void
}

const categoryLabels = {
  business: 'Business',
  research: 'Research',
  social: 'Social Media',
  finance: 'Finance',
  recruiting: 'Recruiting',
  'real-estate': 'Real Estate'
}

const categoryColors = {
  business: 'bg-blue-100 text-blue-800',
  research: 'bg-purple-100 text-purple-800',
  social: 'bg-pink-100 text-pink-800',
  finance: 'bg-green-100 text-green-800',
  recruiting: 'bg-orange-100 text-orange-800',
  'real-estate': 'bg-amber-100 text-amber-800'
}

export function TemplateSelector({ open, onClose, onSelectTemplate }: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)

  const filteredTemplates = Object.values(templates).filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = !selectedCategory || template.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(Object.values(templates).map(t => t.category)))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">Choose a Template</DialogTitle>
          <DialogDescription>
            Start with a pre-built template to quickly generate your spreadsheet
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 border-b space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Templates
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {categoryLabels[category as keyof typeof categoryLabels]}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 px-6">
          <div className="grid grid-cols-2 gap-4 py-4">
            {filteredTemplates.map(template => (
              <Card
                key={template.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                  hoveredTemplate === template.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onSelectTemplate(template)}
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-3xl">{template.icon}</div>
                  <Badge 
                    variant="secondary" 
                    className={categoryColors[template.category as keyof typeof categoryColors]}
                  >
                    {categoryLabels[template.category as keyof typeof categoryLabels]}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{template.columns.length} columns</span>
                    <span>{template.sampleData.length} sample rows</span>
                  </div>
                  
                  {/* Preview of columns */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.columns.slice(0, 4).map((col, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-gray-100">
                        {col.name}
                      </span>
                    ))}
                    {template.columns.length > 4 && (
                      <span className="text-xs px-2 py-1 text-gray-500">
                        +{template.columns.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No templates found matching your search.</p>
            </div>
          )}
        </ScrollArea>

        <div className="px-6 py-4 border-t flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Sparkles className="h-4 w-4" />
            <span>Templates include sample data to help you get started</span>
          </div>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}