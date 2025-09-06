#!/usr/bin/env node

/**
 * Build script with pages-manifest.json fix
 * Исправляет проблему с отсутствующим pages-manifest.json в Next.js 15 App Router
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting build with pages-manifest.json fix...');

// 1. Убедимся, что директория .next/server существует
const serverDir = path.join(process.cwd(), '.next', 'server');
const pagesManifestPath = path.join(serverDir, 'pages-manifest.json');

// 2. Создаем минимальный pages-manifest.json если его нет
function ensurePagesManifest() {
  if (!fs.existsSync(serverDir)) {
    fs.mkdirSync(serverDir, { recursive: true });
  }
  
  if (!fs.existsSync(pagesManifestPath)) {
    const manifest = {
      "/_app": "pages/_app.js",
      "/_error": "pages/_error.js",
      "/_document": "pages/_document.js",
      "/404": "pages/404.html"
    };
    fs.writeFileSync(pagesManifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ Created pages-manifest.json');
  }
}

// 3. Запускаем сборку
try {
  // Убираем NODE_ENV предупреждение
  delete process.env.NODE_ENV;
  
  console.log('📦 Running Next.js build...');
  
  // Создаем manifest перед сборкой
  ensurePagesManifest();
  
  // Запускаем сборку
  execSync('pnpm run build', { 
    stdio: 'inherit',
    env: { 
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  });
  
  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  
  // Если ошибка все еще связана с pages-manifest, попробуем еще раз
  if (error.message.includes('pages-manifest.json')) {
    console.log('🔄 Retrying with pages-manifest fix...');
    ensurePagesManifest();
    
    try {
      execSync('pnpm run build', { 
        stdio: 'inherit',
        env: { 
          ...process.env,
          NODE_OPTIONS: '--max-old-space-size=4096'
        }
      });
      console.log('✅ Build completed on retry!');
    } catch (retryError) {
      console.error('❌ Build failed on retry:', retryError.message);
      process.exit(1);
    }
  } else {
    process.exit(1);
  }
}