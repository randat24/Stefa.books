#!/bin/bash
# ===========================================
# Stefa.Books - Local Development Setup
# ===========================================
# This script sets up the local development environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main setup function
main() {
    log_info "Starting Stefa.Books local development setup..."

    # Check Node.js
    if ! command_exists node; then
        log_error "Node.js is not installed. Please install Node.js 18+ and try again."
        log_info "Download from: https://nodejs.org/"
        exit 1
    fi

    node_version=$(node --version | sed 's/v//')
    log_info "Node.js version: $node_version"

    # Check if pnpm is preferred
    if command_exists pnpm; then
        PKG_MANAGER="pnpm"
        log_info "Using pnpm as package manager"
    elif command_exists npm; then
        PKG_MANAGER="npm"
        log_info "Using npm as package manager"
    else
        log_error "No package manager found. Please install npm or pnpm."
        exit 1
    fi

    # Install dependencies
    log_info "Installing dependencies..."
    $PKG_MANAGER install

    if [ $? -eq 0 ]; then
        log_success "Dependencies installed successfully"
    else
        log_error "Failed to install dependencies"
        exit 1
    fi

    # Check for .env.local
    if [ ! -f ".env.local" ]; then
        log_warning ".env.local file not found"
        if [ -f ".env.example" ]; then
            log_info "Copying .env.example to .env.local"
            cp .env.example .env.local
            log_warning "Please edit .env.local and add your environment variables"
        else
            log_info "Creating basic .env.local template"
            cat > .env.local << 'EOF'
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
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@stefa-books.com.ua
EOF
            log_warning "Please edit .env.local and add your actual environment variables"
        fi
    else
        log_success ".env.local file exists"
    fi

    # Run type check
    log_info "Running TypeScript type check..."
    $PKG_MANAGER run type-check

    if [ $? -eq 0 ]; then
        log_success "TypeScript check passed"
    else
        log_warning "TypeScript check failed - you may need to fix some types"
    fi

    # Run lint check
    log_info "Running ESLint check..."
    $PKG_MANAGER run lint

    if [ $? -eq 0 ]; then
        log_success "ESLint check passed"
    else
        log_warning "ESLint found issues - consider running 'npm run lint:fix'"
    fi

    # Clear cache
    log_info "Clearing cache..."
    $PKG_MANAGER run clean:cache

    # Final setup
    log_success "Local development setup completed!"
    echo ""
    log_info "Next steps:"
    echo "  1. Edit .env.local with your environment variables"
    echo "  2. Run '$PKG_MANAGER dev' to start the development server"
    echo "  3. Open http://localhost:3000 in your browser"
    echo ""
    log_info "Available commands:"
    echo "  $PKG_MANAGER dev              - Start development server"
    echo "  $PKG_MANAGER build            - Build for production"
    echo "  $PKG_MANAGER test             - Run tests"
    echo "  $PKG_MANAGER run lint:fix     - Fix linting issues"
    echo ""
    log_info "Documentation:"
    echo "  README.md                     - Project overview"
    echo "  docs/guides/LOCAL_SETUP_GUIDE.md - Detailed setup guide"
    echo "  DEVELOPMENT_RULES.md          - Development standards"
}

# Run main function
main "$@"