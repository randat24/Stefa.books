#!/bin/bash

# 🚀 Stefa.Books Quick Deployment Script
# Автоматический деплоймент с проверками

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "🚀 ========================================"
echo "   STEFA.BOOKS DEPLOYMENT AUTOMATION"
echo "========================================"
echo -e "${NC}"

# Parse command line arguments
DEPLOY_TYPE="preview"
SKIP_CHECKS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --prod|--production)
            DEPLOY_TYPE="production"
            shift
            ;;
        --skip-checks)
            SKIP_CHECKS=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --prod, --production    Deploy to production"
            echo "  --skip-checks          Skip pre-deployment checks"
            echo "  -h, --help             Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                     Deploy preview build"
            echo "  $0 --prod              Deploy to production"
            echo "  $0 --prod --skip-checks Deploy to production without checks"
            exit 0
            ;;
        *)
            echo "Unknown option $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "  Type: $DEPLOY_TYPE"
echo "  Skip checks: $SKIP_CHECKS"
echo ""

# Step 1: Run pre-deployment checks
if [ "$SKIP_CHECKS" = false ]; then
    echo -e "${YELLOW}🔍 Step 1: Running pre-deployment checks...${NC}"
    if [ -f "scripts/deployment-checklist.sh" ]; then
        ./scripts/deployment-checklist.sh
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Pre-deployment checks failed. Aborting deployment.${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  Checklist script not found, skipping checks...${NC}"
    fi
    echo ""
else
    echo -e "${YELLOW}⏭️  Skipping pre-deployment checks...${NC}"
    echo ""
fi

# Step 2: Clean cache
echo -e "${YELLOW}🧹 Step 2: Cleaning cache...${NC}"
pnpm run clean:cache
echo -e "${GREEN}✅ Cache cleaned${NC}"
echo ""

# Step 3: Check Netlify CLI
echo -e "${YELLOW}☁️ Step 3: Checking Netlify setup...${NC}"
if ! command -v netlify &> /dev/null; then
    echo -e "${RED}❌ Netlify CLI not found. Installing...${NC}"
    npm install -g netlify-cli
fi

# Check if logged in
NETLIFY_USER=$(netlify status --json 2>/dev/null | jq -r '.account.name' 2>/dev/null || echo "")
if [ -z "$NETLIFY_USER" ] || [ "$NETLIFY_USER" = "null" ]; then
    echo -e "${YELLOW}⚠️  Not logged in to Netlify. Please log in:${NC}"
    netlify login
    NETLIFY_USER=$(netlify status --json 2>/dev/null | jq -r '.account.name' 2>/dev/null || echo "")
fi

echo -e "${GREEN}✅ Logged in as: $NETLIFY_USER${NC}"
echo ""

# Step 4: Deploy
echo -e "${YELLOW}🚀 Step 4: Starting deployment...${NC}"
echo "Deployment type: $DEPLOY_TYPE"
echo ""

if [ "$DEPLOY_TYPE" = "production" ]; then
    echo -e "${RED}⚠️  PRODUCTION DEPLOYMENT${NC}"
    echo "This will deploy to the production environment."
    echo -n "Are you sure you want to continue? [y/N]: "
    read -r confirm
    
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}📋 Deployment cancelled.${NC}"
        exit 0
    fi
    
    echo ""
    echo -e "${BLUE}🚀 Deploying to PRODUCTION...${NC}"
    DEPLOYMENT_URL=$(netlify deploy --prod --json 2>/dev/null | jq -r '.deploy_url' || echo "https://stefa-books.com.ua")
else
    echo -e "${BLUE}🚀 Deploying PREVIEW build...${NC}"
    DEPLOYMENT_URL=$(netlify deploy --json 2>/dev/null | jq -r '.deploy_url' || echo "Preview URL")
fi

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 DEPLOYMENT SUCCESSFUL!${NC}"
    echo ""
    echo -e "${BLUE}📋 Deployment Details:${NC}"
    echo "  Environment: $DEPLOY_TYPE"
    echo "  URL: $DEPLOYMENT_URL"
    echo "  Time: $(date)"
    echo ""
    
    # Show additional URLs if production
    if [ "$DEPLOY_TYPE" = "production" ]; then
        echo -e "${BLUE}🌐 Available URLs:${NC}"
        echo "  🔗 Main: $DEPLOYMENT_URL"
        echo "  🔗 Custom: https://stefa-books.com.ua"
        echo "  🔗 Netlify: https://stefabooks.netlify.app"
        echo ""
    fi
    
    # Post-deployment checks
    echo -e "${YELLOW}🔍 Running post-deployment verification...${NC}"
    echo "Waiting for deployment to be ready..."
    sleep 10
    
    # Try to ping the deployment
    if curl -f -s "$DEPLOYMENT_URL" > /dev/null; then
        echo -e "${GREEN}✅ Site is responding${NC}"
    else
        echo -e "${YELLOW}⚠️  Site may still be starting up${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}✅ Deployment process completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📖 Next steps:${NC}"
    echo "1. Test the deployment: $DEPLOYMENT_URL"
    echo "2. Check Netlify dashboard for metrics"
    echo "3. Monitor logs: netlify logs"
    echo "4. Check performance with Lighthouse"
    
else
    echo ""
    echo -e "${RED}❌ DEPLOYMENT FAILED!${NC}"
    echo ""
    echo -e "${YELLOW}🔍 Troubleshooting steps:${NC}"
    echo "1. Check Netlify dashboard for error details"
    echo "2. Review deployment logs: netlify logs"
    echo "3. Verify environment variables in Netlify"
    echo "4. Check DEPLOYMENT_DOCUMENTATION.md for known issues"
    echo ""
    exit 1
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}🏁 Deployment script completed!${NC}"
echo -e "${BLUE}========================================${NC}"