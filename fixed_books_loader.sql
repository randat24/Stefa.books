-- ============================================================================
-- ИСПРАВЛЕННЫЙ ЗАГРУЗЧИК КНИГ (БЕЗ НЕСУЩЕСТВУЮЩИХ КОЛОНОК)
-- ============================================================================
-- Этот скрипт работает только с существующими колонками в таблице books

-- 1. Создаем необходимые функции
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
        AND is_active = true
        ORDER BY 
            CASE WHEN name ILIKE part THEN 1 ELSE 2 END,
            sort_order
        LIMIT 1;
        
        IF found_category_id IS NOT NULL THEN
            RETURN found_category_id;
        END IF;
    END LOOP;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_book_code()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    new_code TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 8) AS INTEGER)), 0) + 1
    INTO sequence_part
    FROM public.books 
    WHERE code LIKE 'SB-' || year_part || '-%';
    
    sequence_part := LPAD(sequence_part::TEXT, 4, '0');
    new_code := 'SB-' || year_part || '-' || sequence_part;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 2. Загружаем книги (только с существующими колонками)
INSERT INTO public.books (
    title, 
    author, 
    isbn, 
    description, 
    cover_url, 
    category_id, 
    available, 
    code, 
    pages, 
    language, 
    publisher, 
    publication_year, 
    qty_total, 
    qty_available, 
    price_daily, 
    price_weekly, 
    price_monthly, 
    price_uah, 
    location, 
    tags, 
    badges, 
    status
) VALUES

-- Книга 1
('Пригоди Тома Сойєра', 'Марк Твен', '978-617-12-3456-7', 'Класичний роман про пригоди хлопчика Тома Сойєра в містечку Сент-Пітерсберг', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/tom-sawyer.jpg', find_category_by_parts('Пригоди, молодший вік'), true, 'SB-2025-0001', 320, 'uk', 'А-БА-БА-ГА-ЛА-МА-ГА', 2020, 3, 3, 15.00, 80.00, 200.00, 150.00, 'Полиця А-1', ARRAY['пригоди', 'класика', 'молодший вік'], ARRAY['популярна', 'нова'], 'available'),

-- Книга 2
('Аліса в Країні Чудес', 'Льюїс Керролл', '978-617-12-3457-4', 'Казкова історія про дівчинку Алісу, яка потрапила в фантастичний світ', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/alice.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0002', 180, 'uk', 'Видавництво Старого Лева', 2019, 2, 2, 12.00, 60.00, 150.00, 120.00, 'Полиця Б-2', ARRAY['казки', 'фантастика', 'дошкільний вік'], ARRAY['класика'], 'available'),

-- Книга 3
('Гаррі Поттер і філософський камінь', 'Джоан Роулінг', '978-617-12-3458-1', 'Перша книга про пригоди юного чарівника Гаррі Поттера в школі чарівництва Хогвартс', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/harry-potter.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0003', 400, 'uk', 'А-БА-БА-ГА-ЛА-МА-ГА', 2021, 5, 4, 20.00, 100.00, 250.00, 200.00, 'Полиця В-3', ARRAY['фентезі', 'магія', 'підлітковий вік'], ARRAY['популярна', 'бестселер'], 'available'),

-- Книга 4
('Детективна історія', 'Автор Детектив', '978-617-12-3459-8', 'Захоплюючий детектив про розслідування загадкового злочину', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/detective.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0004', 280, 'uk', 'Видавництво Старого Лева', 2022, 2, 2, 18.00, 90.00, 220.00, 180.00, 'Полиця Г-4', ARRAY['детектив', 'загадка', 'середній вік'], ARRAY['нова'], 'available'),

-- Книга 5
('Книга про психологію', 'Психолог Автор', '978-617-12-3460-4', 'Книга про психологію та саморозвиток для підлітків', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/psychology.jpg', find_category_by_parts('Психологія і саморозвиток'), true, 'SB-2025-0005', 350, 'uk', 'А-БА-БА-ГА-ЛА-МА-ГА', 2023, 1, 1, 25.00, 120.00, 300.00, 250.00, 'Полиця Д-5', ARRAY['психологія', 'саморозвиток', 'підлітковий вік'], ARRAY['корисна'], 'available')

ON CONFLICT (code) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    isbn = EXCLUDED.isbn,
    description = EXCLUDED.description,
    cover_url = EXCLUDED.cover_url,
    category_id = EXCLUDED.category_id,
    pages = EXCLUDED.pages,
    language = EXCLUDED.language,
    publisher = EXCLUDED.publisher,
    publication_year = EXCLUDED.publication_year,
    qty_total = EXCLUDED.qty_total,
    qty_available = EXCLUDED.qty_available,
    price_daily = EXCLUDED.price_daily,
    price_weekly = EXCLUDED.price_weekly,
    price_monthly = EXCLUDED.price_monthly,
    price_uah = EXCLUDED.price_uah,
    location = EXCLUDED.location,
    tags = EXCLUDED.tags,
    badges = EXCLUDED.badges,
    status = EXCLUDED.status,
    updated_at = NOW();

-- 3. Проверяем результат
SELECT 
    'Книги загружены успешно!' as status,
    (SELECT COUNT(*) FROM public.books) as total_books,
    (SELECT COUNT(*) FROM public.books WHERE available = true) as available_books,
    (SELECT COUNT(DISTINCT category_id) FROM public.books WHERE category_id IS NOT NULL) as categories_with_books,
    (SELECT COUNT(DISTINCT author) FROM public.books) as unique_authors;

-- 4. Показываем загруженные книги с их категориями
SELECT 
    b.title,
    b.author,
    b.code,
    b.isbn,
    c.name as category_name,
    pc.name as parent_category,
    b.available,
    b.qty_available,
    b.qty_total,
    b.created_at
FROM public.books b
LEFT JOIN public.categories c ON b.category_id = c.id
LEFT JOIN public.categories pc ON c.parent_id = pc.id
ORDER BY b.created_at DESC;

-- 5. Статистика по категориям
SELECT 
    pc.name as parent_category,
    c.name as subcategory,
    COUNT(b.id) as books_count
FROM public.categories c
LEFT JOIN public.categories pc ON c.parent_id = pc.id
LEFT JOIN public.books b ON c.id = b.category_id
WHERE c.parent_id IS NOT NULL AND c.is_active = true
GROUP BY pc.name, c.name, c.sort_order
ORDER BY pc.sort_order, c.sort_order;
