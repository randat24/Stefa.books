-- Тестовый скрипт для проверки миграции
-- Выполните этот скрипт для проверки

-- 1. Проверяем таблицы
SELECT 
    'Таблицы созданы' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('categories', 'books', 'users', 'rentals', 'subscription_requests')) as tables_count;

-- 2. Проверяем категории
SELECT 
    'Категории созданы' as status,
    (SELECT COUNT(*) FROM public.categories) as total_categories,
    (SELECT COUNT(*) FROM public.categories WHERE parent_id IS NULL) as parent_categories,
    (SELECT COUNT(*) FROM public.categories WHERE parent_id IS NOT NULL) as subcategories;

-- 3. Показываем структуру категорий
SELECT 
    pc.name as parent_category,
    c.name as subcategory,
    c.display_order
FROM public.categories c
LEFT JOIN public.categories pc ON c.parent_id = pc.id
ORDER BY pc.display_order, c.display_order;

-- 4. Проверяем пользователей
SELECT 
    'Пользователи созданы' as status,
    (SELECT COUNT(*) FROM public.users) as total_users,
    (SELECT COUNT(*) FROM public.users WHERE role = 'admin') as admin_users;

-- 5. Проверяем RLS
SELECT 
    'RLS включен' as status,
    (SELECT COUNT(*) FROM pg_tables WHERE tablename IN ('categories', 'books', 'users', 'rentals', 'subscription_requests') AND rowsecurity = true) as tables_with_rls;

-- 6. Проверяем функции
SELECT 
    'Функции созданы' as status,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'update_updated_at_column') as update_function_exists;
