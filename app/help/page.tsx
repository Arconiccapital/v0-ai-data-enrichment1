"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileSpreadsheet,
  Upload,
  Sparkles,
  Download,
  Users,
  Settings,
  BookOpen,
  Video,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"

const helpSections = [
  {
    title: "Getting Started",
    description: "Learn the basics of Lighthouse AI",
    icon: BookOpen,
    articles: [
      { title: "Quick Start Guide", description: "Get up and running in 5 minutes", badge: "Popular" },
      { title: "Uploading Your First CSV", description: "Step-by-step guide to importing data" },
      { title: "Understanding AI Enrichment", description: "How our AI enhances your data" },
      { title: "Exporting Your Results", description: "Download your enriched data" },
    ],
  },
  {
    title: "Data Enrichment",
    description: "Master AI-powered data enhancement",
    icon: Sparkles,
    articles: [
      { title: "Setting Up Enrichment Rules", description: "Configure AI prompts for your data", badge: "New" },
      { title: "Best Practices for Prompts", description: "Write effective enrichment instructions" },
      { title: "Handling Large Datasets", description: "Tips for processing big files efficiently" },
      { title: "Quality Control & Validation", description: "Ensure accuracy in your enriched data" },
    ],
  },
  {
    title: "Account Management",
    description: "Manage your account and billing",
    icon: Settings,
    articles: [
      { title: "Account Settings", description: "Update your profile and preferences" },
      { title: "Billing & Subscriptions", description: "Manage your plan and payments" },
      { title: "Team Management", description: "Add and manage team members" },
      { title: "API Keys & Integration", description: "Connect with external tools" },
    ],
  },
  {
    title: "Collaboration",
    description: "Work with your team effectively",
    icon: Users,
    articles: [
      { title: "Sharing Spreadsheets", description: "Collaborate on data projects" },
      { title: "Permission Management", description: "Control access to your data" },
      { title: "Comments & Feedback", description: "Communicate within your projects" },
      { title: "Version History", description: "Track changes and restore previous versions" },
    ],
  },
]

export default function HelpPage() {
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
              <Link href="/faq">
                <Button variant="ghost" size="sm" className="font-sans">
                  FAQ
                </Button>
              </Link>
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
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <main className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="font-sans text-5xl font-bold leading-tight tracking-tight text-foreground mb-6">
              Help Center
            </h1>
            <p className="font-sans text-xl leading-relaxed text-muted-foreground mb-8">
              Everything you need to know about using Lighthouse AI
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Upload className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-sans font-semibold text-foreground mb-2">Upload Data</h3>
                <p className="text-sm text-muted-foreground font-sans">Learn how to import your CSV files</p>
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-sans font-semibold text-foreground mb-2">AI Enrichment</h3>
                <p className="text-sm text-muted-foreground font-sans">Master data enhancement techniques</p>
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Download className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-sans font-semibold text-foreground mb-2">Export Results</h3>
                <p className="text-sm text-muted-foreground font-sans">Download your enriched data</p>
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-sans font-semibold text-foreground mb-2">Team Setup</h3>
                <p className="text-sm text-muted-foreground font-sans">Collaborate with your team</p>
              </CardContent>
            </Card>
          </div>

          {/* Help Sections */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {helpSections.map((section, index) => (
              <Card key={index} className="border-border shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <section.icon className="h-6 w-6 text-primary" />
                    <CardTitle className="font-sans text-xl font-semibold text-foreground">{section.title}</CardTitle>
                  </div>
                  <CardDescription className="text-muted-foreground font-sans">{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {section.articles.map((article, articleIndex) => (
                      <div
                        key={articleIndex}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-sans font-medium text-foreground">{article.title}</h4>
                            {article.badge && (
                              <Badge variant="secondary" className="text-xs font-sans">
                                {article.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground font-sans">{article.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Video Tutorials */}
          <Card className="border-border shadow-sm mb-16">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Video className="h-6 w-6 text-primary" />
                <CardTitle className="font-sans text-xl font-semibold text-foreground">Video Tutorials</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground font-sans">
                Watch step-by-step video guides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-muted rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Video className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h4 className="font-sans font-semibold text-foreground mb-2">Getting Started</h4>
                  <p className="text-sm text-muted-foreground font-sans mb-4">5 min tutorial</p>
                  <Button variant="outline" size="sm" className="font-sans bg-transparent">
                    Watch Now
                  </Button>
                </div>
                <div className="bg-muted rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Video className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h4 className="font-sans font-semibold text-foreground mb-2">AI Enrichment</h4>
                  <p className="text-sm text-muted-foreground font-sans mb-4">8 min tutorial</p>
                  <Button variant="outline" size="sm" className="font-sans bg-transparent">
                    Watch Now
                  </Button>
                </div>
                <div className="bg-muted rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Video className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h4 className="font-sans font-semibold text-foreground mb-2">Team Collaboration</h4>
                  <p className="text-sm text-muted-foreground font-sans mb-4">6 min tutorial</p>
                  <Button variant="outline" size="sm" className="font-sans bg-transparent">
                    Watch Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <div className="text-center p-12 bg-muted rounded-lg">
            <h2 className="font-sans text-3xl font-bold text-foreground mb-4">Need more help?</h2>
            <p className="font-sans text-xl text-muted-foreground mb-8">
              Our support team is ready to assist you with any questions.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="bg-primary hover:bg-primary/90 font-sans shadow-sm">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact Support
                </Button>
              </Link>
              <Link href="/faq">
                <Button
                  variant="outline"
                  size="lg"
                  className="font-sans border-border hover:bg-background bg-transparent"
                >
                  View FAQ
                </Button>
              </Link>
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  )
}
