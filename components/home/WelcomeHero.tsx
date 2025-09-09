"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles,
  ArrowRight,
  Zap,
  Globe,
  Shield,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface WelcomeHeroProps {
  userName?: string
  hasRecentProjects?: boolean
  onGetStarted?: () => void
  className?: string
}

const features = [
  { icon: Zap, text: 'AI-Powered', color: 'text-yellow-500' },
  { icon: Globe, text: 'Web Search', color: 'text-blue-500' },
  { icon: Shield, text: 'Secure', color: 'text-green-500' },
  { icon: TrendingUp, text: 'Analytics', color: 'text-purple-500' }
]

export function WelcomeHero({
  userName,
  hasRecentProjects = false,
  onGetStarted,
  className
}: WelcomeHeroProps) {
  const [isAnimating, setIsAnimating] = React.useState(false)

  React.useEffect(() => {
    // Trigger animation on mount
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-50" />
      
      {/* Animated background circles */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-20 animate-pulse" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 text-center">
        {/* Welcome message */}
        <div className={cn(
          "space-y-4 transition-all duration-1000",
          isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        )}>
          {userName && (
            <p className="text-lg text-gray-600">
              {greeting}, {userName}! 👋
            </p>
          )}
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            {hasRecentProjects ? (
              <>Welcome back to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Lighthouse AI</span></>
            ) : (
              <>Transform Your Data with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">AI Magic</span></>
            )}
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {hasRecentProjects ? (
              "Continue where you left off or start something new"
            ) : (
              "Import, enrich, and transform your spreadsheet data into powerful insights using cutting-edge AI"
            )}
          </p>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Badge
                key={index}
                variant="secondary"
                className={cn(
                  "px-3 py-1.5 flex items-center gap-2",
                  "transition-all duration-300 hover:scale-105",
                  "bg-white/80 backdrop-blur-sm border border-gray-200"
                )}
              >
                <Icon className={cn("h-4 w-4", feature.color)} />
                <span className="text-sm font-medium">{feature.text}</span>
              </Badge>
            )
          })}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Button
            size="lg"
            onClick={onGetStarted}
            className={cn(
              "group relative overflow-hidden",
              "bg-gradient-to-r from-blue-600 to-purple-600",
              "hover:from-blue-700 hover:to-purple-700",
              "text-white font-semibold px-8 py-3"
            )}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="font-semibold px-8 py-3"
          >
            Watch Demo
          </Button>
        </div>

        {/* Stats or testimonial */}
        <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">10K+</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">500M+</div>
            <div className="text-sm text-gray-600">Cells Enriched</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">99.9%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
        </div>

        {/* Floating animation elements */}
        {isAnimating && (
          <>
            <div className="absolute top-10 left-10 animate-bounce">
              <Sparkles className="h-6 w-6 text-yellow-500 opacity-60" />
            </div>
            <div className="absolute top-20 right-20 animate-bounce delay-100">
              <Sparkles className="h-4 w-4 text-purple-500 opacity-60" />
            </div>
            <div className="absolute bottom-20 left-20 animate-bounce delay-200">
              <Sparkles className="h-5 w-5 text-blue-500 opacity-60" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}