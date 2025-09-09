"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Upload, 
  Database, 
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface JourneyCardsProps {
  onFindData: () => void
  onUploadCSV: () => void
  onChooseTemplate: () => void
  hoveredPath: string | null
  onHoverPath: (path: string | null) => void
  className?: string
}

const journeys = [
  {
    id: 'find',
    title: 'Find Data',
    description: 'Search and import data from various sources',
    icon: Search,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverBorderColor: 'hover:border-blue-400',
    features: [
      'Web search integration',
      'API connections',
      'Real-time data'
    ],
    estimatedTime: '2 min',
    badge: 'AI Powered'
  },
  {
    id: 'upload',
    title: 'Upload CSV',
    description: 'Import your existing spreadsheet data',
    icon: Upload,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverBorderColor: 'hover:border-green-400',
    features: [
      'Drag & drop upload',
      'Auto-detect headers',
      'Data validation'
    ],
    estimatedTime: '30 sec',
    badge: 'Quick Start'
  },
  {
    id: 'template',
    title: 'Choose Template',
    description: 'Start with pre-built industry templates',
    icon: Database,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverBorderColor: 'hover:border-purple-400',
    features: [
      '20+ templates',
      'Industry specific',
      'Customizable'
    ],
    estimatedTime: '1 min',
    badge: 'Popular'
  }
]

export function JourneyCards({
  onFindData,
  onUploadCSV,
  onChooseTemplate,
  hoveredPath,
  onHoverPath,
  className
}: JourneyCardsProps) {
  const handleAction = (journeyId: string) => {
    switch (journeyId) {
      case 'find':
        onFindData()
        break
      case 'upload':
        onUploadCSV()
        break
      case 'template':
        onChooseTemplate()
        break
    }
  }

  return (
    <div className={cn("grid md:grid-cols-3 gap-6", className)}>
      {journeys.map((journey) => {
        const Icon = journey.icon
        const isHovered = hoveredPath === journey.id

        return (
          <Card
            key={journey.id}
            className={cn(
              "relative overflow-hidden transition-all duration-300 cursor-pointer",
              "border-2",
              journey.borderColor,
              journey.hoverBorderColor,
              isHovered && "shadow-xl scale-105 z-10"
            )}
            onMouseEnter={() => onHoverPath(journey.id)}
            onMouseLeave={() => onHoverPath(null)}
            onClick={() => handleAction(journey.id)}
          >
            {/* Gradient background on hover */}
            <div
              className={cn(
                "absolute inset-0 opacity-0 transition-opacity duration-300",
                isHovered && "opacity-10",
                `bg-gradient-to-br ${journey.color}`
              )}
            />

            <CardHeader className="relative">
              <div className="flex items-start justify-between mb-2">
                <div className={cn(
                  "p-3 rounded-lg",
                  journey.bgColor,
                  isHovered && "animate-pulse"
                )}>
                  <Icon className={cn(
                    "h-6 w-6",
                    isHovered ? "text-gray-900" : "text-gray-700"
                  )} />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {journey.badge}
                </Badge>
              </div>
              
              <CardTitle className="text-xl font-bold">
                {journey.title}
              </CardTitle>
              <CardDescription className="text-sm">
                {journey.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="relative space-y-4">
              {/* Features list */}
              <ul className="space-y-2">
                {journey.features.map((feature, idx) => (
                  <li 
                    key={idx}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Action area */}
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-xs text-gray-500">
                  ~ {journey.estimatedTime}
                </span>
                <Button
                  size="sm"
                  variant={isHovered ? "default" : "ghost"}
                  className="group/btn"
                >
                  Get Started
                  <ArrowRight className={cn(
                    "ml-2 h-4 w-4 transition-transform",
                    isHovered && "translate-x-1"
                  )} />
                </Button>
              </div>
            </CardContent>

            {/* Sparkle effect on hover */}
            {isHovered && (
              <div className="absolute top-4 right-4 animate-pulse">
                <Sparkles className="h-5 w-5 text-yellow-500" />
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}