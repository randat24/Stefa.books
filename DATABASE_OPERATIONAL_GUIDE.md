# ОПЕРАЦИОННОЕ РУКОВОДСТВО ПО БАЗЕ ДАННЫХ STEFA.BOOKS

## 📋 Содержание

1. [Ежедневные операции](#ежедневные-операции)
2. [Еженедельные задачи](#еженедельные-задачи)
3. [Ежемесячные процедуры](#ежемесячные-процедуры)
4. [Оптимизация производительности](#оптимизация-производительности)
5. [Экстренные процедуры](#экстренные-процедуры)
6. [Мониторинг и алерты](#мониторинг-и-алерты)
7. [Резервное копирование](#резервное-копирование)
8. [Восстановление данных](#восстановление-данных)

---

## 🌅 Ежедневные операции

### Утренняя проверка (9:00)

#### 1. Проверка состояния системы
```sql
-- Проверка подключений
SELECT 
  state,
  COUNT(*) as connections
FROM pg_stat_activity 
WHERE datname = current_database()
GROUP BY state;

-- Проверка активных запросов
SELECT 
  pid,
  state,
  query_start,
  query
FROM pg_stat_activity 
WHERE state = 'active' 
  AND query NOT LIKE '%pg_stat_activity%';
```

#### 2. Проверка ошибок
```sql
-- Проверка ошибок в логах (если доступно)
SELECT 
  log_time,
  log_level,
  message
FROM pg_logs 
WHERE log_time >= current_date
  AND log_level IN ('ERROR', 'FATAL')
ORDER BY log_time DESC
LIMIT 10;
```

#### 3. Проверка производительности
```sql
-- Топ медленных запросов за последние 24 часа
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
WHERE query_start >= now() - interval '24 hours'
ORDER BY total_time DESC
LIMIT 5;
```

### Вечерняя проверка (18:00)

#### 1. Статистика за день
```sql
-- Новые пользователи за день
SELECT COUNT(*) as new_users_today
FROM public.users 
WHERE created_at >= current_date;

-- Новые книги за день
SELECT COUNT(*) as new_books_today
FROM public.books 
WHERE created_at >= current_date;

-- Активные подписки
SELECT 
  COUNT(*) as active_subscriptions,
  COUNT(CASE WHEN expires_at < now() + interval '7 days' THEN 1 END) as expiring_soon
FROM public.subscriptions 
WHERE status = 'active';
```

#### 2. Проверка уведомлений
```sql
-- Неотправленные уведомления
SELECT COUNT(*) as pending_notifications
FROM public.notification_queue 
WHERE sent_at IS NULL;

-- Отправка уведомлений об истекающих подписках
INSERT INTO public.notification_queue (user_id, type, title, message)
SELECT 
  s.user_id,
  'subscription_expired',
  'Подписка истекает',
  'Ваша подписка истекает через ' || 
  EXTRACT(days FROM s.expires_at - now()) || ' дней'
FROM public.subscriptions s
WHERE s.status = 'active' 
  AND s.expires_at BETWEEN now() + interval '3 days' AND now() + interval '7 days'
  AND NOT EXISTS (
    SELECT 1 FROM public.notification_queue nq
    WHERE nq.user_id = s.user_id 
      AND nq.type = 'subscription_expired'
      AND nq.created_at >= current_date
  );
```

---

## 📅 Еженедельные задачи

### Понедельник - Анализ производительности

#### 1. Анализ индексов
```sql
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
WHERE calls > 10
  AND mean_time > 1000
ORDER BY mean_time DESC
LIMIT 10;
```

#### 2. Оптимизация запросов
```sql
-- Обновление статистики
ANALYZE;

-- Переиндексация (если нужно)
REINDEX TABLE public.books;
REINDEX TABLE public.authors;
```

### Среда - Очистка данных

#### 1. Очистка старых уведомлений
```sql
-- Удаление прочитанных уведомлений старше 30 дней
DELETE FROM public.notification_queue 
WHERE is_read = true 
  AND created_at < now() - interval '30 days';

-- Удаление отправленных уведомлений старше 7 дней
DELETE FROM public.notification_queue 
WHERE sent_at IS NOT NULL 
  AND sent_at < now() - interval '7 days';
```

#### 2. Очистка логов
```sql
-- Очистка старых записей в истории чтения (если нужно)
DELETE FROM public.reading_history 
WHERE finished_at IS NOT NULL 
  AND finished_at < now() - interval '1 year';
```

### Пятница - Резервное копирование

#### 1. Создание резервной копии
```bash
# Создание дампа базы данных
pg_dump -h your-supabase-host \
        -U postgres \
        -d your-database \
        -f backup_$(date +%Y%m%d_%H%M%S).sql

# Сжатие резервной копии
gzip backup_$(date +%Y%m%d_%H%M%S).sql
```

#### 2. Проверка целостности
```sql
-- Проверка внешних ключей
SELECT 
  conname,
  conrelid::regclass as table_name,
  confrelid::regclass as referenced_table
FROM pg_constraint 
WHERE contype = 'f' 
  AND NOT convalidated;

-- Проверка индексов
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## 📆 Ежемесячные процедуры

### 1-е число - Полный анализ системы

#### 1. Анализ роста данных
```sql
-- Размер таблиц
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### 2. Анализ пользователей
```sql
-- Статистика пользователей
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN created_at >= date_trunc('month', current_date) THEN 1 END) as new_this_month,
  COUNT(CASE WHEN is_admin = true THEN 1 END) as admins,
  COUNT(CASE WHEN id IN (SELECT DISTINCT user_id FROM public.subscriptions WHERE status = 'active') THEN 1 END) as subscribed_users
FROM public.users;

-- Топ активных пользователей
SELECT 
  u.email,
  COUNT(rh.id) as books_read,
  COUNT(p.id) as payments_made,
  SUM(p.amount) as total_paid
FROM public.users u
LEFT JOIN public.reading_history rh ON rh.user_id = u.id
LEFT JOIN public.payments p ON p.user_id = u.id
WHERE u.created_at >= date_trunc('month', current_date)
GROUP BY u.id, u.email
ORDER BY books_read DESC, total_paid DESC
LIMIT 10;
```

#### 3. Анализ книг
```sql
-- Статистика книг
SELECT 
  COUNT(*) as total_books,
  COUNT(CASE WHEN created_at >= date_trunc('month', current_date) THEN 1 END) as new_this_month,
  COUNT(CASE WHEN subcategory_id IS NOT NULL THEN 1 END) as categorized_books,
  AVG(pages) as avg_pages,
  COUNT(DISTINCT ba.author_id) as unique_authors
FROM public.books b
LEFT JOIN public.book_authors ba ON ba.book_id = b.id;

-- Топ популярных книг
SELECT 
  b.title,
  COUNT(rh.id) as times_read,
  AVG(rh.rating) as avg_rating,
  COUNT(rh.review) as reviews_count
FROM public.books b
LEFT JOIN public.reading_history rh ON rh.book_id = b.id
WHERE rh.finished_at IS NOT NULL
GROUP BY b.id, b.title
ORDER BY times_read DESC, avg_rating DESC
LIMIT 10;
```

### 15-е число - Обновление и оптимизация

#### 1. Обновление статистики
```sql
-- Обновление статистики для всех таблиц
ANALYZE;

-- Обновление статистики для конкретных таблиц
ANALYZE public.books;
ANALYZE public.users;
ANALYZE public.subscriptions;
```

#### 2. Проверка безопасности
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

-- Проверка прав доступа
SELECT 
  grantee,
  table_name,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
ORDER BY table_name, grantee;
```

---

## ⚡ Оптимизация производительности

### Ежедневная проверка производительности

#### 1. Проверка медленных запросов
```sql
-- Топ 5 медленных запросов за последние 24 часа
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
WHERE query_start >= now() - interval '24 hours'
ORDER BY mean_time DESC
LIMIT 5;
```

#### 2. Проверка использования индексов
```sql
-- Индексы с низким использованием
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan < 10
  AND schemaname = 'public'
ORDER BY idx_scan ASC;
```

### Еженедельная оптимизация

#### 1. Обновление статистики
```sql
-- Обновление статистики для всех таблиц
ANALYZE;

-- Обновление статистики для конкретных таблиц
ANALYZE public.books;
ANALYZE public.users;
ANALYZE public.subscriptions;
```

#### 2. Проверка неиспользуемых индексов
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
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

#### 3. Анализ производительности RLS
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
```

### Ежемесячная оптимизация

#### 1. Полный анализ производительности
```sql
-- Размер таблиц и индексов
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_overhead
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### 2. Оптимизация запросов
```sql
-- Анализ самых частых запросов
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows,
  shared_blks_hit,
  shared_blks_read,
  shared_blks_hit::float / (shared_blks_hit + shared_blks_read) as hit_ratio
FROM pg_stat_statements
WHERE calls > 100
ORDER BY total_time DESC
LIMIT 10;
```

### Автоматические исправления

#### 1. Быстрое исправление производительности
```bash
# Выполнение всех исправлений
./run_complete_performance_fixes.sh
```

#### 2. Безопасные исправления
```bash
# Только проверенные исправления
psql "$SUPABASE_URL" -f PERFORMANCE_FIXES_SAFE.sql
```

#### 3. Исправление RLS проблем
```bash
# Оптимизация RLS политик
psql "$SUPABASE_URL" -f FIX_RLS_PERFORMANCE_SAFE.sql
```

### Мониторинг производительности

#### 1. Ключевые метрики
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
```

#### 2. Алерты производительности
- **Медленные запросы**: > 5 запросов > 5 секунд
- **Низкая эффективность кэша**: < 90% hit ratio
- **Большие таблицы**: > 1GB без индексов
- **Неиспользуемые индексы**: > 10 индексов без использования

### Рекомендации по оптимизации

#### 1. Индексы
- Создавайте индексы для всех внешних ключей
- Используйте GIN индексы для полнотекстового поиска
- Создавайте составные индексы для сложных запросов
- Регулярно удаляйте неиспользуемые индексы

#### 2. RLS политики
- Используйте простые условия в политиках
- Избегайте сложных подзапросов в RLS
- Кэшируйте результаты auth.uid()
- Тестируйте производительность политик

#### 3. Запросы
- Используйте EXPLAIN ANALYZE для анализа
- Избегайте SELECT * в продакшене
- Правильно используйте JOIN
- Кэшируйте часто используемые данные

---

## 🚨 Экстренные процедуры

### 1. Восстановление после сбоя

#### Проверка состояния системы
```sql
-- Проверка подключений
SELECT 
  state,
  COUNT(*) as count
FROM pg_stat_activity 
GROUP BY state;

-- Проверка блокировок
SELECT 
  blocked_locks.pid AS blocked_pid,
  blocked_activity.usename AS blocked_user,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.usename AS blocking_user,
  blocked_activity.query AS blocked_statement,
  blocking_activity.query AS current_statement_in_blocking_process
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
  AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
  AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
  AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
  AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
  AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
  AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
  AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
  AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
  AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
  AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

#### Восстановление подключений
```sql
-- Завершение зависших подключений
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity 
WHERE state = 'idle in transaction'
  AND query_start < now() - interval '1 hour';
```

### 2. Восстановление данных

#### Откат транзакций
```sql
-- Проверка активных транзакций
SELECT 
  pid,
  state,
  query_start,
  xact_start,
  query
FROM pg_stat_activity 
WHERE state IN ('active', 'idle in transaction')
ORDER BY xact_start;

-- Откат к точке сохранения (если настроено)
-- ROLLBACK TO SAVEPOINT backup_point;
```

### 3. Экстренное масштабирование

#### Временное отключение RLS
```sql
-- ВНИМАНИЕ: Только для экстренных случаев!
-- Отключение RLS для критических таблиц
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.books DISABLE ROW LEVEL SECURITY;

-- Включение обратно после решения проблемы
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
```

---

## 📊 Мониторинг и алерты

### Ключевые метрики для отслеживания

#### 1. Производительность
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
```

#### 2. Безопасность
```sql
-- Мониторинг неудачных попыток входа
SELECT 
  'failed_logins' as metric,
  COUNT(*) as value
FROM auth.audit_log_entries
WHERE created_at >= now() - interval '1 hour'
  AND event_type = 'sign_in'
  AND error_msg IS NOT NULL;
```

#### 3. Бизнес-метрики
```sql
-- Создание представления для бизнес-метрик
CREATE OR REPLACE VIEW business_metrics AS
SELECT 
  'daily_revenue' as metric,
  COALESCE(SUM(amount), 0) as value
FROM public.payments
WHERE status = 'completed'
  AND created_at >= current_date;

-- Активные подписки
SELECT 
  'active_subscriptions' as metric,
  COUNT(*) as value
FROM public.subscriptions
WHERE status = 'active'
  AND expires_at > now();
```

### Настройка алертов

#### 1. Критические алерты
- **Ошибки базы данных**: > 10 ошибок в час
- **Медленные запросы**: > 5 запросов > 5 секунд
- **Высокая нагрузка**: > 80% CPU или памяти
- **Неудачные платежи**: > 20% от общего количества

#### 2. Предупреждающие алерты
- **Истекающие подписки**: > 50 подписок истекает через 7 дней
- **Низкая производительность**: среднее время запроса > 1 секунды
- **Неиспользуемые индексы**: > 10 индексов без использования

---

## 💾 Резервное копирование

### Автоматическое резервное копирование

#### Ежедневные резервные копии
```bash
#!/bin/bash
# daily_backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="stefa_books"

# Создание резервной копии
pg_dump -h $SUPABASE_HOST \
        -U $SUPABASE_USER \
        -d $DB_NAME \
        -f "$BACKUP_DIR/daily_$DATE.sql"

# Сжатие
gzip "$BACKUP_DIR/daily_$DATE.sql"

# Удаление старых резервных копий (старше 30 дней)
find $BACKUP_DIR -name "daily_*.sql.gz" -mtime +30 -delete

echo "Backup completed: daily_$DATE.sql.gz"
```

#### Еженедельные полные резервные копии
```bash
#!/bin/bash
# weekly_backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Полная резервная копия с данными
pg_dump -h $SUPABASE_HOST \
        -U $SUPABASE_USER \
        -d $DB_NAME \
        --verbose \
        --clean \
        --if-exists \
        --create \
        -f "$BACKUP_DIR/weekly_$DATE.sql"

# Сжатие
gzip "$BACKUP_DIR/weekly_$DATE.sql"

# Удаление старых еженедельных копий (старше 12 недель)
find $BACKUP_DIR -name "weekly_*.sql.gz" -mtime +84 -delete

echo "Weekly backup completed: weekly_$DATE.sql.gz"
```

### Проверка резервных копий

#### Валидация резервной копии
```bash
#!/bin/bash
# validate_backup.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Проверка целостности
if gunzip -t "$BACKUP_FILE" 2>/dev/null; then
    echo "Backup file is valid: $BACKUP_FILE"
else
    echo "Backup file is corrupted: $BACKUP_FILE"
    exit 1
fi

# Проверка структуры
gunzip -c "$BACKUP_FILE" | head -20 | grep -q "CREATE TABLE"
if [ $? -eq 0 ]; then
    echo "Backup contains table definitions"
else
    echo "Backup may be incomplete"
    exit 1
fi
```

---

## 🔄 Восстановление данных

### Процедуры восстановления

#### 1. Восстановление из резервной копии
```bash
#!/bin/bash
# restore_backup.sh

BACKUP_FILE=$1
TARGET_DB=$2

if [ -z "$BACKUP_FILE" ] || [ -z "$TARGET_DB" ]; then
    echo "Usage: $0 <backup_file> <target_database>"
    exit 1
fi

# Создание базы данных (если не существует)
createdb -h $SUPABASE_HOST -U $SUPABASE_USER $TARGET_DB

# Восстановление из резервной копии
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | psql -h $SUPABASE_HOST -U $SUPABASE_USER -d $TARGET_DB
else
    psql -h $SUPABASE_HOST -U $SUPABASE_USER -d $TARGET_DB < "$BACKUP_FILE"
fi

echo "Database restored from: $BACKUP_FILE"
```

#### 2. Восстановление отдельных таблиц
```sql
-- Восстановление таблицы books из резервной копии
-- (требует предварительного экспорта таблицы)

-- 1. Создание временной таблицы
CREATE TABLE books_backup AS SELECT * FROM public.books;

-- 2. Очистка основной таблицы
TRUNCATE TABLE public.books CASCADE;

-- 3. Восстановление данных
-- (данные должны быть загружены из резервной копии)

-- 4. Проверка целостности
SELECT COUNT(*) FROM public.books;
```

### Процедуры отката

#### 1. Откат изменений схемы
```sql
-- Создание точки отката
SAVEPOINT schema_changes;

-- Выполнение изменений
ALTER TABLE public.books ADD COLUMN new_field text;

-- Если что-то пошло не так, откат
ROLLBACK TO SAVEPOINT schema_changes;

-- Или подтверждение изменений
COMMIT;
```

#### 2. Откат данных
```sql
-- Создание резервной копии перед изменениями
CREATE TABLE books_before_update AS SELECT * FROM public.books;

-- Выполнение изменений
UPDATE public.books SET title = 'New Title' WHERE id = 'some-uuid';

-- Если нужно откатить
DELETE FROM public.books WHERE id = 'some-uuid';
INSERT INTO public.books SELECT * FROM books_before_update WHERE id = 'some-uuid';
DROP TABLE books_before_update;
```

---

## 📞 Контакты и эскалация

### Уровни поддержки

#### Уровень 1 - Разработчики
- **Ответственность**: Основные операции, мониторинг
- **Время реакции**: 1-2 часа
- **Контакты**: dev-team@stefa.books.ua

#### Уровень 2 - Системные администраторы
- **Ответственность**: Критические проблемы, восстановление
- **Время реакции**: 30 минут
- **Контакты**: sysadmin@stefa.books.ua

#### Уровень 3 - Экстренная поддержка
- **Ответственность**: Критические сбои, потеря данных
- **Время реакции**: 15 минут
- **Контакты**: emergency@stefa.books.ua

### Процедуры эскалации

1. **Проблема обнаружена** → Уровень 1
2. **Не решена за 1 час** → Уровень 2
3. **Критическая проблема** → Уровень 3
4. **Потеря данных** → Немедленно Уровень 3

---

**Версия руководства**: 1.0  
**Дата обновления**: 10 сентября 2025  
**Следующий пересмотр**: 10 октября 2025
