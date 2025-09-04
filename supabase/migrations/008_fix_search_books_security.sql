-- ИСПРАВЛЕНИЕ ПРЕДУПРЕЖДЕНИЯ БЕЗОПАСНОСТИ ДЛЯ ФУНКЦИИ search_books
-- Пересоздаем функцию с правильными настройками security

-- 1. Удалить существующую функцию
DROP FUNCTION IF EXISTS public.search_books(TEXT, TEXT[], TEXT[], BOOLEAN, INTEGER, INTEGER);

-- 2. Создать новую безопасную функцию search_books
CREATE OR REPLACE FUNCTION public.search_books(
    query_text TEXT,
    category_filter TEXT[] DEFAULT NULL,
    author_filter TEXT[] DEFAULT NULL,
    available_only BOOLEAN DEFAULT false,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    title TEXT,
    author TEXT,
    category TEXT,
    description TEXT,
    cover_url TEXT,
    available BOOLEAN,
    rating DECIMAL,
    rating_count INTEGER,
    relevance_score REAL
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.title,
        b.author,
        b.category,
        COALESCE(b.short_description, b.description) as description,
        b.cover_url,
        b.available,
        b.rating,
        b.rating_count,
        -- Простая система релевантности на основе совпадений
        CASE 
            WHEN query_text = '' OR query_text IS NULL THEN 1.0::REAL
            WHEN LOWER(b.title) ILIKE '%' || LOWER(query_text) || '%' THEN 0.9::REAL
            WHEN LOWER(b.author) ILIKE '%' || LOWER(query_text) || '%' THEN 0.8::REAL
            WHEN LOWER(b.category) ILIKE '%' || LOWER(query_text) || '%' THEN 0.7::REAL
            WHEN LOWER(b.description) ILIKE '%' || LOWER(query_text) || '%' THEN 0.6::REAL
            ELSE 0.5::REAL
        END as relevance_score
    FROM books b
    WHERE (
        query_text IS NULL OR query_text = '' OR
        LOWER(b.title) ILIKE '%' || LOWER(query_text) || '%' OR
        LOWER(b.author) ILIKE '%' || LOWER(query_text) || '%' OR
        LOWER(b.category) ILIKE '%' || LOWER(query_text) || '%' OR
        LOWER(COALESCE(b.description, '')) ILIKE '%' || LOWER(query_text) || '%'
    )
    AND (category_filter IS NULL OR b.category = ANY(category_filter))
    AND (author_filter IS NULL OR b.author = ANY(author_filter))
    AND (NOT available_only OR b.available = true)
    ORDER BY 
        CASE 
            WHEN query_text = '' OR query_text IS NULL THEN b.created_at DESC
            ELSE relevance_score DESC
        END,
        b.rating DESC NULLS LAST,
        b.title ASC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- 3. Дать разрешения на выполнение функции
GRANT EXECUTE ON FUNCTION public.search_books(TEXT, TEXT[], TEXT[], BOOLEAN, INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.search_books(TEXT, TEXT[], TEXT[], BOOLEAN, INTEGER, INTEGER) TO authenticated;

-- 4. Результат
SELECT 'Security warnings fixed for search_books function' AS result;