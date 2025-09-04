-- ============================================================================
-- SAMPLE DATA FOR STEFA.BOOKS DATABASE
-- ============================================================================

-- Вставляем категории
INSERT INTO public.categories (name, description, display_order, icon, color) VALUES
('Дитяча література', 'Книги для дітей віком від 0 до 12 років', 1, '👶', '#FFB6C1'),
('Підліткова література', 'Книги для підлітків віком від 12 до 18 років', 2, '🧒', '#87CEEB'),
('Казки', 'Народні та авторські казки для дітей', 3, '🏰', '#DDA0DD'),
('Пригоди', 'Пригодницькі історії та детективи', 4, '🗺️', '#98FB98'),
('Наука', 'Науково-популярні книги для дітей', 5, '🔬', '#F0E68C'),
('Енциклопедії', 'Довідкові та навчальні матеріали', 6, '📚', '#FFA07A')
ON CONFLICT (name) DO NOTHING;

-- Вставляем авторов
INSERT INTO public.authors (name, nationality, biography) VALUES
('Світлана Максименко', 'Україна', 'Українська дитяча письменниця'),
('Меґан Макдональд', 'США', 'Американська письменниця дитячих книг'),
('Олекса Стороженко', 'Україна', 'Класик української дитячої літератури'),
('Петро Синявський', 'Україна', 'Український дитячий письменник'),
('Марина Павленко', 'Україна', 'Сучасна українська авторка'),
('Енді Райлі', 'Великобританія', 'Британський дитячий письменник'),
('Захар Беркут', 'Україна', 'Український письменник'),
('Народні українські казки', 'Україна', 'Збірка традиційних українських казок')
ON CONFLICT (name) DO NOTHING;

-- Вставляем книги с реальными данными из mock.ts
INSERT INTO public.books (
    code, title, author, category, pages, status, available, 
    rating, rating_count, badges, short_description, age_range, cover_url,
    qty_total, qty_available
) VALUES
-- Дві білки і шишка з гілки
('DL-001', 'Дві білки і шишка з гілки', 'Світлана Максименко', 'Дитяча література', 
 32, 'available', true, 4.8, 156, ARRAY['Нове'], 
 'Чарівна історія про двох білочок та їхні пригоди в лісі. Книга навчає дітей дружбі, взаємодопомозі та турботі про природу. Яскраві ілюстрації та цікавий сюжет зачарують маленьких читачів віком від 3 років.',
 '3+', 'https://res.cloudinary.com/stefa-books/image/upload/v1/books/dvi-bilki-i-shishka-z-gilki_1.webp',
 3, 3),

-- Джуді Муді
('DL-002', 'Джуді Муді', 'Меґан Макдональд', 'Дитяча література',
 160, 'available', true, 4.7, 203, ARRAY['В тренді'],
 'Веселі пригоди незвичайної дівчинки Джуді Муді, яка завжди потрапляє в кумедні ситуації. Книга розвиває почуття гумору та допомагає дітям краще розуміти емоції. Ідеально для читання школярами.',
 '6+', 'https://res.cloudinary.com/stefa-books/image/upload/v1/books/dzhudi-mudi_8.webp',
 2, 2),

-- Гімназист і чорна рука
('DL-003', 'Гімназист і чорна рука', 'Олекса Стороженко', 'Дитяча література',
 200, 'issued', false, 4.5, 89, ARRAY['Класика'],
 'Захоплююча пригодницька повість про гімназиста та таємничі події. Класичний твір української дитячої літератури, який поєднує детектив з життям підлітків. Розвиває логічне мислення та цікавість до читання.',
 '10+', 'https://res.cloudinary.com/stefa-books/image/upload/v1/books/gimnazist-i-chorna-ruka_3.webp',
 2, 0),

-- Казочки Доні та Синочку
('KZ-001', 'Казочки Доні та Синочку', 'Народні українські казки', 'Казки',
 96, 'available', true, 4.9, 145, ARRAY['В тренді'],
 'Збірка українських народних казок про Доню та Синочка. Традиційні історії, які передавалися з покоління в покоління. Виховують добрі цінності та знайомлять дітей з українською культурою.',
 '4+', 'https://res.cloudinary.com/stefa-books/image/upload/v1/books/kazochki-doni-ta-sinochku-ukrains-ki-kazki.webp',
 4, 4),

-- Тракторець боїться
('DL-004', 'Тракторець боїться', 'Петро Синявський', 'Дитяча література',
 48, 'available', true, 4.6, 72, ARRAY['Нове'],
 'Добра історія про маленького тракторця, який подолав свої страхи. Книга допомагає дітям справлятися з власними переживаннями та вчить бути сміливими. Чудові ілюстрації та простий текст для найменших.',
 '3+', 'https://res.cloudinary.com/stefa-books/image/upload/v1/books/traktorec-boit-sja.webp',
 2, 2),

-- Під жовтим небом мрій
('PL-001', 'Під жовтим небом мрій', 'Марина Павленко', 'Підліткова література',
 240, 'available', true, 4.8, 118, ARRAY['В тренді'],
 'Лірична повість про підлітків, їхні мрії та перші кохання. Автор тонко передає емоції молодості та важливість віри в себе. Книга допомагає підліткам краще розуміти себе та свої почуття.',
 '12+', 'https://res.cloudinary.com/stefa-books/image/upload/v1/books/pid-zhovtim-nebom-mrij.webp',
 3, 3),

-- Заєць Гібіскус і чемпіонат лісу з футболу
('DL-005', 'Заєць Гібіскус і чемпіонат лісу з футболу', 'Енді Райлі', 'Дитяча література',
 128, 'available', true, 4.4, 91, ARRAY['Нове'],
 'Веселі пригоди зайця Гібіскуса на футбольному чемпіонаті. Книга поєднує спорт і гумор, навчаючи дітей важливості командної роботи та наполегливості. Ідеально для юних спортсменів.',
 '6+', 'https://res.cloudinary.com/stefa-books/image/upload/v1/books/zaec-gibiskus-i-chempionat-lisu-z-futbolu.webp',
 2, 2),

-- Захар Беркут
('PL-002', 'Захар Беркут', 'Іван Франко', 'Підліткова література',
 180, 'available', true, 4.7, 134, ARRAY['Класика'],
 'Історична повість Івана Франка про боротьбу карпатських горян проти монгольських завойовників. Яскравий твір про героїзм, патріотизм та любов до рідної землі. Класика української літератури.',
 '14+', 'https://res.cloudinary.com/stefa-books/image/upload/v1/books/zahar-berkut_4_1.webp',
 2, 2);

-- Вставляем тестовых пользователей
INSERT INTO public.users (
    name, email, phone, subscription_type, subscription_start, subscription_end, 
    status, address, pickup_location
) VALUES
('Анна Петренко', 'anna@example.com', '+380501234567', 'mini', 
 NOW() - INTERVAL '30 days', NOW() + INTERVAL '30 days', 'active',
 'вул. Шевченка 15, кв. 23', 'вул. Маріупольська 13/2'),

('Іван Коваленко', 'ivan@example.com', '+380671234567', 'maxi',
 NOW() - INTERVAL '15 days', NOW() + INTERVAL '45 days', 'active',
 'вул. Миру 8', 'вул. Маріупольська 13/2'),

('Марія Сидорова', 'maria@example.com', '+380931234567', 'premium',
 NOW() - INTERVAL '60 days', NOW() + INTERVAL '120 days', 'active', 
 'пр. Героїв України 42, кв. 15', 'вул. Маріупольська 13/2'),

('Олексій Мельник', 'oleksiy@example.com', '+380681234567', 'mini',
 NOW() - INTERVAL '90 days', NOW() - INTERVAL '30 days', 'inactive',
 'вул. Полтавська 33', 'вул. Маріупольська 13/2');

-- Вставляем активные аренды
INSERT INTO public.rentals (
    user_id, book_id, rental_date, due_date, status, pickup_location
) VALUES
-- Анна арендовала "Гімназист і чорна рука"
((SELECT id FROM public.users WHERE email = 'anna@example.com'),
 (SELECT id FROM public.books WHERE code = 'DL-003'),
 NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', 'active',
 'вул. Маріупольська 13/2'),

-- Иван арендовал две книги
((SELECT id FROM public.users WHERE email = 'ivan@example.com'),
 (SELECT id FROM public.books WHERE code = 'KZ-001'),
 NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', 'active',
 'вул. Маріупольська 13/2'),

((SELECT id FROM public.users WHERE email = 'ivan@example.com'),
 (SELECT id FROM public.books WHERE code = 'DL-001'),
 NOW() - INTERVAL '8 days', NOW() + INTERVAL '22 days', 'active',
 'вул. Маріупольська 13/2');

-- Вставляем платежи
INSERT INTO public.payments (
    user_id, amount_uah, payment_method, status, payment_date, description
) VALUES
-- Оплата подписки Анны (mini - 300 грн)
((SELECT id FROM public.users WHERE email = 'anna@example.com'),
 300.00, 'monobank', 'completed', NOW() - INTERVAL '30 days',
 'Подписка Mini на 1 месяц'),

-- Оплата подписки Ивана (maxi - 500 грн)
((SELECT id FROM public.users WHERE email = 'ivan@example.com'),
 500.00, 'online', 'completed', NOW() - INTERVAL '15 days',
 'Подписка Maxi на 1 месяц'),

-- Оплата подписки Марии (premium - 2500 грн за 6 месяцев)
((SELECT id FROM public.users WHERE email = 'maria@example.com'),
 2500.00, 'monobank', 'completed', NOW() - INTERVAL '60 days',
 'Подписка Premium на 6 месяцев'),

-- Просроченный платеж Олексия
((SELECT id FROM public.users WHERE email = 'oleksiy@example.com'),
 300.00, 'online', 'failed', NOW() - INTERVAL '35 days',
 'Попытка продления подписки Mini');

-- Вставляем поисковые запросы для аналитики
INSERT INTO public.search_queries (query, results_count, search_time_ms, filters) VALUES
('білки', 1, 45.2, '{"category": "Дитяча література"}'),
('казки', 3, 32.1, '{"available": true}'),
('підліткова', 2, 28.7, '{}'),
('Джуді', 1, 41.3, '{}'),
('футбол', 1, 38.9, '{"age": "6+"}'),
('тракторець', 1, 29.4, '{}'),
('класика', 2, 52.1, '{}'),
('мрії', 1, 35.8, '{"category": "Підліткова література"}');

-- Создаем связи книг и авторов
INSERT INTO public.book_authors (book_id, author_id, role) 
SELECT b.id, a.id, 'author'
FROM public.books b
JOIN public.authors a ON b.author = a.name;

-- Уведомление о завершении
SELECT 
    'База данных успешно заполнена!' as message,
    (SELECT COUNT(*) FROM public.books) as books_count,
    (SELECT COUNT(*) FROM public.users) as users_count,
    (SELECT COUNT(*) FROM public.rentals) as rentals_count,
    (SELECT COUNT(*) FROM public.payments) as payments_count,
    (SELECT COUNT(*) FROM public.categories) as categories_count,
    (SELECT COUNT(*) FROM public.authors) as authors_count;