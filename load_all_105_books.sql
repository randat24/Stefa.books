-- ============================================================================
-- ЗАГРУЗКА ВСЕХ 105 КНИГ В БАЗУ ДАННЫХ
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

-- 2. Очищаем существующие книги (если нужно)
-- DELETE FROM public.books;

-- 3. Загружаем все 105 книг
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

-- Книги 1-20
('Пригоди Тома Сойєра', 'Марк Твен', '978-617-12-3456-7', 'Класичний роман про пригоди хлопчика Тома Сойєра', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/tom-sawyer.jpg', find_category_by_parts('Пригоди, молодший вік'), true, 'SB-2025-0001'),
('Аліса в Країні Чудес', 'Льюїс Керролл', '978-617-12-3457-4', 'Казкова історія про дівчинку Алісу', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/alice.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0002'),
('Гаррі Поттер і філософський камінь', 'Джоан Роулінг', '978-617-12-3458-1', 'Перша книга про пригоди Гаррі Поттера', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/harry-potter.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0003'),
('Детективна історія', 'Автор Детектив', '978-617-12-3459-8', 'Захоплюючий детектив', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/detective.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0004'),
('Книга про психологію', 'Психолог Автор', '978-617-12-3460-4', 'Книга про психологію та саморозвиток', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/psychology.jpg', find_category_by_parts('Психологія і саморозвиток'), true, 'SB-2025-0005'),
('Маленький принц', 'Антуан де Сент-Екзюпері', '978-617-12-3461-1', 'Філософська казка про маленького принца', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/little-prince.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0006'),
('Відьмак', 'Анджей Сапковський', '978-617-12-3462-8', 'Фентезійний роман про мисливця на монстрів', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/witcher.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0007'),
('Шерлок Холмс', 'Артур Конан Дойл', '978-617-12-3463-5', 'Збірка детективних оповідань', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/sherlock.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0008'),
('Як навчитися програмувати', 'Програміст Автор', '978-617-12-3464-2', 'Практичний посібник з програмування', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/programming.jpg', find_category_by_parts('Пізнавальні, середній вік'), true, 'SB-2025-0009'),
('Сучасна проза', 'Сучасний Автор', '978-617-12-3465-9', 'Сучасний роман про життя підлітків', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/modern-prose.jpg', find_category_by_parts('Сучасна проза'), true, 'SB-2025-0010'),
('Книга 11', 'Автор 11', '978-617-12-3466-6', 'Описание книги 11', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book11.jpg', find_category_by_parts('Пригоди, молодший вік'), true, 'SB-2025-0011'),
('Книга 12', 'Автор 12', '978-617-12-3467-3', 'Описание книги 12', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book12.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0012'),
('Книга 13', 'Автор 13', '978-617-12-3468-0', 'Описание книги 13', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book13.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0013'),
('Книга 14', 'Автор 14', '978-617-12-3469-7', 'Описание книги 14', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book14.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0014'),
('Книга 15', 'Автор 15', '978-617-12-3470-3', 'Описание книги 15', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book15.jpg', find_category_by_parts('Психологія і саморозвиток'), true, 'SB-2025-0015'),
('Книга 16', 'Автор 16', '978-617-12-3471-0', 'Описание книги 16', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book16.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0016'),
('Книга 17', 'Автор 17', '978-617-12-3472-7', 'Описание книги 17', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book17.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0017'),
('Книга 18', 'Автор 18', '978-617-12-3473-4', 'Описание книги 18', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book18.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0018'),
('Книга 19', 'Автор 19', '978-617-12-3474-1', 'Описание книги 19', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book19.jpg', find_category_by_parts('Пізнавальні, середній вік'), true, 'SB-2025-0019'),
('Книга 20', 'Автор 20', '978-617-12-3475-8', 'Описание книги 20', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book20.jpg', find_category_by_parts('Сучасна проза'), true, 'SB-2025-0020'),

-- Книги 21-40
('Книга 21', 'Автор 21', '978-617-12-3476-5', 'Описание книги 21', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book21.jpg', find_category_by_parts('Пригоди, молодший вік'), true, 'SB-2025-0021'),
('Книга 22', 'Автор 22', '978-617-12-3477-2', 'Описание книги 22', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book22.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0022'),
('Книга 23', 'Автор 23', '978-617-12-3478-9', 'Описание книги 23', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book23.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0023'),
('Книга 24', 'Автор 24', '978-617-12-3479-6', 'Описание книги 24', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book24.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0024'),
('Книга 25', 'Автор 25', '978-617-12-3480-2', 'Описание книги 25', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book25.jpg', find_category_by_parts('Психологія і саморозвиток'), true, 'SB-2025-0025'),
('Книга 26', 'Автор 26', '978-617-12-3481-9', 'Описание книги 26', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book26.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0026'),
('Книга 27', 'Автор 27', '978-617-12-3482-6', 'Описание книги 27', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book27.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0027'),
('Книга 28', 'Автор 28', '978-617-12-3483-3', 'Описание книги 28', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book28.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0028'),
('Книга 29', 'Автор 29', '978-617-12-3484-0', 'Описание книги 29', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book29.jpg', find_category_by_parts('Пізнавальні, середній вік'), true, 'SB-2025-0029'),
('Книга 30', 'Автор 30', '978-617-12-3485-7', 'Описание книги 30', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book30.jpg', find_category_by_parts('Сучасна проза'), true, 'SB-2025-0030'),
('Книга 31', 'Автор 31', '978-617-12-3486-4', 'Описание книги 31', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book31.jpg', find_category_by_parts('Пригоди, молодший вік'), true, 'SB-2025-0031'),
('Книга 32', 'Автор 32', '978-617-12-3487-1', 'Описание книги 32', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book32.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0032'),
('Книга 33', 'Автор 33', '978-617-12-3488-8', 'Описание книги 33', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book33.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0033'),
('Книга 34', 'Автор 34', '978-617-12-3489-5', 'Описание книги 34', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book34.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0034'),
('Книга 35', 'Автор 35', '978-617-12-3490-1', 'Описание книги 35', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book35.jpg', find_category_by_parts('Психологія і саморозвиток'), true, 'SB-2025-0035'),
('Книга 36', 'Автор 36', '978-617-12-3491-8', 'Описание книги 36', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book36.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0036'),
('Книга 37', 'Автор 37', '978-617-12-3492-5', 'Описание книги 37', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book37.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0037'),
('Книга 38', 'Автор 38', '978-617-12-3493-2', 'Описание книги 38', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book38.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0038'),
('Книга 39', 'Автор 39', '978-617-12-3494-9', 'Описание книги 39', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book39.jpg', find_category_by_parts('Пізнавальні, середній вік'), true, 'SB-2025-0039'),
('Книга 40', 'Автор 40', '978-617-12-3495-6', 'Описание книги 40', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book40.jpg', find_category_by_parts('Сучасна проза'), true, 'SB-2025-0040'),

-- Книги 41-60
('Книга 41', 'Автор 41', '978-617-12-3496-3', 'Описание книги 41', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book41.jpg', find_category_by_parts('Пригоди, молодший вік'), true, 'SB-2025-0041'),
('Книга 42', 'Автор 42', '978-617-12-3497-0', 'Описание книги 42', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book42.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0042'),
('Книга 43', 'Автор 43', '978-617-12-3498-7', 'Описание книги 43', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book43.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0043'),
('Книга 44', 'Автор 44', '978-617-12-3499-4', 'Описание книги 44', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book44.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0044'),
('Книга 45', 'Автор 45', '978-617-12-3500-7', 'Описание книги 45', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book45.jpg', find_category_by_parts('Психологія і саморозвиток'), true, 'SB-2025-0045'),
('Книга 46', 'Автор 46', '978-617-12-3501-4', 'Описание книги 46', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book46.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0046'),
('Книга 47', 'Автор 47', '978-617-12-3502-1', 'Описание книги 47', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book47.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0047'),
('Книга 48', 'Автор 48', '978-617-12-3503-8', 'Описание книги 48', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book48.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0048'),
('Книга 49', 'Автор 49', '978-617-12-3504-5', 'Описание книги 49', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book49.jpg', find_category_by_parts('Пізнавальні, середній вік'), true, 'SB-2025-0049'),
('Книга 50', 'Автор 50', '978-617-12-3505-2', 'Описание книги 50', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book50.jpg', find_category_by_parts('Сучасна проза'), true, 'SB-2025-0050'),
('Книга 51', 'Автор 51', '978-617-12-3506-9', 'Описание книги 51', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book51.jpg', find_category_by_parts('Пригоди, молодший вік'), true, 'SB-2025-0051'),
('Книга 52', 'Автор 52', '978-617-12-3507-6', 'Описание книги 52', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book52.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0052'),
('Книга 53', 'Автор 53', '978-617-12-3508-3', 'Описание книги 53', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book53.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0053'),
('Книга 54', 'Автор 54', '978-617-12-3509-0', 'Описание книги 54', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book54.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0054'),
('Книга 55', 'Автор 55', '978-617-12-3510-6', 'Описание книги 55', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book55.jpg', find_category_by_parts('Психологія і саморозвиток'), true, 'SB-2025-0055'),
('Книга 56', 'Автор 56', '978-617-12-3511-3', 'Описание книги 56', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book56.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0056'),
('Книга 57', 'Автор 57', '978-617-12-3512-0', 'Описание книги 57', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book57.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0057'),
('Книга 58', 'Автор 58', '978-617-12-3513-7', 'Описание книги 58', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book58.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0058'),
('Книга 59', 'Автор 59', '978-617-12-3514-4', 'Описание книги 59', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book59.jpg', find_category_by_parts('Пізнавальні, середній вік'), true, 'SB-2025-0059'),
('Книга 60', 'Автор 60', '978-617-12-3515-1', 'Описание книги 60', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book60.jpg', find_category_by_parts('Сучасна проза'), true, 'SB-2025-0060'),

-- Книги 61-80
('Книга 61', 'Автор 61', '978-617-12-3516-8', 'Описание книги 61', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book61.jpg', find_category_by_parts('Пригоди, молодший вік'), true, 'SB-2025-0061'),
('Книга 62', 'Автор 62', '978-617-12-3517-5', 'Описание книги 62', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book62.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0062'),
('Книга 63', 'Автор 63', '978-617-12-3518-2', 'Описание книги 63', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book63.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0063'),
('Книга 64', 'Автор 64', '978-617-12-3519-9', 'Описание книги 64', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book64.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0064'),
('Книга 65', 'Автор 65', '978-617-12-3520-5', 'Описание книги 65', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book65.jpg', find_category_by_parts('Психологія і саморозвиток'), true, 'SB-2025-0065'),
('Книга 66', 'Автор 66', '978-617-12-3521-2', 'Описание книги 66', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book66.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0066'),
('Книга 67', 'Автор 67', '978-617-12-3522-9', 'Описание книги 67', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book67.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0067'),
('Книга 68', 'Автор 68', '978-617-12-3523-6', 'Описание книги 68', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book68.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0068'),
('Книга 69', 'Автор 69', '978-617-12-3524-3', 'Описание книги 69', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book69.jpg', find_category_by_parts('Пізнавальні, середній вік'), true, 'SB-2025-0069'),
('Книга 70', 'Автор 70', '978-617-12-3525-0', 'Описание книги 70', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book70.jpg', find_category_by_parts('Сучасна проза'), true, 'SB-2025-0070'),
('Книга 71', 'Автор 71', '978-617-12-3526-7', 'Описание книги 71', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book71.jpg', find_category_by_parts('Пригоди, молодший вік'), true, 'SB-2025-0071'),
('Книга 72', 'Автор 72', '978-617-12-3527-4', 'Описание книги 72', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book72.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0072'),
('Книга 73', 'Автор 73', '978-617-12-3528-1', 'Описание книги 73', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book73.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0073'),
('Книга 74', 'Автор 74', '978-617-12-3529-8', 'Описание книги 74', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book74.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0074'),
('Книга 75', 'Автор 75', '978-617-12-3530-4', 'Описание книги 75', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book75.jpg', find_category_by_parts('Психологія і саморозвиток'), true, 'SB-2025-0075'),
('Книга 76', 'Автор 76', '978-617-12-3531-1', 'Описание книги 76', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book76.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0076'),
('Книга 77', 'Автор 77', '978-617-12-3532-8', 'Описание книги 77', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book77.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0077'),
('Книга 78', 'Автор 78', '978-617-12-3533-5', 'Описание книги 78', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book78.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0078'),
('Книга 79', 'Автор 79', '978-617-12-3534-2', 'Описание книги 79', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book79.jpg', find_category_by_parts('Пізнавальні, середній вік'), true, 'SB-2025-0079'),
('Книга 80', 'Автор 80', '978-617-12-3535-9', 'Описание книги 80', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book80.jpg', find_category_by_parts('Сучасна проза'), true, 'SB-2025-0080'),

-- Книги 81-100
('Книга 81', 'Автор 81', '978-617-12-3536-6', 'Описание книги 81', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book81.jpg', find_category_by_parts('Пригоди, молодший вік'), true, 'SB-2025-0081'),
('Книга 82', 'Автор 82', '978-617-12-3537-3', 'Описание книги 82', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book82.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0082'),
('Книга 83', 'Автор 83', '978-617-12-3538-0', 'Описание книги 83', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book83.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0083'),
('Книга 84', 'Автор 84', '978-617-12-3539-7', 'Описание книги 84', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book84.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0084'),
('Книга 85', 'Автор 85', '978-617-12-3540-3', 'Описание книги 85', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book85.jpg', find_category_by_parts('Психологія і саморозвиток'), true, 'SB-2025-0085'),
('Книга 86', 'Автор 86', '978-617-12-3541-0', 'Описание книги 86', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book86.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0086'),
('Книга 87', 'Автор 87', '978-617-12-3542-7', 'Описание книги 87', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book87.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0087'),
('Книга 88', 'Автор 88', '978-617-12-3543-4', 'Описание книги 88', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book88.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0088'),
('Книга 89', 'Автор 89', '978-617-12-3544-1', 'Описание книги 89', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book89.jpg', find_category_by_parts('Пізнавальні, середній вік'), true, 'SB-2025-0089'),
('Книга 90', 'Автор 90', '978-617-12-3545-8', 'Описание книги 90', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book90.jpg', find_category_by_parts('Сучасна проза'), true, 'SB-2025-0090'),
('Книга 91', 'Автор 91', '978-617-12-3546-5', 'Описание книги 91', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book91.jpg', find_category_by_parts('Пригоди, молодший вік'), true, 'SB-2025-0091'),
('Книга 92', 'Автор 92', '978-617-12-3547-2', 'Описание книги 92', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book92.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0092'),
('Книга 93', 'Автор 93', '978-617-12-3548-9', 'Описание книги 93', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book93.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0093'),
('Книга 94', 'Автор 94', '978-617-12-3549-6', 'Описание книги 94', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book94.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0094'),
('Книга 95', 'Автор 95', '978-617-12-3550-2', 'Описание книги 95', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book95.jpg', find_category_by_parts('Психологія і саморозвиток'), true, 'SB-2025-0095'),
('Книга 96', 'Автор 96', '978-617-12-3551-9', 'Описание книги 96', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book96.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0096'),
('Книга 97', 'Автор 97', '978-617-12-3552-6', 'Описание книги 97', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book97.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0097'),
('Книга 98', 'Автор 98', '978-617-12-3553-3', 'Описание книги 98', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book98.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0098'),
('Книга 99', 'Автор 99', '978-617-12-3554-0', 'Описание книги 99', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book99.jpg', find_category_by_parts('Пізнавальні, середній вік'), true, 'SB-2025-0099'),
('Книга 100', 'Автор 100', '978-617-12-3555-7', 'Описание книги 100', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book100.jpg', find_category_by_parts('Сучасна проза'), true, 'SB-2025-0100'),

-- Книги 101-105
('Книга 101', 'Автор 101', '978-617-12-3556-4', 'Описание книги 101', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book101.jpg', find_category_by_parts('Пригоди, молодший вік'), true, 'SB-2025-0101'),
('Книга 102', 'Автор 102', '978-617-12-3557-1', 'Описание книги 102', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book102.jpg', find_category_by_parts('Казки, дошкільний вік'), true, 'SB-2025-0102'),
('Книга 103', 'Автор 103', '978-617-12-3558-8', 'Описание книги 103', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book103.jpg', find_category_by_parts('Фентезі, підлітковий вік'), true, 'SB-2025-0103'),
('Книга 104', 'Автор 104', '978-617-12-3559-5', 'Описание книги 104', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book104.jpg', find_category_by_parts('Детектив, середній вік'), true, 'SB-2025-0104'),
('Книга 105', 'Автор 105', '978-617-12-3560-1', 'Описание книги 105', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book105.jpg', find_category_by_parts('Психологія і саморозвиток'), true, 'SB-2025-0105')

ON CONFLICT (code) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    isbn = EXCLUDED.isbn,
    description = EXCLUDED.description,
    cover_url = EXCLUDED.cover_url,
    category_id = EXCLUDED.category_id,
    updated_at = NOW();

-- 4. Проверяем результат
SELECT 
    'Загрузка завершена!' as status,
    (SELECT COUNT(*) FROM public.books) as total_books,
    (SELECT COUNT(*) FROM public.books WHERE available = true) as available_books,
    (SELECT COUNT(DISTINCT category_id) FROM public.books WHERE category_id IS NOT NULL) as categories_with_books,
    (SELECT COUNT(DISTINCT author) FROM public.books) as unique_authors;

-- 5. Показываем загруженные книги
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
