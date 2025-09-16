# Инструкция по реструктуризации базы данных

## Проблема
Нужно удалить внешние ключи `category_id`, `author_id`, `subcategory_id` из таблицы `books` и удалить связанные таблицы, заменив их на строковые поля.

## Пошаговая инструкция

### 1. Откройте Supabase Dashboard
- Перейдите в ваш проект
- Откройте раздел "SQL Editor"

### 2. Выполните команды по порядку

#### Шаг 1: Создайте резервную копию
```sql
CREATE TABLE books_backup AS SELECT * FROM books;
```

#### Шаг 2: Удалите зависимые объекты
```sql
DROP VIEW IF EXISTS books_with_authors CASCADE;
```

#### Шаг 3: Удалите внешние ключи
```sql
ALTER TABLE books DROP COLUMN IF EXISTS category_id CASCADE;
ALTER TABLE books DROP COLUMN IF EXISTS author_id CASCADE;
ALTER TABLE books DROP COLUMN IF EXISTS subcategory_id CASCADE;
```

#### Шаг 4: Удалите ненужные таблицы
```sql
DROP TABLE IF EXISTS book_authors CASCADE;
DROP TABLE IF EXISTS authors CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
```

#### Шаг 5: Добавьте новые поля
```sql
ALTER TABLE books ADD COLUMN IF NOT EXISTS category VARCHAR(255);
ALTER TABLE books ADD COLUMN IF NOT EXISTS subcategory VARCHAR(255);
```

#### Шаг 6: Обновите данные
```sql
UPDATE books SET 
  category = 'Детская литература', 
  subcategory = 'Сказки'
WHERE category IS NULL;
```

#### Шаг 7: Создайте индексы
```sql
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_subcategory ON books(subcategory);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
```

#### Шаг 8: Проверьте результат
```sql
SELECT 
  'Реструктуризация завершена' as status,
  COUNT(*) as total_books,
  COUNT(DISTINCT category) as unique_categories,
  COUNT(DISTINCT author) as unique_authors
FROM books;
```

### 3. После выполнения
- Обновите `database.types.ts`
- Обновите API endpoints
- Протестируйте функциональность

## Важно
- Выполняйте команды по порядку
- Если возникнет ошибка, проверьте зависимости
- Сделайте резервную копию перед началом
