-- ============================================================================
-- УМНЫЙ ЗАГРУЗЧИК КНИГ ИЗ GOOGLE SHEETS
-- ============================================================================
-- Этот скрипт создает все необходимые функции и загружает книги
-- с автоматическим определением категорий и генерацией кодов

-- ============================================================================
-- 1. СОЗДАНИЕ ВСПОМОГАТЕЛЬНЫХ ФУНКЦИЙ
-- ============================================================================

-- Функция для поиска категории по частям (поддерживает множественные категории)
CREATE OR REPLACE FUNCTION find_category_by_parts(category_string TEXT)
RETURNS UUID AS $$
DECLARE
    category_parts TEXT[];
    part TEXT;
    found_category_id UUID;
    parent_category_id UUID;
BEGIN
    -- Если строка пустая, возвращаем NULL
    IF category_string IS NULL OR trim(category_string) = '' THEN
        RETURN NULL;
    END IF;
    
    -- Разделяем строку по запятой и очищаем от пробелов
    category_parts := string_to_array(trim(category_string), ',');
    
    -- Ищем первую подходящую подкатегорию
    FOREACH part IN ARRAY category_parts
    LOOP
        part := trim(part);
        
        -- Ищем точное совпадение в подкатегориях
        SELECT id INTO found_category_id 
        FROM public.categories 
        WHERE name ILIKE '%' || part || '%' 
        AND parent_id IS NOT NULL  -- Только подкатегории
        AND is_active = true
        ORDER BY 
            CASE WHEN name ILIKE part THEN 1 ELSE 2 END,  -- Точное совпадение приоритетнее
            sort_order
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

-- Функция для поиска возрастной категории (используем age_range поле)
CREATE OR REPLACE FUNCTION find_age_category(age_string TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Если строка пустая, возвращаем NULL
    IF age_string IS NULL OR trim(age_string) = '' THEN
        RETURN NULL;
    END IF;
    
    -- Возвращаем возрастную категорию как строку
    RETURN trim(age_string);
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

-- Функция для создания или обновления автора
CREATE OR REPLACE FUNCTION create_or_update_author(author_name TEXT)
RETURNS UUID AS $$
DECLARE
    author_id UUID;
BEGIN
    -- Ищем существующего автора
    SELECT id INTO author_id 
    FROM public.authors 
    WHERE name ILIKE author_name;
    
    -- Если не нашли, создаем нового
    IF author_id IS NULL THEN
        INSERT INTO public.authors (name, created_at, updated_at)
        VALUES (author_name, NOW(), NOW())
        RETURNING id INTO author_id;
    END IF;
    
    RETURN author_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. ОСНОВНАЯ ФУНКЦИЯ ЗАГРУЗКИ КНИГ
-- ============================================================================

CREATE OR REPLACE FUNCTION load_books_from_data(
    books_data JSONB
) RETURNS TABLE(
    loaded_count INTEGER,
    updated_count INTEGER,
    error_count INTEGER,
    errors TEXT[]
) AS $$
DECLARE
    book_record JSONB;
    book_id UUID;
    category_id UUID;
    age_range_text TEXT;
    author_id UUID;
    book_code TEXT;
    loaded_counter INTEGER := 0;
    updated_counter INTEGER := 0;
    error_counter INTEGER := 0;
    error_messages TEXT[] := '{}';
    error_msg TEXT;
BEGIN
    -- Проходим по каждой книге в данных
    FOR book_record IN SELECT * FROM jsonb_array_elements(books_data)
    LOOP
        BEGIN
            -- Генерируем код книги
            book_code := generate_book_code();
            
            -- Находим категорию
            category_id := find_category_by_parts(book_record->>'category');
            
            -- Получаем возрастную категорию как строку
            age_range_text := find_age_category(book_record->>'age_range');
            
            -- Создаем или обновляем автора
            author_id := create_or_update_author(book_record->>'author');
            
            -- Проверяем, существует ли книга с таким ISBN или кодом
            IF EXISTS (
                SELECT 1 FROM public.books 
                WHERE isbn = book_record->>'isbn' 
                OR code = book_record->>'code'
            ) THEN
                -- Обновляем существующую книгу
                UPDATE public.books SET
                    title = book_record->>'title',
                    author = book_record->>'author',
                    description = book_record->>'description',
                    short_description = book_record->>'short_description',
                    cover_url = book_record->>'cover_url',
                    category_id = category_id,
                    isbn = book_record->>'isbn',
                    pages = (book_record->>'pages')::INTEGER,
                    age_range = age_range_text,
                    language = COALESCE(book_record->>'language', 'uk'),
                    publisher = book_record->>'publisher',
                    publication_year = (book_record->>'publication_year')::INTEGER,
                    available = COALESCE((book_record->>'available')::BOOLEAN, true),
                    status = COALESCE(book_record->>'status', 'available'),
                    qty_total = COALESCE((book_record->>'qty_total')::INTEGER, 1),
                    qty_available = COALESCE((book_record->>'qty_available')::INTEGER, 1),
                    price_daily = (book_record->>'price_daily')::NUMERIC,
                    price_weekly = (book_record->>'price_weekly')::NUMERIC,
                    price_monthly = (book_record->>'price_monthly')::NUMERIC,
                    price_uah = (book_record->>'price_uah')::NUMERIC,
                    location = book_record->>'location',
                    tags = string_to_array(book_record->>'tags', ','),
                    badges = string_to_array(book_record->>'badges', ','),
                    updated_at = NOW()
                WHERE isbn = book_record->>'isbn' OR code = book_record->>'code';
                
                updated_counter := updated_counter + 1;
            ELSE
                -- Создаем новую книгу
                INSERT INTO public.books (
                    title, author, description, short_description, cover_url,
                    category_id, isbn, pages, age_range,
                    language, publisher, publication_year, available, status,
                    qty_total, qty_available, price_daily, price_weekly, 
                    price_monthly, price_uah, location, code, tags, badges,
                    created_at, updated_at
                ) VALUES (
                    book_record->>'title',
                    book_record->>'author',
                    book_record->>'description',
                    book_record->>'short_description',
                    book_record->>'cover_url',
                    category_id,
                    book_record->>'isbn',
                    (book_record->>'pages')::INTEGER,
                    age_range_text,
                    COALESCE(book_record->>'language', 'uk'),
                    book_record->>'publisher',
                    (book_record->>'publication_year')::INTEGER,
                    COALESCE((book_record->>'available')::BOOLEAN, true),
                    COALESCE(book_record->>'status', 'available'),
                    COALESCE((book_record->>'qty_total')::INTEGER, 1),
                    COALESCE((book_record->>'qty_available')::INTEGER, 1),
                    (book_record->>'price_daily')::NUMERIC,
                    (book_record->>'price_weekly')::NUMERIC,
                    (book_record->>'price_monthly')::NUMERIC,
                    (book_record->>'price_uah')::NUMERIC,
                    book_record->>'location',
                    COALESCE(book_record->>'code', book_code),
                    string_to_array(book_record->>'tags', ','),
                    string_to_array(book_record->>'badges', ','),
                    NOW(),
                    NOW()
                );
                
                loaded_counter := loaded_counter + 1;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            error_counter := error_counter + 1;
            error_msg := 'Ошибка при загрузке книги "' || COALESCE(book_record->>'title', 'Неизвестно') || '": ' || SQLERRM;
            error_messages := array_append(error_messages, error_msg);
        END;
    END LOOP;
    
    -- Возвращаем результат
    RETURN QUERY SELECT loaded_counter, updated_counter, error_counter, error_messages;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. ПРИМЕР ИСПОЛЬЗОВАНИЯ С ДАННЫМИ ИЗ GOOGLE SHEETS
-- ============================================================================

-- Замените этот JSON на реальные данные из Google Sheets
-- Формат: массив объектов с полями книги
SELECT * FROM load_books_from_data('[
    {
        "title": "Пригоди Тома Сойєра",
        "author": "Марк Твен",
        "isbn": "978-617-12-3456-7",
        "description": "Класичний роман про пригоди хлопчика Тома Сойєра в містечку Сент-Пітерсберг",
        "short_description": "Пригоди хлопчика Тома Сойєра",
        "cover_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/tom-sawyer.jpg",
        "category": "Пригоди, молодший вік",
        "age_range": "8-12 років",
        "pages": 320,
        "language": "uk",
        "publisher": "А-БА-БА-ГА-ЛА-МА-ГА",
        "publication_year": 2020,
        "available": true,
        "status": "available",
        "qty_total": 3,
        "qty_available": 3,
        "price_daily": 15.00,
        "price_weekly": 80.00,
        "price_monthly": 200.00,
        "price_uah": 150.00,
        "location": "Полиця А-1",
        "tags": "пригоди, класика, молодший вік",
        "badges": "популярна, нова"
    },
    {
        "title": "Аліса в Країні Чудес",
        "author": "Льюїс Керролл",
        "isbn": "978-617-12-3457-4",
        "description": "Казкова історія про дівчинку Алісу, яка потрапила в фантастичний світ",
        "short_description": "Казка про Алісу в Країні Чудес",
        "cover_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/alice.jpg",
        "category": "Казки, дошкільний вік",
        "age_range": "4-8 років",
        "pages": 180,
        "language": "uk",
        "publisher": "Видавництво Старого Лева",
        "publication_year": 2019,
        "available": true,
        "status": "available",
        "qty_total": 2,
        "qty_available": 2,
        "price_daily": 12.00,
        "price_weekly": 60.00,
        "price_monthly": 150.00,
        "price_uah": 120.00,
        "location": "Полиця Б-2",
        "tags": "казки, фантастика, дошкільний вік",
        "badges": "класика"
    },
    {
        "title": "Гаррі Поттер і філософський камінь",
        "author": "Джоан Роулінг",
        "isbn": "978-617-12-3458-1",
        "description": "Перша книга про пригоди юного чарівника Гаррі Поттера",
        "short_description": "Пригоди Гаррі Поттера в Хогвартсі",
        "cover_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/harry-potter.jpg",
        "category": "Фентезі, підлітковий вік",
        "age_range": "10-16 років",
        "pages": 400,
        "language": "uk",
        "publisher": "А-БА-БА-ГА-ЛА-МА-ГА",
        "publication_year": 2021,
        "available": true,
        "status": "available",
        "qty_total": 5,
        "qty_available": 4,
        "price_daily": 20.00,
        "price_weekly": 100.00,
        "price_monthly": 250.00,
        "price_uah": 200.00,
        "location": "Полиця В-3",
        "tags": "фентезі, магія, підлітковий вік",
        "badges": "популярна, бестселер"
    }
]'::jsonb);

-- ============================================================================
-- 4. ПРОВЕРКА РЕЗУЛЬТАТОВ
-- ============================================================================

-- Статистика загруженных книг
SELECT 
    'Загрузка завершена!' as status,
    (SELECT COUNT(*) FROM public.books) as total_books,
    (SELECT COUNT(*) FROM public.books WHERE available = true) as available_books,
    (SELECT COUNT(DISTINCT category_id) FROM public.books WHERE category_id IS NOT NULL) as categories_with_books,
    (SELECT COUNT(DISTINCT author) FROM public.books) as unique_authors;

-- Показываем загруженные книги с их категориями
SELECT 
    b.title,
    b.author,
    b.code,
    b.isbn,
    c.name as category_name,
    pc.name as parent_category,
    b.age_range as age_category,
    b.available,
    b.qty_available,
    b.qty_total,
    b.created_at
FROM public.books b
LEFT JOIN public.categories c ON b.category_id = c.id
LEFT JOIN public.categories pc ON c.parent_id = pc.id
ORDER BY b.created_at DESC
LIMIT 20;

-- Статистика по категориям
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
