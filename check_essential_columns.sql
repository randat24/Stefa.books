-- ============================================================================
-- ПРОВЕРКА ОСНОВНЫХ КОЛОНОК ТАБЛИЦЫ BOOKS
-- ============================================================================

-- 1. Показываем все существующие колонки
SELECT 
    'Все колонки в таблице books:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'books' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Проверяем существование основных колонок
SELECT 
    'Проверка основных колонок:' as info,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'title' AND table_schema = 'public'
    ) THEN 'title: ЕСТЬ' ELSE 'title: НЕТ' END as title_column,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'author' AND table_schema = 'public'
    ) THEN 'author: ЕСТЬ' ELSE 'author: НЕТ' END as author_column,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'isbn' AND table_schema = 'public'
    ) THEN 'isbn: ЕСТЬ' ELSE 'isbn: НЕТ' END as isbn_column,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'description' AND table_schema = 'public'
    ) THEN 'description: ЕСТЬ' ELSE 'description: НЕТ' END as description_column,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'cover_url' AND table_schema = 'public'
    ) THEN 'cover_url: ЕСТЬ' ELSE 'cover_url: НЕТ' END as cover_url_column,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'category_id' AND table_schema = 'public'
    ) THEN 'category_id: ЕСТЬ' ELSE 'category_id: НЕТ' END as category_id_column,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'available' AND table_schema = 'public'
    ) THEN 'available: ЕСТЬ' ELSE 'available: НЕТ' END as available_column,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'code' AND table_schema = 'public'
    ) THEN 'code: ЕСТЬ' ELSE 'code: НЕТ' END as code_column;

-- 3. Показываем пример данных
SELECT 
    'Пример данных из таблицы books:' as info,
    title,
    author,
    code,
    isbn,
    available
FROM public.books
LIMIT 3;
