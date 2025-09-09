"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Wand2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingVibeButtonProps {
  onClick: () => void
  className?: string
}

export function FloatingVibeButton({ onClick, className }: FloatingVibeButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPulsing, setPulsing] = useState(true)
  
  // Stop pulsing after first interaction
  const handleClick = () => {
    setPulsing(false)
    onClick()
  }
  
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            size="lg"
            className={cn(
              "fixed bottom-6 right-6 z-50",
              "h-14 w-14 rounded-full shadow-lg",
              "bg-gradient-to-br from-purple-600 to-blue-600",
              "hover:from-purple-700 hover:to-blue-700",
              "hover:scale-110 hover:shadow-xl",
              "transition-all duration-300",
              "group",
              isPulsing && "animate-pulse",
              className
            )}
          >
            <div className="relative">
              {isHovered ? (
                <Sparkles className="h-6 w-6 text-white animate-spin-slow" />
              ) : (
                <Wand2 className="h-6 w-6 text-white" />
              )}
              
              {/* Ripple effect on hover */}
              {isHovered && (
                <div className="absolute inset-0 -m-2">
                  <div className="h-full w-full rounded-full bg-white opacity-20 animate-ping" />
                </div>
              )}
            </div>
            
            {/* Extended label on hover */}
            <span className={cn(
              "absolute right-full mr-3 px-3 py-1.5",
              "bg-gray-900 text-white text-sm font-medium",
              "rounded-lg whitespace-nowrap",
              "transition-all duration-300",
              "pointer-events-none",
              isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
            )}>
              Transform with AI ✨
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">Vibe Mode</p>
            <p className="text-sm text-muted-foreground">
              Use natural language to filter, transform, or enrich your data instantly
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              💡 Try: "Remove duplicates" or "Calculate growth rate"
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}