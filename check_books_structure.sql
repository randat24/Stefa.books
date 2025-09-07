-- ============================================================================
-- ПРОВЕРКА СТРУКТУРЫ ТАБЛИЦЫ BOOKS
-- ============================================================================

-- 1. Показываем все существующие колонки в таблице books
SELECT 
    'Структура таблицы books:' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'books' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Проверяем существование конкретных колонок
SELECT 
    'Проверка колонок:' as info,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'pages' AND table_schema = 'public'
    ) THEN 'pages: ЕСТЬ' ELSE 'pages: НЕТ' END as pages_column,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'age_range' AND table_schema = 'public'
    ) THEN 'age_range: ЕСТЬ' ELSE 'age_range: НЕТ' END as age_range_column,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'short_description' AND table_schema = 'public'
    ) THEN 'short_description: ЕСТЬ' ELSE 'short_description: НЕТ' END as short_description_column,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'qty_total' AND table_schema = 'public'
    ) THEN 'qty_total: ЕСТЬ' ELSE 'qty_total: НЕТ' END as qty_total_column,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'qty_available' AND table_schema = 'public'
    ) THEN 'qty_available: ЕСТЬ' ELSE 'qty_available: НЕТ' END as qty_available_column,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'price_uah' AND table_schema = 'public'
    ) THEN 'price_uah: ЕСТЬ' ELSE 'price_uah: НЕТ' END as price_uah_column,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'location' AND table_schema = 'public'
    ) THEN 'location: ЕСТЬ' ELSE 'location: НЕТ' END as location_column;

-- 3. Показываем пример данных из таблицы books
SELECT 
    'Пример данных из таблицы books:' as info,
    title,
    author,
    code,
    isbn,
    available,
    created_at
FROM public.books
LIMIT 3;
