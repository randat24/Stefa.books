#!/usr/bin/env node

/**
 * Performance Audit Script for Stefa.Books
 * Analyzes bundle size, dependencies, and performance metrics
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Stefa.Books Performance Audit');
console.log('================================\n');

// 1. Analyze package.json dependencies
function analyzeDependencies() {
  console.log('📦 Analyzing Dependencies...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const heavyDeps = [];
  const totalDeps = Object.keys(dependencies).length;
  
  // Known heavy dependencies
  const heavyDependencies = {
    'framer-motion': 'Animation library - can be heavy',
    'react-dom': 'Core React DOM - essential',
    'next': 'Next.js framework - essential',
    'react': 'Core React - essential',
    '@supabase/supabase-js': 'Database client - essential',
    'tailwindcss': 'CSS framework - essential',
    'typescript': 'TypeScript compiler - dev only',
    '@types/react': 'React types - dev only',
    '@types/node': 'Node types - dev only',
    'playwright': 'E2E testing - dev only',
    'jest': 'Testing framework - dev only'
  };
  
  console.log(`Total dependencies: ${totalDeps}`);
  console.log(`Production dependencies: ${Object.keys(packageJson.dependencies).length}`);
  console.log(`Dev dependencies: ${Object.keys(packageJson.devDependencies).length}\n`);
  
  // Check for potential optimizations
  const optimizationSuggestions = [];
  
  if (dependencies['framer-motion']) {
    optimizationSuggestions.push('Consider lazy loading framer-motion for better initial load');
  }
  
  if (dependencies['@tanstack/react-query']) {
    optimizationSuggestions.push('React Query is good for caching - keep it');
  }
  
  if (dependencies['zustand']) {
    optimizationSuggestions.push('Zustand is lightweight - good choice');
  }
  
  console.log('💡 Optimization Suggestions:');
  optimizationSuggestions.forEach(suggestion => {
    console.log(`  • ${suggestion}`);
  });
  
  return { totalDeps, optimizationSuggestions };
}

// 2. Analyze bundle size (if build works)
function analyzeBundleSize() {
  console.log('\n📊 Bundle Size Analysis...');
  
  try {
    // Try to get bundle size from .next directory
    const nextDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextDir)) {
      const staticDir = path.join(nextDir, 'static');
      if (fs.existsSync(staticDir)) {
        const chunks = fs.readdirSync(staticDir);
        console.log(`Found ${chunks.length} static chunks`);
        
        // Calculate total size
        let totalSize = 0;
        chunks.forEach(chunk => {
          const chunkPath = path.join(staticDir, chunk);
          if (fs.statSync(chunkPath).isDirectory()) {
            const files = fs.readdirSync(chunkPath);
            files.forEach(file => {
              const filePath = path.join(chunkPath, file);
              const stats = fs.statSync(filePath);
              totalSize += stats.size;
            });
          }
        });
        
        console.log(`Total static assets size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
      }
    } else {
      console.log('❌ .next directory not found - build may have failed');
    }
  } catch (error) {
    console.log(`❌ Bundle analysis failed: ${error.message}`);
  }
}

// 3. Analyze existing optimizations
function analyzeExistingOptimizations() {
  console.log('\n⚡ Existing Optimizations Analysis...');
  
  const optimizations = [];
  
  // Check for cache implementation
  if (fs.existsSync('src/lib/cache.ts')) {
    optimizations.push('✅ API Cache system implemented');
  }
  
  // Check for memory optimization
  if (fs.existsSync('src/lib/memory-optimization.ts')) {
    optimizations.push('✅ Memory optimization utilities');
  }
  
  // Check for optimized components
  const optimizedComponents = [
    'src/components/ui/OptimizedDataEngine.tsx',
    'src/components/ui/OptimizedCache.tsx',
    'src/components/ui/VirtualizedBookList.tsx',
    'src/components/ui/OptimizedInfiniteScroll.tsx',
    'src/components/ui/OptimizedPagination.tsx'
  ];
  
  optimizedComponents.forEach(component => {
    if (fs.existsSync(component)) {
      optimizations.push(`✅ ${path.basename(component)} - Optimized component`);
    }
  });
  
  // Check for lazy loading
  if (fs.existsSync('src/components/ui/LazyComponent.tsx')) {
    optimizations.push('✅ Lazy loading components');
  }
  
  // Check for performance monitoring
  if (fs.existsSync('src/hooks/useBooksCache.ts')) {
    optimizations.push('✅ Books cache hook with TTL');
  }
  
  // Check for image optimization
  const nextConfig = fs.readFileSync('next.config.js', 'utf8');
  if (nextConfig.includes('images:')) {
    optimizations.push('✅ Next.js image optimization configured');
  }
  
  console.log('Found optimizations:');
  optimizations.forEach(opt => console.log(`  ${opt}`));
  
  return optimizations;
}

// 4. Performance recommendations
function generateRecommendations() {
  console.log('\n🎯 Performance Recommendations...');
  
  const recommendations = [
    {
      priority: 'HIGH',
      category: 'Bundle Size',
      items: [
        'Implement code splitting for heavy components',
        'Use dynamic imports for non-critical features',
        'Optimize images with WebP/AVIF formats',
        'Remove unused dependencies'
      ]
    },
    {
      priority: 'HIGH',
      category: 'Core Web Vitals',
      items: [
        'Implement proper loading states',
        'Optimize Largest Contentful Paint (LCP)',
        'Reduce Cumulative Layout Shift (CLS)',
        'Improve First Input Delay (FID)'
      ]
    },
    {
      priority: 'MEDIUM',
      category: 'Caching',
      items: [
        'Implement Service Worker for offline support',
        'Add Redis caching for API responses',
        'Use CDN for static assets',
        'Implement stale-while-revalidate strategy'
      ]
    },
    {
      priority: 'MEDIUM',
      category: 'Monitoring',
      items: [
        'Add Web Vitals monitoring',
        'Implement error tracking',
        'Add performance metrics dashboard',
        'Set up alerts for performance regressions'
      ]
    }
  ];
  
  recommendations.forEach(rec => {
    console.log(`\n${rec.priority} Priority - ${rec.category}:`);
    rec.items.forEach(item => {
      console.log(`  • ${item}`);
    });
  });
  
  return recommendations;
}

// 5. Generate performance report
function generateReport(deps, optimizations, recommendations) {
  console.log('\n📋 Performance Audit Report');
  console.log('============================');
  
  const report = {
    timestamp: new Date().toISOString(),
    dependencies: deps,
    optimizations: optimizations.length,
    recommendations: recommendations.length,
    score: calculateScore(optimizations.length, recommendations.length)
  };
  
  console.log(`\nOverall Performance Score: ${report.score}/100`);
  console.log(`Optimizations implemented: ${report.optimizations}`);
  console.log(`Recommendations: ${report.recommendations}`);
  
  // Save report
  fs.writeFileSync('performance-audit-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Report saved to performance-audit-report.json');
}

function calculateScore(optimizations, recommendations) {
  const baseScore = Math.min(optimizations * 10, 60); // Max 60 for existing optimizations
  const recommendationPenalty = Math.min(recommendations * 2, 20); // Max 20 penalty
  return Math.max(100 - recommendationPenalty, baseScore);
}

// Main execution
try {
  const deps = analyzeDependencies();
  analyzeBundleSize();
  const optimizations = analyzeExistingOptimizations();
  const recommendations = generateRecommendations();
  generateReport(deps, optimizations, recommendations);
  
  console.log('\n✅ Performance audit completed!');
} catch (error) {
  console.error('❌ Performance audit failed:', error.message);
  process.exit(1);
}
