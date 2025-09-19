# Обновление системы кодирования книг на артикулы

## Обзор изменений

Мы обновили систему кодирования книг с "код книги" на "артикул" с новой схемой:

- **PL-001, PL-002, PL-003** - Підліткова література
- **DL-001 - DL-009** - Дитяча література  
- **KP-001 - KP-003** - Книжки-картинки
- **KL-001, KL-002** - Класична література
- **NP-001, NP-002** - Науково-популярна література
- **IL-001** - Історична література
- **PD-001** - Психологія та розвиток

## Что было изменено

### 1. База данных
- ✅ Переименовано поле `code` в `article` в таблице `books`
- ✅ Обновлены индексы и ограничения
- ✅ Создана миграция `20241221_rename_code_to_article.sql`

### 2. TypeScript типы
- ✅ Обновлен `src/lib/types.ts` - поле `code` → `article`
- ✅ Обновлен `src/lib/database.types.ts`
- ✅ Обновлены типы в `src/lib/types/admin.ts`

### 3. Система генерации артикулов
- ✅ Обновлен `src/lib/book-codes.ts` с новыми функциями:
  - `parseBookArticle()` вместо `parseBookCode()`
  - `generateBookArticle()` вместо `generateBookCode()`
  - `generateNextBookArticle()` вместо `generateNextBookCode()`
  - `isValidBookArticle()` вместо `isValidBookCode()`
- ✅ Добавлена обратная совместимость (deprecated функции)

### 4. API эндпоинты
- ✅ Создан новый эндпоинт `/api/admin/books/next-article`
- ✅ Обновлен `/api/admin/books/next-code` для обратной совместимости
- ✅ Обновлены все API файлы для работы с `article`

### 5. Компоненты фронтенда
- ✅ Обновлены все компоненты для использования `article`
- ✅ Обновлены админские компоненты
- ✅ Обновлены формы добавления/редактирования книг

### 6. Хуки
- ✅ Обновлен `src/lib/hooks/useBookCodes.ts` → `useBookArticles()`
- ✅ Добавлена обратная совместимость

## Инструкции по обновлению

### Шаг 1: Применить миграцию базы данных

```bash
# Выполнить SQL миграцию
psql -h your-db-host -U your-username -d your-database -f supabase/migrations/20241221_rename_code_to_article.sql
```

### Шаг 2: Обновить данные книг

#### Вариант A: Использовать Node.js скрипт (рекомендуется)

```bash
# Показать статистику текущих артикулов
node scripts/update-books-articles.js stats

# Обновить артикулы книг
node scripts/update-books-articles.js update
```

#### Вариант B: Использовать SQL скрипт

```bash
# Выполнить SQL скрипт обновления
psql -h your-db-host -U your-username -d your-database -f update-books-articles.sql
```

### Шаг 3: Проверить обновление

```sql
-- Проверить статистику по артикулам
SELECT 
  category,
  COUNT(*) as total_books,
  MIN(article) as first_article,
  MAX(article) as last_article
FROM books 
WHERE article IS NOT NULL 
GROUP BY category 
ORDER BY category;

-- Проверить книги без артикулов
SELECT id, title, author, category, article
FROM books 
WHERE article IS NULL OR article = ''
ORDER BY category, created_at;
```

### Шаг 4: Перезапустить приложение

```bash
# Очистить кэш и перезапустить
npm run build
npm run start
```

## Обратная совместимость

Для плавного перехода мы сохранили обратную совместимость:

- Старые функции помечены как `@deprecated` но продолжают работать
- API эндпоинт `/api/admin/books/next-code` возвращает и `code` и `article`
- Хук `useBookCodes` перенаправляет на `useBookArticles`

## Проверка после обновления

1. **Админка**: Проверить генерацию артикулов при добавлении новых книг
2. **Каталог**: Убедиться, что артикулы отображаются корректно
3. **Поиск**: Проверить поиск по артикулам
4. **Экспорт**: Проверить экспорт данных с новыми артикулами

## Откат изменений (если необходимо)

Если нужно откатить изменения:

```sql
-- Переименовать обратно article в code
ALTER TABLE public.books RENAME COLUMN article TO code;

-- Удалить новые индексы
DROP INDEX IF EXISTS idx_books_article;

-- Восстановить старые индексы
CREATE INDEX IF NOT EXISTS idx_books_code ON public.books(code);
```

## Поддержка

При возникновении проблем:

1. Проверить логи приложения
2. Убедиться, что миграция выполнена успешно
3. Проверить, что все артикулы сгенерированы корректно
4. Обратиться к команде разработки

---

**Дата обновления**: 2024-12-21  
**Версия**: 1.0.0  
**Статус**: Готово к применению
