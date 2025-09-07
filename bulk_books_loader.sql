-- ============================================================================
-- МАССОВАЯ ЗАГРУЗКА КНИГ ИЗ GOOGLE SHEETS
-- ============================================================================
-- Этот скрипт загружает множество книг одним запросом

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

-- 2. Массовая загрузка книг
-- Замените данные на реальные из Google Sheets
INSERT INTO public.books (
    title, author, isbn, description, short_description, cover_url, 
    category_id, available, code, age_range, pages, language, 
    publisher, publication_year, qty_total, qty_available, 
    price_daily, price_weekly, price_monthly, price_uah, 
    location, tags, badges, status
) VALUES

-- Детские книги
('Пригоди Тома Сойєра', 'Марк Твен', '978-617-12-3456-7', 'Класичний роман про пригоди хлопчика Тома Сойєра', 'Пригоди хлопчика Тома Сойєра', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/tom-sawyer.jpg', find_category_by_parts('Пригоди, молодший вік'), true, 'SB-2025-0001', '8-12 років', 320, 'uk', 'А-БА-БА-ГА-ЛА-МА-ГА', 2020, 3, 3, 15.00, 80.00, 200.00, 150.00, 'Полиця А-1', ARRAY['пригоди', 'класика', 'молодший вік'], ARRAY['популярна', 'нова'], 'available'),

('Аліса в Країні Чудес', 'Льюїс Керролл', '978-617-12-3457-4', 'Казкова історія про дівчинку Алісу, яка потрапила в фантастичний світ', 'Казка про Алісу в Країні Чудес', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/alice.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0002', '4-8 років', 180, 'uk', 'Видавництво Старого Лева', 2019, 2, 2, 12.00, 60.00, 150.00, 120.00, 'Полиця Б-2', ARRAY['казки', 'фантастика', 'дошкільний вік'], ARRAY['класика'], 'available'),

('Гаррі Поттер і філософський камінь', 'Джоан Роулінг', '978-617-12-3458-1', 'Перша книга про пригоди юного чарівника Гаррі Поттера в школі чарівництва Хогвартс', 'Пригоди Гаррі Поттера в Хогвартсі', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/harry-potter.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0003', '10-16 років', 400, 'uk', 'А-БА-БА-ГА-ЛА-МА-ГА', 2021, 5, 4, 20.00, 100.00, 250.00, 200.00, 'Полиця В-3', ARRAY['фентезі', 'магія', 'підлітковий вік'], ARRAY['популярна', 'бестселер'], 'available'),

('Маленький принц', 'Антуан де Сент-Екзюпері', '978-617-12-3461-1', 'Філософська казка про маленького принца з далекої планети', 'Казка про маленького принца', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/little-prince.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0006', '6-12 років', 120, 'uk', 'Видавництво Старого Лева', 2020, 4, 4, 10.00, 50.00, 120.00, 100.00, 'Полиця Б-3', ARRAY['казки', 'філософія', 'дошкільний вік'], ARRAY['класика', 'мудра'], 'available'),

('Відьмак', 'Анджей Сапковський', '978-617-12-3462-8', 'Фентезійний роман про мисливця на монстрів Геральта з Рівії', 'Пригоди відьмака Геральта', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/witcher.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0007', '16+ років', 450, 'uk', 'А-БА-БА-ГА-ЛА-МА-ГА', 2022, 2, 2, 25.00, 120.00, 300.00, 250.00, 'Полиця В-4', ARRAY['фентезі', 'пригоди', 'підлітковий вік'], ARRAY['популярна', 'екранізація'], 'available'),

-- Детективы
('Детективна історія', 'Автор Детектив', '978-617-12-3459-8', 'Захоплюючий детектив про розслідування загадкового злочину', 'Детектив про загадковий злочин', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/detective.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0004', '12-18 років', 280, 'uk', 'Видавництво Старого Лева', 2022, 2, 2, 18.00, 90.00, 220.00, 180.00, 'Полиця Г-4', ARRAY['детектив', 'загадка', 'середній вік'], ARRAY['нова'], 'available'),

('Шерлок Холмс', 'Артур Конан Дойл', '978-617-12-3463-5', 'Збірка детективних оповідань про знаменитого детектива Шерлока Холмса', 'Детективи Шерлока Холмса', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/sherlock.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0008', '14+ років', 350, 'uk', 'А-БА-БА-ГА-ЛА-МА-ГА', 2021, 3, 3, 20.00, 100.00, 250.00, 200.00, 'Полиця Г-5', ARRAY['детектив', 'класика', 'середній вік'], ARRAY['класика', 'знаменита'], 'available'),

-- Психология и саморазвитие
('Книга про психологію', 'Психолог Автор', '978-617-12-3460-4', 'Книга про психологію та саморозвиток для підлітків', 'Психологія для підлітків', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/psychology.jpg', find_category_by_parts('Психологія і саморозвиток'), true, 'SB-2025-0005', '14+ років', 350, 'uk', 'А-БА-БА-ГА-ЛА-МА-ГА', 2023, 1, 1, 25.00, 120.00, 300.00, 250.00, 'Полиця Д-5', ARRAY['психологія', 'саморозвиток', 'підлітковий вік'], ARRAY['корисна'], 'available'),

('Як навчитися програмувати', 'Програміст Автор', '978-617-12-3464-2', 'Практичний посібник з програмування для початківців', 'Програмування для початківців', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/programming.jpg', find_category_by_parts('Пізнавальні, середній вік'), true, 'SB-2025-0009', '12+ років', 400, 'uk', 'Видавництво Старого Лева', 2023, 2, 2, 22.00, 110.00, 280.00, 220.00, 'Полиця Е-1', ARRAY['програмування', 'технології', 'навчання'], ARRAY['корисна', 'сучасна'], 'available'),

-- Современная проза
('Сучасна проза', 'Сучасний Автор', '978-617-12-3465-9', 'Сучасний роман про життя сучасних підлітків', 'Роман про сучасних підлітків', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/modern-prose.jpg', find_category_by_parts('Сучасна проза'), true, 'SB-2025-0010', '14+ років', 300, 'uk', 'А-БА-БА-ГА-ЛА-МА-ГА', 2023, 1, 1, 18.00, 90.00, 220.00, 180.00, 'Полиця Ж-1', ARRAY['сучасна проза', 'підлітковий вік'], ARRAY['нова'], 'available')

ON CONFLICT (code) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    isbn = EXCLUDED.isbn,
    description = EXCLUDED.description,
    short_description = EXCLUDED.short_description,
    cover_url = EXCLUDED.cover_url,
    category_id = EXCLUDED.category_id,
    age_range = EXCLUDED.age_range,
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

-- 3. Проверяем результат загрузки
SELECT 
    'Массовая загрузка завершена!' as status,
    (SELECT COUNT(*) FROM public.books) as total_books,
    (SELECT COUNT(*) FROM public.books WHERE available = true) as available_books,
    (SELECT COUNT(DISTINCT category_id) FROM public.books WHERE category_id IS NOT NULL) as categories_with_books,
    (SELECT COUNT(DISTINCT author) FROM public.books) as unique_authors;

-- 4. Показываем статистику по категориям
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

-- 5. Показываем все загруженные книги
SELECT 
    b.title,
    b.author,
    b.code,
    c.name as category_name,
    pc.name as parent_category,
    b.age_range,
    b.available,
    b.qty_available,
    b.qty_total,
    b.created_at
FROM public.books b
LEFT JOIN public.categories c ON b.category_id = c.id
LEFT JOIN public.categories pc ON c.parent_id = pc.id
ORDER BY b.created_at DESC;
