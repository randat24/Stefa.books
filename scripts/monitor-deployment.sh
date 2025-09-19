#!/bin/bash

# Мониторинг деплоя - проверяет когда новая версия станет доступна
echo "🔍 Мониторинг деплоя версии 20250919-1841..."
echo "⏰ Начало мониторинга: $(date)"
echo ""

EXPECTED_BUILD_ID="20250919-1841"
SITE_URL="https://stefa-books.com.ua"
CHECK_INTERVAL=30 # секунд
MAX_CHECKS=20     # максимум 10 минут

for i in $(seq 1 $MAX_CHECKS); do
    echo "📋 Проверка #$i ($(date +%H:%M:%S))..."

    # Получаем BUILD_ID с сайта
    CURRENT_BUILD_ID=$(curl -s -I "$SITE_URL" | grep -i "x-build-id" | cut -d' ' -f2 | tr -d '\r\n')

    echo "   Текущая версия: $CURRENT_BUILD_ID"
    echo "   Ожидаемая версия: $EXPECTED_BUILD_ID"

    if [[ "$CURRENT_BUILD_ID" == "$EXPECTED_BUILD_ID" ]]; then
        echo ""
        echo "🎉 УСПЕХ! Новая версия развернута!"
        echo "✅ Версия $EXPECTED_BUILD_ID теперь доступна на $SITE_URL"
        echo "⏰ Время развертывания: $(date)"
        echo ""
        echo "🔄 Теперь пользователи увидят:"
        echo "   - Исправленные favicon"
        echo "   - Работающие book preview modals"
        echo "   - Автоматические уведомления об обновлениях"
        echo ""

        # Проверим версию Service Worker
        echo "🛠️  Проверяем Service Worker..."
        curl -s "$SITE_URL/sw.js" | head -2

        exit 0
    fi

    if [ $i -lt $MAX_CHECKS ]; then
        echo "   ⏳ Ждем $CHECK_INTERVAL секунд до следующей проверки..."
        echo ""
        sleep $CHECK_INTERVAL
    fi
done

echo ""
echo "⚠️  Деплой занимает больше времени чем ожидалось"
echo "💡 Возможные причины:"
echo "   - Netlify билд еще выполняется"
echo "   - DNS кеш обновляется медленнее"
echo "   - CDN кеширование"
echo ""
echo "🔗 Проверьте статус на https://app.netlify.com/projects/stefabooks"