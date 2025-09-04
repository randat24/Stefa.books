-- ============================================================================
-- CLEAR ALL BOOKS AND RELATED DATA
-- ============================================================================
-- Полная очистка всех книг и связанных данных

-- Очистка в правильном порядке (с учетом внешних ключей)
DELETE FROM public.book_authors;
DELETE FROM public.books;
DELETE FROM public.authors;

-- Проверка очистки
SELECT 
    'Очистка завершена!' as status,
    (SELECT COUNT(*) FROM public.books) as books_count,
    (SELECT COUNT(*) FROM public.authors) as authors_count,
    (SELECT COUNT(*) FROM public.book_authors) as book_authors_count;
