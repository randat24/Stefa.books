# Миграция на новую структуру категорий

Этот документ описывает процесс внедрения новой иерархической структуры категорий в проект Stefa.books.

## 🎯 Цель миграции

Переход от простой строковой категоризации к иерархической структуре с поддержкой:
- Категорий по возрасту (Найменші, Дошкільний вік, и т.д.)
- Категорий по жанрам (Казки, Пізнавальні, Детектив, и т.д.)
- Категорий для дорослых (Психологія, Сучасна проза)
- Древовидной структуры с подкатегориями
- Иконок и цветов для категорий

## 📋 Шаги миграции

### 1. Создание структуры базы данных

Выполните SQL-миграцию для создания таблицы категорий:

```bash
# В Supabase Dashboard или через CLI
supabase migration up --file supabase/migrations/001_create_categories.sql
```

Эта миграция создаст:
- Таблицу `categories` с иерархической структурой
- Добавит поля `category_id` и `age_category_id` в таблицу `books`
- Создаст индексы для быстрого поиска
- Добавит RLS политики для безопасности
- Создаст функции для работы с деревом категорий
- Заполнит начальные данные согласно структуре

### 2. Запуск миграции данных

После создания структуры базы данных, выполните миграцию существующих данных:

```bash
# Установите зависимости если нужно
npm install dotenv @supabase/supabase-js

# Запустите скрипт миграции
node scripts/migrate-categories.js
```

Скрипт выполнит:
- Маппинг старых категорий в новые ID категорий
- Обновление записей книг с новыми связями
- Показ статистики миграции

### 3. Обновление кода приложения

#### 3.1 Новые типы и API

Используйте новые типы и функции:

```typescript
// Новые типы категорий
import type { Category, CategoryTree, CategoryBreadcrumb } from '@/lib/supabase';
import { fetchCategoryTree, fetchCategories } from '@/lib/api/categories';

// Новые параметры фильтрации книг
import { fetchBooks } from '@/lib/api/books';

const books = await fetchBooks({
  category_id: 'uuid-жанра',
  age_category_id: 'uuid-возраста',
  available_only: true
});
```

#### 3.2 Компонент каталога категорий

Используйте новый компонент для отображения структуры каталога:

```tsx
import { CategoryCatalog } from '@/components/catalog/CategoryCatalog';

export default function CatalogPage() {
  return (
    <div className="container mx-auto py-8">
      <CategoryCatalog 
        showBooksCount={true}
        onCategorySelect={(category) => {
          // Обработка выбора категории
          router.push(`/books?category_id=${category.id}`);
        }}
      />
    </div>
  );
}
```

### 4. Обновление маршрутов и компонентов

#### 4.1 Страница каталога книг

Обновите компоненты для работы с новыми параметрами:

```tsx
// В SimpleSearch или других компонентах фильтрации
const handleCategoryFilter = (categoryId: string, type: 'genre' | 'age') => {
  const params = new URLSearchParams(searchParams);
  
  if (type === 'genre') {
    params.set('category_id', categoryId);
  } else {
    params.set('age_category_id', categoryId);
  }
  
  router.push(`/books?${params.toString()}`);
};
```

#### 4.2 URL-параметры

Новые поддерживаемые параметры:
- `category_id` - ID жанровой категории
- `age_category_id` - ID возрастной категории  
- `category` - старый параметр (для совместимости)

### 5. Настройка админ-панели

Обновите админ-панель для работы с новой структурой:

```tsx
// В админ-формах добавьте селекторы категорий
const [categories, setCategories] = useState<Category[]>([]);
const [ageCategories, setAgeCategories] = useState<Category[]>([]);

useEffect(() => {
  // Загрузка жанровых категорий
  fetchChildCategories('genre-parent-id').then(response => {
    if (response.success) setCategories(response.data);
  });
  
  // Загрузка возрастных категорий  
  fetchChildCategories('age-parent-id').then(response => {
    if (response.success) setAgeCategories(response.data);
  });
}, []);
```

## 🧪 Тестирование

### 1. Проверка API

```bash
# Тестирование нового API категорий
curl "http://localhost:3000/api/categories?tree=true"
curl "http://localhost:3000/api/categories?parent_id=genre-uuid"

# Тестирование книг с новыми параметрами
curl "http://localhost:3000/api/books?category_id=fairy-tales-uuid"
curl "http://localhost:3000/api/books?age_category_id=preschool-uuid"
```

### 2. Проверка UI

1. Откройте страницу каталога: `/books`
2. Проверьте фильтрацию по новым категориям
3. Убедитесь, что старые ссылки работают (совместимость)
4. Проверьте отображение CategoryCatalog

### 3. Проверка миграции данных

```sql
-- Проверка связей категорий
SELECT 
  b.title,
  c.name as genre,
  ac.name as age_group
FROM books b
LEFT JOIN categories c ON b.category_id = c.id  
LEFT JOIN categories ac ON b.age_category_id = ac.id
LIMIT 10;

-- Статистика по категориям
SELECT 
  c.name,
  COUNT(b.id) as books_count,
  COUNT(CASE WHEN b.available THEN 1 END) as available_count
FROM categories c
LEFT JOIN books b ON (b.category_id = c.id OR b.age_category_id = c.id)
WHERE c.parent_id IS NOT NULL
GROUP BY c.id, c.name
ORDER BY books_count DESC;
```

## 🔧 Откат миграции (если нужно)

Если что-то пошло не так, можно откатить изменения:

```sql
-- Восстановление старого поля category из связанных данных
UPDATE books 
SET category = (
  SELECT c.name 
  FROM categories c 
  WHERE c.id = books.category_id
)
WHERE category_id IS NOT NULL;

-- Удаление новых полей (осторожно!)
-- ALTER TABLE books DROP COLUMN category_id;
-- ALTER TABLE books DROP COLUMN age_category_id;
```

## 📊 Мониторинг после миграции

После внедрения отслеживайте:
- Производительность запросов с JOIN
- Использование новых категорий пользователями
- Ошибки в логах связанные с категориями
- Статистику поиска по категориям

## 🎨 Кастомизация

### Иконки категорий

Измените иконки в функции `getDefaultCategoryIcon()` в `src/lib/types/categories.ts`:

```typescript
const iconMap: Record<string, string> = {
  'fairy-tales': '🧚‍♀️',  // Изменить иконку
  'detective': '🕵️',      // Или эту
  // ...
};
```

### Цвета категорий

Обновите цвета в `getDefaultCategoryColor()`:

```typescript
const colorMap: Record<string, string> = {
  'fairy-tales': '#FF6B9D',  // Розовый для сказок
  'detective': '#2563EB',    // Синий для детективов
  // ...
};
```

## ❓ Поддержка

При возникновении проблем:
1. Проверьте логи приложения
2. Убедитесь что миграция БД выполнена полностью  
3. Проверьте права доступа к таблице categories
4. Обратитесь к разработчику с детальным описанием проблемы

---

**Важно**: Создайте резервную копию базы данных перед началом миграции!