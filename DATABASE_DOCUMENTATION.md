# Полная документация базы данных Stefa.Books

## Обзор системы

База данных Stefa.Books построена на **PostgreSQL** с использованием **Supabase** как Backend-as-a-Service. Система предназначена для управления библиотекой детских книг с возможностью аренды и подписки.

## Архитектура базы данных

### Основные компоненты
- **PostgreSQL 15+** - основная СУБД
- **Supabase** - хостинг и API
- **Row Level Security (RLS)** - безопасность на уровне строк
- **Full-text search** - полнотекстовый поиск
- **Cloudinary** - хранение изображений обложек

## Структура таблиц

### 1. Таблица `books` - Основной каталог книг

**Назначение**: Хранение информации о всех книгах в библиотеке

**Структура**:
```sql
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,                    -- Название книги
  author TEXT NOT NULL,                   -- Автор
  category TEXT NOT NULL,                 -- Категория
  subcategory TEXT,                       -- Подкатегория
  description TEXT,                       -- Полное описание
  short_description TEXT,                 -- Краткое описание
  code TEXT UNIQUE,                       -- Уникальный код книги (DL-001)
  isbn TEXT,                              -- ISBN код
  pages INTEGER,                          -- Количество страниц
  age_range TEXT,                         -- Возрастная категория
  language TEXT DEFAULT 'uk',             -- Язык книги
  publisher TEXT,                         -- Издательство
  publication_year INTEGER,               -- Год издания
  cover_url TEXT,                         -- URL обложки в Cloudinary
  status TEXT DEFAULT 'available',        -- Статус: available, issued, reserved, lost
  available BOOLEAN DEFAULT true,         -- Доступна ли для аренды
  qty_total INTEGER DEFAULT 1,           -- Общее количество экземпляров
  qty_available INTEGER DEFAULT 1,       -- Доступное количество
  price_uah DECIMAL(10,2),               -- Цена закупки в гривнах
  location TEXT,                          -- Место хранения
  rating DECIMAL(3,2) DEFAULT 0,         -- Рейтинг (0-5)
  rating_count INTEGER DEFAULT 0,        -- Количество оценок
  price_daily NUMERIC(8,2),              -- Цена аренды за день
  price_weekly NUMERIC(8,2),             -- Цена аренды за неделю
  price_monthly NUMERIC(8,2),            -- Цена аренды за месяц
  badges TEXT[],                          -- Массив бейджей
  tags TEXT[],                            -- Массив тегов
  search_vector tsvector,                 -- Вектор для полнотекстового поиска
  search_text TEXT,                       -- Текст для поиска
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Индексы**:
- `idx_books_title` - поиск по названию
- `idx_books_author` - поиск по автору
- `idx_books_category` - фильтрация по категории
- `idx_books_available` - фильтрация доступных книг
- `idx_books_rating` - сортировка по рейтингу
- `idx_books_search_vector` - полнотекстовый поиск (GIN)
- `idx_books_search_text` - триграммный поиск

### 2. Таблица `categories` - Категории книг

**Назначение**: Иерархическая система категорий для организации книг

**Структура**:
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,              -- Название категории
  name_en TEXT,                           -- Английское название
  slug TEXT NOT NULL UNIQUE,              -- URL-слаг
  parent_id UUID REFERENCES categories(id), -- Родительская категория
  description TEXT,                       -- Описание категории
  icon TEXT,                              -- Иконка
  color TEXT,                             -- Цвет категории
  is_active BOOLEAN DEFAULT true,         -- Активна ли категория
  sort_order INTEGER DEFAULT 0,           -- Порядок сортировки
  search_vector tsvector,                 -- Вектор для поиска
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Особенности**:
- Поддерживает иерархическую структуру (parent_id)
- Имеет представление `categories_with_parent` для удобного получения полной иерархии
- Функция `get_category_tree()` для получения дерева категорий

### 3. Таблица `authors` - Авторы книг

**Назначение**: Хранение информации об авторах

**Структура**:
```sql
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,              -- Имя автора
  biography TEXT,                         -- Биография
  birth_year INTEGER,                     -- Год рождения
  death_year INTEGER,                     -- Год смерти
  nationality TEXT,                       -- Национальность
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Таблица `book_authors` - Связь книг и авторов

**Назначение**: Многие-ко-многим связь между книгами и авторами

**Структура**:
```sql
CREATE TABLE book_authors (
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'author' CHECK (role IN ('author', 'illustrator', 'translator', 'editor')),
  PRIMARY KEY (book_id, author_id, role)
);
```

### 5. Таблица `users` - Пользователи системы

**Назначение**: Хранение информации о пользователях библиотеки

**Структура**:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                     -- Полное имя
  email TEXT NOT NULL UNIQUE,            -- Email адрес
  phone TEXT,                             -- Номер телефона
  subscription_type TEXT CHECK (subscription_type IN ('Mini', 'Maxi', 'Premium')), -- Тип подписки
  subscription_start TIMESTAMPTZ,        -- Начало подписки
  subscription_end TIMESTAMPTZ,          -- Конец подписки
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')), -- Статус
  address TEXT,                           -- Адрес доставки
  notes TEXT,                             -- Заметки администратора
  role TEXT,                              -- Роль пользователя (admin, user)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. Таблица `user_profiles` - Профили пользователей

**Назначение**: Дополнительная информация о пользователях

**Структура**:
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. Таблица `rentals` - Аренда книг

**Назначение**: Управление процессом аренды книг

**Структура**:
```sql
CREATE TABLE rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  rental_date TIMESTAMPTZ DEFAULT NOW(), -- Дата аренды
  return_date TIMESTAMPTZ,                -- Дата возврата
  due_date TIMESTAMPTZ NOT NULL,         -- Срок возврата
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue', 'cancelled')), -- Статус
  notes TEXT,                             -- Заметки
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8. Таблица `subscription_requests` - Заявки на подписку

**Назначение**: Обработка заявок на подписку от пользователей

**Структура**:
```sql
CREATE TABLE subscription_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                     -- Имя и фамилия
  email TEXT NOT NULL,                    -- Email адрес
  phone TEXT NOT NULL,                    -- Номер телефона
  social TEXT,                            -- Instagram или другая соц. сеть
  plan TEXT NOT NULL CHECK (plan IN ('mini', 'maxi', 'premium')), -- Тип подписки
  payment_method TEXT NOT NULL CHECK (payment_method IN ('monobank', 'online', 'cash')), -- Способ оплаты
  message TEXT,                           -- Дополнительное сообщение
  screenshot TEXT,                        -- URL скриншота оплаты
  privacy_consent BOOLEAN NOT NULL DEFAULT false, -- Согласие с политикой
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')), -- Статус заявки
  admin_notes TEXT,                       -- Заметки администратора
  processed_at TIMESTAMPTZ,               -- Дата обработки
  processed_by UUID REFERENCES users(id), -- Кто обработал
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 9. Таблица `payments` - Платежи

**Назначение**: Хранение информации о платежах

**Структура**:
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,          -- Сумма платежа
  currency TEXT DEFAULT 'UAH',            -- Валюта
  payment_method TEXT NOT NULL,           -- Способ оплаты
  payment_status TEXT,                    -- Статус платежа
  transaction_id TEXT,                    -- ID транзакции
  description TEXT,                       -- Описание платежа
  metadata JSONB,                         -- Дополнительные данные
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 10. Таблица `search_queries` - Поисковые запросы

**Назначение**: Аналитика поисковых запросов

**Структура**:
```sql
CREATE TABLE search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,                    -- Поисковый запрос
  results_count INTEGER DEFAULT 0,       -- Количество результатов
  user_id UUID REFERENCES users(id),     -- Пользователь (опционально)
  search_time_ms DECIMAL(10,3),          -- Время поиска в мс
  user_agent TEXT,                        -- User Agent браузера
  ip_address INET,                        -- IP адрес
  filters JSONB,                          -- Примененные фильтры
  clicked_results UUID[],                -- ID книг, по которым кликнули
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Представления (Views)

### `categories_with_parent`
Представление для получения категорий с информацией о родительской категории:

```sql
CREATE VIEW categories_with_parent AS
SELECT 
  c.*,
  p.name as parent_name,
  p.slug as parent_slug
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id;
```

## Функции базы данных

### 1. `search_books()` - Поиск книг

**Назначение**: Полнотекстовый поиск книг с ранжированием результатов

**Параметры**:
- `query_text TEXT` - поисковый запрос
- `category_filter TEXT[]` - фильтр по категориям
- `author_filter TEXT[]` - фильтр по авторам
- `available_only BOOLEAN` - только доступные книги
- `limit_count INTEGER` - лимит результатов
- `offset_count INTEGER` - смещение

**Возвращает**:
- `id`, `title`, `author`, `category`, `subcategory`
- `description`, `cover_url`, `available`, `rating`
- `rating_count`, `relevance_score`

### 2. `get_category_tree()` - Дерево категорий

**Назначение**: Получение иерархического дерева категорий

**Параметры**:
- `parent_uuid UUID` - ID родительской категории (опционально)

**Возвращает**:
- Полную информацию о категориях с уровнями вложенности
- Путь к категории в виде массива

### 3. `get_category_breadcrumbs()` - Хлебные крошки

**Назначение**: Получение пути к категории

**Параметры**:
- `category_uuid UUID` - ID категории

**Возвращает**:
- Массив категорий от корня до указанной

### 4. `is_admin()` - Проверка админа

**Назначение**: Проверка, является ли пользователь администратором

**Параметры**:
- `user_id UUID` - ID пользователя

**Возвращает**:
- `BOOLEAN` - true если админ

### 5. `get_user_role()` - Роль пользователя

**Назначение**: Получение роли пользователя

**Параметры**:
- `user_id UUID` - ID пользователя

**Возвращает**:
- `TEXT` - роль пользователя

### 6. `update_user_to_admin()` - Назначение админа

**Назначение**: Назначение пользователя администратором

**Параметры**:
- `user_id UUID` - ID пользователя

**Возвращает**:
- `BOOLEAN` - успешность операции

## Триггеры

### 1. `update_book_availability()` - Обновление доступности книг

**Назначение**: Автоматическое обновление количества доступных книг при изменении аренды

**Срабатывает**: При INSERT, UPDATE, DELETE в таблице `rentals`

**Логика**:
- Подсчитывает активные аренды для книги
- Обновляет `qty_available` и `available` в таблице `books`

### 2. `update_updated_at_column()` - Обновление timestamp

**Назначение**: Автоматическое обновление поля `updated_at`

**Срабатывает**: При UPDATE в любой таблице с этим триггером

## Row Level Security (RLS)

### Политики безопасности

Все таблицы защищены RLS политиками:

#### Публичный доступ (чтение):
- `books` - все могут читать
- `authors` - все могут читать
- `categories` - все могут читать
- `search_queries` - все могут читать

#### Пользовательский доступ:
- `users` - пользователи видят только свои данные
- `rentals` - пользователи видят только свои аренды
- `user_profiles` - пользователи видят только свои профили

#### Административный доступ:
- `subscription_requests` - админы имеют полный доступ
- `payments` - админы имеют полный доступ

#### Заявки на подписку:
- Публичный доступ на INSERT (создание заявок)
- Административный доступ на все операции

## Индексы и оптимизация

### Основные индексы:
1. **Поисковые индексы**:
   - GIN индекс на `search_vector` для полнотекстового поиска
   - GIN индекс на `search_text` для триграммного поиска

2. **Индексы по фильтрам**:
   - `idx_books_category` - фильтрация по категориям
   - `idx_books_available` - фильтрация доступных книг
   - `idx_books_rating` - сортировка по рейтингу

3. **Индексы по связям**:
   - `idx_rentals_user_id` - аренды пользователя
   - `idx_rentals_book_id` - аренды книги
   - `idx_users_email` - поиск пользователя по email

### Расширения PostgreSQL:
- `pg_trgm` - триграммный поиск
- `unaccent` - поиск без учета диакритических знаков
- `uuid-ossp` - генерация UUID

## API интеграция

### Supabase Client
База данных интегрирована с Supabase через:
- **REST API** - для CRUD операций
- **Realtime** - для live обновлений
- **Auth** - для аутентификации
- **Storage** - для файлов (обложки книг)

### TypeScript типы
Все типы генерируются автоматически в `src/lib/database.types.ts`:
- `Database` - основная схема
- `Tables` - типы таблиц
- `TablesInsert` - типы для вставки
- `TablesUpdate` - типы для обновления

## Безопасность

### 1. RLS политики
- Все таблицы защищены Row Level Security
- Политики настроены для разных ролей пользователей

### 2. Валидация данных
- CHECK constraints на критических полях
- Внешние ключи для целостности данных

### 3. Функции безопасности
- `SECURITY DEFINER` для функций
- `SET search_path = public` для предотвращения атак

## Мониторинг и аналитика

### 1. Поисковая аналитика
- Таблица `search_queries` для отслеживания поисковых запросов
- Метрики производительности поиска

### 2. Пользовательская активность
- Отслеживание аренд через таблицу `rentals`
- Аналитика подписок через `subscription_requests`

### 3. Производительность
- Индексы оптимизированы для частых запросов
- Полнотекстовый поиск с ранжированием

## Резервное копирование

### Автоматические бэкапы
- Supabase предоставляет автоматические ежедневные бэкапы
- Возможность восстановления на любую точку времени

### Миграции
- Все изменения схемы версионированы в `supabase/migrations/`
- Автоматическое применение миграций при деплое

## Масштабирование

### Горизонтальное масштабирование
- Supabase автоматически масштабирует базу данных
- Read replicas для распределения нагрузки

### Оптимизация запросов
- Индексы настроены для быстрого поиска
- Функции поиска оптимизированы для производительности

## Заключение

База данных Stefa.Books представляет собой полнофункциональную систему управления библиотекой с:
- Современной архитектурой на PostgreSQL
- Безопасностью на уровне строк (RLS)
- Полнотекстовым поиском
- Аналитикой и мониторингом
- Готовностью к масштабированию

Система спроектирована для эффективного управления каталогом детских книг с возможностью аренды и подписки, обеспечивая высокую производительность и безопасность данных.
