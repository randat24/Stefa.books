-- ============================================================================
-- DELETE EXISTING COVERS FROM CLOUDINARY
-- ============================================================================
-- Удаление существующих обложек из Cloudinary

-- Функция для получения списка всех обложек в Cloudinary
CREATE OR REPLACE FUNCTION get_cloudinary_covers()
RETURNS TABLE (
    public_id TEXT,
    url TEXT
) AS $$
BEGIN
    -- Возвращаем все обложки из таблицы books
    RETURN QUERY
    SELECT 
        substring(cover_url from 'stefa-books/([^/]+)') as public_id,
        cover_url as url
    FROM public.books 
    WHERE cover_url LIKE '%cloudinary.com%'
    AND cover_url LIKE '%stefa-books%';
END;
$$ LANGUAGE plpgsql;

-- Показать все обложки, которые будут удалены
SELECT 
    'Covers to be deleted:' as action,
    public_id,
    url
FROM get_cloudinary_covers();

-- ВАЖНО: Этот скрипт только показывает обложки для удаления
-- Для фактического удаления нужно использовать Cloudinary API
-- или веб-интерфейс Cloudinary

-- Статистика
SELECT 
    'Delete preparation completed!' as status,
    COUNT(*) as covers_to_delete
FROM get_cloudinary_covers();
