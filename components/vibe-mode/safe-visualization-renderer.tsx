"use client"

import React from 'react'
import { getTemplateComponent } from './visualization-templates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SafeVisualizationRendererProps {
  config: any
  data: any[]
  headers: string[]
}

export function SafeVisualizationRenderer({ config, data, headers }: SafeVisualizationRendererProps) {
  // If no config, show a helpful message
  if (!config) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Visualize
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Ask me to create any visualization you need. I can generate bar charts, line graphs, pie charts, dashboards, and more!
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700">Try:</p>
              <p className="text-xs text-gray-500 mt-1">"Show a bar chart"</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700">Try:</p>
              <p className="text-xs text-gray-500 mt-1">"Create a dashboard"</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700">Try:</p>
              <p className="text-xs text-gray-500 mt-1">"Display KPIs"</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700">Try:</p>
              <p className="text-xs text-gray-500 mt-1">"Show trends over time"</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  try {
    // Get the appropriate template component
    const Component = getTemplateComponent(config.type)
    
    // Render the template with the config
    return (
      <div className="flex-1 overflow-auto p-6">
        <Component 
          data={data} 
          config={config.config || {}} 
          headers={headers} 
        />
      </div>
    )
  } catch (error) {
    console.error('Error rendering visualization:', error)
    
    // Fallback to a simple error display
    return (
      <div className="flex-1 p-8">
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">Visualization Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700">
              There was an issue displaying the visualization. 
              The configuration might be invalid or the data format is unexpected.
            </p>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600">
                Debug Information
              </summary>
              <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto">
                {JSON.stringify({ config, dataRows: data.length, headers }, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      </div>
    )
  }
}