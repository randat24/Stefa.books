#!/usr/bin/env node

/**
 * Скрипт для исправления сломанных импортов
 * Исправляет проблемы, вызванные предыдущим скриптом
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Исправление сломанных импортов...');

// Функция для исправления файла
function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Исправляем сломанные импорты react
  content = content.replace(
    /import\s+\{[^}]*\}\s+from\s+"react\nimport\s+Image\s+from\s+'next\/image'";/g,
    (match) => {
      const reactImport = match.match(/import\s+\{[^}]*\}\s+from\s+"react/)[0];
      return reactImport + '";';
    }
  );
  
  // Исправляем сломанные импорты lucide-react
  content = content.replace(
    /import\s+\{[^}]*\}\s+from\s+"lucide-react\nimport\s+Image\s+from\s+'next\/image'";/g,
    (match) => {
      const lucideImport = match.match(/import\s+\{[^}]*\}\s+from\s+"lucide-react/)[0];
      return lucideImport + '";';
    }
  );
  
  // Исправляем сломанные импорты react-hook-form
  content = content.replace(
    /import\s+\{[^}]*\}\s+from\s+"react\nimport\s+Image\s+from\s+'next\/image'-hook-form";/g,
    (match) => {
      const hookFormImport = match.match(/import\s+\{[^}]*\}\s+from\s+"react/)[0];
      return hookFormImport + '-hook-form";';
    }
  );
  
  // Удаляем дублирующиеся импорты Image
  const imageImports = content.match(/import\s+Image\s+from\s+['"]next\/image['"];?\s*/g);
  if (imageImports && imageImports.length > 1) {
    // Оставляем только первый импорт Image
    content = content.replace(/import\s+Image\s+from\s+['"]next\/image['"];?\s*/g, '');
    // Добавляем один импорт Image в начало
    const firstImportIndex = content.indexOf('import');
    if (firstImportIndex !== -1) {
      content = content.slice(0, firstImportIndex) + 'import Image from "next/image";\n' + content.slice(firstImportIndex);
    }
  }
  
  // Исправляем незакрытые строки
  content = content.replace(
    /import\s+\{[^}]*\}\s+from\s+"[^"]*\n[^"]*";/g,
    (match) => {
      const lines = match.split('\n');
      const firstLine = lines[0];
      const secondLine = lines[1];
      
      if (firstLine.includes('"') && !firstLine.endsWith('"')) {
        return firstLine + '";';
      }
      
      return match;
    }
  );
  
  if (content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Исправлен файл: ${filePath}`);
    changed = true;
  }
  
  return changed;
}

// Находим все файлы для исправления
const srcDir = path.join(process.cwd(), 'src');
const componentsDir = path.join(srcDir, 'components');

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixFile(filePath);
    }
  });
}

// Исправляем все файлы
console.log('📁 Исправление компонентов...');
walkDir(componentsDir);

console.log('🎉 Исправления применены!');
