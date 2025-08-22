"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileSpreadsheet, Plus, Upload, Users, Settings, Search, MoreHorizontal, Clock } from "lucide-react"
import Link from "next/link"

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
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <FileSpreadsheet className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-sans font-semibold text-foreground">AI DataEnrich</h1>
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

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-sans text-3xl font-bold text-foreground mb-2">Your Projects</h1>
          <p className="text-muted-foreground font-sans">Manage and enrich your data projects.</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button className="bg-primary hover:bg-primary/90 font-sans">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
            <Button variant="outline" className="font-sans bg-transparent">
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6">
          {recentProjects.map((project) => (
            <Card key={project.id} className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileSpreadsheet className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-sans font-semibold text-foreground text-lg">{project.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground font-sans mt-1">
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
                    <Button variant="outline" size="sm" className="font-sans bg-transparent">
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
                <Button className="bg-primary hover:bg-primary/90 font-sans">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV
                </Button>
                <Button variant="outline" className="font-sans bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
