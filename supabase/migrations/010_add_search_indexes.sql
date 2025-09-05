-- ADD PROPER SEARCH INDEXES FOR OPTIMIZED QUERIES
-- This migration adds GIN indexes for better search performance

-- 1. Drop existing indexes if they exist
DROP INDEX IF EXISTS books_search_vector_idx;
DROP INDEX IF EXISTS books_title_trgm_idx;
DROP INDEX IF EXISTS books_author_trgm_idx;
DROP INDEX IF EXISTS books_category_idx;
DROP INDEX IF EXISTS books_available_idx;
DROP INDEX IF EXISTS books_rating_idx;
DROP INDEX IF EXISTS books_created_at_idx;
DROP INDEX IF EXISTS books_category_id_idx;

-- 2. Create optimized GIN indexes for full-text search
CREATE INDEX books_search_vector_idx ON books USING GIN(search_vector);

-- 3. Create trigram indexes for ILIKE queries
CREATE INDEX books_title_trgm_idx ON books USING GIN(title gin_trgm_ops);
CREATE INDEX books_author_trgm_idx ON books USING GIN(author gin_trgm_ops);
CREATE INDEX books_category_trgm_idx ON books USING GIN(category gin_trgm_ops);

-- 4. Create indexes for filtering
CREATE INDEX books_category_id_idx ON books(category_id);
CREATE INDEX books_available_idx ON books(available);
CREATE INDEX books_rating_idx ON books(rating DESC NULLS LAST);
CREATE INDEX books_created_at_idx ON books(created_at DESC);

-- 5. Create composite indexes for common query patterns
CREATE INDEX books_category_available_idx ON books(category_id, available);
CREATE INDEX books_rating_available_idx ON books(rating DESC NULLS LAST, available);
CREATE INDEX books_category_rating_idx ON books(category_id, rating DESC NULLS LAST);

-- 6. Update categories indexes
DROP INDEX IF EXISTS categories_search_vector_idx;
DROP INDEX IF EXISTS categories_parent_id_idx;
DROP INDEX IF EXISTS categories_display_order_idx;
DROP INDEX IF EXISTS categories_slug_idx;

CREATE INDEX categories_search_vector_idx ON categories USING GIN(search_vector);
CREATE INDEX categories_parent_id_idx ON categories(parent_id);
CREATE INDEX categories_display_order_idx ON categories(display_order);
CREATE INDEX categories_slug_idx ON categories(slug);

-- 7. Update search_queries indexes
DROP INDEX IF EXISTS search_queries_query_idx;
DROP INDEX IF EXISTS search_queries_created_at_idx;
DROP INDEX IF EXISTS search_queries_results_count_idx;

CREATE INDEX search_queries_query_idx ON search_queries(query);
CREATE INDEX search_queries_created_at_idx ON search_queries(created_at DESC);
CREATE INDEX search_queries_results_count_idx ON search_queries(results_count);

-- 8. Result
SELECT 'Search indexes created successfully!' AS result;