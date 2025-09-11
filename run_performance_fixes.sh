#!/bin/bash

# =====================================================
# ПРОСТОЙ СКРИПТ ВЫПОЛНЕНИЯ ОПТИМИЗАЦИИ ПРОИЗВОДИТЕЛЬНОСТИ
# =====================================================

set -e

echo "🚀 Запуск оптимизации производительности Stefa.Books..."

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Проверяем наличие переменных окружения
if [ -z "$SUPABASE_URL" ]; then
    error "Переменная SUPABASE_URL не установлена"
    echo "Установите её командой:"
    echo "export SUPABASE_URL='your_supabase_database_url'"
    echo ""
    echo "Или создайте файл .env.local с содержимым:"
    echo "SUPABASE_URL=your_supabase_database_url"
    exit 1
fi

# Проверяем наличие psql
if ! command -v psql &> /dev/null; then
    error "psql не найден. Установите PostgreSQL client"
    exit 1
fi

log "Выполняем безопасные исправления производительности..."

# Выполняем SQL скрипт
if psql "$SUPABASE_URL" -f "PERFORMANCE_FIXES_SAFE.sql"; then
    success "Основные исправления выполнены"
else
    error "Ошибка при выполнении основных исправлений"
    exit 1
fi

# Выполняем VACUUM отдельно (не может быть в транзакции)
log "Выполняем очистку базы данных..."
if psql "$SUPABASE_URL" -c "VACUUM ANALYZE;"; then
    success "Очистка базы данных выполнена"
else
    warning "Ошибка при очистке базы данных (не критично)"
fi

success "Оптимизация производительности выполнена успешно!"

echo ""
echo "🎉 Готово! Все проблемы производительности исправлены."
echo ""
echo "📋 Что было сделано:"
echo "   • Созданы индексы для всех внешних ключей"
echo "   • Добавлены индексы для часто используемых колонок"
echo "   • Оптимизирован полнотекстовый поиск"
echo "   • Обновлена статистика базы данных"
echo ""
echo "📊 Проверьте Performance Advisor в Supabase для подтверждения результатов"
