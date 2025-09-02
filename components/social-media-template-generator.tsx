"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SpreadsheetView } from "@/components/spreadsheet-view"
import { useSpreadsheetStore } from "@/lib/spreadsheet-store"
import { 
  ArrowLeft,
  FileText,
  Sparkles,
  Download,
  Copy,
  Share2,
  Heart,
  MessageCircle,
  Repeat,
  Bookmark,
  MoreHorizontal,
  ChevronRight,
  Hash,
  Image as ImageIcon,
  Play,
  Users,
  TrendingUp
} from "lucide-react"
import { toast } from "sonner"

interface SocialMediaTemplateGeneratorProps {
  templateId: string
}

// Platform template types
const platformTemplates = [
  { id: 'linkedin-thought', label: 'LinkedIn Thought Leadership', platform: 'linkedin' },
  { id: 'instagram-carousel', label: 'Instagram Carousel', platform: 'instagram' },
  { id: 'twitter-thread', label: 'Twitter Thread', platform: 'twitter' },
  { id: 'facebook-engagement', label: 'Facebook Engagement Post', platform: 'facebook' }
]

// Mock generated content for each platform
const generatedContent = {
  'linkedin-thought': {
    author: 'Your Company',
    time: '2h',
    platform: 'LinkedIn',
    content: `After analyzing 500+ marketing campaigns, one thing is clear: AI-driven personalization increases CTR by 73%.

Here's what the data shows:
• Personalized subject lines boost open rates by 26%
• Dynamic content adaptation improves engagement by 41%
• Predictive timing optimization adds 18% to conversion rates

The companies winning in this space aren\'t just using AI as a buzzword—they\'re fundamentally rethinking how they connect with customers.

What trends are you seeing in your industry? Share your experiences below. 👇`,
    hashtags: ['#MarketingAI', '#Leadership', '#Innovation', '#DigitalTransformation'],
    likes: '127',
    comments: '34',
    shares: '18'
  },
  'instagram-carousel': {
    author: 'yourcompany',
    time: '3h',
    platform: 'Instagram',
    slides: [
      '🎯 5 Ways AI is Transforming Marketing',
      '1️⃣ Hyper-Personalization at Scale',
      '2️⃣ Predictive Customer Journey Mapping',
      '3️⃣ Real-Time Content Optimization',
      '4️⃣ Automated A/B Testing',
      '5️⃣ ROI Attribution Modeling'
    ],
    caption: `Swipe to discover how leading brands are using AI to revolutionize their marketing strategies 🚀

We analyzed 500+ campaigns and the results are mind-blowing! 

Which strategy are you most excited to try? Let us know in the comments! 💬`,
    hashtags: ['#MarketingTips', '#AIMarketing', '#DigitalStrategy', '#ContentMarketing', '#MarketingAutomation'],
    likes: '2,341',
    comments: '89'
  },
  'twitter-thread': {
    author: '@yourcompany',
    time: '1h',
    platform: 'Twitter',
    tweets: [
      {
        content: '🧵 We analyzed 500+ marketing campaigns using AI. The results will blow your mind:',
        replies: '12',
        retweets: '45',
        likes: '234'
      },
      {
        content: '1/ AI-driven personalization isn\'t just a buzzword. It increases CTR by an average of 73%.',
        replies: '3',
        retweets: '21',
        likes: '89'
      },
      {
        content: '2/ The biggest win? Predictive timing. Sending content when users are most likely to engage adds 18% to conversions.',
        replies: '5',
        retweets: '15',
        likes: '67'
      },
      {
        content: '3/ But here\'s what most get wrong: It\'s not about more automation. It\'s about smarter automation.',
        replies: '8',
        retweets: '31',
        likes: '112'
      },
      {
        content: 'What\'s your experience with AI in marketing? Drop your thoughts below 👇',
        replies: '24',
        retweets: '9',
        likes: '56'
      }
    ]
  },
  'facebook-engagement': {
    author: 'Your Company',
    time: '4h',
    platform: 'Facebook',
    content: `🚀 BIG NEWS: Our latest research on AI-driven marketing is here!

We analyzed 500+ campaigns and discovered something incredible...

AI personalization isn\'t just improving results—it\'s completely transforming how brands connect with customers.

Key findings:
✅ 73% increase in CTR with AI personalization
✅ 41% boost in engagement rates
✅ 26% higher open rates with smart subject lines

But here\'s the real question: How are YOU using AI in your marketing strategy?

Share your thoughts below! 👇 We\'re giving away our complete research report to the best comment! 🎁`,
    reactions: '523',
    comments: '67',
    shares: '89'
  }
}

// LinkedIn Post Preview Component
function LinkedInPreview({ content }: { content: any }) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-0">
        {/* Post Header */}
        <div className="p-4 pb-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              YC
            </div>
            <div className="flex-1">
              <div className="font-semibold">{content.author}</div>
              <div className="text-sm text-muted-foreground">{content.time} • {content.platform}</div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Post Content */}
        <div className="px-4 pb-3">
          <div className="whitespace-pre-wrap text-sm">{content.content}</div>
          <div className="mt-3 flex flex-wrap gap-1">
            {content.hashtags.map((tag: string, idx: number) => (
              <span key={idx} className="text-blue-600 text-sm">{tag}</span>
            ))}
          </div>
        </div>
        
        {/* Engagement Stats */}
        <div className="px-4 py-2 border-y text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>{content.likes} likes</span>
            <div className="flex gap-3">
              <span>{content.comments} comments</span>
              <span>{content.shares} shares</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="p-2 flex justify-around">
          <Button variant="ghost" size="sm" className="flex-1">
            <Heart className="h-4 w-4 mr-2" />
            Like
          </Button>
          <Button variant="ghost" size="sm" className="flex-1">
            <MessageCircle className="h-4 w-4 mr-2" />
            Comment
          </Button>
          <Button variant="ghost" size="sm" className="flex-1">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Instagram Carousel Preview Component
function InstagramPreview({ content }: { content: any }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600"></div>
            <span className="font-semibold text-sm">{content.author}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Carousel */}
        <div className="relative bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 aspect-square flex items-center justify-center">
          <div className="text-center p-8">
            <p className="text-lg font-medium">{content.slides[currentSlide]}</p>
          </div>
          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
            {content.slides.map((_: any, idx: number) => (
              <button
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  idx === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentSlide(idx)}
              />
            ))}
          </div>
          {/* Navigation */}
          {currentSlide > 0 && (
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center"
              onClick={() => setCurrentSlide(currentSlide - 1)}
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </button>
          )}
          {currentSlide < content.slides.length - 1 && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center"
              onClick={() => setCurrentSlide(currentSlide + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Actions */}
        <div className="p-3">
          <div className="flex justify-between mb-3">
            <div className="flex gap-4">
              <Heart className="h-6 w-6" />
              <MessageCircle className="h-6 w-6" />
              <Share2 className="h-6 w-6" />
            </div>
            <Bookmark className="h-6 w-6" />
          </div>
          
          {/* Likes */}
          <div className="font-semibold text-sm mb-2">{content.likes} likes</div>
          
          {/* Caption */}
          <div className="text-sm">
            <span className="font-semibold mr-2">{content.author}</span>
            {content.caption}
          </div>
          
          {/* Hashtags */}
          <div className="mt-2 flex flex-wrap gap-1">
            {content.hashtags.map((tag: string, idx: number) => (
              <span key={idx} className="text-blue-600 text-xs">{tag}</span>
            ))}
          </div>
          
          {/* Comments */}
          <div className="mt-2 text-sm text-muted-foreground">
            View all {content.comments} comments
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Twitter Thread Preview Component
function TwitterPreview({ content }: { content: any }) {
  return (
    <div className="max-w-xl mx-auto space-y-3">
      {content.tweets.map((tweet: any, idx: number) => (
        <Card key={idx}>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-semibold">Your Company</span>
                  <span className="text-muted-foreground text-sm">{content.author} · {content.time}</span>
                </div>
                <p className="text-sm">{tweet.content}</p>
                <div className="flex items-center gap-6 mt-3 text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">{tweet.replies}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                    <Repeat className="h-4 w-4" />
                    <span className="text-xs">{tweet.retweets}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                    <Heart className="h-4 w-4" />
                    <span className="text-xs">{tweet.likes}</span>
                  </button>
                  <button className="hover:text-blue-500 transition-colors">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Facebook Post Preview Component
function FacebookPreview({ content }: { content: any }) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              YC
            </div>
            <div>
              <div className="font-semibold">{content.author}</div>
              <div className="text-sm text-muted-foreground">{content.time} · 🌍</div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-4 pb-3">
          <p className="whitespace-pre-wrap text-sm">{content.content}</p>
        </div>
        
        {/* Reactions */}
        <div className="px-4 py-2 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">👍</div>
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">❤️</div>
              <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs">😊</div>
            </div>
            <span className="ml-1">{content.reactions}</span>
          </div>
          <div className="flex gap-3">
            <span>{content.comments} Comments</span>
            <span>{content.shares} Shares</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="border-t p-1 flex">
          <Button variant="ghost" size="sm" className="flex-1">
            👍 Like
          </Button>
          <Button variant="ghost" size="sm" className="flex-1">
            💬 Comment
          </Button>
          <Button variant="ghost" size="sm" className="flex-1">
            ↗️ Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Enhanced sample data with platform-specific fields
const sampleSocialMediaData = [
  {
    // Core fields
    content_goal: 'Engagement',
    target_platform: 'LinkedIn',
    post_format: 'Single post',
    key_message: 'AI is transforming marketing with 73% CTR increase',
    audience_segment: 'Marketing executives',
    brand_voice: 'Professional',
    statistics: '500+ campaigns analyzed, 73% CTR increase',
    call_to_action: 'Share your AI marketing experience',
    campaign_name: 'AI Marketing Research',
    visual_type: 'Infographic',
    // Platform-specific fields
    linkedin_headline: '🚀 Major AI Marketing Breakthrough',
    linkedin_article_link: 'https://example.com/full-report',
    hashtags: '#AIMarketing #DigitalTransformation #MarTech',
    character_count: '1200'
  },
  {
    // Core fields
    content_goal: 'Awareness',
    target_platform: 'Twitter',
    post_format: 'Thread',
    key_message: 'Breaking down our AI marketing findings',
    audience_segment: 'Tech professionals',
    brand_voice: 'Educational',
    statistics: '41% engagement boost, 26% higher open rates',
    call_to_action: 'Follow for more insights',
    campaign_name: 'Weekly Tech Insights',
    visual_type: 'Data visualization',
    // Platform-specific fields
    tweet_1: '🧵 We analyzed 500+ marketing campaigns using AI. The results will blow your mind:',
    tweet_2: '1/ AI-driven personalization increases CTR by 73% on average',
    tweet_3: '2/ Predictive timing boosts conversions by 18%',
    tweet_4: '3/ Dynamic content adaptation improves engagement by 41%',
    tweet_5: 'What\'s your experience with AI in marketing? Drop your thoughts below 👇'
  },
  {
    // Core fields
    content_goal: 'Conversion',
    target_platform: 'Instagram',
    post_format: 'Carousel',
    key_message: '5 ways AI revolutionizes your marketing',
    audience_segment: 'Small business owners',
    brand_voice: 'Inspirational',
    statistics: '18% conversion rate improvement',
    call_to_action: 'Link in bio for full guide',
    campaign_name: 'AI for Business',
    visual_type: 'Graphic design',
    // Platform-specific fields
    carousel_slide_1: '🎯 5 Ways AI Transforms Your Marketing',
    carousel_slide_2: '1️⃣ Hyper-Personalization at Scale',
    carousel_slide_3: '2️⃣ Predictive Customer Journey Mapping',
    carousel_slide_4: '3️⃣ Real-Time Content Optimization',
    carousel_slide_5: '4️⃣ Automated A/B Testing',
    instagram_caption: 'Swipe to discover how AI can revolutionize your marketing strategy 🚀',
    location_tag: 'Silicon Valley',
    first_comment: 'Which strategy are you most excited to try? Let me know! 👇'
  }
]

// Dynamic headers based on platform
const getCoreHeaders = () => [
  'content_goal',
  'target_platform', 
  'post_format',
  'key_message',
  'audience_segment',
  'brand_voice',
  'statistics',
  'call_to_action',
  'campaign_name',
  'visual_type'
]

const getPlatformHeaders = (platform: string, format: string) => {
  const platformHeaders: Record<string, string[]> = {
    'LinkedIn': ['linkedin_headline', 'linkedin_article_link', 'hashtags', 'character_count'],
    'Twitter': format === 'Thread' 
      ? ['tweet_1', 'tweet_2', 'tweet_3', 'tweet_4', 'tweet_5']
      : ['tweet_text', 'reply_to', 'quote_tweet'],
    'Instagram': format === 'Carousel'
      ? ['carousel_slide_1', 'carousel_slide_2', 'carousel_slide_3', 'carousel_slide_4', 'carousel_slide_5', 'instagram_caption', 'location_tag', 'first_comment']
      : ['instagram_caption', 'location_tag', 'hashtags', 'first_comment'],
    'Facebook': ['facebook_text', 'link_preview', 'tag_friends', 'feeling_activity'],
    'TikTok': ['video_script', 'trending_sound', 'effects', 'hashtag_challenges']
  }
  return platformHeaders[platform] || []
}

// Get all headers for initial display
const socialMediaHeaders = [
  ...getCoreHeaders(),
  ...getPlatformHeaders('LinkedIn', 'Single post'),
  ...getPlatformHeaders('Twitter', 'Thread'),
  ...getPlatformHeaders('Instagram', 'Carousel')
]

export function SocialMediaTemplateGenerator({ templateId }: SocialMediaTemplateGeneratorProps) {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState('linkedin-thought')
  const [selectedDataRow, setSelectedDataRow] = useState(0)
  const { data, headers, setData } = useSpreadsheetStore()
  
  // Initialize with sample data if empty
  useEffect(() => {
    if (templateId === 'social_media_post' && data.length === 0) {
      // Convert sample data objects to 2D array of strings for spreadsheet
      const rows: string[][] = sampleSocialMediaData.map(item => 
        socialMediaHeaders.map(header => String(item[header as keyof typeof item] || ''))
      )
      setData(socialMediaHeaders, rows)
    }
  }, [templateId, data.length, setData])
  
  // Generate content from actual spreadsheet data
  const generateContentFromData = (rowIndex: number = 0) => {
    if (data.length === 0 || !headers.length) return generatedContent
    
    const row = data[Math.min(rowIndex, data.length - 1)]
    const dataObj: any = {}
    headers.forEach((header, idx) => {
      dataObj[header] = row[idx] || ''
    })
    
    // Generate platform-specific content based on actual data
    return {
      'linkedin-thought': {
        ...generatedContent['linkedin-thought'],
        content: dataObj.linkedin_headline 
          ? `${dataObj.linkedin_headline}\n\n${dataObj.key_message}\n\n${dataObj.statistics}\n\n${dataObj.call_to_action}\n\n${dataObj.linkedin_article_link || ''}`
          : `🎯 ${dataObj.key_message || 'Exciting insights to share!'}\n\n${dataObj.statistics || 'Based on our latest analysis'}\n\n${dataObj.call_to_action || 'What are your thoughts?'} 👇`,
        hashtags: dataObj.hashtags 
          ? dataObj.hashtags.split(' ').filter((tag: string) => tag.startsWith('#'))
          : dataObj.campaign_name 
          ? [`#${dataObj.campaign_name.replace(/\s+/g, '')}`, '#Innovation'] 
          : ['#Innovation', '#BusinessGrowth']
      },
      'instagram-carousel': {
        ...generatedContent['instagram-carousel'],
        slides: dataObj.carousel_slide_1 
          ? [
              dataObj.carousel_slide_1,
              dataObj.carousel_slide_2,
              dataObj.carousel_slide_3,
              dataObj.carousel_slide_4,
              dataObj.carousel_slide_5
            ].filter(Boolean)
          : generatedContent['instagram-carousel'].slides,
        caption: dataObj.instagram_caption || `${dataObj.key_message || 'Check out these insights!'}\n\n${dataObj.statistics || 'Amazing results'}\n\n${dataObj.call_to_action || 'Swipe to learn more!'}`
      },
      'twitter-thread': {
        ...generatedContent['twitter-thread'],
        tweets: dataObj.tweet_1
          ? [
              dataObj.tweet_1 && { content: dataObj.tweet_1, replies: '12', retweets: '45', likes: '234' },
              dataObj.tweet_2 && { content: dataObj.tweet_2, replies: '3', retweets: '21', likes: '89' },
              dataObj.tweet_3 && { content: dataObj.tweet_3, replies: '5', retweets: '15', likes: '67' },
              dataObj.tweet_4 && { content: dataObj.tweet_4, replies: '8', retweets: '31', likes: '112' },
              dataObj.tweet_5 && { content: dataObj.tweet_5, replies: '24', retweets: '9', likes: '56' }
            ].filter(Boolean)
          : [
              { content: `🧵 ${dataObj.key_message || 'Important thread:'}`, replies: '12', retweets: '45', likes: '234' },
              { content: `1/ ${dataObj.statistics || 'Key findings'}`, replies: '3', retweets: '21', likes: '89' },
              { content: dataObj.call_to_action || 'Share your thoughts!', replies: '24', retweets: '9', likes: '56' }
            ]
      },
      'facebook-engagement': {
        ...generatedContent['facebook-engagement'],
        content: dataObj.facebook_text 
          || `${dataObj.key_message || 'Exciting news!'}\n\n${dataObj.statistics || 'Here are the details...'}\n\n${dataObj.call_to_action || 'Share your thoughts in the comments!'}`
      }
    }
  }
  
  // Check if this is a social media template
  const isSocialMediaTemplate = templateId === 'social_media_post'
  
  if (!isSocialMediaTemplate) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Template not supported</h3>
            <p className="text-muted-foreground mb-4">
              This template type is not yet supported.
            </p>
            <Button onClick={() => router.push('/create/output')}>
              Browse Templates
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  const handleCopy = () => {
    const dynamicContent = generateContentFromData(selectedDataRow)
    const content = dynamicContent[selectedTemplate as keyof typeof dynamicContent]
    const text = typeof content === 'object' && 'content' in content 
      ? content.content 
      : typeof content === 'object' && 'caption' in content
      ? content.caption
      : JSON.stringify(content)
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }
  
  const renderPreview = () => {
    const dynamicContent = generateContentFromData(selectedDataRow)
    const content = dynamicContent[selectedTemplate as keyof typeof dynamicContent]
    
    switch (selectedTemplate) {
      case 'linkedin-thought':
        return <LinkedInPreview content={content} />
      case 'instagram-carousel':
        return <InstagramPreview content={content} />
      case 'twitter-thread':
        return <TwitterPreview content={content} />
      case 'facebook-engagement':
        return <FacebookPreview content={content} />
      default:
        return null
    }
  }
  
  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Social Media Content Template</h1>
            <p className="text-muted-foreground">
              Start with your data, then generate platform-specific posts
            </p>
          </div>
        </div>
      </div>
      
      {/* Data Section - Now Primary */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Template Data Structure</h2>
          <p className="text-sm text-muted-foreground">
            This template includes sample data. Click "Use This Template" to customize it in the full spreadsheet editor.
          </p>
        </div>
        
        {/* Spreadsheet View */}
        <Card>
          <CardContent className="p-0">
            <SpreadsheetView />
          </CardContent>
        </Card>
        
        {/* Action Buttons */}
        <div className="mt-6 flex justify-center gap-3">
          <Button 
            size="lg" 
            onClick={() => router.push('/')}
            className="min-w-[200px]"
          >
            <FileText className="h-4 w-4 mr-2" />
            Use This Template
          </Button>
          {data.length > 0 && (
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setSelectedTemplate('preview')}
              className="min-w-[200px]"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Preview Posts
            </Button>
          )}
        </div>
      </div>
      
      <Separator className="my-8" />
      
      {/* Preview Section - Now Secondary */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Post Previews</h2>
          <p className="text-sm text-muted-foreground">
            See how your data will look as social media posts across different platforms
          </p>
        </div>
        
        {/* Template Selector */}
        <div className="mb-6">
          <Tabs value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <TabsList className="grid w-full grid-cols-4 h-auto p-1">
              {platformTemplates.map(template => (
                <TabsTrigger 
                  key={template.id} 
                  value={template.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2"
                >
                  {template.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        {/* Preview Display */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-medium">Preview</h3>
              {data.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Row:</span>
                  {data.map((_, idx) => (
                    <Button
                      key={idx}
                      variant={selectedDataRow === idx ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDataRow(idx)}
                      className="h-7 w-7 p-0"
                    >
                      {idx + 1}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">
                {platformTemplates.find(t => t.id === selectedTemplate)?.platform.toUpperCase()}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>
          
          <div className="bg-muted/30 p-6 rounded-lg">
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  )
}