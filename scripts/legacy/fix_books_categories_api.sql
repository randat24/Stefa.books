-- Исправление RLS политик для отображения книг и категорий на сайте
-- Проблема: API возвращает ошибки из-за неправильных RLS политик

-- ============================================================================
-- ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ BOOKS
-- ============================================================================

-- Отключаем RLS для таблицы books
ALTER TABLE public.books DISABLE ROW LEVEL SECURITY;

-- Удаляем все существующие политики для books
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'books' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.books', policy_name);
    END LOOP;
END $$;

-- Создаем простые политики для books
CREATE POLICY "books_select_public" ON public.books 
    FOR SELECT USING (true);

CREATE POLICY "books_insert_admin" ON public.books 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = auth.email() AND role = 'admin'
        )
    );

CREATE POLICY "books_update_admin" ON public.books 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = auth.email() AND role = 'admin'
        )
    );

CREATE POLICY "books_delete_admin" ON public.books 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = auth.email() AND role = 'admin'
        )
    );

-- Включаем RLS обратно
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ CATEGORIES
-- ============================================================================

-- Отключаем RLS для таблицы categories
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- Удаляем все существующие политики для categories
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'categories' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.categories', policy_name);
    END LOOP;
END $$;

-- Создаем простые политики для categories
CREATE POLICY "categories_select_public" ON public.categories 
    FOR SELECT USING (true);

CREATE POLICY "categories_insert_admin" ON public.categories 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = auth.email() AND role = 'admin'
        )
    );

CREATE POLICY "categories_update_admin" ON public.categories 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = auth.email() AND role = 'admin'
        )
    );

CREATE POLICY "categories_delete_admin" ON public.categories 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = auth.email() AND role = 'admin'
        )
    );

-- Включаем RLS обратно
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ПРОВЕРКА РЕЗУЛЬТАТА
-- ============================================================================

-- Проверяем политики для books
SELECT 
    policyname, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'books' AND schemaname = 'public'
ORDER BY policyname;

-- Проверяем политики для categories
SELECT 
    policyname, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'categories' AND schemaname = 'public'
ORDER BY policyname;

-- Проверяем количество книг
SELECT COUNT(*) as total_books FROM public.books;

-- Проверяем количество категорий
SELECT COUNT(*) as total_categories FROM public.categories;
