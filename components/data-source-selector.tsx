"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Search,
  Upload,
  Database,
  Link2,
  ArrowLeft,
  ArrowRight,
  FileSpreadsheet,
  Globe,
  Users,
  Building2,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  Loader2
} from "lucide-react"
import { CSVUploader } from "@/components/csv-uploader"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"

interface DataOption {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action: string
}

const dataOptions: DataOption[] = [
  {
    id: 'find',
    title: 'Find Data',
    description: 'Search for real information from the web',
    icon: <Search className="h-6 w-6" />,
    action: 'Search'
  },
  {
    id: 'upload',
    title: 'Upload File',
    description: 'Import your CSV or Excel file',
    icon: <Upload className="h-6 w-6" />,
    action: 'Upload'
  },
  {
    id: 'connect',
    title: 'Connect Source',
    description: 'Link to databases or tools',
    icon: <Database className="h-6 w-6" />,
    action: 'Connect'
  },
  {
    id: 'create',
    title: 'Build Dataset',
    description: 'Create a custom data structure',
    icon: <FileSpreadsheet className="h-6 w-6" />,
    action: 'Create'
  }
]

const popularSearches = [
  { icon: <Building2 className="h-4 w-4" />, text: "SaaS companies in San Francisco" },
  { icon: <Users className="h-4 w-4" />, text: "Marketing agencies with 50+ employees" },
  { icon: <DollarSign className="h-4 w-4" />, text: "Venture capital firms" },
  { icon: <Globe className="h-4 w-4" />, text: "E-commerce businesses" },
  { icon: <Mail className="h-4 w-4" />, text: "Contact information for executives" },
  { icon: <MapPin className="h-4 w-4" />, text: "Real estate properties in Austin" }
]

export function DataSourceSelector() {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const { setData, setHeaders } = useSpreadsheetStore()
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    // Navigate to the main page with the search query
    // The existing search functionality will handle it
    router.push(`/?search=${encodeURIComponent(searchQuery)}`)
  }
  
  const handleFileUploaded = (parsedData: any[]) => {
    if (parsedData.length > 0) {
      const headers = Object.keys(parsedData[0])
      setHeaders(headers)
      setData(parsedData)
      // Navigate to output discovery
      router.push('/create/discover')
    }
  }
  
  const renderOptionContent = () => {
    switch (selectedOption) {
      case 'find':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">What data would you like to find?</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Tech startups in NYC with funding over $10M"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Search
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Popular searches:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {popularSearches.map((search, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      setSearchQuery(search.text)
                      handleSearch()
                    }}
                  >
                    {search.icon}
                    <span className="ml-2">{search.text}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Tips for better results:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Be specific about location, industry, or size</li>
                <li>• Include relevant criteria like funding, employees, or revenue</li>
                <li>• Use clear entity types: companies, people, products, etc.</li>
              </ul>
            </div>
          </div>
        )
        
      case 'upload':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">Upload your data file</h3>
            <CSVUploader />
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Supported formats:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• CSV files (.csv)</li>
                <li>• Excel files (.xlsx, .xls)</li>
                <li>• Tab-delimited files (.tsv)</li>
              </ul>
            </div>
          </div>
        )
        
      case 'connect':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">Connect to your data sources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:border-primary">
                <CardHeader>
                  <CardTitle className="text-base">Google Sheets</CardTitle>
                  <CardDescription>Import from Google Sheets</CardDescription>
                </CardHeader>
              </Card>
              <Card className="cursor-pointer hover:border-primary">
                <CardHeader>
                  <CardTitle className="text-base">Airtable</CardTitle>
                  <CardDescription>Connect to Airtable base</CardDescription>
                </CardHeader>
              </Card>
              <Card className="cursor-pointer hover:border-primary">
                <CardHeader>
                  <CardTitle className="text-base">SQL Database</CardTitle>
                  <CardDescription>Query your database</CardDescription>
                </CardHeader>
              </Card>
              <Card className="cursor-pointer hover:border-primary">
                <CardHeader>
                  <CardTitle className="text-base">API</CardTitle>
                  <CardDescription>Connect via REST API</CardDescription>
                </CardHeader>
              </Card>
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Coming soon - these integrations will be available shortly
            </p>
          </div>
        )
        
      case 'create':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">Build a custom dataset</h3>
            <Textarea
              placeholder="Describe the data structure you want to create. For example: 'Create a list of 20 potential customers with company name, contact email, industry, and company size'"
              className="min-h-[100px]"
            />
            <Button className="w-full">
              Generate Dataset
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Examples:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Product catalog with prices and descriptions</li>
                <li>• Employee directory with roles and departments</li>
                <li>• Event schedule with dates and locations</li>
              </ul>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Start with your data</h1>
        <p className="text-lg text-muted-foreground">
          Find or upload data first, then we'll show you what amazing things you can create
        </p>
      </div>
      
      {/* If no option selected, show all options */}
      {!selectedOption ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dataOptions.map(option => (
            <Card
              key={option.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
              onClick={() => setSelectedOption(option.id)}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            {renderOptionContent()}
          </CardContent>
        </Card>
      )}
      
      {/* Recent Data Sources */}
      <div className="mt-12 pt-8 border-t">
        <h3 className="text-lg font-semibold mb-4">Recent data sources</h3>
        <div className="space-y-2">
          <Card className="cursor-pointer hover:border-primary">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">company_list_2024.csv</p>
                    <p className="text-xs text-muted-foreground">1,250 rows • Uploaded 2 hours ago</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Use this
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:border-primary">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">VC firms in Silicon Valley</p>
                    <p className="text-xs text-muted-foreground">89 results • Found yesterday</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Use this
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}