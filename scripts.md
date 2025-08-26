# Development Scripts

## Quick Start
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Code Quality
```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check

# Format code
npm run format
```

## Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Utility Scripts
```bash
# Clean build artifacts
npm run clean

# Analyze bundle size
npm run analyze

# Check for outdated dependencies
npm run deps:check

# Update dependencies
npm run deps:update
```

## Git Hooks (with Husky)
- Pre-commit: Runs linting and formatting
- Pre-push: Runs tests and type checking

## Environment Setup
1. Copy `.env.example` to `.env.local`
2. Add your API keys:
   - `OPENAI_API_KEY`
   - `LINKUP_API_KEY`

## Recommended VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin
- GitLens