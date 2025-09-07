-- Проверка текущего состояния книг в базе данных
SELECT 
    'Текущее состояние базы данных' as status,
    COUNT(*) as total_books,
    COUNT(CASE WHEN available = true THEN 1 END) as available_books,
    COUNT(DISTINCT author) as unique_authors,
    COUNT(DISTINCT category_id) as categories_with_books
FROM public.books;

-- Показываем существующие книги
SELECT 
    title,
    author,
    code,
    available,
    created_at
FROM public.books
ORDER BY created_at DESC;
