"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component error:', error, errorInfo)
    // Reset to show fallback
    this.setState({ hasError: true, error })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 p-8">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Visualization Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-700 mb-4">
                {this.state.error?.message || 'The generated visualization encountered an error'}
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Common issues:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>Chart components used outside their parent containers</li>
                  <li>Invalid data format for the selected chart type</li>
                  <li>Missing required properties</li>
                </ul>
                <p className="mt-4">Try rephrasing your request or asking for a simpler visualization.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}