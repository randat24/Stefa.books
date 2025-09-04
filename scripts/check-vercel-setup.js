#!/usr/bin/env node

/**
 * 🔍 Скрипт перевірки готовності до деплою на Vercel
 * Використання: node scripts/check-vercel-setup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Кольори для консолі
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const check = (name, condition, message) => {
  if (condition) {
    log(`✅ ${name}: ${message}`, 'green');
    return true;
  } else {
    log(`❌ ${name}: ${message}`, 'red');
    return false;
  }
};

const warning = (name, message) => {
  log(`⚠️  ${name}: ${message}`, 'yellow');
};

const main = () => {
  log('\n🔍 Перевірка готовності до деплою на Vercel\n', 'bold');

  let allChecksPassed = true;

  // 1. Перевірка package.json
  log('📦 Перевірка package.json...', 'blue');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    allChecksPassed &= check(
      'Package name',
      packageJson.name && packageJson.name !== 'undefined',
      `"${packageJson.name}"`
    );
    
    allChecksPassed &= check(
      'Build script',
      packageJson.scripts && packageJson.scripts.build,
      'Наявний'
    );
    
    allChecksPassed &= check(
      'Start script',
      packageJson.scripts && packageJson.scripts.start,
      'Наявний'
    );
    
    allChecksPassed &= check(
      'Next.js dependency',
      packageJson.dependencies && packageJson.dependencies.next,
      `v${packageJson.dependencies.next}`
    );
    
    allChecksPassed &= check(
      'React dependency',
      packageJson.dependencies && packageJson.dependencies.react,
      `v${packageJson.dependencies.react}`
    );
    
  } catch (error) {
    allChecksPassed = false;
    log(`❌ Помилка читання package.json: ${error.message}`, 'red');
  }

  // 2. Перевірка next.config.js
  log('\n⚙️  Перевірка next.config.js...', 'blue');
  try {
    const nextConfigExists = fs.existsSync('next.config.js');
    allChecksPassed &= check(
      'Next.js config',
      nextConfigExists,
      nextConfigExists ? 'Знайдено' : 'Не знайдено'
    );
    
    if (nextConfigExists) {
      const nextConfig = fs.readFileSync('next.config.js', 'utf8');
      allChecksPassed &= check(
        'Image optimization',
        nextConfig.includes('images:'),
        'Налаштовано'
      );
    }
  } catch (error) {
    allChecksPassed = false;
    log(`❌ Помилка перевірки next.config.js: ${error.message}`, 'red');
  }

  // 3. Перевірка vercel.json
  log('\n🚀 Перевірка vercel.json...', 'blue');
  try {
    const vercelConfigExists = fs.existsSync('vercel.json');
    allChecksPassed &= check(
      'Vercel config',
      vercelConfigExists,
      vercelConfigExists ? 'Знайдено' : 'Не знайдено'
    );
    
    if (vercelConfigExists) {
      const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
      allChecksPassed &= check(
        'Vercel version',
        vercelConfig.version === 2,
        `v${vercelConfig.version}`
      );
    }
  } catch (error) {
    allChecksPassed = false;
    log(`❌ Помилка перевірки vercel.json: ${error.message}`, 'red');
  }

  // 4. Перевірка TypeScript
  log('\n📝 Перевірка TypeScript...', 'blue');
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    allChecksPassed &= check(
      'TypeScript compilation',
      true,
      'Без помилок'
    );
  } catch (error) {
    allChecksPassed = false;
    log(`❌ Помилки TypeScript: ${error.message}`, 'red');
  }

  // 5. Перевірка ESLint
  log('\n🔍 Перевірка ESLint...', 'blue');
  try {
    execSync('npx next lint', { stdio: 'pipe' });
    allChecksPassed &= check(
      'ESLint',
      true,
      'Без помилок'
    );
  } catch (error) {
    warning(
      'ESLint',
      'Є попередження або помилки'
    );
  }

  // 6. Перевірка .gitignore
  log('\n📁 Перевірка .gitignore...', 'blue');
  try {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    allChecksPassed &= check(
      'Environment files ignored',
      gitignore.includes('.env') && gitignore.includes('.env.local'),
      'Налаштовано'
    );
    
    allChecksPassed &= check(
      'Next.js build ignored',
      gitignore.includes('.next'),
      'Налаштовано'
    );
    
    allChecksPassed &= check(
      'Node modules ignored',
      gitignore.includes('node_modules'),
      'Налаштовано'
    );
  } catch (error) {
    allChecksPassed = false;
    log(`❌ Помилка перевірки .gitignore: ${error.message}`, 'red');
  }

  // 7. Перевірка структури проекту
  log('\n🏗️  Перевірка структури проекту...', 'blue');
  const requiredDirs = ['src/app', 'src/components', 'src/lib', 'public'];
  const requiredFiles = ['src/app/layout.tsx', 'src/app/page.tsx', 'src/app/globals.css'];
  
  requiredDirs.forEach(dir => {
    allChecksPassed &= check(
      `Directory ${dir}`,
      fs.existsSync(dir),
      fs.existsSync(dir) ? 'Існує' : 'Не знайдено'
    );
  });
  
  requiredFiles.forEach(file => {
    allChecksPassed &= check(
      `File ${file}`,
      fs.existsSync(file),
      fs.existsSync(file) ? 'Існує' : 'Не знайдено'
    );
  });

  // 8. Перевірка змінних середовища
  log('\n🔑 Перевірка змінних середовища...', 'blue');
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'NEXT_PUBLIC_SITE_URL'
  ];
  
  let envVarsConfigured = 0;
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      envVarsConfigured++;
    }
  });
  
  if (envVarsConfigured === requiredEnvVars.length) {
    allChecksPassed &= check(
      'Environment variables',
      true,
      `Всі ${requiredEnvVars.length} змінних налаштовані`
    );
  } else {
    warning(
      'Environment variables',
      `Налаштовано ${envVarsConfigured} з ${requiredEnvVars.length} змінних`
    );
    log('   Не забудьте налаштувати змінні в Vercel Dashboard', 'yellow');
  }

  // 9. Перевірка Git статусу
  log('\n📋 Перевірка Git статусу...', 'blue');
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim() === '') {
      allChecksPassed &= check(
        'Git status',
        true,
        'Всі зміни збережено'
      );
    } else {
      warning(
        'Git status',
        'Є незбережені зміни'
      );
      log('   Рекомендується зберегти зміни перед деплоєм', 'yellow');
    }
  } catch (error) {
    warning('Git status', 'Не вдалося перевірити статус Git');
  }

  // Підсумок
  log('\n📊 Підсумок перевірки:', 'bold');
  if (allChecksPassed) {
    log('🎉 Всі перевірки пройшли успішно! Проект готовий до деплою на Vercel.', 'green');
    log('\n🚀 Наступні кроки:', 'blue');
    log('   1. Налаштуйте змінні середовища в Vercel Dashboard');
    log('   2. Запустіть: ./scripts/vercel-deploy.sh');
    log('   3. Або: vercel --prod');
  } else {
    log('⚠️  Деякі перевірки не пройшли. Виправте помилки перед деплоєм.', 'yellow');
    log('\n🔧 Рекомендації:', 'blue');
    log('   1. Виправте помилки TypeScript та ESLint');
    log('   2. Переконайтеся, що всі файли налаштовані');
    log('   3. Налаштуйте змінні середовища');
    log('   4. Збережіть зміни в Git');
  }

  log('\n📚 Документація: VERCEL_DEPLOYMENT_GUIDE.md', 'blue');
  
  process.exit(allChecksPassed ? 0 : 1);
};

main();
