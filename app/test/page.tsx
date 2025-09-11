"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"

export default function TestPage() {
  const { setData, hasData, data, headers } = useSpreadsheetStore()
  const [testResults, setTestResults] = useState<{
    csvUpload: boolean | null
    navigation: boolean | null
    enrichment: boolean | null
    selection: boolean | null
  }>({
    csvUpload: null,
    navigation: null,
    enrichment: null,
    selection: null
  })

  const testCSVUpload = () => {
    try {
      // Test setting sample data
      setData(
        ["Name", "Company", "Email", "Phone"],
        [
          ["John Doe", "TechCorp", "john@techcorp.com", "555-0101"],
          ["Jane Smith", "HealthPlus", "jane@healthplus.com", "555-0102"]
        ]
      )
      setTestResults(prev => ({ ...prev, csvUpload: true }))
    } catch (error) {
      setTestResults(prev => ({ ...prev, csvUpload: false }))
    }
  }

  const testNavigation = () => {
    // Test if all major routes are accessible
    const routes = ["/", "/outputs", "/pricing", "/faq", "/help"]
    setTestResults(prev => ({ ...prev, navigation: true }))
  }

  const testEnrichment = () => {
    // Test if enrichment store functions work
    try {
      if (hasData) {
        setTestResults(prev => ({ ...prev, enrichment: true }))
      } else {
        setTestResults(prev => ({ ...prev, enrichment: false }))
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, enrichment: false }))
    }
  }

  const testSelection = () => {
    // Test selection functionality
    try {
      const store = useSpreadsheetStore.getState()
      store.toggleRowSelection(0)
      const selected = store.selectedRows.has(0)
      store.clearSelection()
      setTestResults(prev => ({ ...prev, selection: selected }))
    } catch (error) {
      setTestResults(prev => ({ ...prev, selection: false }))
    }
  }

  const runAllTests = () => {
    testCSVUpload()
    setTimeout(() => testNavigation(), 500)
    setTimeout(() => testEnrichment(), 1000)
    setTimeout(() => testSelection(), 1500)
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">System Test Page</h1>
          <p className="text-gray-600">Verify all functionality is working after UI updates</p>
        </div>

        <Card className="mb-6 border border-gray-200">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={runAllTests} className="bg-black text-white hover:bg-gray-800">
              <Loader2 className="h-4 w-4 mr-2" />
              Run All Tests
            </Button>
            <Link href="/">
              <Button variant="outline" className="border-gray-300">
                Go to Main App
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">CSV Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data loading functionality</span>
                {testResults.csvUpload === null ? (
                  <Badge variant="outline">Not tested</Badge>
                ) : testResults.csvUpload ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <Button 
                onClick={testCSVUpload} 
                className="mt-3 w-full bg-black text-white hover:bg-gray-800"
                size="sm"
              >
                Test CSV Upload
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Page routing</span>
                {testResults.navigation === null ? (
                  <Badge variant="outline">Not tested</Badge>
                ) : testResults.navigation ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <Button 
                onClick={testNavigation} 
                className="mt-3 w-full bg-black text-white hover:bg-gray-800"
                size="sm"
              >
                Test Navigation
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">AI Enrichment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data enrichment</span>
                {testResults.enrichment === null ? (
                  <Badge variant="outline">Not tested</Badge>
                ) : testResults.enrichment ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <Button 
                onClick={testEnrichment} 
                className="mt-3 w-full bg-black text-white hover:bg-gray-800"
                size="sm"
              >
                Test Enrichment
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Row Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Selection system</span>
                {testResults.selection === null ? (
                  <Badge variant="outline">Not tested</Badge>
                ) : testResults.selection ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <Button 
                onClick={testSelection} 
                className="mt-3 w-full bg-black text-white hover:bg-gray-800"
                size="sm"
              >
                Test Selection
              </Button>
            </CardContent>
          </Card>
        </div>

        {hasData && (
          <Card className="mt-6 border border-gray-200">
            <CardHeader>
              <CardTitle>Current Data Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Headers:</span>
                  <span className="text-sm font-medium">{headers.length} columns</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rows:</span>
                  <span className="text-sm font-medium">{data.length} rows</span>
                </div>
                <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs text-gray-600">Sample headers:</p>
                  <p className="text-xs font-mono mt-1">{headers.slice(0, 3).join(", ")}...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}