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
    description: 'Engaging content for LinkedIn, Twitter, Instagram',
    timeEstimate: '2 min',
    popularity: 8,
    dataRequirements: {
      required: [
        { name: 'topic', type: 'text', description: 'What to post about' }
      ],
      optional: [
        { name: 'data_points', type: 'text', description: 'Facts or statistics' },
        { name: 'call_to_action', type: 'text', description: 'Desired action' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'social',
      template: 'social_post'
    },
    examples: ['Product announcement', 'Company milestone', 'Industry insight'],
    samplePrompt: 'Create LinkedIn post announcing our Series A funding'
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
    description: 'Social media scheduling and content planning',
    timeEstimate: '10 min',
    popularity: 6,
    dataRequirements: {
      required: [
        { name: 'content_topic', type: 'text', description: 'Content themes' },
        { name: 'publish_date', type: 'date', description: 'Schedule dates' }
      ],
      optional: [
        { name: 'platform', type: 'text', description: 'Social platforms' },
        { name: 'content_type', type: 'text', description: 'Post format' }
      ],
      enhanced: []
    },
    outputConfig: {
      type: 'workflow',
      template: 'content_calendar'
    },
    examples: ['Monthly social calendar', 'Blog schedule', 'Campaign timeline'],
    samplePrompt: 'Plan 30-day social media content calendar'
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
      type: 'automation',
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
      type: 'automation',
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