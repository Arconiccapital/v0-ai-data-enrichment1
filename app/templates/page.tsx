"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { templates } from '@/src/data/templates'
import { TemplateDefinition } from '@/src/types/templates'
import { useSpreadsheetStore } from '@/lib/spreadsheet-store'
import { TemplateCard } from '@/components/template-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

const categoryLabels = {
  all: 'All Templates',
  presets: 'Presets',
  business: 'Business',
  research: 'Research',
  social: 'Social Media',
  finance: 'Finance',
  recruiting: 'Recruiting',
  'real-estate': 'Real Estate',
  travel: 'Travel'
}

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('presets')
  const router = useRouter()
  const { setDataFromTemplate } = useSpreadsheetStore()

  const handleTemplateSelect = (template: TemplateDefinition) => {
    setDataFromTemplate(template)
    router.push('/')
  }

  const filteredTemplates = Object.values(templates).filter(template => {
    if (selectedCategory === 'all') return true
    if (selectedCategory === 'presets') {
      // Show popular/featured templates as presets
      return ['company', 'investor', 'linkedin', 'price-comparison', 'real-estate', 
              'recruiting', 'research-papers', 'startup', 'stock-analysis', 
              'travel-planning', 'twitter-activity', 'twitter-profile'].includes(template.id)
    }
    return template.category === selectedCategory
  })

  return (
    <div className="h-screen bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">Templates</h1>
                <p className="text-sm text-gray-600">Choose a template to start with pre-configured data</p>
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Category:</span>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={handleTemplateSelect}
            />
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No templates found in this category</p>
          </div>
        )}
      </div>
    </div>
  )
}