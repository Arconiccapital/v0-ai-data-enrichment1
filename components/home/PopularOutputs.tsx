"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  BarChart3,
  Mail,
  FileText,
  MessageSquare,
  Table2,
  Layout,
  ArrowRight,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface PopularOutput {
  IconComponent: React.ElementType
  name: string
  time: string
  route: string
  description?: string
  color?: string
}

interface PopularOutputsProps {
  className?: string
  showDescriptions?: boolean
}

const outputs: PopularOutput[] = [
  { 
    IconComponent: BarChart3, 
    name: 'Dashboard', 
    time: '5 min', 
    route: '/create/output',
    description: 'Interactive data visualizations',
    color: 'text-blue-600'
  },
  { 
    IconComponent: Mail, 
    name: 'Email Campaign', 
    time: '10 min', 
    route: '/create/output',
    description: 'Personalized email templates',
    color: 'text-green-600'
  },
  { 
    IconComponent: FileText, 
    name: 'Report', 
    time: '8 min', 
    route: '/create/output',
    description: 'Professional reports',
    color: 'text-purple-600'
  },
  { 
    IconComponent: MessageSquare, 
    name: 'Social Posts', 
    time: '5 min', 
    route: '/create/output',
    description: 'Social media content',
    color: 'text-pink-600'
  },
  { 
    IconComponent: Table2, 
    name: 'Data Table', 
    time: '3 min', 
    route: '/create/output',
    description: 'Formatted data tables',
    color: 'text-orange-600'
  },
  { 
    IconComponent: Layout, 
    name: 'Presentation', 
    time: '12 min', 
    route: '/create/output',
    description: 'Slide presentations',
    color: 'text-indigo-600'
  }
]

export function PopularOutputs({
  className,
  showDescriptions = false
}: PopularOutputsProps) {
  const router = useRouter()
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  const handleOutputClick = (output: PopularOutput) => {
    router.push(output.route)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Popular Outputs
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/create/output')}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          View all
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {outputs.map((output, index) => {
          const Icon = output.IconComponent
          const isHovered = hoveredIndex === index

          return (
            <div
              key={index}
              className="relative group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Button
                variant="outline"
                className={cn(
                  "w-full h-auto flex flex-col items-center gap-2 p-4",
                  "transition-all duration-200",
                  "hover:shadow-lg hover:scale-105",
                  isHovered && "border-gray-400 bg-gray-50"
                )}
                onClick={() => handleOutputClick(output)}
              >
                <Icon className={cn(
                  "h-6 w-6 transition-colors",
                  output.color || "text-gray-600",
                  isHovered && "scale-110"
                )} />
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-900">
                    {output.name}
                  </div>
                  {showDescriptions && output.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {output.description}
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {output.time}
                    </span>
                  </div>
                </div>
              </Button>

              {/* Hover effect indicator */}
              {isHovered && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}
            </div>
          )
        })}
      </div>

      {/* Quick tip */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        </div>
        <p className="text-xs text-gray-700">
          <span className="font-medium">Pro tip:</span> You can transform your data into any of these outputs with just a few clicks. 
          Each output type is optimized for specific use cases.
        </p>
      </div>
    </div>
  )
}