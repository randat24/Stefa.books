# 📖 Stefa.Books Documentation

Welcome to the comprehensive documentation for the Stefa.Books project. This documentation is organized to help developers, administrators, and contributors understand and work with the system effectively.

## 📁 Documentation Structure

```
docs/
├── README.md             # This file - documentation index
├── guides/               # User guides and tutorials
├── deployment/           # Deployment documentation
└── archive/              # Historical documentation
    ├── reports/          # Development reports
    ├── fixes/            # Bug fix documentation
    ├── legacy/           # Legacy documentation
    ├── setup/            # Historical setup guides
    └── books-loading/    # Book loading procedures
```

## 🚀 Quick Start

For new developers joining the project:

1. **Start here**: [README.md](../README.md) - Project overview
2. **Setup**: [Local Setup Guide](./guides/LOCAL_SETUP_GUIDE.md) - Development environment
3. **Standards**: [DEVELOPMENT_RULES.md](../DEVELOPMENT_RULES.md) - Coding standards
4. **Architecture**: [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) - System architecture

## 📚 Core Documentation

### 🔧 Development
- **[CLAUDE.md](../CLAUDE.md)** - Claude Code AI assistant instructions
- **[DEVELOPMENT_RULES.md](../DEVELOPMENT_RULES.md)** - Development standards and best practices
- **[PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md)** - Project architecture and organization
- **[TECHNICAL_OVERVIEW.md](../TECHNICAL_OVERVIEW.md)** - Technical implementation details
- **[DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)** - UI design system and components
- **[GIT_WORKFLOW.md](../GIT_WORKFLOW.md)** - Git workflow and branching strategy
- **[PULL_REQUEST_TEMPLATE.md](../PULL_REQUEST_TEMPLATE.md)** - PR template and guidelines

## 🔧 Setup & Configuration Guides

### 📋 Essential Setup
- **[Local Setup Guide](./guides/LOCAL_SETUP_GUIDE.md)** - Complete local development setup
- **[Admin Authentication](./guides/ADMIN_AUTHENTICATION_GUIDE.md)** - Admin panel access setup
- **[Supabase Setup](./guides/SUPABASE_SETUP_GUIDE.md)** - Database configuration
- **[Testing Instructions](./guides/TESTING_INSTRUCTIONS.md)** - Testing framework setup

### 💳 Payment Integration
- **[Monobank Integration](./guides/MONOBANK_INTEGRATION_GUIDE.md)** - Payment system setup
- **[Rental System](./guides/RENTAL_SYSTEM_README.md)** - Book rental functionality

## 🚀 Deployment

### 📦 Deployment Guides
- **[Deployment Documentation](./deployment/DEPLOYMENT_DOCUMENTATION.md)** - Complete deployment guide
- **[Deployment Checklist](./deployment/DEPLOYMENT_READY_CHECKLIST.md)** - Pre-deployment validation
- **[Netlify Deployment](./deployment/NETLIFY_DEPLOY.md)** - Netlify-specific deployment
- **[Monobank Environment Setup](./deployment/MONOBANK_ENV_SETUP.md)** - Payment environment config

## 🛠️ Available Commands

### Development Commands
```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm type-check       # TypeScript validation
pnpm lint             # Code linting

# Testing
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm test:coverage    # Generate coverage report

# Deployment
pnpm deploy:check     # Pre-deployment checks
pnpm deploy           # Deploy preview
pnpm deploy:prod      # Deploy to production
```

### Database Commands
```bash
pnpm insert-books     # Insert books to database
pnpm check-books      # Validate book data
```

## 📊 Project Information

### Tech Stack
- **Framework**: Next.js 15.5.3
- **Frontend**: React 19.1.1, TypeScript 5.5.4
- **Styling**: Tailwind CSS 3.4.17
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Netlify
- **Package Manager**: pnpm 10.15.1

### Key Features
- **📚 105+ books** in catalog
- **🔍 Advanced search** and filtering
- **📱 Mobile-responsive** design
- **👥 Admin panel** for management
- **💳 Payment integration** with Monobank
- **🤖 AI integration** with Groq Llama 3 70B
- **🚀 High performance** optimization

## 📋 Documentation Standards

### Writing Guidelines
- Use clear, concise language
- Include code examples where relevant
- Maintain consistent formatting
- Keep documentation up-to-date with code changes
- Use Ukrainian language for user-facing content
- Use English for technical documentation

### File Organization
- **Root level**: Core project documentation
- **`docs/guides/`**: Step-by-step tutorials and guides
- **`docs/deployment/`**: Deployment and infrastructure docs
- **`docs/archive/`**: Historical documentation (not actively maintained)

## 🔍 Finding Documentation

### By Topic
- **Getting Started**: README.md, Local Setup Guide
- **Development**: DEVELOPMENT_RULES.md, PROJECT_STRUCTURE.md
- **Deployment**: deployment/ directory
- **Admin Setup**: Admin Authentication Guide
- **Payment Setup**: Monobank Integration Guide
- **Troubleshooting**: Check archive/fixes/ for historical solutions

### By User Role
- **New Developer**: README.md → Local Setup → Development Rules
- **DevOps Engineer**: Deployment Documentation → Netlify Guide
- **Administrator**: Admin Authentication → Admin Panel docs
- **Designer**: DESIGN_SYSTEM.md → Component documentation

## 🆘 Getting Help

### Common Issues
1. **Setup Problems**: Check [Local Setup Guide](./guides/LOCAL_SETUP_GUIDE.md)
2. **Build Errors**: Verify environment variables and dependencies
3. **Database Issues**: Review [Supabase Setup](./guides/SUPABASE_SETUP_GUIDE.md)
4. **Deployment Issues**: Check [Deployment Checklist](./deployment/DEPLOYMENT_READY_CHECKLIST.md)

### Support Channels
- **GitHub Issues**: Technical problems and bug reports
- **Documentation**: Comprehensive guides and references
- **Archive**: Historical solutions in `docs/archive/fixes/`

## 📈 Contributing to Documentation

### Guidelines
1. Follow existing documentation structure
2. Use clear, concise language
3. Include practical examples
4. Test all code examples
5. Update relevant index files
6. Follow the project's style guide

### Process
1. Create documentation in appropriate directory
2. Update this index file if needed
3. Submit pull request with documentation changes
4. Ensure documentation builds successfully

---

## 🔗 Quick Links

- **[🏠 Main README](../README.md)** - Project overview
- **[🚀 Live Site](https://stefa-books.com.ua)** - Production application
- **[👨‍💼 Admin Panel](https://stefa-books.com.ua/admin)** - Administrative interface
- **[📊 API Health](https://stefa-books.com.ua/api/health)** - System status

---

*Last updated: September 2025*
*This documentation is actively maintained and updated with each release.*