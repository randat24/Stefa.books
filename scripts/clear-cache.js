#!/usr/bin/env node

/**
 * Скрипт для принудительной очистки кеша при деплое
 * Запускать перед каждым деплоем на Netlify
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Начинаем принудительную очистку кеша...');

// 1. Генерируем новый build ID
const generateBuildId = () => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
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

// 3. Создаем файл с метаданными деплоя
const deployMetaPath = path.join(process.cwd(), 'public', 'deploy-meta.json');
const deployMeta = {
  buildId: newBuildId,
  timestamp: new Date().toISOString(),
  version: process.env.COMMIT_REF || process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  environment: process.env.NODE_ENV || 'development'
};

// Создаем директорию public если её нет
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(deployMetaPath, JSON.stringify(deployMeta, null, 2));
console.log(`✅ Создан файл метаданных деплоя: ${deployMetaPath}`);

// 4. Обновляем Service Worker с новым именем кеша
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

// 5. Создаем файл версии для отслеживания
const versionPath = path.join(process.cwd(), 'public', 'version.txt');
fs.writeFileSync(versionPath, newBuildId);
console.log(`✅ Создан файл версии: ${versionPath}`);

console.log('🎉 Принудительная очистка кеша завершена!');
console.log(`📦 Новая версия: ${newBuildId}`);
console.log('🚀 Готово к деплою!');
