#!/bin/bash

echo "🚀 Настройка Monobank для production на Netlify"
echo ""

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: Запустите скрипт из корневой директории проекта"
    exit 1
fi

echo "📋 Переменная окружения для добавления в Netlify:"
echo ""
echo "MONOBANK_TOKEN=uSjulrJT5jqGnzy8lSQoasq04GRtKMo0myvxJk5D0EKY"
echo ""

echo "🔧 Инструкции для Netlify:"
echo "1. Перейдите в настройки сайта на Netlify"
echo "2. Откройте раздел 'Environment variables'"
echo "3. Добавьте переменную MONOBANK_TOKEN"
echo "4. Перезапустите deployment"
echo ""

echo "✅ После настройки платежи будут работать на stefa-books.com.ua"
echo ""

# Показываем текущий статус
echo "📊 Текущий статус:"
if grep -q "MONOBANK_TOKEN" .env.local; then
    echo "✅ MONOBANK_TOKEN настроен локально"
else
    echo "❌ MONOBANK_TOKEN не найден"
fi

echo ""
echo "🎯 Следующие шаги:"
echo "1. Добавьте MONOBANK_TOKEN в Netlify"
echo "2. Деплойте на production"
echo ""
echo "🌐 Netlify Dashboard: https://app.netlify.com/"
