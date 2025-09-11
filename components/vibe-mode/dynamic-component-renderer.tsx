"use client"

import React, { useEffect, useState } from 'react'
import * as Recharts from 'recharts'
import * as LucideIcons from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import * as Babel from '@babel/standalone'
import { ErrorBoundary } from './error-boundary'

interface DynamicComponentRendererProps {
  code: string
  data: any[]
  headers: string[]
  onError?: (message: string) => void
}

// Fallback component that ALWAYS works
function SafeFallbackComponent({ data, headers }: { data: any[], headers: string[] }) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Visualization</CardTitle>
          <CardDescription>Displaying {data.length} rows with {headers.length} columns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Simple stats */}
            <div className="grid grid-cols-3 gap-4">
              {headers.slice(0, 3).map((header, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{data[0]?.[header] || 'N/A'}</div>
                    <p className="text-xs text-muted-foreground">{header}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Data table */}
            <div className="overflow-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    {headers.map((h, i) => (
                      <th key={i} className="px-4 py-2 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 10).map((row, i) => (
                    <tr key={i}>
                      {headers.map((h, j) => (
                        <td key={j} className="px-4 py-2 border-t">{row[h]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function DynamicComponentRenderer({ code, data, headers, onError }: DynamicComponentRendererProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [useFallback, setUseFallback] = useState(false)
  
  // Convert data to objects with header keys for the component
  // MUST be called unconditionally to maintain hook order
  const processedData = React.useMemo(() => {
    return data.map(row => {
      const obj: any = {}
      headers.forEach((header, index) => {
        obj[header] = row[index]
      })
      return obj
    })
  }, [data, headers])

  useEffect(() => {
    try {
      // Validate code before transformation
      if (!code || !code.includes('function GeneratedVisualization')) {
        throw new Error('Invalid component code received. The code must contain a GeneratedVisualization function.')
      }
      
      console.log('🔍 Rendering component with code length:', code.length)
      console.log('🔍 Code preview:', code.substring(0, 200))

      // Security: block obviously unsafe patterns (no window/document/eval/require/import/fetch)
      const forbiddenPatterns = [
        /\bwindow\b/,
        /\bdocument\b/,
        /\beval\s*\(/,
        /new\s+Function\s*\(/,
        /\bimport\b/,
        /\brequire\b/,
        /\bfetch\s*\(/,
        /<script/i
      ]
      if (forbiddenPatterns.some((re) => re.test(code))) {
        throw new Error('Blocked potentially unsafe code. Please try a different request.')
      }

      // Light JSX sanitizer to reduce common LLM mistakes
      const sanitizeJSX = (src: string) => {
        let out = src
        // Collapse duplicate closing tags for common Recharts elements
        const tags = ['Tooltip', 'Legend', 'XAxis', 'YAxis', 'CartesianGrid', 'Bar', 'Line', 'Area', 'Pie']
        tags.forEach(tag => {
          const dupClose = new RegExp(`(?:</${tag}>){2,}`, 'g')
          out = out.replace(dupClose, `</${tag}>`)
        })
        // Balance container tags: ensure at most one closing per opening
        const containers = ['BarChart', 'LineChart', 'AreaChart', 'PieChart', 'ScatterChart', 'ComposedChart', 'ResponsiveContainer']
        containers.forEach(tag => {
          const openCount = (out.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length
          let closeCount = (out.match(new RegExp(`</${tag}>`, 'g')) || []).length
          while (closeCount > openCount) {
            // remove the last extra closing tag
            const idx = out.lastIndexOf(`</${tag}>`)
            if (idx >= 0) {
              out = out.slice(0, idx) + out.slice(idx + (`</${tag}>`).length)
              closeCount--
            } else {
              break
            }
          }
        })
        return out
      }
      const safeCode = sanitizeJSX(code)

      // Transform JSX to JavaScript using Babel
      let transformedCode: string
      try {
        transformedCode = Babel.transform(safeCode, {
          presets: ['react'],
          filename: 'component.jsx'
        }).code
      } catch (babelError) {
        console.warn('❌ Babel transformation failed; using fallback.', babelError)
        onError?.('babel')
        setUseFallback(true)
        setError('JSX syntax error - using fallback visualization')
        return
      }

      // Create a sandbox context with all the imports available
      const sandboxContext = {
        React,
        ...Recharts,
        ...LucideIcons,
        Lucide: LucideIcons, // Add Lucide namespace for generated code
        Card,
        CardContent,
        CardHeader,
        CardTitle,
        CardDescription,
        Badge,
        // Add color palette for charts
        COLORS: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
        // Add any other commonly used utilities
        useState: React.useState,
        useEffect: React.useEffect,
        useMemo: React.useMemo,
        useCallback: React.useCallback,
      }

      // Log available Recharts components for debugging
      // console.debug('📊 Available Recharts:', Object.keys(Recharts).filter(k => k[0] === k[0].toUpperCase()).join(', '))

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
      setUseFallback(false)
      console.log('✅ Component created successfully')
    } catch (err) {
      console.warn('❌ Failed to render dynamic component; switching to fallback.', err)
      onError?.('runtime')
      setError(err instanceof Error ? err.message : 'Failed to render component')
      setUseFallback(true)
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

  // Use fallback if needed
  if (useFallback) {
    return (
      <div className="flex-1 overflow-auto">
        <SafeFallbackComponent data={processedData} headers={headers} />
      </div>
    )
  }

  // Render the dynamically created component with error boundary
  try {
    return (
      <div className="flex-1 overflow-auto">
        <ErrorBoundary>
          <div className="w-full h-full">
            <Component data={processedData} headers={headers} />
          </div>
        </ErrorBoundary>
      </div>
    )
  } catch (renderError) {
    console.warn('Runtime error in generated component:', renderError)
    onError?.('render')
    return (
      <div className="flex-1 p-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Runtime Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">
              {renderError instanceof Error ? renderError.message : 'Failed to render component'}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              This usually happens when chart components are used incorrectly. Try rephrasing your request.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
}
