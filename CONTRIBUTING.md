# 🤝 Contributing to Stefa.Books

Thank you for your interest in contributing to Stefa.Books! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Stefa.books.com.ua.git
   cd Stefa.books.com.ua
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Follow our development standards** (see below)
5. **Run tests** to ensure everything works
6. **Commit your changes** with conventional commits
7. **Push to your fork** and open a Pull Request

## 📋 Development Standards

### Code Quality
- **TypeScript**: Use strict mode, avoid `any` types
- **ESLint**: Follow our configuration, no warnings allowed
- **Prettier**: Use consistent formatting
- **Testing**: Write tests for new features
- **Documentation**: Update docs for user-facing changes

### Commit Convention
We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add new book search functionality
fix: resolve mobile layout issue
docs: update API documentation
style: format code with prettier
refactor: improve component structure
test: add unit tests for BookCard
chore: update dependencies
```

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

## 🧪 Testing

### Running Tests
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Type checking
pnpm type-check

# Linting
pnpm lint

# All tests
pnpm test:all
```

### Test Requirements
- New features must have unit tests
- UI changes need E2E tests
- API changes require integration tests
- All tests must pass before PR

## 📚 Documentation

### What to Document
- **User-facing changes**: Update README.md
- **Technical changes**: Update docs/ folder
- **New functions**: Add JSDoc comments
- **API changes**: Update API documentation
- **Setup changes**: Update setup guides

### Documentation Structure
```
docs/
├── README.md           # Documentation index
├── guides/             # User guides
├── deployment/         # Deployment docs
├── development/        # Developer docs
└── archive/           # Historical docs
```

## 🎨 Design System

### UI Components
- Use shadcn/ui components when possible
- Follow our design system in `DESIGN_SYSTEM.md`
- Maintain consistent spacing and typography
- Test on mobile devices

### Styling
- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Use CSS variables for theming
- Avoid inline styles

## 🔒 Security

### Security Guidelines
- Never commit secrets or API keys
- Use environment variables for sensitive data
- Validate all user inputs
- Follow OWASP guidelines
- Report security issues privately

### Reporting Security Issues
Please report security vulnerabilities to: security@stefa-books.com.ua

## 📝 Pull Request Process

### Before Submitting
1. **Run all tests**: `pnpm test:all`
2. **Check linting**: `pnpm lint`
3. **Type check**: `pnpm type-check`
4. **Build project**: `pnpm build`
5. **Update documentation**
6. **Test on multiple devices**

### PR Template
Use our PR template when creating pull requests:
- Describe what changes were made
- Explain why changes were necessary
- Include screenshots for UI changes
- Reference related issues
- List any breaking changes

### Review Process
1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** on staging environment
4. **Approval** from at least one maintainer
5. **Merge** to main branch

## 🐛 Bug Reports

### Before Reporting
1. Check existing issues
2. Test on latest version
3. Try to reproduce the issue
4. Gather relevant information

### Bug Report Template
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. iOS, Windows, Linux]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]

**Additional context**
Add any other context about the problem here.
```

## 💡 Feature Requests

### Before Requesting
1. Check existing feature requests
2. Consider if it fits project goals
3. Think about implementation complexity
4. Consider user impact

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
A clear description of any alternative solutions.

**Additional context**
Add any other context or screenshots about the feature request.
```

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation
- Social media mentions

## 📞 Getting Help

- **Documentation**: Check docs/ folder
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@stefa-books.com.ua

## 📄 License

By contributing to Stefa.Books, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Stefa.Books! 🎉
