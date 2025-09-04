-- ============================================================================
-- ФИНАЛЬНАЯ БЕЗОПАСНАЯ ВСТАВКА ТЕСТОВЫХ ДАННЫХ
-- Этот скрипт можно запускать многократно - он не создаст дубликаты
-- Все CHECK constraints учтены правильно
-- ============================================================================

-- ============================================================================
-- КАТЕГОРИИ (с защитой от дублей)
-- ============================================================================

INSERT INTO public.categories (name, description, display_order, icon, color) VALUES
('Дитяча література', 'Книги для дітей віком від 0 до 12 років', 1, '👶', '#FFB6C1'),
('Підліткова література', 'Книги для підлітків віком від 12 до 18 років', 2, '🧒', '#87CEEB'),
('Казки', 'Народні та авторські казки для дітей', 3, '🏰', '#DDA0DD'),
('Пригоди', 'Пригодницькі історії та детективи', 4, '🗺️', '#98FB98'),
('Наука', 'Науково-популярні книги для дітей', 5, '🔬', '#F0E68C'),
('Енциклопедії', 'Довідкові та навчальні матеріали', 6, '📚', '#FFA07A')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- АВТОРЫ (с защитой от дублей)
-- ============================================================================

INSERT INTO public.authors (name, nationality, biography) VALUES
('Світлана Максименко', 'Україна', 'Українська дитяча письменниця'),
('Меґан Макдональд', 'США', 'Американська письменниця дитячих книг'),
('Олекса Стороженко', 'Україна', 'Класик української дитячої літератури'),
('Петро Синявський', 'Україна', 'Український дитячий письменник'),
('Марина Павленко', 'Україна', 'Сучасна українська авторка'),
('Енді Райлі', 'Великобританія', 'Британський дитячий письменник'),
('Захар Беркут', 'Україна', 'Український письменник'),
('Народні українські казки', 'Україна', 'Збірка традиційних українських казок'),
('Колектив авторів', 'Україна', 'Колективні роботи різних авторів')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- КНИГИ (с ON CONFLICT для избежания дублей)
-- ============================================================================

INSERT INTO public.books (
    code, title, author, category, pages, status, available, 
    rating, rating_count, badges, short_description, age_range, cover_url,
    qty_total, qty_available, price_uah, location
) VALUES
-- Дві білки і шишка з гілки
('DL-001', 'Дві білки і шишка з гілки', 'Світлана Максименко', 'Дитяча література', 
 32, 'available', true, 4.8, 156, ARRAY['Нове'], 
 'Чарівна історія про двох білочок та їхні пригоди в лісі. Книга навчає дітей дружбі, взаємодопомозі та турботі про природу.', 
 '3-7 років', 'https://res.cloudinary.com/dchx7vd97/image/upload/v1/stefa-books/covers/dvi-bilki-i-shishka-z-gilki_1.webp',
 2, 2, 150.00, 'Полиця A-1'),

-- Джуді Муді
('DL-002', 'Джуді Муді', 'Меґан Макдональд', 'Дитяча література', 
 128, 'available', true, 4.6, 203, ARRAY['Популярне'], 
 'Веселі пригоди дівчинки Джуді Муді, яка завжди потрапляє в кумедні ситуації. Серія книг, що розвиває почуття гумору у дітей.', 
 '6-10 років', 'https://res.cloudinary.com/dchx7vd97/image/upload/v1/stefa-books/covers/dzhudi-mudi_8.webp',
 3, 3, 220.00, 'Полиця A-2'),

-- Захар Беркут
('PL-001', 'Захар Беркут', 'Захар Беркут', 'Підліткова література', 
 184, 'available', true, 4.9, 312, ARRAY['Класика'], 
 'Історичний роман про боротьбу українського народу проти монгольської навали. Класика української літератури для підлітків.', 
 '12-16 років', 'https://res.cloudinary.com/dchx7vd97/image/upload/v1/stefa-books/covers/zahar-berkut_4_1.webp',
 2, 1, 280.00, 'Полиця B-1'),

-- Гімназист і чорна рука
('PG-001', 'Гімназист і чорна рука', 'Петро Синявський', 'Пригоди', 
 156, 'available', true, 4.4, 89, ARRAY['Детектив'], 
 'Захоплюючий детектив про гімназиста, який розкриває таємницю чорної руки. Книга тримає в напрузі до останньої сторінки.', 
 '10-14 років', 'https://res.cloudinary.com/dchx7vd97/image/upload/v1/stefa-books/covers/gimnazist-i-chorna-ruka_3.webp',
 1, 1, 195.00, 'Полиця C-1'),

-- Казочки Доні та Синочку
('KZ-001', 'Казочки Доні та Синочку', 'Народні українські казки', 'Казки', 
 64, 'available', true, 4.7, 134, ARRAY['Традиційні'], 
 'Збірка найкращих українських народних казок про Доню та Синочка. Ідеально для читання перед сном.', 
 '3-8 років', 'https://res.cloudinary.com/dchx7vd97/image/upload/v1/stefa-books/covers/kazochki-doni-ta-sinochku-ukrains-ki-kazki.webp',
 2, 2, 160.00, 'Полиця D-1'),

-- Заєць Гібіскус і чемпіонат лісу з футболу
('PG-002', 'Заєць Гібіскус і чемпіонат лісу з футболу', 'Енді Райлі', 'Пригоди', 
 92, 'available', true, 4.3, 76, ARRAY['Спорт'], 
 'Веселі пригоди зайця Гібіскуса на лісовому чемпіонаті з футболу. Книга про дружбу, командну роботу та спорт.', 
 '5-9 років', 'https://res.cloudinary.com/dchx7vd97/image/upload/v1/stefa-books/covers/zaec-gibiskus-i-chempionat-lisu-z-futbolu.webp',
 1, 0, 175.00, 'Полиця C-2'),

-- Тракторець боїться
('DL-003', 'Тракторець боїться', 'Марина Павленко', 'Дитяча література', 
 48, 'available', true, 4.5, 67, ARRAY['Емоції'], 
 'Історія про маленький тракторець, який навчається долати свої страхи. Допомагає дітям розуміти і долати власні переживання.', 
 '3-6 років', 'https://res.cloudinary.com/dchx7vd97/image/upload/v1/stefa-books/covers/traktorec-boit-sja.webp',
 1, 1, 140.00, 'Полиця A-3'),

-- Під жовтим небом мрій
('PL-002', 'Під жовтим небом мрій', 'Марина Павленко', 'Підліткова література', 
 168, 'available', true, 4.2, 95, ARRAY['Сучасне'], 
 'Сучасна історія про підлітків, їхні мрії та виклики. Книга про дружбу, самовизначення та пошук свого місця в світі.', 
 '12-16 років', 'https://res.cloudinary.com/dchx7vd97/image/upload/v1/stefa-books/covers/pid-zhovtim-nebom-mrij.webp',
 1, 1, 240.00, 'Полиця B-2'),

-- Енциклопедія для дітей
('EN-001', 'Дитяча енциклопедія тварин', 'Колектив авторів', 'Енциклопедії', 
 200, 'available', true, 4.6, 123, ARRAY['Освітні'], 
 'Захоплююча енциклопедія про тварин з яскравими ілюстраціями. Допомагає дітям вивчати природу та розвивати любов до тварин.', 
 '6-12 років', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
 1, 1, 320.00, 'Полиця E-1'),

-- Додаткова казка
('KZ-002', 'Котик і песик', 'Народні українські казки', 'Казки', 
 40, 'available', true, 4.4, 89, ARRAY['Традиційні'], 
 'Добра казка про дружбу котика і песика. Вчить дітей цінувати справжню дружбу та взаємодопомогу.', 
 '3-7 років', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=600&fit=crop',
 1, 1, 135.00, 'Полиця D-2')

ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- ТЕСТОВІ КОРИСТУВАЧІ 
-- subscription_type: 'mini', 'maxi', 'premium' (нижний регистр)
-- ============================================================================

INSERT INTO public.users (name, email, phone, subscription_type, subscription_start, subscription_end, status, address) VALUES
('Анна Коваленко', 'anna.kovalenko@gmail.com', '+380671234567', 'mini', '2024-01-15', '2024-07-15', 'active', 'вул. Шевченка 15, Миколаїв'),
('Олег Петренко', 'oleg.petrenko@ukr.net', '+380509876543', 'maxi', '2024-02-01', '2024-08-01', 'active', 'вул. Центральна 22, Миколаїв'),
('Марія Іванова', 'maria.ivanova@gmail.com', '+380631234567', 'mini', '2024-03-10', '2024-09-10', 'active', 'просп. Миру 8, Миколаїв'),
('Дмитро Сидоренко', 'dmytro.sydorenko@ukr.net', '+380951234567', 'premium', '2024-01-01', '2024-07-01', 'active', 'вул. Адмірала Макарова 45, Миколаїв'),
('Олена Мельник', 'olena.melnyk@gmail.com', '+380631112233', 'maxi', '2024-03-01', '2024-09-01', 'active', 'вул. Героїв України 12, Миколаїв')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- ТЕСТОВЫЕ АРЕНДЫ
-- ============================================================================

-- Аренда книги "Захар Беркут" пользователем Анной Коваленко
INSERT INTO public.rentals (user_id, book_id, rental_date, due_date, status) 
SELECT 
    u.id,
    b.id,
    NOW() - INTERVAL '3 days',
    NOW() + INTERVAL '7 days',
    'active'
FROM public.users u, public.books b 
WHERE u.email = 'anna.kovalenko@gmail.com' 
  AND b.code = 'PL-001'
  AND NOT EXISTS (
      SELECT 1 FROM public.rentals r 
      WHERE r.user_id = u.id AND r.book_id = b.id AND r.status = 'active'
  )
LIMIT 1;

-- Аренда книги "Заєць Гібіскус" пользователем Олегом Петренко  
INSERT INTO public.rentals (user_id, book_id, rental_date, due_date, status)
SELECT 
    u.id,
    b.id,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '13 days',
    'active'
FROM public.users u, public.books b 
WHERE u.email = 'oleg.petrenko@ukr.net' 
  AND b.code = 'PG-002'
  AND NOT EXISTS (
      SELECT 1 FROM public.rentals r 
      WHERE r.user_id = u.id AND r.book_id = b.id AND r.status = 'active'
  )
LIMIT 1;

-- ============================================================================
-- ТЕСТОВЫЕ ПЛАТЕЖИ 
-- payment_method: 'monobank', 'online', 'cash' (только эти значения допустимы)
-- ============================================================================

INSERT INTO public.payments (user_id, amount_uah, payment_method, status, payment_date, description)
SELECT 
    u.id,
    300.00,
    'monobank',
    'completed',
    NOW() - INTERVAL '5 days',
    'Оплата підписки Mini на 6 місяців'
FROM public.users u 
WHERE u.email = 'anna.kovalenko@gmail.com'
  AND NOT EXISTS (
      SELECT 1 FROM public.payments p 
      WHERE p.user_id = u.id
  )
LIMIT 1;

INSERT INTO public.payments (user_id, amount_uah, payment_method, status, payment_date, description)
SELECT 
    u.id,
    500.00,
    'online',
    'completed',
    NOW() - INTERVAL '2 days',
    'Оплата підписки Maxi на 6 місяців'
FROM public.users u 
WHERE u.email = 'oleg.petrenko@ukr.net'
  AND NOT EXISTS (
      SELECT 1 FROM public.payments p 
      WHERE p.user_id = u.id
  )
LIMIT 1;

INSERT INTO public.payments (user_id, amount_uah, payment_method, status, payment_date, description)
SELECT 
    u.id,
    2500.00,
    'cash',
    'completed',
    NOW() - INTERVAL '10 days',
    'Оплата підписки Premium на 6 місяців'
FROM public.users u 
WHERE u.email = 'dmytro.sydorenko@ukr.net'
  AND NOT EXISTS (
      SELECT 1 FROM public.payments p 
      WHERE p.user_id = u.id
  )
LIMIT 1;

-- ============================================================================
-- ТЕСТОВЫЕ ПОИСКОВЫЕ ЗАПРОСЫ (для аналитики)
-- ============================================================================

INSERT INTO public.search_queries (query, results_count, search_time_ms, filters) VALUES
('казки', 15, 45.2, '{"category": "Казки"}'),
('пригоди', 8, 32.1, '{"available_only": true}'),
('дитяча', 23, 67.8, '{"age_range": "3-7 років"}'),
('Марина Павленко', 2, 28.5, '{"author": "Марина Павленко"}'),
('енциклопедія', 3, 41.2, '{"category": "Енциклопедії"}')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ОБНОВЛЕНИЕ ПОИСКОВЫХ ВЕКТОРОВ
-- ============================================================================

-- Обновляем поисковые вектора для книг
UPDATE public.books SET 
    search_text = title || ' ' || author || ' ' || category || ' ' || COALESCE(description, '') || ' ' || COALESCE(short_description, ''),
    search_vector = to_tsvector('ukrainian', title || ' ' || author || ' ' || category || ' ' || COALESCE(description, '') || ' ' || COALESCE(short_description, ''))
WHERE search_vector IS NULL OR search_text IS NULL;

-- Обновляем поисковые вектора для авторов  
UPDATE public.authors SET 
    search_vector = to_tsvector('ukrainian', name || ' ' || COALESCE(biography, '') || ' ' || COALESCE(nationality, ''))
WHERE search_vector IS NULL;

-- Обновляем поисковые вектора для категорий
UPDATE public.categories SET 
    search_vector = to_tsvector('ukrainian', name || ' ' || COALESCE(description, ''))
WHERE search_vector IS NULL;

-- ============================================================================
-- ОБНОВЛЕНИЕ СЧЕТЧИКОВ ДОСТУПНОСТИ ПО АРЕНДАМ
-- ============================================================================

-- Обновляем доступность книг на основе активных аренд
UPDATE public.books 
SET 
    qty_available = GREATEST(0, qty_total - (
        SELECT COUNT(*) 
        FROM public.rentals 
        WHERE book_id = books.id 
        AND status IN ('active', 'overdue')
    )),
    status = CASE 
        WHEN qty_total - (
            SELECT COUNT(*) 
            FROM public.rentals 
            WHERE book_id = books.id 
            AND status IN ('active', 'overdue')
        ) > 0 THEN 'available'
        ELSE 'issued'
    END,
    available = (qty_total - (
        SELECT COUNT(*) 
        FROM public.rentals 
        WHERE book_id = books.id 
        AND status IN ('active', 'overdue')
    )) > 0;

-- ============================================================================
-- РЕЗУЛЬТАТ
-- ============================================================================

SELECT 
    (SELECT COUNT(*) FROM public.books) as books_count,
    (SELECT COUNT(*) FROM public.authors) as authors_count, 
    (SELECT COUNT(*) FROM public.categories) as categories_count,
    (SELECT COUNT(*) FROM public.users) as users_count,
    (SELECT COUNT(*) FROM public.rentals) as rentals_count,
    (SELECT COUNT(*) FROM public.payments) as payments_count,
    (SELECT COUNT(*) FROM public.search_queries) as queries_count,
    'Complete sample data inserted successfully! All constraints respected.' as message;