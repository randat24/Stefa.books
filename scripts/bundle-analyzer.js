#!/usr/bin/env node

/**
 * Bundle Size Analyzer for Stefa.Books
 * Analyzes bundle size and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📊 Stefa.Books Bundle Size Analyzer');
console.log('===================================\n');

// Analyze .next directory
function analyzeNextBuild() {
  console.log('🔍 Analyzing Next.js build...');
  
  const nextDir = path.join(process.cwd(), '.next');
  if (!fs.existsSync(nextDir)) {
    console.log('❌ .next directory not found. Please run "pnpm build" first.');
    return null;
  }

  const analysis = {
    static: { size: 0, files: 0 },
    server: { size: 0, files: 0 },
    chunks: { size: 0, files: 0 },
    total: 0
  };

  // Analyze static directory
  const staticDir = path.join(nextDir, 'static');
  if (fs.existsSync(staticDir)) {
    const staticStats = analyzeDirectory(staticDir);
    analysis.static = staticStats;
  }

  // Analyze server directory
  const serverDir = path.join(nextDir, 'server');
  if (fs.existsSync(serverDir)) {
    const serverStats = analyzeDirectory(serverDir);
    analysis.server = serverStats;
  }

  // Analyze chunks
  const chunksDir = path.join(nextDir, 'static', 'chunks');
  if (fs.existsSync(chunksDir)) {
    const chunksStats = analyzeDirectory(chunksDir);
    analysis.chunks = chunksStats;
  }

  analysis.total = analysis.static.size + analysis.server.size;

  return analysis;
}

// Analyze directory recursively
function analyzeDirectory(dirPath) {
  let totalSize = 0;
  let fileCount = 0;
  const files = [];

  function scanDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const itemPath = path.join(currentPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        scanDir(itemPath);
      } else {
        const size = stats.size;
        totalSize += size;
        fileCount++;
        
        files.push({
          name: item,
          path: itemPath,
          size: size,
          relativePath: path.relative(process.cwd(), itemPath)
        });
      }
    });
  }

  scanDir(dirPath);

  // Sort files by size (largest first)
  files.sort((a, b) => b.size - a.size);

  return {
    size: totalSize,
    files: fileCount,
    fileList: files
  };
}

// Analyze package.json dependencies
function analyzeDependencies() {
  console.log('📦 Analyzing dependencies...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // Known heavy dependencies
  const heavyDeps = {
    'framer-motion': { size: '~200KB', impact: 'high' },
    'react-dom': { size: '~130KB', impact: 'essential' },
    'next': { size: '~300KB', impact: 'essential' },
    'react': { size: '~50KB', impact: 'essential' },
    '@supabase/supabase-js': { size: '~100KB', impact: 'essential' },
    'tailwindcss': { size: '~0KB', impact: 'build-time' },
    'typescript': { size: '~0KB', impact: 'build-time' }
  };

  const analysis = {
    total: Object.keys(dependencies).length,
    heavy: [],
    essential: [],
    buildTime: [],
    recommendations: []
  };

  Object.keys(dependencies).forEach(dep => {
    if (heavyDeps[dep]) {
      const info = heavyDeps[dep];
      analysis[info.impact === 'essential' ? 'essential' : 
               info.impact === 'build-time' ? 'buildTime' : 'heavy'].push({
        name: dep,
        size: info.size,
        impact: info.impact
      });
    }
  });

  // Generate recommendations
  if (analysis.heavy.length > 0) {
    analysis.recommendations.push('Consider lazy loading heavy dependencies');
  }

  return analysis;
}

// Generate optimization recommendations
function generateOptimizations(buildAnalysis, depsAnalysis) {
  console.log('💡 Generating optimization recommendations...');
  
  const recommendations = [];

  // Bundle size recommendations
  if (buildAnalysis && buildAnalysis.total > 1024 * 1024) { // > 1MB
    recommendations.push({
      category: 'Bundle Size',
      priority: 'HIGH',
      items: [
        'Bundle size is large (>1MB). Consider code splitting.',
        'Implement dynamic imports for non-critical components.',
        'Use tree shaking to remove unused code.',
        'Optimize images and assets.'
      ]
    });
  }

  // Chunk analysis
  if (buildAnalysis && buildAnalysis.chunks.files > 50) {
    recommendations.push({
      category: 'Code Splitting',
      priority: 'MEDIUM',
      items: [
        'Many chunks detected. Consider consolidating small chunks.',
        'Use webpack bundle analyzer to identify optimization opportunities.',
        'Implement route-based code splitting.'
      ]
    });
  }

  // Dependency recommendations
  if (depsAnalysis.heavy.length > 0) {
    recommendations.push({
      category: 'Dependencies',
      priority: 'HIGH',
      items: [
        'Heavy dependencies detected. Consider alternatives or lazy loading.',
        'Review if all dependencies are necessary.',
        'Use bundle analyzer to identify largest dependencies.'
      ]
    });
  }

  // Performance recommendations
  recommendations.push({
    category: 'Performance',
    priority: 'MEDIUM',
    items: [
      'Implement service worker for caching.',
      'Use CDN for static assets.',
      'Enable gzip compression.',
      'Implement image optimization.'
    ]
  });

  return recommendations;
}

// Generate report
function generateReport(buildAnalysis, depsAnalysis, optimizations) {
  console.log('\n📋 Bundle Analysis Report');
  console.log('========================\n');

  if (buildAnalysis) {
    console.log('📊 Build Analysis:');
    console.log(`  Total size: ${(buildAnalysis.total / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Static assets: ${(buildAnalysis.static.size / 1024 / 1024).toFixed(2)} MB (${buildAnalysis.static.files} files)`);
    console.log(`  Server code: ${(buildAnalysis.server.size / 1024 / 1024).toFixed(2)} MB (${buildAnalysis.server.files} files)`);
    console.log(`  Chunks: ${(buildAnalysis.chunks.size / 1024 / 1024).toFixed(2)} MB (${buildAnalysis.chunks.files} files)\n`);
  }

  console.log('📦 Dependencies:');
  console.log(`  Total dependencies: ${depsAnalysis.total}`);
  console.log(`  Heavy dependencies: ${depsAnalysis.heavy.length}`);
  console.log(`  Essential dependencies: ${depsAnalysis.essential.length}`);
  console.log(`  Build-time dependencies: ${depsAnalysis.buildTime.length}\n`);

  console.log('💡 Optimization Recommendations:');
  optimizations.forEach(rec => {
    console.log(`\n${rec.priority} Priority - ${rec.category}:`);
    rec.items.forEach(item => {
      console.log(`  • ${item}`);
    });
  });

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    build: buildAnalysis,
    dependencies: depsAnalysis,
    optimizations,
    score: calculateScore(buildAnalysis, depsAnalysis, optimizations)
  };

  fs.writeFileSync('bundle-analysis-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to bundle-analysis-report.json');
}

// Calculate optimization score
function calculateScore(buildAnalysis, depsAnalysis, optimizations) {
  let score = 100;

  // Penalize large bundle size
  if (buildAnalysis && buildAnalysis.total > 1024 * 1024) {
    score -= 20;
  }

  // Penalize many heavy dependencies
  if (depsAnalysis.heavy.length > 3) {
    score -= 15;
  }

  // Penalize many chunks
  if (buildAnalysis && buildAnalysis.chunks.files > 50) {
    score -= 10;
  }

  // Bonus for optimizations
  const highPriorityOpts = optimizations.filter(opt => opt.priority === 'HIGH').length;
  score -= highPriorityOpts * 5;

  return Math.max(0, score);
}

// Main execution
try {
  const buildAnalysis = analyzeNextBuild();
  const depsAnalysis = analyzeDependencies();
  const optimizations = generateOptimizations(buildAnalysis, depsAnalysis);
  generateReport(buildAnalysis, depsAnalysis, optimizations);
  
  console.log('\n✅ Bundle analysis completed!');
} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message);
  process.exit(1);
}
