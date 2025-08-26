"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileSpreadsheet, Plus, Upload, Users, Settings, Search, MoreHorizontal, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"

const recentProjects = [
  {
    id: 1,
    name: "Company Database Q1",
    rows: 2500,
    enriched: 2100,
    lastModified: "2 hours ago",
    status: "completed",
    collaborators: 3,
  },
  {
    id: 2,
    name: "Lead Generation List",
    rows: 1200,
    enriched: 800,
    lastModified: "1 day ago",
    status: "in-progress",
    collaborators: 1,
  },
  {
    id: 3,
    name: "Customer Analysis",
    rows: 850,
    enriched: 850,
    lastModified: "3 days ago",
    status: "completed",
    collaborators: 2,
  },
  {
    id: 4,
    name: "Market Research Data",
    rows: 3200,
    enriched: 0,
    lastModified: "1 week ago",
    status: "draft",
    collaborators: 1,
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const { setData } = useSpreadsheetStore()

  const handleOpenProject = (projectId: number) => {
    // Load sample data based on project
    const sampleData = {
      1: {
        headers: ["Company Name", "Industry", "Location", "Website"],
        data: [
          ["TechCorp", "Technology", "San Francisco", ""],
          ["HealthPlus", "Healthcare", "New York", ""],
          ["FinanceHub", "Finance", "London", ""],
          ["EduLearn", "Education", "Boston", ""],
          ["RetailMax", "Retail", "Chicago", ""]
        ]
      },
      2: {
        headers: ["Lead Name", "Company", "Email", "Phone"],
        data: [
          ["John Smith", "ABC Corp", "", ""],
          ["Jane Doe", "XYZ Inc", "", ""],
          ["Bob Johnson", "123 Ltd", "", ""],
          ["Alice Brown", "Tech Solutions", "", ""]
        ]
      },
      3: {
        headers: ["Customer ID", "Name", "Purchase Date", "Category"],
        data: [
          ["C001", "Acme Corp", "2024-01-15", "Enterprise"],
          ["C002", "Beta Inc", "2024-01-20", "SMB"],
          ["C003", "Gamma LLC", "2024-02-01", "Startup"]
        ]
      },
      4: {
        headers: ["Company", "Market Cap", "Sector", "Region"],
        data: [
          ["Apple", "", "Technology", "North America"],
          ["Samsung", "", "Technology", "Asia"],
          ["Toyota", "", "Automotive", "Asia"],
          ["Nestle", "", "Consumer Goods", "Europe"]
        ]
      }
    }

    const projectData = sampleData[projectId] || sampleData[1]
    setData(projectData.headers, projectData.data)
    router.push("/")
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <FileSpreadsheet className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-sans font-semibold text-foreground">Lighthouse AI</h1>
            </Link>
            <div className="flex items-center gap-3">
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
              <Button variant="ghost" size="sm" className="font-sans">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Link href="/settings">
                <Button variant="ghost" size="sm" className="font-sans">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback className="font-sans">JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-sans text-4xl font-black text-black mb-2">Your Projects</h1>
          <p className="text-gray-600 font-sans text-lg">Manage and enrich your data projects with AI power.</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button className="bg-black text-white hover:bg-gray-800 border-0 font-sans">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400 font-sans">
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </Button>
            </Link>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6">
          {recentProjects.map((project) => (
            <Card key={project.id} className="bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-md">
                      <FileSpreadsheet className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-gray-800 text-lg">{project.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 font-sans mt-1">
                        <span>
                          {project.enriched}/{project.rows} rows enriched
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {project.lastModified}
                        </span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {project.collaborators} collaborators
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        project.status === "completed"
                          ? "default"
                          : project.status === "in-progress"
                            ? "secondary"
                            : "outline"
                      }
                      className="font-sans"
                    >
                      {project.status}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="font-sans bg-transparent"
                      onClick={() => handleOpenProject(project.id)}
                    >
                      Open
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State for New Users */}
        {recentProjects.length === 0 && (
          <Card className="border-border shadow-sm">
            <CardContent className="p-12 text-center">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-sans font-semibold text-foreground mb-2">No projects yet</h3>
              <p className="text-muted-foreground font-sans mb-6">
                Get started by uploading your first CSV file or creating a new project.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link href="/">
                  <Button className="bg-primary hover:bg-primary/90 font-sans">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload CSV
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="font-sans bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
        </main>
      </div>
    </div>
  )
}
