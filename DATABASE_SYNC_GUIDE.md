# 🔧 Синхронизация базы данных - Руководство

## Проблема
У нас есть две таблицы с книгами:
- **`books`** - основная таблица (111 записей, из них 105 реальных книг)
- **`books_with_authors`** - VIEW (представление) для объединения данных

## Что нужно исправить

### 1. Отсутствует колонка `status` в таблице `books`
- Сейчас есть только `is_active` (boolean)
- Нужно добавить `status` (text) для совместимости с кодом

### 2. Отсутствует таблица `categories`
- Нужна для нормализации категорий книг
- Сейчас категории хранятся как текст в колонке `category`

### 3. Неправильная структура VIEW `books_with_authors`
- Ссылается на несуществующие колонки
- Нужно пересоздать с правильной структурой

## Решение

### Вариант 1: Выполнить через Supabase Dashboard

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Перейдите в ваш проект
3. Откройте раздел "SQL Editor"
4. Скопируйте и выполните содержимое файла `simple-database-fix.sql`

### Вариант 2: Выполнить по частям

Выполните следующие SQL команды по порядку:

```sql
-- 1. Создать таблицу категорий
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    parent_id UUID REFERENCES public.categories(id),
    description TEXT,
    slug TEXT UNIQUE,
    color TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

```sql
-- 2. Добавить недостающие колонки в books
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available',
ADD COLUMN IF NOT EXISTS code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS isbn TEXT,
ADD COLUMN IF NOT EXISTS age_range TEXT,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'uk',
ADD COLUMN IF NOT EXISTS publisher TEXT,
ADD COLUMN IF NOT EXISTS publication_year INTEGER,
ADD COLUMN IF NOT EXISTS price_daily NUMERIC(8,2),
ADD COLUMN IF NOT EXISTS price_weekly NUMERIC(8,2),
ADD COLUMN IF NOT EXISTS price_monthly NUMERIC(8,2),
ADD COLUMN IF NOT EXISTS price_uah NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS qty_total INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS qty_available INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2),
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS badges TEXT[],
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);
```

```sql
-- 3. Заполнить категории
INSERT INTO public.categories (name, slug, description, is_active) VALUES
('Пізнавальні', 'piznavalni', 'Пізнавальні книги для дітей', true),
('Пригоди', 'prygody', 'Пригодницькі книги', true),
('Казки', 'kazky', 'Казки та казкові історії', true),
('Повість', 'povist', 'Повісті та романи', true),
('Фентезі', 'fentezi', 'Фентезійна література', true),
('Психологія і саморозвиток', 'psykholohiya', 'Книги з психології та саморозвитку', true),
('Сучасна проза', 'suchasna-proza', 'Сучасна проза', true),
('Детектив', 'detektyv', 'Детективні твори', true),
('Романтика', 'romantyka', 'Романтична література', true),
('Найменші', 'naymenshi', 'Книги для найменших дітей', true),
('Дошкільний вік', 'doshkilnyy-vik', 'Книги для дошкільного віку', true),
('Молодший вік', 'molodshyy-vik', 'Книги для молодшого шкільного віку', true),
('Середній вік', 'seredniy-vik', 'Книги для середнього шкільного віку', true),
('Підлітковий вік', 'pidlitkovyy-vik', 'Книги для підліткового віку', true)
ON CONFLICT (name) DO NOTHING;
```

```sql
-- 4. Обновить статус книг
UPDATE public.books 
SET status = CASE 
  WHEN is_active = true THEN 'available'
  WHEN is_active = false THEN 'unavailable'
  ELSE 'available'
END
WHERE status IS NULL;
```

```sql
-- 5. Пересоздать VIEW
DROP VIEW IF EXISTS public.books_with_authors;

CREATE VIEW public.books_with_authors AS
SELECT 
  b.*,
  a.name as author_name,
  a.bio as author_biography,
  a.nationality as author_nationality,
  c.name as category_name,
  c.description as category_description
FROM public.books b
LEFT JOIN public.authors a ON b.author_id = a.id
LEFT JOIN public.categories c ON b.category_id = c.id
WHERE b.category != 'subscription-request';
```

## Проверка результата

После выполнения всех команд проверьте:

```sql
-- Количество записей в каждой таблице
SELECT 
  'Books table record count' as table_name,
  COUNT(*) as record_count
FROM public.books
WHERE category != 'subscription-request'

UNION ALL

SELECT 
  'Books_with_authors view record count' as table_name,
  COUNT(*) as record_count
FROM public.books_with_authors

UNION ALL

SELECT 
  'Categories table record count' as table_name,
  COUNT(*) as record_count
FROM public.categories;
```

Ожидаемый результат:
- Books table: 105 записей
- Books_with_authors view: 105 записей  
- Categories table: 14 записей

## После исправления

1. ✅ У нас будет правильная структура базы данных
2. ✅ Таблица `books` будет содержать колонку `status`
3. ✅ VIEW `books_with_authors` будет правильно объединять данные
4. ✅ Код приложения будет работать корректно
5. ✅ Статус книг будет отображаться правильно

## Файлы для справки

- `simple-database-fix.sql` - полный SQL скрипт для выполнения
- `create-missing-tables.sql` - расширенная версия с дополнительными функциями
- `analyze-books-data.js` - скрипт для анализа данных
