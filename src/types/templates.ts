/**
 * Template types and definitions for spreadsheet generation
 */

export interface TemplateColumn {
  name: string
  type: 'text' | 'number' | 'email' | 'url' | 'date' | 'boolean' | 'currency'
  description?: string
  enrichmentPrompt?: string // Optional prompt for AI enrichment
}

export interface TemplateDefinition {
  id: string
  name: string
  description: string
  icon: string
  category: 'business' | 'research' | 'social' | 'finance' | 'recruiting' | 'real-estate'
  columns: TemplateColumn[]
  sampleData: Record<string, any>[]
}

export type TemplateId = 
  | 'company'
  | 'investor'
  | 'linkedin'
  | 'price-comparison'
  | 'recruiting'
  | 'stock-analysis'
  | 'startup'
  | 'research-papers'
  | 'real-estate'
  | 'twitter-profile'
  | 'waitlist'
  | 'twitter-activity'
  | 'etf'