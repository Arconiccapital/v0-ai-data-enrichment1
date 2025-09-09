"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search,
  Upload,
  Sparkles,
  Download,
  Wand2,
  BarChart3,
  Plus,
  Check,
  ArrowRight,
  Database,
  Layout,
  Edit3,
  Eye
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { toast } from "sonner"

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  description?: string
  onClick: () => void
  variant?: 'default' | 'secondary' | 'outline' | 'ghost'
  highlight?: boolean
}

interface DynamicQuickActionsBarProps {
  onActionClick: (actionId: string) => void
  className?: string
}

export function DynamicQuickActionsBar({ onActionClick, className }: DynamicQuickActionsBarProps) {
  const { hasData, headers, data, columnEnrichmentConfigs } = useSpreadsheetStore()
  const [currentJourney, setCurrentJourney] = useState<'find' | 'enhance' | 'template' | null>(null)
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set())
  const [suggestedAction, setSuggestedAction] = useState<string | null>(null)
  
  // Detect current journey based on data state and user actions
  useEffect(() => {
    if (!hasData) {
      setCurrentJourney(null)
    } else {
      // Try to detect journey type from data characteristics
      const hasEnrichment = Object.values(columnEnrichmentConfigs).some(config => config?.isConfigured)
      const isTemplateData = headers.some(h => 
        h.includes('template_') || h.includes('generated_')
      )
      
      if (isTemplateData) {
        setCurrentJourney('template')
      } else if (hasEnrichment) {
        setCurrentJourney('enhance')
      } else {
        setCurrentJourney('find')
      }
    }
  }, [hasData, headers, columnEnrichmentConfigs])
  
  // Generate context-aware actions
  const getQuickActions = (): QuickAction[] => {
    const actions: QuickAction[] = []
    
    if (!hasData) {
      // No data - show starting actions
      actions.push({
        id: 'find-data',
        label: 'Find Data',
        icon: <Search className="h-4 w-4" />,
        description: 'Search for datasets',
        onClick: () => onActionClick('find-data'),
        highlight: true
      })
      
      actions.push({
        id: 'upload-csv',
        label: 'Upload CSV',
        icon: <Upload className="h-4 w-4" />,
        description: 'Import your file',
        onClick: () => onActionClick('upload-csv')
      })
      
      actions.push({
        id: 'choose-template',
        label: 'Choose Template',
        icon: <Layout className="h-4 w-4" />,
        description: 'Start from template',
        onClick: () => onActionClick('choose-template')
      })
    } else {
      // Has data - show contextual actions
      const hasEnrichment = Object.values(columnEnrichmentConfigs).some(config => config?.isConfigured)
      
      // Always show enrich option if columns can be enriched
      if (!hasEnrichment || headers.length < 10) {
        actions.push({
          id: 'enrich-columns',
          label: 'Enrich Columns',
          icon: <Sparkles className="h-4 w-4" />,
          description: 'Add AI-powered data',
          onClick: () => {
            onActionClick('enrich-columns')
            toast.info('Click any column header to start enriching', {
              description: 'Add emails, companies, categories and more with AI'
            })
          },
          highlight: !hasEnrichment
        })
      }
      
      // Vibe Mode - always available with data
      actions.push({
        id: 'vibe-mode',
        label: 'Vibe Mode',
        icon: <Wand2 className="h-4 w-4" />,
        description: 'Transform with AI',
        onClick: () => onActionClick('vibe-mode'),
        variant: hasEnrichment ? 'default' : 'secondary',
        highlight: hasEnrichment && !completedActions.has('vibe-mode')
      })
      
      // Generate outputs
      actions.push({
        id: 'generate-output',
        label: 'Generate',
        icon: <BarChart3 className="h-4 w-4" />,
        description: 'Create visualizations',
        onClick: () => onActionClick('generate-output'),
        variant: 'secondary'
      })
      
      // Export - always last
      actions.push({
        id: 'export-data',
        label: 'Export',
        icon: <Download className="h-4 w-4" />,
        description: 'Download results',
        onClick: () => onActionClick('export-data'),
        variant: 'outline'
      })
      
      // Add template-specific actions
      if (currentJourney === 'template') {
        actions.unshift({
          id: 'edit-data',
          label: 'Edit Data',
          icon: <Edit3 className="h-4 w-4" />,
          description: 'Modify underlying data',
          onClick: () => onActionClick('edit-data'),
          variant: 'outline'
        })
        
        actions.unshift({
          id: 'preview-template',
          label: 'Preview',
          icon: <Eye className="h-4 w-4" />,
          description: 'View formatted output',
          onClick: () => onActionClick('preview-template'),
          variant: 'outline'
        })
      }
    }
    
    return actions
  }
  
  const quickActions = getQuickActions()
  
  // Smart suggestion based on current state
  useEffect(() => {
    if (!hasData) {
      setSuggestedAction('Start by finding data or uploading a CSV file')
    } else {
      const hasEnrichment = Object.values(columnEnrichmentConfigs).some(config => config?.isConfigured)
      
      if (!hasEnrichment) {
        setSuggestedAction('Click "Enrich Columns" to add more data with AI')
      } else if (!completedActions.has('vibe-mode')) {
        setSuggestedAction('Try Vibe Mode to transform your data with natural language')
      } else {
        setSuggestedAction('Your data is ready! Generate outputs or export')
      }
    }
  }, [hasData, columnEnrichmentConfigs, completedActions])
  
  // Mark action as completed
  const handleActionClick = (action: QuickAction) => {
    setCompletedActions(prev => new Set([...prev, action.id]))
    action.onClick()
  }
  
  return (
    <div className={cn("bg-white border-b border-gray-200", className)}>
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {quickActions.map((action, index) => {
              const isCompleted = completedActions.has(action.id)
              
              return (
                <div key={action.id} className="flex items-center">
                  <Button
                    variant={action.highlight ? 'default' : (action.variant || 'outline')}
                    size="sm"
                    className={cn(
                      "gap-2 relative transition-all",
                      action.highlight && "shadow-sm animate-pulse-subtle",
                      isCompleted && "opacity-70"
                    )}
                    onClick={() => handleActionClick(action)}
                  >
                    {isCompleted ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      action.icon
                    )}
                    <span className="font-medium">{action.label}</span>
                    {action.description && (
                      <span className="hidden lg:inline text-xs text-muted-foreground ml-1">
                        ({action.description})
                      </span>
                    )}
                  </Button>
                  
                  {index < quickActions.length - 1 && (
                    <ArrowRight className="h-3 w-3 mx-2 text-gray-400" />
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Smart Suggestion */}
          {suggestedAction && (
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="secondary" className="font-normal">
                <Sparkles className="h-3 w-3 mr-1" />
                {suggestedAction}
              </Badge>
            </div>
          )}
        </div>
        
        {/* Journey Indicator (subtle) */}
        {currentJourney && hasData && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Journey:</span>
            <Badge variant="outline" className="text-xs">
              {currentJourney === 'find' && 'Finding & Enriching Data'}
              {currentJourney === 'enhance' && 'Enhancing Your Data'}
              {currentJourney === 'template' && 'Template-Based Creation'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              • {data.length} rows • {headers.length} columns
            </span>
          </div>
        )}
      </div>
    </div>
  )
}