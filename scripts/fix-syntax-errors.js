#!/usr/bin/env node

/**
 * Скрипт для исправления синтаксических ошибок после оптимизации
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Исправление синтаксических ошибок...\n');

// Паттерны файлов для исправления
const patterns = [
  'src/**/*.tsx',
  'src/**/*.ts',
];

let fixedFiles = 0;

patterns.forEach(pattern => {
  const files = glob.sync(pattern, { cwd: process.cwd() });
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Исправляем ошибки с / loading="lazy"
    const loadingRegex = /\/\s+loading="lazy"\s*\/>/g;
    if (content.match(loadingRegex)) {
      content = content.replace(loadingRegex, ' loading="lazy" />');
      modified = true;
    }
    
    // Исправляем ошибки с / loading="lazy" />
    const loadingRegex2 = /\/\s+loading="lazy"\s*\/\s*>/g;
    if (content.match(loadingRegex2)) {
      content = content.replace(loadingRegex2, ' loading="lazy" />');
      modified = true;
    }
    
    // Исправляем лишние скобки
    const extraBraceRegex = /\}\s*\}\s*$/gm;
    if (content.match(extraBraceRegex)) {
      content = content.replace(extraBraceRegex, '}');
      modified = true;
    }
    
    // Исправляем незакрытые теги
    const unclosedTagRegex = /<(\w+)([^>]*)>\s*$/gm;
    if (content.match(unclosedTagRegex)) {
      content = content.replace(unclosedTagRegex, '<$1$2>');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(file, content);
      console.log(`✅ Исправлен: ${file}`);
      fixedFiles++;
    }
  });
});

console.log(`\n📊 Результаты исправления:`);
console.log(`   Файлов исправлено: ${fixedFiles}`);
console.log(`\n✨ Исправление завершено!`);
