"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  FileSpreadsheet,
  Home,
  FileText,
  Mail,
  Share2,
  Users,
  Plus,
  Search,
  Download,
  MoreHorizontal,
  Sparkles,
} from "lucide-react"
import { CSVUploader } from "@/components/csv-uploader"
import { SpreadsheetView } from "@/components/spreadsheet-view"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import Link from "next/link"

export default function HomePage() {
  const { data, headers, hasData, clearData } = useSpreadsheetStore()

  const handleExport = () => {
    const csvContent = [
      headers.join(","),
      ...data.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "exported-data.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = () => {
    alert("Share functionality coming soon! You can export the CSV and share it manually.")
  }

  return (
    <div className="min-h-screen bg-background">
      {hasData ? (
        <div className="flex h-screen">
          {/* Left Sidebar */}
          <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col shadow-sm">
            {/* Logo/Brand */}
            <div className="p-4 border-b border-sidebar-border">
              <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                  <FileSpreadsheet className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-sans font-semibold text-sidebar-foreground text-lg">AI DataEnrich</span>
              </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 p-4">
              <div className="space-y-1">
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-sans rounded-md"
                  >
                    <Home className="h-4 w-4 mr-3" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-sans rounded-md"
                >
                  <FileText className="h-4 w-4 mr-3" />
                  Templates
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-sans rounded-md"
                >
                  <Mail className="h-4 w-4 mr-3" />
                  Email
                </Button>
              </div>

              {/* Shared Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground font-sans uppercase tracking-wide">
                    Shared
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-sidebar-accent rounded-md">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-sans rounded-md"
                  >
                    <Share2 className="h-4 w-4 mr-3" />
                    Shared with me
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-sans rounded-md"
                  >
                    <Users className="h-4 w-4 mr-3" />
                    Public sheets
                  </Button>
                </div>
              </div>

              {/* Private Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground font-sans uppercase tracking-wide">
                    Private
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-sidebar-accent rounded-md">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <Button
                    variant="default"
                    className="w-full justify-start bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/80 border-0 font-sans rounded-md shadow-sm"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-3" />
                    Company Data
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-sans rounded-md"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-3" />
                    Copy of Company
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-sans rounded-md"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-3" />
                    Copy of Company
                  </Button>
                </div>
              </div>

              {/* Team Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground font-sans uppercase tracking-wide">
                    Team
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-sidebar-accent rounded-md">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col bg-background">
            {/* Top Toolbar */}
            <div className="bg-card border-b border-border px-6 py-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans shadow-sm"
                      onClick={() => {
                        clearData()
                        window.location.reload()
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New sheet
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-sans border-border hover:bg-muted bg-transparent"
                      onClick={handleExport}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-sans border-border hover:bg-muted bg-transparent"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-sans shadow-sm"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Enrich
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="font-sans border-border hover:bg-muted bg-transparent"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" className="font-sans border-border hover:bg-muted bg-transparent">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Sheet Header */}
            <div className="bg-card border-b border-border px-6 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Input
                    value="100m-Aussie-Companies-Default-view-export-1753009923726 (1)"
                    className="text-lg font-medium border-0 p-0 h-auto bg-transparent focus-visible:ring-0 text-foreground"
                    readOnly
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Select cell</span>
                  <div className="flex items-center gap-1">
                    <Search className="h-4 w-4" />
                    <MoreHorizontal className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Spreadsheet Content */}
            <div className="flex-1 bg-background">
              <SpreadsheetView />
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                    <FileSpreadsheet className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h1 className="text-2xl font-sans font-semibold text-foreground">AI DataEnrich</h1>
                </Link>
                <div className="flex items-center gap-3">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm" className="font-sans">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm" className="bg-primary hover:bg-primary/90 font-sans shadow-sm">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="ghost" size="sm" className="font-sans">
                      Pricing
                    </Button>
                  </Link>
                  <Link href="/faq">
                    <Button variant="ghost" size="sm" className="font-sans">
                      FAQ
                    </Button>
                  </Link>
                  <Link href="/help">
                    <Button variant="ghost" size="sm" className="font-sans">
                      Help
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="ghost" size="sm" className="font-sans">
                      Contact
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </header>

          <main className="py-24 px-6">
            <div className="container mx-auto max-w-4xl text-center">
              <h1 className="font-sans text-5xl font-bold leading-tight tracking-tight text-foreground mb-6">
                A workspace to transform
                <br />
                <span className="text-foreground">your data</span>
              </h1>
              <p className="font-sans text-xl leading-relaxed text-muted-foreground mb-12 max-w-3xl mx-auto">
                Upload data from any source and watch it instantly integrate into your workspace with AI-powered
                enrichment.
              </p>

              <Card className="max-w-2xl mx-auto shadow-sm border-border bg-card">
                <CardContent className="p-8">
                  <CSVUploader />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      )}
    </div>
  )
}
