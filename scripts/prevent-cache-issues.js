#!/usr/bin/env node

/**
 * Скрипт для предотвращения проблем с кешем Next.js
 * Автоматически очищает проблемные кеш директории при запуске
 */

const fs = require('fs');
const path = require('path');

const CACHE_DIRS = [
  '.next/cache',
  '.next/types',
  'node_modules/.cache'
];

function removeDirectory(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✓ Удален кеш: ${dirPath}`);
    }
  } catch (error) {
    console.warn(`⚠ Не удалось удалить ${dirPath}:`, error.message);
  }
}

function cleanCache() {
  console.log('🧹 Очистка кеша Next.js...');
  
  CACHE_DIRS.forEach(dir => {
    removeDirectory(path.join(process.cwd(), dir));
  });
  
  console.log('✅ Кеш очищен');
}

// Запустить очистку
cleanCache();