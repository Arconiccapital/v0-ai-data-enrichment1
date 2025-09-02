"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  FileText, 
  Mail, 
  MessageSquare,
  TrendingUp,
  Users,
  DollarSign,
  Sparkles,
  Search,
  Upload,
  Database,
  ArrowRight
} from "lucide-react"

interface PathOption {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  examples: string[]
  benefits: string[]
  action: string
  route: string
}

export function PathSelector() {
  const router = useRouter()
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)

  const paths: PathOption[] = [
    {
      id: 'output-first',
      title: 'I know what I want to create',
      description: 'Start with your desired output and get the perfect data',
      icon: <Sparkles className="h-8 w-8" />,
      examples: [
        'Sales Dashboard',
        'Email Campaign',
        'Pitch Deck',
        'Social Media Post',
        'Financial Report'
      ],
      benefits: [
        'Get results in minutes',
        'Data perfectly matches output',
        'Guided step-by-step process',
        'See examples and templates'
      ],
      action: 'Choose Output',
      route: '/create/output'
    },
    {
      id: 'data-first',
      title: "I'll start with data",
      description: 'Find or upload data first, then see what you can create',
      icon: <Database className="h-8 w-8" />,
      examples: [
        'Find companies',
        'Research contacts',
        'Upload CSV file',
        'Market research',
        'Build dataset'
      ],
      benefits: [
        'Flexible exploration',
        'Build comprehensive datasets',
        'Discover possibilities',
        'Research real information'
      ],
      action: 'Start with Data',
      route: '/create/data'
    }
  ]

  // Popular output shortcuts
  const popularOutputs = [
    { icon: <BarChart3 className="h-4 w-4" />, name: 'Dashboard', time: '5 min' },
    { icon: <Mail className="h-4 w-4" />, name: 'Email Campaign', time: '10 min' },
    { icon: <FileText className="h-4 w-4" />, name: 'Report', time: '15 min' },
    { icon: <MessageSquare className="h-4 w-4" />, name: 'Social Post', time: '2 min' },
    { icon: <TrendingUp className="h-4 w-4" />, name: 'Pitch Deck', time: '25 min' },
    { icon: <DollarSign className="h-4 w-4" />, name: 'Invoice', time: '5 min' }
  ]

  // Data source options
  const dataOptions = [
    { icon: <Search className="h-4 w-4" />, name: 'Find Data', description: 'Search real information' },
    { icon: <Upload className="h-4 w-4" />, name: 'Upload File', description: 'CSV or Excel' },
    { icon: <Database className="h-4 w-4" />, name: 'Connect', description: 'Link to tools' }
  ]

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Lighthouse AI</h1>
        <p className="text-lg text-muted-foreground">
          Transform your data into anything
        </p>
      </div>

      {/* Main Choice */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-center mb-6">
          What would you like to create today?
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {paths.map((path) => (
            <Card
              key={path.id}
              className={`cursor-pointer transition-all hover:shadow-lg hover:border-primary ${
                hoveredPath === path.id ? 'border-primary shadow-lg' : ''
              }`}
              onMouseEnter={() => setHoveredPath(path.id)}
              onMouseLeave={() => setHoveredPath(null)}
              onClick={() => router.push(path.route)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {path.icon}
                      </div>
                      <CardTitle className="text-lg">{path.title}</CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      {path.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Examples for output path */}
                {path.id === 'output-first' && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Popular outputs:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {popularOutputs.slice(0, 4).map((output, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 bg-muted rounded-md"
                        >
                          {output.icon}
                          <span className="text-sm">{output.name}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {output.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Options for data path */}
                {path.id === 'data-first' && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Start by:</p>
                    <div className="space-y-2">
                      {dataOptions.map((option, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 bg-muted rounded-md"
                        >
                          {option.icon}
                          <div className="flex-1">
                            <span className="text-sm font-medium">{option.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {option.description}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Perfect when you:</p>
                  <ul className="space-y-1">
                    {path.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <Button className="w-full" variant={hoveredPath === path.id ? "default" : "outline"}>
                  {path.action}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Recent</h3>
          <Button variant="ghost" size="sm">
            View all
          </Button>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2">
          <Card className="min-w-[200px] cursor-pointer hover:border-primary">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Sales Dashboard</span>
              </div>
              <p className="text-xs text-muted-foreground">Created 2 hours ago</p>
            </CardContent>
          </Card>
          
          <Card className="min-w-[200px] cursor-pointer hover:border-primary">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Customer Email</span>
              </div>
              <p className="text-xs text-muted-foreground">Created yesterday</p>
            </CardContent>
          </Card>
          
          <Card className="min-w-[200px] cursor-pointer hover:border-primary">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Search className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">VC Firm Data</span>
              </div>
              <p className="text-xs text-muted-foreground">Found 89 results</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}