"use client"

import React, { useEffect, useState } from 'react'
import * as Recharts from 'recharts'
import * as LucideIcons from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import * as Babel from '@babel/standalone'

interface DynamicComponentRendererProps {
  code: string
  data: any[]
  headers: string[]
}

export function DynamicComponentRenderer({ code, data, headers }: DynamicComponentRendererProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Validate code before transformation
      if (!code || !code.includes('function GeneratedVisualization')) {
        throw new Error('Invalid component code received. The code must contain a GeneratedVisualization function.')
      }
      
      // Transform JSX to JavaScript using Babel
      const transformedCode = Babel.transform(code, {
        presets: ['react'],
        filename: 'component.jsx'
      }).code

      // Create a sandbox context with all the imports available
      const sandboxContext = {
        React,
        ...Recharts,
        ...LucideIcons,
        Card,
        CardContent,
        CardHeader,
        CardTitle,
        CardDescription,
        Badge,
        // Add any other commonly used utilities
        useState: React.useState,
        useEffect: React.useEffect,
        useMemo: React.useMemo,
        useCallback: React.useCallback,
      }

      // Create the function string that will return the component
      const functionString = `
        return (function(${Object.keys(sandboxContext).join(', ')}) {
          ${transformedCode}
          return GeneratedVisualization;
        })(${Object.keys(sandboxContext).map(key => 'sandboxContext.' + key).join(', ')})
      `

      // Create the component function
      const createComponent = new Function('sandboxContext', functionString)
      const GeneratedComponent = createComponent(sandboxContext)

      setComponent(() => GeneratedComponent)
      setError(null)
    } catch (err) {
      console.error('Failed to render dynamic component:', err)
      setError(err instanceof Error ? err.message : 'Failed to render component')
    }
  }, [code])

  if (error) {
    return (
      <div className="flex-1 p-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Component Rendering Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                View Generated Code
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded-lg overflow-auto text-xs">
                <code>{code}</code>
              </pre>
            </details>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!Component) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Rendering component...</p>
        </div>
      </div>
    )
  }

  // Render the dynamically created component
  return (
    <div className="flex-1 overflow-auto">
      <Component data={data} headers={headers} />
    </div>
  )
}