/**
 * Comprehensive Output Template System V2
 * Defines all possible outputs users can create from their data
 */

export type OutputCategory = 
  | 'analytics' 
  | 'marketing' 
  | 'sales' 
  | 'presentations' 
  | 'operations' 
  | 'documents'
  | 'automation'

export type OutputFormat = 
  | 'dashboard' 
  | 'document' 
  | 'email' 
  | 'social' 
  | 'presentation' 
  | 'data'
  | 'workflow'

export interface DataField {
  name: string
  type: 'text' | 'number' | 'date' | 'email' | 'url' | 'currency' | 'boolean' | 'phone'
  description: string
  example?: string
  transformer?: string // How to derive from other fields
}

export interface OutputTemplate {
  id: string
  name: string
  category: OutputCategory
  icon: string
  description: string
  timeEstimate: string // "5 min", "15 min", etc.
  popularity: number // For sorting popular items
  
  // Data requirements
  dataRequirements: {
    required: DataField[]
    optional: DataField[]
    enhanced: DataField[] // Nice to have for advanced features
  }
  
  // Output configuration
  outputConfig: {
    type: OutputFormat
    format?: 'pdf' | 'html' | 'csv' | 'json' | 'slides' | 'xlsx'
    template?: string // Reference to template file/component
  }
  
  // Examples and preview
  examples: string[]
  previewImage?: string
  samplePrompt?: string // Help users understand what they'll get
}

// Analytics & Visualization Templates
export const analyticsTemplates: OutputTemplate[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    category: 'analytics',
    icon: '📊',
    description: 'Interactive data visualizations with charts and KPIs',
    timeEstimate: '5 min',
    popularity: 10,
    dataRequirements: {
      required: [
        { name: 'date', type: 'date', description: 'Time period for trends' },
        { name: 'metric', type: 'number', description: 'Values to visualize' }
      ],
      optional: [
        { name: 'category', type: 'text', description: 'Group data by categories' },
        { name: 'target', type: 'number', description: 'Goals or benchmarks' }
      ],
      enhanced: [
        { name: 'region', type: 'text', description: 'Geographic breakdown' }
      ]
    },
    outputConfig: {
      type: 'dashboard',
      template: 'dashboard'
    },
    examples: ['Sales Dashboard', 'Marketing Performance', 'Financial Overview'],
    samplePrompt: 'Create a dashboard showing revenue trends and top products'
  },
  {
    id: 'report',
    name: 'Report',
    category: 'analytics',
    icon: '📄',
    description: 'Detailed analysis document with insights and recommendations',
    timeEstimate: '15 min',
    popularity: 9,
    dataRequirements: {
      required: [
        { name: 'data_points', type: 'text', description: 'Information to analyze' }
      ],
      optional: [
        { name: 'metrics', type: 'number', description: 'Quantitative data' },
        { name: 'time_period', type: 'date', description: 'Date ranges' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'document',
      format: 'pdf'
    },
    examples: ['Quarterly Business Report', 'Market Analysis', 'Performance Review'],
    samplePrompt: 'Generate a comprehensive analysis report with key findings'
  },
  {
    id: 'scorecard',
    name: 'Scorecard',
    category: 'analytics',
    icon: '🎯',
    description: 'KPI tracking matrix with performance indicators',
    timeEstimate: '5 min',
    popularity: 7,
    dataRequirements: {
      required: [
        { name: 'metric_name', type: 'text', description: 'KPI names' },
        { name: 'actual_value', type: 'number', description: 'Current values' },
        { name: 'target_value', type: 'number', description: 'Target values' }
      ],
      optional: [
        { name: 'previous_value', type: 'number', description: 'Historical comparison' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'dashboard',
      template: 'scorecard'
    },
    examples: ['Team Performance Scorecard', 'Project Metrics', 'Quality Scorecard'],
    samplePrompt: 'Build a scorecard tracking KPIs against targets'
  }
]

// Marketing & Social Templates
export const marketingTemplates: OutputTemplate[] = [
  {
    id: 'social_media_post',
    name: 'Social Media Post',
    category: 'marketing',
    icon: '📱',
    description: 'Platform-optimized social content with engagement strategies',
    timeEstimate: '2-5 min',
    popularity: 10,
    dataRequirements: {
      required: [
        { name: 'content_goal', type: 'text', description: 'Primary objective: Awareness/Engagement/Conversion/Education/Entertainment' },
        { name: 'target_platform', type: 'text', description: 'LinkedIn/Twitter/Instagram/Facebook/TikTok/YouTube/Pinterest/Reddit' },
        { name: 'post_format', type: 'text', description: 'Single post/Thread/Carousel/Story/Reel/Live/Poll/Article' }
      ],
      optional: [
        // Core Content Fields
        { name: 'key_message', type: 'text', description: 'Main point to communicate (hook/headline)' },
        { name: 'supporting_points', type: 'text', description: 'Bullet points or key takeaways' },
        { name: 'storytelling_angle', type: 'text', description: 'Personal story/Customer story/Data story/News angle' },
        
        // Audience & Targeting
        { name: 'audience_segment', type: 'text', description: 'Primary audience: Executives/Developers/Marketers/Students/General' },
        { name: 'audience_pain_points', type: 'text', description: 'Problems your audience faces' },
        { name: 'audience_stage', type: 'text', description: 'Awareness/Consideration/Decision/Retention' },
        { name: 'geo_targeting', type: 'text', description: 'Geographic focus: Global/Country/City/Region' },
        { name: 'language', type: 'text', description: 'Primary language and any translations needed' },
        
        // Brand & Voice
        { name: 'brand_voice', type: 'text', description: 'Professional/Casual/Humorous/Inspirational/Educational/Urgent' },
        { name: 'brand_values', type: 'text', description: 'Core values to reflect in content' },
        { name: 'brand_personality', type: 'text', description: 'Expert/Friend/Mentor/Challenger/Entertainer' },
        { name: 'content_pillars', type: 'text', description: 'Which content pillar this fits: Thought Leadership/Product/Culture/Customer Success' },
        
        // Data & Proof Points
        { name: 'statistics', type: 'text', description: 'Specific numbers, percentages, or data points' },
        { name: 'social_proof', type: 'text', description: 'Customer quotes/Case studies/Awards/Certifications' },
        { name: 'authority_markers', type: 'text', description: 'Credentials/Experience/Partnerships that build trust' },
        
        // Campaign & Series
        { name: 'campaign_name', type: 'text', description: 'Part of which campaign or initiative' },
        { name: 'content_series', type: 'text', description: 'Series name and episode number if applicable' },
        { name: 'campaign_hashtag', type: 'text', description: 'Branded campaign hashtag' },
        { name: 'cross_platform_strategy', type: 'text', description: 'How this connects to other platforms' },
        
        // Visual Content
        { name: 'visual_type', type: 'text', description: 'Photo/Graphic/Video/GIF/Infographic/Screenshot/Meme' },
        { name: 'visual_style', type: 'text', description: 'Minimalist/Bold/Photographic/Illustrated/Data-viz/User-generated' },
        { name: 'visual_elements', type: 'text', description: 'Colors/Fonts/Logo placement/Templates to use' },
        { name: 'video_length', type: 'text', description: 'For video: 15s/30s/60s/2min/long-form' },
        { name: 'alt_text', type: 'text', description: 'Accessibility description for images' },
        
        // Engagement Elements
        { name: 'call_to_action', type: 'text', description: 'Primary CTA: Learn more/Sign up/Download/Share/Comment/Vote' },
        { name: 'engagement_hooks', type: 'text', description: 'Questions to ask/Polls to run/Challenges to pose' },
        { name: 'first_comment', type: 'text', description: 'Planned first comment to boost engagement' },
        { name: 'response_strategy', type: 'text', description: 'How to handle comments: Thank/Answer/Redirect/Ignore' },
        
        // Hashtag Strategy
        { name: 'hashtag_mix', type: 'text', description: 'Branded/Trending/Niche/Community hashtags to use' },
        { name: 'hashtag_research', type: 'text', description: 'Popular hashtags in your space with volume' },
        
        // Mentions & Partnerships
        { name: 'mentions', type: 'text', description: '@mentions of people/brands/partners' },
        { name: 'influencer_collaboration', type: 'text', description: 'Influencer involvement or UGC elements' },
        { name: 'employee_advocacy', type: 'text', description: 'Internal team members to involve' }
      ],
      enhanced: [
        // Timing & Scheduling
        { name: 'optimal_time', type: 'date', description: 'Best time to post based on audience data' },
        { name: 'time_zone', type: 'text', description: 'Primary time zone for scheduling' },
        { name: 'posting_frequency', type: 'text', description: 'How this fits into posting cadence' },
        { name: 'expiration_date', type: 'date', description: 'When content becomes outdated' },
        
        // Performance Benchmarks
        { name: 'performance_benchmarks', type: 'text', description: 'Expected likes/shares/comments based on history' },
        { name: 'success_metrics', type: 'text', description: 'KPIs: Reach/Engagement rate/Click-through/Conversions' },
        { name: 'a_b_test_variant', type: 'text', description: 'Different versions to test: Headlines/Images/CTAs' },
        
        // Compliance & Legal
        { name: 'compliance_checks', type: 'text', description: 'Legal/regulatory requirements (FTC disclosures, GDPR)' },
        { name: 'sensitive_topics', type: 'text', description: 'Topics to avoid or handle carefully' },
        { name: 'approval_required', type: 'boolean', description: 'Needs legal/executive review' },
        { name: 'disclosure_required', type: 'text', description: 'Sponsored/Partnership/Affiliate disclosures needed' },
        
        // Competitive Context
        { name: 'competitor_activity', type: 'text', description: 'What competitors are saying about this topic' },
        { name: 'differentiation', type: 'text', description: 'How to stand out from similar content' },
        { name: 'industry_trends', type: 'text', description: 'Current industry conversations to tap into' },
        
        // Repurposing & Atomization
        { name: 'content_source', type: 'text', description: 'Original content this is derived from (blog/video/podcast)' },
        { name: 'repurpose_plan', type: 'text', description: 'How to break down or expand for other formats' },
        { name: 'content_variations', type: 'text', description: 'Different angles for different platforms' },
        
        // Advanced Platform Features
        { name: 'platform_features', type: 'text', description: 'Platform-specific: LinkedIn polls/Twitter Spaces/IG Shopping tags' },
        { name: 'thread_structure', type: 'text', description: 'For threads: Hook/Problem/Solution/CTA breakdown' },
        { name: 'carousel_slides', type: 'text', description: 'For carousels: Slide-by-slide content plan' },
        { name: 'story_sequence', type: 'text', description: 'For stories: Frame-by-frame storyboard' },
        
        // Budget & Promotion
        { name: 'boost_budget', type: 'currency', description: 'Paid promotion budget if any' },
        { name: 'target_audience_paid', type: 'text', description: 'Paid targeting parameters' },
        { name: 'promotion_duration', type: 'text', description: 'How long to run paid promotion' }
      ]
    },
    outputConfig: {
      type: 'social',
      template: 'social_post_advanced'
    },
    examples: [
      'Series A funding announcement for LinkedIn with employee advocacy',
      'Educational Twitter thread on industry trends with data viz',
      'Instagram carousel showcasing customer transformation story',
      'TikTok trend participation with brand twist',
      'LinkedIn article establishing thought leadership',
      'Facebook Live Q&A session announcement',
      'Reddit AMA preparation and promotion',
      'Pinterest infographic for evergreen content',
      'YouTube Shorts from podcast highlights',
      'Cross-platform product launch campaign'
    ],
    samplePrompt: 'Create LinkedIn post announcing $25M Series A funding led by Sequoia Capital, targeting B2B SaaS executives, with employee advocacy and first comment strategy'
  },
  {
    id: 'email_campaign',
    name: 'Email Campaign',
    category: 'marketing',
    icon: '📧',
    description: 'Automated email sequences with personalization',
    timeEstimate: '10 min',
    popularity: 9,
    dataRequirements: {
      required: [
        { name: 'recipient_name', type: 'text', description: 'Contact names' },
        { name: 'email', type: 'email', description: 'Email addresses' }
      ],
      optional: [
        { name: 'company', type: 'text', description: 'Organization name' },
        { name: 'role', type: 'text', description: 'Job title' },
        { name: 'custom_field', type: 'text', description: 'Personalization data' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'email',
      template: 'email_campaign'
    },
    examples: ['Sales outreach', 'Newsletter', 'Product launch'],
    samplePrompt: 'Design email campaign for B2B software prospects'
  },
  {
    id: 'content_calendar',
    name: 'Content Calendar',
    category: 'marketing',
    icon: '📅',
    description: 'Comprehensive social media planning and scheduling system',
    timeEstimate: '15-30 min',
    popularity: 8,
    dataRequirements: {
      required: [
        { name: 'planning_period', type: 'date', description: 'Date range: Week/Month/Quarter/Year' },
        { name: 'posting_frequency', type: 'text', description: 'Posts per day/week per platform' },
        { name: 'primary_platforms', type: 'text', description: 'Core platforms to focus on' }
      ],
      optional: [
        // Content Planning
        { name: 'content_themes', type: 'text', description: 'Monthly/weekly themes or topics' },
        { name: 'content_pillars', type: 'text', description: 'Core content categories (e.g., 40% educational, 30% promotional, 20% engagement, 10% culture)' },
        { name: 'content_mix', type: 'text', description: 'Video/Image/Text/Link ratio' },
        { name: 'evergreen_content', type: 'text', description: 'Reusable content for filling gaps' },
        
        // Campaign Integration
        { name: 'campaigns', type: 'text', description: 'Major campaigns during this period' },
        { name: 'product_launches', type: 'date', description: 'Product release dates to plan around' },
        { name: 'events', type: 'date', description: 'Company events, webinars, conferences' },
        { name: 'holidays', type: 'date', description: 'Relevant holidays and observances' },
        { name: 'industry_events', type: 'date', description: 'Industry conferences, awareness days' },
        
        // Platform-Specific Planning
        { name: 'linkedin_schedule', type: 'text', description: 'LinkedIn posting times and frequency' },
        { name: 'twitter_schedule', type: 'text', description: 'Twitter posting times and thread days' },
        { name: 'instagram_schedule', type: 'text', description: 'Instagram feed/stories/reels schedule' },
        { name: 'facebook_schedule', type: 'text', description: 'Facebook posts and group activity' },
        { name: 'tiktok_schedule', type: 'text', description: 'TikTok posting and trend participation' },
        { name: 'youtube_schedule', type: 'text', description: 'YouTube video/shorts publishing' },
        
        // Content Details
        { name: 'post_copy', type: 'text', description: 'Pre-written post text for each slot' },
        { name: 'hashtag_sets', type: 'text', description: 'Hashtag groups for different post types' },
        { name: 'visual_assets', type: 'text', description: 'Images/videos needed for each post' },
        { name: 'link_destinations', type: 'url', description: 'URLs for traffic driving posts' },
        { name: 'cta_rotation', type: 'text', description: 'Different CTAs to test throughout period' },
        
        // Team Collaboration
        { name: 'content_owner', type: 'text', description: 'Who creates each piece' },
        { name: 'approval_needed', type: 'text', description: 'Which posts need review' },
        { name: 'design_requests', type: 'text', description: 'Visual assets needed from design team' },
        { name: 'subject_matter_experts', type: 'text', description: 'SMEs needed for content creation' },
        
        // Engagement Planning
        { name: 'community_management', type: 'text', description: 'Response time goals and coverage' },
        { name: 'user_generated_content', type: 'text', description: 'UGC campaigns and reposting schedule' },
        { name: 'influencer_posts', type: 'text', description: 'Influencer collaboration timeline' },
        { name: 'employee_advocacy', type: 'text', description: 'Internal sharing requests' },
        
        // Content Series & Recurring
        { name: 'weekly_series', type: 'text', description: 'Recurring weekly content (e.g., #MondayMotivation)' },
        { name: 'monthly_features', type: 'text', description: 'Monthly recurring posts (e.g., employee spotlight)' },
        { name: 'content_franchises', type: 'text', description: 'Ongoing series with episode numbers' }
      ],
      enhanced: [
        // Performance Tracking
        { name: 'kpi_targets', type: 'text', description: 'Goals for reach, engagement, conversions' },
        { name: 'benchmark_data', type: 'number', description: 'Historical performance to beat' },
        { name: 'competitor_monitoring', type: 'text', description: 'Competitor posts to watch and respond to' },
        { name: 'trend_monitoring', type: 'text', description: 'Trending topics to capitalize on' },
        
        // Budget & Resources
        { name: 'content_budget', type: 'currency', description: 'Budget for content creation' },
        { name: 'paid_promotion_budget', type: 'currency', description: 'Budget for boosting posts' },
        { name: 'tool_requirements', type: 'text', description: 'Scheduling tools, design tools needed' },
        
        // Compliance & Brand
        { name: 'brand_guidelines', type: 'text', description: 'Brand voice, visual standards to follow' },
        { name: 'legal_review_needed', type: 'boolean', description: 'Posts requiring legal approval' },
        { name: 'crisis_protocols', type: 'text', description: 'What to do if crisis occurs during calendar period' },
        
        // Localization
        { name: 'multi_language', type: 'text', description: 'Languages and translation needs' },
        { name: 'regional_adaptation', type: 'text', description: 'Regional content variations' },
        { name: 'time_zone_scheduling', type: 'text', description: 'Multi-timezone posting strategy' },
        
        // Repurposing Strategy
        { name: 'content_repurposing', type: 'text', description: 'How to reuse content across platforms' },
        { name: 'archive_best_performers', type: 'text', description: 'Top content to reuse later' },
        { name: 'content_atomization', type: 'text', description: 'Breaking long-form into social posts' }
      ]
    },
    outputConfig: {
      type: 'workflow',
      template: 'content_calendar_advanced'
    },
    examples: [
      '30-day multi-platform content calendar with campaigns',
      'Quarterly social media plan with themes and series',
      'Product launch content calendar across all channels',
      'Holiday season content strategy and schedule',
      'B2B LinkedIn-focused weekly calendar',
      'Event-driven real-time content calendar',
      'Influencer collaboration content schedule',
      'Global brand with regional content variations'
    ],
    samplePrompt: 'Create 30-day content calendar for B2B SaaS company across LinkedIn, Twitter, and Instagram, with 2 posts per day, focusing on thought leadership and product education'
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    category: 'marketing',
    icon: '📰',
    description: 'Email newsletter with company updates and insights',
    timeEstimate: '15 min',
    popularity: 7,
    dataRequirements: {
      required: [
        { name: 'content_sections', type: 'text', description: 'Newsletter content' }
      ],
      optional: [
        { name: 'recipient_list', type: 'email', description: 'Subscriber emails' },
        { name: 'metrics', type: 'text', description: 'Performance data to share' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'email',
      template: 'newsletter'
    },
    examples: ['Monthly update', 'Product news', 'Industry insights'],
    samplePrompt: 'Create monthly newsletter with product updates and tips'
  }
]

// Sales & Outreach Templates
export const salesTemplates: OutputTemplate[] = [
  {
    id: 'sales_deck',
    name: 'Sales Deck',
    category: 'sales',
    icon: '💼',
    description: 'Customer presentation with value proposition',
    timeEstimate: '20 min',
    popularity: 8,
    dataRequirements: {
      required: [
        { name: 'company_info', type: 'text', description: 'About your company' },
        { name: 'value_proposition', type: 'text', description: 'Key benefits' }
      ],
      optional: [
        { name: 'case_studies', type: 'text', description: 'Success stories' },
        { name: 'pricing', type: 'currency', description: 'Pricing information' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'presentation',
      format: 'slides'
    },
    examples: ['Product demo deck', 'Solution presentation', 'Partnership pitch'],
    samplePrompt: 'Create sales presentation for enterprise software'
  },
  {
    id: 'proposal',
    name: 'Proposal',
    category: 'sales',
    icon: '📋',
    description: 'Business proposal with pricing and terms',
    timeEstimate: '15 min',
    popularity: 7,
    dataRequirements: {
      required: [
        { name: 'client_name', type: 'text', description: 'Client organization' },
        { name: 'scope', type: 'text', description: 'Project scope' },
        { name: 'pricing', type: 'currency', description: 'Cost breakdown' }
      ],
      optional: [
        { name: 'timeline', type: 'text', description: 'Project timeline' },
        { name: 'terms', type: 'text', description: 'Terms and conditions' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'document',
      format: 'pdf'
    },
    examples: ['Consulting proposal', 'Service agreement', 'Project bid'],
    samplePrompt: 'Generate consulting proposal for digital transformation'
  },
  {
    id: 'battlecard',
    name: 'Sales Battlecard',
    category: 'sales',
    icon: '⚔️',
    description: 'Competitive comparison and objection handling',
    timeEstimate: '10 min',
    popularity: 6,
    dataRequirements: {
      required: [
        { name: 'competitor', type: 'text', description: 'Competitor names' },
        { name: 'feature', type: 'text', description: 'Feature comparison' }
      ],
      optional: [
        { name: 'pricing', type: 'currency', description: 'Price comparison' },
        { name: 'strengths', type: 'text', description: 'Our advantages' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'document',
      template: 'battlecard'
    },
    examples: ['Competitor analysis', 'Feature comparison', 'Win/loss analysis'],
    samplePrompt: 'Build battlecard comparing us vs top 3 competitors'
  },
  {
    id: 'cold_outreach',
    name: 'Cold Outreach',
    category: 'sales',
    icon: '❄️',
    description: 'Personalized cold email templates',
    timeEstimate: '5 min',
    popularity: 8,
    dataRequirements: {
      required: [
        { name: 'prospect_name', type: 'text', description: 'Prospect name' },
        { name: 'company', type: 'text', description: 'Target company' }
      ],
      optional: [
        { name: 'pain_point', type: 'text', description: 'Business challenge' },
        { name: 'trigger_event', type: 'text', description: 'Recent news or event' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'email',
      template: 'cold_outreach'
    },
    examples: ['Initial outreach', 'Follow-up sequence', 'Referral request'],
    samplePrompt: 'Write cold email to VP Sales at tech companies'
  }
]

// Presentation Templates
export const presentationTemplates: OutputTemplate[] = [
  {
    id: 'pitch_deck',
    name: 'Pitch Deck',
    category: 'presentations',
    icon: '🚀',
    description: 'Investor presentation with traction and vision',
    timeEstimate: '25 min',
    popularity: 10,
    dataRequirements: {
      required: [
        { name: 'company_name', type: 'text', description: 'Company name' },
        { name: 'problem', type: 'text', description: 'Problem solving' },
        { name: 'solution', type: 'text', description: 'Your solution' }
      ],
      optional: [
        { name: 'market_size', type: 'currency', description: 'TAM/SAM/SOM' },
        { name: 'traction', type: 'text', description: 'Growth metrics' },
        { name: 'team', type: 'text', description: 'Founding team' },
        { name: 'funding_ask', type: 'currency', description: 'Investment needed' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'presentation',
      format: 'slides'
    },
    examples: ['Seed pitch', 'Series A deck', 'Demo day presentation'],
    samplePrompt: 'Create pitch deck for B2B SaaS startup raising Series A'
  },
  {
    id: 'executive_brief',
    name: 'Executive Brief',
    category: 'presentations',
    icon: '📝',
    description: 'One-page summary for C-suite executives',
    timeEstimate: '10 min',
    popularity: 7,
    dataRequirements: {
      required: [
        { name: 'key_points', type: 'text', description: 'Main messages' },
        { name: 'recommendations', type: 'text', description: 'Action items' }
      ],
      optional: [
        { name: 'data_support', type: 'number', description: 'Supporting metrics' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'document',
      format: 'pdf'
    },
    examples: ['Board summary', 'Strategy brief', 'Decision memo'],
    samplePrompt: 'Summarize quarterly results for board meeting'
  },
  {
    id: 'board_deck',
    name: 'Board Deck',
    category: 'presentations',
    icon: '👔',
    description: 'Board meeting presentation with metrics and strategy',
    timeEstimate: '30 min',
    popularity: 6,
    dataRequirements: {
      required: [
        { name: 'metrics', type: 'number', description: 'Key performance metrics' },
        { name: 'period', type: 'date', description: 'Reporting period' }
      ],
      optional: [
        { name: 'initiatives', type: 'text', description: 'Strategic initiatives' },
        { name: 'challenges', type: 'text', description: 'Current challenges' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'presentation',
      format: 'slides'
    },
    examples: ['Quarterly board meeting', 'Annual review', 'Strategic update'],
    samplePrompt: 'Prepare Q4 board deck with financial and operational metrics'
  }
]

// Operations Templates
export const operationsTemplates: OutputTemplate[] = [
  {
    id: 'project_plan',
    name: 'Project Plan',
    category: 'operations',
    icon: '📊',
    description: 'Timeline with milestones and dependencies',
    timeEstimate: '15 min',
    popularity: 7,
    dataRequirements: {
      required: [
        { name: 'task', type: 'text', description: 'Task names' },
        { name: 'start_date', type: 'date', description: 'Start dates' },
        { name: 'end_date', type: 'date', description: 'End dates' }
      ],
      optional: [
        { name: 'assignee', type: 'text', description: 'Responsible person' },
        { name: 'status', type: 'text', description: 'Current status' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'workflow',
      template: 'gantt'
    },
    examples: ['Product roadmap', 'Marketing campaign', 'Construction timeline'],
    samplePrompt: 'Create project plan for website redesign'
  },
  {
    id: 'checklist',
    name: 'Checklist',
    category: 'operations',
    icon: '✅',
    description: 'Task list with verification steps',
    timeEstimate: '5 min',
    popularity: 6,
    dataRequirements: {
      required: [
        { name: 'item', type: 'text', description: 'Checklist items' }
      ],
      optional: [
        { name: 'category', type: 'text', description: 'Group items' },
        { name: 'priority', type: 'text', description: 'Importance level' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'document',
      template: 'checklist'
    },
    examples: ['Launch checklist', 'QA checklist', 'Onboarding steps'],
    samplePrompt: 'Build product launch checklist'
  },
  {
    id: 'workflow',
    name: 'Workflow Diagram',
    category: 'operations',
    icon: '🔄',
    description: 'Process flow visualization with steps and decisions',
    timeEstimate: '10 min',
    popularity: 5,
    dataRequirements: {
      required: [
        { name: 'step_name', type: 'text', description: 'Process steps' },
        { name: 'sequence', type: 'number', description: 'Step order' }
      ],
      optional: [
        { name: 'decision_points', type: 'text', description: 'Decision branches' },
        { name: 'responsible_party', type: 'text', description: 'Who does what' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'workflow',
      template: 'flowchart'
    },
    examples: ['Approval process', 'Customer journey', 'Manufacturing flow'],
    samplePrompt: 'Map out customer onboarding workflow'
  },
  {
    id: 'kanban_board',
    name: 'Kanban Board',
    category: 'operations',
    icon: '📋',
    description: 'Visual task management board',
    timeEstimate: '5 min',
    popularity: 7,
    dataRequirements: {
      required: [
        { name: 'task', type: 'text', description: 'Task names' },
        { name: 'status', type: 'text', description: 'Current status' }
      ],
      optional: [
        { name: 'assignee', type: 'text', description: 'Task owner' },
        { name: 'priority', type: 'text', description: 'Priority level' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'workflow',
      template: 'kanban'
    },
    examples: ['Sprint board', 'Content pipeline', 'Support tickets'],
    samplePrompt: 'Set up kanban board for product development'
  }
]

// Business Documents
export const documentTemplates: OutputTemplate[] = [
  {
    id: 'business_plan',
    name: 'Business Plan',
    category: 'documents',
    icon: '📚',
    description: 'Comprehensive planning document with financials',
    timeEstimate: '30 min',
    popularity: 6,
    dataRequirements: {
      required: [
        { name: 'business_name', type: 'text', description: 'Company name' },
        { name: 'business_model', type: 'text', description: 'How you make money' },
        { name: 'market', type: 'text', description: 'Target market' }
      ],
      optional: [
        { name: 'financial_projections', type: 'currency', description: 'Revenue forecasts' },
        { name: 'competition', type: 'text', description: 'Competitive landscape' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'document',
      format: 'pdf'
    },
    examples: ['Startup business plan', 'Expansion plan', 'Franchise plan'],
    samplePrompt: 'Write business plan for mobile app startup'
  },
  {
    id: 'case_study',
    name: 'Case Study',
    category: 'documents',
    icon: '📖',
    description: 'Customer success story with results',
    timeEstimate: '20 min',
    popularity: 7,
    dataRequirements: {
      required: [
        { name: 'customer_name', type: 'text', description: 'Client name' },
        { name: 'challenge', type: 'text', description: 'Problem faced' },
        { name: 'solution', type: 'text', description: 'How you helped' },
        { name: 'results', type: 'text', description: 'Outcomes achieved' }
      ],
      optional: [
        { name: 'metrics', type: 'number', description: 'Quantified results' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'document',
      format: 'pdf'
    },
    examples: ['Customer success story', 'Implementation case', 'ROI analysis'],
    samplePrompt: 'Create case study showing 40% efficiency improvement'
  },
  {
    id: 'invoice',
    name: 'Invoice',
    category: 'documents',
    icon: '💵',
    description: 'Professional invoice with line items',
    timeEstimate: '5 min',
    popularity: 8,
    dataRequirements: {
      required: [
        { name: 'client_name', type: 'text', description: 'Bill to' },
        { name: 'line_items', type: 'text', description: 'Products/services' },
        { name: 'amounts', type: 'currency', description: 'Prices' }
      ],
      optional: [
        { name: 'due_date', type: 'date', description: 'Payment due' },
        { name: 'tax_rate', type: 'number', description: 'Tax percentage' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'document',
      format: 'pdf'
    },
    examples: ['Service invoice', 'Product invoice', 'Recurring invoice'],
    samplePrompt: 'Generate invoice for consulting services'
  },
  {
    id: 'contract',
    name: 'Contract Template',
    category: 'documents',
    icon: '📜',
    description: 'Legal agreement with terms and conditions',
    timeEstimate: '20 min',
    popularity: 5,
    dataRequirements: {
      required: [
        { name: 'party_names', type: 'text', description: 'Contract parties' },
        { name: 'scope', type: 'text', description: 'Work description' },
        { name: 'terms', type: 'text', description: 'Key terms' }
      ],
      optional: [
        { name: 'payment_terms', type: 'text', description: 'Payment schedule' },
        { name: 'duration', type: 'text', description: 'Contract period' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'document',
      format: 'pdf'
    },
    examples: ['Service agreement', 'NDA', 'Partnership agreement'],
    samplePrompt: 'Draft service agreement for software development'
  }
]

// Automation Templates
export const automationTemplates: OutputTemplate[] = [
  {
    id: 'sms_campaign',
    name: 'SMS Campaign',
    category: 'automation',
    icon: '📱',
    description: 'Text message sequence for mobile outreach',
    timeEstimate: '5 min',
    popularity: 6,
    dataRequirements: {
      required: [
        { name: 'phone_number', type: 'phone', description: 'Recipient numbers' },
        { name: 'message', type: 'text', description: 'SMS content' }
      ],
      optional: [
        { name: 'first_name', type: 'text', description: 'Personalization' },
        { name: 'schedule_time', type: 'date', description: 'Send time' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'workflow' as const,
      template: 'sms'
    },
    examples: ['Appointment reminders', 'Promotions', 'Order updates'],
    samplePrompt: 'Create SMS campaign for appointment reminders'
  },
  {
    id: 'chatbot_script',
    name: 'Chatbot Script',
    category: 'automation',
    icon: '🤖',
    description: 'Conversational flow for automated chat',
    timeEstimate: '15 min',
    popularity: 5,
    dataRequirements: {
      required: [
        { name: 'intents', type: 'text', description: 'User intentions' },
        { name: 'responses', type: 'text', description: 'Bot responses' }
      ],
      optional: [
        { name: 'fallback', type: 'text', description: 'Error handling' },
        { name: 'variables', type: 'text', description: 'Dynamic content' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'workflow' as const,
      template: 'chatbot'
    },
    examples: ['Customer support', 'Lead qualification', 'FAQ bot'],
    samplePrompt: 'Build chatbot script for customer support'
  },
  {
    id: 'api_documentation',
    name: 'API Documentation',
    category: 'automation',
    icon: '🔌',
    description: 'Technical documentation for API endpoints',
    timeEstimate: '20 min',
    popularity: 4,
    dataRequirements: {
      required: [
        { name: 'endpoints', type: 'text', description: 'API endpoints' },
        { name: 'methods', type: 'text', description: 'HTTP methods' },
        { name: 'parameters', type: 'text', description: 'Request params' }
      ],
      optional: [
        { name: 'responses', type: 'text', description: 'Response formats' },
        { name: 'examples', type: 'text', description: 'Code examples' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'document',
      format: 'html'
    },
    examples: ['REST API docs', 'Webhook specs', 'Integration guide'],
    samplePrompt: 'Generate API documentation for customer endpoints'
  }
]

// Combine all templates
export const allOutputTemplates: OutputTemplate[] = [
  ...analyticsTemplates,
  ...marketingTemplates,
  ...salesTemplates,
  ...presentationTemplates,
  ...operationsTemplates,
  ...documentTemplates,
  ...automationTemplates
]

// Helper functions
export function getTemplateById(id: string): OutputTemplate | undefined {
  return allOutputTemplates.find(t => t.id === id)
}

export function getTemplatesByCategory(category: OutputCategory): OutputTemplate[] {
  return allOutputTemplates.filter(t => t.category === category)
}

export function getPopularTemplates(limit: number = 6): OutputTemplate[] {
  return [...allOutputTemplates]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit)
}

// Check if user data matches template requirements
export function checkDataCompatibility(
  userData: Record<string, any>[],
  template: OutputTemplate
): {
  compatible: boolean
  score: number
  missingRequired: DataField[]
  missingOptional: DataField[]
} {
  if (!userData || userData.length === 0) {
    return {
      compatible: false,
      score: 0,
      missingRequired: template.dataRequirements.required,
      missingOptional: template.dataRequirements.optional
    }
  }

  const userColumns = Object.keys(userData[0])
  const { required, optional } = template.dataRequirements

  // Check required fields
  const missingRequired = required.filter(field => 
    !userColumns.some(col => 
      col.toLowerCase().includes(field.name.toLowerCase()) ||
      field.name.toLowerCase().includes(col.toLowerCase())
    )
  )

  // Check optional fields  
  const missingOptional = optional.filter(field =>
    !userColumns.some(col =>
      col.toLowerCase().includes(field.name.toLowerCase()) ||
      field.name.toLowerCase().includes(col.toLowerCase())
    )
  )

  // Calculate compatibility score
  const requiredScore = required.length > 0 
    ? (required.length - missingRequired.length) / required.length 
    : 1
  const optionalScore = optional.length > 0
    ? (optional.length - missingOptional.length) / optional.length
    : 1
  
  const score = Math.round((requiredScore * 0.7 + optionalScore * 0.3) * 100)
  const compatible = missingRequired.length === 0

  return {
    compatible,
    score,
    missingRequired,
    missingOptional
  }
}