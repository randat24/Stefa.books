#!/usr/bin/env node

/**
 * Скрипт для проверки всех примененных оптимизаций
 * Проверяет, что ленивая загрузка правильно применена ко всем тяжелым компонентам
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 Проверка примененных оптимизаций...\n');

// Статистика проверки
let totalFiles = 0;
let optimizedFiles = 0;
let issuesFound = 0;
const issues = [];

// Паттерны для проверки
const patterns = [
  'src/app/**/*.tsx',
  'src/components/**/*.tsx',
];

// Компоненты, которые должны быть оптимизированы
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

/**
 * Проверяет файл на наличие оптимизаций
 * @param {string} filePath - Путь к файлу для проверки
 * @returns {Object} - Результат проверки файла
 */
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let fileOptimized = true;
  const fileIssues = [];
  
  // Проверяем наличие тяжелых компонентов
  heavyComponents.forEach(component => {
    const componentRegex = new RegExp(`<${component}([^>]*)>`, 'g');
    const matches = content.match(componentRegex);
    
    if (matches) {
      // Проверяем, есть ли ленивая загрузка
      const hasLazyLoad = content.includes('LazyLoad') || content.includes('lazy');
      const hasSuspense = content.includes('Suspense');
      const hasLazyImport = content.includes('LazyComponents') || content.includes('lazy(');
      
      if (!hasLazyLoad && !hasLazyImport) {
        fileOptimized = false;
        fileIssues.push(`Компонент ${component} не оптимизирован`);
      }
    }
  });
  
  // Проверяем изображения
  const imageRegex = /<img([^>]*)>/g;
  const imageMatches = content.match(imageRegex);
  
  if (imageMatches) {
    imageMatches.forEach(match => {
      if (!match.includes('loading=') && !match.includes('LazyImage')) {
        fileOptimized = false;
        fileIssues.push('Изображение без loading="lazy"');
      }
    });
  }
  
  // Проверяем Next.js Image компоненты
  const nextImageRegex = /<Image([^>]*)>/g;
  const nextImageMatches = content.match(nextImageRegex);
  
  if (nextImageMatches) {
    nextImageMatches.forEach(match => {
      if (!match.includes('loading=') && !match.includes('LazyImage')) {
        fileOptimized = false;
        fileIssues.push('Next.js Image без loading="lazy"');
      }
    });
  }
  
  // Проверяем наличие data-lazy атрибутов
  const hasDataLazy = content.includes('data-lazy');
  const hasLazySection = content.includes('LazySection');
  
  if (!hasDataLazy && !hasLazySection && content.includes('section')) {
        fileIssues.push('Секция без data-lazy атрибута');
  }
  
  if (fileIssues.length > 0) {
    issues.push({
      file: filePath,
      issues: fileIssues
    });
    issuesFound += fileIssues.length;
  }
  
  return fileOptimized;
}

// Основная функция проверки
function main() {
  patterns.forEach(pattern => {
    const files = glob.sync(pattern, { cwd: process.cwd() });
    
    files.forEach(file => {
      totalFiles++;
      
      if (checkFile(file)) {
        optimizedFiles++;
      }
    });
  });
  
  // Выводим результаты
  console.log('📊 Результаты проверки:');
  console.log(`   Всего файлов проверено: ${totalFiles}`);
  console.log(`   Файлов оптимизировано: ${optimizedFiles}`);
  console.log(`   Файлов с проблемами: ${issues.length}`);
  console.log(`   Всего проблем найдено: ${issuesFound}`);
  
  if (issues.length > 0) {
    console.log('\n⚠️  Найденные проблемы:');
    issues.forEach(({ file, issues: fileIssues }) => {
      console.log(`\n📁 ${file}:`);
      fileIssues.forEach(issue => {
        console.log(`   • ${issue}`);
      });
    });
  }
  
  // Оценка оптимизации
  const optimizationScore = Math.round((optimizedFiles / totalFiles) * 100);
  
  console.log(`\n🎯 Оценка оптимизации: ${optimizationScore}%`);
  
  if (optimizationScore >= 90) {
    console.log('🎉 Отличная оптимизация! Почти все компоненты оптимизированы.');
  } else if (optimizationScore >= 70) {
    console.log('✅ Хорошая оптимизация! Большинство компонентов оптимизированы.');
  } else if (optimizationScore >= 50) {
    console.log('⚠️  Средняя оптимизация. Рекомендуется дополнительная работа.');
  } else {
    console.log('❌ Низкая оптимизация. Требуется значительная работа.');
  }
  
  // Рекомендации
  if (issuesFound > 0) {
    console.log('\n💡 Рекомендации:');
    console.log('   1. Запустите скрипт оптимизации: node scripts/optimize-lazy-loading.js');
    console.log('   2. Используйте AutoLazyWrapper для новых компонентов');
    console.log('   3. Применяйте LazyImageOptimized для изображений');
    console.log('   4. Добавляйте data-lazy атрибуты к секциям');
  }
  
  console.log('\n✨ Проверка завершена!');
}

// Запускаем проверку
main();
