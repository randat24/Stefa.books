# 📋 Стандарты кодирования Stefa.Books

## 🎯 Цель документа

Этот документ устанавливает строгие стандарты качества кода для проекта Stefa.Books, чтобы обеспечить:
- **Читаемость** и поддерживаемость кода
- **Безопасность** и надежность приложения
- **Производительность** и оптимизацию
- **Доступность** для всех пользователей

---

## 🚫 **СТРОГО ЗАПРЕЩЕНО**

### 1. **TypeScript - НЕ используйте `any`**

```typescript
// ❌ ЗАПРЕЩЕНО - НЕ ДЕЛАЙТЕ ТАК!
const data: any = response.data;
const metadata: Record<string, any> = {};
const result: any = await api.call();
const user: any = getUser();

// ✅ ПРАВИЛЬНО - ДЕЛАЙТЕ ТАК!
const data: unknown = response.data;
const metadata: Record<string, unknown> = {};
const result: ApiResponse<Book> = await api.call();
const user: User | null = getUser();
```

**Почему:** `any` отключает проверку типов и может привести к runtime ошибкам.

### 2. **Console методы - НЕ в production коде**

```typescript
// ❌ ЗАПРЕЩЕНО - НЕ ДЕЛАЙТЕ ТАК!
console.log('Debug info:', data);
console.error('Error:', error);
console.warn('Warning:', message);
console.info('Info:', info);

// ✅ ПРАВИЛЬНО - ДЕЛАЙТЕ ТАК!
logger.debug('Debug info', { data });
logger.error('Error occurred', { error, context: 'ComponentName' });
logger.warn('Warning message', { details: message });
logger.info('Information', { info });
```

**Почему:** Console методы не контролируются и могут засорять production логи.

### 3. **Пустые catch блоки**

```typescript
// ❌ ЗАПРЕЩЕНО - НЕ ДЕЛАЙТЕ ТАК!
try {
  await riskyOperation();
} catch {
  // пустой catch
}

try {
  await riskyOperation();
} catch (error) {
  // игнорируем ошибку
}

// ✅ ПРАВИЛЬНО - ДЕЛАЙТЕ ТАК!
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', { error, context: 'FunctionName' });
  // обрабатываем ошибку или пробрасываем дальше
  throw new Error('Operation failed');
}
```

**Почему:** Игнорирование ошибок может скрыть критические проблемы.

### 4. **Deprecated методы**

```typescript
// ❌ ЗАПРЕЩЕНО - НЕ ДЕЛАЙТЕ ТАК!
const id = Math.random().toString(36).substr(2, 9);
const result = array.slice(0, 5).join('');

// ✅ ПРАВИЛЬНО - ДЕЛАЙТЕ ТАК!
const id = Math.random().toString(36).substring(2, 11);
const result = array.slice(0, 5).join('');
```

**Почему:** Deprecated методы могут быть удалены в будущих версиях.

### 5. **Недоступные интерактивные элементы**

```tsx
// ❌ ЗАПРЕЩЕНО - НЕ ДЕЛАЙТЕ ТАК!
<button onClick={handleClick}>
  <Icon />
</button>

<div onClick={handleClick}>Click me</div>

<img src="image.jpg" onClick={handleClick} />

// ✅ ПРАВИЛЬНО - ДЕЛАЙТЕ ТАК!
<button 
  onClick={handleClick}
  aria-label="Описание действия"
  tabIndex={0}
>
  <Icon />
</button>

<div 
  onClick={handleClick}
  role="button"
  tabIndex={0}
  aria-label="Описание действия"
  onKeyDown={handleKeyDown}
>
  Click me
</div>

<img 
  src="image.jpg" 
  onClick={handleClick}
  role="button"
  tabIndex={0}
  aria-label="Описание изображения"
  onKeyDown={handleKeyDown}
/>
```

**Почему:** Недоступность нарушает права пользователей с ограниченными возможностями.

---

## ✅ **ОБЯЗАТЕЛЬНО ДЕЛАТЬ**

### 1. **Строгая типизация TypeScript**

```typescript
// ✅ ОБЯЗАТЕЛЬНО - интерфейсы для всех объектов
interface BookCardProps {
  book: Book;
  onFavorite: (bookId: string) => void;
  className?: string;
  isLoading?: boolean;
}

// ✅ ОБЯЗАТЕЛЬНО - типы для функций
const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  onFavorite, 
  className,
  isLoading = false 
}) => {
  // implementation
};

// ✅ ОБЯЗАТЕЛЬНО - типы для API responses
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}
```

### 2. **Правильная обработка ошибок**

```typescript
// ✅ ОБЯЗАТЕЛЬНО - централизованная обработка ошибок
const fetchBooks = async (): Promise<Book[]> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*');
    
    if (error) {
      logger.error('Failed to fetch books', { 
        error: error.message,
        context: 'fetchBooks',
        table: 'books'
      });
      throw new Error(`Failed to fetch books: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    logger.error('Unexpected error in fetchBooks', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      context: 'fetchBooks'
    });
    return [];
  }
};
```

### 3. **Доступность (A11y) по умолчанию**

```tsx
// ✅ ОБЯЗАТЕЛЬНО - все интерактивные элементы доступны
<button
  onClick={handleClick}
  aria-label="Додати до улюблених"
  disabled={isLoading}
  className="btn-primary"
  type="button"
>
  {isLoading ? (
    <>
      <Spinner className="h-4 w-4" />
      <span className="sr-only">Завантаження...</span>
    </>
  ) : (
    <>
      <Heart className="h-4 w-4" />
      <span>Улюблене</span>
    </>
  )}
</button>

// ✅ ОБЯЗАТЕЛЬНО - семантические HTML теги
<main>
  <section aria-labelledby="books-heading">
    <h2 id="books-heading">Каталог книг</h2>
    <div role="region" aria-live="polite">
      {/* Динамический контент */}
    </div>
  </section>
</main>
```

### 4. **JSDoc документация для сложных функций**

```typescript
// ✅ ОБЯЗАТЕЛЬНО - JSDoc для всех публичных функций
/**
 * Загружает изображение в Cloudinary с оптимизацией
 * @param filePath - Путь к файлу изображения
 * @param publicId - Публичный ID для Cloudinary (без расширения)
 * @param options - Дополнительные опции загрузки
 * @returns Promise с URL загруженного изображения или null при ошибке
 * @throws {Error} При критических ошибках загрузки
 * @example
 * ```typescript
 * const imageUrl = await uploadToCloudinary(
 *   '/path/to/image.jpg',
 *   'book-cover-123',
 *   { width: 300, height: 400 }
 * );
 * ```
 */
async function uploadToCloudinary(
  filePath: string, 
  publicId: string,
  options: UploadOptions = {}
): Promise<string | null> {
  // implementation
}
```

### 5. **Валидация входных данных**

```typescript
// ✅ ОБЯЗАТЕЛЬНО - валидация с Zod
import { z } from 'zod';

const BookSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  author: z.string().min(1, 'Автор обязателен'),
  category: z.string().min(1, 'Категория обязательна'),
  description: z.string().optional(),
  pages: z.number().positive().optional(),
});

// ✅ ОБЯЗАТЕЛЬНО - валидация в API routes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = BookSchema.parse(body);
    
    // используем validatedData
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    // обработка других ошибок
  }
}
```

---

## 🔍 **Процедуры проверки качества**

### 1. **Перед каждым коммитом (ОБЯЗАТЕЛЬНО):**

```bash
# 1. Проверка ESLint
pnpm lint

# 2. Проверка TypeScript
pnpm type-check

# 3. Форматирование кода
pnpm format

# 4. Запуск тестов
pnpm test
```

### 2. **Перед Pull Request (ОБЯЗАТЕЛЬНО):**

```bash
# Полная проверка
pnpm lint && pnpm type-check && pnpm test && pnpm build

# Проверка производительности
pnpm analyze
```

### 3. **Code Review Checklist:**

- [ ] ❌ Нет `any` типов
- [ ] ❌ Нет `console.log` в production коде  
- [ ] ❌ Нет пустых catch блоков
- [ ] ❌ Нет deprecated методов
- [ ] ✅ Все интерактивные элементы доступны
- [ ] ✅ Ошибки обрабатываются правильно
- [ ] ✅ JSDoc для сложных функций
- [ ] ✅ Валидация входных данных
- [ ] ✅ Тесты покрывают новую функциональность

---

## 📊 **Метрики качества**

### Текущие показатели (поддерживать):
- **TypeScript Coverage:** 100%
- **ESLint Errors:** 0
- **Accessibility Score:** 95+
- **Performance Score:** 90+
- **Security Score:** 95+

### Автоматические проверки:
- ESLint с строгими правилами
- TypeScript strict mode
- Prettier для форматирования
- Pre-commit hooks (рекомендуется)

---

## 🚀 **Инструменты и настройки**

### VS Code Extensions (рекомендуется):
- TypeScript Importer
- ESLint
- Prettier
- Auto Rename Tag
- Bracket Pair Colorizer
- Error Lens

### Настройки VS Code:
```json
{
  "typescript.preferences.strictNullChecks": true,
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## 📝 **Примеры правильного кода**

### Компонент React:
```tsx
interface BookCardProps {
  book: Book;
  onFavorite: (bookId: string) => void;
  onRent: (bookId: string) => void;
  className?: string;
  isLoading?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({
  book,
  onFavorite,
  onRent,
  className,
  isLoading = false
}) => {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = useCallback(() => {
    try {
      onFavorite(book.id);
      setIsFavorited(prev => !prev);
    } catch (error) {
      logger.error('Failed to toggle favorite', { 
        error, 
        bookId: book.id 
      });
    }
  }, [book.id, onFavorite]);

  return (
    <article 
      className={cn('book-card', className)}
      role="article"
      aria-labelledby={`book-title-${book.id}`}
    >
      <button
        onClick={handleFavorite}
        aria-label={isFavorited ? "Видалити з улюблених" : "Додати до улюблених"}
        disabled={isLoading}
        className="favorite-btn"
        type="button"
      >
        <Heart className={cn('h-5 w-5', isFavorited && 'fill-current')} />
      </button>
      
      <h3 id={`book-title-${book.id}`} className="book-title">
        {book.title}
      </h3>
      
      <p className="book-author">{book.author}</p>
      
      <button
        onClick={() => onRent(book.id)}
        disabled={isLoading || !book.available}
        className="rent-btn"
        type="button"
        aria-label={`Орендувати книгу ${book.title}`}
      >
        {isLoading ? 'Завантаження...' : 'Орендувати'}
      </button>
    </article>
  );
};
```

### API Route:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const BookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = BookSchema.parse(body);
    
    const { data, error } = await supabase
      .from('books')
      .insert([validatedData])
      .select()
      .single();
    
    if (error) {
      logger.error('Failed to create book', { error, data: validatedData });
      return NextResponse.json(
        { error: 'Failed to create book' },
        { status: 500 }
      );
    }
    
    logger.info('Book created successfully', { bookId: data.id });
    return NextResponse.json({ data }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error in book creation', { errors: error.errors });
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    logger.error('Unexpected error in book creation', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 🎯 **Заключение**

Следование этим стандартам обеспечит:
- **Высокое качество** кода
- **Легкость поддержки** и развития
- **Безопасность** приложения
- **Доступность** для всех пользователей
- **Производительность** и оптимизацию

**Помните:** Качество кода - это не разовая задача, а постоянный процесс. Каждый разработчик несет ответственность за поддержание этих стандартов.

---

*Документ создан: Декабрь 2024*  
*Версия: 1.0*  
*Статус: Актуально*
