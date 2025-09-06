#!/usr/bin/env node

/**
 * Скрипт для применения исправлений оставшихся security issues
 * Исправляет Extension in Public и RLS Enabled No Policy предупреждения
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Применение исправлений оставшихся security issues...\n');

// Путь к файлу миграции
const migrationFile = path.join(__dirname, '..', 'supabase', 'migrations', '015_fix_remaining_security_issues.sql');

// Проверяем существование файла
if (!fs.existsSync(migrationFile)) {
    console.error('❌ Файл миграции не найден:', migrationFile);
    process.exit(1);
}

// Читаем содержимое файла
const migrationContent = fs.readFileSync(migrationFile, 'utf8');

console.log('📄 Содержимое миграции:');
console.log('=' .repeat(50));
console.log(migrationContent);
console.log('=' .repeat(50));

console.log('\n✅ Файл миграции готов к применению!');
console.log('\n📋 Инструкции по применению:');
console.log('1. Откройте Supabase Dashboard');
console.log('2. Перейдите в раздел SQL Editor');
console.log('3. Скопируйте содержимое файла supabase/migrations/015_fix_remaining_security_issues.sql');
console.log('4. Вставьте и выполните SQL');
console.log('5. Проверьте Security Advisor - все предупреждения должны исчезнуть');

console.log('\n🎯 Исправляемые проблемы:');
console.log('• Extension in Public (pg_trgm)');
console.log('• RLS Enabled No Policy (subcategories)');
console.log('• Дополнительные RLS политики для всех таблиц');

console.log('\n🔐 Все таблицы получат правильные RLS политики для безопасности');
