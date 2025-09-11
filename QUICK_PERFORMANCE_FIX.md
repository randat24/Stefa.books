# 🚀 БЫСТРОЕ ИСПРАВЛЕНИЕ ПРОБЛЕМ ПРОИЗВОДИТЕЛЬНОСТИ

## Установка переменных окружения

```bash
export SUPABASE_URL='your_supabase_database_url'
```

## Выполнение исправлений

### Вариант 1: Полное исправление (рекомендуется)
```bash
./run_complete_performance_fixes.sh
```

### Вариант 2: Только индексы
```bash
./run_performance_fixes.sh
```

### Вариант 3: Только RLS
```bash
psql "$SUPABASE_URL" -f FIX_RLS_PERFORMANCE_SAFE.sql
```

## Что исправляется

### ✅ Неиндексированные внешние ключи
- books.subcategory_id → main_categories.id
- notification_queue.user_id → users.id
- book_authors.book_id → books.id
- book_authors.author_id → authors.id
- subcategories.main_category_id → main_categories.id
- subscriptions.user_id → users.id
- subscriptions.plan_id → plans.id
- payments.user_id → users.id
- reading_history.user_id → users.id
- reading_history.book_id → books.id

### ✅ RLS проблемы производительности
- Оптимизированы политики для payments
- Оптимизированы политики для notification_queue
- Оптимизированы политики для reading_history
- Оптимизированы политики для users
- Оптимизированы политики для subscriptions
- Оптимизированы политики для дополнительных таблиц

## Ожидаемые результаты

После выполнения Performance Advisor должен показать:
- ✅ 0 ошибок
- ⚠️ Значительно меньше предупреждений
- ℹ️ Меньше информационных сообщений

## Troubleshooting

### Ошибка "psql not found"
```bash
# macOS
brew install postgresql

# Ubuntu
sudo apt-get install postgresql-client
```

### Ошибка "SUPABASE_URL not set"
```bash
echo $SUPABASE_URL
# Если пусто, установите:
export SUPABASE_URL='your_url_here'
```

### Ошибка подключения
Проверьте правильность URL в Supabase Dashboard → Settings → Database
