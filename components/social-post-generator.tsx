"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Copy, 
  Download, 
  Sparkles,
  Hash,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"

interface PlatformConfig {
  name: string
  icon: string
  charLimit: number
  features: string[]
  bestPractices: string[]
  hashtagLimit: number
}

const platformConfigs: Record<string, PlatformConfig> = {
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    charLimit: 3000,
    features: ['Native articles', 'Polls', 'Native video', 'Document sharing'],
    bestPractices: [
      'Professional tone works best',
      'Use line breaks for readability',
      'Include 3-5 relevant hashtags',
      'Best times: Tue-Thu, 8-10am or 5-6pm',
      'Ask questions to boost engagement'
    ],
    hashtagLimit: 5
  },
  twitter: {
    name: 'Twitter/X',
    icon: '🐦',
    charLimit: 280,
    features: ['Threads', 'Polls', 'Quote tweets', 'Spaces'],
    bestPractices: [
      'Front-load key information',
      'Use 1-2 hashtags max',
      'Thread for longer content',
      'Best times: 9-10am, 7-9pm',
      'Use visuals for 150% more retweets'
    ],
    hashtagLimit: 2
  },
  instagram: {
    name: 'Instagram',
    icon: '📸',
    charLimit: 2200,
    features: ['Stories', 'Reels', 'Carousels', 'Shopping tags'],
    bestPractices: [
      'Visual content is king',
      'Use up to 30 hashtags',
      'First 125 chars are crucial',
      'Best times: 11am-1pm, 5pm',
      'Stories for behind-the-scenes'
    ],
    hashtagLimit: 30
  },
  facebook: {
    name: 'Facebook',
    icon: '👥',
    charLimit: 63206,
    features: ['Live video', 'Events', 'Groups', 'Marketplace'],
    bestPractices: [
      'Conversational tone',
      'Ask questions',
      'Use 1-2 hashtags',
      'Best times: 9am, 3pm, 7pm',
      'Videos get 135% more reach'
    ],
    hashtagLimit: 2
  },
  tiktok: {
    name: 'TikTok',
    icon: '🎵',
    charLimit: 2200,
    features: ['Sounds', 'Effects', 'Duets', 'Live'],
    bestPractices: [
      'Hook in first 3 seconds',
      'Use trending sounds',
      '3-5 hashtags optimal',
      'Best times: 3-7am, 6-10pm',
      'Authentic content performs best'
    ],
    hashtagLimit: 5
  }
}

interface GeneratedPost {
  platform: string
  content: string
  hashtags: string[]
  characterCount: number
  estimatedEngagement: {
    likes: string
    shares: string
    comments: string
  }
  variations?: string[]
  firstComment?: string
  visualSuggestion?: string
}

interface SocialPostGeneratorProps {
  data: Record<string, any>
}

export function SocialPostGenerator({ data }: SocialPostGeneratorProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('linkedin')
  const [generatedPosts, setGeneratedPosts] = useState<Record<string, GeneratedPost>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Mock generation function - in real app, this would call an AI API
  const generatePost = async (platform: string) => {
    setIsGenerating(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock generated content based on platform
    const mockPosts: Record<string, GeneratedPost> = {
      linkedin: {
        platform: 'linkedin',
        content: `🚀 Exciting news! We just closed our $${data.funding_amount || '25M'} Series ${data.round || 'A'} led by ${data.lead_investor || 'Sequoia Capital'}!

This milestone wouldn't be possible without our incredible team and customers who believed in our vision from day one.

With this funding, we're accelerating our mission to ${data.mission || 'democratize AI for businesses'}:

→ Expanding our engineering team by ${data.team_growth || '2x'}
→ Launching in ${data.new_markets || '3 new markets'}
→ Building next-gen ${data.product_focus || 'enterprise features'}

The journey from ${data.start_point || 'garage startup'} to serving ${data.customer_count || '500+'} enterprises has been incredible. 

Special thanks to ${data.investors || 'our investor partners'} for their continued support and strategic guidance.

This is just the beginning. We're more committed than ever to ${data.commitment || 'transforming how businesses leverage AI'}.

What excites you most about our next chapter? Let us know in the comments! 👇`,
        hashtags: ['#SeriesA', '#Startup', '#AI', '#TechNews', '#Innovation'],
        characterCount: 850,
        estimatedEngagement: {
          likes: '500-1.2K',
          shares: '50-150',
          comments: '30-80'
        },
        variations: [
          'Start with a question: "What does it take to go from 0 to $25M funding in 18 months?"',
          'Lead with metrics: "500 customers. 10x growth. $25M Series A. Here\'s our story..."'
        ],
        firstComment: 'Huge shoutout to our early employees who took the risk and joined us when we were just 5 people in a garage. This win is yours! 🙌',
        visualSuggestion: 'Team photo with funding announcement graphic overlay, or infographic showing growth metrics'
      },
      twitter: {
        platform: 'twitter',
        content: `🎉 BIG NEWS: We just raised $${data.funding_amount || '25M'} Series ${data.round || 'A'} led by @${data.lead_investor_twitter || 'sequoia'}!

From ${data.start_metric || '5 customers'} to ${data.current_metric || '500+'} in just ${data.timeframe || '18 months'}.

This funding accelerates our mission to ${data.short_mission || 'democratize AI'}.

Thread 🧵👇`,
        hashtags: ['#SeriesA', '#StartupNews'],
        characterCount: 245,
        estimatedEngagement: {
          likes: '200-500',
          shares: '30-100',
          comments: '20-50'
        },
        variations: [
          '2/ Here\'s what we\'re building with this funding...',
          '3/ The team that made this possible...',
          '4/ What this means for our customers...'
        ],
        visualSuggestion: 'Celebration GIF or funding announcement graphic'
      },
      instagram: {
        platform: 'instagram',
        content: `Major milestone unlocked! 🎯

We're beyond thrilled to announce our $${data.funding_amount || '25M'} Series ${data.round || 'A'} funding round!

Swipe to see our journey from Day 1 to today ➡️

This investment fuels our mission to ${data.mission || 'revolutionize how businesses use AI'}.

Drop a 🚀 if you're excited about what's coming next!

[Link in bio for the full story]`,
        hashtags: [
          '#startup', '#seriesA', '#funding', '#tech', '#innovation',
          '#entrepreneur', '#startuplife', '#techstartup', '#venturecapital',
          '#growth', '#milestone', '#team', '#success', '#ai', '#artificialintelligence'
        ],
        characterCount: 380,
        estimatedEngagement: {
          likes: '1K-3K',
          shares: '100-300',
          comments: '50-150'
        },
        variations: [
          'Carousel post with journey timeline',
          'Reel showing team celebration',
          'Story series with behind-the-scenes'
        ],
        visualSuggestion: 'Carousel: 1) Announcement graphic 2) Team photo 3) Growth metrics 4) What\'s next 5) Call to action'
      }
    }
    
    const post = mockPosts[platform] || mockPosts.linkedin
    setGeneratedPosts(prev => ({ ...prev, [platform]: post }))
    setIsGenerating(false)
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }
  
  const currentPost = generatedPosts[selectedPlatform]
  const config = platformConfigs[selectedPlatform]
  
  return (
    <div className="space-y-6">
      {/* Platform Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Platform</CardTitle>
          <CardDescription>Choose where you want to publish your content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(platformConfigs).map(([key, platform]) => (
              <Button
                key={key}
                variant={selectedPlatform === key ? 'default' : 'outline'}
                onClick={() => setSelectedPlatform(key)}
                className="flex items-center gap-2"
              >
                <span className="text-lg">{platform.icon}</span>
                {platform.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Platform Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            {config.name} Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2">Platform Features</Label>
              <div className="flex flex-wrap gap-2">
                {config.features.map(feature => (
                  <Badge key={feature} variant="secondary">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2">Limits</Label>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3" />
                  Character limit: {config.charLimit.toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-3 w-3" />
                  Optimal hashtags: {config.hashtagLimit}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium mb-2">Best Practices</Label>
            <ul className="space-y-1">
              {config.bestPractices.map((practice, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  {practice}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
      
      {/* Generate Button */}
      {!currentPost && (
        <Button 
          onClick={() => generatePost(selectedPlatform)}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>Generating...</>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate {config.name} Post
            </>
          )}
        </Button>
      )}
      
      {/* Generated Content */}
      {currentPost && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated {config.name} Post</span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(currentPost.content)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => generatePost(selectedPlatform)}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Regenerate
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Post */}
            <div>
              <Label className="text-sm font-medium mb-2">Post Content</Label>
              <Textarea 
                value={currentPost.content}
                readOnly
                className="min-h-[200px] font-mono text-sm"
              />
              <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                <span>{currentPost.characterCount} / {config.charLimit} characters</span>
                <Badge variant={currentPost.characterCount <= config.charLimit ? 'default' : 'destructive'}>
                  {currentPost.characterCount <= config.charLimit ? 'Within limit' : 'Over limit'}
                </Badge>
              </div>
            </div>
            
            {/* Hashtags */}
            <div>
              <Label className="text-sm font-medium mb-2">Suggested Hashtags</Label>
              <div className="flex flex-wrap gap-2">
                {currentPost.hashtags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => copyToClipboard(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Engagement Estimates */}
            <div>
              <Label className="text-sm font-medium mb-2">Estimated Engagement</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Heart className="h-4 w-4 mx-auto mb-1 text-red-500" />
                  <p className="text-sm font-medium">{currentPost.estimatedEngagement.likes}</p>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Share2 className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                  <p className="text-sm font-medium">{currentPost.estimatedEngagement.shares}</p>
                  <p className="text-xs text-muted-foreground">Shares</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <MessageCircle className="h-4 w-4 mx-auto mb-1 text-green-500" />
                  <p className="text-sm font-medium">{currentPost.estimatedEngagement.comments}</p>
                  <p className="text-xs text-muted-foreground">Comments</p>
                </div>
              </div>
            </div>
            
            {/* Variations */}
            {currentPost.variations && currentPost.variations.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2">Alternative Hooks / Variations</Label>
                <div className="space-y-2">
                  {currentPost.variations.map((variation, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-muted rounded-lg text-sm cursor-pointer hover:bg-muted/80"
                      onClick={() => copyToClipboard(variation)}
                    >
                      <span className="font-medium text-xs text-muted-foreground">Option {idx + 1}:</span>
                      <p className="mt-1">{variation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* First Comment Strategy */}
            {currentPost.firstComment && (
              <div>
                <Label className="text-sm font-medium mb-2">First Comment (Boost Engagement)</Label>
                <div 
                  className="p-3 bg-muted rounded-lg text-sm cursor-pointer hover:bg-muted/80"
                  onClick={() => copyToClipboard(currentPost.firstComment)}
                >
                  {currentPost.firstComment}
                </div>
              </div>
            )}
            
            {/* Visual Suggestions */}
            {currentPost.visualSuggestion && (
              <div>
                <Label className="text-sm font-medium mb-2">Visual Content Suggestion</Label>
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
                  <Eye className="h-4 w-4 inline mr-2 text-blue-600" />
                  {currentPost.visualSuggestion}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}