#!/bin/bash

# Development workflow script for Stefa.books

echo "🚀 Stefa.books Development Workflow"
echo "=================================="

# Check current branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $current_branch"

if [ "$current_branch" = "main" ]; then
    echo "⚠️  You are on main branch!"
    echo "🔄 Switching to Lklhost for development..."
    git checkout Lklhost
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    echo "✅ Now on: $current_branch"
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 You have uncommitted changes:"
    git status --short
    echo ""
    read -p "Do you want to commit them? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
    fi
fi

# Pull latest changes
echo "🔄 Pulling latest changes..."
git pull origin $current_branch

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start development server
echo "🚀 Starting development server..."
echo "🌐 Open: http://localhost:3000"
echo "⏹️  Press Ctrl+C to stop"
echo ""

npm run dev
