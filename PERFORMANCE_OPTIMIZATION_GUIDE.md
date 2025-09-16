# РУКОВОДСТВО ПО ОПТИМИЗАЦИИ ПРОИЗВОДИТЕЛЬНОСТИ STEFA.BOOKS

## 📋 Содержание

1. [Быстрый старт](#быстрый-старт)
2. [Диагностика проблем](#диагностика-проблем)
3. [Исправления производительности](#исправления-производительности)
4. [Мониторинг](#мониторинг)
5. [Рекомендации](#рекомендации)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Быстрый старт

### 1. Установка переменных окружения
```bash
export SUPABASE_URL='your_supabase_database_url'
```

### 2. Выполнение исправлений

#### Вариант 1: Полное исправление (рекомендуется)
```bash
./run_complete_performance_fixes.sh
```

#### Вариант 2: Только индексы
```bash
./run_performance_fixes.sh
```

#### Вариант 3: Только RLS
```bash
psql "$SUPABASE_URL" -f FIX_RLS_PERFORMANCE_SAFE.sql
```

### 3. Проверка результатов
1. Откройте Supabase Dashboard
2. Перейдите в Database → Performance Advisor
3. Убедитесь, что все предупреждения исчезли

---

## 🔍 Диагностика проблем

### 1. Проверка структуры базы данных
```sql
-- Проверка существующих таблиц
SELECT 
    'Существующие таблицы' as section,
    schemaname,
    tablename
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Проверка индексов
SELECT 
    'Существующие индексы' as section,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Проверка внешних ключей
SELECT 
    'Внешние ключи' as section,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
```

### 2. Анализ производительности
```sql
-- Медленные запросы
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows,
  shared_blks_hit,
  shared_blks_read
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Неиспользуемые индексы
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY schemaname, tablename;

-- Размер таблиц
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 3. Проверка RLS политик
```sql
-- Текущие RLS политики
SELECT 
    'Текущие RLS политики' as section,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## ⚡ Исправления производительности

### 1. Индексы для внешних ключей

#### Основные индексы
```sql
-- Индексы для основных связей
CREATE INDEX IF NOT EXISTS idx_books_subcategory_id ON public.books (subcategory_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_user_id ON public.notification_queue (user_id);
CREATE INDEX IF NOT EXISTS idx_book_authors_book_id ON public.book_authors (book_id);
CREATE INDEX IF NOT EXISTS idx_book_authors_author_id ON public.book_authors (author_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_main_category_id ON public.subcategories (main_category_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON public.subscriptions (plan_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments (user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON public.reading_history (user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_book_id ON public.reading_history (book_id);
```

### 2. Индексы для поиска и сортировки

#### Полнотекстовый поиск
```sql
-- GIN индексы для поиска
CREATE INDEX IF NOT EXISTS idx_books_title_gin ON public.books USING gin (to_tsvector('ukrainian', title));
CREATE INDEX IF NOT EXISTS idx_books_description_gin ON public.books USING gin (to_tsvector('ukrainian', description));
CREATE INDEX IF NOT EXISTS idx_authors_name_gin ON public.authors USING gin (to_tsvector('ukrainian', name));
```

#### Сортировка по датам
```sql
-- Индексы для сортировки
CREATE INDEX IF NOT EXISTS idx_books_created_at ON public.books (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON public.subscriptions (expires_at);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments (created_at DESC);
```

#### Фильтрация по статусам
```sql
-- Индексы для фильтрации
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments (status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_is_read ON public.notification_queue (is_read);
```

### 3. Составные индексы

#### Для сложных запросов
```sql
-- Составные индексы
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions (user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON public.payments (user_id, status);
CREATE INDEX IF NOT EXISTS idx_reading_history_user_finished ON public.reading_history (user_id, finished_at);
CREATE INDEX IF NOT EXISTS idx_books_category_created ON public.books (category, created_at DESC);
```

### 4. Оптимизация RLS политик

#### Эффективные политики
```sql
-- Оптимизированные политики для основных таблиц
DROP POLICY IF EXISTS "Пользователи видят только свои платежи" ON public.payments;
CREATE POLICY "Пользователи видят только свои платежи" ON public.payments
    FOR ALL USING ((SELECT auth.uid())::text = user_id::text);

DROP POLICY IF EXISTS "Пользователи видят только свои уведомления" ON public.notification_queue;
CREATE POLICY "Пользователи видят только свои уведомления" ON public.notification_queue
    FOR ALL USING ((SELECT auth.uid())::text = user_id::text);

DROP POLICY IF EXISTS "Пользователи видят только свою историю" ON public.reading_history;
CREATE POLICY "Пользователи видят только свою историю" ON public.reading_history
    FOR ALL USING ((SELECT auth.uid())::text = user_id::text);

DROP POLICY IF EXISTS "Пользователи видят только свои данные" ON public.users;
CREATE POLICY "Пользователи видят только свои данные" ON public.users
    FOR ALL USING ((SELECT auth.uid())::text = id::text);

DROP POLICY IF EXISTS "Пользователи видят только свои подписки" ON public.subscriptions;
CREATE POLICY "Пользователи видят только свои подписки" ON public.subscriptions
    FOR ALL USING ((SELECT auth.uid())::text = user_id::text);
```

---

## 📊 Мониторинг

### 1. Ключевые метрики

#### Производительность запросов
```sql
-- Создание представления для мониторинга
CREATE OR REPLACE VIEW performance_metrics AS
SELECT 
  'slow_queries' as metric,
  COUNT(*) as value
FROM pg_stat_statements
WHERE mean_time > 1000;

-- Мониторинг использования памяти
SELECT 
  'memory_usage' as metric,
  pg_size_pretty(pg_database_size(current_database())) as value;

-- Эффективность кэша
SELECT 
  'cache_hit_ratio' as metric,
  ROUND(
    (sum(blks_hit)::float / (sum(blks_hit) + sum(blks_read))) * 100, 
    2
  ) as value
FROM pg_stat_database
WHERE datname = current_database();
```

#### Использование индексов
```sql
-- Статистика использования индексов
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### 2. Алерты производительности

#### Критические алерты
- **Медленные запросы**: > 5 запросов > 5 секунд
- **Низкая эффективность кэша**: < 90% hit ratio
- **Большие таблицы**: > 1GB без индексов
- **Блокировки**: > 10 секунд

#### Предупреждающие алерты
- **Неиспользуемые индексы**: > 10 индексов без использования
- **Медленные RLS политики**: > 100ms на политику
- **Высокая нагрузка**: > 80% CPU или памяти

### 3. Регулярные проверки

#### Ежедневно
```sql
-- Проверка медленных запросов
SELECT COUNT(*) as slow_queries
FROM pg_stat_statements
WHERE mean_time > 1000;

-- Проверка использования индексов
SELECT COUNT(*) as unused_indexes
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

#### Еженедельно
```sql
-- Обновление статистики
ANALYZE;

-- Проверка размера базы данных
SELECT pg_size_pretty(pg_database_size(current_database()));
```

#### Ежемесячно
```sql
-- Полный анализ производительности
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 💡 Рекомендации

### 1. Индексы

#### Создание индексов
- Создавайте индексы для всех внешних ключей
- Используйте GIN индексы для полнотекстового поиска
- Создавайте составные индексы для сложных запросов
- Тестируйте производительность перед созданием

#### Удаление индексов
- Регулярно удаляйте неиспользуемые индексы
- Мониторьте размер индексов
- Удаляйте дублирующиеся индексы

### 2. RLS политики

#### Оптимизация политик
- Используйте простые условия в политиках
- Избегайте сложных подзапросов в RLS
- Кэшируйте результаты auth.uid()
- Тестируйте производительность политик

#### Лучшие практики
- Создавайте отдельные политики для SELECT, INSERT, UPDATE, DELETE
- Используйте индексы для колонок в условиях RLS
- Избегайте функций в условиях RLS

### 3. Запросы

#### Оптимизация запросов
- Используйте EXPLAIN ANALYZE для анализа
- Избегайте SELECT * в продакшене
- Правильно используйте JOIN
- Кэшируйте часто используемые данные

#### Лучшие практики
- Используйте LIMIT для больших выборок
- Избегайте N+1 запросов
- Используйте подзапросы вместо JOIN когда это уместно
- Оптимизируйте ORDER BY с индексами

### 4. Мониторинг

#### Ключевые метрики
- Время выполнения запросов
- Использование индексов
- Размер базы данных
- Количество подключений

#### Инструменты
- Supabase Performance Advisor
- pg_stat_statements
- pg_stat_user_indexes
- pg_stat_database

---

## 🛠️ Troubleshooting

### 1. Частые проблемы

#### Медленные запросы
```sql
-- Поиск медленных запросов
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC;

-- Анализ конкретного запроса
EXPLAIN ANALYZE SELECT * FROM public.books WHERE title ILIKE '%поиск%';
```

#### Неиспользуемые индексы
```sql
-- Поиск неиспользуемых индексов
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

#### Проблемы с RLS
```sql
-- Проверка RLS политик
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Временное отключение RLS для отладки
ALTER TABLE public.table_name DISABLE ROW LEVEL SECURITY;
-- Включение обратно
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;
```

### 2. Решения проблем

#### Проблема: Медленные запросы
**Решение**:
1. Создайте индексы для колонок в WHERE и ORDER BY
2. Оптимизируйте JOIN
3. Используйте EXPLAIN ANALYZE для анализа
4. Рассмотрите денормализацию для часто используемых данных

#### Проблема: Неиспользуемые индексы
**Решение**:
1. Удалите неиспользуемые индексы
2. Проверьте, не используются ли индексы в других запросах
3. Мониторьте использование индексов регулярно

#### Проблема: Проблемы с RLS
**Решение**:
1. Упростите условия в политиках
2. Создайте индексы для колонок в условиях RLS
3. Кэшируйте результаты auth.uid()
4. Тестируйте производительность политик

### 3. Экстренные процедуры

#### Временное отключение RLS
```sql
-- ВНИМАНИЕ: Только для экстренных случаев!
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.books DISABLE ROW LEVEL SECURITY;

-- Включение обратно после решения проблемы
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
```

#### Завершение зависших запросов
```sql
-- Поиск зависших запросов
SELECT 
  pid,
  state,
  query_start,
  query
FROM pg_stat_activity 
WHERE state = 'active' 
  AND query_start < now() - interval '1 hour';

-- Завершение зависшего запроса
SELECT pg_terminate_backend(pid);
```

---

## 📞 Поддержка

### Контакты
- **Техническая поддержка**: support@stefa.books.ua
- **Экстренная поддержка**: emergency@stefa.books.ua
- **Slack**: #database-performance

### Документация
- **Supabase Performance Advisor**: https://supabase.com/docs/guides/platform/performance
- **PostgreSQL Performance Tuning**: https://www.postgresql.org/docs/current/performance-tips.html

---

**Версия руководства**: 1.0  
**Дата создания**: 10 сентября 2025  
**Следующий пересмотр**: 10 октября 2025
