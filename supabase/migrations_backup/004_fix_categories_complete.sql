-- ПОВНА ОЧИСТКА ТА ОНОВЛЕННЯ СИСТЕМИ КАТЕГОРІЙ
-- Цей міграційний файл виправляє всі проблеми з категоріями

-- 1. Очистити існуючі дані щоб уникнути конфліктів
TRUNCATE TABLE categories RESTART IDENTITY CASCADE;

-- 2. Додати відсутні колонки до існуючої таблиці
DO $$
BEGIN
    -- Додати name_en якщо не існує
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'name_en') THEN
        ALTER TABLE categories ADD COLUMN name_en VARCHAR(255);
    END IF;
    
    -- Додати slug якщо не існує  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'slug') THEN
        ALTER TABLE categories ADD COLUMN slug VARCHAR(255) UNIQUE;
    END IF;
    
    -- Додати sort_order якщо не існує
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'sort_order') THEN
        ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
    
    -- Додати is_active якщо не існує
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'is_active') THEN
        ALTER TABLE categories ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Додати created_at якщо не існує
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'created_at') THEN
        ALTER TABLE categories ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- Додати updated_at якщо не існує
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'updated_at') THEN
        ALTER TABLE categories ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END
$$;

-- 3. Видалити старі індекси та обмеження якщо існують
DROP INDEX IF EXISTS categories_slug_key;
DROP INDEX IF EXISTS categories_name_key;

-- 4. Створити нові індекси
CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_idx ON categories(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON categories(parent_id);
CREATE INDEX IF NOT EXISTS categories_sort_order_idx ON categories(sort_order);

-- 5. Додати ПОВНУ УКРАЇНСЬКУ ІЄРАРХІЧНУ СТРУКТУРУ КАТЕГОРІЙ

-- БАТЬКІВСЬКІ КАТЕГОРІЇ (РІВЕНЬ 1)
INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active) VALUES
('За віком', 'By Age', 'age', NULL, '👶', '#F59E0B', 1, TRUE),
('За жанром', 'By Genre', 'genre', NULL, '📚', '#10B981', 2, TRUE),
('Для дорослих', 'For Adults', 'adults', NULL, '👨‍💼', '#6366F1', 3, TRUE);

-- КАТЕГОРІЇ ЗА ВІКОМ (РІВЕНЬ 2)
INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active) 
SELECT 
    'Найменші (0-3 роки)', 'Toddlers (0-3 years)', 'toddlers', id, '🍼', '#FDE68A', 1, TRUE
FROM categories WHERE slug = 'age';

INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active) 
SELECT 
    'Дошкільний вік (3-6 років)', 'Preschool (3-6 years)', 'preschool', id, '🧸', '#FDE68A', 2, TRUE
FROM categories WHERE slug = 'age';

INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active) 
SELECT 
    'Молодший вік (6-9 років)', 'Elementary (6-9 years)', 'elementary', id, '🎒', '#FDE68A', 3, TRUE
FROM categories WHERE slug = 'age';

INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active) 
SELECT 
    'Середній вік (9-12 років)', 'Middle Grade (9-12 years)', 'middle-grade', id, '📖', '#FDE68A', 4, TRUE
FROM categories WHERE slug = 'age';

INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active) 
SELECT 
    'Підлітковий вік (12+ років)', 'Teen (12+ years)', 'teen', id, '🌟', '#FDE68A', 5, TRUE
FROM categories WHERE slug = 'age';

-- КАТЕГОРІЇ ЗА ЖАНРОМ (РІВЕНЬ 2)
INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active) 
SELECT 
    'Казки', 'Fairy Tales', 'fairy-tales', id, '🧚', '#D1FAE5', 1, TRUE
FROM categories WHERE slug = 'genre';

INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active) 
SELECT 
    'Пізнавальні', 'Educational', 'educational', id, '🔍', '#D1FAE5', 2, TRUE
FROM categories WHERE slug = 'genre';

INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active) 
SELECT 
    'Детектив', 'Mystery', 'mystery', id, '🔍', '#D1FAE5', 3, TRUE
FROM categories WHERE slug = 'genre';

INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active) 
SELECT 
    'Пригоди', 'Adventure', 'adventure', id, '⚡', '#D1FAE5', 4, TRUE
FROM categories WHERE slug = 'genre';

INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active) 
SELECT 
    'Повість', 'Novel', 'novel', id, '📔', '#D1FAE5', 5, TRUE
FROM categories WHERE slug = 'genre';

INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active) 
SELECT 
    'Фентезі', 'Fantasy', 'fantasy', id, '🐉', '#D1FAE5', 6, TRUE
FROM categories WHERE slug = 'genre';

INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active) 
SELECT 
    'Реалістична проза', 'Realistic Fiction', 'realistic', id, '🌍', '#D1FAE5', 7, TRUE
FROM categories WHERE slug = 'genre';

INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active) 
SELECT 
    'Романтика', 'Romance', 'romance', id, '💕', '#D1FAE5', 8, TRUE
FROM categories WHERE slug = 'genre';

-- КАТЕГОРІЇ ДЛЯ ДОРОСЛИХ (РІВЕНЬ 2)
INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active) 
SELECT 
    'Психологія і саморозвиток', 'Psychology & Self-Development', 'psychology', id, '🧠', '#E0E7FF', 1, TRUE
FROM categories WHERE slug = 'adults';

INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active) 
SELECT 
    'Сучасна проза', 'Contemporary Fiction', 'contemporary', id, '📚', '#E0E7FF', 2, TRUE
FROM categories WHERE slug = 'adults';

-- 6. Оновити функцію оновлення timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Створити тригер для автоматичного оновлення updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Включити RLS якщо не включена
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Створити політику для читання (всі можуть читати активні категорії)
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
CREATE POLICY "Enable read access for all users" ON categories
    FOR SELECT USING (is_active = true);

-- Створити політику для вставки/оновлення (тільки аутентифіковані користувачі)
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON categories;
CREATE POLICY "Enable insert for authenticated users only" ON categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON categories;
CREATE POLICY "Enable update for authenticated users only" ON categories
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 8. Вивести результат
SELECT 'Categories migration completed successfully' AS result;
SELECT COUNT(*) as total_categories FROM categories;
SELECT COUNT(*) as parent_categories FROM categories WHERE parent_id IS NULL;
SELECT COUNT(*) as child_categories FROM categories WHERE parent_id IS NOT NULL;