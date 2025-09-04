#!/bin/bash

# Style Recovery Script for Stefa.books
# This script attempts to fix common style issues automatically

echo "🔧 Style Recovery Script"
echo "========================"

# Function to check if styles are working
check_styles() {
    if [ -f ".next/static/css/app/layout.css" ] && grep -q "static/css" ".next/app-build-manifest.json" 2>/dev/null; then
        return 0  # Styles OK
    else
        return 1  # Styles broken
    fi
}

# Level 1: Quick cache clear
echo "🚀 Level 1: Quick cache clear..."
rm -rf .next
echo "   Cleared .next directory"

echo "   Starting dev server..."
if command -v pnpm &> /dev/null; then
    pnpm dev &
    DEV_PID=$!
    echo "   Server PID: $DEV_PID"
else
    npm run dev &
    DEV_PID=$!
    echo "   Server PID: $DEV_PID (using npm)"
fi

# Wait for server to start
echo "   Waiting for server to start..."
sleep 8

# Check if Level 1 worked
if check_styles; then
    echo "✅ Level 1 successful! Styles are working."
    exit 0
fi

# Level 1 failed, kill server and try Level 2
echo "❌ Level 1 failed. Stopping server..."
kill $DEV_PID 2>/dev/null
sleep 2

echo ""
echo "🚀 Level 2: Full cache + dependencies reset..."
rm -rf .next node_modules/.cache

echo "   Reinstalling dependencies..."
if command -v pnpm &> /dev/null; then
    pnpm install
    pnpm dev &
    DEV_PID=$!
else
    npm install
    npm run dev &
    DEV_PID=$!
fi

echo "   Waiting for server to start..."
sleep 10

# Check if Level 2 worked
if check_styles; then
    echo "✅ Level 2 successful! Styles are working."
    exit 0
fi

# Level 2 failed, try nuclear option
echo "❌ Level 2 failed. Stopping server..."
kill $DEV_PID 2>/dev/null
sleep 2

echo ""
echo "🚀 Level 3: Nuclear option (full reset)..."
rm -rf .next .swc node_modules

echo "   Full reinstall..."
if command -v pnpm &> /dev/null; then
    pnpm install
    pnpm dev &
    DEV_PID=$!
else
    npm install
    npm run dev &
    DEV_PID=$!
fi

echo "   Waiting for server to start..."
sleep 15

# Final check
if check_styles; then
    echo "✅ Level 3 successful! Styles are working."
    echo "🎉 Style recovery complete!"
else
    echo "❌ All levels failed. Manual intervention required."
    echo "💡 Check:"
    echo "   - Tailwind config (tailwind.config.ts)"
    echo "   - Global CSS imports (src/app/globals.css)"
    echo "   - Next.js version compatibility"
    exit 1
fi