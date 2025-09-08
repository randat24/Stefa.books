#!/bin/bash

echo "🔧 Быстрое исправление таблицы subscription_requests..."

# Проверяем, есть ли Supabase CLI
if command -v supabase &> /dev/null; then
    echo "📊 Запускаем исправление через Supabase..."
    
    # Запускаем полное исправление
    echo "Выполняем полное исправление таблицы..."
    supabase db reset --linked
    
    if [ $? -eq 0 ]; then
        echo "✅ Исправление завершено успешно!"
    else
        echo "❌ Ошибка при исправлении. Попробуйте запустить SQL вручную."
        echo "📄 Используйте файл: fix_subscription_requests_complete.sql"
    fi
else
    echo "❌ Supabase CLI не найден."
    echo ""
    echo "📋 Инструкции для ручного исправления:"
    echo "1. Откройте панель Supabase"
    echo "2. Перейдите в SQL Editor"
    echo "3. Скопируйте и выполните содержимое файла: fix_subscription_requests_complete.sql"
    echo ""
    echo "Или установите Supabase CLI:"
    echo "npm install -g supabase"
    echo "supabase link"
    echo "supabase db reset --linked"
fi
