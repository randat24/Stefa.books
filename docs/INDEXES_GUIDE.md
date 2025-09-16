# Руководство по индексам базы данных

## Важные категории индексов

### 1. Индексы для внешних ключей (Foreign Keys)

Эти индексы **необходимо всегда сохранять**, даже если они отмечены как неиспользуемые:

| Индекс | Таблица | Назначение |
|--------|---------|------------|
| `idx_books_age_category_id` | books | Связь с возрастными категориями |
| `idx_categories_parent_id` | categories | Иерархия категорий |
| `idx_subscription_requests_user_id` | subscription_requests | Связь с пользователями |
| `idx_subscriptions_plan_id` | subscriptions | Связь с планами подписок |
| `idx_notification_queue_user_id` | notification_queue | Связь с пользователями |
| `idx_subcategories_main_category_id` | subcategories | Связь с основными категориями |

### 2. Поисковые индексы

Эти индексы **критически важны для полнотекстового поиска**:

| Индекс | Таблица | Тип | Назначение |
|--------|---------|-----|------------|
| `books_search_text_idx` | books | GIN | Полнотекстовый поиск |
| `idx_books_title_gin` | books | GIN | Поиск по названию |

### 3. Индексы для сортировки и JOIN-операций

Важны для оптимизации сложных запросов:

| Индекс | Таблица | Назначение |
|--------|---------|------------|
| `idx_books_created_at` | books | Сортировка по дате создания |
| `idx_books_category_id` | books | Фильтрация по категориям |
| `idx_books_subcategory_id` | books | Фильтрация по подкатегориям |

## Правила управления индексами

### Когда сохранять индексы:

1. **Всегда сохраняйте**:
   - Первичные ключи (`*_pkey`)
   - Уникальные индексы (`*_key`)
   - Индексы для внешних ключей (даже если они не используются)
   - GIN индексы для полнотекстового поиска

2. **Оценивайте по запросам**:
   - Индексы для полей, используемых в WHERE, ORDER BY, GROUP BY
   - Индексы для JOIN операций

### Когда можно удалить индексы:

1. **Если индекс не используется** (idx_scan = 0) и:
   - Не связан с внешними ключами
   - Не используется для полнотекстового поиска
   - Не является уникальным или первичным ключом
   - Не нужен для сортировки или фильтрации в частых запросах

2. **Индексы для редко используемых полей**:
   - Поля, которые редко используются в запросах
   - Поля с низкой селективностью

## Команды для мониторинга индексов

### Проверка использования индексов

```sql
SELECT 
  schemaname, 
  relname AS tablename, 
  indexrelname AS indexname, 
  idx_scan,
  CASE 
    WHEN idx_scan = 0 THEN '🔴 Никогда не использовался'
    WHEN idx_scan < 10 THEN '🟡 Редкое использование'
    WHEN idx_scan < 100 THEN '🟠 Среднее использование'
    ELSE '🟢 Активное использование'
  END AS status,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM 
  pg_stat_all_indexes 
WHERE 
  schemaname = 'public'
ORDER BY 
  idx_scan DESC;
```

### Поиск неиспользуемых индексов

```sql
SELECT 
  schemaname,
  relname AS tablename,
  indexrelname AS indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM 
  pg_stat_user_indexes 
WHERE 
  idx_scan = 0 
  AND schemaname = 'public'
  AND indexrelname NOT LIKE '%_pkey'
  AND indexrelname NOT LIKE '%_key'
ORDER BY 
  pg_relation_size(indexrelid) DESC;
```

### Проверка внешних ключей и их индексов

```sql
WITH fkeys AS (
  SELECT 
    tc.table_schema, 
    tc.table_name,
    kcu.column_name,
    tc.constraint_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
  FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
)
SELECT 
  f.table_name,
  f.column_name,
  f.constraint_name,
  f.foreign_table_name,
  EXISTS (
    SELECT 1 FROM pg_indexes i 
    WHERE 
      i.schemaname = 'public' 
      AND i.tablename = f.table_name 
      AND i.indexdef LIKE '%' || f.column_name || '%'
  ) AS has_index
FROM fkeys f
ORDER BY has_index, f.table_name;
```

---
*Последнее обновление: 2024-09-15*
