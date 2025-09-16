# 🚀 Быстрая загрузка 105 книг из Google Sheets

## 📊 Текущее состояние
- В базе данных: **10 книг**
- Нужно загрузить: **95 книг** (11-105)

## ⚡ Быстрый способ

### 1. Проверьте текущее состояние:
```sql
\i check_current_books.sql
```

### 2. Загрузите все книги автоматически:

#### Вариант A: Через Node.js (рекомендуется)
```bash
# Установите зависимости
npm install googleapis @supabase/supabase-js

# Настройте переменные окружения
export GOOGLE_SHEET_ID="your_spreadsheet_id"
export NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Запустите загрузку
node auto_load_from_sheets.mjs
```

#### Вариант B: Через SQL
1. Получите данные из Google Sheets
2. Замените данные в `load_all_books_from_sheets.sql`
3. Выполните:
```sql
\i load_all_books_from_sheets.sql
```

## 📋 Формат Google Sheets

Создайте таблицу с колонками:

| Назва | Автор | ISBN | Опис | Обкладинка | Категорія | Доступна |
|-------|-------|------|------|------------|-----------|----------|
| Книга 11 | Автор 11 | 978-617-12-3466-6 | Описание... | https://... | Пригоди, молодший вік | так |
| Книга 12 | Автор 12 | 978-617-12-3467-3 | Описание... | https://... | Казки, дошкільний вік | так |

## 🔢 Коды книг

Книги получат коды:
- Книга 11: `SB-2025-0011`
- Книга 12: `SB-2025-0012`
- ...
- Книга 105: `SB-2025-0105`

## ✅ Проверка результата

После загрузки выполните:
```sql
-- Общая статистика
SELECT 
    COUNT(*) as total_books,
    COUNT(CASE WHEN available = true THEN 1 END) as available_books
FROM public.books;

-- Последние загруженные книги
SELECT title, author, code, available
FROM public.books
ORDER BY created_at DESC
LIMIT 20;
```

## 🎯 Результат

После выполнения у вас будет:
- ✅ **105 книг** в базе данных
- ✅ **Уникальные коды** для каждой книги
- ✅ **Автоматические категории**
- ✅ **Защита от дублирования**

---

**Готово к загрузке! 🚀📚**
