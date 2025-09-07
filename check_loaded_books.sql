-- Проверка загруженных книг
SELECT 
    'Текущее состояние базы данных' as status,
    COUNT(*) as total_books,
    COUNT(CASE WHEN available = true THEN 1 END) as available_books
FROM public.books;

-- Показываем все загруженные книги
SELECT 
    id,
    title,
    author,
    code,
    available,
    created_at
FROM public.books
ORDER BY created_at DESC;

-- Показываем книги с неправильными названиями (если есть)
SELECT 
    id,
    title,
    author,
    code
FROM public.books
WHERE title LIKE 'Книга %' OR title LIKE 'Book %'
ORDER BY code;
