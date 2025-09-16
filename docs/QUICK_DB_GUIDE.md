# Быстрое руководство по базе данных Stefa.Books

## 🚀 Быстрый старт

### Основные команды для мониторинга

#### 1. Проверка здоровья БД
```sql
SELECT * FROM database_health_check();
```

#### 2. Анализ использования индексов
```sql
SELECT 
  schemaname, 
  relname AS tablename, 
  indexrelname AS indexname, 
  idx_scan,
  CASE 
    WHEN idx_scan = 0 THEN '🔴 Кандидат на удаление'
    WHEN idx_scan < 10 THEN '🟡 Низкое использование'
    WHEN idx_scan < 100 THEN '🟠 Среднее использование'
    ELSE '🟢 Высокое использование'
  END AS usage_status
FROM pg_stat_all_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

#### 3. Поиск неиспользуемых индексов
```sql
SELECT 
  schemaname,
  relname AS tablename,
  indexrelname AS indexname
FROM pg_stat_user_indexes 
WHERE idx_scan = 0 
  AND schemaname = 'public'
  AND indexrelname NOT LIKE '%_pkey'
  AND indexrelname NOT LIKE '%_key'
ORDER BY tablename, indexname;
```

## 📊 Ключевые таблицы

| Таблица | Назначение | Основные поля |
|---------|------------|---------------|
| `books` | Каталог книг | id, title, author, status, available |
| `users` | Пользователи | id, email, role, status |
| `rentals` | Аренда книг | user_id, book_id, status, due_date |
| `authors` | Авторы | id, name, nationality |
| `categories` | Категории | id, name, parent_id |

## 🔐 Роли пользователей

- **admin** - полный доступ ко всем таблицам
- **moderator** - ограниченный доступ к управлению
- **user** - доступ только к своим данным

## ⚡ Частые задачи

### Добавление новой книги
```sql
INSERT INTO books (title, author, category, available, status)
VALUES ('Название книги', 'Автор', 'Категория', true, 'available');
```

### Поиск доступных книг
```sql
SELECT title, author, category 
FROM books 
WHERE available = true 
  AND status = 'available'
ORDER BY title;
```

### Проверка аренд пользователя
```sql
SELECT b.title, r.rental_date, r.due_date, r.status
FROM rentals r
JOIN books b ON r.book_id = b.id
WHERE r.user_id = 'user-id-here';
```

### Обновление статуса книги
```sql
UPDATE books 
SET status = 'rented', available = false 
WHERE id = 'book-id-here';
```

## 🛠️ Обслуживание

### Еженедельно
- Проверка здоровья БД: `SELECT * FROM database_health_check();`
- Анализ неиспользуемых индексов

### Ежемесячно
- Анализ индексов: `SELECT * FROM database_health_check();`
- Обновление статистики: `ANALYZE;`
- Очистка ненужных индексов (с осторожностью): 
  ```sql
  -- Перед удалением проверьте, что индекс не нужен для внешних ключей или поиска
  DROP INDEX IF EXISTS индекс_который_точно_не_нужен;
  ```

### При проблемах
- Проверка блокировок
- Анализ медленных запросов
- Восстановление из бэкапа

## 🚨 Важные правила

1. **Всегда делайте бэкап** перед удалением индексов
2. **Тестируйте изменения** на копии БД
3. **Не удаляйте** первичные ключи (`*_pkey`) и уникальные индексы (`*_key`)
4. **Проверяйте RLS политики** при изменении структуры
5. **Мониторьте производительность** после изменений

## ⚡ Оптимизация RLS политик

### Проблема
```sql
-- ❌ Неоптимально: auth.uid() вызывается для КАЖДОЙ строки
CREATE POLICY "Admin policy" ON some_table
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );
```

### Решение
```sql
-- ✅ Оптимально: auth.uid() вызывается ОДИН раз для всего запроса
CREATE POLICY "Admin policy" ON some_table
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = (SELECT auth.uid())::text AND role = 'admin')
  );
```

## 📚 Документация

- **Общая документация БД:** `/docs/DATABASE_DOCUMENTATION.md`
- **Руководство по индексам:** `/docs/INDEXES_GUIDE.md`
- **Безопасность функций:** `/docs/FUNCTION_SECURITY.md` 
- **Скрипты обслуживания:** `/database/maintenance_scripts.sql`
- **Техподдержка:** admin@stefa-books.com.ua

---
*Обновлено: 2024-12-19*
