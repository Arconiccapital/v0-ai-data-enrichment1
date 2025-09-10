"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { BaseCardProps } from '@/lib/dashboard-types'

export function BaseCard({ 
  children, 
  className, 
  onClick, 
  isSelected = false,
  isExpanded = false,
  variant = 'default'
}: BaseCardProps) {
  const variants = {
    default: 'bg-white shadow-md',
    outlined: 'bg-white border-2 border-gray-200',
    elevated: 'bg-white shadow-lg',
    flat: 'bg-gray-50'
  }

  return (
    <div 
      className={cn(
        'rounded-lg transition-all duration-200',
        variants[variant],
        isSelected && 'ring-2 ring-blue-500 bg-blue-50',
        onClick && 'cursor-pointer hover:shadow-lg hover:scale-[1.02]',
        isExpanded && 'col-span-2 row-span-2',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}