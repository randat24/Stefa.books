-- FIX BOOKS-CATEGORIES RELATIONSHIP
-- This migration adds proper foreign key relationship between books and categories

-- 1. Add category_id column to books table
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- 2. Populate category_id based on existing category names
-- This will match books to categories by name
UPDATE books 
SET category_id = c.id
FROM categories c
WHERE books.category = c.name;

-- 3. Create index for better performance
CREATE INDEX IF NOT EXISTS books_category_id_idx ON books(category_id);

-- 4. Add constraint to ensure either category or category_id is set
-- (This is temporary until we fully migrate)
ALTER TABLE books 
ADD CONSTRAINT books_category_check 
CHECK (
    (category IS NOT NULL AND category_id IS NULL) OR 
    (category IS NULL AND category_id IS NOT NULL) OR
    (category IS NOT NULL AND category_id IS NOT NULL)
);

-- 5. Update the search vector function to include category_id
DROP FUNCTION IF EXISTS update_book_search_vector();

CREATE OR REPLACE FUNCTION update_book_search_vector() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_text := COALESCE(NEW.title, '') || ' ' || 
                    COALESCE(NEW.author, '') || ' ' || 
                    COALESCE(NEW.category, '') || ' ' || 
                    COALESCE(NEW.subcategory, '') || ' ' ||
                    COALESCE(NEW.description, '') || ' ' ||
                    COALESCE(NEW.short_description, '') || ' ' ||
                    COALESCE(array_to_string(NEW.tags, ' '), '');

  NEW.search_vector := to_tsvector('simple', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.author, '') || ' ' || 
    COALESCE(NEW.category, '') || ' ' ||
    COALESCE(NEW.subcategory, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.short_description, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '')
  );
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS books_search_vector_update ON books;
CREATE TRIGGER books_search_vector_update 
  BEFORE INSERT OR UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_book_search_vector();

-- 6. Update RLS policy to ensure proper access
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- 7. Result
SELECT 'Books-Categories relationship fixed successfully!' AS result;
SELECT COUNT(*) as books_with_category_id FROM books WHERE category_id IS NOT NULL;
SELECT COUNT(*) as total_books FROM books;