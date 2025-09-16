# 🚀 БЫСТРАЯ СПРАВКА - Stefa.Books

## 🚨 АВАРИЙНЫЕ КОМАНДЫ

```bash
# Если что-то сломалось:
pnpm run emergency:quick    # Быстрое исправление
pnpm run emergency:full     # Полное восстановление
pnpm run emergency:rollback # Откат к рабочему состоянию

# Проверка перед коммитом:
pnpm run pre-commit         # Полная проверка
```

## 🔧 ОСНОВНЫЕ КОМАНДЫ

```bash
# Разработка
pnpm run dev               # Запуск dev сервера
pnpm run dev:safe          # Безопасный запуск с проверками

# Проверки
pnpm run lint              # ESLint проверка
pnpm run type-check        # TypeScript проверка
pnpm run build             # Сборка проекта
pnpm run deploy:check      # Проверка готовности к деплою

# Деплоймент
pnpm run deploy            # Preview деплой
pnpm run deploy:prod       # Production деплой
```

## 🎯 КРИТИЧЕСКИЕ ПРАВИЛА

### ❌ НИКОГДА НЕ ДЕЛАЙТЕ:
- Коммитьте без `pnpm run pre-commit`
- Изменяйте `next.config.js` без тестирования
- Используйте inline стили (`style={{}}`)
- Игнорируйте TypeScript ошибки
- Деплойте на main без preview тестирования

### ✅ ВСЕГДА ДЕЛАЙТЕ:
- Используйте Tailwind CSS классы
- Тестируйте на мобильных устройствах
- Проверяйте админ панель после изменений
- Логируйте все действия админа
- Используйте существующие компоненты из `components/ui`

## 🎨 СТИЛИ - ТОЛЬКО ЭТИ КЛАССЫ

```css
/* Типографика */
.text-display    /* Главные заголовки */
.text-h1         /* H1 заголовки */
.text-h2         /* H2 заголовки */
.text-h3         /* H3 заголовки */
.text-h4         /* H4 заголовки */
.text-h5         /* H5 заголовки */
.text-h6         /* H6 заголовки */
.text-readable   /* Основной текст */
.text-body       /* Обычный текст */
.text-body-sm    /* Мелкий текст */
.text-caption    /* Подписи */

/* Grid для книг */
.books-grid      /* Адаптивная сетка книг */
```

## 🔐 АДМИН ПАНЕЛЬ - БЕЗОПАСНОСТЬ

```typescript
// В каждом API endpoint:
const isAdminByEmail = user.email === 'admin@stefabooks.com.ua' || 
                      user.email === 'admin@stefa-books.com.ua';
const isAdminByRole = profile?.role === 'admin';

if (!isAdminByEmail && !isAdminByRole) {
  return NextResponse.json(
    { success: false, error: 'Admin access required' },
    { status: 403 }
  );
}
```

## 🚀 ПРОЦЕДУРА ДЕПЛОЙМЕНТА

1. **Проверка**: `pnpm run pre-commit`
2. **Preview**: `pnpm run deploy`
3. **Тестирование** на preview URL
4. **Production**: `pnpm run deploy:prod`

## 🚨 ЕСЛИ ЧТО-ТО СЛОМАЛОСЬ

1. **Быстрое исправление**: `pnpm run emergency:quick`
2. **Полное восстановление**: `pnpm run emergency:full`
3. **Откат**: `pnpm run emergency:rollback`
4. **Проверка логов**: `vercel logs`

## 📱 RESPONSIVE ПРАВИЛА

- **Мобильные**: 320px+ (1 колонка)
- **Планшеты**: 640px+ (2 колонки)
- **Десктоп**: 1020px+ (4 колонки)
- **Большие экраны**: 1680px+ (6 колонок)

## 🎯 КРИТИЧЕСКИЕ ФАЙЛЫ - НЕ ТРОГАТЬ!

- `next.config.js` - настройки сборки
- `globals.css` - базовые стили
- `src/middleware.ts` - аутентификация
- `src/lib/supabase.ts` - подключение к БД

---

**ПОМНИТЕ: Лучше потратить 10 минут на проверки, чем 2 часа на исправление!**
