# Stefa.Books — Database Handbook

## 1. Обзор изменений (сентябрь 2025)
- Восстановлена согласованная структура книг:
  - Добавлены столбцы `status`, `age_category_id`, вспомогательные поля (code, rating и т.д.).
  - Создана таблица `age_categories` с предзаполненными возрастными категориями.
  - Пересоздан VIEW `public.books_with_authors` без SECURITY DEFINER и с `security_invoker=true`.
- Кэш-бастинг и глобальные заголовки — вне области БД (см. фронт).
- Политики RLS приведены к единому стилю: `(select auth.uid())::text` сравнивается с owner-колонками `...::text`.
- Создана и исправлена функция `public.is_admin(...)` с перегрузками для `uuid` и `text` (сравнение через `u.id::text`).
- Устранены «Multiple permissive policies» и «Security Definer View» в Advisor.
- Удалены безопасно выявленные дубликаты индексов (без _id), добавлен покрывающий индекс для `notification_queue.user_id`.

## 2. Текущая схема (ключевые таблицы)

### 2.1 books
- id (uuid, PK)
- title (text)
- author (text)
- author_id (uuid, FK → authors.id)
- category_id (uuid, FK → categories.id)
- subcategory_id (uuid | null)
- status (text) — 'available' | 'unavailable'
- is_active (boolean)
- cover_url (text | null)
- short_description, description (text | null)
- code (text | unique | null)
- rating (numeric | null), rating_count (int | null)
- age_category_id (uuid | null, FK → age_categories.id)
- search_text (text | null), search_vector (tsvector | null)
- created_at, updated_at (timestamptz | null)

Индексы (основные):
- books_pkey (PK)
- idx_books_created_at (created_at DESC)
- idx_books_category_id, books_author_id_idx
- idx_books_status, idx_books_is_active
- books_age_category_id_idx
- books_search_vector_idx (GIN)

### 2.2 authors
- id (uuid, PK), name, bio/biography, nationality, created_at, updated_at
Индексы: authors_pkey, authors_name_key, idx_authors_name

### 2.3 categories
- id (uuid, PK), name, slug (unique), parent_id (uuid | null), is_active (bool)
Индексы: categories_pkey, categories_slug_key, idx_categories_name, idx_categories_slug, idx_categories_parent_id

### 2.4 age_categories
- id (uuid, PK)
- name, slug (unique)
- min_age, max_age (int | null)
- is_active (bool)
Индексы: age_categories_pkey, age_categories_slug_key

### 2.5 rentals
- id (uuid, PK)
- user_id (text/uuid по БД — сравнение через ::text)
- book_id (uuid)
- status (text)
- created_at, return_date, updated_at
Индексы: rentals_pkey, idx_rentals_user (user_id), idx_rentals_book (book_id), idx_rentals_status

### 2.6 subscription_requests
- id (uuid, PK)
- user_id (text/uuid, сравнение через ::text)
- phone, status, created_at
Индексы: pkey + idx_subscription_requests_user_id/phone/status/created_at

### 2.7 subscriptions
- id (uuid, PK)
- user_id (text/uuid, сравнение через ::text)
- plan_id (uuid), status, expires_at
Индексы: subscriptions_pkey, idx_subscriptions_user_id, idx_subscriptions_plan_id, idx_subscriptions_status

### 2.8 profiles
- id (uuid, PK) — используется как owner id
- subscription_id (uuid | null)
Индексы: profiles_pkey, idx_profiles_user (id), idx_profiles_subscription

### 2.9 reading_history
- id (uuid, PK), user_id, book_id
Индексы: pkey, reading_history_user_id_book_id_key (unique), idx_reading_history_user_id, idx_reading_history_book_id

### 2.10 notification_queue
- id (uuid, PK), user_id, status
Индексы: notification_queue_pkey, idx_notification_queue_status, notification_queue_user_id_idx (covering FK)

## 3. Представления и функции

### 3.1 VIEW public.books_with_authors
- Состав: поля из books + author_name/bio/nationality + category_name/description + age_category_name/…
- Опции: `security_invoker = true`
- Фильтр: исключает `b.category = 'subscription-request'`

### 3.2 Функция public.is_admin
Перегрузки:
- `is_admin(user_id uuid) returns boolean`
- `is_admin(user_id text) returns boolean`
Обе сравнивают `users.id::text` с входом (приводим к ::text). SECURE: `SECURITY DEFINER`, `SET search_path = public`.

## 4. Политики RLS (шаблоны)

Правило сравнения владельца:
- Всегда используем `(select auth.uid())::text = <owner_col>::text`
- Для админов: `public.is_admin((select auth.uid()))`

Примеры:
- rentals
  - SELECT: владелец ИЛИ админ
  - INSERT: владелец
  - UPDATE: владелец (WITH CHECK — запрет смены владельца)
- subscriptions
  - SELECT: владелец ИЛИ админ
  - INSERT: владелец
  - UPDATE: владелец ИЛИ админ + WITH CHECK владелец
- subscription_requests
  - SELECT: владелец ИЛИ админ
- profiles
  - SELECT/INSERT/UPDATE: владелец по `id` (равен user id)

Обязательные включения RLS:
- `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`

## 5. Индексация — политика проекта

- Не удалять индексы на: user_id, plan_id, status, slug, name, parent_id, created_at, category_id, author_id, book_id, is_active, code, rating.
- Покрывающие индексы на FK создавать явно (пример: `notification_queue.user_id`).
- Дубликаты с/без `_id` — держим вариант с `_id`, удаляем без `_id` (top‑level DROP INDEX CONCURRENTLY, одна строка, Wrap off).
- «Unused Index» = INFO. Чистка только после 5–7 дней трафика и повторной проверки `pg_stat_user_indexes`.
- Поиск: используем `books_search_vector_idx (GIN)`. Индекс `books_search_text_idx` (trigram) — опционален; удалять только если подтверждено отсутствие использования.

## 6. Регламенты работы с Supabase SQL Editor

- Для `DROP INDEX CONCURRENTLY` и `CREATE INDEX CONCURRENTLY`:
  - Run settings → выключить “Wrap in transaction”.
  - Выполнять по одной команде, с паузой 2–5 сек (rate limit).
  - Никаких DO $$…$$ / BEGIN/COMMIT.
- Если нельзя отключить транзакцию — используйте варианты без CONCURRENTLY (вне пиков из‑за блокировок).

## 7. Чек-листы

### 7.1 Добавление новой таблицы
- PK: `id uuid default gen_random_uuid()`
- Таймстемпы: `created_at timestamptz default now(), updated_at timestamptz`
- Внешние ключи → создать покрывающий индекс
- Включить RLS + написать минимум SELECT/INSERT/UPDATE политики
- Индексы: user_id/статусы/даты/slug/name по сценариям выборок

### 7.2 Обновление RLS
- Использовать `(select auth.uid())::text`
- WITH CHECK на UPDATE/INSERT чтобы исключить смену владельца
- Для административного обхода — `public.is_admin((select auth.uid()))`

### 7.3 Удаление индексов
- Проверить pg_stat_user_indexes (idx_scan, size)
- Исключить PK/UNIQUE/constraint и критичные колонки
- Удалять по одному, top‑level, Wrap off

## 8. Точки принятия решений
- Оставляем оба механизма поиска? Если основной — tsvector, триграммный `books_search_text_idx` можно удалить.
- При росте трафика — добавить индексы по горячим фильтрам аналитикой запросов.

## 9. Примеры запросов

- Книги по возрастной категории:
```sql
select b.id, b.title, ac.name as age
from books b
left join age_categories ac on ac.id = b.age_category_id
where ac.slug = 'molodshyy-6-8';
```

- Поиск по tsvector:
```sql
select id, title
from books
where search_vector @@ plainto_tsquery('simple', 'літо казки');
```

- Проверка админа:
```sql
select public.is_admin('00000000-0000-0000-0000-000000000000'::uuid);
```

## 10. Приложение A — исправленные предупреждения Advisor
- Security Definer View: устранено (security_invoker на view)
- RLS Disabled: включено для categories и search_queries
- Function search_path: для чувствительных функций — `SET search_path = public`
- Auth RLS initplan: вызовы заменены на `(select auth.uid())`
- Duplicate Index: удалены дубль-индексы без `_id`

---
## 11. Экспорт в Google Sheets

Подходит для выгрузки справочников, отчётов и метрик.

Вариант A — CSV + импорта в Sheets:
- Выполнить SELECT → экспортировать результат как CSV в Supabase SQL Editor
- В Google Sheets: Файл → Импорт → Загрузить CSV → Создать новую таблицу

Вариант B — через Apps Script (прямое подключение по REST):
1) В Google Sheets → Расширения → Apps Script, вставить скрипт с fetch к PostgREST
2) Использовать сервисный ключ Supabase (в Script Properties), делать запросы вида
   `GET https://<project>.supabase.co/rest/v1/books?select=id,title,author&limit=1000`
3) Парсить JSON и записывать в активный лист

Советы:
- Для больших выборок используйте пагинацию `range=`, `limit` + курсор
- Нормализуйте даты в SQL (`to_char(created_at,'YYYY-MM-DD HH24:MI') as created_at`)
- Для регулярной выгрузки поставьте триггер по расписанию в Apps Script

Если нужна готовая Apps Script заготовка — скажи, добавлю `scripts/export-to-sheets.gs`.
