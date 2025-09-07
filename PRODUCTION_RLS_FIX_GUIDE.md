# 🔧 Исправление RLS в продакшене

## ✅ Статус деплоя
- **Сайт развернут**: https://stefa-books.com.ua ✅
- **API работает**: https://stefa-books.com.ua/api/health ✅
- **Проблема**: RLS политика блокирует доступ к данным ❌
- **Дата**: 7 вересня 2025
- **Версия**: 2.1.0

## 🚨 Проблема
```
{"error":"Ошибка при получении книг"}
```

**Причина**: `infinite recursion detected in policy for relation "users"`

## 🔧 Решение

### 1. Откройте Supabase Dashboard
1. Перейдите в [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **SQL Editor**

### 2. Выполните SQL скрипт
Скопируйте и выполните следующий SQL код:

```sql
-- Исправление RLS политики для таблицы users
-- Проблема: infinite recursion detected in policy for relation "users"

-- Сначала отключаем RLS для таблицы users
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Удаляем все существующие политики для таблицы users
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.users;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admin can view all users" ON public.users;
DROP POLICY IF EXISTS "Admin can update all users" ON public.users;
DROP POLICY IF EXISTS "Admin can delete users" ON public.users;

-- Создаем простые и безопасные политики без рекурсии
-- 1. Политика для чтения - все могут читать публичные данные пользователей
CREATE POLICY "Public read access for users" ON public.users
    FOR SELECT USING (true);

-- 2. Политика для вставки - только аутентифицированные пользователи
CREATE POLICY "Authenticated users can insert" ON public.users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Политика для обновления - пользователи могут обновлять только свой профиль
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.email() = email);

-- 4. Политика для удаления - только админы могут удалять пользователей
CREATE POLICY "Admin can delete users" ON public.users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = auth.email() 
            AND role = 'admin'
        )
    );

-- Включаем RLS обратно
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Проверяем, что политики созданы правильно
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;
```

### 3. Проверьте результат
После выполнения SQL скрипта проверьте:

1. **API книг**: https://stefa-books.com.ua/api/books
2. **Локальная проверка**: `node check_site_database_connection.mjs`

## 🎯 Ожидаемый результат
- ✅ API книг должен вернуть список книг
- ✅ Локальная проверка должна показать "✅ Подключение к базе данных: OK"
- ✅ Сайт должен работать полностью

## 📝 Дополнительные проверки
После исправления RLS проверьте:
- [ ] Главная страница загружается
- [ ] Каталог книг работает
- [ ] API возвращает данные
- [ ] Админ панель доступна

## 🔗 Полезные ссылки
- **Сайт**: https://stefa-books.com.ua
- **API Health**: https://stefa-books.com.ua/api/health
- **API Books**: https://stefa-books.com.ua/api/books
- **Supabase Dashboard**: https://supabase.com/dashboard
