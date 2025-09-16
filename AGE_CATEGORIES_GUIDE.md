# 📚 Руководство по возрастным категориям

## 🎯 Что добавлено

### 1. Новая таблица `age_categories`
- **Найменші (0-2 роки)** - книги для самых маленьких
- **Дошкільний вік (3-5 років)** - дошкольные книги
- **Молодший вік (6-8 років)** - младший школьный возраст
- **Середній вік (9-12 років)** - средний школьный возраст
- **Підлітковий вік (13-16 років)** - подростковый возраст
- **Дорослі (17+ років)** - взрослые книги
- **Всі віки** - универсальные книги

### 2. Обновленная структура базы данных
- Добавлена колонка `age_category_id` в таблицу `books`
- Обновлен VIEW `books_with_authors` с полями возрастных категорий
- Добавлены индексы для оптимизации поиска

### 3. Новые компоненты
- `AgeCategoryBadge` - отображение возрастной категории
- `AgeCategoryFilter` - фильтр по возрастным категориям
- API endpoint `/api/age-categories` для получения категорий

## 🚀 Установка

### 1. Выполните миграцию базы данных
```bash
# В Supabase Dashboard → SQL Editor выполните:
# supabase/migrations/010_add_age_categories.sql
```

### 2. Заполните возрастные категории для существующих книг
```bash
node scripts/populate-age-categories.js
```

### 3. Проверьте результат
```bash
node verify-database-fix.js
```

## 📖 Использование

### В компонентах
```tsx
import { AgeCategoryBadge } from '@/components/ui/AgeCategoryBadge';

// Компактный вариант
<AgeCategoryBadge 
  ageRange={book.age_range}
  ageCategoryName={book.age_category_name}
  variant="compact"
/>

// Подробный вариант
<AgeCategoryBadge 
  ageRange={book.age_range}
  ageCategoryName={book.age_category_name}
  variant="detailed"
/>
```

### Фильтрация по возрастным категориям
```tsx
import { AgeCategoryFilter } from '@/components/filters/AgeCategoryFilter';

<AgeCategoryFilter
  selectedAgeCategories={selectedAges}
  onAgeCategoriesChange={setSelectedAges}
/>
```

### API запросы
```typescript
// Получить все возрастные категории
const { data } = await supabase
  .from('age_categories')
  .select('*')
  .eq('is_active', true)
  .order('sort_order');

// Получить книги с возрастными категориями
const { data } = await supabase
  .from('books_with_authors')
  .select('*')
  .eq('age_category_id', categoryId);
```

## 🎨 Стилизация

### Цветовая схема возрастных категорий
- **Найменші (0-2)**: Розовый (`bg-pink-100 text-pink-700`)
- **Дошкільний (3-5)**: Фиолетовый (`bg-purple-100 text-purple-700`)
- **Молодший (6-8)**: Синий (`bg-blue-100 text-blue-700`)
- **Середній (9-12)**: Зеленый (`bg-green-100 text-green-700`)
- **Підлітковий (13-16)**: Оранжевый (`bg-orange-100 text-orange-700`)
- **Дорослі (17+)**: Красный (`bg-red-100 text-red-700`)
- **Всі віки**: Серый (`bg-neutral-100 text-neutral-600`)

## 🔧 Настройка

### Добавление новой возрастной категории
```sql
INSERT INTO age_categories (name, slug, description, min_age, max_age, sort_order, is_active) 
VALUES ('Нова категорія', 'nova-kategoriya', 'Опис', 5, 10, 7, true);
```

### Обновление существующей категории
```sql
UPDATE age_categories 
SET name = 'Оновлена назва', description = 'Новий опис'
WHERE slug = 'nova-kategoriya';
```

### Удаление категории
```sql
UPDATE age_categories 
SET is_active = false 
WHERE slug = 'nova-kategoriya';
```

## 📊 Аналитика

### Статистика по возрастным категориям
```sql
SELECT 
  ac.name as age_category,
  COUNT(b.id) as book_count,
  AVG(b.rating) as avg_rating
FROM age_categories ac
LEFT JOIN books b ON ac.id = b.age_category_id
WHERE b.category != 'subscription-request'
GROUP BY ac.id, ac.name, ac.sort_order
ORDER BY ac.sort_order;
```

### Популярные возрастные категории
```sql
SELECT 
  ac.name,
  COUNT(b.id) as book_count,
  COUNT(r.id) as rental_count
FROM age_categories ac
LEFT JOIN books b ON ac.id = b.age_category_id
LEFT JOIN rentals r ON b.id = r.book_id
WHERE b.category != 'subscription-request'
GROUP BY ac.id, ac.name
ORDER BY rental_count DESC;
```

## 🐛 Устранение неполадок

### Проблема: Возрастные категории не отображаются
**Решение**: Проверьте, что миграция выполнена и данные заполнены
```bash
node scripts/populate-age-categories.js
```

### Проблема: Неправильная категоризация книг
**Решение**: Обновите логику в `scripts/populate-age-categories.js`

### Проблема: Ошибки TypeScript
**Решение**: Обновите типы в `src/lib/database.types.ts`

## 📈 Планы развития

1. **Автоматическая категоризация** - ML алгоритм для определения возрастной категории
2. **Персонализация** - рекомендации на основе возраста пользователя
3. **Аналитика** - детальная статистика по возрастным группам
4. **Фильтрация** - расширенные фильтры по возрасту и категориям
5. **Рекомендации** - умные рекомендации книг по возрасту

## 📝 Примечания

- Возрастные категории автоматически обновляются при изменении книги
- Поддерживается поиск по возрастным категориям
- Все изменения логируются для аудита
- RLS политики обеспечивают безопасность данных
