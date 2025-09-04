-- ============================================================================
-- SUPABASE SECURITY FIXES
-- Исправления для Security Advisor warnings
-- ============================================================================

-- ============================================================================
-- 1. ИСПРАВЛЕНИЕ RLS ДЛЯ BOOK_AUTHORS
-- ============================================================================

-- Включаем RLS для таблицы book_authors
ALTER TABLE public.book_authors ENABLE ROW LEVEL SECURITY;

-- Политики для book_authors (только чтение для всех)
CREATE POLICY "book_authors_select_policy" ON public.book_authors
    FOR SELECT
    TO public
    USING (true);

-- ============================================================================
-- 2. ИСПРАВЛЕНИЕ SEARCH_PATH ДЛЯ ФУНКЦИЙ
-- ============================================================================

-- Пересоздаем функцию search_books с безопасным search_path
DROP FUNCTION IF EXISTS public.search_books(text, integer);

CREATE OR REPLACE FUNCTION public.search_books(
    query_text TEXT,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE(
    id UUID,
    title TEXT,
    author TEXT,
    category TEXT,
    subcategory TEXT,
    cover_url TEXT,
    rating DECIMAL,
    rating_count INTEGER,
    available BOOLEAN,
    badges TEXT[],
    rank REAL
)
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    clean_query TEXT;
BEGIN
    -- Очищаем и подготавливаем поисковый запрос
    clean_query := TRIM(COALESCE(query_text, ''));
    
    -- Если запрос пустой, возвращаем популярные книги
    IF clean_query = '' THEN
        RETURN QUERY
        SELECT 
            b.id, b.title, b.author, b.category, b.subcategory, 
            b.cover_url, b.rating, b.rating_count, b.available, b.badges,
            COALESCE(b.rating, 0) as rank
        FROM public.books b
        WHERE b.available = true
        ORDER BY b.rating DESC NULLS LAST, b.rating_count DESC
        LIMIT limit_count;
        RETURN;
    END IF;
    
    -- Полнотекстовый поиск с ранжированием
    RETURN QUERY
    SELECT 
        b.id, b.title, b.author, b.category, b.subcategory,
        b.cover_url, b.rating, b.rating_count, b.available, b.badges,
        (ts_rank_cd(b.search_vector, plainto_tsquery('ukrainian', clean_query)) * 100) as rank
    FROM public.books b
    WHERE b.search_vector @@ plainto_tsquery('ukrainian', clean_query)
       OR b.title ILIKE '%' || clean_query || '%'
       OR b.author ILIKE '%' || clean_query || '%'
       OR b.category ILIKE '%' || clean_query || '%'
    ORDER BY rank DESC, b.rating DESC NULLS LAST
    LIMIT limit_count;
END;
$$;

-- Пересоздаем функцию update_book_availability с безопасным search_path
DROP FUNCTION IF EXISTS public.update_book_availability(UUID, INTEGER);

CREATE OR REPLACE FUNCTION public.update_book_availability(
    book_id UUID,
    qty_change INTEGER
)
RETURNS BOOLEAN
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_qty INTEGER;
    new_qty INTEGER;
BEGIN
    -- Получаем текущее количество доступных экземпляров
    SELECT qty_available INTO current_qty 
    FROM public.books 
    WHERE id = book_id;
    
    -- Проверяем существование книги
    IF current_qty IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Рассчитываем новое количество
    new_qty := current_qty + qty_change;
    
    -- Проверяем, что количество не станет отрицательным
    IF new_qty < 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Обновляем количество и статус доступности
    UPDATE public.books 
    SET 
        qty_available = new_qty,
        available = (new_qty > 0),
        status = CASE 
            WHEN new_qty > 0 THEN 'available'
            ELSE 'issued'
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = book_id;
    
    RETURN TRUE;
END;
$$;

-- Пересоздаем функцию get_search_suggestions с безопасным search_path
DROP FUNCTION IF EXISTS public.get_search_suggestions(text, integer);

CREATE OR REPLACE FUNCTION public.get_search_suggestions(
    partial_query TEXT,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(suggestion TEXT, type TEXT, count BIGINT)
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    clean_query TEXT;
BEGIN
    -- Очищаем поисковый запрос
    clean_query := TRIM(LOWER(COALESCE(partial_query, '')));
    
    IF clean_query = '' THEN
        RETURN;
    END IF;
    
    -- Возвращаем предложения по названиям, авторам и категориям
    RETURN QUERY
    (
        SELECT DISTINCT b.title as suggestion, 'title'::TEXT as type, COUNT(*) OVER() as count
        FROM public.books b
        WHERE LOWER(b.title) LIKE clean_query || '%'
        LIMIT limit_count / 3
    )
    UNION ALL
    (
        SELECT DISTINCT b.author as suggestion, 'author'::TEXT as type, COUNT(*) OVER() as count
        FROM public.books b  
        WHERE LOWER(b.author) LIKE clean_query || '%'
        LIMIT limit_count / 3
    )
    UNION ALL
    (
        SELECT DISTINCT b.category as suggestion, 'category'::TEXT as type, COUNT(*) OVER() as count
        FROM public.books b
        WHERE LOWER(b.category) LIKE clean_query || '%'
        LIMIT limit_count / 3
    )
    ORDER BY type, suggestion
    LIMIT limit_count;
END;
$$;

-- ============================================================================
-- 3. ПОЛИТИКИ RLS ДЛЯ SEARCH_QUERIES
-- ============================================================================

-- Создаем политики для таблицы search_queries
-- Политика на вставку (любой может логировать поиски)
CREATE POLICY "search_queries_insert_policy" ON public.search_queries
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Политика на чтение (только для админов, если понадобится)
-- Пока оставляем открытой для аналитики
CREATE POLICY "search_queries_select_policy" ON public.search_queries
    FOR SELECT
    TO public
    USING (true);

-- ============================================================================
-- 4. ДОПОЛНИТЕЛЬНЫЕ УЛУЧШЕНИЯ БЕЗОПАСНОСТИ
-- ============================================================================

-- Создаем роль для приложения с ограниченными правами
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'stefa_books_app') THEN
        CREATE ROLE stefa_books_app;
    END IF;
END $$;

-- Предоставляем минимальные права для работы приложения
GRANT USAGE ON SCHEMA public TO stefa_books_app;
GRANT SELECT ON public.books TO stefa_books_app;
GRANT SELECT ON public.authors TO stefa_books_app;
GRANT SELECT ON public.categories TO stefa_books_app;
GRANT SELECT ON public.book_authors TO stefa_books_app;
GRANT INSERT ON public.search_queries TO stefa_books_app;
GRANT EXECUTE ON FUNCTION public.search_books(text, integer) TO stefa_books_app;
GRANT EXECUTE ON FUNCTION public.get_search_suggestions(text, integer) TO stefa_books_app;

-- Создаем роль для админов с полными правами
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'stefa_books_admin') THEN
        CREATE ROLE stefa_books_admin;
    END IF;
END $$;

-- Права админа
GRANT ALL ON ALL TABLES IN SCHEMA public TO stefa_books_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO stefa_books_admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO stefa_books_admin;

-- ============================================================================
-- 5. ДОБАВЛЯЕМ КОММЕНТАРИИ К ПОЛИТИКАМ
-- ============================================================================

COMMENT ON POLICY "book_authors_select_policy" ON public.book_authors 
    IS 'Разрешает чтение связей книг и авторов всем пользователям';

COMMENT ON POLICY "search_queries_insert_policy" ON public.search_queries 
    IS 'Разрешает логирование поисковых запросов';

COMMENT ON POLICY "search_queries_select_policy" ON public.search_queries 
    IS 'Разрешает чтение статистики поиска для аналитики';

-- ============================================================================
-- УВЕДОМЛЕНИЕ О ЗАВЕРШЕНИИ
-- ============================================================================

NOTIFY ddl_command_end, 'Supabase security fixes applied successfully!';