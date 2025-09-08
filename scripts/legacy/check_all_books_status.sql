-- Проверка состояния всех 105 книг
SELECT 
    'Статистика по названиям книг' as status,
    COUNT(*) as total_books,
    COUNT(CASE WHEN title NOT LIKE 'Книга %' AND title NOT LIKE 'Book %' THEN 1 END) as books_with_real_titles,
    COUNT(CASE WHEN title LIKE 'Книга %' OR title LIKE 'Book %' THEN 1 END) as books_with_placeholder_titles,
    COUNT(CASE WHEN author NOT LIKE 'Автор %' AND author NOT LIKE 'Author %' THEN 1 END) as books_with_real_authors,
    COUNT(CASE WHEN author LIKE 'Автор %' OR author LIKE 'Author %' THEN 1 END) as books_with_placeholder_authors
FROM public.books;

-- Показываем книги с неправильными названиями
SELECT 
    'Книги с неправильными названиями:' as info,
    code,
    title,
    author,
    CASE 
        WHEN title LIKE 'Книга %' OR title LIKE 'Book %' THEN 'Неправильное название'
        WHEN author LIKE 'Автор %' OR author LIKE 'Author %' THEN 'Неправильный автор'
        ELSE 'OK'
    END as problem
FROM public.books
WHERE title LIKE 'Книга %' OR title LIKE 'Book %' OR author LIKE 'Автор %' OR author LIKE 'Author %'
ORDER BY code;

-- Показываем книги с правильными названиями (примеры)
SELECT 
    'Книги с правильными названиями (примеры):' as info,
    code,
    title,
    author
FROM public.books
WHERE title NOT LIKE 'Книга %' AND title NOT LIKE 'Book %' 
AND author NOT LIKE 'Автор %' AND author NOT LIKE 'Author %'
ORDER BY code
LIMIT 10;
