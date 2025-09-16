# ПОЛНАЯ ДОКУМЕНТАЦИЯ БАЗЫ ДАННЫХ STEFA.BOOKS

## 📋 Содержание

1. [Обзор архитектуры](#обзор-архитектуры)
2. [Схемы таблиц](#схемы-таблиц)
3. [Связи между таблицами](#связи-между-таблицами)
4. [Функции и процедуры](#функции-и-процедуры)
5. [RLS политики безопасности](#rls-политики-безопасности)
6. [Оптимизация производительности](#оптимизация-производительности)
7. [Инструкции по работе](#инструкции-по-работе)
8. [Чек-листы](#чек-листы)
9. [Troubleshooting](#troubleshooting)

---

## 🏗️ Обзор архитектуры

### Технологический стек
- **База данных**: PostgreSQL (Supabase)
- **Аутентификация**: Supabase Auth
- **Безопасность**: Row Level Security (RLS)
- **Хранилище файлов**: Cloudinary
- **Деплой**: Vercel

### Основные сущности
- **Пользователи** (`users`, `profiles`)
- **Книги** (`books`, `authors`, `book_authors`)
- **Категории** (`main_categories`, `subcategories`)
- **Подписки** (`subscriptions`, `plans`)
- **Платежи** (`payments`)
- **Уведомления** (`notification_queue`)

---

## 📊 Схемы таблиц

### 1. Пользователи и профили

#### Таблица `users`
```sql
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_admin boolean DEFAULT false
);
```

#### Таблица `profiles`
```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  phone text,
  subscription_id uuid REFERENCES public.subscriptions(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 2. Книги и авторы

#### Таблица `books`
```sql
CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  cover_url text,
  pages int,
  category text,
  subcategory_id uuid REFERENCES public.main_categories(id),
  tsvector tsvector,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### Таблица `authors`
```sql
CREATE TABLE public.authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  biography text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### Таблица `book_authors` (связь многие-ко-многим)
```sql
CREATE TABLE public.book_authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.authors(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(book_id, author_id)
);
```

### 3. Категории

#### Таблица `main_categories`
```sql
CREATE TABLE public.main_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### Таблица `subcategories`
```sql
CREATE TABLE public.subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  main_category_id uuid REFERENCES public.main_categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 4. Подписки и планы

#### Таблица `plans`
```sql
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_monthly decimal(10,2),
  price_yearly decimal(10,2),
  max_books_per_month int DEFAULT 5,
  max_books_total int DEFAULT 50,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### Таблица `subscriptions`
```sql
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.plans(id) ON DELETE CASCADE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  auto_renew boolean DEFAULT true,
  books_used_this_month int DEFAULT 0,
  total_books_used int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 5. Платежи

#### Таблица `payments`
```sql
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'UAH',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method text,
  transaction_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 6. Уведомления

#### Таблица `notification_queue`
```sql
CREATE TABLE public.notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('subscription_expired', 'payment_failed', 'book_available')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

### 7. История чтения

#### Таблица `reading_history`
```sql
CREATE TABLE public.reading_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  finished_at timestamptz,
  rating int CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

## 🔗 Связи между таблицами

### Диаграмма связей
```
users (1) ←→ (1) profiles
users (1) ←→ (N) subscriptions
users (1) ←→ (N) payments
users (1) ←→ (N) notification_queue
users (1) ←→ (N) reading_history

plans (1) ←→ (N) subscriptions

books (N) ←→ (N) authors (через book_authors)
books (N) ←→ (1) main_categories (через subcategory_id)
books (1) ←→ (N) reading_history

main_categories (1) ←→ (N) subcategories
```

### Ключевые связи
- **Пользователь → Профиль**: Один к одному
- **Пользователь → Подписки**: Один ко многим
- **План → Подписки**: Один ко многим
- **Книга → Авторы**: Многие ко многим
- **Книга → Категория**: Многие к одному

---

## ⚙️ Функции и процедуры

### 1. Триггеры

#### `touch_updated_at()`
```sql
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

#### `books_tsvector()`
```sql
CREATE OR REPLACE FUNCTION public.books_tsvector()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.tsvector := to_tsvector('ukrainian', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.description, '')
  );
  RETURN NEW;
END;
$$;
```

### 2. Бизнес-логика

#### `check_subscription_limits(user_id, books_requested)`
```sql
CREATE OR REPLACE FUNCTION public.check_subscription_limits(
  user_id uuid,
  books_requested int DEFAULT 1
)
RETURNS TABLE (
  can_rent boolean,
  books_remaining_this_month int,
  books_remaining_total int,
  subscription_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
-- Проверяет лимиты подписки пользователя
$$;
```

#### `create_subscription(user_id, plan_uuid, duration_months)`
```sql
CREATE OR REPLACE FUNCTION public.create_subscription(
  user_id uuid,
  plan_uuid uuid,
  duration_months int DEFAULT 1
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
-- Создает новую подписку для пользователя
$$;
```

### 3. Поиск и фильтрация

#### `search_books_by_author(author_name, limit_count)`
```sql
CREATE OR REPLACE FUNCTION public.search_books_by_author(
  author_name text, 
  limit_count int DEFAULT 20
)
RETURNS TABLE (
  book_id uuid,
  title text,
  cover_url text,
  author_names text
)
LANGUAGE sql STABLE
SET search_path = public
AS $$
-- Поиск книг по автору
$$;
```

#### `get_books_detailed(limit_count)`
```sql
CREATE OR REPLACE FUNCTION public.get_books_detailed(limit_count int DEFAULT 50)
RETURNS TABLE (
  book_id uuid,
  title text,
  description text,
  cover_url text,
  pages int,
  author_names text,
  category_name text
)
LANGUAGE sql STABLE
SET search_path = public
AS $$
-- Получение детальной информации о книгах
$$;
```

---

## 🔒 RLS политики безопасности

### Принципы безопасности
- **Deny by default** - по умолчанию доступ запрещен
- **Публичные данные** - каталог книг доступен всем
- **Приватные данные** - пользовательские данные только владельцу
- **Админские данные** - только администраторам

### Политики для публичных таблиц
```sql
-- Книги - публичный доступ
CREATE POLICY "Публичный доступ к книгам" ON public.books
  FOR SELECT USING (true);

-- Авторы - публичный доступ
CREATE POLICY "Публичный доступ к авторам" ON public.authors
  FOR SELECT USING (true);

-- Категории - публичный доступ
CREATE POLICY "Публичный доступ к категориям" ON public.main_categories
  FOR SELECT USING (true);
```

### Политики для приватных таблиц
```sql
-- Пользователи - только свои данные
CREATE POLICY "Пользователи видят только свои данные" ON public.users
  FOR ALL USING (auth.uid()::text = id::text);

-- Платежи - только свои платежи
CREATE POLICY "Пользователи видят только свои платежи" ON public.payments
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Уведомления - только свои уведомления
CREATE POLICY "Пользователи видят только свои уведомления" ON public.notification_queue
  FOR ALL USING (auth.uid()::text = user_id::text);
```

---

## ⚡ Оптимизация производительности

### Ключевые индексы

#### Индексы для внешних ключей
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

#### Индексы для поиска и сортировки
```sql
-- Полнотекстовый поиск
CREATE INDEX IF NOT EXISTS idx_books_title_gin ON public.books USING gin (to_tsvector('ukrainian', title));
CREATE INDEX IF NOT EXISTS idx_books_description_gin ON public.books USING gin (to_tsvector('ukrainian', description));

-- Сортировка по датам
CREATE INDEX IF NOT EXISTS idx_books_created_at ON public.books (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON public.subscriptions (expires_at);

-- Фильтрация по статусам
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments (status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_is_read ON public.notification_queue (is_read);
```

#### Составные индексы
```sql
-- Для сложных запросов
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions (user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON public.payments (user_id, status);
CREATE INDEX IF NOT EXISTS idx_reading_history_user_finished ON public.reading_history (user_id, finished_at);
```

### Оптимизация RLS политик

#### Эффективные политики
```sql
-- Оптимизированная политика для payments
CREATE POLICY "Пользователи видят только свои платежи" ON public.payments
  FOR ALL USING ((SELECT auth.uid())::text = user_id::text);

-- Оптимизированная политика для notification_queue
CREATE POLICY "Пользователи видят только свои уведомления" ON public.notification_queue
  FOR ALL USING ((SELECT auth.uid())::text = user_id::text);

-- Оптимизированная политика для reading_history
CREATE POLICY "Пользователи видят только свою историю" ON public.reading_history
  FOR ALL USING ((SELECT auth.uid())::text = user_id::text);
```

### Мониторинг производительности

#### Проверка медленных запросов
```sql
-- Топ медленных запросов
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
```

#### Анализ использования индексов
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
```

#### Статистика таблиц
```sql
-- Размер таблиц и индексов
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

### Автоматические исправления

#### Скрипт полной оптимизации
```bash
# Выполнение всех исправлений производительности
./run_complete_performance_fixes.sh
```

#### Безопасные исправления
```bash
# Только проверенные исправления
psql "$SUPABASE_URL" -f PERFORMANCE_FIXES_SAFE.sql
```

#### Исправление RLS проблем
```bash
# Оптимизация RLS политик
psql "$SUPABASE_URL" -f FIX_RLS_PERFORMANCE_SAFE.sql
```

### Рекомендации по производительности

#### 1. Регулярное обслуживание
- **Еженедельно**: Обновление статистики (`ANALYZE`)
- **Ежемесячно**: Проверка неиспользуемых индексов
- **По необходимости**: Переиндексация таблиц

#### 2. Мониторинг ключевых метрик
- Время выполнения запросов
- Использование индексов
- Размер базы данных
- Количество подключений

#### 3. Оптимизация запросов
- Использование EXPLAIN ANALYZE для анализа
- Избегание SELECT * в продакшене
- Правильное использование JOIN
- Кэширование часто используемых данных

---

## 📋 Инструкции по работе

### 1. Добавление новой книги

#### Шаг 1: Создание авторов (если нужно)
```sql
INSERT INTO public.authors (name, biography)
VALUES ('Имя Автора', 'Биография автора');
```

#### Шаг 2: Создание книги
```sql
INSERT INTO public.books (title, description, cover_url, pages, category, subcategory_id)
VALUES (
  'Название книги',
  'Описание книги',
  'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book-cover.jpg',
  200,
  'Детская литература',
  (SELECT id FROM public.main_categories WHERE name = 'Детские книги' LIMIT 1)
);
```

#### Шаг 3: Связывание книги с авторами
```sql
INSERT INTO public.book_authors (book_id, author_id)
VALUES (
  (SELECT id FROM public.books WHERE title = 'Название книги' LIMIT 1),
  (SELECT id FROM public.authors WHERE name = 'Имя Автора' LIMIT 1)
);
```

### 2. Создание подписки

#### Шаг 1: Создание плана (если нужно)
```sql
INSERT INTO public.plans (name, description, price_monthly, max_books_per_month, max_books_total)
VALUES (
  'Базовый план',
  'Доступ к 5 книгам в месяц',
  100.00,
  5,
  50
);
```

#### Шаг 2: Создание подписки
```sql
SELECT public.create_subscription(
  'user-uuid-here',
  (SELECT id FROM public.plans WHERE name = 'Базовый план' LIMIT 1),
  1
);
```

### 3. Поиск книг

#### По автору
```sql
SELECT * FROM public.search_books_by_author('Пушкин', 10);
```

#### По категории
```sql
SELECT b.*, a.name as author_name
FROM public.books b
LEFT JOIN public.book_authors ba ON ba.book_id = b.id
LEFT JOIN public.authors a ON a.id = ba.author_id
LEFT JOIN public.main_categories c ON c.id = b.subcategory_id
WHERE c.name ILIKE '%детск%'
LIMIT 20;
```

#### Полнотекстовый поиск
```sql
SELECT * FROM public.books
WHERE tsvector @@ plainto_tsquery('ukrainian', 'сказки')
ORDER BY ts_rank(tsvector, plainto_tsquery('ukrainian', 'сказки')) DESC;
```

---

## ✅ Чек-листы

### Чек-лист для разработчика

#### Перед началом работы
- [ ] Проверить подключение к Supabase
- [ ] Убедиться, что RLS политики активны
- [ ] Проверить права доступа к таблицам
- [ ] Создать резервную копию (если нужно)

#### При добавлении новой функциональности
- [ ] Создать миграцию для изменений схемы
- [ ] Добавить RLS политики для новых таблиц
- [ ] Написать функции с `SET search_path = public`
- [ ] Протестировать безопасность
- [ ] Обновить документацию

#### При работе с пользовательскими данными
- [ ] Проверить аутентификацию пользователя
- [ ] Убедиться в корректности RLS политик
- [ ] Валидировать входные данные
- [ ] Логировать важные операции

### Чек-лист для администратора

#### Ежедневные задачи
- [ ] Проверить статус подписок
- [ ] Мониторить ошибки в логах
- [ ] Проверить производительность запросов
- [ ] Обновить статистику

#### Еженедельные задачи
- [ ] Проверить целостность данных
- [ ] Очистить старые уведомления
- [ ] Обновить индексы
- [ ] Проверить безопасность

#### Ежемесячные задачи
- [ ] Создать полную резервную копию
- [ ] Анализ использования ресурсов
- [ ] Обновление документации
- [ ] Проверка соответствия требованиям

### Чек-лист безопасности

#### Регулярные проверки
- [ ] Проверить RLS политики
- [ ] Убедиться в отсутствии уязвимостей
- [ ] Проверить права доступа пользователей
- [ ] Обновить пароли администраторов

#### При изменениях
- [ ] Протестировать новые политики
- [ ] Проверить логи на подозрительную активность
- [ ] Убедиться в корректности миграций
- [ ] Обновить Security Advisor

---

## 🔧 Troubleshooting

### Частые проблемы

#### 1. Ошибка "permission denied"
**Причина**: RLS политика блокирует доступ
**Решение**: 
```sql
-- Проверить политики
SELECT * FROM pg_policies WHERE tablename = 'table_name';

-- Временно отключить RLS для отладки
ALTER TABLE public.table_name DISABLE ROW LEVEL SECURITY;
```

#### 2. Ошибка "function search_path mutable"
**Причина**: Функция не имеет `SET search_path`
**Решение**:
```sql
-- Добавить search_path к функции
CREATE OR REPLACE FUNCTION function_name()
RETURNS type
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
-- код функции
$$;
```

#### 3. Медленные запросы
**Причина**: Отсутствие индексов
**Решение**:
```sql
-- Создать индекс
CREATE INDEX idx_books_title ON public.books USING gin(to_tsvector('ukrainian', title));

-- Анализировать запрос
EXPLAIN ANALYZE SELECT * FROM public.books WHERE title ILIKE '%поиск%';
```

#### 4. Проблемы с Cloudinary
**Причина**: Неправильные URL изображений
**Решение**:
```sql
-- Обновить URL изображений
UPDATE public.books 
SET cover_url = REPLACE(cover_url, 'old-domain', 'new-domain')
WHERE cover_url LIKE '%old-domain%';
```

### Мониторинг производительности

#### Проверка медленных запросов
```sql
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

#### Проверка использования индексов
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## 📚 Дополнительные ресурсы

### Полезные запросы

#### Статистика по книгам
```sql
SELECT 
  COUNT(*) as total_books,
  COUNT(CASE WHEN subcategory_id IS NOT NULL THEN 1 END) as categorized_books,
  AVG(pages) as avg_pages
FROM public.books;
```

#### Топ авторов
```sql
SELECT 
  a.name,
  COUNT(ba.book_id) as books_count
FROM public.authors a
LEFT JOIN public.book_authors ba ON ba.author_id = a.id
GROUP BY a.id, a.name
ORDER BY books_count DESC
LIMIT 10;
```

#### Статистика подписок
```sql
SELECT 
  p.name as plan_name,
  COUNT(s.id) as subscriptions_count,
  AVG(s.total_books_used) as avg_books_used
FROM public.plans p
LEFT JOIN public.subscriptions s ON s.plan_id = p.id
GROUP BY p.id, p.name
ORDER BY subscriptions_count DESC;
```

### Контакты и поддержка

- **Документация Supabase**: https://supabase.com/docs
- **PostgreSQL документация**: https://www.postgresql.org/docs/
- **Cloudinary документация**: https://cloudinary.com/documentation

---

**Версия документации**: 1.0  
**Дата обновления**: 10 сентября 2025  
**Автор**: Stefa.Books Development Team
