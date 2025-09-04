-- Enable full-text search extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Books table with full-text search capabilities
CREATE TABLE books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  short_description TEXT,
  code TEXT UNIQUE,
  isbn TEXT,
  pages INTEGER,
  age_range TEXT,
  language TEXT DEFAULT 'uk',
  publisher TEXT,
  publication_year INTEGER,
  cover_url TEXT,
  status TEXT DEFAULT 'available', -- available, rented, maintenance, unavailable
  available BOOLEAN DEFAULT true,
  rating NUMERIC(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  price_daily NUMERIC(8,2),
  price_weekly NUMERIC(8,2), 
  price_monthly NUMERIC(8,2),
  badges TEXT[],
  tags TEXT[],
  
  -- Search optimization fields
  search_vector tsvector,
  search_text TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT books_rating_check CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT books_pages_check CHECK (pages > 0)
);

-- Authors table for better normalization
CREATE TABLE authors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  biography TEXT,
  birth_year INTEGER,
  nationality TEXT,
  website TEXT,
  search_vector tsvector,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories with hierarchical support  
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES categories(id),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  icon TEXT,
  color TEXT,
  search_vector tsvector,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Book-Author relationship (many-to-many)
CREATE TABLE book_authors (
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'author', -- author, illustrator, translator
  PRIMARY KEY (book_id, author_id, role)
);

-- Search analytics
CREATE TABLE search_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  search_time_ms NUMERIC(10,3),
  user_agent TEXT,
  ip_address INET,
  filters JSONB,
  clicked_results UUID[], -- Array of book IDs that were clicked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Full-text search indexes
CREATE INDEX books_search_vector_idx ON books USING GIN(search_vector);
CREATE INDEX books_title_trgm_idx ON books USING GIN(title gin_trgm_ops);
CREATE INDEX books_author_trgm_idx ON books USING GIN(author gin_trgm_ops);
CREATE INDEX books_category_idx ON books(category);
CREATE INDEX books_available_idx ON books(available);
CREATE INDEX books_rating_idx ON books(rating DESC);
CREATE INDEX books_created_at_idx ON books(created_at DESC);

-- Author indexes
CREATE INDEX authors_search_vector_idx ON authors USING GIN(search_vector);
CREATE INDEX authors_name_trgm_idx ON authors USING GIN(name gin_trgm_ops);

-- Category indexes  
CREATE INDEX categories_search_vector_idx ON categories USING GIN(search_vector);
CREATE INDEX categories_parent_id_idx ON categories(parent_id);
CREATE INDEX categories_display_order_idx ON categories(display_order);

-- Search analytics indexes
CREATE INDEX search_queries_query_idx ON search_queries(query);
CREATE INDEX search_queries_created_at_idx ON search_queries(created_at DESC);

-- Functions for updating search vectors
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

CREATE OR REPLACE FUNCTION update_author_search_vector() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple',
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.biography, '') || ' ' ||
    COALESCE(NEW.nationality, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_category_search_vector() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple',
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.description, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic search vector updates
CREATE TRIGGER books_search_vector_update 
  BEFORE INSERT OR UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_book_search_vector();

CREATE TRIGGER authors_search_vector_update 
  BEFORE INSERT OR UPDATE ON authors  
  FOR EACH ROW EXECUTE FUNCTION update_author_search_vector();

CREATE TRIGGER categories_search_vector_update
  BEFORE INSERT OR UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_category_search_vector();

-- Advanced search function with ranking
CREATE OR REPLACE FUNCTION search_books(
  query_text TEXT,
  category_filter TEXT[] DEFAULT NULL,
  author_filter TEXT[] DEFAULT NULL,
  available_only BOOLEAN DEFAULT FALSE,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
) RETURNS TABLE (
  id UUID,
  title TEXT,
  author TEXT,
  category TEXT,
  description TEXT,
  cover_url TEXT,
  available BOOLEAN,
  rating NUMERIC,
  rating_count INTEGER,
  relevance_score REAL
) AS $$
DECLARE
  query_tsquery tsquery;
BEGIN
  -- Convert query to tsquery with fallback for single terms
  BEGIN
    query_tsquery := plainto_tsquery('simple', query_text);
  EXCEPTION WHEN OTHERS THEN
    query_tsquery := to_tsquery('simple', query_text || ':*');
  END;

  RETURN QUERY
  SELECT 
    b.id,
    b.title,
    b.author,
    b.category,
    b.short_description as description,
    b.cover_url,
    b.available,
    b.rating,
    b.rating_count,
    -- Complex relevance scoring
    (
      -- Exact title match gets highest score
      CASE WHEN lower(b.title) = lower(query_text) THEN 10.0
           WHEN b.title ILIKE '%' || query_text || '%' THEN 8.0
           ELSE 0.0 END +
      -- Author match  
      CASE WHEN lower(b.author) = lower(query_text) THEN 7.0
           WHEN b.author ILIKE '%' || query_text || '%' THEN 5.0
           ELSE 0.0 END +
      -- Category match
      CASE WHEN lower(b.category) = lower(query_text) THEN 6.0
           WHEN b.category ILIKE '%' || query_text || '%' THEN 4.0  
           ELSE 0.0 END +
      -- Full-text search score
      ts_rank(b.search_vector, query_tsquery) * 3.0 +
      -- Similarity scores for fuzzy matching
      similarity(b.title, query_text) * 2.0 +
      similarity(b.author, query_text) * 1.5 +
      -- Rating bonus (small influence)
      (b.rating / 5.0) * 0.5 +
      -- Availability bonus
      CASE WHEN b.available THEN 0.2 ELSE 0.0 END
    ) as relevance_score
  FROM books b
  WHERE 
    -- Text search conditions
    (query_text = '' OR 
     query_text IS NULL OR
     b.search_vector @@ query_tsquery OR
     b.title ILIKE '%' || query_text || '%' OR
     b.author ILIKE '%' || query_text || '%' OR
     b.category ILIKE '%' || query_text || '%' OR
     similarity(b.title, query_text) > 0.3 OR
     similarity(b.author, query_text) > 0.3
    )
    -- Filters
    AND (category_filter IS NULL OR b.category = ANY(category_filter))
    AND (author_filter IS NULL OR b.author = ANY(author_filter))
    AND (NOT available_only OR b.available = true)
  ORDER BY relevance_score DESC, b.rating DESC, b.title
  LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get search suggestions
CREATE OR REPLACE FUNCTION get_search_suggestions(
  partial_query TEXT,
  limit_count INTEGER DEFAULT 10
) RETURNS TABLE (
  suggestion TEXT,
  type TEXT, -- 'title', 'author', 'category'
  count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  -- Book titles
  SELECT DISTINCT 
    b.title as suggestion,
    'title'::TEXT as type,
    1 as count
  FROM books b
  WHERE b.title ILIKE partial_query || '%'
  LIMIT limit_count/3
  
  UNION ALL
  
  -- Authors  
  SELECT DISTINCT
    b.author as suggestion,
    'author'::TEXT as type,
    COUNT(*)::INTEGER as count
  FROM books b  
  WHERE b.author ILIKE partial_query || '%'
  GROUP BY b.author
  LIMIT limit_count/3
  
  UNION ALL
  
  -- Categories
  SELECT DISTINCT
    b.category as suggestion, 
    'category'::TEXT as type,
    COUNT(*)::INTEGER as count
  FROM books b
  WHERE b.category ILIKE partial_query || '%'
  GROUP BY b.category
  LIMIT limit_count/3;
END;
$$ LANGUAGE plpgsql;