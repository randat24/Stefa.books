-- ============================================================================
-- МАССОВАЯ ЗАГРУЗКА 105 КНИГ ИЗ GOOGLE SHEETS
-- ============================================================================

-- 1. Создаем функции
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

-- 2. Массовая загрузка книг
-- Замените данные на реальные из Google Sheets
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

-- Книги 1-20 (примеры - замените на реальные данные)
('Пригоди Тома Сойєра', 'Марк Твен', '978-617-12-3456-7', 'Класичний роман про пригоди хлопчика Тома Сойєра', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/tom-sawyer.jpg', find_category_by_parts('Пригоди, молодший вік'), true, 'SB-2025-0001'),
('Аліса в Країні Чудес', 'Льюїс Керролл', '978-617-12-3457-4', 'Казкова історія про дівчинку Алісу', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/alice.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0002'),
('Гаррі Поттер і філософський камінь', 'Джоан Роулінг', '978-617-12-3458-1', 'Перша книга про пригоди Гаррі Поттера', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/harry-potter.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0003'),
('Детективна історія', 'Автор Детектив', '978-617-12-3459-8', 'Захоплюючий детектив', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/detective.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0004'),
('Книга про психологію', 'Психолог Автор', '978-617-12-3460-4', 'Книга про психологію та саморозвиток', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/psychology.jpg', find_category_by_parts('Психологія і саморозвиток'), true, 'SB-2025-0005'),
('Маленький принц', 'Антуан де Сент-Екзюпері', '978-617-12-3461-1', 'Філософська казка про маленького принца', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/little-prince.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0006'),
('Відьмак', 'Анджей Сапковський', '978-617-12-3462-8', 'Фентезійний роман про мисливця на монстрів', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/witcher.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0007'),
('Шерлок Холмс', 'Артур Конан Дойл', '978-617-12-3463-5', 'Збірка детективних оповідань', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/sherlock.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0008'),
('Як навчитися програмувати', 'Програміст Автор', '978-617-12-3464-2', 'Практичний посібник з програмування', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/programming.jpg', find_category_by_parts('Пізнавальні, середній вік'), true, 'SB-2025-0009'),
('Сучасна проза', 'Сучасний Автор', '978-617-12-3465-9', 'Сучасний роман про життя підлітків', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/modern-prose.jpg', find_category_by_parts('Сучасна проза'), true, 'SB-2025-0010')

-- ДОБАВЬТЕ СЮДА ОСТАЛЬНЫЕ 95 КНИГ ИЗ GOOGLE SHEETS
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
    'Массовая загрузка завершена!' as status,
    (SELECT COUNT(*) FROM public.books) as total_books,
    (SELECT COUNT(*) FROM public.books WHERE available = true) as available_books,
    (SELECT COUNT(DISTINCT category_id) FROM public.books WHERE category_id IS NOT NULL) as categories_with_books,
    (SELECT COUNT(DISTINCT author) FROM public.books) as unique_authors;

-- 4. Показываем загруженные книги
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
