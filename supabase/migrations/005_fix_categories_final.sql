-- ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ СИСТЕМЫ КАТЕГОРИЙ
-- Этот файл учитывает все ошибки и ограничения

-- 1. Очистить существующие данные
TRUNCATE TABLE categories RESTART IDENTITY CASCADE;

-- 2. Удалить проблемные constraints и индексы в правильном порядке
DO $$
BEGIN
    -- Удалить constraint для slug если существует
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE table_name = 'categories' AND constraint_name = 'categories_slug_key') THEN
        ALTER TABLE categories DROP CONSTRAINT categories_slug_key;
    END IF;
    
    -- Удалить constraint для name если существует  
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE table_name = 'categories' AND constraint_name = 'categories_name_key') THEN
        ALTER TABLE categories DROP CONSTRAINT categories_name_key;
    END IF;
    
    -- Удалить индексы если существуют
    DROP INDEX IF EXISTS categories_slug_idx;
    DROP INDEX IF EXISTS categories_name_idx;
    DROP INDEX IF EXISTS categories_parent_id_idx;
    DROP INDEX IF EXISTS categories_sort_order_idx;
END
$$;

-- 3. Добавить недостающие колонки
DO $$
BEGIN
    -- Добавить name_en если не существует
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'name_en') THEN
        ALTER TABLE categories ADD COLUMN name_en VARCHAR(255);
    END IF;
    
    -- Добавить slug если не существует  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'slug') THEN
        ALTER TABLE categories ADD COLUMN slug VARCHAR(255);
    END IF;
    
    -- Добавить sort_order если не существует
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'sort_order') THEN
        ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
    
    -- Добавить is_active если не существует
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'is_active') THEN
        ALTER TABLE categories ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Добавить created_at если не существует
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'created_at') THEN
        ALTER TABLE categories ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- Добавить updated_at если не существует
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'updated_at') THEN
        ALTER TABLE categories ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END
$$;

-- 4. Добавить УКРАИНСКУЮ ИЕРАРХИЧЕСКУЮ СТРУКТУРУ КАТЕГОРИЙ

-- РОДИТЕЛЬСКИЕ КАТЕГОРИИ (УРОВЕНЬ 1)
INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active) VALUES
('За віком', 'By Age', 'age', NULL, '👶', '#F59E0B', 1, TRUE),
('За жанром', 'By Genre', 'genre', NULL, '📚', '#10B981', 2, TRUE),
('Для дорослих', 'For Adults', 'adults', NULL, '👨‍💼', '#6366F1', 3, TRUE);

-- КАТЕГОРИИ ПО ВОЗРАСТУ (УРОВЕНЬ 2)
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

-- КАТЕГОРИИ ПО ЖАНРАМ (УРОВЕНЬ 2)
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

-- КАТЕГОРИИ ДЛЯ ВЗРОСЛЫХ (УРОВЕНЬ 2)
INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active) 
SELECT 
    'Психологія і саморозвиток', 'Psychology & Self-Development', 'psychology', id, '🧠', '#E0E7FF', 1, TRUE
FROM categories WHERE slug = 'adults';

INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active) 
SELECT 
    'Сучасна проза', 'Contemporary Fiction', 'contemporary', id, '📚', '#E0E7FF', 2, TRUE
FROM categories WHERE slug = 'adults';

-- 5. Создать новые индексы (БЕЗ UNIQUE CONSTRAINT для slug, чтобы избежать проблем)
CREATE INDEX IF NOT EXISTS categories_slug_idx ON categories(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON categories(parent_id);
CREATE INDEX IF NOT EXISTS categories_sort_order_idx ON categories(sort_order);

-- 6. Создать функцию обновления timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создать триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Включить RLS если не включена
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Создать политики безопасности
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
CREATE POLICY "Enable read access for all users" ON categories
    FOR SELECT USING (is_active = true);

-- 8. Вывести результат миграции
SELECT 'Categories migration completed successfully!' AS result;
SELECT COUNT(*) as total_categories FROM categories;
SELECT COUNT(*) as parent_categories FROM categories WHERE parent_id IS NULL;
SELECT COUNT(*) as child_categories FROM categories WHERE parent_id IS NOT NULL;

-- Показать структуру категорий
SELECT 
    CASE WHEN parent_id IS NULL THEN '📁 ' || name ELSE '  └── ' || name END as category_structure,
    slug,
    icon
FROM categories 
ORDER BY 
    CASE WHEN parent_id IS NULL THEN sort_order ELSE 100 + sort_order END,
    parent_id NULLS FIRST;