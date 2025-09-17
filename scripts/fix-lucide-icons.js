const fs = require('fs');
const path = require('path');

console.log('🔧 Исправление иконок lucide-react...');

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

  // Список несуществующих иконок и их замен
  const iconReplacements = {
    'QrCode': 'QrCodeIcon',
    'AlertTriangle': 'AlertTriangleIcon', 
    'MoreHorizontal': 'MoreHorizontalIcon',
    'History': 'HistoryIcon',
    'Circle': 'CircleIcon',
    'CheckCircleIcon2': 'CheckCircle',
    'AlertCircleIcon': 'AlertCircle',
    'CheckCircleIcon': 'CheckCircle',
    'XCircleIcon': 'XCircle'
  };

  for (const [oldIcon, newIcon] of Object.entries(iconReplacements)) {
    if (content.includes(oldIcon)) {
      content = content.replace(new RegExp(`\\b${oldIcon}\\b`, 'g'), newIcon);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Исправлен: ${filePath}`);
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
