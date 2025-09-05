-- Оновлення структури існуючої таблиці categories
-- Додаємо відсутні поля до існуючої таблиці

-- Додати поля які відсутні в існуючій таблиці
DO $$
BEGIN
    -- Додати name_en якщо не існує
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'name_en') THEN
        ALTER TABLE categories ADD COLUMN name_en VARCHAR(255);
    END IF;
    
    -- Додати slug якщо не існує
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'slug') THEN
        ALTER TABLE categories ADD COLUMN slug VARCHAR(255);
    END IF;
    
    -- Додати sort_order якщо не існує
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'sort_order') THEN
        ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
    
    -- Додати is_active якщо не існує
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'is_active') THEN
        ALTER TABLE categories ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Додати updated_at якщо не існує
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'updated_at') THEN
        ALTER TABLE categories ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END
$$;

-- Створити унікальний індекс для slug (якщо поле тепер існує)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'slug') THEN
        -- Спочатку заповнимо slug для існуючих записів
        UPDATE categories SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), 'і', 'i')) WHERE slug IS NULL;
        
        -- Створимо унікальний індекс якщо не існує
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'categories' AND indexname = 'categories_slug_key') THEN
            CREATE UNIQUE INDEX categories_slug_key ON categories(slug);
        END IF;
    END IF;
END
$$;

-- Створити індекси якщо не існують
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'categories' AND indexname = 'idx_categories_active') THEN
        CREATE INDEX idx_categories_active ON categories(is_active);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'categories' AND indexname = 'idx_categories_sort_order') THEN
        CREATE INDEX idx_categories_sort_order ON categories(sort_order);
    END IF;
END
$$;

-- Додати поля для зв'язку книг з категоріями
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'books' AND column_name = 'category_id') THEN
        ALTER TABLE books ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
        CREATE INDEX idx_books_category_id ON books(category_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'books' AND column_name = 'age_category_id') THEN
        ALTER TABLE books ADD COLUMN age_category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
        CREATE INDEX idx_books_age_category_id ON books(age_category_id);
    END IF;
END
$$;

-- Функція для автоматичного оновлення updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Тригер для автоматичного оновлення updated_at (якщо не існує)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at') THEN
        CREATE TRIGGER update_categories_updated_at 
            BEFORE UPDATE ON categories 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Додати нові українські категорії згідно з планом
INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active) VALUES
-- Кореневі категорії
('За віком', 'by_age', 'age', NULL, '👶', '#F59E0B', 1, true),
('За жанром', 'by_genre', 'genre', NULL, '📚', '#10B981', 2, true),
('Для дорослих', 'for_adults', 'adults', NULL, '👥', '#8B5CF6', 3, true)
ON CONFLICT (slug) DO NOTHING;

-- Вставити підкategорії за віком
INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active)
SELECT 
    v.name, v.name_en, v.slug, age_cat.id, v.icon, v.color, v.sort_order, v.is_active
FROM (VALUES
    ('Найменші', 'toddlers', 'toddlers', '🍼', '#FEF3C7', 1, true),
    ('Дошкільний вік', 'preschool', 'preschool', '🧸', '#FDE68A', 2, true),
    ('Молодший вік', 'elementary', 'elementary', '🎒', '#FBBF24', 3, true),
    ('Середній вік', 'middle', 'middle', '📖', '#F59E0B', 4, true),
    ('Підлітковий вік', 'teen', 'teen', '🎓', '#D97706', 5, true)
) AS v(name, name_en, slug, icon, color, sort_order, is_active)
CROSS JOIN (SELECT id FROM categories WHERE slug = 'age') AS age_cat
ON CONFLICT (slug) DO NOTHING;

-- Вставити підкategорії за жанром
INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active)
SELECT 
    v.name, v.name_en, v.slug, genre_cat.id, v.icon, v.color, v.sort_order, v.is_active
FROM (VALUES
    ('Казки', 'fairy_tales', 'fairy-tales', '🧚', '#D1FAE5', 1, true),
    ('Пізнавальні', 'educational', 'educational', '🔬', '#A7F3D0', 2, true),
    ('Детектив', 'detective', 'detective', '🔍', '#6EE7B7', 3, true),
    ('Пригоди', 'adventure', 'adventure', '🗺️', '#34D399', 4, true),
    ('Повість', 'novel', 'novel', '📝', '#10B981', 5, true),
    ('Фентезі', 'fantasy', 'fantasy', '🐉', '#059669', 6, true),
    ('Реалістична проза', 'realistic', 'realistic', '🌍', '#047857', 7, true),
    ('Романтика', 'romance', 'romance', '💝', '#065F46', 8, true)
) AS v(name, name_en, slug, icon, color, sort_order, is_active)
CROSS JOIN (SELECT id FROM categories WHERE slug = 'genre') AS genre_cat
ON CONFLICT (slug) DO NOTHING;

-- Вставити категорії для дорослих
INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active)
SELECT 
    v.name, v.name_en, v.slug, adult_cat.id, v.icon, v.color, v.sort_order, v.is_active
FROM (VALUES
    ('Психологія і саморозвиток', 'psychology', 'psychology', '🧠', '#DDD6FE', 1, true),
    ('Сучасна проза', 'modern_prose', 'modern-prose', '✍️', '#C4B5FD', 2, true)
) AS v(name, name_en, slug, icon, color, sort_order, is_active)
CROSS JOIN (SELECT id FROM categories WHERE slug = 'adults') AS adult_cat
ON CONFLICT (slug) DO NOTHING;

-- Оновити статистику таблиць
ANALYZE categories;
ANALYZE books;