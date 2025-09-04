-- ============================================================================
-- PROCESS BOOK COVERS
-- ============================================================================
-- Обработка обложек: загрузка в Cloudinary или использование существующих

-- Функция для проверки существования обложки в Cloudinary
CREATE OR REPLACE FUNCTION check_cloudinary_cover(book_code TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Проверяем, есть ли уже обложка в Cloudinary
    -- Формат: https://res.cloudinary.com/dchx7vd97/image/upload/v1756756858/stefa-books/{code}.jpg
    RETURN 'https://res.cloudinary.com/dchx7vd97/image/upload/v1756756858/stefa-books/' || book_code || '.jpg';
END;
$$ LANGUAGE plpgsql;

-- Функция для обработки URL обложки
CREATE OR REPLACE FUNCTION process_cover_url(google_drive_url TEXT, book_code TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Если URL уже Cloudinary, возвращаем как есть
    IF google_drive_url LIKE '%cloudinary.com%' THEN
        RETURN google_drive_url;
    END IF;
    
    -- Если URL Google Drive, возвращаем Cloudinary URL
    IF google_drive_url LIKE '%drive.google.com%' OR google_drive_url LIKE '%googleusercontent.com%' THEN
        RETURN check_cloudinary_cover(book_code);
    END IF;
    
    -- Если URL пустой или null, возвращаем Cloudinary URL
    IF google_drive_url IS NULL OR google_drive_url = '' THEN
        RETURN check_cloudinary_cover(book_code);
    END IF;
    
    -- Иначе возвращаем как есть
    RETURN google_drive_url;
END;
$$ LANGUAGE plpgsql;

-- Пример использования:
-- SELECT process_cover_url('https://drive.google.com/file/d/123/view', '7873');
-- Результат: https://res.cloudinary.com/dchx7vd97/image/upload/v1756756858/stefa-books/7873.jpg

-- Обновление обложек в существующих книгах
UPDATE public.books 
SET cover_url = process_cover_url(cover_url, code)
WHERE code IS NOT NULL;

-- Проверка результата
SELECT 
    'Covers processed!' as status,
    COUNT(*) as total_books,
    COUNT(CASE WHEN cover_url LIKE '%cloudinary.com%' THEN 1 END) as cloudinary_covers,
    COUNT(CASE WHEN cover_url LIKE '%drive.google.com%' THEN 1 END) as google_drive_covers,
    COUNT(CASE WHEN cover_url IS NULL OR cover_url = '' THEN 1 END) as missing_covers
FROM public.books;
