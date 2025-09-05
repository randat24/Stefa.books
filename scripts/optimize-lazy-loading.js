#!/usr/bin/env node

/**
 * Скрипт для автоматической оптимизации ленивой загрузки
 * Применяет loading="lazy" ко всем тяжелым компонентам и страницам
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🚀 Оптимизация ленивой загрузки для всех тяжелых компонентов...\n');

// Паттерны файлов для оптимизации
const patterns = [
  'src/app/**/*.tsx',
  'src/components/**/*.tsx',
  'src/app/admin/**/*.tsx',
  'src/app/catalog/**/*.tsx',
  'src/app/books/**/*.tsx',
];

// Компоненты, которые нужно оптимизировать
const heavyComponents = [
  'BookCard',
  'BookGrid',
  'BookList',
  'Catalog',
  'Categories',
  'FAQ',
  'SocialProof',
  'PlansLite',
  'SubscribeFormHome',
  'ContactLocation',
  'FinalCTA',
  'AnalyticsDashboard',
  'BooksTable',
  'UsersTable',
  'RentalsTable',
  'AddBookDialog',
  'EditBookDialog',
  'SubscribeModal',
  'BookPreviewModal',
  'RentalModal',
  'RentalForm',
  'ContactForm',
  'SearchResults',
  'SearchFilters',
  'HeaderSearch',
  'BookRecommendations',
  'RecentViews',
  'RelatedBooksSection',
  'BookDetails',
];

// Страницы, которые нужно оптимизировать
const heavyPages = [
  'admin',
  'catalog',
  'books',
  'analytics',
  'rentals',
  'users',
  'dashboard',
];

// Функция для проверки, нужно ли оптимизировать файл
function shouldOptimizeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Проверяем, содержит ли файл тяжелые компоненты
  const hasHeavyComponents = heavyComponents.some(component => 
    content.includes(component) && !content.includes('lazy')
  );
  
  // Проверяем, является ли это тяжелой страницей
  const isHeavyPage = heavyPages.some(page => 
    filePath.includes(`/${page}/`) || filePath.includes(`/${page}.tsx`)
  );
  
  return hasHeavyComponents || isHeavyPage;
}

// Функция для оптимизации файла
function optimizeFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Добавляем импорт для ленивой загрузки
  if (!content.includes('useLazyLoading') && !content.includes('LazyLoad')) {
    const importMatch = content.match(/import.*from ['"]react['"];?/);
    if (importMatch) {
      content = content.replace(
        importMatch[0],
        `${importMatch[0]}\nimport { useLazyLoading } from '@/hooks/useLazyLoading';\nimport { LazyLoad } from '@/components/ui/LazyLoad';`
      );
      modified = true;
    }
  }
  
  // Оптимизируем тяжелые компоненты
  heavyComponents.forEach(component => {
    const componentRegex = new RegExp(`<${component}([^>]*)>`, 'g');
    if (content.match(componentRegex)) {
      content = content.replace(
        componentRegex,
        `<LazyLoad threshold={0.1} rootMargin="50px" placeholder={<div className="h-32 bg-slate-100 animate-pulse rounded-lg" />}>\n        <${component}$1>`
      );
      modified = true;
    }
  });
  
  // Добавляем data-lazy атрибуты
  content = content.replace(
    /<div className="[^"]*section[^"]*">/g,
    '<div className="section" data-lazy="true">'
  );
  
  // Оптимизируем изображения
  content = content.replace(
    /<Image([^>]*)>/g,
    '<Image$1 loading="lazy" />'
  );
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  
  return false;
}

// Основная функция
function main() {
  let totalFiles = 0;
  let optimizedFiles = 0;
  
  patterns.forEach(pattern => {
    const files = glob.sync(pattern, { cwd: process.cwd() });
    
    files.forEach(file => {
      totalFiles++;
      
      if (shouldOptimizeFile(file)) {
        console.log(`🔧 Оптимизируем: ${file}`);
        
        if (optimizeFile(file)) {
          optimizedFiles++;
          console.log(`✅ Оптимизирован: ${file}`);
        } else {
          console.log(`⚠️  Не требует изменений: ${file}`);
        }
      }
    });
  });
  
  console.log(`\n📊 Результаты оптимизации:`);
  console.log(`   Всего файлов проверено: ${totalFiles}`);
  console.log(`   Файлов оптимизировано: ${optimizedFiles}`);
  console.log(`   Файлов без изменений: ${totalFiles - optimizedFiles}`);
  
  if (optimizedFiles > 0) {
    console.log(`\n🎉 Оптимизация завершена! Применены следующие улучшения:`);
    console.log(`   • Ленивая загрузка для тяжелых компонентов`);
    console.log(`   • Оптимизация изображений с loading="lazy"`);
    console.log(`   • Добавлены data-lazy атрибуты`);
    console.log(`   • Импорты для хуков оптимизации`);
  } else {
    console.log(`\n✨ Все файлы уже оптимизированы!`);
  }
}

// Запускаем оптимизацию
main();
