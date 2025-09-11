#!/usr/bin/env node

/**
 * Скрипт для исправления ошибок в логгере
 * Исправляет неправильное использование logger.error с { error } как контекстом
 */

const fs = require('fs');
const path = require('path');

// Цвета для вывода
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'blue') {
  console.log(`${colors[color]}[FIX-LOGGER]${colors.reset} ${message}`);
}

function warn(message) {
  console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
}

function success(message) {
  console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
}

function error(message) {
  console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
}

// Паттерны для поиска и замены
const patterns = [
  // logger.error('message', { error });
  {
    regex: /logger\.error\(([^,]+),\s*\{\s*error\s*\}\s*\)/g,
    replacement: 'logger.error($1, error)',
    description: 'logger.error with { error } as context'
  },
  // logger.error('message', { error }, 'context');
  {
    regex: /logger\.error\(([^,]+),\s*\{\s*error\s*\}\s*,\s*([^)]+)\)/g,
    replacement: 'logger.error($1, error, $2)',
    description: 'logger.error with { error } as context and string context'
  }
];

function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;

    patterns.forEach(pattern => {
      const matches = newContent.match(pattern.regex);
      if (matches) {
        newContent = newContent.replace(pattern.regex, pattern.replacement);
        modified = true;
        log(`Fixed ${matches.length} instances of: ${pattern.description}`, 'yellow');
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      success(`Fixed: ${filePath}`);
      return true;
    }

    return false;
  } catch (err) {
    error(`Failed to process ${filePath}: ${err.message}`);
    return false;
  }
}

// Рекурсивная функция для поиска файлов
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files = files.concat(findFiles(fullPath, extensions));
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (err) {
    // Игнорируем ошибки доступа к папкам
  }
  
  return files;
}

function main() {
  log('Starting logger error fixes...');

  // Найти все TypeScript и JavaScript файлы в src
  const srcDir = path.join(process.cwd(), 'src');
  const files = findFiles(srcDir);

  let fixedCount = 0;
  let totalFiles = files.length;

  log(`Found ${totalFiles} files to check`);

  files.forEach(file => {
    if (fixFile(file)) {
      fixedCount++;
    }
  });

  log('=== SUMMARY ===');
  success(`Fixed ${fixedCount} files out of ${totalFiles} checked`);
  
  if (fixedCount === 0) {
    log('No logger errors found!');
  } else {
    log('Logger errors have been fixed. Please review the changes.');
  }
}

// Запуск скрипта
if (require.main === module) {
  main();
}

module.exports = { fixFile, patterns };
