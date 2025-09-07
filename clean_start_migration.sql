-- Начало с чистого листа - создание всех таблиц
-- Выполните этот скрипт в новом проекте Supabase

-- 1. Создаем таблицу categories
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

-- 2. Создаем таблицу books
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT,
    description TEXT,
    cover_url TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    available BOOLEAN DEFAULT true,
    code TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Создаем таблицу users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    subscription_type TEXT CHECK (subscription_type IN ('mini', 'maxi', 'premium')),
    subscription_start TIMESTAMPTZ,
    subscription_end TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Создаем таблицу rentals
CREATE TABLE IF NOT EXISTS public.rentals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    rental_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    return_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Создаем таблицу subscription_requests
CREATE TABLE IF NOT EXISTS public.subscription_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subscription_type TEXT NOT NULL CHECK (subscription_type IN ('mini', 'maxi', 'premium')),
    address TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Создаем индексы
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_available ON public.books(available);
CREATE INDEX IF NOT EXISTS idx_books_code ON public.books(code);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_rentals_user ON public.rentals(user_id);
CREATE INDEX IF NOT EXISTS idx_rentals_book ON public.rentals(book_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON public.rentals(status);

-- 7. Включаем RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_requests ENABLE ROW LEVEL SECURITY;

-- 8. Создаем политики RLS
-- Публичный доступ к книгам и категориям
DROP POLICY IF EXISTS "Public books access" ON public.books;
CREATE POLICY "Public books access" ON public.books FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public categories access" ON public.categories;
CREATE POLICY "Public categories access" ON public.categories FOR SELECT USING (true);

-- Пользователи могут видеть только свои данные
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Админы могут видеть все
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can manage books" ON public.books;
CREATE POLICY "Admins can manage books" ON public.books FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- 9. Создаем функцию для обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Создаем триггеры
DROP TRIGGER IF EXISTS update_books_updated_at ON public.books;
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_rentals_updated_at ON public.rentals;
CREATE TRIGGER update_rentals_updated_at BEFORE UPDATE ON public.rentals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Создаем правильную иерархию категорий
-- Сначала создаем родительские категории
INSERT INTO public.categories (id, name, description, display_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'За віком', 'Категорії за віком читача', 1),
('550e8400-e29b-41d4-a716-446655440002', 'За жанром', 'Категорії за жанром літератури', 2),
('550e8400-e29b-41d4-a716-446655440003', 'Для дорослих', 'Категорії для дорослих читачів', 3)
ON CONFLICT (name) DO NOTHING;

-- Затем создаем подкатегории
INSERT INTO public.categories (name, parent_id, description, display_order) VALUES
-- За віком
('Найменші', '550e8400-e29b-41d4-a716-446655440001', 'Книги для найменших дітей', 1),
('Дошкільний вік', '550e8400-e29b-41d4-a716-446655440001', 'Книги для дошкільнят', 2),
('Молодший вік', '550e8400-e29b-41d4-a716-446655440001', 'Книги для молодших школярів', 3),
('Середній вік', '550e8400-e29b-41d4-a716-446655440001', 'Книги для середніх школярів', 4),
('Підлітковий вік', '550e8400-e29b-41d4-a716-446655440001', 'Книги для підлітків', 5),

-- За жанром
('Казки', '550e8400-e29b-41d4-a716-446655440002', 'Казки та казкові історії', 1),
('Пізнавальні', '550e8400-e29b-41d4-a716-446655440002', 'Пізнавальні книги', 2),
('Детектив', '550e8400-e29b-41d4-a716-446655440002', 'Детективні історії', 3),
('Пригоди', '550e8400-e29b-41d4-a716-446655440002', 'Пригодницькі книги', 4),
('Повість', '550e8400-e29b-41d4-a716-446655440002', 'Повісті', 5),
('Фентезі', '550e8400-e29b-41d4-a716-446655440002', 'Фентезійна література', 6),
('Реалістична проза', '550e8400-e29b-41d4-a716-446655440002', 'Реалістична проза', 7),
('Романтика', '550e8400-e29b-41d4-a716-446655440002', 'Романтична література', 8),

-- Для дорослих
('Психологія і саморозвиток', '550e8400-e29b-41d4-a716-446655440003', 'Книги з психології та саморозвитку', 1),
('Сучасна проза', '550e8400-e29b-41d4-a716-446655440003', 'Сучасна проза', 2)
ON CONFLICT (name) DO NOTHING;

-- 12. Создаем администратора (если не существует)
INSERT INTO public.users (
    id,
    email,
    name,
    role,
    phone,
    subscription_type,
    status,
    notes,
    created_at,
    updated_at
) 
SELECT 
    gen_random_uuid(),
    'admin@stefa-books.com.ua',
    'Администратор',
    'admin',
    '+38 (063) 856-54-14',
    'premium',
    'active',
    'Главный администратор системы',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@stefa-books.com.ua');

-- 13. Проверяем результат
SELECT 
    'Таблицы созданы успешно!' as status,
    (SELECT COUNT(*) FROM public.categories) as categories_count,
    (SELECT COUNT(*) FROM public.books) as books_count,
    (SELECT COUNT(*) FROM public.users) as users_count,
    (SELECT COUNT(*) FROM public.users WHERE role = 'admin') as admins_count;
