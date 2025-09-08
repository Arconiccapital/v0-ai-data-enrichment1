# Home Page Layout & User Experience Flow Documentation

## Layout Structure

### 1. **Landing Page (No Data State)**
The home page presents a clean, professional landing with:

#### Hero Section:
- **Arconic Logo** (200x50px)
- **Main Title**: "Welcome to Lighthouse AI"
- **Tagline**: "Transform your data into anything"

#### Dual-Path Cards (Grid Layout):
Two equal-width cards side-by-side on desktop, stacked on mobile:

**LEFT CARD - Output First Path:**
- Icon: Sparkles in primary color circle
- Title: "I know what I want to create"
- Description: "Start with your desired output and get the perfect data"
- Popular outputs grid (2x2):
  - Dashboard (5 min)
  - Email Campaign (10 min)
  - Report (15 min)
  - Social Post (2 min)
- Perfect when bullets:
  - Need results in minutes
  - Want guided step-by-step process
  - Prefer to see examples first
- CTA: "Choose Output" button → `/create/output`

**RIGHT CARD - Data First Path:**
- Icon: Database in primary color circle
- Title: "I'll start with data"
- Description: "Find or upload data first, then see what you can create"
- Three action buttons:
  - Find Data (Search icon) → Opens FindDataDialog
  - Upload File (Upload icon) → Opens CSV uploader modal
  - Use Template (Database icon) → `/templates`
- Perfect when bullets:
  - Want flexible exploration
  - Need to build comprehensive datasets
  - Have existing data to work with
- CTA: "Start with Data" button → `/create/data`

#### Quick Actions Section:
Three outlined buttons in a row:
- Browse Templates → `/templates`
- Find Data → Opens dialog
- Upload CSV → Opens modal

#### Project Space:
- Tabbed interface (All Projects / Data Projects / Output Projects)
- Grid/List view toggle
- Project cards showing recent work
- Empty state with helpful prompts

### 2. **Main App (With Data Loaded)**

#### Layout Components:
1. **AppNavigation** - Top navigation bar
2. **WorkflowIndicator** - Three-step workflow (Enrich → Generate → Export)
3. **SidebarNav** - Left navigation sidebar
4. **Main Content Area**:
   - TabBar for multiple tabs
   - TabContent (SpreadsheetView or Dashboard)
5. **Context Sidebars** (Right side, conditional):
   - GenerateSidebar (when Generate clicked)
   - ExportSidebar (when Export clicked)

## User Experience Flows

### Flow 1: Output First
1. User clicks "I know what I want to create"
2. Navigates to `/create/output` (OutputGallery)
3. Selects a template (e.g., Social Media Post)
4. Goes to `/create/output/[templateId]`
5. **ColumnMapper** appears:
   - Shows required/optional fields
   - If no data: Prompts to get data → redirects to `/create/data`
   - If has data: Maps columns to template fields
6. Generates content based on mapped data

### Flow 2: Data First
1. User clicks "I'll start with data"
2. Three sub-options:
   a. **Find Data**: Opens dialog → Searches → Loads data
   b. **Upload File**: Opens modal → Uploads CSV → Loads spreadsheet
   c. **Use Template**: Goes to `/templates` → Selects template data
3. Data loads in SpreadsheetView
4. User clicks "Generate" in workflow
5. **GenerateSidebar** opens with two tabs:
   - **Templates Tab**: Select template → ColumnMapper → Generate
   - **Describe It Tab**: Natural language input → AI generates dashboard
6. Creates new tab with output

### Flow 3: Quick Actions
Direct access to common tasks:
- Browse Templates → Template gallery
- Find Data → Search dialog
- Upload CSV → Upload modal

## Key Interactions

### Hover States:
- Cards highlight with primary border and shadow
- Buttons change variant based on hover state
- Interactive elements have smooth transitions

### Modal/Dialog Handling:
- CSV uploader in centered modal with overlay
- FindDataDialog as standalone component
- Proper close buttons and escape handling

### Progressive Disclosure:
- Workflow steps reveal sidebars contextually
- Column mapping only shows when needed
- Templates show requirements before mapping

## Design Principles

1. **Clarity**: Clear visual hierarchy with two distinct paths
2. **Flexibility**: Multiple entry points to same goals
3. **Guidance**: "Perfect when" bullets help users choose
4. **Efficiency**: Popular outputs and quick actions for speed
5. **Context**: Project Space shows recent work for continuity

## Protected Elements

### Must Preserve:
1. Dual-path card structure and messaging
2. Project Space at bottom of landing
3. Workflow indicator for data mode
4. GenerateSidebar's dual tabs (Templates/Describe It)
5. ColumnMapper integration in both flows
6. Modal patterns for CSV upload and data search

### Color Scheme:
- Primary actions: Brand primary color
- Secondary: Outlined buttons
- Hover states: Primary border + shadow
- Background: Gradient from gray-50 to white

## Component Relationships

```
HomePage (app/page.tsx)
├── No Data State
│   ├── AppNavigation
│   ├── Hero Section
│   ├── Dual Path Cards
│   │   ├── Output First → /create/output
│   │   └── Data First → Multiple entry points
│   ├── Quick Actions
│   ├── ProjectSpace
│   └── Modals
│       ├── CSVUploader
│       └── FindDataDialog
│
└── With Data State
    ├── AppNavigation
    ├── WorkflowIndicator
    ├── SidebarNav
    ├── Main Content
    │   ├── TabBar
    │   └── TabContent
    └── Context Sidebars
        ├── GenerateSidebar
        │   ├── Templates Tab → ColumnMapper
        │   └── Describe It Tab → VibeGenerator
        └── ExportSidebar
```

## Integration Points

### Key Components:
- **ColumnMapper** (`components/column-mapper.tsx`): Maps user columns to template fields
- **VibeGenerator** (`components/vibe-generator.tsx`): Natural language dashboard creation
- **GenerateSidebar** (`components/generate-sidebar.tsx`): Dual-mode generation interface
- **ProjectSpace** (`components/project-space.tsx`): Recent work tracking
- **FlexibleTemplates** (`lib/flexible-templates.ts`): Template definitions with abstract fields

### State Management:
- **useSpreadsheetStore**: Central data store
- **hasData**: Determines which view to show
- **tabs/activeTab**: Multi-tab management
- **activeWorkflowStep**: Controls sidebar visibility

This layout ensures users can:
- Start from either data or desired output
- Switch between approaches seamlessly
- Access recent work quickly
- Understand their options clearly
- Complete tasks efficiently