# 📚 Stefa.Books - Ukrainian Children's Library

> Modern children's book rental platform with subscription system, admin panel, and AI integration

[![Deploy Status](https://img.shields.io/badge/deploy-success-brightgreen)](https://stefa-books.com.ua)
[![TypeScript](https://img.shields.io/badge/TypeScript-0%20errors-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-blue)](https://reactjs.org/)

## 🚀 Live Site

**Production**: [https://stefa-books.com.ua](https://stefa-books.com.ua)

- **API Health**: [/api/health](https://stefa-books.com.ua/api/health)
- **API Books**: [/api/books](https://stefa-books.com.ua/api/books)
- **Admin Panel**: [/admin](https://stefa-books.com.ua/admin)
- **AI API**: [/api/llms.txt](https://stefa-books.com.ua/api/llms.txt)

## ✨ Features

### 👶 For Children & Parents
- 📖 Browse 105+ children's books
- 🔍 Smart search and filtering
- 📱 Mobile-friendly interface
- 🎨 Child-friendly design
- 📦 Book rental system

### 👨‍💼 For Administrators
- 📊 Complete admin dashboard
- 📚 Book management system
- 👥 User management
- 📈 Analytics and reports
- 🖼️ Cover upload to Cloudinary

### 🤖 AI Integration
- 🧠 Groq Llama 3 70B integration
- 📝 Markdown generation
- 🔍 AI discoverability
- 💬 Intelligent recommendations

## 🛠️ Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | Next.js | 15.5.3 |
| **Frontend** | React | 19.1.1 |
| **Language** | TypeScript | 5.5.4 |
| **Styling** | Tailwind CSS | 3.4.17 |
| **UI Components** | shadcn/ui | Latest |
| **Database** | Supabase (PostgreSQL) | Latest |
| **Hosting** | Netlify | - |
| **Images** | Cloudinary | Latest |
| **Package Manager** | pnpm | 10.15.1 |
| **AI** | Groq Llama 3 70B | Latest |
| **Animations** | Framer Motion | 12.23.12 |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/stefa-books.git
cd stefa-books

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Fill in your environment variables

# Run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Documentation

### 📁 Documentation Structure
```
docs/
├── guides/           # User guides and tutorials
├── deployment/       # Deployment documentation
├── archive/          # Archived materials
│   ├── reports/      # Historical reports
│   ├── fixes/        # Fix documentation
│   ├── legacy/       # Legacy documentation
│   ├── setup/        # Old setup guides
│   └── books-loading/ # Book loading history
```

### 📚 Key Documentation
- **[CLAUDE.md](./CLAUDE.md)** - Claude Code instructions
- **[DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md)** - Development standards
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute
- **[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)** - Community guidelines
- **[SECURITY.md](./SECURITY.md)** - Security policies
- **[CHANGELOG.md](./CHANGELOG.md)** - Project history
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Project architecture
- **[TECHNICAL_OVERVIEW.md](./TECHNICAL_OVERVIEW.md)** - Technical details

### 🔧 Setup Guides
- **[Local Setup](./docs/guides/LOCAL_SETUP_GUIDE.md)** - Complete local setup
- **[Admin Authentication](./docs/guides/ADMIN_AUTHENTICATION_GUIDE.md)** - Admin setup
- **[Monobank Integration](./docs/guides/MONOBANK_INTEGRATION_GUIDE.md)** - Payment setup
- **[Supabase Setup](./docs/guides/SUPABASE_SETUP_GUIDE.md)** - Database setup

### 🚀 Deployment
- **[Deployment Documentation](./docs/deployment/DEPLOYMENT_DOCUMENTATION.md)** - Complete deployment guide
- **[Deployment Checklist](./docs/deployment/DEPLOYMENT_READY_CHECKLIST.md)** - Pre-deployment checks
- **[Netlify Deployment](./docs/deployment/NETLIFY_DEPLOY.md)** - Netlify-specific guide

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm type-check       # TypeScript type checking
pnpm lint             # Run ESLint
pnpm lint:fix         # Auto-fix linting issues

# Testing
pnpm test             # Run unit tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Generate coverage report
pnpm test:e2e         # Run E2E tests

# Database & Data
pnpm insert-books     # Insert books to database
pnpm check-books      # Check book data integrity

# Deployment
pnpm deploy:check     # Pre-deployment checks
pnpm deploy           # Deploy preview
pnpm deploy:prod      # Deploy to production

# Performance
pnpm analyze:bundle   # Analyze bundle size
```

### Environment Variables

Create `.env.local` with the following variables:

```env
# Core Services
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Image Storage
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payment System (Monobank)
MONOBANK_TOKEN=your_monobank_token

# Site Configuration
NEXT_PUBLIC_SITE_URL=your_site_url
ADMIN_JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin_email
```

## 📊 Project Statistics

- **📚 105+ books** in database
- **📂 27 categories** of books
- **✅ 99+ available** books for rental
- **🖼️ 88+ books** with Cloudinary covers
- **👥 3 administrators** in system
- **📝 0 TypeScript errors**
- **✅ 70% test coverage** threshold

## 🎨 Design System

- **Tailwind CSS 3.4.17** - Stable version with custom design tokens
- **shadcn/ui components** - Professional UI components
- **Child-friendly design** - Optimized for young users
- **Mobile-first approach** - Responsive design
- **Accessibility** - ARIA support and keyboard navigation

## 🚀 Architecture

### Frontend
- **Next.js 15 App Router** - Modern React framework
- **Server Components** - Default pattern for performance
- **TypeScript** - Strict mode for type safety
- **Tailwind CSS** - Utility-first styling

### Backend
- **Supabase** - PostgreSQL with Row Level Security (RLS)
- **Edge Functions** - Server-side logic
- **Real-time subscriptions** - Live data updates

### Deployment
- **Netlify** - Primary hosting platform
- **Cloudinary** - Image optimization and delivery
- **CDN** - Global content delivery

## 🔐 Security

- **Row Level Security (RLS)** - Database-level security
- **Authentication** - Secure user authentication
- **API Protection** - Rate limiting and validation
- **Environment Variables** - Secure configuration management

## 🧪 Testing

- **Vitest** - Fast unit testing framework
- **Playwright** - End-to-end testing
- **Testing Library** - Component testing utilities
- **70% Coverage** - Minimum coverage threshold

## 📈 Performance

- **Core Web Vitals** - Optimized performance metrics
- **Image Optimization** - Cloudinary integration
- **Lazy Loading** - Intersection Observer API
- **Bundle Analysis** - Webpack bundle analyzer
- **Caching** - Multi-layer caching strategy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) for coding standards.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**Stefa.Books Development Team**
- Product Owner & Designer
- Frontend Developer
- Backend Developer
- DevOps Engineer

## 🆘 Support

For questions and support:
- 📧 Email: contact@stefa-books.com.ua
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/stefa-books/issues)
- 📖 Documentation: [Project Docs](./docs/)

---

<div align="center">

**🎉 Ready for Production!**

[Visit Live Site](https://stefa-books.com.ua) • [View Documentation](./docs/) • [Admin Panel](https://stefa-books.com.ua/admin)

</div>