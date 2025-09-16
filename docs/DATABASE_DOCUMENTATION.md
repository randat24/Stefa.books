# Документация базы данных Stefa.Books

## Обзор

База данных проекта Stefa.Books построена на PostgreSQL с использованием Supabase. Документация содержит описание структуры, индексов, политик безопасности и рекомендаций по обслуживанию.

## Структура базы данных

### Основные таблицы

#### 1. `books` - Каталог книг
**Назначение:** Хранение информации о книгах в библиотеке

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Первичный ключ |
| `title` | TEXT | Название книги |
| `author` | TEXT | Автор книги |
| `category` | TEXT | Категория книги |
| `subcategory` | TEXT | Подкатегория |
| `description` | TEXT | Полное описание |
| `short_description` | TEXT | Краткое описание |
| `code` | TEXT UNIQUE | Уникальный код книги |
| `isbn` | TEXT | ISBN номер |
| `pages` | INTEGER | Количество страниц |
| `age_range` | TEXT | Возрастная категория |
| `language` | TEXT | Язык книги (по умолчанию 'uk') |
| `publisher` | TEXT | Издательство |
| `publication_year` | INTEGER | Год издания |
| `cover_url` | TEXT | URL обложки |
| `status` | TEXT | Статус: available, rented, maintenance, unavailable |
| `available` | BOOLEAN | Доступность для аренды |
| `rating` | NUMERIC(2,1) | Рейтинг (0-5) |
| `rating_count` | INTEGER | Количество оценок |
| `price_daily` | NUMERIC(8,2) | Цена за день |
| `price_weekly` | NUMERIC(8,2) | Цена за неделю |
| `price_monthly` | NUMERIC(8,2) | Цена за месяц |
| `badges` | TEXT[] | Массив бейджей |
| `tags` | TEXT[] | Массив тегов |
| `search_vector` | tsvector | Вектор для полнотекстового поиска |
| `search_text` | TEXT | Текст для поиска |
| `created_at` | TIMESTAMPTZ | Дата создания |
| `updated_at` | TIMESTAMPTZ | Дата обновления |

**Индексы:**
- `books_pkey` (PRIMARY KEY) - ⭐ 1013 использований
- `books_search_vector_idx` (GIN) - для полнотекстового поиска
- `idx_books_created_at` - ⭐ 752 использования
- `books_author_id_idx` - ⭐ 320 использований
- `idx_books_category_id` - 1 использование
- `idx_books_status` - 1 использование

**Важные неиспользуемые индексы (сохранить):**
- `idx_books_title_gin` (для полнотекстового поиска)
- `books_search_text_idx` (для полнотекстового поиска)
- `idx_books_subcategory_id` (для JOIN-запросов)
- `idx_books_age_category_id` (для внешнего ключа)

**Удаленные неиспользуемые индексы:**
- `idx_books_is_active` 
- `idx_books_code`
- `idx_books_rating`

#### 2. `authors` - Авторы книг
**Назначение:** Хранение информации об авторах

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Первичный ключ |
| `name` | TEXT UNIQUE | Имя автора |
| `biography` | TEXT | Биография |
| `birth_year` | INTEGER | Год рождения |
| `death_year` | INTEGER | Год смерти |
| `nationality` | TEXT | Национальность |
| `created_at` | TIMESTAMPTZ | Дата создания |
| `updated_at` | TIMESTAMPTZ | Дата обновления |

**Индексы:**
- `authors_pkey` (PRIMARY KEY) - ⭐ 346 использований
- `authors_name_key` (UNIQUE) - ⭐ 156 использований
- `idx_authors_name` - 2 использования

#### 3. `users` - Пользователи системы
**Назначение:** Основная таблица пользователей с ролями

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | BIGINT | Первичный ключ |
| `username` | VARCHAR | Имя пользователя |
| `first_name` | VARCHAR | Имя |
| `last_name` | VARCHAR | Фамилия |
| `email` | TEXT | Email (уникальный) |
| `role` | TEXT | Роль: user, admin, moderator |
| `subscription_type` | TEXT | Тип подписки |
| `status` | TEXT | Статус пользователя |
| `name` | TEXT | Полное имя |
| `phone` | TEXT | Телефон |
| `created_at` | TIMESTAMPTZ | Дата создания |
| `updated_at` | TIMESTAMPTZ | Дата обновления |

**Индексы:**
- `users_pkey` (PRIMARY KEY) - 5 использований
- `users_email_unique` (UNIQUE) - 1 использование

#### 4. `profiles` - Дополнительная информация о пользователях
**Назначение:** Расширенная информация о пользователях

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Первичный ключ |
| `first_name` | TEXT | Имя |
| `last_name` | TEXT | Фамилия |
| `phone` | TEXT | Телефон |
| `address` | TEXT | Адрес |
| `birth_date` | DATE | Дата рождения |
| `preferences` | JSONB | Настройки пользователя |
| `subscription_id` | UUID | ID подписки |
| `created_at` | TIMESTAMPTZ | Дата создания |
| `updated_at` | TIMESTAMPTZ | Дата обновления |

**Индексы:**
- `profiles_pkey` (PRIMARY KEY) - 2 использования
- `idx_profiles_user` - 3 использования

#### 5. `rentals` - Аренда книг
**Назначение:** Управление арендой книг

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Первичный ключ |
| `user_id` | UUID | ID пользователя |
| `book_id` | UUID | ID книги |
| `rental_date` | TIMESTAMPTZ | Дата аренды |
| `return_date` | TIMESTAMPTZ | Дата возврата |
| `due_date` | TIMESTAMPTZ | Дата возврата |
| `status` | TEXT | Статус: active, returned, overdue, cancelled |
| `notes` | TEXT | Заметки |
| `created_at` | TIMESTAMPTZ | Дата создания |
| `updated_at` | TIMESTAMPTZ | Дата обновления |

**Индексы:**
- `rentals_pkey` (PRIMARY KEY) - 22 использования
- `idx_rentals_book` - ⭐ 330 использований
- `idx_rentals_user` - 5 использований

#### 6. `categories` - Категории книг
**Назначение:** Иерархическая структура категорий

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Первичный ключ |
| `name` | TEXT UNIQUE | Название категории |
| `parent_id` | UUID | Родительская категория |
| `description` | TEXT | Описание |
| `display_order` | INTEGER | Порядок отображения |
| `icon` | TEXT | Иконка |
| `color` | TEXT | Цвет |
| `created_at` | TIMESTAMPTZ | Дата создания |

**Индексы:**
- `categories_pkey` (PRIMARY KEY) - 1 использование
- `categories_name_key` (UNIQUE) - 14 использований

#### 7. `main_categories` - Основные категории
**Назначение:** Главные категории книг

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Первичный ключ |
| `name` | TEXT UNIQUE | Название |
| `description` | TEXT | Описание |
| `display_order` | INTEGER | Порядок отображения |
| `created_at` | TIMESTAMPTZ | Дата создания |

**Индексы:**
- `main_categories_pkey` (PRIMARY KEY) - ⭐ 224 использования
- `main_categories_name_key` (UNIQUE) - 6 использований

#### 8. `subcategories` - Подкатегории
**Назначение:** Подкатегории книг

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Первичный ключ |
| `name` | TEXT | Название |
| `main_category_id` | UUID | ID основной категории |
| `description` | TEXT | Описание |
| `display_order` | INTEGER | Порядок отображения |
| `created_at` | TIMESTAMPTZ | Дата создания |

**Индексы:**
- `subcategories_pkey` (PRIMARY KEY) - ⭐ 269 использований
- `subcategories_main_category_id_name_key` (UNIQUE) - 30 использований

#### 9. `payments` - Платежи
**Назначение:** Управление платежами

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Первичный ключ |
| `user_id` | UUID | ID пользователя |
| `amount` | NUMERIC | Сумма |
| `currency` | TEXT | Валюта |
| `status` | TEXT | Статус платежа |
| `payment_method` | TEXT | Способ оплаты |
| `created_at` | TIMESTAMPTZ | Дата создания |

**Индексы:**
- `payments_pkey` (PRIMARY KEY) - 6 использований
- `idx_payments_user_id` - 0 использований (кандидат на удаление)

#### 10. `subscriptions` - Подписки
**Назначение:** Управление подписками пользователей

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Первичный ключ |
| `user_id` | UUID | ID пользователя |
| `plan_id` | UUID | ID плана |
| `status` | TEXT | Статус подписки |
| `start_date` | TIMESTAMPTZ | Дата начала |
| `end_date` | TIMESTAMPTZ | Дата окончания |
| `created_at` | TIMESTAMPTZ | Дата создания |

**Индексы:**
- `subscriptions_pkey` (PRIMARY KEY) - 1 использование
- `idx_subscriptions_user_id` - 0 использований (кандидат на удаление)
- `idx_subscriptions_plan_id` - 0 использований (кандидат на удаление)

### Связующие таблицы

#### `book_authors` - Связь книг и авторов
**Назначение:** Многие-ко-многим между книгами и авторами

| Поле | Тип | Описание |
|------|-----|----------|
| `book_id` | UUID | ID книги |
| `author_id` | UUID | ID автора |
| `role` | TEXT | Роль: author, illustrator, translator |

**Индексы:**
- `book_authors_book_id_author_id_key` (UNIQUE) - ⭐ 212 использований
- `idx_book_authors_book_id` - ⭐ 209 использований
- `idx_book_authors_author_id` - 50 использований

## Политики безопасности (RLS)

### Включенные таблицы с RLS:
- ✅ `books`
- ✅ `authors`
- ✅ `users`
- ✅ `profiles`
- ✅ `rentals`
- ✅ `categories`
- ✅ `main_categories`
- ✅ `subcategories`
- ✅ `payments`
- ✅ `subscriptions`
- ✅ `migration_log`

### Примеры политик:

#### Для таблицы `books`:
```sql
-- Публичное чтение доступных книг
CREATE POLICY "Books are publicly readable" ON books
  FOR SELECT TO public
  USING (available = true);

-- Только админы могут изменять книги (оптимизированная версия)
CREATE POLICY "Only admins can modify books" ON books
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = (SELECT auth.uid())::text 
      AND users.role = 'admin'
    )
  );
```

#### Для таблицы `migration_log` (оптимизированная версия):
```sql
-- Только админы могут управлять логами миграций
-- Обратите внимание на (SELECT auth.uid()) для повышения производительности
CREATE POLICY "Admin select policy" ON migration_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = (SELECT auth.uid())::text 
      AND users.role = 'admin'
    )
  );
```

### Оптимизация производительности RLS

Для оптимизации производительности RLS-политик следует:

1. **Использовать подзапросы** для функций `auth.*()`:
   ```sql
   -- ❌ Неоптимальный вариант - вычисляется для каждой строки
   WHERE id::text = auth.uid()::text
   
   -- ✅ Оптимальный вариант - вычисляется один раз
   WHERE id::text = (SELECT auth.uid())::text
   ```

2. **Избегать вызова функций** в условиях для больших таблиц
3. **Использовать индексы** для столбцов, используемых в политиках
4. **Тестировать производительность** RLS на больших объемах данных

## Мониторинг и обслуживание

### Проверка использования индексов
```sql
SELECT 
  schemaname, 
  relname AS tablename, 
  indexrelname AS indexname, 
  idx_scan,
  CASE 
    WHEN idx_scan = 0 THEN 'Кандидат на удаление'
    WHEN idx_scan < 10 THEN 'Низкое использование'
    WHEN idx_scan < 100 THEN 'Среднее использование'
    ELSE 'Высокое использование'
  END AS usage_status
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
  tablename,
  indexname,
  idx_scan
FROM 
  pg_stat_user_indexes 
WHERE 
  idx_scan = 0 
  AND schemaname = 'public'
  AND indexname NOT LIKE '%_pkey'
  AND indexname NOT LIKE '%_key'
ORDER BY 
  tablename, indexname;
```

### Проверка размера таблиц
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM 
  pg_tables 
WHERE 
  schemaname = 'public'
ORDER BY 
  pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Рекомендации по оптимизации

### 1. Регулярная проверка индексов
- Проверяйте использование индексов ежемесячно
- Удаляйте неиспользуемые индексы (кроме PRIMARY KEY и UNIQUE)
- **НЕ удаляйте**:
  - Индексы для внешних ключей (даже если они не используются)
  - GIN-индексы для полнотекстового поиска
  - Индексы, которые могут понадобиться для сложных запросов
- Создавайте новые индексы только при необходимости

### 2. Мониторинг производительности
- Отслеживайте медленные запросы через `pg_stat_statements`
- Анализируйте планы выполнения запросов
- Оптимизируйте запросы с низкой производительностью

### 3. Безопасность
- Регулярно проверяйте RLS политики
- Тестируйте доступы для разных ролей пользователей
- Обновляйте политики при изменении бизнес-логики
- **При создании функций**:
  - Всегда добавляйте `SET search_path = public` для избежания SQL-инъекций
  - Используйте `SECURITY DEFINER` только когда нужны повышенные привилегии
  - Добавляйте проверки прав доступа внутри функций
  - Ограничивайте доступ к функциям через GRANT

### 4. Резервное копирование
- Настройте автоматическое резервное копирование
- Тестируйте восстановление из резервных копий
- Документируйте процедуры восстановления

## Контакты и поддержка

- **Техническая поддержка:** [admin@stefa-books.com.ua](mailto:admin@stefa-books.com.ua)
- **Документация Supabase:** [supabase.com/docs](https://supabase.com/docs)
- **PostgreSQL документация:** [postgresql.org/docs](https://postgresql.org/docs)

---
*Последнее обновление: 2024-12-19*
