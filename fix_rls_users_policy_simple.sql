-- Простое исправление RLS политики для таблицы users
-- Удаляет все политики и создает новые без рекурсии

-- Отключаем RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Удаляем ВСЕ политики для таблицы users
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', policy_name);
    END LOOP;
END $$;

-- Создаем новые простые политики
CREATE POLICY "users_select" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_insert" ON public.users FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "users_update" ON public.users FOR UPDATE USING (auth.email() = email);
CREATE POLICY "users_delete" ON public.users FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE email = auth.email() AND role = 'admin')
);

-- Включаем RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Проверяем результат
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';
