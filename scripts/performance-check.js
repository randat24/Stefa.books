#!/usr/bin/env node

/**
 * Скрипт для проверки производительности анимаций
 * Проверяет Lighthouse метрики и производительность анимаций
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Запуск проверки производительности анимаций...\n');

// Функция для запуска Lighthouse
function runLighthouse(url) {
  try {
    console.log(`📊 Запуск Lighthouse для ${url}...`);
    
    const command = `npx lighthouse ${url} --output=json --output-path=./lighthouse-report.json --chrome-flags="--headless" --only-categories=performance,accessibility,best-practices`;
    
    execSync(command, { stdio: 'pipe' });
    
    // Читаем отчет
    const report = JSON.parse(fs.readFileSync('./lighthouse-report.json', 'utf8'));
    
    return {
      performance: report.categories.performance.score * 100,
      accessibility: report.categories.accessibility.score * 100,
      bestPractices: report.categories['best-practices'].score * 100,
      metrics: report.audits
    };
  } catch (error) {
    console.error('❌ Ошибка при запуске Lighthouse:', error.message);
    return null;
  }
}

// Функция для проверки размера бандла
function checkBundleSize() {
  try {
    console.log('📦 Проверка размера бандла...');
    
    const command = 'npx next build';
    execSync(command, { stdio: 'pipe' });
    
    // Проверяем размер .next/static
    const staticDir = path.join(process.cwd(), '.next/static');
    if (fs.existsSync(staticDir)) {
      const files = fs.readdirSync(staticDir, { recursive: true });
      let totalSize = 0;
      
      files.forEach(file => {
        const filePath = path.join(staticDir, file);
        if (fs.statSync(filePath).isFile()) {
          totalSize += fs.statSync(filePath).size;
        }
      });
      
      return {
        totalSize: totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Ошибка при проверке размера бандла:', error.message);
    return null;
  }
}

// Функция для проверки TypeScript ошибок
function checkTypeScript() {
  try {
    console.log('🔍 Проверка TypeScript...');
    
    const command = 'npx tsc --noEmit';
    execSync(command, { stdio: 'pipe' });
    
    return { success: true };
  } catch (error) {
    console.error('❌ TypeScript ошибки:', error.message);
    return { success: false, error: error.message };
  }
}

// Функция для проверки ESLint
function checkESLint() {
  try {
    console.log('🔍 Проверка ESLint...');
    
    const command = 'npx eslint src --ext .ts,.tsx --max-warnings 0';
    execSync(command, { stdio: 'pipe' });
    
    return { success: true };
  } catch (error) {
    console.error('❌ ESLint ошибки:', error.message);
    return { success: false, error: error.message };
  }
}

// Основная функция
async function main() {
  const results = {
    timestamp: new Date().toISOString(),
    typescript: null,
    eslint: null,
    bundleSize: null,
    lighthouse: null
  };

  // Проверяем TypeScript
  results.typescript = checkTypeScript();
  
  // Проверяем ESLint
  results.eslint = checkESLint();
  
  // Проверяем размер бандла
  results.bundleSize = checkBundleSize();
  
  // Запускаем Lighthouse (только если есть локальный сервер)
  const localUrl = 'http://localhost:3000';
  try {
    // Проверяем, доступен ли локальный сервер
    execSync(`curl -s -o /dev/null -w "%{http_code}" ${localUrl}`, { stdio: 'pipe' });
    results.lighthouse = runLighthouse(localUrl);
  } catch (error) {
    console.log('⚠️  Локальный сервер недоступен, пропускаем Lighthouse проверку');
    console.log('   Запустите "pnpm dev" и повторите проверку');
  }

  // Выводим результаты
  console.log('\n📋 Результаты проверки производительности:');
  console.log('=====================================');
  
  // TypeScript
  if (results.typescript?.success) {
    console.log('✅ TypeScript: Без ошибок');
  } else {
    console.log('❌ TypeScript: Есть ошибки');
  }
  
  // ESLint
  if (results.eslint?.success) {
    console.log('✅ ESLint: Без ошибок');
  } else {
    console.log('❌ ESLint: Есть ошибки');
  }
  
  // Размер бандла
  if (results.bundleSize) {
    console.log(`📦 Размер бандла: ${results.bundleSize.totalSizeMB} MB`);
    if (results.bundleSize.totalSizeMB > 5) {
      console.log('⚠️  Размер бандла превышает 5MB, рекомендуется оптимизация');
    }
  }
  
  // Lighthouse
  if (results.lighthouse) {
    console.log(`📊 Lighthouse Performance: ${results.lighthouse.performance.toFixed(1)}/100`);
    console.log(`📊 Lighthouse Accessibility: ${results.lighthouse.accessibility.toFixed(1)}/100`);
    console.log(`📊 Lighthouse Best Practices: ${results.lighthouse.bestPractices.toFixed(1)}/100`);
    
    // Проверяем критические метрики
    const performance = results.lighthouse.performance;
    if (performance < 90) {
      console.log('⚠️  Performance score ниже 90, рекомендуется оптимизация');
    }
    
    const accessibility = results.lighthouse.accessibility;
    if (accessibility < 90) {
      console.log('⚠️  Accessibility score ниже 90, рекомендуется улучшение');
    }
  }

  // Сохраняем отчет
  const reportPath = './performance-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Отчет сохранен в ${reportPath}`);

  // Очищаем временные файлы
  if (fs.existsSync('./lighthouse-report.json')) {
    fs.unlinkSync('./lighthouse-report.json');
  }

  console.log('\n🎉 Проверка производительности завершена!');
}

// Запускаем проверку
main().catch(console.error);
