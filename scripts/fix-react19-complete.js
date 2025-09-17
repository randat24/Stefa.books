const fs = require('fs');
const path = require('path');

console.log('🔧 Полное исправление React 19 проблем...');

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

  // 1. Исправляем импорты React
  const originalContent = content;
  
  // Удаляем все импорты memo из React (больше не экспортируется)
  content = content.replace(/import\s*{\s*([^}]*)\bmemo\b([^}]*)\s*}\s*from\s*['"]react['"]/g, (match, before, after) => {
    const cleanBefore = before.replace(/,\s*$/, '').trim();
    const cleanAfter = after.replace(/,\s*$/, '').trim();
    const beforePart = cleanBefore ? cleanBefore + ', ' : '';
    const afterPart = cleanAfter ? ', ' + cleanAfter : '';
    return `import { ${beforePart}${afterPart} } from 'react'`;
  });

  // Удаляем отдельные импорты memo
  content = content.replace(/import\s*{\s*memo\s*}\s*from\s*['"]react['"]/g, '');
  content = content.replace(/import\s*{\s*memo\s*,\s*([^}]*)\s*}\s*from\s*['"]react['"]/g, 'import { $1 } from \'react\'');

  // 2. Исправляем forwardRef - заменяем на React.forwardRef
  content = content.replace(/\bforwardRef\b/g, 'React.forwardRef');
  
  // 3. Исправляем типы React
  content = content.replace(/\bElementRef\b/g, 'React.ElementRef');
  content = content.replace(/\bComponentPropsWithoutRef\b/g, 'React.ComponentPropsWithoutRef');
  content = content.replace(/\bHTMLAttributes\b/g, 'React.HTMLAttributes');
  content = content.replace(/\bThHTMLAttributes\b/g, 'React.ThHTMLAttributes');
  content = content.replace(/\bTdHTMLAttributes\b/g, 'React.TdHTMLAttributes');
  content = content.replace(/\bTextareaHTMLAttributes\b/g, 'React.TextareaHTMLAttributes');

  // 4. Исправляем иконки lucide-react
  const iconReplacements = {
    'QrCode': 'QrCodeIcon',
    'AlertTriangle': 'AlertTriangleIcon', 
    'MoreHorizontal': 'MoreHorizontalIcon',
    'History': 'HistoryIcon',
    'Circle': 'CircleIcon'
  };

  for (const [oldIcon, newIcon] of Object.entries(iconReplacements)) {
    content = content.replace(new RegExp(`\\b${oldIcon}\\b`, 'g'), newIcon);
  }

  // 5. Исправляем типы параметров функций
  content = content.replace(/\(e\)\s*=>/g, '(e: React.ChangeEvent<HTMLInputElement>) =>');
  content = content.replace(/\(prev\)\s*=>/g, '(prev: any) =>');
  content = content.replace(/\(user\)\s*=>/g, '(user: any) =>');
  content = content.replace(/\(book\)\s*=>/g, '(book: any) =>');

  // 6. Исправляем useRef с null
  content = content.replace(/useRef<([^>]+)>\(null\)/g, 'useRef<$1 | null>(null)');

  // 7. Исправляем onClick типы
  content = content.replace(/onClick=\{\(e: React\.ChangeEvent<HTMLInputElement>\)\s*=>/g, 'onClick={(e: React.MouseEvent<HTMLInputElement>) =>');

  // 8. Очищаем пустые импорты
  content = content.replace(/import\s*{\s*,\s*,/g, 'import {');
  content = content.replace(/import\s*{\s*,\s*([^}]*)\s*}/g, 'import { $1 }');
  content = content.replace(/,\s*,/g, ',');
  content = content.replace(/,\s*}/g, ' }');
  content = content.replace(/{\s*,/g, '{ ');

  // 9. Удаляем дублирующиеся импорты ReactNode
  content = content.replace(/import\s*{\s*([^}]*)\s*,\s*ReactNode\s*,\s*ReactNode\s*([^}]*)\s*}/g, 'import { $1, ReactNode $2 }');

  if (content !== originalContent) {
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
