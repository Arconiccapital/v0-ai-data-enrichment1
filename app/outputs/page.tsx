"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, FileText, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ReportGenerator } from "@/components/report-generator"
import { EmailComposer } from "@/components/email-composer"

export default function OutputsPage() {
  const router = useRouter()
  const [selectedData, setSelectedData] = useState<{ headers: string[]; rows: string[][] } | null>(null)
  const [activeTab, setActiveTab] = useState("report")

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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Minimal Header */}
      <div className="bg-white border-b px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-200" />
            <h1 className="text-lg font-semibold">Generate Output</h1>
            <div className="text-sm text-gray-500">
              {selectedData.rows.length} rows selected
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Side by Side */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Data Table (50%) */}
        <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h2 className="text-sm font-medium text-gray-700">Selected Data</h2>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 border-b">
                <tr>
                  {selectedData.headers.map((header, idx) => (
                    <th key={idx} className="text-left px-4 py-2 font-medium text-gray-700 whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedData.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b hover:bg-gray-50">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-2 text-gray-900">
                        {cell || <span className="text-gray-400">-</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side - Generation UI (50%) */}
        <div className="w-1/2 bg-white flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-4 grid w-auto grid-cols-2 self-start">
              <TabsTrigger value="report" className="px-6">
                <FileText className="h-4 w-4 mr-2" />
                Report
              </TabsTrigger>
              <TabsTrigger value="email" className="px-6">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="report" className="flex-1 px-4 pb-4 overflow-auto">
              <ReportGenerator selectedData={selectedData} />
            </TabsContent>

            <TabsContent value="email" className="flex-1 px-4 pb-4 overflow-auto">
              <EmailComposer selectedData={selectedData} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}