-- ============================================================================
-- КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ SECURITY WARNINGS (ФИНАЛЬНАЯ ВЕРСИЯ)
-- Выполните этот SQL в Supabase Dashboard -> SQL Editor
-- Исправлено: используем 'english' вместо 'ukrainian' для text search
-- ============================================================================

-- ============================================================================
-- 1. ИСПРАВЛЕНИЕ ФУНКЦИИ search_books
-- ============================================================================

-- Удаляем старую функцию search_books (может быть несколько версий с разными параметрами)
DROP FUNCTION IF EXISTS public.search_books(TEXT);
DROP FUNCTION IF EXISTS public.search_books(TEXT, INTEGER);
DROP FUNCTION IF EXISTS public.search_books(TEXT, TEXT[], TEXT[], BOOLEAN, INTEGER);
DROP FUNCTION IF EXISTS public.search_books(TEXT, TEXT[], TEXT[], BOOLEAN, INTEGER, TEXT);

-- Создаем функцию поиска с безопасным search_path и 'english' text search config
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
SET search_path = public  -- КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ БЕЗОПАСНОСТИ
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
            COALESCE(b.rating, 0)::REAL as rank
        FROM public.books b
        WHERE b.available = true
        ORDER BY b.rating DESC NULLS LAST, b.rating_count DESC
        LIMIT limit_count;
        RETURN;
    END IF;
    
    -- Полнотекстовый поиск с ранжированием (используем 'english' вместо 'ukrainian')
    RETURN QUERY
    SELECT 
        b.id, b.title, b.author, b.category, b.subcategory,
        b.cover_url, b.rating, b.rating_count, b.available, b.badges,
        (ts_rank_cd(b.search_vector, plainto_tsquery('english', clean_query)) * 100)::REAL as rank
    FROM public.books b
    WHERE b.search_vector @@ plainto_tsquery('english', clean_query)
       OR b.title ILIKE '%' || clean_query || '%'
       OR b.author ILIKE '%' || clean_query || '%'
       OR b.category ILIKE '%' || clean_query || '%'
    ORDER BY rank DESC, b.rating DESC NULLS LAST
    LIMIT limit_count;
END;
$$;

-- ============================================================================
-- 2. ИСПРАВЛЕНИЕ ФУНКЦИИ update_book_availability
-- ============================================================================

-- Сначала удаляем все связанные триггеры
DROP TRIGGER IF EXISTS update_book_availability_on_rental_change ON public.rentals;
DROP TRIGGER IF EXISTS trigger_update_book_availability ON public.rentals;

-- Теперь можем безопасно удалить функцию
DROP FUNCTION IF EXISTS public.update_book_availability();

-- Создаем функцию с безопасным search_path
CREATE OR REPLACE FUNCTION public.update_book_availability()
RETURNS TRIGGER
SET search_path = public  -- КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ БЕЗОПАСНОСТИ  
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    book_record RECORD;
    active_rentals INTEGER;
BEGIN
    -- При изменении статуса аренды пересчитываем доступность книги
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Получаем информацию о книге
        SELECT * INTO book_record FROM public.books WHERE id = NEW.book_id;
        
        -- Считаем активные аренды
        SELECT COUNT(*) INTO active_rentals 
        FROM public.rentals 
        WHERE book_id = NEW.book_id 
        AND status IN ('active', 'overdue');
        
        -- Обновляем доступность
        UPDATE public.books 
        SET 
            qty_available = GREATEST(0, qty_total - active_rentals),
            available = (qty_total - active_rentals) > 0,
            status = CASE 
                WHEN (qty_total - active_rentals) > 0 THEN 'available'
                ELSE 'issued'
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.book_id;
        
        RETURN NEW;
    END IF;
    
    -- При удалении аренды тоже пересчитываем
    IF TG_OP = 'DELETE' THEN
        SELECT * INTO book_record FROM public.books WHERE id = OLD.book_id;
        
        SELECT COUNT(*) INTO active_rentals 
        FROM public.rentals 
        WHERE book_id = OLD.book_id 
        AND status IN ('active', 'overdue')
        AND id != OLD.id; -- исключаем удаляемую запись
        
        UPDATE public.books 
        SET 
            qty_available = GREATEST(0, qty_total - active_rentals),
            available = (qty_total - active_rentals) > 0,
            status = CASE 
                WHEN (qty_total - active_rentals) > 0 THEN 'available'
                ELSE 'issued'
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.book_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$;

-- Пересоздаем триггер
CREATE TRIGGER trigger_update_book_availability
    AFTER INSERT OR UPDATE OR DELETE ON public.rentals
    FOR EACH ROW
    EXECUTE FUNCTION update_book_availability();

-- ============================================================================
-- 3. ДОПОЛНИТЕЛЬНЫЕ ИСПРАВЛЕНИЯ БЕЗОПАСНОСТИ
-- ============================================================================

-- Исправляем функцию get_search_suggestions если есть
DROP FUNCTION IF EXISTS public.get_search_suggestions(TEXT, INTEGER);

CREATE OR REPLACE FUNCTION public.get_search_suggestions(
    partial_query TEXT,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(suggestion TEXT, type TEXT, count BIGINT)
SET search_path = public  -- КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ БЕЗОПАСНОСТИ
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
-- РЕЗУЛЬТАТ
-- ============================================================================

-- Проверяем что все функции созданы правильно
SELECT 
    'Security fixes applied successfully with correct text search config!' as message,
    (
        SELECT COUNT(*) 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name IN ('search_books', 'update_book_availability', 'get_search_suggestions')
    ) as functions_fixed;

-- Уведомляем о завершении
NOTIFY ddl_command_end, 'Security warnings should now be resolved in Security Advisor!';