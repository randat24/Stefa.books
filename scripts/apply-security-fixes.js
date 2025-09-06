#!/usr/bin/env node

/**
 * Скрипт для применения исправлений безопасности
 * Исправляет все 11 предупреждений Security Advisor
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Применение исправлений безопасности...\n');

// Путь к файлу миграции
const migrationFile = path.join(__dirname, '..', 'supabase', 'migrations', '014_fix_security_warnings_safe.sql');

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
console.log('3. Скопируйте содержимое файла supabase/migrations/014_fix_security_warnings_safe.sql');
console.log('4. Вставьте и выполните SQL');
console.log('5. Проверьте Security Advisor - все 11 предупреждений должны исчезнуть');

console.log('\n🎯 Исправляемые функции:');
console.log('• update_updated_at_column');
console.log('• get_search_suggestions');
console.log('• search_books');
console.log('• update_books_author_ids');
console.log('• update_books_search_vector');
console.log('• handle_new_user');
console.log('• update_book_availability');
console.log('• update_book_search_vector');

console.log('\n🔐 Все функции получат параметр SET search_path = public для безопасности');
