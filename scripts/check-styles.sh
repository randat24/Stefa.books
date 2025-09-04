#!/bin/bash

# Style Health Check Script for Stefa.books
# This script checks for common issues that cause styles to break

echo "🔍 Checking Style Health..."
echo "================================"

# Check 1: CSS files exist
echo "1. CSS Generation Check:"
if [ -f ".next/static/css/app/layout.css" ]; then
    echo "   ✅ CSS file exists"
    css_size=$(stat -f%z ".next/static/css/app/layout.css" 2>/dev/null || stat -c%s ".next/static/css/app/layout.css" 2>/dev/null)
    echo "   📏 Size: ${css_size} bytes"
else
    echo "   ❌ CSS file missing - styles will not load!"
fi

# Check 2: Build manifest includes CSS
echo ""
echo "2. Build Manifest Check:"
if [ -f ".next/app-build-manifest.json" ]; then
    if grep -q "static/css" ".next/app-build-manifest.json"; then
        echo "   ✅ CSS entries found in manifest"
    else
        echo "   ❌ No CSS entries in manifest"
    fi
else
    echo "   ❌ Build manifest missing"
fi

# Check 3: Next.js version consistency
echo ""
echo "3. Next.js Version Check:"
local_version=$(grep '"next"' package.json | cut -d'"' -f4)
if command -v npx &> /dev/null; then
    global_version=$(npx next --version 2>/dev/null || echo "Not available")
    echo "   📦 Project version: $local_version"
    echo "   🌐 Active version: $global_version"
else
    echo "   📦 Project version: $local_version"
fi

# Check 4: Environment variables
echo ""
echo "4. Environment Variables:"
if [ -f ".env.local" ]; then
    echo "   ✅ .env.local exists"
    cloudinary_count=$(grep -c "CLOUDINARY_" .env.local)
    echo "   ☁️  Cloudinary vars: $cloudinary_count/4"
else
    echo "   ❌ .env.local missing"
fi

# Check 5: Tailwind config
echo ""
echo "5. Tailwind Configuration:"
if [ -f "tailwind.config.ts" ]; then
    echo "   ✅ Tailwind config exists"
    if grep -q "src/\*\*/\*" tailwind.config.ts; then
        echo "   ✅ Content paths configured"
    else
        echo "   ⚠️  Content paths might be incorrect"
    fi
else
    echo "   ❌ Tailwind config missing"
fi

# Check 6: Server response (if server is running)
echo ""
echo "6. Server Response Check:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/_next/static/css/app/layout.css | grep -q "200"; then
    echo "   ✅ CSS file accessible via HTTP"
else
    echo "   ⚠️  CSS file not accessible (server may not be running)"
fi

echo ""
echo "================================"
echo "Style health check complete!"

# Summary
issues=0
[ ! -f ".next/static/css/app/layout.css" ] && ((issues++))
[ ! -f ".env.local" ] && ((issues++))

if [ $issues -eq 0 ]; then
    echo "🎉 No critical issues found!"
else
    echo "⚠️  Found $issues critical issue(s) that may cause style failures"
    echo "💡 Run: rm -rf .next && pnpm dev to fix cache issues"
fi