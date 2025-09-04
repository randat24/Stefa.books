-- ============================================================================
-- SUPABASE DATABASE SETUP FOR STEFA.BOOKS
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

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_books_code ON public.books (code);
CREATE INDEX IF NOT EXISTS idx_books_title ON public.books (title);
CREATE INDEX IF NOT EXISTS idx_books_author ON public.books (author);
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books (category);
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books (status);
CREATE INDEX IF NOT EXISTS idx_books_available ON public.books (available);
CREATE INDEX IF NOT EXISTS idx_books_search_vector ON public.books USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_books_search_text ON public.books USING GIN (search_text gin_trgm_ops);

-- ============================================================================
-- 2. AUTHORS TABLE - Авторы книг
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- Имя автора
    biography TEXT, -- Биография
    birth_year INTEGER, -- Год рождения
    nationality TEXT, -- Национальность
    website TEXT, -- Веб-сайт
    search_vector TSVECTOR, -- Поисковый вектор
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_authors_name ON public.authors (name);
CREATE INDEX IF NOT EXISTS idx_authors_search_vector ON public.authors USING GIN (search_vector);

-- ============================================================================
-- 3. CATEGORIES TABLE - Категории книг
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- Название категории
    parent_id UUID REFERENCES public.categories(id), -- Родительская категория
    description TEXT, -- Описание категории
    display_order INTEGER DEFAULT 0, -- Порядок отображения
    icon TEXT, -- Иконка категории
    color TEXT, -- Цвет для отображения
    search_vector TSVECTOR, -- Поисковый вектор
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories (name);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories (parent_id);

-- ============================================================================
-- 4. USERS TABLE - Пользователи системы
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- Полное имя пользователя
    email TEXT NOT NULL UNIQUE, -- Email адрес
    phone TEXT, -- Номер телефона
    subscription_type TEXT NOT NULL CHECK (subscription_type IN ('mini', 'maxi', 'premium')), -- Тип подписки
    subscription_start TIMESTAMPTZ, -- Начало подписки
    subscription_end TIMESTAMPTZ, -- Конец подписки
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')), -- Статус пользователя
    address TEXT, -- Адрес доставки
    pickup_location TEXT, -- Предпочитаемое место выдачи
    notes TEXT, -- Заметки администратора
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users (phone);
CREATE INDEX IF NOT EXISTS idx_users_subscription_type ON public.users (subscription_type);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users (status);

-- ============================================================================
-- 5. RENTALS TABLE - Аренда книг
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rentals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- Пользователь
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE, -- Книга
    rental_date TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Дата выдачи
    due_date TIMESTAMPTZ NOT NULL, -- Срок возврата
    return_date TIMESTAMPTZ, -- Дата фактического возврата
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'overdue', 'returned', 'lost')), -- Статус аренды
    pickup_location TEXT, -- Место выдачи
    return_location TEXT, -- Место возврата
    notes TEXT, -- Заметки
    late_fee_uah DECIMAL(10,2) DEFAULT 0, -- Штраф за просрочку
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rentals_user_id ON public.rentals (user_id);
CREATE INDEX IF NOT EXISTS idx_rentals_book_id ON public.rentals (book_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON public.rentals (status);
CREATE INDEX IF NOT EXISTS idx_rentals_due_date ON public.rentals (due_date);
CREATE INDEX IF NOT EXISTS idx_rentals_rental_date ON public.rentals (rental_date);

-- ============================================================================
-- 6. PAYMENTS TABLE - Платежи
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- Пользователь
    rental_id UUID REFERENCES public.rentals(id) ON DELETE SET NULL, -- Связанная аренда (если есть)
    amount_uah DECIMAL(10,2) NOT NULL, -- Сумма в гривнах
    currency TEXT NOT NULL DEFAULT 'UAH', -- Валюта
    payment_method TEXT NOT NULL CHECK (payment_method IN ('monobank', 'online', 'cash')), -- Способ оплаты
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')), -- Статус платежа
    transaction_id TEXT, -- ID транзакции в платежной системе
    payment_date TIMESTAMPTZ, -- Дата оплаты
    description TEXT, -- Описание платежа
    receipt_url TEXT, -- URL чека
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_rental_id ON public.payments (rental_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON public.payments (payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON public.payments (payment_date);

-- ============================================================================
-- 7. SEARCH_QUERIES TABLE - История поисковых запросов
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.search_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query TEXT NOT NULL, -- Поисковый запрос
    results_count INTEGER, -- Количество результатов
    search_time_ms DECIMAL(10,2), -- Время выполнения поиска
    user_agent TEXT, -- User agent браузера
    ip_address INET, -- IP адрес пользователя
    filters JSONB, -- Использованные фильтры
    clicked_results UUID[], -- ID книг, на которые кликнули
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_queries_query ON public.search_queries (query);
CREATE INDEX IF NOT EXISTS idx_search_queries_created_at ON public.search_queries (created_at);

-- ============================================================================
-- 8. BOOK_AUTHORS TABLE - Связь книг и авторов (многие ко многим)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.book_authors (
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.authors(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'author', -- Роль (автор, иллюстратор, переводчик)
    PRIMARY KEY (book_id, author_id)
);

CREATE INDEX IF NOT EXISTS idx_book_authors_book_id ON public.book_authors (book_id);
CREATE INDEX IF NOT EXISTS idx_book_authors_author_id ON public.book_authors (author_id);

-- ============================================================================
-- 9. TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rentals_updated_at BEFORE UPDATE ON public.rentals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. AUTOMATIC SEARCH VECTOR UPDATES
-- ============================================================================

-- Функция для обновления поискового вектора книг
CREATE OR REPLACE FUNCTION update_books_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_text := COALESCE(NEW.title, '') || ' ' || 
                       COALESCE(NEW.author, '') || ' ' || 
                       COALESCE(NEW.category, '') || ' ' ||
                       COALESCE(NEW.description, '') || ' ' ||
                       COALESCE(NEW.short_description, '');
    
    NEW.search_vector := to_tsvector('ukrainian', NEW.search_text);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления search_vector
CREATE TRIGGER update_books_search_vector_trigger BEFORE INSERT OR UPDATE ON public.books
    FOR EACH ROW EXECUTE FUNCTION update_books_search_vector();

-- ============================================================================
-- 11. AUTOMATIC BOOK AVAILABILITY MANAGEMENT
-- ============================================================================

-- Функция для обновления доступности книг
CREATE OR REPLACE FUNCTION update_book_availability()
RETURNS TRIGGER AS $$
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
    
    -- Подсчитываем активные аренды
    SELECT COUNT(*) INTO active_rentals 
    FROM public.rentals 
    WHERE book_id = book_record.id AND status IN ('active', 'overdue');
    
    -- Обновляем доступность
    UPDATE public.books 
    SET 
        qty_available = GREATEST(0, book_record.qty_total - active_rentals),
        available = CASE 
            WHEN (book_record.qty_total - active_rentals) > 0 THEN true 
            ELSE false 
        END,
        updated_at = NOW()
    WHERE id = book_record.id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления доступности книг
CREATE TRIGGER update_book_availability_on_rental_change 
    AFTER INSERT OR UPDATE OR DELETE ON public.rentals
    FOR EACH ROW EXECUTE FUNCTION update_book_availability();

-- ============================================================================
-- 12. RLS (Row Level Security) POLICIES
-- ============================================================================

-- Включаем RLS для всех таблиц
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_authors ENABLE ROW LEVEL SECURITY;

-- Политики для публичного чтения каталога
CREATE POLICY "Allow public read access to books" ON public.books
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to authors" ON public.authors
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to categories" ON public.categories
    FOR SELECT USING (true);

-- Политики для админов (будут заменены на реальные после настройки аутентификации)
CREATE POLICY "Allow admin full access to books" ON public.books
    FOR ALL USING (true);

CREATE POLICY "Allow admin full access to users" ON public.users
    FOR ALL USING (true);

CREATE POLICY "Allow admin full access to rentals" ON public.rentals
    FOR ALL USING (true);

CREATE POLICY "Allow admin full access to payments" ON public.payments
    FOR ALL USING (true);

-- ============================================================================
-- 13. HELPER FUNCTIONS FOR SEARCH
-- ============================================================================

-- Функция для полнотекстового поиска книг
CREATE OR REPLACE FUNCTION search_books(
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
) AS $$
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
        CASE 
            WHEN query_text IS NULL OR query_text = '' THEN 0
            ELSE ts_rank(b.search_vector, plainto_tsquery('ukrainian', query_text))
        END as relevance_score
    FROM public.books b
    WHERE 
        (query_text IS NULL OR query_text = '' OR b.search_vector @@ plainto_tsquery('ukrainian', query_text))
        AND (category_filter IS NULL OR b.category = ANY(category_filter))
        AND (author_filter IS NULL OR b.author = ANY(author_filter))
        AND (NOT available_only OR b.available = true)
    ORDER BY 
        CASE 
            WHEN query_text IS NULL OR query_text = '' THEN b.rating
            ELSE ts_rank(b.search_vector, plainto_tsquery('ukrainian', query_text))
        END DESC,
        b.title ASC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения подсказок поиска
CREATE OR REPLACE FUNCTION get_search_suggestions(
    partial_query TEXT,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(
    suggestion TEXT,
    type TEXT,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    (
        SELECT DISTINCT b.title as suggestion, 'title'::TEXT as type, COUNT(*) OVER() as count
        FROM public.books b
        WHERE b.title ILIKE partial_query || '%'
        LIMIT limit_count / 3
    )
    UNION ALL
    (
        SELECT DISTINCT b.author as suggestion, 'author'::TEXT as type, COUNT(*) OVER() as count
        FROM public.books b  
        WHERE b.author ILIKE partial_query || '%'
        LIMIT limit_count / 3
    )
    UNION ALL
    (
        SELECT DISTINCT b.category as suggestion, 'category'::TEXT as type, COUNT(*) OVER() as count
        FROM public.books b
        WHERE b.category ILIKE partial_query || '%'
        LIMIT limit_count / 3
    )
    ORDER BY type, suggestion
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DATABASE SETUP COMPLETE
-- ============================================================================

-- Создаем комментарии к таблицам для документации
COMMENT ON TABLE public.books IS 'Основная таблица книг в библиотеке';
COMMENT ON TABLE public.authors IS 'Авторы книг';
COMMENT ON TABLE public.categories IS 'Категории и подкатегории книг';
COMMENT ON TABLE public.users IS 'Пользователи системы с подписками';
COMMENT ON TABLE public.rentals IS 'История аренды книг';
COMMENT ON TABLE public.payments IS 'Платежи пользователей';
COMMENT ON TABLE public.search_queries IS 'Аналитика поисковых запросов';
COMMENT ON TABLE public.book_authors IS 'Связь книг и авторов (многие ко многим)';

NOTIFY ddl_command_end, 'Stefa.books database setup completed successfully!';