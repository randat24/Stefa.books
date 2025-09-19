# Простое решение: Замена "Невідомий автор" на артикулы

## Идея
Вместо создания отдельного поля `article`, мы просто заменяем "Невідомий автор" в поле `author` на артикулы типа PL-001, DL-002 и т.д.

## Решение

### Вариант 1: SQL скрипт (быстро)

```bash
# Выполнить замену "Невідомий автор" на артикулы
psql -h your-db-host -U your-username -d your-database -f simple-fix-authors-as-articles.sql
```

### Вариант 2: Node.js скрипт (пошагово)

```bash
# 1. Показать текущую статистику
node scripts/simple-fix-authors.js stats

# 2. Исправить пустые категории
node scripts/simple-fix-authors.js fix-categories

# 3. Заменить "Невідомий автор" на артикулы
node scripts/simple-fix-authors.js replace

# 4. Или сделать все сразу
node scripts/simple-fix-authors.js full
```

## Результат

После выполнения все книги с "Невідомий автор" получат артикулы:

- **PL-001, PL-002, PL-003** - Підліткова література
- **DL-001, DL-002, DL-003** - Дитяча література  
- **KP-001, KP-002, KP-003** - Книжки-картинки
- **KL-001, KL-002** - Класична література
- **NP-001, NP-002** - Науково-популярна література
- **IL-001** - Історична література
- **PD-001** - Психологія та розвиток

## Преимущества

✅ **Простота** - не нужно менять структуру БД  
✅ **Совместимость** - все существующие компоненты работают  
✅ **Быстрота** - один SQL запрос решает проблему  
✅ **Понятность** - артикул сразу виден в поле author  

## Проверка

```sql
-- Статистика по артикулам
SELECT 
  category,
  COUNT(*) as total_books,
  MIN(author) as first_article,
  MAX(author) as last_article
FROM books 
WHERE author LIKE '%-%' -- Артикулы содержат дефис
GROUP BY category 
ORDER BY category;

-- Книги, которые остались с "Невідомий автор"
SELECT COUNT(*) as books_with_unknown_author
FROM books 
WHERE author = 'Невідомий автор';
```

---

**Дата**: 2024-12-21  
**Статус**: Готово к применению
