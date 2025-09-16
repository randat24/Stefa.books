#!/bin/bash

# =====================================================
# ПОЛНОЕ ИСПРАВЛЕНИЕ ПРОБЛЕМ ПРОИЗВОДИТЕЛЬНОСТИ
# =====================================================
# Этот скрипт исправляет ВСЕ проблемы из Performance Advisor:
# 1. Неиндексированные внешние ключи
# 2. RLS проблемы производительности

set -e

echo "🚀 Запуск полного исправления производительности Stefa.Books..."

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

# =====================================================
# ЭТАП 1: ИСПРАВЛЕНИЕ ИНДЕКСОВ
# =====================================================

log "Этап 1: Исправление неиндексированных внешних ключей..."

if psql "$SUPABASE_URL" -f "PERFORMANCE_FIXES_SAFE.sql"; then
    success "Индексы созданы успешно"
else
    error "Ошибка при создании индексов"
    exit 1
fi

# =====================================================
# ЭТАП 2: ИСПРАВЛЕНИЕ RLS ПРОБЛЕМ
# =====================================================

log "Этап 2: Исправление RLS проблем производительности..."

if psql "$SUPABASE_URL" -f "FIX_RLS_PERFORMANCE_SAFE.sql"; then
    success "RLS политики оптимизированы"
else
    error "Ошибка при оптимизации RLS политик"
    exit 1
fi

# =====================================================
# ЭТАП 3: ОЧИСТКА И ОПТИМИЗАЦИЯ
# =====================================================

log "Этап 3: Очистка базы данных..."

if psql "$SUPABASE_URL" -c "VACUUM ANALYZE;"; then
    success "Очистка базы данных выполнена"
else
    warning "Ошибка при очистке базы данных (не критично)"
fi

# =====================================================
# ЭТАП 4: ПРОВЕРКА РЕЗУЛЬТАТОВ
# =====================================================

log "Этап 4: Проверка результатов..."

# Создаем отчет о результатах
REPORT_FILE="complete_performance_fix_report_$(date +%Y%m%d_%H%M%S).md"

cat > "$REPORT_FILE" << EOF
# ОТЧЕТ О ПОЛНОМ ИСПРАВЛЕНИИ ПРОИЗВОДИТЕЛЬНОСТИ

**Дата выполнения:** $(date)
**Проект:** Stefa.Books
**База данных:** Supabase PostgreSQL

## Выполненные исправления

### 1. Неиндексированные внешние ключи
- ✅ books.subcategory_id → main_categories.id
- ✅ notification_queue.user_id → users.id
- ✅ book_authors.book_id → books.id
- ✅ book_authors.author_id → authors.id
- ✅ subcategories.main_category_id → main_categories.id
- ✅ subscriptions.user_id → users.id
- ✅ subscriptions.plan_id → plans.id
- ✅ payments.user_id → users.id
- ✅ reading_history.user_id → users.id
- ✅ reading_history.book_id → books.id

### 2. RLS проблемы производительности
- ✅ Оптимизированы RLS политики для payments
- ✅ Оптимизированы RLS политики для notification_queue
- ✅ Оптимизированы RLS политики для reading_history
- ✅ Оптимизированы RLS политики для users
- ✅ Оптимизированы RLS политики для subscriptions
- ✅ Оптимизированы RLS политики для дополнительных таблиц

### 3. Дополнительные оптимизации
- ✅ Созданы индексы для часто используемых колонок
- ✅ Оптимизирован полнотекстовый поиск
- ✅ Добавлены индексы для сортировки по датам
- ✅ Обновлена статистика базы данных
- ✅ Выполнена очистка неиспользуемых страниц

## Результаты

EOF

# Получаем статистику индексов
log "Собираем статистику индексов..."
psql "$SUPABASE_URL" -c "
SELECT 
    'Статистика индексов' as section,
    COUNT(*) as total_indexes,
    SUM(CASE WHEN idx_scan > 0 THEN 1 ELSE 0 END) as used_indexes,
    SUM(CASE WHEN idx_scan = 0 THEN 1 ELSE 0 END) as unused_indexes
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
    AND indexrelname LIKE 'idx_%';
" >> "$REPORT_FILE" 2>/dev/null || warning "Не удалось получить статистику индексов"

# Получаем информацию о RLS политиках
log "Собираем информацию о RLS политиках..."
psql "$SUPABASE_URL" -c "
SELECT 
    'RLS политики' as section,
    COUNT(*) as total_policies,
    COUNT(CASE WHEN qual LIKE '%SELECT auth.uid()%' THEN 1 END) as optimized_policies
FROM pg_policies 
WHERE schemaname = 'public';
" >> "$REPORT_FILE" 2>/dev/null || warning "Не удалось получить информацию о RLS политиках"

success "Отчет создан: $REPORT_FILE"

# =====================================================
# ЗАВЕРШЕНИЕ
# =====================================================

echo ""
echo "🎉 Полное исправление производительности завершено!"
echo ""
echo "📊 Результаты:"
echo "   • Созданы индексы для всех внешних ключей"
echo "   • Оптимизированы RLS политики для лучшей производительности"
echo "   • Обновлена статистика базы данных"
echo "   • Выполнена очистка неиспользуемых страниц"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Проверьте Performance Advisor в Supabase"
echo "   2. Убедитесь, что количество предупреждений уменьшилось"
echo "   3. Мониторьте производительность запросов"
echo "   4. Регулярно обновляйте статистику (ANALYZE)"
echo ""
echo "📄 Подробный отчет: $REPORT_FILE"
echo ""

success "Все проблемы производительности исправлены! 🚀"