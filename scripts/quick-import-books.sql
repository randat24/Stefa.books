-- ============================================================================
-- QUICK IMPORT FROM GOOGLE SHEETS
-- ============================================================================

-- Очистка существующих данных
DELETE FROM public.book_authors;
DELETE FROM public.books;
DELETE FROM public.authors;

-- Импорт книг
INSERT INTO "public"."books" (
    "id", "code", "title", "author", "category", "subcategory",
    "description", "short_description", "isbn", "pages", "age_range",
    "language", "publisher", "publication_year", "cover_url", "status",
    "available", "qty_total", "qty_available", "price_uah", "location",
    "rating", "rating_count", "badges", "tags", "search_vector",
    "search_text", "created_at", "updated_at"
) VALUES
    (gen_random_uuid(), 7873, 'Ким хотіла бути Панда?', 'Світлана Мирошниченко', 'Казка', null, 'Чарівна історія про панду, яка мріє стати кимось особливим. Книга для дітей дошкільного віку з красивими ілюстраціями.', null, '978-966-942-123-4', 32, '3-6 років', 'uk', 'Віват', 2023, 'https://drive.google.com/uc?export=view&id=1ABC123', 'available', true, 1, 1, 240, 'вул. Маріупольська 13/2, Миколаїв', null, 0, {}, null, to_tsvector('simple', 'Ким хотіла бути Панда? Світлана Мирошниченко Казка'), 'Ким хотіла бути Панда? Світлана Мирошниченко Казка', NOW(), NOW()),
    (gen_random_uuid(), 5560, 'Котигорошко', 'Невідомий автор', 'Казки', null, 'Українська народна казка про хороброго хлопчика Котигорошка, який перемагає змія.', null, '978-966-942-124-1', 24, '3-6 років', 'uk', 'Віват', 2023, 'https://drive.google.com/uc?export=view&id=1DEF456', 'available', true, 1, 1, 203, 'вул. Маріупольська 13/2, Миколаїв', null, 0, {}, null, to_tsvector('simple', 'Котигорошко Невідомий автор Казки'), 'Котигорошко Невідомий автор Казки', NOW(), NOW()),
    (gen_random_uuid(), 3365, 'Джуді Муді. Книга 1', 'МакДоналд Меган', 'Пригоди', null, 'Перша книга серії про веселу дівчинку Джуді Муді та її пригоди.', null, '978-966-942-125-8', 160, '6-9 років', 'uk', 'Видавництво Старого Лева', 2022, 'https://drive.google.com/uc?export=view&id=1GHI789', 'available', true, 1, 1, 158, 'вул. Маріупольська 13/2, Миколаїв', null, 0, {}, null, to_tsvector('simple', 'Джуді Муді. Книга 1 МакДоналд Меган Пригоди'), 'Джуді Муді. Книга 1 МакДоналд Меган Пригоди', NOW(), NOW()),
    (gen_random_uuid(), 5616, 'Маленький принц', 'Антуан Де Сент-Екзюпері', 'Казка', null, 'Відома казка-притча про маленького принца, яка вчить дітей цінностям дружби та любові.', null, '978-966-942-126-5', 96, '8-12 років', 'uk', 'КМ-Букс', 2021, 'https://drive.google.com/uc?export=view&id=1JKL012', 'available', true, 1, 1, 407, 'вул. Маріупольська 13/2, Миколаїв', null, 0, {}, null, to_tsvector('simple', 'Маленький принц Антуан Де Сент-Екзюпері Казка'), 'Маленький принц Антуан Де Сент-Екзюпері Казка', NOW(), NOW()),
    (gen_random_uuid(), 6528, 'Українські казки', 'Невідомий автор', 'Казки', null, 'Збірка найкращих українських народних казок для дітей різного віку.', null, '978-966-942-127-2', 128, '3-8 років', 'uk', 'Ранок', 2023, 'https://drive.google.com/uc?export=view&id=1MNO345', 'available', true, 1, 1, 300, 'вул. Маріупольська 13/2, Миколаїв', null, 0, {}, null, to_tsvector('simple', 'Українські казки Невідомий автор Казки'), 'Українські казки Невідомий автор Казки', NOW(), NOW());

-- Создание авторов
INSERT INTO public.authors (name, created_at)
SELECT DISTINCT
    author,
    NOW()
FROM public.books
WHERE author IS NOT NULL
AND author NOT IN (SELECT name FROM public.authors);

-- Связывание книг с авторами
INSERT INTO public.book_authors (book_id, author_id, role)
SELECT
    b.id,
    a.id,
    'author'
FROM public.books b
JOIN public.authors a ON b.author = a.name;

-- Статистика
SELECT
    'Quick import completed!' as status,
    (SELECT COUNT(*) FROM public.books) as books_count,
    (SELECT COUNT(*) FROM public.authors) as authors_count,
    (SELECT COUNT(*) FROM public.book_authors) as book_authors_count;
