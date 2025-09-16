# Полная документация базы данных Stefa.Books

## Обзор структуры базы данных

### Важные особенности структуры

1. **Поле `category` в таблице `books`**:
   - Это строковое поле, а не внешний ключ
   - Содержит название категории, а не ID категории
   - Не имеет ограничений внешнего ключа

2. **Проверки статусов**:
   - Таблица `subscriptions` имеет ограничение на допустимые значения поля `status`: 'active', 'paused', 'cancelled', 'expired'

3. **Триггеры**:
   - Таблица `subscriptions` имеет триггер `t_subscriptions_updated_at`, который обновляет поле `updated_at` при изменении записи

База данных Stefa.Books построена на PostgreSQL через Supabase и содержит следующие таблицы:

| Таблица | Описание |
|---------|----------|
| age_categories | Возрастные категории для книг |
| books | Основная таблица с информацией о книгах |
| bot_admins | Администраторы бота |
| bot_settings | Настройки бота |
| bot_users | Пользователи бота |
| main_categories | Основные категории книг |
| migration_log | Журнал миграций |
| notification_queue | Очередь уведомлений |
| payments | Платежи |
| plans | Планы подписок |
| profiles | Профили пользователей |
| reading_history | История чтения |
| rentals | Аренды книг |
| search_queries | Поисковые запросы |
| subcategories | Подкатегории книг |
| subscription_requests | Запросы на подписку |
| subscriptions | Подписки |
| users | Пользователи |

## Детальное описание таблиц

### age_categories

Возрастные категории для книг.

**SQL структура:**
```sql
create table public.age_categories (
  id uuid not null default gen_random_uuid(),
  name text not null,
  slug text null,
  description text null,
  min_age integer null,
  max_age integer null,
  sort_order integer null default 0,
  is_active boolean null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint age_categories_pkey primary key (id),
  constraint age_categories_name_key unique (name),
  constraint age_categories_slug_key unique (slug)
) TABLESPACE pg_default;
```

**TypeScript интерфейс:**
```typescript
interface AgeCategory {
  id: string;               // UUID, первичный ключ
  name: string;             // Название категории (уникальное)
  slug: string | null;      // URL-дружественный идентификатор (уникальный)
  description: string | null; // Описание категории
  min_age: number | null;   // Минимальный возраст
  max_age: number | null;   // Максимальный возраст
  sort_order: number | null; // Порядок сортировки (по умолчанию 0)
  is_active: boolean | null; // Активна ли категория (по умолчанию true)
  created_at: string;       // Дата создания
  updated_at: string;       // Дата обновления
}

### books

Основная таблица с информацией о книгах.

**SQL структура (частичная):**
```sql
-- Примерная структура таблицы books (может отличаться от актуальной)
create table public.books (
  id uuid not null default gen_random_uuid(),
  title text not null,
  author text not null,
  description text null,
  cover_url text null,
  pages integer null,
  is_active boolean null default true,
  category text null, -- Строковое поле, а не внешний ключ
  age_range text null,
  rating numeric null,
  rating_count integer null,
  badges text[] null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint books_pkey primary key (id)
) TABLESPACE pg_default;
```

**TypeScript интерфейс:**
```typescript
interface Book {
  id: string;                  // UUID, первичный ключ
  title: string;               // Название книги
  author: string;              // Автор книги
  description?: string | null; // Описание книги
  cover_url?: string | null;   // URL обложки книги
  pages?: number | null;       // Количество страниц
  is_active: boolean | null;   // Активна ли книга (доступна для аренды)
  category: string | null;     // Категория книги (строка, а не ID)
  age_range: string | null;    // Возрастной диапазон
  rating?: number | null;      // Рейтинг книги
  rating_count?: number | null; // Количество оценок
  badges?: string[] | null;    // Бейджи книги
  created_at: string | null;   // Дата создания
  updated_at: string | null;   // Дата обновления
  // Другие поля...
}
```

> **Важно**: В таблице `books` используется поле `category` (строковое значение), а не `category_id`. Это строковое поле содержит название категории, а не ссылку на ID в другой таблице.

### subscriptions

Подписки пользователей.

**SQL структура:**
```sql
create table public.subscriptions (
  id uuid not null default extensions.uuid_generate_v4(),
  user_id uuid not null,
  plan_id uuid null,
  status text null default 'active'::text,
  started_at timestamp with time zone null default now(),
  expires_at timestamp with time zone null,
  auto_renew boolean null default true,
  books_used_this_month integer null default 0,
  total_books_used integer null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint subscriptions_pkey primary key (id),
  constraint subscriptions_plan_id_fkey foreign KEY (plan_id) references plans (id),
  constraint subscriptions_status_check check (
    (
      status = any (
        array[
          'active'::text,
          'paused'::text,
          'cancelled'::text,
          'expired'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_subscriptions_plan_id on public.subscriptions using btree (plan_id) TABLESPACE pg_default;

create trigger t_subscriptions_updated_at BEFORE
update on subscriptions for EACH row
execute FUNCTION touch_updated_at();
```

**TypeScript интерфейс:**
```typescript
interface Subscription {
  id: string;                    // UUID, первичный ключ
  user_id: string;               // ID пользователя
  plan_id: string | null;        // ID плана подписки
  status: string | null;         // Статус: 'active', 'paused', 'cancelled', 'expired'
  started_at: string | null;     // Дата начала подписки
  expires_at: string | null;     // Дата окончания подписки
  auto_renew: boolean | null;    // Автоматическое продление (по умолчанию true)
  books_used_this_month: number | null; // Количество книг, использованных в текущем месяце
  total_books_used: number | null;      // Общее количество использованных книг
  created_at: string | null;     // Дата создания
  updated_at: string | null;     // Дата обновления
}

## Рекомендации по исправлению кода

1. **Замена всех упоминаний `category_id` на `category`**:
   - Во всех компонентах и функциях, где используется поле `category_id`, нужно заменить его на `category`
   - Это касается фильтрации, отображения и других операций с книгами

2. **Обновление типов TypeScript**:
   - Убедитесь, что все типы TypeScript соответствуют текущей структуре базы данных
   - Особенно важно проверить типы для таблиц `books`, `subscriptions` и `subscription_requests`

3. **Проверка связей между таблицами**:
   - Убедитесь, что в коде правильно обрабатываются связи между таблицами
   - Особенно важно проверить связи между `subcategories` и `main_categories`, а также между `subscriptions` и `plans`

## Файлы, требующие исправления

Следующие файлы содержат упоминания `category_id` и требуют исправления:

1. src/components/BookPreviewModal.tsx
2. src/components/search/AdvancedSearch.tsx
3. src/components/search/SimpleSearch.tsx
4. src/components/catalog/BooksCatalog.tsx
5. src/components/search/HeaderSearch.tsx
6. src/components/search/EnhancedSearch.tsx
7. src/components/catalog/QuickFilters.tsx
8. src/components/BookSpecifications.tsx
9. src/components/admin/EditBookDialog.tsx
10. src/components/search/SearchProvider.tsx
11. src/components/return/BookReturnInfo.tsx
