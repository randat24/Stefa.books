-- Исправленная загрузка книг
-- Выполните этот скрипт после создания таблиц

-- 1. Сначала создаем функции
CREATE OR REPLACE FUNCTION find_category_by_parts(category_string TEXT)
RETURNS UUID AS $$
DECLARE
    category_parts TEXT[];
    part TEXT;
    found_category_id UUID;
BEGIN
    -- Разделяем строку по запятой и очищаем от пробелов
    category_parts := string_to_array(trim(category_string), ',');
    
    -- Ищем первую подходящую категорию
    FOREACH part IN ARRAY category_parts
    LOOP
        part := trim(part);
        
        -- Ищем точное совпадение
        SELECT id INTO found_category_id 
        FROM public.categories 
        WHERE name ILIKE '%' || part || '%' 
        AND parent_id IS NOT NULL  -- Только подкатегории
        LIMIT 1;
        
        -- Если нашли, возвращаем
        IF found_category_id IS NOT NULL THEN
            RETURN found_category_id;
        END IF;
    END LOOP;
    
    -- Если ничего не нашли, возвращаем NULL
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Функция для генерации уникального кода книги
CREATE OR REPLACE FUNCTION generate_book_code()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    new_code TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Получаем следующий номер в последовательности
    SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 8) AS INTEGER)), 0) + 1
    INTO sequence_part
    FROM public.books 
    WHERE code LIKE 'SB-' || year_part || '-%';
    
    -- Форматируем номер с ведущими нулями
    sequence_part := LPAD(sequence_part::TEXT, 4, '0');
    
    -- Создаем код
    new_code := 'SB-' || year_part || '-' || sequence_part;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 2. Загружаем книги (замените на реальные данные)
INSERT INTO public.books (title, author, isbn, description, cover_url, category_id, available, code) VALUES

-- Примеры с разделенными категориями
('Пригоди Тома Сойєра', 'Марк Твен', '978-617-12-3456-7', 'Класичний роман про пригоди хлопчика Тома Сойєра', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/tom-sawyer.jpg', find_category_by_parts('Пригоди, молодший вік'), true, generate_book_code()),
('Аліса в Країні Чудес', 'Льюїс Керролл', '978-617-12-3457-4', 'Казкова історія про дівчинку Алісу', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/alice.jpg', find_category_by_parts('Казки, дошкільний вік'), true, generate_book_code()),
('Гаррі Поттер і філософський камінь', 'Джоан Роулінг', '978-617-12-3458-1', 'Перша книга про пригоди Гаррі Поттера', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/harry-potter.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, generate_book_code()),
('Детективна історія', 'Автор Детектив', '978-617-12-3459-8', 'Захоплюючий детектив', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/detective.jpg', find_category_by_parts('Детектив, середній вік'), true, generate_book_code()),
('Книга про психологію', 'Психолог Автор', '978-617-12-3460-4', 'Книга про психологію та саморозвиток', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/psychology.jpg', find_category_by_parts('Психологія і саморозвиток'), true, generate_book_code())

ON CONFLICT (code) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    isbn = EXCLUDED.isbn,
    description = EXCLUDED.description,
    cover_url = EXCLUDED.cover_url,
    category_id = EXCLUDED.category_id,
    available = EXCLUDED.available,
    updated_at = NOW();

-- 3. Проверяем результат
SELECT 
    'Книги загружены успешно!' as status,
    (SELECT COUNT(*) FROM public.books) as total_books,
    (SELECT COUNT(*) FROM public.books WHERE available = true) as available_books,
    (SELECT COUNT(DISTINCT category_id) FROM public.books) as categories_with_books;

-- 4. Показываем загруженные книги с их категориями
SELECT 
    b.title,
    b.author,
    b.code,
    c.name as category_name,
    pc.name as parent_category
FROM public.books b
LEFT JOIN public.categories c ON b.category_id = c.id
LEFT JOIN public.categories pc ON c.parent_id = pc.id
ORDER BY b.created_at DESC;
