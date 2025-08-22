"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Mail, Presentation, Download, Send, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function OutputsPage() {
  const router = useRouter()
  const [selectedData, setSelectedData] = useState<{ headers: string[]; rows: string[][] } | null>(null)
  const [activeTab, setActiveTab] = useState("presentation")

  useEffect(() => {
    // Load selected data from session storage
    const storedData = sessionStorage.getItem('selectedData')
    if (storedData) {
      setSelectedData(JSON.parse(storedData))
    } else {
      // If no data, redirect back to main page
      router.push('/')
    }
  }, [router])

  if (!selectedData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No data selected</h2>
          <p className="text-gray-600 mb-4">Please select data from the spreadsheet first</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Spreadsheet
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Generate Output</h1>
              <Badge variant="secondary">
                {selectedData.rows.length} rows × {selectedData.headers.length} columns selected
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Data Preview */}
          <div className="col-span-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Selected Data Preview</CardTitle>
                <CardDescription>
                  Review your selected data before generating output
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Columns:</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedData.headers.map((header, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {header}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Sample Data:</h4>
                    <div className="bg-gray-50 rounded-lg p-3 max-h-96 overflow-auto">
                      <table className="text-xs w-full">
                        <thead>
                          <tr className="border-b">
                            {selectedData.headers.map((header, idx) => (
                              <th key={idx} className="text-left p-1 font-medium">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedData.rows.slice(0, 5).map((row, rowIdx) => (
                            <tr key={rowIdx} className="border-b">
                              {row.map((cell, cellIdx) => (
                                <td key={cellIdx} className="p-1 truncate max-w-[100px]">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {selectedData.rows.length > 5 && (
                        <p className="text-center text-gray-500 mt-2">
                          ... and {selectedData.rows.length - 5} more rows
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output Generation */}
          <div className="col-span-8">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Output Generation</CardTitle>
                <CardDescription>
                  Choose how you want to use your selected data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="presentation">
                      <Presentation className="h-4 w-4 mr-2" />
                      Presentation
                    </TabsTrigger>
                    <TabsTrigger value="report">
                      <FileText className="h-4 w-4 mr-2" />
                      Report
                    </TabsTrigger>
                    <TabsTrigger value="email">
                      <Mail className="h-4 w-4 mr-2" />
                      Bulk Email
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="presentation" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Generate Presentation</h3>
                      <p className="text-sm text-gray-600">
                        Create a professional presentation from your data with charts and insights.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="cursor-pointer hover:border-blue-500 transition-colors">
                          <CardHeader>
                            <CardTitle className="text-sm">Pitch Deck</CardTitle>
                            <CardDescription className="text-xs">
                              Professional slides for investors
                            </CardDescription>
                          </CardHeader>
                        </Card>
                        <Card className="cursor-pointer hover:border-blue-500 transition-colors">
                          <CardHeader>
                            <CardTitle className="text-sm">Data Summary</CardTitle>
                            <CardDescription className="text-xs">
                              Visual data overview with charts
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview Slides
                        </Button>
                        <Button variant="default" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Generate PowerPoint
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="report" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Generate Report</h3>
                      <p className="text-sm text-gray-600">
                        Create detailed reports with analysis and insights from your data.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="cursor-pointer hover:border-blue-500 transition-colors">
                          <CardHeader>
                            <CardTitle className="text-sm">Executive Summary</CardTitle>
                            <CardDescription className="text-xs">
                              High-level overview with key metrics
                            </CardDescription>
                          </CardHeader>
                        </Card>
                        <Card className="cursor-pointer hover:border-blue-500 transition-colors">
                          <CardHeader>
                            <CardTitle className="text-sm">Detailed Analysis</CardTitle>
                            <CardDescription className="text-xs">
                              In-depth analysis with all data points
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview Report
                        </Button>
                        <Button variant="default" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Generate PDF
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="email" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Send Bulk Email</h3>
                      <p className="text-sm text-gray-600">
                        Create personalized emails for each row in your selected data.
                      </p>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Email Column</label>
                          <select className="w-full mt-1 p-2 border rounded-md">
                            <option>Select column containing email addresses...</option>
                            {selectedData.headers.map((header, idx) => (
                              <option key={idx} value={header}>{header}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Email Template</label>
                          <textarea 
                            className="w-full mt-1 p-2 border rounded-md h-32"
                            placeholder="Hi {Name},&#10;&#10;Your company {Company} has been selected...&#10;&#10;Use {ColumnName} to insert data from columns."
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview Emails
                        </Button>
                        <Button variant="default" className="flex-1">
                          <Send className="h-4 w-4 mr-2" />
                          Send Test Email
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}