-- ============================================================================
-- ПРОВЕРКА ПОДКЛЮЧЕНИЯ К БАЗЕ ДАННЫХ И СТАТУСА САЙТА
-- ============================================================================

-- 1. Проверка подключения к базе данных
SELECT 
    'Подключение к базе данных' as check_type,
    current_database() as database_name,
    current_user as current_user,
    version() as postgresql_version,
    now() as current_time;

-- 2. Проверка существования основных таблиц
SELECT 
    'Проверка таблиц' as check_type,
    table_name,
    CASE 
        WHEN table_name IN ('books', 'categories', 'users', 'subscription_requests', 'rentals') 
        THEN '✅ Существует'
        ELSE '❌ Отсутствует'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('books', 'categories', 'users', 'subscription_requests', 'rentals')
ORDER BY table_name;

-- 3. Проверка структуры таблицы books
SELECT 
    'Структура таблицы books' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'books'
ORDER BY ordinal_position;

-- 4. Проверка данных в таблице books
SELECT 
    'Данные в таблице books' as check_type,
    COUNT(*) as total_books,
    COUNT(CASE WHEN title NOT LIKE 'Книга %' AND title NOT LIKE 'Book %' THEN 1 END) as books_with_real_titles,
    COUNT(CASE WHEN available = true THEN 1 END) as available_books,
    COUNT(CASE WHEN cover_url IS NOT NULL AND cover_url != '' THEN 1 END) as books_with_covers,
    COUNT(CASE WHEN category_id IS NOT NULL THEN 1 END) as books_with_categories
FROM public.books;

-- 5. Проверка данных в таблице categories
SELECT 
    'Данные в таблице categories' as check_type,
    COUNT(*) as total_categories,
    COUNT(CASE WHEN parent_id IS NULL THEN 1 END) as parent_categories,
    COUNT(CASE WHEN parent_id IS NOT NULL THEN 1 END) as subcategories
FROM public.categories;

-- 6. Проверка пользователей
SELECT 
    'Данные в таблице users' as check_type,
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
    COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users
FROM public.users;

-- 7. Проверка последних загруженных книг
SELECT 
    'Последние загруженные книги' as check_type,
    title,
    author,
    code,
    available,
    created_at
FROM public.books
ORDER BY created_at DESC
LIMIT 10;

-- 8. Проверка категорий с книгами
SELECT 
    'Категории с книгами' as check_type,
    c.name as category_name,
    COUNT(b.id) as books_count
FROM public.categories c
LEFT JOIN public.books b ON c.id = b.category_id
WHERE c.parent_id IS NOT NULL
GROUP BY c.name, c.display_order
ORDER BY c.display_order
LIMIT 10;

-- 9. Проверка ошибок в данных
SELECT 
    'Проверка ошибок в данных' as check_type,
    'Книги без названий' as error_type,
    COUNT(*) as error_count
FROM public.books
WHERE title IS NULL OR title = ''

UNION ALL

SELECT 
    'Проверка ошибок в данных' as check_type,
    'Книги без авторов' as error_type,
    COUNT(*) as error_count
FROM public.books
WHERE author IS NULL OR author = ''

UNION ALL

SELECT 
    'Проверка ошибок в данных' as check_type,
    'Книги с неправильными названиями' as error_type,
    COUNT(*) as error_count
FROM public.books
WHERE title LIKE 'Книга %' OR title LIKE 'Book %';

-- 10. Общая статистика для сайта
SELECT 
    'Общая статистика для сайта' as check_type,
    (SELECT COUNT(*) FROM public.books) as total_books,
    (SELECT COUNT(*) FROM public.books WHERE available = true) as available_books,
    (SELECT COUNT(*) FROM public.categories WHERE parent_id IS NOT NULL) as subcategories,
    (SELECT COUNT(*) FROM public.users) as total_users,
    (SELECT COUNT(*) FROM public.subscription_requests) as subscription_requests,
    (SELECT COUNT(*) FROM public.rentals) as total_rentals;
