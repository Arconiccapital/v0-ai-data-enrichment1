"use client"

import { cn } from "@/lib/utils"
import { Wand2, Table2, Clock } from "lucide-react"

interface VibeTabsProps {
  activeTab: 'canvas' | 'data' | 'history'
  onTabChange: (tab: 'canvas' | 'data' | 'history') => void
  hasGeneratedContent: boolean
}

export function VibeTabs({ activeTab, onTabChange, hasGeneratedContent }: VibeTabsProps) {
  const tabs = [
    {
      id: 'canvas' as const,
      label: 'Canvas',
      icon: Wand2,
      description: 'AI-generated views'
    },
    {
      id: 'data' as const,
      label: 'Data',
      icon: Table2,
      description: 'Original spreadsheet'
    },
    {
      id: 'history' as const,
      label: 'History',
      icon: Clock,
      description: 'Previous generations',
      disabled: !hasGeneratedContent
    }
  ]
  
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex items-center gap-1 px-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              "px-4 py-3 flex items-center gap-2 border-b-2 transition-all",
              "hover:bg-gray-50",
              activeTab === tab.id
                ? "border-black text-black"
                : "border-transparent text-gray-600 hover:text-gray-900",
              tab.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span className="font-medium text-sm">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}