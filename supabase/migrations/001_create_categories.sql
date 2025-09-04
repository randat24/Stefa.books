-- Создание таблицы категорий с иерархической структурой
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255), -- Английское название для системы
  slug VARCHAR(255) NOT NULL UNIQUE,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  icon VARCHAR(50), -- Иконка для категории (emoji или lucide icon name)
  color VARCHAR(7), -- Цвет категории в hex формате
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для быстрого поиска
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);

-- Добавление поля для связи книг с категориями
ALTER TABLE books 
DROP COLUMN IF EXISTS category,
ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
ADD COLUMN age_category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Создание индексов для книг
CREATE INDEX idx_books_category_id ON books(category_id);
CREATE INDEX idx_books_age_category_id ON books(age_category_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Вставка основных категорий согласно структуре
INSERT INTO categories (name, name_en, slug, parent_id, icon, color, sort_order) VALUES
-- Корневая категория каталога
('Повний каталог', 'full_catalog', 'catalog', NULL, '📚', '#3B82F6', 1),

-- Категории по возрасту
('За віком', 'by_age', 'age', (SELECT id FROM categories WHERE slug = 'catalog'), '👶', '#F59E0B', 1),
('Найменші', 'toddlers', 'toddlers', (SELECT id FROM categories WHERE slug = 'age'), '🍼', '#FEF3C7', 1),
('Дошкільний вік', 'preschool', 'preschool', (SELECT id FROM categories WHERE slug = 'age'), '🧸', '#FDE68A', 2),
('Молодший вік', 'elementary', 'elementary', (SELECT id FROM categories WHERE slug = 'age'), '🎒', '#FBBF24', 3),
('Середній вік', 'middle', 'middle', (SELECT id FROM categories WHERE slug = 'age'), '📖', '#F59E0B', 4),
('Підлітковий вік', 'teen', 'teen', (SELECT id FROM categories WHERE slug = 'age'), '🎓', '#D97706', 5),

-- Категории по жанру
('За жанром', 'by_genre', 'genre', (SELECT id FROM categories WHERE slug = 'catalog'), '📚', '#10B981', 2),
('Казки', 'fairy_tales', 'fairy-tales', (SELECT id FROM categories WHERE slug = 'genre'), '🧚', '#D1FAE5', 1),
('Пізнавальні', 'educational', 'educational', (SELECT id FROM categories WHERE slug = 'genre'), '🔬', '#A7F3D0', 2),
('Детектив', 'detective', 'detective', (SELECT id FROM categories WHERE slug = 'genre'), '🔍', '#6EE7B7', 3),
('Пригоди', 'adventure', 'adventure', (SELECT id FROM categories WHERE slug = 'genre'), '🗺️', '#34D399', 4),
('Повість', 'novel', 'novel', (SELECT id FROM categories WHERE slug = 'genre'), '📝', '#10B981', 5),
('Фентезі', 'fantasy', 'fantasy', (SELECT id FROM categories WHERE slug = 'genre'), '🐉', '#059669', 6),
('Реалістична проза', 'realistic', 'realistic', (SELECT id FROM categories WHERE slug = 'genre'), '🌍', '#047857', 7),
('Романтика', 'romance', 'romance', (SELECT id FROM categories WHERE slug = 'genre'), '💝', '#065F46', 8),

-- Категории для взрослых
('Для дорослих', 'for_adults', 'adults', (SELECT id FROM categories WHERE slug = 'catalog'), '👥', '#8B5CF6', 3),
('Психологія і саморозвиток', 'psychology', 'psychology', (SELECT id FROM categories WHERE slug = 'adults'), '🧠', '#DDD6FE', 1),
('Сучасна проза', 'modern_prose', 'modern-prose', (SELECT id FROM categories WHERE slug = 'adults'), '✍️', '#C4B5FD', 2);

-- Создание функции для получения всех дочерних категорий
CREATE OR REPLACE FUNCTION get_category_tree(parent_uuid UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    name_en VARCHAR,
    slug VARCHAR,
    parent_id UUID,
    icon VARCHAR,
    color VARCHAR,
    description TEXT,
    sort_order INTEGER,
    level INTEGER,
    path TEXT[]
) AS $$
WITH RECURSIVE category_tree AS (
    -- Базовый случай: категории верхнего уровня или дети указанного parent_uuid
    SELECT 
        c.id, 
        c.name, 
        c.name_en,
        c.slug,
        c.parent_id,
        c.icon,
        c.color,
        c.description,
        c.sort_order,
        1 as level,
        ARRAY[c.name] as path
    FROM categories c
    WHERE 
        CASE 
            WHEN parent_uuid IS NULL THEN c.parent_id IS NULL
            ELSE c.parent_id = parent_uuid
        END
        AND c.is_active = TRUE
    
    UNION ALL
    
    -- Рекурсивный случай: дети найденных категорий
    SELECT 
        c.id,
        c.name,
        c.name_en,
        c.slug,
        c.parent_id,
        c.icon,
        c.color,
        c.description,
        c.sort_order,
        ct.level + 1,
        ct.path || c.name
    FROM categories c
    INNER JOIN category_tree ct ON c.parent_id = ct.id
    WHERE c.is_active = TRUE
)
SELECT * FROM category_tree
ORDER BY level, sort_order, name;
$$ LANGUAGE SQL;

-- Функция для получения хлебных крошек категории
CREATE OR REPLACE FUNCTION get_category_breadcrumbs(category_uuid UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    slug VARCHAR,
    level INTEGER
) AS $$
WITH RECURSIVE breadcrumbs AS (
    -- Начинаем с указанной категории
    SELECT 
        c.id,
        c.name,
        c.slug,
        c.parent_id,
        1 as level
    FROM categories c
    WHERE c.id = category_uuid
    
    UNION ALL
    
    -- Рекурсивно идем вверх по иерархии
    SELECT 
        c.id,
        c.name,
        c.slug,
        c.parent_id,
        b.level + 1
    FROM categories c
    INNER JOIN breadcrumbs b ON c.id = b.parent_id
)
SELECT 
    breadcrumbs.id,
    breadcrumbs.name,
    breadcrumbs.slug,
    breadcrumbs.level
FROM breadcrumbs
ORDER BY level DESC;
$$ LANGUAGE SQL;

-- Добавление RLS (Row Level Security) политик
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (все пользователи могут читать активные категории)
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (is_active = TRUE);

-- Политика для изменения (только админы)
CREATE POLICY "Categories are editable by admins only" ON categories
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Представление для простого получения категорий с родительскими данными
CREATE VIEW categories_with_parent AS
SELECT 
    c.id,
    c.name,
    c.name_en,
    c.slug,
    c.parent_id,
    p.name as parent_name,
    p.slug as parent_slug,
    c.icon,
    c.color,
    c.description,
    c.sort_order,
    c.is_active,
    c.created_at,
    c.updated_at
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
WHERE c.is_active = TRUE
ORDER BY c.sort_order, c.name;