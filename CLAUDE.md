# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Stefa.Books** - Ukrainian children's library with subscription and rental service built with Next.js 15 App Router, TypeScript, Supabase, and Tailwind CSS. The project includes a public catalog, subscription system, rental system, and admin panel.

## Essential Commands

### Development
```bash
npm run dev          # Start development server on http://localhost:3000
npm run build        # Production build
npm run start        # Start production server
npm run type-check   # TypeScript type checking without build
npm run lint         # ESLint checking
npm run lint:fix     # Auto-fix linting issues
npm run clean        # Clean build artifacts
```

### Testing
```bash
npm run test                   # Run Jest unit tests
npm run test:watch             # Jest in watch mode
npm run test:coverage          # Generate test coverage report (70% threshold)
npm run test:e2e               # Run Playwright E2E tests
npm run test:e2e:ui            # Playwright with UI mode
npm run test:e2e:headed        # Playwright with visible browser
npm run test:performance       # Run performance-specific tests
npm run test:all               # Run all tests (unit + e2e)

# Run single test file
npx jest src/__tests__/components/BookCard.test.tsx
npx jest --watch BookCard  # Watch mode for specific test
```

### Data Import & Management
```bash
cd scripts/
npm install
node quick-import.js        # Import books from Google Sheets -> generates SQL
node auto-upload-covers.js  # Upload book covers to Cloudinary

# Book data management
npm run insert-books        # Insert books directly to database
npm run check-books         # Check book data integrity
npm run delete-added-books  # Remove test/added books

# Style checking
npm run check-styles        # Check code style via script
npm run fix-styles          # Auto-fix style issues
npm run dev-safe            # Check styles before starting dev server
```

### Performance & Analysis
```bash
npm run analyze:bundle      # Analyze bundle size with ANALYZE=true
npm run analyze:performance # Run performance analysis script
```

### Deployment
```bash
npm run vercel:check        # Check Vercel deployment readiness
npm run vercel:deploy       # Deploy to Vercel (preview)
npm run vercel:deploy:prod  # Deploy to production
npm run vercel:deploy:preview # Deploy preview build
```

## Architecture & Key Concepts

### Core Technologies
- **Next.js 15.5.2** with App Router (Server Components by default)
- **React 19.1.1** with new concurrent features
- **TypeScript 5.5.4** in strict mode - avoid `any`, use proper typing
- **Supabase** - PostgreSQL with Row Level Security (RLS) enabled
- **Tailwind CSS 4.0** - utility-first styling with custom design system
- **Cloudinary** - image storage and optimization
- **Zustand 5.0.8** - lightweight state management
- **React Query 5.59.0** - server state management
- **Zod 3.23.8** - schema validation
- **Framer Motion** - animations

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

#### Admin APIs (`src/app/api/admin/`)  
- `/admin/users` - User management
- `/admin/rentals` - Rental management
- `/admin/analytics` - Usage statistics
- `/admin/sync-categories` - Category synchronization

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
- Run `npm run type-check` to isolate TypeScript issues
- Check `BUILD_OPTIMIZATION_REPORT.md` for previous fixes
- Ensure all required environment variables are set

#### Recently Fixed Issues (2025-09-04)
- **Book Page 404 Errors**: Fixed API functions to use absolute URLs for SSR (`src/lib/api/books.ts`)
- **Button Component `asChild` Issue**: Fixed React.cloneElement implementation in Button component
- **Webpack Cache Corruption**: Resolved by `rm -rf .next && npm run clean` and restart
- **English Status Labels**: Replaced with Ukrainian ("✓ Доступна" / "✗ Видана") in BookCard
- **Zero Character Display**: Fixed conditional render `{book.badges?.length && (...)}` → `{book.badges && book.badges.length > 0 && (...)}`

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
- **Data Import**: `scripts/quick-import.js` (Google Sheets to SQL)
- **Style Scripts**: `scripts/check-styles.sh`, `scripts/fix-styles.sh`
- **Documentation**: `SPEED_OPTIMIZATION_PLAN.md`, `FIXES_SUMMARY.md`, `BUILD_OPTIMIZATION_REPORT.md`
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