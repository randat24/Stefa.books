# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Stefa.Books** - Ukrainian children's library with subscription and rental service built with Next.js 15 App Router, TypeScript, Supabase, and Tailwind CSS. The project includes a public catalog, subscription system, rental system, and admin panel.

## Essential Commands

### Development
```bash
pnpm run dev         # Start development server on http://localhost:3000
pnpm run build       # Production build
pnpm run start       # Start production server
pnpm run type-check  # TypeScript type checking without build
pnpm run lint        # ESLint checking
pnpm run lint:fix    # Auto-fix linting issues
pnpm run clean       # Clean build artifacts
```

### Testing
```bash
pnpm run test                   # Run Jest unit tests
pnpm run test:watch             # Jest in watch mode
pnpm run test:coverage          # Generate test coverage report (70% threshold)
pnpm run test:e2e               # Run Playwright E2E tests
pnpm run test:e2e:ui            # Playwright with UI mode
pnpm run test:e2e:headed        # Playwright with visible browser
pnpm run test:performance       # Run performance-specific tests
pnpm run test:all               # Run all tests (unit + e2e)

# Run single test file
pnpm exec jest src/__tests__/components/BookCard.test.tsx
pnpm exec jest --watch BookCard  # Watch mode for specific test
```

### Data Import & Management
```bash
cd scripts/
npm install
node quick-import.js        # Import books from Google Sheets -> generates SQL
node auto-upload-covers.js  # Upload book covers to Cloudinary

# Book data management
pnpm run insert-books        # Insert books directly to database
pnpm run check-books         # Check book data integrity
pnpm run delete-added-books  # Remove test/added books

# Style checking
pnpm run check-styles        # Check code style via script
pnpm run fix-styles          # Auto-fix style issues
pnpm run dev-safe            # Check styles before starting dev server
```

### Performance & Analysis
```bash
pnpm run analyze:bundle      # Analyze bundle size with ANALYZE=true
pnpm run analyze:performance # Run performance analysis script
node scripts/bundle-analyzer.js        # Comprehensive bundle analysis
node scripts/find-unused-imports.js    # Find optimization opportunities
```

### Deployment
```bash
# New automated deployment commands (recommended)
pnpm run deploy:check        # Run comprehensive pre-deployment checks
pnpm run deploy              # Deploy preview build
pnpm run deploy:prod         # Deploy to production with safety checks

# Legacy Vercel commands (still supported)
pnpm run vercel:check        # Check Vercel deployment readiness
pnpm run vercel:deploy       # Deploy to Vercel (preview)
pnpm run vercel:deploy:prod  # Deploy to production
pnpm run vercel:deploy:preview # Deploy preview build

# Manual Vercel CLI
vercel                       # Preview deployment
vercel --prod                # Production deployment
```

## Architecture & Key Concepts

### Core Technologies
- **Next.js 15.5.2** with App Router (Server Components by default)
- **React 19.1.1** with new concurrent features
- **TypeScript 5.5.4** in strict mode - avoid `any`, use proper typing
- **Supabase** - PostgreSQL with Row Level Security (RLS) enabled
- **Tailwind CSS 4.1.13** - utility-first styling with custom design system and CSS-based configuration
- **Cloudinary** - image storage and optimization
- **Zustand 5.0.8** - lightweight state management
- **React Query 5.59.0** - server state management
- **Zod 3.23.8** - schema validation
- **Framer Motion** - animations (with dynamic loading optimization)
- **web-vitals 5.1.0** - Core Web Vitals tracking

### Database Schema
All types exported from `src/lib/database.types.ts` (auto-generated from Supabase):
- `books` - Main catalog with fields: id, code, title, author, category, cover_url, price_uah, available, etc.
- `categories` - Hierarchical category system
- `subscription_requests` - User subscription applications  
- `rental_requests` - Book rental applications
- RLS policies protect all tables - public read access, admin write access

### Key Architecture Patterns

#### Supabase Integration
```typescript
// Always use typed client from src/lib/supabase.ts
import { supabase } from '@/lib/supabase';
import type { Book, Category } from '@/lib/supabase';

// For RPC calls requiring type assertions
const { data } = await (supabase as any).rpc('search_books', { query_text: 'test' });
```

#### Caching System
- **APICache** - in-memory cache with TTL (`src/lib/cache.ts`)
- **SSR Cache** - server-side rendering cache (`src/lib/ssr-cache.ts`)  
- **Redis Cache** - optional distributed cache (`src/lib/redis-cache.ts`)
- Cache keys generated via `APICache.createKey()` method

#### Error Handling
- **ErrorHandler** (`src/lib/error-handler.ts`) - centralized error processing
- **Logger** (`src/lib/logger.ts`) - structured logging with categories
- **Error Tracking Hook** (`src/lib/hooks/useErrorTracking.ts`) - React hook for error tracking
- Always wrap API calls in try-catch blocks

#### State Management
- **Zustand Store** (`src/store/ui.ts`) - UI state management for subscription plans
- **React Query** - server state, data fetching and caching
- **Optimized Queries Hook** (`src/lib/hooks/useOptimizedQuery.ts`) - performance-optimized queries

### Component Organization

#### UI Components (`src/components/ui/`)
Based on shadcn/ui with custom variants:
- **Button**: sizes `sm|md|lg`, variants `primary|secondary|dark|outline`
- **Badge**: variants for different categories and statuses
- **OptimizedBookImage** - Performance-optimized image component with lazy loading and Intersection Observer
- **LazySection** - Lazy loading wrapper for sections using Intersection Observer
- **PaginationControls** - Classic pagination with ellipsis support and page navigation
- **LoadMoreButton** - Incremental book loading with loading states
- **PerformanceOptimizer** - Performance monitoring and optimization component
- All components use `class-variance-authority` for consistent styling

#### Business Components (`src/components/`)
- **BookCard** - Main book display component with hover effects (350px height, Ukrainian status labels)
- **BookCardSimple** - Simplified book card for recommendations and similar books
- **BookPreviewModal** - Detailed book view modal
- **BookImageGallery** - Book cover image display with optimization
- **BookSpecifications** - Book metadata and technical details
- **BookReviews** - User reviews and ratings display 
- **BookReadingSample** - Book excerpt/sample content viewer
- **BookShareMenu** - Social media sharing menu for books
- **BookOrderFlow** - 3-step order process (subscription → delivery → confirmation)
- **DeliveryMethodSelector** - Delivery method selection component
- **OrderConfirmationForm** - Final order details and confirmation
- **Header** - Navigation with search functionality
- **RentalForm** - Book rental request form with validation

#### Catalog Components (`src/components/catalog/`)
- **BooksCatalog** - Advanced catalog with pagination and filtering
- **CatalogSearchFilter** - Complex search filters (text, category, author, availability, rating)

#### SEO Components (`src/components/seo/`)
- **BookStructuredData** - JSON-LD structured data for individual books
- **OrganizationStructuredData** - Organization schema markup
- **SubscriptionStructuredData** - Subscription service schema markup
- **BreadcrumbStructuredData** - Breadcrumb navigation schema markup
- **CanonicalAndHreflang** - Canonical URLs and language variants

#### Admin Components (`src/app/admin/components/`)
- **AnalyticsDashboard** - Usage statistics and metrics
- **UsersTable** - User management interface
- **RentalsTable** - Rental request management

### API Structure

#### Public APIs (`src/app/api/`)
- `GET /api/books` - Book catalog with filtering (category, search, availability, pagination)
- `GET /api/categories` - Category hierarchy
- `POST /api/subscribe` - Subscription requests
- `POST /api/rent` - Rental requests
- `GET /api/sitemap` - Dynamic XML sitemap generation for SEO
- `GET /api/test-books` - Test book data endpoint for development
- `POST|GET /api/markdown` - HTML to Markdown conversion service with mdream
- `GET /api/books/[id]/markdown` - Generate markdown version of book pages
- `GET /api/llms.txt` - AI discoverability file generation

#### Admin APIs (`src/app/api/admin/`)  
- `/admin/users` - User management
- `/admin/rentals` - Rental management
- `/admin/analytics` - Usage statistics
- `/admin/sync-categories` - Category synchronization

### Markdown & AI Integration (mdream)

#### HTML to Markdown Conversion
- **mdream Library** (`^0.10.1`) - High-quality HTML to Markdown conversion optimized for AI/LLM processing
- **Core Utility** (`src/lib/mdream.ts`) - Comprehensive utilities for markdown conversion with caching
- **Middleware Routing** (`src/middleware.ts`) - Automatic .md URL routing for book pages

#### Key Features
- **Auto-generated Book Markdown**: Access any book page as markdown by adding `.md` extension
  ```
  /books/[id].md → Automatic markdown generation
  ```
- **API Endpoints**:
  - `POST /api/markdown` - Convert HTML content to markdown
  - `GET /api/markdown?url=...&format=text` - Convert URL to markdown
  - `GET /api/books/[id]/markdown` - Generate markdown version of specific book
- **AI Discoverability**: `GET /api/llms.txt` - Auto-generated AI discovery file with site structure
- **Caching**: 1-hour cache for markdown conversions with configurable TTL
- **Fallback Support**: Graceful degradation with simple markdown if mdream fails

#### Usage Examples
```typescript
import { convertHtmlToMarkdown, generateLlmsTxt } from '@/lib/mdream';

// Convert HTML to markdown
const result = await convertHtmlToMarkdown(htmlContent, {
  minimal: true,
  title: 'Document Title',
  origin: 'https://example.com',
  metadata: { author: 'Author Name' }
});

// Generate llms.txt for AI discoverability
const llmsTxt = await generateLlmsTxt([
  { url: '/page1', title: 'Page 1', description: 'Description' }
]);
```

#### URL Patterns
- `/books/681bf8ad-736c-48a5-8247-a259ca530736.md` - Book markdown version
- `/api/llms.txt` - AI discovery file
- `/api/markdown?url=https://example.com&format=text` - URL to markdown

### Testing Patterns

#### Jest Configuration
- Uses `@testing-library/react` for component testing
- Custom Jest matchers in `src/__tests__/jest-setup.d.ts`
- Mock Supabase client with type assertions
- Test files must import `Book` type from `@/lib/supabase` (not deprecated types)
- **Coverage threshold: 70%** for branches, functions, lines, statements
- Coverage excludes layout files, loading components, and CSS files

#### Book Test Data Structure
```typescript
const mockBook: Book = {
  id: 'test-1', code: 'TEST-001', title: 'Test Book',
  author: 'Test Author', category: 'Test Category',
  cover_url: '/test.jpg', price_uah: 299, available: true,
  // ... all required database fields
};
```

## Development Workflow

### Environment Setup
Required environment variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Code Standards (from .cursorrules)
- **Language**: Ukrainian for UI text and comments
- **File Naming**: PascalCase for components, kebab-case for routes
- **Imports**: Use `@/` path mapping for src imports
- **TypeScript**: Strict mode enabled - no `any` without type assertion justification
- **Styling**: Tailwind utility-first, custom styles in `src/app/globals.css`
- **Server Components**: Default pattern, use `'use client'` only when necessary
- **UI Focus**: Simple, child-friendly design with mobile-first approach
- **Component Structure**: Hooks first, effects second, handlers third
- **Validation**: Use Zod for both client and server-side validation

### Common Issues & Solutions

#### TypeScript Errors
- Use type assertions for Supabase RPC: `(supabase as any).rpc()`
- Import Book type from `@/lib/supabase`, not deprecated type files
- Use `cover_url` not `cover`, `price_uah` not `price`, `short_description` not `short`

#### Cache Issues
- Clear Next.js cache: `npm run clean && npm run build`
- Check cache TTL settings in `src/lib/cache.ts`
- Use `APICache.createKey()` for consistent cache key generation

#### Build Failures
- Run `pnpm run type-check` to isolate TypeScript issues
- **Known Issue**: TypeScript may show errors for `.js` modules - this is resolved in production builds via `next.config.js` settings
- Check `BUILD_OPTIMIZATION_REPORT.md` and `DEPLOYMENT_DOCUMENTATION.md` for previous fixes
- Ensure all required environment variables are set
- Use `pnpm run deploy:check` for comprehensive build readiness verification

### Cache Management

#### Предотвращение проблем с кешем Next.js
Для предотвращения проблем с кешем Next.js (например, ошибки "Cannot find module" для .js файлов) настроена автоматическая система очистки:

**Доступные команды:**
- `pnpm run clean:cache` - Очистка кеша Next.js и Node.js
- `pnpm run clean` - Полная очистка всех сборочных файлов
- `pnpm run clean:full` - Полная очистка + переустановка зависимостей

**Автоматическая очистка:**
- При каждом `pnpm run dev` и `pnpm run build` автоматически очищается кеш
- Pre-push git hook очищает кеш перед отправкой в репозиторий

**Файлы в .gitignore:**
- `.next/cache/` - кеш Next.js
- `.next/types/` - типы Next.js
- `node_modules/.cache/` - кеш Node.js модулей

**Если возникают проблемы с кешем:**
1. Запустите `pnpm run clean:cache`
2. Если не помогает: `pnpm run clean:full`
3. В крайнем случае: удалите `node_modules` и `.next` вручную, затем `pnpm install`

#### Recently Fixed Issues (2025-09-05)
- **Major TypeScript Cleanup**: Resolved 76+ TypeScript errors across the entire codebase
- **Database Schema Mismatches**: Fixed inconsistent field names (amount_uah→amount, payment_date→created_at, returned_at→return_date)
- **Button Component Enhancement**: Added missing size variant "sm" and "destructive" variant
- **ResponsiveImage Component**: Added width/height props support and fixed duplicate identifier issues
- **Framer Motion Animation**: Fixed ease property type compatibility with proper TypeScript casting
- **Accessibility Improvements**: Fixed HTMLElement type casting in accessibility utilities
- **Admin Components**: Created missing placeholder components (NotificationsPanel, AddBookDialog, EditBookDialog)
- **Jest Test Setup**: Fixed IntersectionObserver mock with proper TypeScript interface implementation
- **User Management**: Replaced missing last_login field with updated_at/created_at fallbacks
- **Performance Optimizations**: Fixed Element/HTMLImageElement type compatibility in lazy loading utilities
- **Tailwind CSS v4.1 Upgrade**: Migrated from v3.4.17 to v4.1.13 with CSS-based configuration
- **mdream Integration**: Added comprehensive HTML to Markdown conversion with AI discoverability features
- **Package Manager Migration**: Migrated from npm to pnpm for 33x faster installs and improved performance
- **SSR Markdown Generation**: Resolved server-side rendering issues for book markdown endpoints

### Tailwind CSS v4.1 Configuration

#### New CSS-based Configuration Pattern
In Tailwind v4.1, configuration moved from JavaScript (`tailwind.config.ts`) to CSS:

```css
@import 'tailwindcss';
@plugin '@tailwindcss/forms';

@theme {
  /* Custom colors */
  --color-brand: #0B1220;
  --color-brand-yellow: #eab308;
  
  /* Custom spacing */
  --spacing-18: 4.5rem;
  --spacing-88: 22rem;
  
  /* Container configuration */
  --container-center: true;
  --container-padding: 1rem;
}

@utility btn-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* ... more styles */
}
```

#### Key v4.1 Improvements
- **5x faster builds**: New high-performance engine
- **100x faster incremental builds**: Optimized caching
- **Zero configuration**: Automatic content detection
- **CSS-based configuration**: More intuitive theme customization
- **Better plugin system**: `@plugin` directive instead of JavaScript config
- **Modern browser focus**: Targets Safari 16.4+, Chrome 111+, Firefox 128+

#### Migration Notes
- PostCSS plugin moved to `@tailwindcss/postcss`
- Custom utilities use `@utility` instead of `@apply` in layers
- Plugins imported via `@plugin` in CSS instead of JS config
- Container queries and modern CSS features built-in

### Performance Considerations
- **Advanced Image Optimization**: Cloudinary integration with lazy loading, Intersection Observer API, and WebP/AVIF formats
- **Performance Monitoring**: Web Vitals tracking with PerformanceOptimizer component
- **Memory Management**: EfficientMap and EfficientCache for optimized data structures
- **Request Optimization**: Debouncing, throttling, and connection pooling
- **Font Optimization**: Preload critical fonts with fallback strategies
- **Resource Preloading**: Predictive preloading based on user behavior
- **Lazy Loading**: LazySection component for non-critical content
- **Server Components**: Used by default (add `'use client'` only when needed)
- **Database queries**: Cached with configurable TTL via APICache system
- **Bundle analysis**: Available via `npm run analyze:bundle`
- **Tailwind v4.1 Speed**: Up to 5x faster CSS generation and 100x faster incremental builds

## Key File Locations
- **Database Types**: `src/lib/database.types.ts` (auto-generated from Supabase)
- **Supabase Config**: `src/lib/supabase.ts` (typed client with RLS)
- **Cache System**: `src/lib/cache.ts` (APICache), `src/lib/ssr-cache.ts` (SSR), `src/lib/redis-cache.ts` (optional)
- **Error Handling**: `src/lib/error-handler.ts` (ErrorHandler class)
- **State Management**: `src/store/ui.ts` (Zustand store for UI state)
- **Custom Hooks**: `src/lib/hooks/` (useErrorTracking, useOptimizedQuery, useImageOptimization)
- **Performance Optimization**: `src/lib/image-optimization.ts`, `src/lib/font-optimization.ts`, `src/lib/memory-optimization.ts`
- **Intersection Observer**: `src/lib/intersection-observer.ts` (lazy loading utility)
- **SEO Utilities**: `src/lib/site.ts` (site configuration and metadata)
- **Markdown Integration**: `src/lib/mdream.ts` (HTML to Markdown conversion utilities)
- **AI Discovery**: `src/app/api/llms.txt/route.ts` (AI discoverability file generation)
- **Book Markdown API**: `src/app/api/books/[id]/markdown/route.ts` (book-specific markdown generation)
- **Markdown Conversion API**: `src/app/api/markdown/route.ts` (general HTML to Markdown service)
- **Data Import**: `scripts/quick-import.js` (Google Sheets to SQL)
- **Style Scripts**: `scripts/check-styles.sh`, `scripts/fix-styles.sh`
- **Documentation**: `SPEED_OPTIMIZATION_PLAN.md`, `FIXES_SUMMARY.md`, `BUILD_OPTIMIZATION_REPORT.md`
- **Deployment**: `DEPLOYMENT_DOCUMENTATION.md`, `DEPLOYMENT_SUCCESS_SUMMARY.md` (comprehensive deployment guides)
- **Scripts**: `scripts/deployment-checklist.sh`, `scripts/deploy.sh` (automated deployment tools)
- **Jest Config**: `jest.config.js` (70% coverage threshold, custom matchers)
- **Order System**: `src/app/books/[id]/order/` (book ordering pages and components)
- **Book Components**: `src/components/Book*` (BookImageGallery, BookSpecifications, BookReviews, etc.)
- **Catalog System**: `src/components/catalog/` (BooksCatalog, CatalogSearchFilter)
- **SEO Components**: `src/components/seo/` (structured data and metadata components)

## Project-Specific Patterns

### Advanced Catalog Features
```typescript
// BooksCatalog with pagination and advanced search
import { BooksCatalog } from '@/components/catalog/BooksCatalog';
import { CatalogSearchFilter } from '@/components/catalog/CatalogSearchFilter';

// Pagination with classic controls and load-more functionality
<BooksCatalog initialBooks={books} />
// Includes: search debouncing (500ms), category/author filters, availability filter, rating filter
```

### Performance Optimization Patterns
```typescript
// Optimized image component with lazy loading
import { OptimizedBookImage } from '@/components/ui/OptimizedBookImage';

<OptimizedBookImage 
  src={book.cover_url} 
  alt={book.title}
  priority={false} // Uses Intersection Observer for lazy loading
/>

// Lazy loading sections
import { LazySection } from '@/components/ui/LazySection';

<LazySection>
  <ExpensiveComponent />
</LazySection>
```

### SEO Implementation Patterns
```typescript
// Structured data for books
import { BookStructuredData } from '@/components/seo/BookStructuredData';

<BookStructuredData book={book} />
// Generates JSON-LD with book metadata, ratings, publisher info

// Dynamic sitemap generation
// Automatically generates XML sitemap at /api/sitemap
```

### Subscription Plans State
```typescript
import { useUIStore } from '@/store/ui';

const { selectedPlan, setSelectedPlan } = useUIStore();
// Plans: "mini" | "maxi" | null
```

### Form Validation Pattern
```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

const form = useForm({
  resolver: zodResolver(schema),
});
```

### Book Sharing Integration
```typescript
// Social media sharing for books
import { BookShareMenu } from '@/components/BookShareMenu';

<BookShareMenu 
  title={book.title} 
  author={book.author} 
  url={bookUrl}
/>
// Supports: copy link, Facebook, Twitter, email, messaging apps
```

## Deployment Architecture

### Production Environment
- **Platform**: Vercel
- **Domain**: https://stefa-books.com.ua
- **Build Configuration**: TypeScript errors ignored during build (resolved via next.config.js)
- **Environment Variables**: All critical variables configured in Vercel dashboard
- **Automatic Deployment**: Triggered on push to main branch

### Deployment Scripts & Safety Measures
- **Pre-deployment Validation**: `scripts/deployment-checklist.sh` verifies git status, dependencies, environment variables, and code quality
- **Automated Deployment**: `scripts/deploy.sh` handles full deployment pipeline with safety prompts for production
- **Error Prevention**: Comprehensive checks prevent deployment of broken builds

### Known Deployment Issues & Solutions
1. **TypeScript Build Errors**: Local builds may fail due to Next.js looking for `.js` files instead of `.tsx`. This is resolved in production via `next.config.js` configuration that ignores TypeScript errors during build.

2. **Cache Problems**: Resolved via automatic cache cleaning in deployment scripts and `pnpm run clean:cache` command.

3. **Environment Variables**: Critical variables automatically validated before deployment.

### Package Manager Migration
- **Current**: pnpm (33x faster than npm)
- **Installation**: All dependencies optimized for pnpm
- **Scripts**: All package.json scripts use pnpm commands