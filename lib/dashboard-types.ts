import { LucideIcon } from 'lucide-react'

/**
 * Flexible Dashboard Type System
 * Configuration-driven types for building any dashboard
 */

// ============ Data Types ============

export interface DataEntity {
  id: string | number
  name: string
  [key: string]: any  // Allow flexible properties
}

export type MetricType = 
  | 'currency' 
  | 'percentage' 
  | 'number' 
  | 'text' 
  | 'date' 
  | 'boolean'
  | 'url'
  | 'email'

export type ChartType = 
  | 'bar' 
  | 'line' 
  | 'pie' 
  | 'area' 
  | 'scatter'
  | 'bubble'
  | 'radar'
  | 'heatmap'

export type ViewType = 
  | 'overview' 
  | 'financial' 
  | 'performance' 
  | 'details' 
  | 'comparison'
  | 'trends'
  | 'custom'

// ============ Configuration Interfaces ============

export interface MetricConfig {
  key: string
  label: string
  type: MetricType
  format?: (value: any) => string
  icon?: LucideIcon
  color?: string
  unit?: string
  aggregate?: 'sum' | 'avg' | 'max' | 'min' | 'count' | 'latest'
  description?: string
  isCurrency?: boolean
  isPercentage?: boolean
}

export interface ChartConfig {
  id: string
  type: ChartType
  title: string
  dataKey: string | string[]
  xAxisKey?: string
  yAxisKey?: string
  color?: string | string[]
  formatter?: (value: any) => string
  height?: number
  showLegend?: boolean
  showGrid?: boolean
  stacked?: boolean
  valueType?: MetricType
  dataTransform?: (data: any[]) => any[]
}

export interface EntityCardConfig {
  title: (item: DataEntity) => string
  subtitle?: (item: DataEntity) => string
  primaryMetric?: {
    key: string
    format?: (value: any) => string
    label?: string
  }
  secondaryMetrics?: string[]
  badge?: {
    key: string
    format?: (value: any) => string
    color?: (value: any) => string
  }
  image?: {
    key: string
    fallback?: string
  }
  onClick?: (item: DataEntity) => void
}

export interface ViewConfig {
  id: string
  name: string
  icon?: LucideIcon
  description?: string
  charts?: string[]  // Chart IDs to show in this view
  metrics?: string[] // Metric keys to show in this view
  layout?: {
    type: 'grid' | 'flex' | 'masonry'
    columns?: number
  }
}

export interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'multiselect' | 'range' | 'date' | 'search'
  options?: Array<{ label: string; value: any }>
  placeholder?: string
}

export interface DashboardConfig {
  // Basic Info
  title: string
  subtitle?: string
  description?: string
  
  // Data Schema
  dataSchema: {
    primaryKey: string
    metrics: MetricConfig[]
    dimensions: string[]  // Non-metric columns
    relationships?: {
      [key: string]: {
        targetEntity: string
        type: 'one-to-one' | 'one-to-many' | 'many-to-many'
      }
    }
  }
  
  // UI Configuration
  views: ViewConfig[]
  charts: ChartConfig[]
  entityCard: EntityCardConfig
  filters?: FilterConfig[]
  
  // Layout
  layout: {
    type: 'dashboard' | 'grid' | 'flex'
    columns?: number
    spacing?: 'compact' | 'normal' | 'relaxed'
    theme?: 'light' | 'dark' | 'auto'
  }
  
  // Features
  features?: {
    search?: boolean
    export?: boolean
    share?: boolean
    realtime?: boolean
    comparison?: boolean
    drilldown?: boolean
  }
}

// ============ Data Processing Types ============

export interface ProcessedData {
  entities: DataEntity[]
  aggregates: AggregateData
  chartData: ChartData
  insights: Insight[]
  filters: FilterOption[]
}

export interface AggregateData {
  [metricKey: string]: {
    total?: number
    average?: number
    max?: number
    min?: number
    count?: number
    growth?: number
    percentile?: { p50: number; p90: number; p99: number }
  }
}

export interface ChartData {
  [chartId: string]: any[]
}

export interface Insight {
  type: 'top' | 'bottom' | 'trend' | 'anomaly' | 'correlation' | 'comparison'
  title: string
  description: string
  value?: any
  entities?: DataEntity[]
  severity?: 'info' | 'warning' | 'success' | 'error'
  metric?: string
}

export interface FilterOption {
  key: string
  values: any[]
  type: MetricType
}

// ============ State Types ============

export interface DashboardState {
  // Data
  originalData: DataEntity[]
  filteredData: DataEntity[]
  processedData: ProcessedData
  
  // UI State
  selectedEntity: DataEntity | null
  activeView: string
  activeFilters: Record<string, any>
  sortBy: { key: string; direction: 'asc' | 'desc' } | null
  
  // Interactions
  isLoading: boolean
  error: string | null
  expandedCards: Set<string>
  
  // Actions
  setSelectedEntity: (entity: DataEntity | null) => void
  setActiveView: (view: string) => void
  setFilter: (key: string, value: any) => void
  clearFilters: () => void
  setSortBy: (key: string, direction: 'asc' | 'desc') => void
  toggleCardExpansion: (id: string) => void
}

// ============ Component Props Types ============

export interface BaseCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  isSelected?: boolean
  isExpanded?: boolean
  variant?: 'default' | 'outlined' | 'elevated' | 'flat'
}

export interface MetricDisplayProps {
  config: MetricConfig
  value: any
  trend?: number
  comparison?: string
  sparkline?: number[]
  className?: string
}

export interface ChartRendererProps {
  config: ChartConfig
  data: any[]
  className?: string
  interactive?: boolean
  onDataPointClick?: (data: any) => void
}

export interface EntityGridProps {
  entities: DataEntity[]
  cardConfig: EntityCardConfig
  selectedEntity: DataEntity | null
  onSelect: (entity: DataEntity) => void
  columns?: number
  className?: string
}

// ============ Utility Types ============

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type ConfigOverride = DeepPartial<DashboardConfig>

export interface ConfigTemplate {
  id: string
  name: string
  description: string
  category: string
  config: DashboardConfig
  sampleData?: DataEntity[]
}

// ============ Event Types ============

export interface DashboardEvent {
  type: 'select' | 'filter' | 'sort' | 'view_change' | 'export' | 'share'
  payload: any
  timestamp: Date
}

export interface DashboardEventHandler {
  (event: DashboardEvent): void
}