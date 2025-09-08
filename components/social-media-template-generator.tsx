"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ColumnMapper } from "@/components/column-mapper"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { 
  ArrowLeft,
  FileText,
  Sparkles,
  Download,
  Copy,
  Share2,
  MessageCircle,
  Hash,
  Image as ImageIcon,
  Users,
  TrendingUp,
  Calendar,
  MapPin,
  Link2
} from "lucide-react"
import { toast } from "sonner"

interface SocialMediaTemplateGeneratorProps {
  templateId: string
}

// Define social media templates with flexible field requirements
const socialMediaTemplates = {
  'social_media_post': {
    id: 'social_media_post',
    name: 'Social Media Campaign',
    icon: '📱',
    description: 'Generate platform-optimized social media content',
    requiredFields: [
      { key: 'topic', label: 'Topic/Subject', type: 'text' as const, description: 'Main topic or product name' },
      { key: 'audience', label: 'Target Audience', type: 'category' as const, description: 'Who you\'re targeting' },
      { key: 'metric', label: 'Key Metric', type: 'numeric' as const, description: 'Performance data to highlight' }
    ],
    optionalFields: [
      { key: 'date', label: 'Campaign Date', type: 'date' as const, description: 'When to post' },
      { key: 'location', label: 'Location', type: 'text' as const, description: 'Geographic focus' },
      { key: 'link', label: 'URL', type: 'text' as const, description: 'Link to include' }
    ],
    platforms: ['LinkedIn', 'Instagram', 'Twitter', 'Facebook']
  },
  'content_calendar': {
    id: 'content_calendar',
    name: 'Content Calendar',
    icon: '📅',
    description: 'Plan and schedule your social media content',
    requiredFields: [
      { key: 'title', label: 'Content Title', type: 'text' as const, description: 'Post title or topic' },
      { key: 'date', label: 'Publish Date', type: 'date' as const, description: 'When to publish' },
      { key: 'platform', label: 'Platform', type: 'category' as const, description: 'Social media platform' }
    ],
    optionalFields: [
      { key: 'engagement', label: 'Engagement Goal', type: 'numeric' as const, description: 'Target engagement' },
      { key: 'hashtags', label: 'Hashtags', type: 'text' as const, description: 'Relevant hashtags' }
    ],
    platforms: ['All Platforms']
  }
}

export function SocialMediaTemplateGenerator({ templateId }: SocialMediaTemplateGeneratorProps) {
  const router = useRouter()
  const { hasData, data, headers } = useSpreadsheetStore()
  const [showMapper, setShowMapper] = useState(!hasData)
  const [mappedData, setMappedData] = useState<any>(null)
  const [selectedPlatform, setSelectedPlatform] = useState('LinkedIn')
  
  // Get template based on templateId
  const template = socialMediaTemplates[templateId as keyof typeof socialMediaTemplates] || socialMediaTemplates['social_media_post']
  
  const handleMappingComplete = async (mappings: Record<string, string>) => {
    if (!hasData) {
      // User needs to provide data
      toast.info('Now let\'s get your data! You can upload a CSV or search for data.')
      router.push('/create/data')
      return
    }
    
    // Process the mapped data
    const processedData = data.map(row => {
      const mappedRow: any = {}
      Object.entries(mappings).forEach(([field, column]) => {
        const colIndex = headers.indexOf(column)
        if (colIndex !== -1) {
          mappedRow[field] = row[colIndex]
        }
      })
      return mappedRow
    })
    
    setMappedData(processedData)
    setShowMapper(false)
    
    // Generate content based on mapped data
    generateContent(processedData, mappings)
  }
  
  const generateContent = async (processedData: any[], mappings: Record<string, string>) => {
    // Here we would call an API to generate content
    // For now, we'll show mock generated content
    toast.success('Content generated successfully!')
  }
  
  // Mock generated content for demo
  const mockContent = {
    LinkedIn: {
      post: `🚀 Exciting insights from our latest data analysis!

After reviewing ${mappedData?.length || 100}+ data points, we've discovered some game-changing trends in ${mappedData?.[0]?.topic || 'the industry'}.

Key findings:
• ${mappedData?.[0]?.metric || '73%'} improvement in performance metrics
• Strong engagement from ${mappedData?.[0]?.audience || 'our target audience'}
• Consistent growth across all segments

What strategies are working for you? Share your thoughts below! 👇

#DataDriven #Innovation #BusinessGrowth`,
      stats: { likes: 127, comments: 34, shares: 18 }
    },
    Instagram: {
      post: `✨ Transform your strategy with data-driven insights! 

We analyzed ${mappedData?.length || 100}+ data points and the results are incredible 📊

Swipe to see how ${mappedData?.[0]?.topic || 'innovation'} is reshaping the landscape →

Drop a 💡 if you're ready to level up your game!

#DataAnalytics #GrowthHacking #TechTrends #Innovation`,
      stats: { likes: 2341, comments: 89 }
    },
    Twitter: {
      post: `🧵 We just analyzed ${mappedData?.length || 100}+ data points on ${mappedData?.[0]?.topic || 'market trends'}.

The results? Mind-blowing 🤯

Here's what we found: (1/5)`,
      stats: { likes: 234, retweets: 45, replies: 12 }
    },
    Facebook: {
      post: `📊 Big news! Our latest analysis of ${mappedData?.length || 100}+ data points reveals exciting opportunities in ${mappedData?.[0]?.topic || 'the market'}.

Here's what this means for you...

🎯 Key Takeaway: ${mappedData?.[0]?.metric || '73%'} improvement possible
👥 Perfect for: ${mappedData?.[0]?.audience || 'Forward-thinking teams'}
📅 Best time to act: Now!

What questions do you have? Let's discuss in the comments!`,
      stats: { likes: 456, comments: 67, shares: 23 }
    }
  }
  
  if (showMapper) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{template.name}</h1>
          <p className="text-lg text-muted-foreground">{template.description}</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Define Your Data</CardTitle>
            <CardDescription>
              {hasData 
                ? "Map your spreadsheet columns to the template requirements"
                : "Tell us what data you need for this template"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ColumnMapper
              template={{
                ...template,
                requiredFields: template.requiredFields,
                optionalFields: template.optionalFields
              }}
              onMappingComplete={handleMappingComplete}
              onCancel={() => router.back()}
            />
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{template.name}</h1>
          <p className="text-muted-foreground">Generated content for your campaigns</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Copy All
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Share2 className="h-4 w-4 mr-2" />
            Schedule Posts
          </Button>
        </div>
      </div>
      
      {/* Platform Tabs */}
      <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform}>
        <TabsList className="mb-6">
          {template.platforms.map(platform => (
            <TabsTrigger key={platform} value={platform}>
              {platform}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {template.platforms.map(platform => (
          <TabsContent key={platform} value={platform} className="space-y-6">
            {/* Preview Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {platform === 'LinkedIn' && <Users className="h-5 w-5" />}
                      {platform === 'Instagram' && <ImageIcon className="h-5 w-5" />}
                      {platform === 'Twitter' && <MessageCircle className="h-5 w-5" />}
                      {platform === 'Facebook' && <Users className="h-5 w-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-base">Your Company</CardTitle>
                      <CardDescription className="text-xs">2 hours ago · {platform}</CardDescription>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="whitespace-pre-wrap">
                  {mockContent[platform as keyof typeof mockContent].post}
                </div>
                
                {/* Hashtags */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="cursor-pointer">
                    <Hash className="h-3 w-3 mr-1" />
                    DataDriven
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer">
                    <Hash className="h-3 w-3 mr-1" />
                    Innovation
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer">
                    <Hash className="h-3 w-3 mr-1" />
                    Growth
                  </Badge>
                </div>
                
                {/* Engagement Preview */}
                <div className="pt-4 border-t flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {mockContent[platform as keyof typeof mockContent].stats.likes} likes
                  </span>
                  {platform !== 'Twitter' && (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {mockContent[platform as keyof typeof mockContent].stats.comments} comments
                    </span>
                  )}
                  {platform === 'Twitter' && (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {mockContent.Twitter.stats.replies} replies
                    </span>
                  )}
                  {(platform === 'LinkedIn' || platform === 'Facebook') && (
                    <span className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      {mockContent[platform as 'LinkedIn' | 'Facebook'].stats.shares} shares
                    </span>
                  )}
                  {platform === 'Twitter' && (
                    <span className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      {mockContent.Twitter.stats.retweets} retweets
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Additional Variations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alternative Versions</CardTitle>
                <CardDescription>AI-generated variations for A/B testing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm mb-2">Version B (More Casual)</p>
                  <p className="text-sm text-muted-foreground">
                    "Hey {platform} fam! 👋 Just dropped some serious insights..."
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm mb-2">Version C (Question-Based)</p>
                  <p className="text-sm text-muted-foreground">
                    "What if we told you that {mappedData?.[0]?.metric || 'your metrics'} could improve by 73%?"
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Best Practices */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {platform === 'LinkedIn' && (
                    <>
                      <Badge variant="outline" className="mr-2">✅ Professional tone</Badge>
                      <Badge variant="outline" className="mr-2">✅ Industry insights</Badge>
                      <Badge variant="outline" className="mr-2">✅ Thought leadership</Badge>
                    </>
                  )}
                  {platform === 'Instagram' && (
                    <>
                      <Badge variant="outline" className="mr-2">✅ Visual-first</Badge>
                      <Badge variant="outline" className="mr-2">✅ Emojis & hashtags</Badge>
                      <Badge variant="outline" className="mr-2">✅ Story-driven</Badge>
                    </>
                  )}
                  {platform === 'Twitter' && (
                    <>
                      <Badge variant="outline" className="mr-2">✅ Concise & punchy</Badge>
                      <Badge variant="outline" className="mr-2">✅ Thread format</Badge>
                      <Badge variant="outline" className="mr-2">✅ Trending topics</Badge>
                    </>
                  )}
                  {platform === 'Facebook' && (
                    <>
                      <Badge variant="outline" className="mr-2">✅ Community-focused</Badge>
                      <Badge variant="outline" className="mr-2">✅ Conversational</Badge>
                      <Badge variant="outline" className="mr-2">✅ Rich media</Badge>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}