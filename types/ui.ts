// UI component prop types

import { ReactNode, MouseEvent, KeyboardEvent, ChangeEvent } from 'react'
import { DataType, Column, Row, Selection } from './spreadsheet'

// Common UI types
export interface BaseComponentProps {
  className?: string
  children?: ReactNode
  id?: string
  'data-testid'?: string
}

// Dialog props
export interface DialogProps extends BaseComponentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  footer?: ReactNode
}

// Sidebar props
export interface SidebarProps extends BaseComponentProps {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  sections?: SidebarSection[]
}

export interface SidebarSection {
  title: string
  items: SidebarItem[]
  collapsible?: boolean
  defaultExpanded?: boolean
}

export interface SidebarItem {
  id: string
  label: string
  icon?: React.ElementType
  onClick?: () => void
  isActive?: boolean
  badge?: string | number
  metadata?: {
    time?: string
    status?: string
    type?: string
  }
}

// Spreadsheet component props
export interface SpreadsheetViewProps extends BaseComponentProps {
  data?: Array<Array<string | number | null>>
  headers?: string[]
  onCellEdit?: (row: number, col: number, value: string) => void
  onColumnAdd?: (name: string, index?: number) => void
  onColumnDelete?: (index: number) => void
  onRowAdd?: (index?: number) => void
  onRowDelete?: (index: number) => void
  readOnly?: boolean
  showToolbar?: boolean
  showFloatingButton?: boolean
}

export interface CellProps {
  value: string | number | null
  rowIndex: number
  columnIndex: number
  isSelected?: boolean
  isEditing?: boolean
  isEnriched?: boolean
  enrichmentStatus?: 'pending' | 'processing' | 'completed' | 'error'
  onChange?: (value: string) => void
  onDoubleClick?: () => void
  onContextMenu?: (event: MouseEvent) => void
  className?: string
}

export interface HeaderCellProps {
  column: Column
  index: number
  isSelected?: boolean
  onResize?: (width: number) => void
  onRename?: (name: string) => void
  onContextMenu?: (event: MouseEvent) => void
  className?: string
}

// Tab component props
export interface TabBarProps extends BaseComponentProps {
  tabs: TabItem[]
  activeTab: string | null
  onTabChange: (tabId: string) => void
  onTabClose?: (tabId: string) => void
  onTabAdd?: () => void
  maxTabs?: number
}

export interface TabItem {
  id: string
  name: string
  icon?: React.ElementType
  type?: 'data' | 'output' | 'analysis'
  isDirty?: boolean
  isClosable?: boolean
}

// Button and input props
export interface ButtonProps extends BaseComponentProps {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit' | 'reset'
  icon?: React.ElementType
  iconPosition?: 'left' | 'right'
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'number' | 'email' | 'password' | 'search'
  value?: string | number
  defaultValue?: string | number
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void
  onBlur?: () => void
  onFocus?: () => void
  error?: string
  label?: string
  hint?: string
}

// Context menu props
export interface ContextMenuProps extends BaseComponentProps {
  trigger: ReactNode
  items: ContextMenuItem[]
  onItemClick?: (itemId: string) => void
}

export interface ContextMenuItem {
  id: string
  label: string
  icon?: React.ElementType
  shortcut?: string
  disabled?: boolean
  separator?: boolean
  submenu?: ContextMenuItem[]
  onClick?: () => void
}

// Card component props
export interface CardProps extends BaseComponentProps {
  title?: string
  description?: string
  icon?: React.ElementType
  actions?: ReactNode
  footer?: ReactNode
  variant?: 'default' | 'bordered' | 'elevated'
  onClick?: () => void
  hoverable?: boolean
}

// Journey card props
export interface JourneyCardProps extends CardProps {
  path: 'find' | 'upload' | 'template'
  isHovered?: boolean
  onHover?: (hovered: boolean) => void
  badge?: string
  estimatedTime?: string
}

// Floating button props
export interface FloatingButtonProps extends BaseComponentProps {
  onClick?: () => void
  icon?: React.ElementType
  label?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  variant?: 'primary' | 'secondary' | 'gradient'
  pulse?: boolean
}

// Progress indicator props
export interface ProgressProps extends BaseComponentProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  variant?: 'linear' | 'circular'
  color?: 'primary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
}

// Toast/notification props
export interface ToastProps {
  id?: string
  title: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  onDismiss?: () => void
}

// Modal/dialog action props
export interface DialogAction {
  label: string
  onClick: () => void | Promise<void>
  variant?: 'primary' | 'secondary' | 'destructive'
  disabled?: boolean
  loading?: boolean
}

// Theme types
export interface Theme {
  mode: 'light' | 'dark' | 'system'
  colors?: Partial<ThemeColors>
  fonts?: Partial<ThemeFonts>
  spacing?: Partial<ThemeSpacing>
}

export interface ThemeColors {
  primary: string
  secondary: string
  background: string
  foreground: string
  muted: string
  accent: string
  error: string
  warning: string
  success: string
  info: string
}

export interface ThemeFonts {
  sans: string
  mono: string
  heading: string
}

export interface ThemeSpacing {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
}