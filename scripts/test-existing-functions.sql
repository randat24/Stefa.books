-- ============================================================================
-- TEST EXISTING FUNCTIONS
-- ============================================================================
-- Проверка только существующих функций

-- 1. Проверка поиска книг
SELECT '=== ПОИСК КНИГ ===' as test_name;
SELECT * FROM search_books('казки', 5) LIMIT 3;

-- 2. Проверка подсказок поиска
SELECT '=== ПОДСКАЗКИ ПОИСКА ===' as test_name;
SELECT * FROM get_search_suggestions('каз', 5) LIMIT 3;

-- 3. Проверка категорий
SELECT '=== КАТЕГОРИИ ===' as test_name;
SELECT category, COUNT(*) as book_count
FROM public.books 
WHERE category IS NOT NULL
GROUP BY category
ORDER BY book_count DESC
LIMIT 5;

-- 4. Проверка подкатегорий
SELECT '=== ПОДКАТЕГОРИИ ===' as test_name;
SELECT subcategory, COUNT(*) as book_count
FROM public.books 
WHERE subcategory IS NOT NULL
GROUP BY subcategory
ORDER BY book_count DESC
LIMIT 5;

-- 5. Проверка доступных книг
SELECT '=== ДОСТУПНЫЕ КНИГИ ===' as test_name;
SELECT COUNT(*) as available_books FROM public.books WHERE available = true;

-- 6. Проверка авторов
SELECT '=== АВТОРЫ ===' as test_name;
SELECT name, COUNT(*) as book_count 
FROM public.authors a
JOIN public.book_authors ba ON a.id = ba.author_id
GROUP BY a.name
ORDER BY book_count DESC
LIMIT 5;

-- 7. Проверка связей
SELECT '=== СВЯЗИ КНИГ-АВТОРЫ ===' as test_name;
SELECT COUNT(*) as total_links FROM public.book_authors;

-- 8. Проверка поисковых векторов
SELECT '=== ПОИСКОВЫЕ ВЕКТОРЫ ===' as test_name;
SELECT title, search_vector IS NOT NULL as has_search_vector
FROM public.books
LIMIT 3;

-- 9. Проверка статистики
SELECT '=== ОБЩАЯ СТАТИСТИКА ===' as test_name;
SELECT 
    (SELECT COUNT(*) FROM public.books) as total_books,
    (SELECT COUNT(*) FROM public.authors) as total_authors,
    (SELECT COUNT(*) FROM public.book_authors) as total_links,
    (SELECT COUNT(*) FROM public.books WHERE available = true) as available_books;
