"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { DashboardTemplate } from "@/lib/dashboard-templates"
import { 
  Sparkles, 
  AlertCircle, 
  CheckCircle,
  ArrowRight,
  Database,
  Calendar,
  Hash,
  Type,
  BarChart3
} from "lucide-react"

interface FieldRequirement {
  key: string
  label: string
  type: 'date' | 'numeric' | 'category' | 'text' | 'entity'
  required: boolean
  description?: string
  suggestedColumns?: string[]
}

interface ColumnMapperProps {
  template: DashboardTemplate
  onMappingComplete: (mappings: Record<string, string>) => void
  onCancel: () => void
}

const getFieldIcon = (type: string) => {
  switch (type) {
    case 'date': return <Calendar className="h-4 w-4" />
    case 'numeric': return <Hash className="h-4 w-4" />
    case 'category': return <BarChart3 className="h-4 w-4" />
    case 'text': return <Type className="h-4 w-4" />
    case 'entity': return <Database className="h-4 w-4" />
    default: return null
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'date': return 'bg-blue-100 text-blue-700'
    case 'numeric': return 'bg-green-100 text-green-700'
    case 'category': return 'bg-purple-100 text-purple-700'
    case 'text': return 'bg-gray-100 text-gray-700'
    case 'entity': return 'bg-orange-100 text-orange-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export function ColumnMapper({ template, onMappingComplete, onCancel }: ColumnMapperProps) {
  const { headers, data } = useSpreadsheetStore()
  const [mappings, setMappings] = useState<Record<string, string>>({})
  const [suggestions, setSuggestions] = useState<Record<string, string>>({})
  
  // Extract field requirements from template
  const fieldRequirements: FieldRequirement[] = [
    // This would be defined by the template
    // For now, we'll use common patterns
    { key: 'date', label: 'Date/Time', type: 'date', required: true, description: 'Time-based data for trends' },
    { key: 'revenue', label: 'Revenue/Amount', type: 'numeric', required: true, description: 'Primary metric to track' },
    { key: 'category', label: 'Category/Product', type: 'category', required: false, description: 'For grouping and breakdown' },
    { key: 'entity', label: 'Entity/Customer', type: 'entity', required: false, description: 'Individual items or entities' },
  ]
  
  // AI-powered column suggestions
  useEffect(() => {
    const suggestMappings = () => {
      const newSuggestions: Record<string, string> = {}
      
      fieldRequirements.forEach(field => {
        // Simple heuristic-based matching
        const matchingColumn = headers.find(header => {
          const lower = header.toLowerCase()
          
          if (field.type === 'date') {
            return lower.includes('date') || lower.includes('time') || lower.includes('created') || lower.includes('updated')
          }
          if (field.type === 'numeric') {
            return lower.includes('amount') || lower.includes('revenue') || lower.includes('price') || lower.includes('total') || lower.includes('value')
          }
          if (field.type === 'category') {
            return lower.includes('category') || lower.includes('type') || lower.includes('product') || lower.includes('group')
          }
          if (field.type === 'entity') {
            return lower.includes('name') || lower.includes('customer') || lower.includes('client') || lower.includes('company')
          }
          return false
        })
        
        if (matchingColumn) {
          newSuggestions[field.key] = matchingColumn
        }
      })
      
      setSuggestions(newSuggestions)
      setMappings(newSuggestions)
    }
    
    suggestMappings()
  }, [headers])
  
  const handleMappingChange = (fieldKey: string, columnName: string) => {
    setMappings(prev => ({
      ...prev,
      [fieldKey]: columnName
    }))
  }
  
  const isValid = () => {
    return fieldRequirements
      .filter(field => field.required)
      .every(field => mappings[field.key])
  }
  
  const handleComplete = () => {
    if (isValid()) {
      onMappingComplete(mappings)
    }
  }
  
  // Detect column data types
  const detectColumnType = (columnIndex: number): string => {
    if (data.length === 0) return 'text'
    
    const samples = data.slice(0, 10).map(row => row[columnIndex])
    
    // Check for dates
    const datePattern = /^\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}/
    if (samples.some(val => datePattern.test(val))) return 'date'
    
    // Check for numbers
    const numPattern = /^-?\d+\.?\d*$/
    if (samples.every(val => numPattern.test(val.replace(/[$,]/g, '')))) return 'numeric'
    
    // Check for categories (limited unique values)
    const uniqueValues = new Set(samples)
    if (uniqueValues.size < samples.length / 2) return 'category'
    
    return 'text'
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Map Your Data to {template.name}
        </CardTitle>
        <CardDescription>
          Connect your spreadsheet columns to the template requirements
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* AI Suggestions Alert */}
        {Object.keys(suggestions).length > 0 && (
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              We've suggested some column mappings based on your data. Please review and adjust as needed.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Field Mappings */}
        <div className="space-y-3">
          {fieldRequirements.map(field => (
            <div key={field.key} className="flex items-start gap-4 p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getFieldIcon(field.type)}
                  <span className="font-medium">{field.label}</span>
                  {field.required && (
                    <Badge variant="outline" className="text-xs">Required</Badge>
                  )}
                  <Badge className={`text-xs ${getTypeColor(field.type)}`}>
                    {field.type}
                  </Badge>
                </div>
                {field.description && (
                  <p className="text-sm text-muted-foreground">{field.description}</p>
                )}
              </div>
              
              <Select
                value={mappings[field.key] || ''}
                onValueChange={(value) => handleMappingChange(field.key, value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select column..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {headers.map((header, idx) => {
                    const columnType = detectColumnType(idx)
                    const isGoodMatch = columnType === field.type
                    
                    return (
                      <SelectItem key={header} value={header}>
                        <div className="flex items-center gap-2">
                          <span>{header}</span>
                          {isGoodMatch && (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          )}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
        
        {/* Preview Section */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">Mapping Preview</h4>
          <div className="space-y-1">
            {fieldRequirements.map(field => (
              <div key={field.key} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{field.label}:</span>
                {mappings[field.key] ? (
                  <span className="font-medium">{mappings[field.key]}</span>
                ) : (
                  <span className="text-red-500">Not mapped</span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Validation Messages */}
        {!isValid() && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please map all required fields before continuing
            </AlertDescription>
          </Alert>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleComplete}
            disabled={!isValid()}
            className="flex items-center gap-2"
          >
            Generate Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}