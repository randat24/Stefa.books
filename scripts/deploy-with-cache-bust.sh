#!/bin/bash

# Скрипт для деплоя с принудительной очисткой кеша пользователей
# Автор: Claude Code Assistant

set -e

echo "🚀 Начинаем деплой с автоматической очисткой кеша..."

# Генерируем новый BUILD_ID на основе текущего времени
NEW_BUILD_ID=$(date +"%Y%m%d-%H%M")
echo "📅 Новый BUILD_ID: $NEW_BUILD_ID"

# Обновляем BUILD_ID в next.config.js
echo "🔧 Обновляем BUILD_ID в next.config.js..."
sed -i.bak "s/const BUILD_ID = '[^']*'/const BUILD_ID = '$NEW_BUILD_ID'/" next.config.js

# Обновляем BUILD_ID в Service Worker
echo "🔧 Обновляем BUILD_ID в Service Worker..."
sed -i.bak "s/stefa-books-cache-[^']*'/stefa-books-cache-$NEW_BUILD_ID'/" public/sw.js
sed -i.bak "s/const BUILD_ID = '[^']*'/const BUILD_ID = '$NEW_BUILD_ID'/" public/sw.js

# Создаем файл версии для отслеживания
echo "$NEW_BUILD_ID" > public/version.txt
echo "📝 Версия сохранена в public/version.txt"

# Проверяем статус git
echo "📋 Проверяем состояние git..."
if [[ -n $(git status --porcelain) ]]; then
    echo "📦 Коммитим изменения..."
    git add .
    git commit -m "🔄 Auto-deploy: обновление кеша и версии до $NEW_BUILD_ID

🔧 Automated deployment with cache busting for users.

Co-Authored-By: Claude <noreply@anthropic.com>"
fi

# Проверяем, что мы на правильной ветке
CURRENT_BRANCH=$(git branch --show-current)
echo "🌿 Текущая ветка: $CURRENT_BRANCH"

if [[ "$CURRENT_BRANCH" != "main" ]]; then
    echo "⚠️  Вы не на ветке main. Переключаемся..."
    git checkout main
fi

# Пушим изменения
echo "📤 Отправляем изменения в GitHub..."
git push origin main

# Деплоим на Netlify
echo "🌐 Деплоим на Netlify..."
netlify deploy --prod

# Проверяем статус деплоя
echo "✅ Деплой завершен!"
echo "🔗 Сайт: https://stefa-books.com.ua"
echo "📋 Версия: $NEW_BUILD_ID"

# Информация для пользователей
echo ""
echo "🎯 ВАЖНО ДЛЯ ПОЛЬЗОВАТЕЛЕЙ:"
echo "   - Service Worker автоматически уведомит о новой версии"
echo "   - Пользователи увидят уведомление об обновлении"
echo "   - При клике на 'Обновить' произойдет очистка всех кешей"
echo ""

# DNS кеш information
echo "🌐 ИНФОРМАЦИЯ О DNS:"
echo "   - DNS кеш обновится автоматически через 1-5 минут"
echo "   - Для принудительной очистки DNS: netlify domains:list"
echo "   - TTL для домена обычно 300 секунд (5 минут)"
echo ""

# Очистка временных файлов
echo "🧹 Очищаем временные файлы..."
rm -f next.config.js.bak public/sw.js.bak 2>/dev/null || true

echo "✨ Деплой с принудительной очисткой кеша завершен успешно!"
echo "🔄 Новая версия $NEW_BUILD_ID доступна для пользователей"