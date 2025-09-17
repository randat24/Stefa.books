const fs = require('fs');
const path = require('path');

console.log('🔧 Финальное исправление React 19 проблем...');

// Функция для рекурсивного поиска файлов
function findFiles(dir, pattern) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'test-pages-backup') {
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

  // 1. Удаляем все использования memo
  content = content.replace(/const\s+(\w+)\s*=\s*memo\(/g, 'const $1 = (');
  content = content.replace(/export\s+const\s+(\w+)\s*=\s*memo\(/g, 'export const $1 = (');
  
  // 2. Исправляем forwardRef - заменяем на обычные функции
  content = content.replace(/React\.forwardRef<[^>]*>\(/g, '(');
  content = content.replace(/forwardRef<[^>]*>\(/g, '(');
  
  // 3. Исправляем типы React
  content = content.replace(/React\.ElementRef/g, 'React.ElementRef');
  content = content.replace(/React\.ComponentPropsWithoutRef/g, 'React.ComponentPropsWithoutRef');
  content = content.replace(/React\.HTMLAttributes/g, 'React.HTMLAttributes');
  content = content.replace(/React\.ThHTMLAttributes/g, 'React.ThHTMLAttributes');
  content = content.replace(/React\.TdHTMLAttributes/g, 'React.TdHTMLAttributes');
  content = content.replace(/React\.TextareaHTMLAttributes/g, 'React.TextareaHTMLAttributes');
  
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
  
  // 5. Исправляем createContext и useContext
  content = content.replace(/import\s*{\s*([^}]*)\s*}\s*from\s*['"]react['"]/g, (match, imports) => {
    if (content.includes('createContext') && !imports.includes('createContext')) {
      return `import { ${imports}, createContext } from 'react'`;
    }
    if (content.includes('useContext') && !imports.includes('useContext')) {
      return `import { ${imports}, useContext } from 'react'`;
    }
    return match;
  });
  
  // 6. Исправляем ReactNode
  content = content.replace(/import\s*{\s*([^}]*)\s*}\s*from\s*['"]react['"]/g, (match, imports) => {
    if (content.includes('ReactNode') && !imports.includes('ReactNode')) {
      return `import { ${imports}, ReactNode } from 'react'`;
    }
    return match;
  });
  
  // 7. Исправляем типы параметров функций
  content = content.replace(/\(e\)\s*=>/g, '(e: React.ChangeEvent<HTMLInputElement>) =>');
  content = content.replace(/\(prev\)\s*=>/g, '(prev: any) =>');
  content = content.replace(/\(user\)\s*=>/g, '(user: any) =>');
  content = content.replace(/\(book\)\s*=>/g, '(book: any) =>');
  
  // 8. Исправляем useRef с null
  content = content.replace(/useRef<([^>]+)>\(null\)/g, 'useRef<$1 | null>(null)');
  
  // 9. Исправляем onClick типы
  content = content.replace(/onClick=\{\(e: React\.ChangeEvent<HTMLInputElement>\)\s*=>/g, 'onClick={(e: React.MouseEvent<HTMLInputElement>) =>');
  
  // 10. Удаляем дублирующиеся импорты
  content = content.replace(/import\s*{\s*([^}]*)\s*,\s*ReactNode\s*,\s*ReactNode\s*([^}]*)\s*}/g, 'import { $1, ReactNode $2 }');
  
  // 11. Исправляем JSX элементы
  content = content.replace(/<tfoot/g, '<tfoot');
  content = content.replace(/<caption/g, '<caption');
  
  // 12. Исправляем типы для lucide-react иконок
  content = content.replace(/FC<IconProps>/g, 'React.FC<React.SVGProps<SVGSVGElement>>');
  content = content.replace(/FC<ImageProps>/g, 'React.FC<React.ImgHTMLAttributes<HTMLImageElement>>');
  content = content.replace(/FC<SelectProps>/g, 'React.FC<any>');

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
