-- Массовая загрузка книг из Google Sheets
-- Замените данные на реальные из вашей Google таблицы

-- ВАЖНО: Замените данные ниже на реальные данные из Google Sheets
-- Формат: (title, author, isbn, description, cover_url, category_string, available)

INSERT INTO public.books (title, author, isbn, description, cover_url, category_id, available, code) VALUES

-- Примеры данных (замените на реальные)
('Назва книги 1', 'Автор 1', '978-617-12-0001-1', 'Опис книги 1', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book1.jpg', find_category_by_parts('Пригоди, молодший вік'), true, generate_book_code()),
('Назва книги 2', 'Автор 2', '978-617-12-0002-8', 'Опис книги 2', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book2.jpg', find_category_by_parts('Казки, дошкільний вік'), true, generate_book_code()),
('Назва книги 3', 'Автор 3', '978-617-12-0003-5', 'Опис книги 3', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book3.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, generate_book_code()),
('Назва книги 4', 'Автор 4', '978-617-12-0004-2', 'Опис книги 4', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book4.jpg', find_category_by_parts('Детектив, середній вік'), true, generate_book_code()),
('Назва книги 5', 'Автор 5', '978-617-12-0005-9', 'Опис книги 5', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book5.jpg', find_category_by_parts('Психологія і саморозвиток'), true, generate_book_code()),
('Назва книги 6', 'Автор 6', '978-617-12-0006-6', 'Опис книги 6', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book6.jpg', find_category_by_parts('Сучасна проза'), true, generate_book_code()),
('Назва книги 7', 'Автор 7', '978-617-12-0007-3', 'Опис книги 7', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book7.jpg', find_category_by_parts('Пізнавальні, найменші'), true, generate_book_code()),
('Назва книги 8', 'Автор 8', '978-617-12-0008-0', 'Опис книги 8', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book8.jpg', find_category_by_parts('Романтика, підлітковий вік'), true, generate_book_code()),
('Назва книги 9', 'Автор 9', '978-617-12-0009-7', 'Опис книги 9', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book9.jpg', find_category_by_parts('Реалістична проза, середній вік'), true, generate_book_code()),
('Назва книги 10', 'Автор 10', '978-617-12-0010-3', 'Опис книги 10', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book10.jpg', find_category_by_parts('Повість, молодший вік'), true, generate_book_code())

ON CONFLICT (code) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    isbn = EXCLUDED.isbn,
    description = EXCLUDED.description,
    cover_url = EXCLUDED.cover_url,
    category_id = EXCLUDED.category_id,
    available = EXCLUDED.available,
    updated_at = NOW();

-- Проверяем результат загрузки
SELECT 
    'Массовая загрузка завершена!' as status,
    (SELECT COUNT(*) FROM public.books) as total_books,
    (SELECT COUNT(*) FROM public.books WHERE available = true) as available_books,
    (SELECT COUNT(DISTINCT category_id) FROM public.books) as categories_with_books;

-- Показываем статистику по категориям
SELECT 
    pc.name as parent_category,
    c.name as subcategory,
    COUNT(b.id) as books_count
FROM public.categories c
LEFT JOIN public.categories pc ON c.parent_id = pc.id
LEFT JOIN public.books b ON c.id = b.category_id
WHERE c.parent_id IS NOT NULL
GROUP BY pc.name, c.name, c.display_order
ORDER BY pc.display_order, c.display_order;

-- Показываем все загруженные книги
SELECT 
    b.title,
    b.author,
    b.code,
    c.name as category_name,
    pc.name as parent_category,
    b.available,
    b.created_at
FROM public.books b
LEFT JOIN public.categories c ON b.category_id = c.id
LEFT JOIN public.categories pc ON c.parent_id = pc.id
ORDER BY b.created_at DESC;
