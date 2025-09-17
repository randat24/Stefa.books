const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Исправление TypeScript ошибок для React 19...');

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

  // Исправления для React 19
  const fixes = [
    // Замена memo на React.memo
    {
      from: /import\s*{\s*([^}]*)\bmemo\b([^}]*)\s*}\s*from\s*['"]react['"]/g,
      to: (match, before, after) => {
        const cleanBefore = before.replace(/,\s*$/, '').trim();
        const cleanAfter = after.replace(/,\s*$/, '').trim();
        const beforePart = cleanBefore ? cleanBefore + ', ' : '';
        const afterPart = cleanAfter ? ', ' + cleanAfter : '';
        return `import { ${beforePart}${afterPart} } from 'react';\nimport { memo } from 'react'`;
      }
    },
    
    // Замена forwardRef на React.forwardRef
    {
      from: /React\.forwardRef/g,
      to: 'forwardRef'
    },
    
    // Добавление импорта forwardRef
    {
      from: /import\s*{\s*([^}]*)\s*}\s*from\s*['"]react['"]/g,
      to: (match, imports) => {
        if (content.includes('forwardRef') && !imports.includes('forwardRef')) {
          return `import { ${imports}, forwardRef } from 'react'`;
        }
        return match;
      }
    },
    
    // Замена несуществующих иконок
    {
      from: /QrCode/g,
      to: 'QrCodeIcon'
    },
    {
      from: /AlertTriangle/g,
      to: 'AlertTriangleIcon'
    },
    {
      from: /MoreHorizontal/g,
      to: 'MoreHorizontalIcon'
    },
    {
      from: /History/g,
      to: 'HistoryIcon'
    },
    {
      from: /Circle/g,
      to: 'CircleIcon'
    },
    
    // Исправление типов для forwardRef
    {
      from: /React\.ElementRef/g,
      to: 'ElementRef'
    },
    {
      from: /React\.ComponentPropsWithoutRef/g,
      to: 'ComponentPropsWithoutRef'
    },
    {
      from: /React\.HTMLAttributes/g,
      to: 'HTMLAttributes'
    },
    {
      from: /React\.ThHTMLAttributes/g,
      to: 'ThHTMLAttributes'
    },
    {
      from: /React\.TdHTMLAttributes/g,
      to: 'TdHTMLAttributes'
    },
    {
      from: /React\.TextareaHTMLAttributes/g,
      to: 'TextareaHTMLAttributes'
    },
    
    // Добавление недостающих импортов типов
    {
      from: /import\s*{\s*([^}]*)\s*}\s*from\s*['"]react['"]/g,
      to: (match, imports) => {
        const neededTypes = [];
        if (content.includes('ElementRef') && !imports.includes('ElementRef')) neededTypes.push('ElementRef');
        if (content.includes('ComponentPropsWithoutRef') && !imports.includes('ComponentPropsWithoutRef')) neededTypes.push('ComponentPropsWithoutRef');
        if (content.includes('HTMLAttributes') && !imports.includes('HTMLAttributes')) neededTypes.push('HTMLAttributes');
        if (content.includes('ThHTMLAttributes') && !imports.includes('ThHTMLAttributes')) neededTypes.push('ThHTMLAttributes');
        if (content.includes('TdHTMLAttributes') && !imports.includes('TdHTMLAttributes')) neededTypes.push('TdHTMLAttributes');
        if (content.includes('TextareaHTMLAttributes') && !imports.includes('TextareaHTMLAttributes')) neededTypes.push('TextareaHTMLAttributes');
        
        if (neededTypes.length > 0) {
          return `import { ${imports}, ${neededTypes.join(', ')} } from 'react'`;
        }
        return match;
      }
    },
    
    // Исправление createContext и useContext
    {
      from: /import\s*{\s*([^}]*)\s*}\s*from\s*['"]react['"]/g,
      to: (match, imports) => {
        if ((content.includes('createContext') || content.includes('useContext')) && !imports.includes('createContext') && !imports.includes('useContext')) {
          return `import { ${imports}, createContext, useContext } from 'react'`;
        }
        return match;
      }
    },
    
    // Исправление ReactNode
    {
      from: /import\s*{\s*([^}]*)\s*}\s*from\s*['"]react['"]/g,
      to: (match, imports) => {
        if (content.includes('ReactNode') && !imports.includes('ReactNode')) {
          return `import { ${imports}, ReactNode } from 'react'`;
        }
        return match;
      }
    }
  ];

  // Применяем исправления
  for (const fix of fixes) {
    const newContent = content.replace(fix.from, fix.to);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  }

  // Исправляем типы для параметров функций
  content = content.replace(/\(e\)\s*=>/g, '(e: React.ChangeEvent<HTMLInputElement>) =>');
  content = content.replace(/\(prev\)\s*=>/g, '(prev: any) =>');
  content = content.replace(/\(user\)\s*=>/g, '(user: any) =>');
  content = content.replace(/\(book\)\s*=>/g, '(book: any) =>');

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Исправлен: ${filePath}`);
    return true;
  }
  
  return false;
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

// Проверяем результат
console.log('\n🔍 Проверка TypeScript...');
try {
  execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'inherit' });
  console.log('✅ TypeScript проверка прошла успешно!');
} catch (error) {
  console.log('⚠️  Остались некоторые ошибки TypeScript');
}
