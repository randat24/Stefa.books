-- ============================================================================
-- ПРОВЕРКА СТРУКТУРЫ ТАБЛИЦЫ CATEGORIES
-- ============================================================================

-- 1. Показываем все существующие колонки в таблице categories
SELECT 
    'Все колонки в таблице categories:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Проверяем существование основных колонок
SELECT 
    'Проверка основных колонок:' as info,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'id' AND table_schema = 'public'
    ) THEN 'id: ЕСТЬ' ELSE 'id: НЕТ' END as id_column,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'name' AND table_schema = 'public'
    ) THEN 'name: ЕСТЬ' ELSE 'name: НЕТ' END as name_column,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'parent_id' AND table_schema = 'public'
    ) THEN 'parent_id: ЕСТЬ' ELSE 'parent_id: НЕТ' END as parent_id_column,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'is_active' AND table_schema = 'public'
    ) THEN 'is_active: ЕСТЬ' ELSE 'is_active: НЕТ' END as is_active_column,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'sort_order' AND table_schema = 'public'
    ) THEN 'sort_order: ЕСТЬ' ELSE 'sort_order: НЕТ' END as sort_order_column,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'display_order' AND table_schema = 'public'
    ) THEN 'display_order: ЕСТЬ' ELSE 'display_order: НЕТ' END as display_order_column;

-- 3. Показываем пример данных из таблицы categories
SELECT 
    'Пример данных из таблицы categories:' as info,
    id,
    name,
    parent_id,
    created_at
FROM public.categories
LIMIT 5;

-- 4. Показываем подкатегории (где parent_id IS NOT NULL)
SELECT 
    'Подкатегории:' as info,
    c.name as subcategory,
    pc.name as parent_category
FROM public.categories c
LEFT JOIN public.categories pc ON c.parent_id = pc.id
WHERE c.parent_id IS NOT NULL
LIMIT 10;
