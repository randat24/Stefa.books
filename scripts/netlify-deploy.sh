#!/bin/bash

# Скрипт для деплоя на Netlify
# Использование: ./scripts/netlify-deploy.sh [production|preview]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
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

# Проверка наличия Netlify CLI
if ! command -v netlify &> /dev/null; then
    error "Netlify CLI не установлен. Установите его командой:"
    echo "npm install -g netlify-cli"
    exit 1
fi

# Проверка авторизации в Netlify
if ! netlify status &> /dev/null; then
    warning "Не авторизованы в Netlify. Выполняем авторизацию..."
    netlify login
fi

# Очистка кеша
log "Очистка кеша..."
npm run force-cache-clear

# Сборка проекта
log "Сборка проекта..."
npm run build

# Проверка успешности сборки
if [ ! -d ".next" ]; then
    error "Сборка не удалась. Директория .next не найдена."
    exit 1
fi

success "Сборка завершена успешно"

# Деплой на Netlify
log "Деплой на Netlify..."

# Определяем тип деплоя
DEPLOY_TYPE=${1:-production}

if [ "$DEPLOY_TYPE" = "production" ]; then
    log "Деплой в продакшн..."
    netlify deploy --prod --dir=.next
else
    log "Деплой превью..."
    netlify deploy --dir=.next
fi

success "Деплой завершен!"

# Получение URL сайта
SITE_URL=$(netlify status --json | jq -r '.url')
if [ "$SITE_URL" != "null" ] && [ "$SITE_URL" != "" ]; then
    success "Сайт доступен по адресу: $SITE_URL"
else
    warning "Не удалось получить URL сайта. Проверьте статус в панели Netlify."
fi

log "Готово! Проверьте ваш сайт на Netlify."
