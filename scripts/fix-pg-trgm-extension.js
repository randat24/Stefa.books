#!/usr/bin/env node

/**
 * Скрипт для исправления Extension in Public warning для pg_trgm
 * Перемещает расширение pg_trgm из public схемы в extensions схему
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Исправление Extension in Public warning для pg_trgm...\n');

// Путь к файлу миграции
const migrationFile = path.join(__dirname, '..', 'supabase', 'migrations', '016_fix_pg_trgm_extension.sql');

// Проверяем существование файла
if (!fs.existsSync(migrationFile)) {
    console.error('❌ Файл миграции не найден:', migrationFile);
    process.exit(1);
}

// Читаем содержимое файла
const migrationContent = fs.readFileSync(migrationFile, 'utf8');

console.log('📄 Содержимое миграции:');
console.log('=' .repeat(60));
console.log(migrationContent);
console.log('=' .repeat(60));

console.log('\n✅ Файл миграции готов к применению!');
console.log('\n📋 Инструкции по применению:');
console.log('1. Откройте Supabase Dashboard');
console.log('2. Перейдите в раздел SQL Editor');
console.log('3. Скопируйте содержимое файла supabase/migrations/016_fix_pg_trgm_extension.sql');
console.log('4. Вставьте и выполните SQL');
console.log('5. Проверьте Security Advisor - Extension in Public warning должен исчезнуть');

console.log('\n🎯 Что делает миграция:');
console.log('• Создает схему extensions');
console.log('• Пытается переместить pg_trgm из public в extensions');
console.log('• Создает алиасы функций в extensions схеме');
console.log('• Настраивает права доступа');

console.log('\n⚠️  Примечание:');
console.log('В Supabase некоторые расширения могут быть заблокированы для перемещения');
console.log('из-за ограничений безопасности. В таком случае создаются алиасы функций.');

console.log('\n🔐 Это должно устранить предупреждение Security Advisor!');
