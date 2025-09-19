# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Stefa.Books** - Ukrainian children's library with subscription and rental service built with Next.js 15 App Router, TypeScript, Supabase, and Tailwind CSS. The project includes a public catalog, subscription system, rental system, and admin panel.

## Essential Commands

### Development
```bash
npm run dev         # Start development server on http://localhost:3000
npm run build       # Production build
npm run build:fix   # Production build with fixes
npm run start       # Start production server
npm run type-check  # TypeScript type checking without build
npm run lint        # ESLint checking
npm run lint:fix    # Auto-fix linting issues
npm run clean       # Clean build artifacts
npm run ts:restart  # Restart TypeScript server
npm run fix:react-types # Fix React type issues
```

### Testing
```bash
npm run test                   # Run Vitest unit tests
npm run test:watch             # Vitest in watch mode
npm run test:coverage          # Generate test coverage report (70% threshold)
npm run test:ui                # Vitest with UI mode
npm run test:e2e               # Run Playwright E2E tests
npm run test:e2e:ui            # Playwright with UI mode
npm run test:e2e:headed        # Playwright with visible browser
npm run test:performance       # Run performance-specific tests
npm run test:all               # Run all tests (unit + e2e)

# Run single test file with Vitest
npx vitest run src/__tests__/components/BookCard.test.tsx
npx vitest --watch BookCard  # Watch mode for specific test
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
node scripts/bundle-analyzer.js        # Comprehensive bundle analysis
node scripts/find-unused-imports.js    # Find optimization opportunities
```

### Deployment
```bash
# New automated deployment commands (recommended)
npm run deploy:check        # Run comprehensive pre-deployment checks
npm run deploy              # Deploy preview build
npm run deploy:prod         # Deploy to production with safety checks

# Legacy deployment commands (deprecated)
# Note: All deployment now uses Netlify
```

### Netlify Deployment (Current Production)
```bash
# Netlify CLI commands
netlify status               # Check site and deployment status
netlify deploy               # Deploy preview
netlify deploy --prod        # Deploy to production
netlify build               # Build locally with Netlify environment

# Environment management
netlify env:list            # List environment variables
netlify env:set KEY "value" # Set environment variable
netlify env:unset KEY       # Remove environment variable

# Site management
netlify open:site           # Open deployed site
netlify open:admin          # Open Netlify dashboard
netlify logs                # View function logs

# Domain management
netlify domains:list        # List domains
netlify domains:create      # Add custom domain
```

### Emergency & Troubleshooting
```bash
npm run emergency           # Emergency fix script
npm run emergency:quick     # Quick emergency fixes
npm run emergency:full      # Full emergency fixes with rebuild
npm run emergency:rollback  # Rollback to previous working state
npm run pre-commit          # Run pre-commit checks manually
npm run dev:workflow        # Development workflow script
```

## Architecture & Key Concepts

### Core Technologies
- **Next.js 15.5.3** with App Router (Server Components by default)
- **React 19.1.1** with new concurrent features
- **TypeScript 5.5.4** in strict mode - avoid `any`, use proper typing
- **Supabase** - PostgreSQL with Row Level Security (RLS) enabled
- **Tailwind CSS 3.4.17** - utility-first styling with custom design system
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

#### Payment Components (`src/components/payment/`)
- **MonobankPayment** - Complete payment flow UI component with real/demo modes
- **MonobankInfo** - Dashboard showing API status and account information
- **PaymentCheckout** - General payment checkout interface
- **SubscriptionManager** - Subscription plan management
- **SubscriptionPlans** - Plan selection and pricing display

#### Admin Components (`src/app/admin/components/`)
- **AnalyticsDashboard** - Usage statistics and metrics
- **UsersTable** - User management interface
- **RentalsTable** - Rental request management

#### Specialized Component Directories
- **Accessibility** (`src/components/accessibility/`) - ARIA, keyboard navigation, screen reader support
- **Analytics** (`src/components/analytics/`) - Tracking and metrics components
- **Auth** (`src/components/auth/`) - Authentication flows and user management
- **Animations** (`src/components/animations/`) - Framer Motion animation components

### API Structure

#### Public APIs (`src/app/api/`)
- `GET /api/books` - Book catalog with filtering (category, search, availability, pagination)
- `GET /api/categories` - Category hierarchy
- `GET /api/age-categories` - Age category management
- `POST /api/subscribe` - Subscription requests
- `POST /api/rent` - Rental requests
- `GET /api/sitemap` - Dynamic XML sitemap generation for SEO
- `GET /api/test-books` - Test book data endpoint for development
- `POST|GET /api/markdown` - HTML to Markdown conversion service with mdream
- `GET /api/books/[id]/markdown` - Generate markdown version of book pages
- `GET /api/llms.txt` - AI discoverability file generation
- `GET /api/cache` - Cache management and monitoring
- `GET /api/analytics` - Analytics data and metrics

#### Payment APIs (`src/app/api/payments/`)
- `POST /api/payments/monobank` - Create Monobank payment
- `GET /api/payments/monobank?invoice_id=...` - Check payment status
- `POST /api/payments/monobank/webhook` - Handle payment webhooks
- `GET /api/monobank/client-info` - Monobank client information
- `GET /api/monobank/statement` - Account statements

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

#### Vitest Configuration
- Uses `@testing-library/react` for component testing
- Mock Supabase client with type assertions
- Test files must import `Book` type from `@/lib/supabase` (not deprecated types)
- **Coverage threshold: 70%** for branches, functions, lines, statements
- Coverage excludes layout files, loading components, and CSS files
- Jest config exists for compatibility but Vitest is the active testing framework

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
# Core Services
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Image Storage
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payment System (Monobank) - REQUIRED FOR PRODUCTION
MONOBANK_TOKEN=your_real_monobank_token_here

# ВАЖЛИВО:
# 1. Токен обов'язковий для роботи системи оплати
# 2. Отримайте токен в особистому кабінеті Monobank для бізнесу
# 3. Демо-режим ВІДКЛЮЧЕНО - тільки реальні платежі
# 4. Без токена система видасть помилку при ініціалізації

# Site Configuration
NEXT_PUBLIC_SITE_URL=your_site_url
ADMIN_JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin_email
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
- **Known Issue**: TypeScript may show errors for `.js` modules - this is resolved in production builds via `next.config.js` settings
- Check `BUILD_OPTIMIZATION_REPORT.md` and `DEPLOYMENT_DOCUMENTATION.md` for previous fixes
- Ensure all required environment variables are set
- Use `npm run deploy:check` for comprehensive build readiness verification

### Cache Management

#### Предотвращение проблем с кешем Next.js
Для предотвращения проблем с кешем Next.js (например, ошибки "Cannot find module" для .js файлов) настроена автоматическая система очистки:

**Доступные команды:**
- `npm run clean:cache` - Очистка кеша Next.js и Node.js
- `npm run clean` - Полная очистка всех сборочных файлов
- `npm run clean:full` - Полная очистка + переустановка зависимостей

**Автоматическая очистка:**
- При каждом `npm run dev` и `npm run build` автоматически очищается кеш
- Pre-push git hook очищает кеш перед отправкой в репозиторий

**Файлы в .gitignore:**
- `.next/cache/` - кеш Next.js
- `.next/types/` - типы Next.js
- `node_modules/.cache/` - кеш Node.js модулей

**Если возникают проблемы с кешем:**
1. Запустите `npm run clean:cache`
2. Если не помогает: `npm run clean:full`
3. В крайнем случае: удалите `node_modules` и `.next` вручную, затем `npm install`

#### Recently Fixed Issues (2025-09-16)
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
- **Tailwind CSS**: Currently using v3.4.17 with traditional configuration
- **mdream Integration**: Added comprehensive HTML to Markdown conversion with AI discoverability features
- **Testing Framework**: Uses Vitest instead of Jest for faster, more modern testing experience
- **SSR Markdown Generation**: Resolved server-side rendering issues for book markdown endpoints

### Tailwind CSS Configuration

#### Current Configuration (v3.4.17)
The project uses traditional Tailwind CSS configuration with JavaScript config files. Custom styles are managed through:
- `src/app/globals.css` - Global styles and Tailwind directives
- Traditional `tailwind.config.js` - Theme customization and plugins
- CSS variables for consistent design tokens

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
- **Traditional Tailwind CSS**: v3.4.17 with standard configuration and build process

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
- **Payment Integration**: `src/lib/services/monobank.ts` (Monobank API service)
- **Payment Types**: `src/lib/types/monobank.ts` (payment system type definitions)
- **Payment APIs**: `src/app/api/payments/monobank/` (payment creation and webhook handling)
- **Payment Components**: `src/components/payment/` (MonobankPayment, MonobankInfo, payment UI)

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

### Payment System Integration (Monobank)

#### Service Layer
```typescript
// Core payment service
import { monobankService } from '@/lib/services/monobank';

// Create payment
const payment = await monobankService.createPayment({
  amount: 500,
  description: 'Підписка на книги',
  reference: `order-${Date.now()}`,
  redirectUrl: 'https://site.com/payment/success',
  webhookUrl: 'https://site.com/api/payments/monobank/webhook'
});

// Check payment status
const status = await monobankService.checkPaymentStatus(invoiceId);
```

#### UI Components
```typescript
// Payment component with auto-switching real/demo modes
import { MonobankPayment } from '@/components/payment/MonobankPayment';

<MonobankPayment
  amount={500}
  description="Підписка Maxi"
  currency="UAH"
  customerEmail="user@example.com"
  customerName="Іван Петров"
  onPaymentSuccess={(data) => {
    console.log('Payment successful:', data);
    router.push('/payment/success');
  }}
  onPaymentError={(error) => {
    console.error('Payment failed:', error);
  }}
/>

// Account information dashboard
import { MonobankInfo } from '@/components/payment/MonobankInfo';
<MonobankInfo /> // Shows API status, accounts, transactions
```

#### Payment Flow Architecture
1. **Token-based Authentication**: Single `MONOBANK_TOKEN` supports both personal and merchant APIs
2. **Automatic Mode Detection**: Real payments if API configured, demo mode otherwise
3. **Database Integration**: Uses existing `payments` table with proper field mapping
4. **Webhook Processing**: Automatic payment status updates via webhook endpoints
5. **Error Handling**: Comprehensive error tracking and user feedback
6. **UI State Management**: Real-time status updates and loading states

## Deployment Architecture

### Production Environment (Netlify) - Active
- **Platform**: Netlify
- **Domain**: https://stefa-books.com.ua
- **Netlify URL**: https://stefabooks.netlify.app
- **Project ID**: cb75fb42-cc85-41da-a68b-f5a69f892c66
- **Build Configuration**: Next.js with SSR support via @netlify/plugin-nextjs
- **Environment Variables**: Configured via Netlify CLI and dashboard
- **DNS**: Managed via NIC.UA registrar

### Alternative Environment (Netlify) - Deprecated
- **Status**: Deprecated - All deployment now uses Netlify
- **Migration**: Complete migration to Netlify completed
- **Note**: Netlify configuration preserved for emergency fallback only

### Deployment Scripts & Safety Measures
- **Pre-deployment Validation**: `scripts/deployment-checklist.sh` verifies git status, dependencies, environment variables, and code quality
- **Automated Deployment**: `scripts/deploy.sh` handles full deployment pipeline with safety prompts for production
- **Error Prevention**: Comprehensive checks prevent deployment of broken builds

### Known Deployment Issues & Solutions
1. **TypeScript Build Errors**: Local builds may fail due to Next.js looking for `.js` files instead of `.tsx`. This is resolved in production via `next.config.js` configuration that ignores TypeScript errors during build.

2. **Cache Problems**: Resolved via automatic cache cleaning in deployment scripts and `npm run clean:cache` command.

3. **Environment Variables**: Critical variables automatically validated before deployment.

4. **Netlify Deployment**: All production deployment now uses Netlify with optimized build configuration.

### Package Manager
- **Current**: npm (standard Node.js package manager)
- **Scripts**: All package.json scripts use npm commands
### Netlify Deployment Documentation
- **Deployment Report**: `NETLIFY_DEPLOYMENT_REPORT.md` (полный отчет по деплою на Netlify)
- **Workflow Guide**: `NETLIFY_WORKFLOW_GUIDE.md` (инструкция по работе с проектом на Netlify)
- **Configuration**: `netlify.toml` (конфигурация Netlify)
- **Deploy Script**: `scripts/netlify-deploy.sh` (скрипт автоматического деплоя)

