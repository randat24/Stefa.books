# ИНСТРУКЦИЯ ПО ИСПРАВЛЕНИЮ ПРОБЛЕМ ПРОИЗВОДИТЕЛЬНОСТИ

## 🚀 Быстрый старт

### 1. Установите переменные окружения

```bash
export SUPABASE_URL='your_supabase_database_url'
```

Или создайте файл `.env.local`:
```
SUPABASE_URL=your_supabase_database_url
```

### 2. Выполните оптимизацию

```bash
./run_performance_fixes.sh
```

## 📋 Что исправляется

### Неиндексированные внешние ключи
- ✅ `books.subcategory_id` → `main_categories.id`
- ✅ `notification_queue.user_id` → `users.id`
- ✅ `book_authors.book_id` → `books.id`
- ✅ `book_authors.author_id` → `authors.id`
- ✅ `subcategories.main_category_id` → `main_categories.id`
- ✅ `subscriptions.user_id` → `users.id`
- ✅ `subscriptions.plan_id` → `plans.id`
- ✅ `payments.user_id` → `users.id`
- ✅ `reading_history.user_id` → `users.id`
- ✅ `reading_history.book_id` → `books.id`

### Дополнительные оптимизации
- ✅ Индексы для часто используемых колонок
- ✅ GIN индексы для полнотекстового поиска
- ✅ Индексы для сортировки по датам
- ✅ Составные индексы для сложных запросов

## 🔧 Ручное выполнение

Если скрипт не работает, выполните SQL вручную:

```bash
psql "$SUPABASE_URL" -f PERFORMANCE_FIXES_SAFE.sql
```

## 📊 Проверка результатов

После выполнения проверьте Performance Advisor в Supabase:
1. Откройте Supabase Dashboard
2. Перейдите в Database → Performance Advisor
3. Убедитесь, что все предупреждения исчезли

## 🛠️ Troubleshooting

### Ошибка "psql not found"
```bash
# macOS
brew install postgresql

# Ubuntu
sudo apt-get install postgresql-client
```

### Ошибка "SUPABASE_URL not set"
Убедитесь, что переменная окружения установлена:
```bash
echo $SUPABASE_URL
```

### Ошибка подключения к базе данных
Проверьте правильность URL базы данных в Supabase Dashboard.

## 📈 Ожидаемые результаты

После выполнения:
- Все неиндексированные внешние ключи будут проиндексированы
- Производительность запросов значительно улучшится
- Performance Advisor покажет 0 ошибок и предупреждений
- Время выполнения запросов уменьшится

## 🔄 Регулярное обслуживание

Рекомендуется:
1. Ежемесячно проверять Performance Advisor
2. Удалять неиспользуемые индексы
3. Обновлять статистику базы данных (ANALYZE)
4. Мониторить производительность запросов
