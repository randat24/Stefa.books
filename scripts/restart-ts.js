#!/usr/bin/env node

/**
 * TypeScript Server Restart Script
 * Помогает перезапустить TypeScript сервер и очистить кэши IDE
 */

console.log('🔄 Restarting TypeScript server and clearing caches...');

const fs = require('fs');
const path = require('path');

// 1. Очищаем TypeScript кэши
const tsCacheDir = path.join(process.cwd(), 'node_modules/.cache/typescript');
if (fs.existsSync(tsCacheDir)) {
  fs.rmSync(tsCacheDir, { recursive: true, force: true });
  console.log('✅ Cleared TypeScript cache');
}

// 2. Очищаем .tsbuildinfo файлы
const tsBuildInfoFiles = [
  '.tsbuildinfo',
  'tsconfig.tsbuildinfo',
  '.next/tsconfig.tsbuildinfo'
];

tsBuildInfoFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`✅ Removed ${file}`);
  }
});

// 3. Трогаем tsconfig.json для перезапуска сервера
const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  const now = new Date();
  fs.utimesSync(tsconfigPath, now, now);
  console.log('✅ Touched tsconfig.json to restart TS server');
}

console.log('');
console.log('🎉 TypeScript server should restart automatically in your IDE');
console.log('💡 If you still see type errors, try:');
console.log('   1. Restart your IDE completely');
console.log('   2. Run "pnpm run type-check" to verify types work');
console.log('   3. In VS Code: Ctrl/Cmd + Shift + P → "TypeScript: Restart TS Server"');