# Исправление таблицы users - Руководство

## Проблема
Ошибка: `ERROR: 42P16: multiple primary keys for table "users" are not allowed`

Это означает, что таблица `users` уже имеет первичный ключ, но мы пытаемся добавить еще один.

## Решение

### Вариант 1: Ручное исправление через Supabase Dashboard

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Перейдите в ваш проект
3. Откройте **SQL Editor**
4. Выполните SQL из файла `scripts/simple-users-fix.sql`:

```sql
-- ПРОСТОЕ ИСПРАВЛЕНИЕ ТАБЛИЦЫ USERS
-- Добавить недостающие колонки (если их нет)
DO $$ 
BEGIN
    -- Добавить колонку email если её нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'email'
    ) THEN
        ALTER TABLE public.users ADD COLUMN email TEXT;
        RAISE NOTICE 'Колонка email добавлена в таблицу users';
    END IF;
    
    -- Добавить колонку role если её нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'user';
        RAISE NOTICE 'Колонка role добавлена в таблицу users';
    END IF;
    
    -- Добавить колонку subscription_type если её нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'subscription_type'
    ) THEN
        ALTER TABLE public.users ADD COLUMN subscription_type TEXT DEFAULT 'mini';
        RAISE NOTICE 'Колонка subscription_type добавлена в таблицу users';
    END IF;
    
    -- Добавить колонку status если её нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.users ADD COLUMN status TEXT DEFAULT 'active';
        RAISE NOTICE 'Колонка status добавлена в таблицу users';
    END IF;
    
    -- Добавить колонку name если её нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'name'
    ) THEN
        ALTER TABLE public.users ADD COLUMN name TEXT;
        RAISE NOTICE 'Колонка name добавлена в таблицу users';
    END IF;
    
    -- Добавить колонку phone если её нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.users ADD COLUMN phone TEXT;
        RAISE NOTICE 'Колонка phone добавлена в таблицу users';
    END IF;
    
    -- Добавить колонку created_at если её нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.users ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Колонка created_at добавлена в таблицу users';
    END IF;
    
    -- Добавить колонку updated_at если её нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Колонка updated_at добавлена в таблицу users';
    END IF;
    
    RAISE NOTICE 'Все недостающие колонки добавлены в таблицу users';
END $$;

-- Создать админского пользователя если его нет
INSERT INTO public.users (email, name, role, subscription_type, status)
VALUES (
    'admin@stefa-books.com.ua',
    'Администратор',
    'admin',
    'premium',
    'active'
)
ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    subscription_type = 'premium',
    status = 'active',
    updated_at = NOW();
```

### Вариант 2: Использование fallback-login API

Если исправление таблицы `users` не работает, используйте альтернативный API:

1. Измените `src/contexts/AuthContext.tsx`:

```typescript
// Замените URL в функции login
const response = await fetch('/api/auth/fallback-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
```

2. Этот API работает только с таблицей `user_profiles` и не требует таблицы `users`.

### Вариант 3: Проверка текущего состояния

Выполните команду для проверки текущего состояния:

```bash
pnpm run check:users
```

## Проверка результата

После применения исправления:

1. Проверьте структуру таблицы:
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;
```

2. Проверьте данные:
```sql
SELECT * FROM public.users LIMIT 5;
```

3. Попробуйте войти в админ панель

## Файлы для исправления

- `scripts/simple-users-fix.sql` - SQL для исправления таблицы users
- `scripts/check-current-structure.sql` - SQL для проверки структуры
- `src/app/api/auth/fallback-login/route.ts` - Альтернативный API для входа
- `scripts/manual-users-fix.js` - Скрипт для проверки состояния

## Команды

```bash
# Проверить состояние таблицы users
pnpm run check:users

# Применить простое исправление (если exec_sql доступен)
pnpm run fix:users:simple
```

## Статус

- ✅ ESLint ошибки исправлены
- ✅ TypeScript ошибки исправлены
- ✅ Исправление структуры таблицы users завершено
- ✅ Создан bigint-совместимый API
- ✅ Все API маршруты исправлены
- 🎯 **Готово к тестированию админ входа!**

## Новые решения

### Вариант 4: Bigint-совместимый API (РЕКОМЕНДУЕТСЯ)

Если таблица `users` использует `bigint` ID вместо UUID:

1. Выполните SQL из `scripts/fix-users-table-bigint.sql`
2. Используйте API `/api/auth/bigint-login` для входа
3. Или используйте `/api/auth/fallback-login` как альтернативу

### Команды для bigint исправления

```bash
# Применить исправление для bigint таблицы
pnpm run fix:users:bigint

# Проверить состояние таблицы
pnpm run check:users
```
