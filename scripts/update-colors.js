#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Маппинг цветов для замены
const colorMappings = {
  // Slate -> Gray
  'slate-50': 'gray-50',
  'slate-100': 'gray-100',
  'slate-200': 'gray-200',
  'slate-300': 'gray-300',
  'slate-400': 'gray-400',
  'slate-500': 'gray-500',
  'slate-600': 'gray-600',
  'slate-700': 'gray-700',
  'slate-800': 'gray-800',
  'slate-900': 'gray-900',
  
  // Yellow -> Brand Yellow
  'yellow-400': 'brand-yellow-light',
  'yellow-500': 'brand-yellow',
  'yellow-600': 'brand-yellow-dark',
  
  // Blue -> Brand Accent (где уместно)
  'blue-500': 'brand-accent',
  'blue-600': 'brand-accent-light',
  
  // Zinc -> Gray
  'zinc-50': 'gray-50',
  'zinc-100': 'gray-100',
  'zinc-200': 'gray-200',
  'zinc-300': 'gray-300',
  'zinc-400': 'gray-400',
  'zinc-500': 'gray-500',
  'zinc-600': 'gray-600',
  'zinc-700': 'gray-700',
  'zinc-800': 'gray-800',
  'zinc-900': 'gray-900',
  
  // Neutral -> Gray
  'neutral-50': 'gray-50',
  'neutral-100': 'gray-100',
  'neutral-200': 'gray-200',
  'neutral-300': 'gray-300',
  'neutral-400': 'gray-400',
  'neutral-500': 'gray-500',
  'neutral-600': 'gray-600',
  'neutral-700': 'gray-700',
  'neutral-800': 'gray-800',
  'neutral-900': 'gray-900',
  
  // Stone -> Gray
  'stone-50': 'gray-50',
  'stone-100': 'gray-100',
  'stone-200': 'gray-200',
  'stone-300': 'gray-300',
  'stone-400': 'gray-400',
  'stone-500': 'gray-500',
  'stone-600': 'gray-600',
  'stone-700': 'gray-700',
  'stone-800': 'gray-800',
  'stone-900': 'gray-900',
};

// Функция для рекурсивного поиска файлов
function findFiles(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Пропускаем node_modules и другие служебные папки
      if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
        results = results.concat(findFiles(filePath, extensions));
      }
    } else if (extensions.some(ext => file.endsWith(ext))) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Функция для замены цветов в файле
function updateFileColors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Заменяем цвета
    Object.entries(colorMappings).forEach(([oldColor, newColor]) => {
      const patterns = [
        // bg-{color}
        new RegExp(`\\bbg-${oldColor}\\b`, 'g'),
        // text-{color}
        new RegExp(`\\btext-${oldColor}\\b`, 'g'),
        // border-{color}
        new RegExp(`\\bborder-${oldColor}\\b`, 'g'),
        // ring-{color}
        new RegExp(`\\bring-${oldColor}\\b`, 'g'),
        // from-{color}
        new RegExp(`\\bfrom-${oldColor}\\b`, 'g'),
        // to-{color}
        new RegExp(`\\bto-${oldColor}\\b`, 'g'),
        // via-{color}
        new RegExp(`\\bvia-${oldColor}\\b`, 'g'),
      ];
      
      patterns.forEach(pattern => {
        const newPattern = pattern.source.replace(oldColor, newColor);
        const newReplacement = newPattern.replace(/\\b/g, '').replace(/\\/g, '');
        const newPatternRegex = new RegExp(newReplacement, 'g');
        
        if (pattern.test(content)) {
          content = content.replace(pattern, newReplacement);
          hasChanges = true;
        }
      });
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Основная функция
function main() {
  console.log('🎨 Starting color consistency update...\n');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const files = findFiles(srcDir);
  
  console.log(`Found ${files.length} files to check\n`);
  
  let updatedFiles = 0;
  
  files.forEach(file => {
    if (updateFileColors(file)) {
      updatedFiles++;
    }
  });
  
  console.log(`\n✨ Updated ${updatedFiles} files`);
  
  if (updatedFiles > 0) {
    console.log('\n📝 Running linter to check for issues...');
    try {
      execSync('npm run lint', { stdio: 'inherit' });
      console.log('✅ Linter passed');
    } catch (error) {
      console.log('⚠️  Linter found issues - please review them');
    }
  }
  
  console.log('\n🎯 Color consistency update completed!');
}

// Запуск скрипта
if (require.main === module) {
  main();
}

module.exports = { updateFileColors, colorMappings };
