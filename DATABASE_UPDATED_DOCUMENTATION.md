# Документация по базе данных Stefa.Books

## Обзор структуры базы данных

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

## Основные таблицы и их структура

### books

Основная таблица с информацией о книгах.

```typescript
interface Book {
  id: string;                  // UUID, первичный ключ
  title: string;               // Название книги
  author: string;              // Автор книги
  description?: string | null; // Описание книги
  cover_url?: string | null;   // URL обложки книги
  pages?: number | null;       // Количество страниц
  is_active: boolean | null;   // Активна ли книга (доступна для аренды)
  created_at: string | null;   // Дата создания
  updated_at: string | null;   // Дата обновления
  category: string | null;     // Категория книги (строка, а не ID)
  age_range: string | null;    // Возрастной диапазон
  rating?: number | null;      // Рейтинг книги
  rating_count?: number | null; // Количество оценок
  badges?: string[] | null;    // Бейджи книги
  // Другие поля...
}
```

> **Важно**: В таблице `books` используется поле `category` (строковое значение), а не `category_id`. Это строковое поле содержит название категории, а не ссылку на ID в другой таблице.

SQL структура (частичная):
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

### main_categories

Основные категории книг.

```typescript
interface MainCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  created_at: string | null;
  updated_at: string | null;
}
```

### age_categories

Возрастные категории для книг.

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
```

SQL структура:
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

### rentals

Информация об арендах книг.

```typescript
interface Rental {
  id: string;
  user_id: string;
  book_id: string;
  start_date: string;
  end_date: string;
  status: string; // 'active', 'completed', 'cancelled'
  created_at: string | null;
  updated_at: string | null;
}
```

### subscriptions

Подписки пользователей.

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
```

SQL структура:
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

### plans

Планы подписок.

```typescript
interface Plan {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  duration_days: number;
  max_books: number;
  features?: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}
```

## Связи между таблицами

- **books** → **main_categories**: Книги связаны с основными категориями через поле `category`
- **books** → **age_categories**: Книги связаны с возрастными категориями через поле `age_range`
- **rentals** → **books**: Аренды связаны с книгами через поле `book_id`
- **rentals** → **users**: Аренды связаны с пользователями через поле `user_id`
- **subscriptions** → **users**: Подписки связаны с пользователями через поле `user_id`
- **subscriptions** → **plans**: Подписки связаны с планами через поле `plan_id`

## Недавние изменения в структуре

1. **Удаление таблицы categories**: Таблица была удалена за ненадобностью
2. **Изменение поля `category_id` на `category`**: В таблице `books` поле `category_id` было заменено на поле `category`

## Рекомендации по работе с базой данных

1. **Используйте поле `category` вместо `category_id`**: Во всех запросах и компонентах используйте поле `category` для фильтрации и группировки книг по категориям.

2. **Обновите типы TypeScript**: Убедитесь, что все типы TypeScript соответствуют текущей структуре базы данных.

3. **Используйте Supabase клиент**: Для работы с базой данных используйте клиент Supabase:

```typescript
import { supabase } from '@/lib/supabase';

// Пример запроса книг по категории
const { data, error } = await supabase
  .from('books')
  .select('*')
  .eq('category', 'Сказки')
  .order('created_at', { ascending: false });
```

## Безопасность и доступ

Все таблицы защищены Row Level Security (RLS) политиками:

- Обычные пользователи имеют доступ только для чтения к большинству таблиц
- Только аутентифицированные пользователи могут создавать записи в таблицах `rentals` и `subscription_requests`
- Только администраторы имеют полный доступ ко всем таблицам

## Рекомендации по миграции кода

Если в вашем коде все еще используются устаревшие поля или таблицы:

1. Замените все упоминания `category_id` на `category`
2. Используйте `@ts-expect-error` или `@ts-ignore` для временного обхода ошибок TypeScript
3. Обновите типы в файле `src/lib/database.types.ts`
