-- Исправление RLS политики для таблицы users (версия 2)
-- Проблема: infinite recursion detected in policy for relation "users"
-- Дата: 7 вересня 2025

-- Сначала отключаем RLS для таблицы users
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Удаляем ВСЕ существующие политики для таблицы users
-- (включая те, которые могли быть созданы ранее)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.users;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admin can view all users" ON public.users;
DROP POLICY IF EXISTS "Admin can update all users" ON public.users;
DROP POLICY IF EXISTS "Admin can delete users" ON public.users;
DROP POLICY IF EXISTS "Public read access for users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can insert" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admin can delete users" ON public.users;

-- Дополнительно удаляем все политики, которые могут существовать
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Получаем все политики для таблицы users
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        -- Удаляем каждую политику
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', policy_record.policyname);
        RAISE NOTICE 'Удалена политика: %', policy_record.policyname;
    END LOOP;
END $$;

-- Проверяем, что все политики удалены
SELECT 
    'Политики после удаления:' as status,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

-- Создаем новые простые и безопасные политики без рекурсии
-- 1. Политика для чтения - все могут читать публичные данные пользователей
CREATE POLICY "users_public_read" ON public.users
    FOR SELECT USING (true);

-- 2. Политика для вставки - только аутентифицированные пользователи
CREATE POLICY "users_authenticated_insert" ON public.users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Политика для обновления - пользователи могут обновлять только свой профиль
CREATE POLICY "users_own_update" ON public.users
    FOR UPDATE USING (auth.email() = email);

-- 4. Политика для удаления - только админы могут удалять пользователей
CREATE POLICY "users_admin_delete" ON public.users
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
    'Новые политики:' as status,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY policyname;

-- Тестируем RLS политики
SELECT 
    'Тест RLS политик:' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users
FROM public.users;
