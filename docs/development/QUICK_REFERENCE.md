# ⚡ Быстрая справка по разработке Stefa.Books

## 🎯 Назначение

Этот документ содержит краткую справку по самым важным правилам и процедурам разработки. Используйте его для быстрого поиска информации.

---

## 🚫 **СТРОГО ЗАПРЕЩЕНО**

### TypeScript
```typescript
// ❌ НИКОГДА!
const data: any = response.data;
const result: any = await api.call();

// ✅ ВСЕГДА!
const data: unknown = response.data;
const result: ApiResponse<Book> = await api.call();
```

### Console методы
```typescript
// ❌ НИКОГДА!
console.log('Debug:', data);
console.error('Error:', error);

// ✅ ВСЕГДА!
logger.debug('Debug info', { data });
logger.error('Error occurred', { error });
```

### Пустые catch блоки
```typescript
// ❌ НИКОГДА!
try {
  await operation();
} catch {
  // пустой
}

// ✅ ВСЕГДА!
try {
  await operation();
} catch (error) {
  logger.error('Operation failed', { error });
  throw error;
}
```

### Недоступные элементы
```tsx
// ❌ НИКОГДА!
<button onClick={handleClick}>
  <Icon />
</button>

// ✅ ВСЕГДА!
<button 
  onClick={handleClick}
  aria-label="Описание действия"
  tabIndex={0}
>
  <Icon />
</button>
```

---

## ✅ **ОБЯЗАТЕЛЬНО ДЕЛАТЬ**

### Строгая типизация
```typescript
interface BookCardProps {
  book: Book;
  onFavorite: (bookId: string) => void;
  className?: string;
}

const BookCard: React.FC<BookCardProps> = ({ book, onFavorite, className }) => {
  // implementation
};
```

### Правильная обработка ошибок
```typescript
const fetchBooks = async (): Promise<Book[]> => {
  try {
    const { data, error } = await supabase.from('books').select('*');
    
    if (error) {
      logger.error('Failed to fetch books', { error });
      throw new Error('Failed to fetch books');
    }
    
    return data || [];
  } catch (error) {
    logger.error('Unexpected error in fetchBooks', { error });
    return [];
  }
};
```

### Доступность по умолчанию
```tsx
<button
  onClick={handleClick}
  aria-label="Описание действия"
  disabled={isLoading}
  className="btn-primary"
  type="button"
>
  {isLoading ? 'Завантаження...' : 'Дія'}
</button>
```

### JSDoc для сложных функций
```typescript
/**
 * Загружает изображение в Cloudinary
 * @param filePath - Путь к файлу изображения
 * @param publicId - Публичный ID для Cloudinary
 * @returns Promise с URL загруженного изображения или null при ошибке
 */
async function uploadToCloudinary(filePath: string, publicId: string): Promise<string | null> {
  // implementation
}
```

---

## 🔍 **ПРОВЕРКИ КАЧЕСТВА**

### Перед каждым коммитом
```bash
pnpm lint && pnpm type-check && pnpm test
```

### Перед Pull Request
```bash
pnpm lint && pnpm type-check && pnpm test && pnpm build
```

### Code Review Checklist
- [ ] ❌ Нет `any` типов
- [ ] ❌ Нет `console.log` в production коде
- [ ] ❌ Нет пустых catch блоков
- [ ] ✅ Все интерактивные элементы доступны
- [ ] ✅ Ошибки обрабатываются правильно
- [ ] ✅ JSDoc для сложных функций
- [ ] ✅ Тесты покрывают новую функциональность

---

## 🛠️ **ПОЛЕЗНЫЕ КОМАНДЫ**

### Разработка
```bash
pnpm dev              # Запуск dev сервера
pnpm build            # Сборка проекта
pnpm start            # Запуск production сервера
```

### Качество кода
```bash
pnpm lint             # ESLint проверка
pnpm type-check       # TypeScript проверка
pnpm test             # Запуск тестов
pnpm format           # Форматирование кода
```

### Анализ
```bash
pnpm analyze          # Анализ размера бандла
pnpm lighthouse       # Lighthouse анализ
pnpm metrics          # Метрики производительности
```

---

## 📊 **МЕТРИКИ КАЧЕСТВА**

### Текущие показатели (поддерживать)
- **TypeScript Errors:** 0
- **ESLint Warnings:** < 5
- **Test Coverage:** > 80%
- **Bundle Size:** < 500KB
- **Accessibility Score:** > 95
- **Performance Score:** > 90

---

## 🚨 **КРАСНЫЕ ФЛАГИ**

При обнаружении немедленно исправлять:
1. **TypeScript ошибки** - любые `any` типы
2. **Console методы** - в production коде
3. **Пустые catch блоки** - игнорирование ошибок
4. **Недоступные элементы** - без ARIA атрибутов

---

## 📞 **ПОМОЩЬ**

### При возникновении проблем:
1. Проверьте этот документ
2. Обратитесь к [CODING_STANDARDS.md](./CODING_STANDARDS.md)
3. Создайте issue в репозитории

### Полезные ссылки:
- [DEVELOPER_ONBOARDING.md](./DEVELOPER_ONBOARDING.md) - Полное руководство
- [CODE_QUALITY_AUDIT_REPORT.md](./CODE_QUALITY_AUDIT_REPORT.md) - Отчет о качестве
- [PROJECT_MAINTENANCE_GUIDE.md](./PROJECT_MAINTENANCE_GUIDE.md) - Поддержка проекта

---

*Документ создан: Декабрь 2024*  
*Версия: 1.0*  
*Статус: Актуально*
