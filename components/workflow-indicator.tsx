"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Upload, 
  Sparkles, 
  BarChart3, 
  Download,
  FileText,
  Check,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"

interface WorkflowStep {
  id: string
  label: string
  icon: React.ElementType
  description: string
}

interface WorkflowIndicatorProps {
  onStepClick: (stepId: string) => void
  activeStep?: string
}

export function WorkflowIndicator({ onStepClick, activeStep }: WorkflowIndicatorProps) {
  const { hasData, headers, columnEnrichmentConfigs } = useSpreadsheetStore()
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const steps: WorkflowStep[] = [
    {
      id: "import",
      label: "Import",
      icon: Upload,
      description: "Upload CSV file"
    },
    {
      id: "enrich",
      label: "Enrich",
      icon: Sparkles,
      description: "Add AI-powered columns"
    },
    {
      id: "analyze",
      label: "Generate",
      icon: BarChart3,
      description: "Create insights & reports"
    },
    {
      id: "export",
      label: "Export",
      icon: Download,
      description: "Download results"
    }
  ]

  useEffect(() => {
    const newCompleted = new Set<string>()
    
    // Import is complete if we have data
    if (hasData) {
      newCompleted.add("import")
    }
    
    // Enrich is complete if any column has enrichment configured
    const hasEnrichment = Object.values(columnEnrichmentConfigs).some(config => config?.isConfigured)
    if (hasEnrichment) {
      newCompleted.add("enrich")
    }
    
    setCompletedSteps(newCompleted)
  }, [hasData, columnEnrichmentConfigs])

  if (!hasData) return null

  return (
    <div className="bg-gray-50 border-b border-gray-200 py-3">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center gap-1">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = completedSteps.has(step.id)
            const isActive = activeStep === step.id
            
            return (
              <div key={step.id} className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 relative hover:bg-white",
                    isActive && "bg-white border border-blue-500 shadow-sm",
                    isCompleted && "text-green-600"
                  )}
                  onClick={() => onStepClick(step.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-6 h-6 flex items-center justify-center text-xs font-medium",
                      isCompleted ? "bg-green-100 text-green-600" : 
                      isActive ? "bg-blue-500 text-white" : 
                      "bg-gray-200 text-gray-600"
                    )}>
                      {isCompleted ? <Check className="h-3 w-3" /> : index + 1}
                    </div>
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{step.label}</span>
                  </div>
                  {isActive && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
                      {step.description}
                    </div>
                  )}
                </Button>
                {index < steps.length - 1 && (
                  <ChevronRight className={cn(
                    "h-4 w-4 mx-1",
                    isCompleted ? "text-green-600" : "text-gray-400"
                  )} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}