"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, ChevronRight, ChevronLeft, Eye, EyeOff } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useSpreadsheetStore } from '@/lib/spreadsheet-store'
import { cn } from '@/lib/utils'

interface PreviewSidebarProps {
  isOpen: boolean
  onToggle: () => void
  selectedRow?: number
  templateType?: string
}

export function PreviewSidebar({ isOpen, onToggle, selectedRow = 0, templateType = 'social_media_post' }: PreviewSidebarProps) {
  const { headers, data } = useSpreadsheetStore()
  const [activeTab, setActiveTab] = useState('linkedin')
  
  // Get data for the selected row
  const rowData = data[selectedRow] || []
  const dataObject: Record<string, string> = {}
  headers.forEach((header, index) => {
    dataObject[header.toLowerCase().replace(/\s+/g, '_')] = rowData[index] || ''
  })

  // Platform-specific content generation
  const generatePlatformContent = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return {
          headline: dataObject.linkedin_headline || dataObject.content || 'Sample LinkedIn Post',
          body: dataObject.linkedin_post || dataObject.main_content || 'This is where your LinkedIn content will appear based on your spreadsheet data.',
          hashtags: dataObject.linkedin_hashtags || dataObject.hashtags || '#marketing #growth',
          cta: dataObject.linkedin_cta || dataObject.cta || 'Learn more'
        }
      
      case 'twitter':
        return {
          thread: [
            dataObject.tweet_1 || dataObject.content || 'First tweet in your thread',
            dataObject.tweet_2 || 'Follow-up tweet with more details',
            dataObject.tweet_3 || 'Final tweet with call to action'
          ].filter(Boolean),
          hashtags: dataObject.twitter_hashtags || dataObject.hashtags || '#marketing #growth'
        }
      
      case 'instagram':
        return {
          caption: dataObject.instagram_caption || dataObject.content || 'Instagram caption here',
          hashtags: dataObject.instagram_hashtags || dataObject.hashtags || '#marketing #instagood',
          slides: [
            dataObject.carousel_slide_1 || 'Slide 1 content',
            dataObject.carousel_slide_2 || 'Slide 2 content',
            dataObject.carousel_slide_3 || 'Slide 3 content'
          ].filter(Boolean)
        }
      
      default:
        return null
    }
  }

  const linkedinContent = generatePlatformContent('linkedin')
  const twitterContent = generatePlatformContent('twitter')
  const instagramContent = generatePlatformContent('instagram')

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={onToggle}
        variant="outline"
        size="icon"
        className={cn(
          "fixed right-4 top-1/2 -translate-y-1/2 z-40 shadow-lg",
          "bg-white hover:bg-gray-50 transition-all duration-300",
          isOpen && "right-[402px]"
        )}
      >
        {isOpen ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>

      {/* Sidebar */}
      <div className={cn(
        "fixed right-0 top-0 h-full bg-white border-l border-gray-200 shadow-xl transition-transform duration-300 z-30",
        "w-[400px]",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold">Live Preview</h3>
            <Badge variant="secondary" className="text-xs">
              Row {selectedRow + 1}
            </Badge>
          </div>
          <Button
            onClick={onToggle}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[calc(100%-73px)]">
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="linkedin" className="flex-1">LinkedIn</TabsTrigger>
            <TabsTrigger value="twitter" className="flex-1">Twitter/X</TabsTrigger>
            <TabsTrigger value="instagram" className="flex-1">Instagram</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-full">
            {/* LinkedIn Preview */}
            <TabsContent value="linkedin" className="p-4 space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
                  <div className="flex-1">
                    <div className="font-semibold">Your Company</div>
                    <div className="text-sm text-gray-500">Just now · 🌐</div>
                  </div>
                </div>
                {linkedinContent && (
                  <>
                    <div className="font-semibold text-lg mb-2">{linkedinContent.headline}</div>
                    <div className="whitespace-pre-wrap mb-3">{linkedinContent.body}</div>
                    <div className="text-blue-600 text-sm mb-2">{linkedinContent.hashtags}</div>
                    {linkedinContent.cta && (
                      <Button variant="outline" size="sm" className="w-full">
                        {linkedinContent.cta}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </TabsContent>

            {/* Twitter Preview */}
            <TabsContent value="twitter" className="p-4 space-y-4">
              {twitterContent?.thread.map((tweet, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-semibold">@yourhandle</span>
                        <span className="text-gray-500">· now</span>
                      </div>
                      <div className="whitespace-pre-wrap">{tweet}</div>
                      {index === 0 && twitterContent.hashtags && (
                        <div className="text-blue-500 text-sm mt-2">{twitterContent.hashtags}</div>
                      )}
                      {index < twitterContent.thread.length - 1 && (
                        <div className="text-sm text-gray-500 mt-2">↓ Thread continues</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Instagram Preview */}
            <TabsContent value="instagram" className="p-4 space-y-4">
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                {/* Carousel Slides */}
                {instagramContent?.slides && instagramContent.slides.length > 0 && (
                  <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 p-8 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-semibold mb-2">Carousel Post</div>
                      {instagramContent.slides.map((slide, index) => (
                        <div key={index} className="mb-2 p-2 bg-white/80 rounded">
                          <div className="text-sm text-gray-600">Slide {index + 1}</div>
                          <div className="text-sm">{slide}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Caption */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                    <span className="font-semibold">yourhandle</span>
                  </div>
                  {instagramContent && (
                    <>
                      <div className="whitespace-pre-wrap mb-2">{instagramContent.caption}</div>
                      <div className="text-blue-600 text-sm">{instagramContent.hashtags}</div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </>
  )
}