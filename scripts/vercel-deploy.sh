#!/bin/bash

# 🚀 Скрипт для деплою на Vercel
# Використання: ./scripts/vercel-deploy.sh [environment]

set -e

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функція для виводу повідомлень
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Перевірка аргументів
ENVIRONMENT=${1:-preview}

log "Початок деплою на Vercel (середовище: $ENVIRONMENT)"

# Перевірка наявності Vercel CLI
if ! command -v vercel &> /dev/null; then
    error "Vercel CLI не встановлено. Встановіть: npm i -g vercel"
    exit 1
fi

# Перевірка наявності pnpm
if ! command -v pnpm &> /dev/null; then
    error "pnpm не встановлено. Встановіть: npm i -g pnpm"
    exit 1
fi

# Перевірка Git статусу
log "Перевірка Git статусу..."
if [ -n "$(git status --porcelain)" ]; then
    warning "Є незбережені зміни. Збережіть їх перед деплоєм."
    git status --short
    read -p "Продовжити? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Деплой скасовано"
        exit 1
    fi
fi

# Встановлення залежностей
log "Встановлення залежностей..."
pnpm install

# Перевірка типів TypeScript
log "Перевірка типів TypeScript..."
pnpm type-check

# Лінтінг
log "Запуск лінтера..."
pnpm lint

# Тестування
log "Запуск тестів..."
pnpm test

# Білд проекту
log "Білд проекту..."
pnpm build

# Перевірка наявності .env файлів
if [ ! -f ".env.local" ] && [ ! -f ".env.production" ]; then
    warning "Не знайдено .env файлів. Переконайтеся, що змінні середовища налаштовані в Vercel."
fi

# Деплой на Vercel
log "Деплой на Vercel..."

if [ "$ENVIRONMENT" = "production" ]; then
    log "Деплой в production..."
    vercel --prod --yes
    success "Деплой в production завершено!"
else
    log "Деплой в preview..."
    vercel --yes
    success "Деплой в preview завершено!"
fi

# Перевірка статусу деплою
log "Перевірка статусу деплою..."
vercel ls

success "Деплой завершено успішно! 🎉"

# Показ посилань
log "Корисні команди:"
echo "  vercel ls                    - список деплоїв"
echo "  vercel logs                  - логи деплою"
echo "  vercel inspect               - деталі деплою"
echo "  vercel env ls                - змінні середовища"
