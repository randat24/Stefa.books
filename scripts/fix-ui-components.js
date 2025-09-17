const fs = require('fs');
const path = require('path');

console.log('🔧 Исправление UI компонентов...');

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

  // 1. Исправляем forwardRef - заменяем на обычные функции с ref параметром
  if (content.includes('React.forwardRef') || content.includes('forwardRef')) {
    // Заменяем React.forwardRef на обычную функцию
    content = content.replace(/React\.forwardRef<[^>]*>\(/g, '(');
    content = content.replace(/forwardRef<[^>]*>\(/g, '(');
    
    // Исправляем типы
    content = content.replace(/React\.ElementRef/g, 'React.ElementRef');
    content = content.replace(/React\.ComponentPropsWithoutRef/g, 'React.ComponentPropsWithoutRef');
    content = content.replace(/React\.HTMLAttributes/g, 'React.HTMLAttributes');
    content = content.replace(/React\.ThHTMLAttributes/g, 'React.ThHTMLAttributes');
    content = content.replace(/React\.TdHTMLAttributes/g, 'React.TdHTMLAttributes');
    content = content.replace(/React\.TextareaHTMLAttributes/g, 'React.TextareaHTMLAttributes');
    
    modified = true;
  }

  // 2. Исправляем JSX элементы
  content = content.replace(/<tfoot/g, '<tfoot');
  content = content.replace(/<caption/g, '<caption');

  // 3. Исправляем типы для lucide-react иконок
  content = content.replace(/FC<IconProps>/g, 'React.FC<React.SVGProps<SVGSVGElement>>');
  content = content.replace(/FC<ImageProps>/g, 'React.FC<React.ImgHTMLAttributes<HTMLImageElement>>');
  content = content.replace(/FC<SelectProps>/g, 'React.FC<any>');

  // 4. Исправляем displayName
  content = content.replace(/\.displayName\s*=\s*"[^"]*"/g, '');

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Исправлен: ${filePath}`);
  }
  
  return modified;
}

// Находим все UI компоненты
const uiFiles = findFiles('src/components/ui', /\.(ts|tsx)$/);
let fixedCount = 0;

console.log(`📁 Найдено ${uiFiles.length} UI файлов`);

// Исправляем каждый файл
for (const file of uiFiles) {
  try {
    if (fixFile(file)) {
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Ошибка при исправлении ${file}:`, error.message);
  }
}

console.log(`\n🎉 Исправлено ${fixedCount} файлов`);
