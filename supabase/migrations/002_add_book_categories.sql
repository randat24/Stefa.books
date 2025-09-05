-- Добавление полей для связи книг с категориями (если они еще не добавлены)
-- Выполнять только если поля отсутствуют

-- Добавить поле для связи с жанровой категорией
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'books' AND column_name = 'category_id') THEN
        ALTER TABLE books ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
        CREATE INDEX idx_books_category_id ON books(category_id);
    END IF;
END
$$;

-- Добавить поле для связи с возрастной категорией
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'books' AND column_name = 'age_category_id') THEN
        ALTER TABLE books ADD COLUMN age_category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
        CREATE INDEX idx_books_age_category_id ON books(age_category_id);
    END IF;
END
$$;

-- Заполнить данные категорий если они отсутствуют
INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order, is_active) 
SELECT * FROM (VALUES
-- Корневая категория каталога (если не существует)
('Повний каталог', 'full_catalog', 'catalog', NULL, '📚', '#3B82F6', 1, true),

-- Категории по возрасту
('За віком', 'by_age', 'age', (SELECT id FROM categories WHERE slug = 'catalog' LIMIT 1), '👶', '#F59E0B', 1, true),
('Найменші', 'toddlers', 'toddlers', (SELECT id FROM categories WHERE slug = 'age' LIMIT 1), '🍼', '#FEF3C7', 1, true),
('Дошкільний вік', 'preschool', 'preschool', (SELECT id FROM categories WHERE slug = 'age' LIMIT 1), '🧸', '#FDE68A', 2, true),
('Молодший вік', 'elementary', 'elementary', (SELECT id FROM categories WHERE slug = 'age' LIMIT 1), '🎒', '#FBBF24', 3, true),
('Середній вік', 'middle', 'middle', (SELECT id FROM categories WHERE slug = 'age' LIMIT 1), '📖', '#F59E0B', 4, true),
('Підлітковий вік', 'teen', 'teen', (SELECT id FROM categories WHERE slug = 'age' LIMIT 1), '🎓', '#D97706', 5, true),

-- Категории по жанру
('За жанром', 'by_genre', 'genre', (SELECT id FROM categories WHERE slug = 'catalog' LIMIT 1), '📚', '#10B981', 2, true),
('Казки', 'fairy_tales', 'fairy-tales', (SELECT id FROM categories WHERE slug = 'genre' LIMIT 1), '🧚', '#D1FAE5', 1, true),
('Пізнавальні', 'educational', 'educational', (SELECT id FROM categories WHERE slug = 'genre' LIMIT 1), '🔬', '#A7F3D0', 2, true),
('Детектив', 'detective', 'detective', (SELECT id FROM categories WHERE slug = 'genre' LIMIT 1), '🔍', '#6EE7B7', 3, true),
('Пригоди', 'adventure', 'adventure', (SELECT id FROM categories WHERE slug = 'genre' LIMIT 1), '🗺️', '#34D399', 4, true),
('Повість', 'novel', 'novel', (SELECT id FROM categories WHERE slug = 'genre' LIMIT 1), '📝', '#10B981', 5, true),
('Фентезі', 'fantasy', 'fantasy', (SELECT id FROM categories WHERE slug = 'genre' LIMIT 1), '🐉', '#059669', 6, true),
('Реалістична проза', 'realistic', 'realistic', (SELECT id FROM categories WHERE slug = 'genre' LIMIT 1), '🌍', '#047857', 7, true),
('Романтика', 'romance', 'romance', (SELECT id FROM categories WHERE slug = 'genre' LIMIT 1), '💝', '#065F46', 8, true),

-- Категории для взрослых
('Для дорослих', 'for_adults', 'adults', (SELECT id FROM categories WHERE slug = 'catalog' LIMIT 1), '👥', '#8B5CF6', 3, true),
('Психологія і саморозвиток', 'psychology', 'psychology', (SELECT id FROM categories WHERE slug = 'adults' LIMIT 1), '🧠', '#DDD6FE', 1, true),
('Сучасна проза', 'modern_prose', 'modern-prose', (SELECT id FROM categories WHERE slug = 'adults' LIMIT 1), '✍️', '#C4B5FD', 2, true)
) AS v(name, name_en, slug, parent_id, icon, color, sort_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = v.slug)
ON CONFLICT (slug) DO NOTHING;

-- Обновить статистику таблиц
ANALYZE categories;
ANALYZE books;