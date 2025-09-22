#!/bin/bash

# Скрипт для восстановления книг из CSV файла
# Использование: ./restore-books.sh

echo "🚀 Запуск восстановления книг из CSV файла..."

# Проверяем наличие файла
if [ ! -f "/Users/fantomas/Downloads/Stefa.books - Каталог книг.csv" ]; then
    echo "❌ CSV файл не найден по пути: /Users/fantomas/Downloads/Stefa.books - Каталог книг.csv"
    exit 1
fi

# Проверяем наличие переменных окружения
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Переменные окружения Supabase не найдены"
    echo "Убедитесь, что файл .env.local содержит:"
    echo "NEXT_PUBLIC_SUPABASE_URL=..."
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=..."
    exit 1
fi

# Запускаем TypeScript версию скрипта
echo "📖 Запускаем TypeScript скрипт восстановления..."
npx tsx scripts/restore-books-from-csv.ts

echo "✅ Скрипт восстановления завершен"
