#!/usr/bin/env node

/**
 * Find Unused Imports - Bundle Optimization Tool
 * Identifies potentially unused imports that can be removed for bundle size reduction
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Finding unused imports for bundle optimization...\n');

// Directories to analyze
const sourceDirs = [
  'src/components',
  'src/app',
  'src/lib',
  'src/store'
];

// Common heavy imports to check specifically
const heavyImports = [
  'framer-motion',
  '@tanstack/react-query', 
  '@radix-ui',
  'lucide-react',
  'zod',
  'react-hook-form'
];

function analyzeImports() {
  console.log('📊 Analyzing imports across source files...\n');
  
  const results = {
    totalFiles: 0,
    heavyImportUsage: {},
    potentialOptimizations: []
  };

  // Initialize heavy imports tracking
  heavyImports.forEach(lib => {
    results.heavyImportUsage[lib] = {
      files: [],
      totalImports: 0
    };
  });

  // Analyze each directory
  sourceDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      analyzeDirectory(fullPath, results);
    }
  });

  return results;
}

function analyzeDirectory(dirPath, results) {
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      analyzeDirectory(itemPath, results);
    } else if (item.match(/\.(ts|tsx|js|jsx)$/)) {
      analyzeFile(itemPath, results);
    }
  });
}

function analyzeFile(filePath, results) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    results.totalFiles++;
    
    // Check for heavy imports
    heavyImports.forEach(lib => {
      const importRegex = new RegExp(`import.*from.*['"]${lib}.*['"]`, 'g');
      const matches = content.match(importRegex);
      
      if (matches) {
        results.heavyImportUsage[lib].files.push(relativePath);
        results.heavyImportUsage[lib].totalImports += matches.length;
      }
    });
    
    // Check for specific optimization opportunities
    checkForOptimizations(content, relativePath, results);
    
  } catch (error) {
    console.warn(`⚠️  Could not analyze ${filePath}: ${error.message}`);
  }
}

function checkForOptimizations(content, filePath, results) {
  const optimizations = [];
  
  // Check for unused React imports
  if (content.includes("import React") && !content.includes("React.")) {
    optimizations.push("Unused React import (React 17+ doesn't require it)");
  }
  
  // Check for large Lucide React imports
  const lucideImports = content.match(/import\s*{\s*([^}]+)\s*}\s*from\s*['"]lucide-react['"]/);
  if (lucideImports && lucideImports[1].split(',').length > 5) {
    optimizations.push(`Large Lucide React import (${lucideImports[1].split(',').length} icons)`);
  }
  
  // Check for unused Framer Motion imports
  if (content.includes("import") && content.includes("framer-motion") && !content.includes("motion.")) {
    optimizations.push("Potentially unused Framer Motion import");
  }
  
  // Check for unused utility imports
  if (content.includes("import { cn }") && !content.includes("cn(")) {
    optimizations.push("Unused cn utility import");
  }
  
  if (optimizations.length > 0) {
    results.potentialOptimizations.push({
      file: filePath,
      optimizations
    });
  }
}

function generateReport(results) {
  console.log('📋 Bundle Import Analysis Report');
  console.log('================================\n');
  
  console.log(`📊 Analysis Summary:`);
  console.log(`  Files analyzed: ${results.totalFiles}`);
  console.log(`  Potential optimizations found: ${results.potentialOptimizations.length}\n`);
  
  console.log('📦 Heavy Import Usage:');
  Object.entries(results.heavyImportUsage).forEach(([lib, usage]) => {
    if (usage.files.length > 0) {
      console.log(`  ${lib}: ${usage.files.length} files (${usage.totalImports} imports)`);
      if (usage.files.length <= 5) {
        usage.files.forEach(file => console.log(`    - ${file}`));
      } else {
        usage.files.slice(0, 3).forEach(file => console.log(`    - ${file}`));
        console.log(`    ... and ${usage.files.length - 3} more files`);
      }
      console.log('');
    }
  });
  
  if (results.potentialOptimizations.length > 0) {
    console.log('💡 Optimization Opportunities:');
    results.potentialOptimizations.slice(0, 10).forEach((opt, index) => {
      console.log(`\n${index + 1}. ${opt.file}:`);
      opt.optimizations.forEach(issue => {
        console.log(`   • ${issue}`);
      });
    });
    
    if (results.potentialOptimizations.length > 10) {
      console.log(`\n   ... and ${results.potentialOptimizations.length - 10} more files with potential optimizations`);
    }
  }
  
  // Bundle optimization recommendations
  console.log('\n🚀 Bundle Optimization Recommendations:\n');
  
  // Check Framer Motion usage
  const framerUsage = results.heavyImportUsage['framer-motion'];
  if (framerUsage.files.length > 0) {
    console.log('HIGH Priority - Framer Motion:');
    console.log('  • Consider dynamic imports for animation components');
    console.log('  • Use CSS animations for simple effects');
    console.log('  • Lazy load motion components only when needed\n');
  }
  
  // Check Radix UI usage
  const radixFiles = results.heavyImportUsage['@radix-ui'];
  if (radixFiles && radixFiles.files.length > 0) {
    console.log('MEDIUM Priority - Radix UI:');
    console.log('  • Consider dynamic imports for modal/dialog components');
    console.log('  • Use tree shaking to import only used components\n');
  }
  
  // Check React Query usage
  const queryUsage = results.heavyImportUsage['@tanstack/react-query'];
  if (queryUsage.files.length > 0) {
    console.log('MEDIUM Priority - React Query:');
    console.log('  • Ensure proper tree shaking configuration');
    console.log('  • Consider splitting query hooks into separate chunks\n');
  }
  
  console.log('✅ Analysis completed! Review recommendations above.\n');
  console.log('Next steps:');
  console.log('1. Implement dynamic imports for heavy components');
  console.log('2. Remove unused imports');
  console.log('3. Use tree shaking for large libraries');
  console.log('4. Run bundle analysis after changes to measure improvement');
}

// Run analysis
try {
  const results = analyzeImports();
  generateReport(results);
} catch (error) {
  console.error('❌ Import analysis failed:', error.message);
  process.exit(1);
}