#!/usr/bin/env node

/**
 * Complete React Types Fix Script
 * Полностью исправляет все проблемы с React типами
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting complete React types fix...');

function runCommand(command, description) {
  console.log(`📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
  return true;
}

async function fixReactTypes() {
  try {
    // 1. Очищаем все кэши
    console.log('🧹 Cleaning all caches...');
    const cacheDirs = [
      '.next',
      'node_modules/.cache',
      '.vscode',
      path.join(require('os').homedir(), '.cache/typescript')
    ];
    
    cacheDirs.forEach(dir => {
      const fullPath = path.resolve(dir);
      if (fs.existsSync(fullPath)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`✅ Removed ${dir}`);
      }
    });

    // 2. Очищаем pnpm store
    if (!runCommand('pnpm store prune', 'Pruning pnpm store')) {
      return false;
    }

    // 3. Переустанавливаем зависимости
    if (!runCommand('pnpm install', 'Installing dependencies')) {
      return false;
    }

    // 4. Устанавливаем React 19 типы принудительно
    if (!runCommand('pnpm add -D "@types/react@^19.1.12" "@types/react-dom@^19.1.9" "@types/node@20.14.10" "@types/jest@^30.0.0"', 'Installing React 19 types')) {
      return false;
    }

    // 5. Проверяем установку типов
    const reactTypesPath = path.join(process.cwd(), 'node_modules/@types/react/package.json');
    if (fs.existsSync(reactTypesPath)) {
      const packageJson = JSON.parse(fs.readFileSync(reactTypesPath, 'utf8'));
      console.log(`✅ React types installed: v${packageJson.version}`);
      
      if (!packageJson.version.startsWith('19.')) {
        console.error('❌ Wrong React types version installed');
        return false;
      }
    } else {
      console.error('❌ React types not found');
      return false;
    }

    // 6. Очищаем TypeScript кэши
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

    // 7. Перезапускаем TypeScript сервер
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      const now = new Date();
      fs.utimesSync(tsconfigPath, now, now);
      console.log('✅ Touched tsconfig.json to restart TS server');
    }

    // 8. Проверяем компиляцию
    if (!runCommand('pnpm run type-check', 'Testing TypeScript compilation')) {
      return false;
    }

    console.log('');
    console.log('🎉 React types fix completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Restart your IDE completely');
    console.log('   2. In VS Code: Ctrl/Cmd + Shift + P → "TypeScript: Restart TS Server"');
    console.log('   3. Check that type errors are gone');
    
    return true;

  } catch (error) {
    console.error('❌ React types fix failed:', error.message);
    return false;
  }
}

fixReactTypes().then(success => {
  process.exit(success ? 0 : 1);
});