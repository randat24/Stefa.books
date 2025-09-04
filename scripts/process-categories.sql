-- ============================================================================
-- PROCESS CATEGORIES FROM GOOGLE SHEETS
-- ============================================================================
-- Обработка категорий: разделение по запятым и создание отдельных записей

-- Функция для разделения категорий
CREATE OR REPLACE FUNCTION split_categories(category_string TEXT)
RETURNS TEXT[] AS $$
BEGIN
    IF category_string IS NULL OR category_string = '' THEN
        RETURN ARRAY[]::TEXT[];
    END IF;
    
    -- Разделяем по запятым и очищаем от пробелов
    RETURN string_to_array(trim(category_string), ',');
END;
$$ LANGUAGE plpgsql;

-- Пример использования:
-- SELECT split_categories('Пригоди, молодший вік, середній вік');
-- Результат: {"Пригоди","молодший вік","середній вік"}

-- Обновление категорий в существующих книгах
UPDATE public.books 
SET category = trim(split_part(category, ',', 1)),
    subcategory = CASE 
        WHEN position(',' in category) > 0 THEN 
            trim(substring(category from position(',' in category) + 1))
        ELSE NULL 
    END
WHERE category IS NOT NULL;

-- Проверка результата
SELECT 
    'Categories processed!' as status,
    COUNT(*) as total_books,
    COUNT(DISTINCT category) as unique_categories,
    COUNT(DISTINCT subcategory) as unique_subcategories
FROM public.books;
