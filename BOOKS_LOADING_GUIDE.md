# 📚 Руководство по загрузке книг из Google Sheets

## 🎯 Обзор

Создано несколько скриптов для загрузки книг в базу данных Stefa.Books:

1. **`smart_books_loader.sql`** - Умный загрузчик с функциями (исправлен)
2. **`quick_books_loader.sql`** - Быстрая загрузка по одной книге
3. **`bulk_books_loader.sql`** - Массовая загрузка множества книг
4. **`google_sheets_to_db.js`** - Node.js скрипт для автоматической загрузки

## 🚀 Быстрый старт

### Вариант 1: Простая загрузка (рекомендуется)

```sql
-- Выполните в Supabase SQL Editor
\i quick_books_loader.sql
```

### Вариант 2: Массовая загрузка

```sql
-- Выполните в Supabase SQL Editor
\i bulk_books_loader.sql
```

## 📊 Структура данных

### Обязательные поля:
- `title` - Название книги
- `author` - Автор
- `isbn` - ISBN код (уникальный)

### Опциональные поля:
- `description` - Полное описание
- `short_description` - Краткое описание
- `cover_url` - URL обложки в Cloudinary
- `category` - Категория (например: "Пригоди, молодший вік")
- `age_range` - Возрастная категория (например: "8-12 років")
- `pages` - Количество страниц
- `language` - Язык (по умолчанию: 'uk')
- `publisher` - Издательство
- `publication_year` - Год издания
- `available` - Доступна ли книга (по умолчанию: true)
- `qty_total` - Общее количество экземпляров
- `qty_available` - Доступное количество
- `price_daily` - Цена за день
- `price_weekly` - Цена за неделю
- `price_monthly` - Цена за месяц
- `price_uah` - Цена закупки в гривнах
- `location` - Место хранения
- `tags` - Теги (через запятую)
- `badges` - Значки (через запятую)

## 🔧 Настройка Google Sheets

### 1. Создайте таблицу с колонками:

| Назва | Автор | ISBN | Опис | Обкладинка | Категорія | Вікова категорія | Сторінки | Мова | Видавець | Рік видання | Доступна | Кількість загальна | Кількість доступна | Ціна за день | Ціна за тиждень | Ціна за місяць | Ціна закупки | Місцезнаходження | Теги | Значки |
|-------|-------|------|------|------------|-----------|------------------|----------|------|----------|-------------|----------|-------------------|-------------------|--------------|----------------|---------------|--------------|-----------------|------|--------|
| Пригоди Тома Сойєра | Марк Твен | 978-617-12-3456-7 | Класичний роман... | https://... | Пригоди, молодший вік | 8-12 років | 320 | uk | А-БА-БА-ГА-ЛА-МА-ГА | 2020 | так | 3 | 3 | 15.00 | 80.00 | 200.00 | 150.00 | Полиця А-1 | пригоди, класика | популярна, нова |

### 2. Настройте доступ:

1. Откройте Google Sheets
2. Нажмите "Поделиться" → "Изменить на всех, у кого есть ссылка"
3. Скопируйте ID таблицы из URL

## 🤖 Автоматическая загрузка через Node.js

### 1. Установите зависимости:

```bash
npm install googleapis @supabase/supabase-js
```

### 2. Настройте переменные окружения:

```bash
# Google Sheets
export GOOGLE_SHEET_ID="your_spreadsheet_id"
export GOOGLE_SERVICE_ACCOUNT_KEY_FILE="./google-service-account.json"

# Supabase
export NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Настройки
export DRY_RUN="false"  # true для тестирования
```

### 3. Создайте Service Account:

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google Sheets API
4. Создайте Service Account
5. Скачайте JSON ключ
6. Поделитесь таблицей с email Service Account

### 4. Запустите скрипт:

```bash
node google_sheets_to_db.js
```

## 📋 Категории книг

Система автоматически определяет категории по ключевым словам:

### Основные категории:
- **Пригоди** - приключенческие книги
- **Казки** - сказки и фантастика
- **Фентезі** - фэнтези
- **Детектив** - детективы
- **Психологія і саморозвиток** - психология
- **Пізнавальні** - познавательные
- **Сучасна проза** - современная проза

### Возрастные категории:
- **Дошкільний вік** - 3-6 лет
- **Молодший вік** - 6-12 лет
- **Середній вік** - 12-16 лет
- **Підлітковий вік** - 14+ лет

## 🔍 Проверка результатов

После загрузки выполните:

```sql
-- Общая статистика
SELECT 
    COUNT(*) as total_books,
    COUNT(CASE WHEN available = true THEN 1 END) as available_books,
    COUNT(DISTINCT category_id) as categories_with_books,
    COUNT(DISTINCT author) as unique_authors
FROM public.books;

-- Книги по категориям
SELECT 
    c.name as category,
    COUNT(b.id) as books_count
FROM public.categories c
LEFT JOIN public.books b ON c.id = b.category_id
WHERE c.parent_id IS NOT NULL
GROUP BY c.name
ORDER BY books_count DESC;

-- Последние загруженные книги
SELECT 
    title,
    author,
    code,
    available,
    created_at
FROM public.books
ORDER BY created_at DESC
LIMIT 10;
```

## ⚠️ Важные замечания

1. **Уникальность**: Книги проверяются по ISBN и коду
2. **Категории**: Автоматически определяются по ключевым словам
3. **Коды**: Автоматически генерируются в формате `SB-YYYY-NNNN`
4. **Обложки**: Используйте Cloudinary для хранения изображений
5. **Цены**: Указывайте в гривнах (UAH)

## 🐛 Решение проблем

### Ошибка "column age_category_id does not exist"
- Используйте `quick_books_loader.sql` или `bulk_books_loader.sql`
- Эти скрипты исправлены и не используют несуществующие колонки

### Ошибка "duplicate key value violates unique constraint"
- Книга с таким ISBN или кодом уже существует
- Скрипты автоматически обновляют существующие записи

### Ошибка "function find_category_by_parts does not exist"
- Выполните сначала создание функций из `smart_books_loader.sql`

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в Supabase
2. Убедитесь, что все категории созданы
3. Проверьте формат данных в Google Sheets
4. Используйте режим тестирования (`DRY_RUN=true`)

---

**Удачной загрузки книг! 📚✨**
