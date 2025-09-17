const fs = require('fs');
const path = require('path');

console.log('🔧 Исправление импортов React...');

// Функция для рекурсивного поиска файлов
function findFiles(dir, pattern) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findFiles(fullPath, pattern));
    } else if (stat.isFile() && pattern.test(item)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Функция для исправления файла
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Исправляем пустые импорты
  content = content.replace(/import\s*{\s*,\s*,/g, 'import {');
  content = content.replace(/import\s*{\s*,\s*([^}]*)\s*}/g, 'import { $1 }');
  
  // Исправляем дублирующиеся запятые
  content = content.replace(/,\s*,/g, ',');
  content = content.replace(/,\s*}/g, ' }');
  content = content.replace(/{\s*,/g, '{ ');

  if (content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Исправлен: ${filePath}`);
    modified = true;
  }
  
  return modified;
}

// Находим все TypeScript файлы
const tsFiles = findFiles('src', /\.(ts|tsx)$/);
let fixedCount = 0;

console.log(`📁 Найдено ${tsFiles.length} TypeScript файлов`);

// Исправляем каждый файл
for (const file of tsFiles) {
  try {
    if (fixFile(file)) {
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Ошибка при исправлении ${file}:`, error.message);
  }
}

console.log(`\n🎉 Исправлено ${fixedCount} файлов`);
