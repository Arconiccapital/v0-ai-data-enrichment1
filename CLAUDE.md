# Lighthouse AI Application

A Next.js application for uploading CSV files and enriching data using AI-powered search and analysis.

## Overview

This application allows users to:
- Upload CSV files via drag-and-drop or file selection
- View data in an interactive spreadsheet interface
- Enrich existing columns or create new columns with AI-generated data
- Export enriched data back to CSV format

Built with v0.app and automatically synced with Vercel deployment.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand
- **AI Integration**: Linkup SDK for data enrichment
- **Package Manager**: pnpm
- **Deployment**: Vercel (auto-synced from v0.app)

## Development Commands

```bash
# Development
pnpm dev          # Start development server on http://localhost:3000

# Building
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint (currently disabled during builds)
```

## Project Structure

```
app/
├── api/enrich/        # AI enrichment API endpoint
├── auth/             # Authentication pages (login, signup, forgot-password)
├── dashboard/        # Main dashboard page
├── (other pages)/    # Contact, FAQ, Help, Legal, Pricing, Settings
├── globals.css       # Global styles
└── layout.tsx        # Root layout with theme provider

components/
├── ui/              # shadcn/ui components (Button, Dialog, etc.)
├── csv-uploader.tsx # File upload with drag-and-drop
├── spreadsheet-view.tsx # Interactive data grid
├── ai-enrichment-dialog.tsx # AI prompt interface
└── theme-provider.tsx # Dark/light theme support

lib/
├── csv-parser.ts     # CSV parsing utilities
├── spreadsheet-store.ts # Zustand store for data management
└── utils.ts          # Utility functions and cn helper
```

## Key Components

### CSV Uploader (`components/csv-uploader.tsx`)
- Drag-and-drop file upload interface
- Progress tracking during file processing
- Error handling for invalid files
- Integrates with spreadsheet store

### Spreadsheet View (`components/spreadsheet-view.tsx`)
- Interactive data grid display
- Column header management
- Cell editing capabilities
- Enrichment status indicators

### AI Enrichment Dialog (`components/ai-enrichment-dialog.tsx`)
- User interface for AI enrichment prompts
- Options to enrich existing columns or create new ones
- Integration with enrichment API

### Spreadsheet Store (`lib/spreadsheet-store.ts`)
- Zustand-based state management
- Handles CSV data, headers, and enrichment status
- Provides methods for data manipulation and AI enrichment
- Sequential row processing with progress tracking

## API Integration

### Enrichment API (`app/api/enrich/route.ts`)
- **Primary**: Linkup SDK for AI-powered data enrichment
- **Fallback**: Mock enrichment for demo purposes
- Supports various enrichment types:
  - Website/URL extraction
  - Email address finding
  - Company categorization
  - Revenue/funding information
  - Location data
  - Employee count estimation

## Code Conventions

### Component Structure
- Use functional components with TypeScript
- Implement proper error boundaries
- Follow shadcn/ui patterns for consistency
- Use `"use client"` directive for client components

### State Management
- Zustand store for global spreadsheet data
- Local useState for component-specific state
- Immutable updates using spread operators

### Styling
- Tailwind CSS with utility classes
- shadcn/ui component variants
- CSS variables for theme consistency
- Responsive design patterns

### File Naming
- kebab-case for component files
- PascalCase for component names
- Descriptive names reflecting functionality

## Development Notes

### v0.app Integration
- Project automatically syncs with v0.app
- Changes deployed via v0 interface push to this repository
- Vercel deployment triggered by repository updates

### Build Configuration
- ESLint errors ignored during builds (`ignoreDuringBuilds: true`)
- TypeScript errors ignored during builds (`ignoreBuildErrors: true`)
- Image optimization disabled (`unoptimized: true`)

### Environment Considerations
- Linkup SDK API key hardcoded (should be moved to environment variables)
- Mock enrichment fallback for development/demo

## Testing

Currently no test framework configured. Consider adding:
- Jest for unit testing
- React Testing Library for component testing
- Playwright or Cypress for E2E testing

## Future Improvements

- Move API keys to environment variables
- Add proper error boundaries
- Implement data validation
- Add export functionality
- Improve accessibility
- Add comprehensive testing suite