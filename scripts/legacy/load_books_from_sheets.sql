-- Загрузка книг из Google Sheets
-- Выполните этот скрипт после создания таблиц

-- Пример данных книг (замените на реальные данные из Google Sheets)
INSERT INTO public.books (title, author, isbn, description, cover_url, category_id, available, code) VALUES

-- Дитяча література
('Пригоди Тома Сойєра', 'Марк Твен', '978-617-12-3456-7', 'Класичний роман про пригоди хлопчика Тома Сойєра', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/tom-sawyer.jpg', (SELECT id FROM public.categories WHERE name = 'Дитяча література'), true, 'SB-2025-0001'),
('Аліса в Країні Чудес', 'Льюїс Керролл', '978-617-12-3457-4', 'Казкова історія про дівчинку Алісу', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/alice.jpg', (SELECT id FROM public.categories WHERE name = 'Дитяча література'), true, 'SB-2025-0002'),
('Маленький принц', 'Антуан де Сент-Екзюпері', '978-617-12-3458-1', 'Філософська казка про маленького принца', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/little-prince.jpg', (SELECT id FROM public.categories WHERE name = 'Дитяча література'), true, 'SB-2025-0003'),

-- Художня література
('1984', 'Джордж Орвелл', '978-617-12-3459-8', 'Антиутопічний роман про тоталітарне суспільство', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/1984.jpg', (SELECT id FROM public.categories WHERE name = 'Художня література'), true, 'SB-2025-0004'),
('Гаррі Поттер і філософський камінь', 'Джоан Роулінг', '978-617-12-3460-4', 'Перша книга про пригоди Гаррі Поттера', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/harry-potter.jpg', (SELECT id FROM public.categories WHERE name = 'Художня література'), true, 'SB-2025-0005'),
('Війна і мир', 'Лев Толстой', '978-617-12-3461-1', 'Класичний роман про війну 1812 року', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/war-and-peace.jpg', (SELECT id FROM public.categories WHERE name = 'Художня література'), true, 'SB-2025-0006'),

-- Наукова література
('Коротка історія часу', 'Стівен Гокінг', '978-617-12-3462-8', 'Популярна книга про космологію', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/brief-history.jpg', (SELECT id FROM public.categories WHERE name = 'Наукова література'), true, 'SB-2025-0007'),
('Самітність', 'Мішель де Монтень', '978-617-12-3463-5', 'Філософські есе про життя', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/essays.jpg', (SELECT id FROM public.categories WHERE name = 'Наукова література'), true, 'SB-2025-0008'),

-- Психологія
('Мислення швидке і повільне', 'Даніель Канеман', '978-617-12-3464-2', 'Книга про психологію прийняття рішень', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/thinking.jpg', (SELECT id FROM public.categories WHERE name = 'Психологія'), true, 'SB-2025-0009'),
('Сила зараз', 'Екхарт Толле', '978-617-12-3465-9', 'Книга про духовне пробудження', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/power-of-now.jpg', (SELECT id FROM public.categories WHERE name = 'Психологія'), true, 'SB-2025-0010'),

-- Бізнес
('Багатий тато, бідний тато', 'Роберт Кійосакі', '978-617-12-3466-6', 'Книга про фінансову грамотність', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/rich-dad.jpg', (SELECT id FROM public.categories WHERE name = 'Бізнес'), true, 'SB-2025-0011'),
('7 звичок високоефективних людей', 'Стівен Кові', '978-617-12-3467-3', 'Книга про особисту ефективність', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/7-habits.jpg', (SELECT id FROM public.categories WHERE name = 'Бізнес'), true, 'SB-2025-0012')

ON CONFLICT (code) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    isbn = EXCLUDED.isbn,
    description = EXCLUDED.description,
    cover_url = EXCLUDED.cover_url,
    category_id = EXCLUDED.category_id,
    available = EXCLUDED.available,
    updated_at = NOW();

-- Проверяем результат
SELECT 
    'Книги загружены успешно!' as status,
    (SELECT COUNT(*) FROM public.books) as total_books,
    (SELECT COUNT(*) FROM public.books WHERE available = true) as available_books,
    (SELECT COUNT(DISTINCT category_id) FROM public.books) as categories_with_books;
