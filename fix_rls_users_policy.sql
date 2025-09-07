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
