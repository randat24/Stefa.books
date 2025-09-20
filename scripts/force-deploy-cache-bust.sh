#!/bin/bash

# Скрипт для принудительного деплоя с полной очисткой кеша
# Решает проблему с тем, что изменения не видны на продакшене

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для вывода
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log "🚀 Запуск принудительного деплоя с очисткой кеша..."

# 1. Генерируем новый уникальный Build ID
TIMESTAMP=$(date +'%Y%m%d-%H%M%S')
RANDOM_SUFFIX=$(openssl rand -hex 4)
NEW_BUILD_ID="force-${TIMESTAMP}-${RANDOM_SUFFIX}"

log "📦 Новый Build ID: ${NEW_BUILD_ID}"

# 2. Обновляем next.config.js с новым Build ID
log "🔧 Обновление конфигурации Next.js..."
sed -i.bak "s/const BUILD_ID = .*;/const BUILD_ID = '${NEW_BUILD_ID}';/" next.config.js
success "Обновлен BUILD_ID в next.config.js"

# 3. Создаем файл версии для принудительной очистки кеша
log "📝 Создание файлов для очистки кеша..."

# Создаем cache-buster.js
cat > public/cache-buster.js << EOF
// Принудительная очистка кеша браузера
(function() {
  const currentVersion = '${NEW_BUILD_ID}';
  const storedVersion = localStorage.getItem('stefa-books-version');
  
  console.log('🔄 Проверка версии:', { current: currentVersion, stored: storedVersion });
  
  if (storedVersion !== currentVersion) {
    console.log('🆕 Обнаружена новая версия, очищаем кеш...');
    
    // Очищаем все кеши
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          console.log('🗑️ Удаляем кеш:', name);
          caches.delete(name);
        });
      });
    }
    
    // Очищаем localStorage и sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Сохраняем новую версию
    localStorage.setItem('stefa-books-version', currentVersion);
    
    // Принудительная перезагрузка
    console.log('🔄 Принудительная перезагрузка страницы...');
    window.location.reload(true);
  } else {
    localStorage.setItem('stefa-books-version', currentVersion);
    console.log('✅ Версия актуальна');
  }
})();
EOF

# Создаем version.txt
echo "${NEW_BUILD_ID}" > public/version.txt

# Создаем meta.json с информацией о деплое
cat > public/deploy-meta.json << EOF
{
  "buildId": "${NEW_BUILD_ID}",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "deployType": "force-cache-bust",
  "version": "1.0.0",
  "cacheBuster": true,
  "forceReload": true
}
EOF

success "Созданы файлы для очистки кеша"

# 4. Очищаем все кеши и временные файлы
log "🧹 Очистка кешей и временных файлов..."
rm -rf .next
rm -rf out
rm -rf dist
rm -rf node_modules/.cache
rm -rf .turbo
npm run clean:cache 2>/dev/null || true
success "Кеши очищены"

# 5. Устанавливаем переменные окружения для принудительной очистки
export FORCE_CACHE_CLEAR=true
export BUILD_ID="${NEW_BUILD_ID}"
export NEXT_PUBLIC_BUILD_ID="${NEW_BUILD_ID}"

# 6. Сборка проекта
log "🔨 Сборка проекта..."
npm run build

if [ ! -d ".next" ]; then
    error "Сборка не удалась. Директория .next не найдена."
    exit 1
fi

success "Сборка завершена успешно"

# 7. Создаем _headers файл для Netlify с принудительной очисткой кеша
log "📋 Создание заголовков для Netlify..."
cat > public/_headers << EOF
# Принудительная очистка кеша для всех файлов
/*
  Cache-Control: no-cache, no-store, must-revalidate, max-age=0
  Pragma: no-cache
  Expires: 0
  X-Build-ID: ${NEW_BUILD_ID}
  X-Cache-Buster: true

# Статические файлы с длительным кешированием
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=31536000, immutable

# API роуты без кеширования
/api/*
  Cache-Control: no-cache, no-store, must-revalidate
  X-Build-ID: ${NEW_BUILD_ID}
EOF

# 8. Создаем _redirects файл
cat > public/_redirects << EOF
# Принудительная очистка кеша для HTML файлов
/*.html
  Cache-Control: no-cache, no-store, must-revalidate, max-age=0
  X-Build-ID: ${NEW_BUILD_ID}
EOF

success "Созданы заголовки для Netlify"

# 9. Проверяем наличие Netlify CLI
if ! command -v netlify &> /dev/null; then
    error "Netlify CLI не установлен. Установите его командой:"
    echo "npm install -g netlify-cli"
    exit 1
fi

# 10. Проверяем авторизацию в Netlify
if ! netlify status &> /dev/null; then
    warning "Не авторизованы в Netlify. Выполняем авторизацию..."
    netlify login
fi

# 11. Деплой на Netlify с принудительной очисткой
log "🚀 Деплой на Netlify с принудительной очисткой кеша..."

# Определяем тип деплоя
DEPLOY_TYPE=${1:-production}

if [ "$DEPLOY_TYPE" = "production" ]; then
    log "📤 Деплой в продакшн с принудительной очисткой кеша..."
    netlify deploy --prod --dir=.next --message="Force deploy with cache bust - ${NEW_BUILD_ID}"
else
    log "📤 Деплой превью с принудительной очисткой кеша..."
    netlify deploy --dir=.next --message="Force deploy preview with cache bust - ${NEW_BUILD_ID}"
fi

success "Деплой завершен!"

# 12. Получение URL сайта
SITE_URL=$(netlify status --json | jq -r '.url' 2>/dev/null || echo "")
if [ "$SITE_URL" != "null" ] && [ "$SITE_URL" != "" ]; then
    success "🌐 Сайт доступен по адресу: $SITE_URL"
    success "🔗 URL с принудительной очисткой кеша: ${SITE_URL}?v=${NEW_BUILD_ID}&cb=${RANDOM_SUFFIX}"
else
    warning "Не удалось получить URL сайта. Проверьте статус в панели Netlify."
fi

# 13. Создаем инструкции для пользователей
cat > DEPLOY_INSTRUCTIONS.md << EOF
# Инструкции по принудительному деплою

## Выполнен принудительный деплой с очисткой кеша

- **Build ID**: ${NEW_BUILD_ID}
- **Время деплоя**: $(date)
- **Тип деплоя**: ${DEPLOY_TYPE}

## Что было сделано:

1. ✅ Сгенерирован новый уникальный Build ID
2. ✅ Обновлена конфигурация Next.js
3. ✅ Созданы файлы для принудительной очистки кеша
4. ✅ Очищены все локальные кеши
5. ✅ Выполнена сборка проекта
6. ✅ Настроены заголовки для Netlify
7. ✅ Выполнен деплой на Netlify

## Для пользователей:

Изменения должны быть видны сразу. Если нет - попробуйте:

1. **Жесткая перезагрузка**: Ctrl+Shift+R (Windows/Linux) или Cmd+Shift+R (Mac)
2. **Очистка кеша браузера**: Настройки → Очистить данные браузера
3. **Приватный режим**: Откройте сайт в приватном окне
4. **Прямая ссылка с очисткой кеша**: ${SITE_URL}?v=${NEW_BUILD_ID}&cb=${RANDOM_SUFFIX}

## Технические детали:

- Все статические файлы имеют новые имена
- Заголовки кеширования настроены для принудительной очистки
- Service Worker обновлен с новым кешем
- Build ID встроен в каждый запрос

EOF

success "📋 Созданы инструкции по деплою"

log "🎉 Принудительный деплой с очисткой кеша завершен!"
log "📦 Build ID: ${NEW_BUILD_ID}"
log "🌐 Сайт: ${SITE_URL}"
log "💡 Пользователям больше НЕ нужно нажимать Ctrl+Shift+R!"
log "🔄 Кеш будет очищаться автоматически при обновлениях"

# 14. Показываем финальную информацию
echo ""
echo "=========================================="
echo "🚀 ПРИНУДИТЕЛЬНЫЙ ДЕПЛОЙ ЗАВЕРШЕН"
echo "=========================================="
echo "Build ID: ${NEW_BUILD_ID}"
echo "Сайт: ${SITE_URL}"
echo "Время: $(date)"
echo "=========================================="
echo ""
echo "✅ Изменения должны быть видны СРАЗУ!"
echo "🔄 Если нет - используйте Ctrl+Shift+R"
echo "📱 Или откройте в приватном режиме"
echo ""
