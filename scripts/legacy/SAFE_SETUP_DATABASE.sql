-- ============================================================================
-- БЕЗОПАСНАЯ НАСТРОЙКА БАЗЫ ДАННЫХ STEFA.BOOKS
-- Этот скрипт можно запускать многократно без ошибок
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- 1. BOOKS TABLE - Основная таблица книг
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE, -- Код книги (DL-001)
    title TEXT NOT NULL, -- Название книги
    author TEXT NOT NULL, -- Автор
    category TEXT NOT NULL, -- Категория
    subcategory TEXT, -- Подкатегория
    description TEXT, -- Полное описание
    short_description TEXT, -- Краткое описание
    isbn TEXT, -- ISBN код
    pages INTEGER, -- Количество страниц
    age_range TEXT, -- Возрастная категория
    language TEXT DEFAULT 'uk', -- Язык книги
    publisher TEXT, -- Издательство
    publication_year INTEGER, -- Год издания
    cover_url TEXT, -- URL обложки в Cloudinary
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'issued', 'reserved', 'lost')), -- Статус книги
    available BOOLEAN NOT NULL DEFAULT true, -- Доступна ли книга
    qty_total INTEGER NOT NULL DEFAULT 1 CHECK (qty_total >= 0), -- Общее количество экземпляров
    qty_available INTEGER NOT NULL DEFAULT 1 CHECK (qty_available >= 0), -- Доступное количество
    price_uah DECIMAL(10,2), -- Цена закупки в гривнах
    location TEXT, -- Место хранения/выдачи
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5), -- Рейтинг книги
    rating_count INTEGER DEFAULT 0 CHECK (rating_count >= 0), -- Количество оценок
    badges TEXT[], -- Значки (новинка, популярная)
    tags TEXT[], -- Теги для поиска
    search_vector TSVECTOR, -- Поисковый вектор для полнотекстового поиска
    search_text TEXT, -- Объединенный текст для поиска
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы для быстрого поиска (с IF NOT EXISTS через DO блоки)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_books_code') THEN
        CREATE INDEX idx_books_code ON public.books (code);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_books_title') THEN
        CREATE INDEX idx_books_title ON public.books (title);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_books_author') THEN
        CREATE INDEX idx_books_author ON public.books (author);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_books_category') THEN
        CREATE INDEX idx_books_category ON public.books (category);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_books_status') THEN
        CREATE INDEX idx_books_status ON public.books (status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_books_available') THEN
        CREATE INDEX idx_books_available ON public.books (available);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_books_search_vector') THEN
        CREATE INDEX idx_books_search_vector ON public.books USING GIN (search_vector);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_books_search_text') THEN
        CREATE INDEX idx_books_search_text ON public.books USING GIN (search_text gin_trgm_ops);
    END IF;
END $$;

-- ============================================================================
-- 2. AUTHORS TABLE - Авторы книг
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    biography TEXT,
    birth_year INTEGER,
    nationality TEXT,
    website TEXT,
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. CATEGORIES TABLE - Категории книг
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    icon TEXT,
    color TEXT,
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. BOOK_AUTHORS TABLE - Связь книг и авторов
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.book_authors (
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.authors(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'author' CHECK (role IN ('author', 'illustrator', 'translator', 'editor')),
    PRIMARY KEY (book_id, author_id, role)
);

-- ============================================================================
-- 5. USERS TABLE - Пользователи системы
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    subscription_type TEXT CHECK (subscription_type IN ('Mini', 'Maxi', 'Premium')),
    subscription_start TIMESTAMPTZ,
    subscription_end TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. RENTALS TABLE - Аренда книг
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rentals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE RESTRICT,
    rental_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    return_date TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue', 'lost')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. PAYMENTS TABLE - Платежи
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    amount_uah DECIMAL(10,2) NOT NULL CHECK (amount_uah > 0),
    currency TEXT DEFAULT 'UAH',
    payment_method TEXT CHECK (payment_method IN ('card', 'cash', 'transfer', 'online')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id TEXT,
    payment_date TIMESTAMPTZ,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. SEARCH_QUERIES TABLE - Аналитика поисковых запросов
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.search_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    search_time_ms DECIMAL(10,3),
    user_agent TEXT,
    ip_address INET,
    filters JSONB,
    clicked_results UUID[], -- Array of book IDs that were clicked
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - Политики безопасности
-- ============================================================================

-- Политики для публичного чтения книг, авторов, категорий
DO $$
BEGIN
    -- Books policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'books_select_policy' AND tablename = 'books') THEN
        CREATE POLICY books_select_policy ON public.books FOR SELECT TO public USING (true);
    END IF;
    
    -- Authors policies  
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'authors_select_policy' AND tablename = 'authors') THEN
        CREATE POLICY authors_select_policy ON public.authors FOR SELECT TO public USING (true);
    END IF;
    
    -- Categories policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'categories_select_policy' AND tablename = 'categories') THEN
        CREATE POLICY categories_select_policy ON public.categories FOR SELECT TO public USING (true);
    END IF;
    
    -- Book_authors policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'book_authors_select_policy' AND tablename = 'book_authors') THEN
        CREATE POLICY book_authors_select_policy ON public.book_authors FOR SELECT TO public USING (true);
    END IF;
    
    -- Search_queries policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'search_queries_insert_policy' AND tablename = 'search_queries') THEN
        CREATE POLICY search_queries_insert_policy ON public.search_queries FOR INSERT TO public WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'search_queries_select_policy' AND tablename = 'search_queries') THEN
        CREATE POLICY search_queries_select_policy ON public.search_queries FOR SELECT TO public USING (true);
    END IF;
END $$;

-- ============================================================================
-- TRIGGERS - Автоматическое обновление updated_at
-- ============================================================================

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Безопасное создание триггеров
DO $$
BEGIN
    -- Триггер для books
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_books_updated_at') THEN
        CREATE TRIGGER update_books_updated_at
            BEFORE UPDATE ON public.books
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Триггер для users  
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON public.users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Триггер для rentals
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_rentals_updated_at') THEN
        CREATE TRIGGER update_rentals_updated_at
            BEFORE UPDATE ON public.rentals
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Триггер для payments
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_payments_updated_at') THEN
        CREATE TRIGGER update_payments_updated_at
            BEFORE UPDATE ON public.payments
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ============================================================================
-- SEARCH FUNCTIONS - Функции поиска (с безопасным search_path)
-- ============================================================================

-- Функция поиска книг
CREATE OR REPLACE FUNCTION public.search_books(
    query_text TEXT,
    category_filter TEXT[] DEFAULT NULL,
    author_filter TEXT[] DEFAULT NULL,
    available_only BOOLEAN DEFAULT false,
    limit_count INTEGER DEFAULT 50,
    sort_by TEXT DEFAULT 'relevance'
)
RETURNS TABLE(
    id UUID,
    code TEXT,
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
    clean_query := TRIM(COALESCE(query_text, ''));
    
    -- Базовый поиск
    IF clean_query = '' THEN
        RETURN QUERY
        SELECT 
            b.id, b.code, b.title, b.author, b.category, b.subcategory,
            b.cover_url, b.rating, b.rating_count, b.available, b.badges,
            COALESCE(b.rating, 0)::REAL as rank
        FROM public.books b
        WHERE (NOT available_only OR b.available = true)
          AND (category_filter IS NULL OR b.category = ANY(category_filter))
          AND (author_filter IS NULL OR b.author = ANY(author_filter))
        ORDER BY 
            CASE sort_by 
                WHEN 'title' THEN b.title
                WHEN 'author' THEN b.author
                ELSE NULL
            END ASC,
            CASE sort_by
                WHEN 'rating' THEN b.rating
                WHEN 'newest' THEN EXTRACT(EPOCH FROM b.created_at)
                ELSE b.rating
            END DESC NULLS LAST
        LIMIT limit_count;
        RETURN;
    END IF;
    
    -- Поиск с запросом
    RETURN QUERY
    SELECT 
        b.id, b.code, b.title, b.author, b.category, b.subcategory,
        b.cover_url, b.rating, b.rating_count, b.available, b.badges,
        (ts_rank_cd(b.search_vector, plainto_tsquery('ukrainian', clean_query)) * 100)::REAL as rank
    FROM public.books b
    WHERE (
        b.search_vector @@ plainto_tsquery('ukrainian', clean_query)
        OR b.title ILIKE '%' || clean_query || '%'
        OR b.author ILIKE '%' || clean_query || '%'
        OR b.category ILIKE '%' || clean_query || '%'
    )
    AND (NOT available_only OR b.available = true)
    AND (category_filter IS NULL OR b.category = ANY(category_filter))
    AND (author_filter IS NULL OR b.author = ANY(author_filter))
    ORDER BY rank DESC, b.rating DESC NULLS LAST
    LIMIT limit_count;
END;
$$;

-- Функция для получения предложений поиска
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
    clean_query := TRIM(LOWER(COALESCE(partial_query, '')));
    
    IF clean_query = '' THEN
        RETURN;
    END IF;
    
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

-- Функция обновления доступности книг при изменении аренды
CREATE OR REPLACE FUNCTION public.update_book_availability()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    book_record RECORD;
    active_rentals INTEGER;
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        SELECT * INTO book_record FROM public.books WHERE id = NEW.book_id;
        
        SELECT COUNT(*) INTO active_rentals 
        FROM public.rentals 
        WHERE book_id = NEW.book_id 
        AND status IN ('active', 'overdue');
        
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
    
    IF TG_OP = 'DELETE' THEN
        SELECT * INTO book_record FROM public.books WHERE id = OLD.book_id;
        
        SELECT COUNT(*) INTO active_rentals 
        FROM public.rentals 
        WHERE book_id = OLD.book_id 
        AND status IN ('active', 'overdue')
        AND id != OLD.id;
        
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

-- Триггер для автоматического обновления доступности книг
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_book_availability') THEN
        CREATE TRIGGER trigger_update_book_availability
            AFTER INSERT OR UPDATE OR DELETE ON public.rentals
            FOR EACH ROW
            EXECUTE FUNCTION update_book_availability();
    END IF;
END $$;

-- ============================================================================
-- РЕЗУЛЬТАТ
-- ============================================================================

SELECT 
    'Database setup completed successfully! All tables, indexes, triggers, and functions are ready.' as message,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('books', 'authors', 'categories', 'users', 'rentals', 'payments', 'search_queries', 'book_authors')) as tables_created;