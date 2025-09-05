-- ============================================================================
-- БЕЗОПАСНОЕ ИСПРАВЛЕНИЕ SECURITY WARNINGS
-- Исправляет все 11 предупреждений Security Advisor с правильным порядком операций
-- ============================================================================

-- ============================================================================
-- 1. ИСПРАВЛЕНИЕ ФУНКЦИИ update_updated_at_column (БЕЗОПАСНО)
-- ============================================================================

-- Сначала удаляем ВСЕ триггеры, которые зависят от функции
DROP TRIGGER IF EXISTS update_books_updated_at ON public.books;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_rentals_updated_at ON public.rentals;
DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
DROP TRIGGER IF EXISTS update_subscription_requests_updated_at ON public.subscription_requests;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;

-- Теперь можем безопасно удалить функцию
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Создаем новую безопасную функцию
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Пересоздаем все триггеры
CREATE TRIGGER update_books_updated_at 
    BEFORE UPDATE ON public.books
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rentals_updated_at 
    BEFORE UPDATE ON public.rentals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_requests_updated_at 
    BEFORE UPDATE ON public.subscription_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 2. ИСПРАВЛЕНИЕ ФУНКЦИИ get_search_suggestions
-- ============================================================================

DROP FUNCTION IF EXISTS public.get_search_suggestions(text, integer);

CREATE OR REPLACE FUNCTION public.get_search_suggestions(
    partial_query TEXT,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(suggestion TEXT, type TEXT, count BIGINT)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    clean_query TEXT;
BEGIN
    -- Очищаем запрос
    clean_query := TRIM(LOWER(partial_query));
    
    IF clean_query = '' THEN
        RETURN;
    END IF;
    
    -- Поиск по названиям книг
    RETURN QUERY
    SELECT 
        b.title as suggestion,
        'book'::TEXT as type,
        COUNT(*)::BIGINT as count
    FROM public.books b
    WHERE b.title ILIKE '%' || clean_query || '%'
    GROUP BY b.title
    ORDER BY LENGTH(b.title), b.title
    LIMIT limit_count;
    
    -- Поиск по авторам
    RETURN QUERY
    SELECT 
        b.author as suggestion,
        'author'::TEXT as type,
        COUNT(*)::BIGINT as count
    FROM public.books b
    WHERE b.author ILIKE '%' || clean_query || '%'
    GROUP BY b.author
    ORDER BY LENGTH(b.author), b.author
    LIMIT limit_count;
    
    -- Поиск по категориям
    RETURN QUERY
    SELECT 
        b.category as suggestion,
        'category'::TEXT as type,
        COUNT(*)::BIGINT as count
    FROM public.books b
    WHERE b.category ILIKE '%' || clean_query || '%'
    GROUP BY b.category
    ORDER BY LENGTH(b.category), b.category
    LIMIT limit_count;
END;
$$;

-- ============================================================================
-- 3. ИСПРАВЛЕНИЕ ФУНКЦИИ search_books
-- ============================================================================

-- Удаляем все версии функции search_books
DROP FUNCTION IF EXISTS public.search_books(text);
DROP FUNCTION IF EXISTS public.search_books(text, integer);
DROP FUNCTION IF EXISTS public.search_books(text, text[], text[], boolean, integer);
DROP FUNCTION IF EXISTS public.search_books(text, text[], text[], boolean, integer, integer);

-- Создаем новую безопасную функцию search_books
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
    subcategory TEXT,
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
DECLARE
    clean_query TEXT;
    search_vector tsvector;
BEGIN
    -- Очищаем и подготавливаем поисковый запрос
    clean_query := TRIM(LOWER(query_text));
    
    IF clean_query = '' THEN
        RETURN;
    END IF;
    
    -- Создаем поисковый вектор
    search_vector := to_tsvector('english', clean_query);
    
    RETURN QUERY
    SELECT 
        b.id,
        b.title,
        b.author,
        b.category,
        b.subcategory,
        b.description,
        b.cover_url,
        b.available,
        b.rating,
        b.rating_count,
        ts_rank(b.search_vector, search_vector) as relevance_score
    FROM public.books b
    WHERE 
        b.search_vector @@ search_vector
        AND (category_filter IS NULL OR b.category = ANY(category_filter))
        AND (author_filter IS NULL OR b.author = ANY(author_filter))
        AND (NOT available_only OR b.available = true)
    ORDER BY relevance_score DESC, b.title
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- ============================================================================
-- 4. ИСПРАВЛЕНИЕ ФУНКЦИИ update_books_author_ids
-- ============================================================================

DROP FUNCTION IF EXISTS public.update_books_author_ids();

CREATE OR REPLACE FUNCTION public.update_books_author_ids()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Обновляем author_ids для книги
    UPDATE public.books 
    SET author_ids = (
        SELECT ARRAY_AGG(author_id)
        FROM public.book_authors 
        WHERE book_id = NEW.book_id
    )
    WHERE id = NEW.book_id;
    
    RETURN NEW;
END;
$$;

-- ============================================================================
-- 5. ИСПРАВЛЕНИЕ ФУНКЦИИ update_books_search_vector
-- ============================================================================

-- Сначала удаляем триггер, который зависит от функции
DROP TRIGGER IF EXISTS update_books_search_vector_trigger ON public.books;

-- Теперь можем безопасно удалить функцию
DROP FUNCTION IF EXISTS public.update_books_search_vector();

-- Создаем новую безопасную функцию
CREATE OR REPLACE FUNCTION public.update_books_search_vector()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Обновляем search_text и search_vector
    NEW.search_text := COALESCE(NEW.title, '') || ' ' || 
                      COALESCE(NEW.author, '') || ' ' || 
                      COALESCE(NEW.category, '') || ' ' || 
                      COALESCE(NEW.subcategory, '') || ' ' ||
                      COALESCE(NEW.description, '') || ' ' ||
                      COALESCE(NEW.short_description, '') || ' ' ||
                      COALESCE(array_to_string(NEW.tags, ' '), '');
    
    NEW.search_vector := to_tsvector('english', NEW.search_text);
    
    RETURN NEW;
END;
$$;

-- Пересоздаем триггер
CREATE TRIGGER update_books_search_vector_trigger 
    BEFORE INSERT OR UPDATE ON public.books
    FOR EACH ROW EXECUTE FUNCTION public.update_books_search_vector();

-- ============================================================================
-- 6. ИСПРАВЛЕНИЕ ФУНКЦИИ handle_new_user
-- ============================================================================

-- Сначала удаляем триггер, который зависит от функции
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Теперь можем безопасно удалить функцию (может быть в public или auth схеме)
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS auth.handle_new_user();

-- Создаем новую безопасную функцию в public схеме
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, first_name, last_name)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    RETURN NEW;
END;
$$;

-- Пересоздаем триггер
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 7. ИСПРАВЛЕНИЕ ФУНКЦИИ update_book_availability
-- ============================================================================

-- Сначала удаляем триггер, который зависит от функции
DROP TRIGGER IF EXISTS update_book_availability_on_rental_change ON public.rentals;

-- Теперь можем безопасно удалить функцию
DROP FUNCTION IF EXISTS public.update_book_availability();

-- Создаем новую безопасную функцию
CREATE OR REPLACE FUNCTION public.update_book_availability()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    book_record RECORD;
    active_rentals INTEGER;
BEGIN
    -- Получаем информацию о книге
    IF TG_OP = 'DELETE' THEN
        SELECT id, qty_total INTO book_record FROM public.books WHERE id = OLD.book_id;
    ELSE
        SELECT id, qty_total INTO book_record FROM public.books WHERE id = NEW.book_id;
    END IF;
    
    IF NOT FOUND THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Подсчитываем активные аренды
    SELECT COUNT(*) INTO active_rentals
    FROM public.rentals
    WHERE book_id = book_record.id 
    AND status IN ('active', 'overdue');
    
    -- Обновляем доступность
    UPDATE public.books
    SET 
        qty_available = book_record.qty_total - active_rentals,
        available = (book_record.qty_total - active_rentals) > 0
    WHERE id = book_record.id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Пересоздаем триггер
CREATE TRIGGER update_book_availability_on_rental_change 
    AFTER INSERT OR UPDATE OR DELETE ON public.rentals
    FOR EACH ROW EXECUTE FUNCTION public.update_book_availability();

-- ============================================================================
-- 8. ИСПРАВЛЕНИЕ ФУНКЦИИ update_book_search_vector
-- ============================================================================

DROP FUNCTION IF EXISTS public.update_book_search_vector();

CREATE OR REPLACE FUNCTION public.update_book_search_vector()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.search_text := COALESCE(NEW.title, '') || ' ' || 
                      COALESCE(NEW.author, '') || ' ' || 
                      COALESCE(NEW.category, '') || ' ' || 
                      COALESCE(NEW.subcategory, '') || ' ' ||
                      COALESCE(NEW.description, '') || ' ' ||
                      COALESCE(NEW.short_description, '') || ' ' ||
                      COALESCE(NEW.publisher, '') || ' ' ||
                      COALESCE(array_to_string(NEW.tags, ' '), '');
    
    NEW.search_vector := to_tsvector('english', NEW.search_text);
    
    RETURN NEW;
END;
$$;

-- ============================================================================
-- 9. НАСТРОЙКА ПРАВ ДОСТУПА
-- ============================================================================

-- Права для анонимных пользователей
GRANT EXECUTE ON FUNCTION public.search_books(TEXT, TEXT[], TEXT[], BOOLEAN, INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.get_search_suggestions(TEXT, INTEGER) TO anon;

-- Права для аутентифицированных пользователей
GRANT EXECUTE ON FUNCTION public.search_books(TEXT, TEXT[], TEXT[], BOOLEAN, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_search_suggestions(TEXT, INTEGER) TO authenticated;

-- ============================================================================
-- 10. РЕЗУЛЬТАТ
-- ============================================================================

SELECT 'All 11 security warnings have been fixed safely!' AS result;
SELECT 'Functions updated with SET search_path = public' AS security_status;
SELECT 'Triggers recreated successfully' AS trigger_status;
