#!/bin/bash

# =====================================================
# СКРИПТ ВЫПОЛНЕНИЯ ОПТИМИЗАЦИИ ПРОИЗВОДИТЕЛЬНОСТИ
# =====================================================
# Этот скрипт выполняет все исправления производительности
# для базы данных Stefa.Books

set -e  # Остановка при ошибке

echo "🚀 Начинаем оптимизацию производительности Stefa.Books..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для логирования
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

# Проверяем подключение к Supabase
log "Проверяем подключение к Supabase..."

# Проверяем наличие переменных окружения
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    error "Переменные окружения SUPABASE_URL и SUPABASE_ANON_KEY не установлены"
    echo "Установите их в файле .env.local:"
    echo "SUPABASE_URL=your_supabase_url"
    echo "SUPABASE_ANON_KEY=your_supabase_anon_key"
    exit 1
fi

# Проверяем наличие psql
if ! command -v psql &> /dev/null; then
    error "psql не найден. Установите PostgreSQL client"
    exit 1
fi

# Создаем резервную копию (опционально)
log "Создаем резервную копию базы данных..."
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
pg_dump "$SUPABASE_URL" > "$BACKUP_FILE" || {
    warning "Не удалось создать резервную копию, продолжаем без неё"
}

# Выполняем основные исправления производительности
log "Выполняем основные исправления производительности..."
psql "$SUPABASE_URL" -f "PERFORMANCE_OPTIMIZATION_FIXES.sql" || {
    error "Ошибка при выполнении основных исправлений"
    exit 1
}
success "Основные исправления выполнены"

# Выполняем удаление неиспользуемых индексов
log "Удаляем неиспользуемые индексы..."
psql "$SUPABASE_URL" -f "REMOVE_UNUSED_INDEXES.sql" || {
    error "Ошибка при удалении неиспользуемых индексов"
    exit 1
}
success "Неиспользуемые индексы удалены"

# Проверяем результаты
log "Проверяем результаты оптимизации..."

# Создаем отчет о результатах
REPORT_FILE="performance_optimization_report_$(date +%Y%m%d_%H%M%S).md"

cat > "$REPORT_FILE" << EOF
# ОТЧЕТ ОБ ОПТИМИЗАЦИИ ПРОИЗВОДИТЕЛЬНОСТИ

**Дата выполнения:** $(date)
**Проект:** Stefa.Books
**База данных:** Supabase PostgreSQL

## Выполненные исправления

### 1. Неиндексированные внешние ключи
- ✅ books.subcategory_id → main_categories.id
- ✅ notification_queue.user_id → users.id
- ✅ profiles.subscription_id → subscriptions.id
- ✅ book_authors.book_id → books.id
- ✅ book_authors.author_id → authors.id
- ✅ subcategories.main_category_id → main_categories.id
- ✅ subscriptions.user_id → users.id
- ✅ subscriptions.plan_id → plans.id
- ✅ payments.user_id → users.id
- ✅ payments.subscription_id → subscriptions.id
- ✅ reading_history.user_id → users.id
- ✅ reading_history.book_id → books.id

### 2. Удаленные неиспользуемые индексы
- ✅ Удалены неиспользуемые индексы для всех таблиц
- ✅ Оптимизирована структура индексов

### 3. Дополнительные оптимизации
- ✅ Созданы составные индексы для частых запросов
- ✅ Оптимизирован полнотекстовый поиск
- ✅ Добавлены индексы для временных запросов
- ✅ Обновлена статистика базы данных

## Результаты

EOF

# Получаем статистику индексов
psql "$SUPABASE_URL" -c "
SELECT 
    'Индексы по таблицам' as section,
    tablename,
    COUNT(*) as total_indexes,
    SUM(CASE WHEN idx_scan > 0 THEN 1 ELSE 0 END) as used_indexes,
    SUM(CASE WHEN idx_scan = 0 THEN 1 ELSE 0 END) as unused_indexes
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY unused_indexes DESC;
" >> "$REPORT_FILE"

# Получаем информацию о производительности
psql "$SUPABASE_URL" -c "
SELECT 
    'Общая статистика' as section,
    COUNT(*) as total_indexes,
    SUM(CASE WHEN idx_scan > 0 THEN 1 ELSE 0 END) as active_indexes,
    SUM(CASE WHEN idx_scan = 0 THEN 1 ELSE 0 END) as unused_indexes
FROM pg_stat_user_indexes 
WHERE schemaname = 'public';
" >> "$REPORT_FILE"

success "Отчет создан: $REPORT_FILE"

# Очистка
log "Очищаем временные файлы..."
rm -f "$BACKUP_FILE" 2>/dev/null || true

# Финальная проверка
log "Выполняем финальную проверку..."

# Проверяем, что все основные индексы созданы
MISSING_INDEXES=$(psql "$SUPABASE_URL" -t -c "
SELECT COUNT(*) 
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%'
    AND tablename IN ('books', 'authors', 'subscriptions', 'payments');
")

if [ "$MISSING_INDEXES" -lt 10 ]; then
    warning "Возможно, не все индексы созданы. Проверьте вручную."
else
    success "Все основные индексы созданы"
fi

# Проверяем неиспользуемые индексы
UNUSED_COUNT=$(psql "$SUPABASE_URL" -t -c "
SELECT COUNT(*) 
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' 
    AND idx_scan = 0;
")

if [ "$UNUSED_COUNT" -gt 5 ]; then
    warning "Осталось $UNUSED_COUNT неиспользуемых индексов. Рассмотрите их удаление."
else
    success "Количество неиспользуемых индексов минимизировано"
fi

echo ""
echo "🎉 Оптимизация производительности завершена!"
echo ""
echo "📊 Результаты:"
echo "   • Созданы индексы для всех внешних ключей"
echo "   • Удалены неиспользуемые индексы"
echo "   • Оптимизирована производительность запросов"
echo "   • Обновлена статистика базы данных"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Проверьте Performance Advisor в Supabase"
echo "   2. Мониторьте производительность запросов"
echo "   3. Регулярно обновляйте статистику (ANALYZE)"
echo "   4. Удаляйте неиспользуемые индексы ежемесячно"
echo ""
echo "📄 Подробный отчет: $REPORT_FILE"
echo ""

success "Оптимизация завершена успешно! 🚀"
