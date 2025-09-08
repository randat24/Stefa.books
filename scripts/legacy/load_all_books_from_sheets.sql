-- ============================================================================
-- ЗАГРУЗКА ВСЕХ КНИГ ИЗ GOOGLE SHEETS (НАЧИНАЯ С 11-Й)
-- ============================================================================

-- 1. Создаем функции (если еще не созданы)
CREATE OR REPLACE FUNCTION find_category_by_parts(category_string TEXT)
RETURNS UUID AS $$
DECLARE
    category_parts TEXT[];
    part TEXT;
    found_category_id UUID;
BEGIN
    IF category_string IS NULL OR trim(category_string) = '' THEN
        RETURN NULL;
    END IF;
    
    category_parts := string_to_array(trim(category_string), ',');
    
    FOREACH part IN ARRAY category_parts
    LOOP
        part := trim(part);
        
        SELECT id INTO found_category_id 
        FROM public.categories 
        WHERE name ILIKE '%' || part || '%' 
        AND parent_id IS NOT NULL
        ORDER BY 
            CASE WHEN name ILIKE part THEN 1 ELSE 2 END
        LIMIT 1;
        
        IF found_category_id IS NOT NULL THEN
            RETURN found_category_id;
        END IF;
    END LOOP;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Загружаем книги (начиная с 11-й, так как первые 10 уже есть)
-- ВАЖНО: Замените данные на реальные из Google Sheets!

INSERT INTO public.books (
    title, 
    author, 
    isbn, 
    description, 
    cover_url, 
    category_id, 
    available, 
    code
) VALUES

-- Книги 11-30 (примеры - замените на реальные данные из Google Sheets)
('Книга 11', 'Автор 11', '978-617-12-3466-6', 'Описание книги 11', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book11.jpg', find_category_by_parts('Пригоди, молодший вік'), true, 'SB-2025-0011'),
('Книга 12', 'Автор 12', '978-617-12-3467-3', 'Описание книги 12', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book12.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0012'),
('Книга 13', 'Автор 13', '978-617-12-3468-0', 'Описание книги 13', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book13.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0013'),
('Книга 14', 'Автор 14', '978-617-12-3469-7', 'Описание книги 14', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book14.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0014'),
('Книга 15', 'Автор 15', '978-617-12-3470-3', 'Описание книги 15', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book15.jpg', find_category_by_parts('Психологія і саморозвиток'), true, 'SB-2025-0015'),
('Книга 16', 'Автор 16', '978-617-12-3471-0', 'Описание книги 16', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book16.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0016'),
('Книга 17', 'Автор 17', '978-617-12-3472-7', 'Описание книги 17', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book17.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0017'),
('Книга 18', 'Автор 18', '978-617-12-3473-4', 'Описание книги 18', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book18.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0018'),
('Книга 19', 'Автор 19', '978-617-12-3474-1', 'Описание книги 19', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book19.jpg', find_category_by_parts('Пізнавальні, середній вік'), true, 'SB-2025-0019'),
('Книга 20', 'Автор 20', '978-617-12-3475-8', 'Описание книги 20', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book20.jpg', find_category_by_parts('Сучасна проза'), true, 'SB-2025-0020')

-- ДОБАВЬТЕ СЮДА ОСТАЛЬНЫЕ 85 КНИГ (21-105) ИЗ GOOGLE SHEETS
-- Формат: ('Назва', 'Автор', 'ISBN', 'Опис', 'URL обложки', find_category_by_parts('Категорія'), true, 'SB-2025-XXXX'),

ON CONFLICT (code) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    isbn = EXCLUDED.isbn,
    description = EXCLUDED.description,
    cover_url = EXCLUDED.cover_url,
    category_id = EXCLUDED.category_id,
    updated_at = NOW();

-- 3. Проверяем результат
SELECT 
    'Загрузка завершена!' as status,
    (SELECT COUNT(*) FROM public.books) as total_books,
    (SELECT COUNT(*) FROM public.books WHERE available = true) as available_books,
    (SELECT COUNT(DISTINCT category_id) FROM public.books WHERE category_id IS NOT NULL) as categories_with_books,
    (SELECT COUNT(DISTINCT author) FROM public.books) as unique_authors;

-- 4. Показываем последние загруженные книги
SELECT 
    b.title,
    b.author,
    b.code,
    c.name as category_name,
    b.available
FROM public.books b
LEFT JOIN public.categories c ON b.category_id = c.id
ORDER BY b.created_at DESC
LIMIT 20;
