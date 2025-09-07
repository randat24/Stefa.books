-- ============================================================================
-- ПРОВЕРКА И ИСПРАВЛЕНИЕ СТРУКТУРЫ ТАБЛИЦЫ BOOKS
-- ============================================================================

-- 1. Проверяем существующие колонки
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'books' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Добавляем недостающие колонки (если их нет)

-- Добавляем age_range если не существует
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' 
        AND column_name = 'age_range'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.books ADD COLUMN age_range TEXT;
        RAISE NOTICE 'Добавлена колонка age_range';
    ELSE
        RAISE NOTICE 'Колонка age_range уже существует';
    END IF;
END $$;

-- Добавляем short_description если не существует
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' 
        AND column_name = 'short_description'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.books ADD COLUMN short_description TEXT;
        RAISE NOTICE 'Добавлена колонка short_description';
    ELSE
        RAISE NOTICE 'Колонка short_description уже существует';
    END IF;
END $$;

-- Добавляем qty_total если не существует
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' 
        AND column_name = 'qty_total'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.books ADD COLUMN qty_total INTEGER DEFAULT 1;
        RAISE NOTICE 'Добавлена колонка qty_total';
    ELSE
        RAISE NOTICE 'Колонка qty_total уже существует';
    END IF;
END $$;

-- Добавляем qty_available если не существует
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' 
        AND column_name = 'qty_available'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.books ADD COLUMN qty_available INTEGER DEFAULT 1;
        RAISE NOTICE 'Добавлена колонка qty_available';
    ELSE
        RAISE NOTICE 'Колонка qty_available уже существует';
    END IF;
END $$;

-- Добавляем price_uah если не существует
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' 
        AND column_name = 'price_uah'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.books ADD COLUMN price_uah DECIMAL(10,2);
        RAISE NOTICE 'Добавлена колонка price_uah';
    ELSE
        RAISE NOTICE 'Колонка price_uah уже существует';
    END IF;
END $$;

-- Добавляем location если не существует
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' 
        AND column_name = 'location'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.books ADD COLUMN location TEXT;
        RAISE NOTICE 'Добавлена колонка location';
    ELSE
        RAISE NOTICE 'Колонка location уже существует';
    END IF;
END $$;

-- 3. Проверяем обновленную структуру
SELECT 
    'Обновленная структура таблицы books:' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'books' 
AND table_schema = 'public'
ORDER BY ordinal_position;
