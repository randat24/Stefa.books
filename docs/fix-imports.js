const fs = require('fs');
const path = require('path');

// Функция для рекурсивного поиска файлов
function findFiles(dir, pattern) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, pattern));
    } else if (pattern.test(file)) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Найти все .tsx и .ts файлы
const files = findFiles('./src', /\.(tsx|ts)$/);

// Замены для импортов
const importReplacements = [
  {
    from: /@\/components\/ui\/Button/g,
    to: '@/components/ui/button'
  },
  {
    from: /@\/components\/ui\/Badge/g,
    to: '@/components/ui/badge'
  },
  {
    from: /@\/components\/ui\/Checkbox/g,
    to: '@/components/ui/checkbox'
  }
];

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Исправить импорты
    importReplacements.forEach(replacement => {
      if (replacement.from.test(content)) {
        content = content.replace(replacement.from, replacement.to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Fixed imports: ${file}`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log('Import fixes completed!');
