#!/usr/bin/env node

/**
 * Скрипт для принудительной очистки кеша при деплое
 * Решает проблему с необходимостью Ctrl+Shift+R
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Принудительная очистка кеша для решения проблемы Ctrl+Shift+R...');

// 1. Генерируем новый Build ID с временной меткой
const generateBuildId = () => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
};

const newBuildId = generateBuildId();

// 2. Обновляем next.config.js с новым build ID
const nextConfigPath = path.join(process.cwd(), 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  let config = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Заменяем старый build ID на новый
  config = config.replace(
    /const BUILD_ID = .*?;/,
    `const BUILD_ID = '${newBuildId}';`
  );
  
  fs.writeFileSync(nextConfigPath, config);
  console.log(`✅ Обновлен BUILD_ID: ${newBuildId}`);
}

// 3. Обновляем Service Worker с новым именем кеша
const swPath = path.join(process.cwd(), 'public', 'sw.js');
if (fs.existsSync(swPath)) {
  let swContent = fs.readFileSync(swPath, 'utf8');
  
  // Заменяем CACHE_NAME на новое значение
  swContent = swContent.replace(
    /const CACHE_NAME = .*?;/,
    `const CACHE_NAME = 'stefa-books-cache-${newBuildId}';`
  );
  
  // Обновляем BUILD_ID в Service Worker
  swContent = swContent.replace(
    /const BUILD_ID = .*?;/,
    `const BUILD_ID = '${newBuildId}';`
  );
  
  fs.writeFileSync(swPath, swContent);
  console.log(`✅ Обновлен Service Worker с новым кешем: ${newBuildId}`);
}

// 4. Создаем файл с метаданными для принудительной очистки
const cacheMetaPath = path.join(process.cwd(), 'public', 'cache-meta.json');
const cacheMeta = {
  buildId: newBuildId,
  timestamp: new Date().toISOString(),
  version: process.env.COMMIT_REF || process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  environment: process.env.NODE_ENV || 'development',
  cacheBuster: true,
  forceReload: true
};

// Создаем директорию public если её нет
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(cacheMetaPath, JSON.stringify(cacheMeta, null, 2));
console.log(`✅ Создан файл метаданных кеша: ${cacheMetaPath}`);

// 5. Создаем файл версии для отслеживания
const versionPath = path.join(process.cwd(), 'public', 'version.txt');
fs.writeFileSync(versionPath, newBuildId);
console.log(`✅ Создан файл версии: ${versionPath}`);

// 6. Создаем файл для принудительной очистки кеша браузера
const cacheClearScript = `
// Автоматическая очистка кеша браузера
(function() {
  const currentVersion = '${newBuildId}';
  const storedVersion = localStorage.getItem('stefa-books-version');
  
  if (storedVersion && storedVersion !== currentVersion) {
    console.log('🔄 Обнаружена новая версия, очищаем кеш...');
    
    // Очищаем все кеши
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    // Очищаем localStorage и sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Сохраняем новую версию
    localStorage.setItem('stefa-books-version', currentVersion);
    
    // Перезагружаем страницу
    window.location.reload();
  } else {
    localStorage.setItem('stefa-books-version', currentVersion);
  }
})();
`;

const cacheClearPath = path.join(process.cwd(), 'public', 'cache-clear.js');
fs.writeFileSync(cacheClearPath, cacheClearScript);
console.log(`✅ Создан скрипт автоматической очистки кеша: ${cacheClearPath}`);

console.log('🎉 Принудительная очистка кеша завершена!');
console.log(`📦 Новая версия: ${newBuildId}`);
console.log('🚀 Пользователям больше НЕ нужно нажимать Ctrl+Shift+R!');
console.log('💡 Кеш будет очищаться автоматически при обновлениях');
