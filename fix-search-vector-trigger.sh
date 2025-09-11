#!/bin/bash

# Fix Search Vector Trigger Script
# This script fixes the "record 'new' has no field 'tsvector'" error

echo "🔧 Fixing search vector trigger issue..."

# Check if we're in the right directory
if [ ! -f "FIX_SEARCH_VECTOR_TRIGGER_V6.sql" ]; then
    echo "❌ Error: FIX_SEARCH_VECTOR_TRIGGER_V6.sql not found in current directory"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set it with your Supabase connection string"
    echo "Example: export DATABASE_URL='postgresql://postgres:[password]@[host]:5432/postgres'"
    exit 1
fi

echo "📊 Current database status before fix:"
psql "$DATABASE_URL" -c "
SELECT 
    'Books count' as metric,
    COUNT(*) as value
FROM public.books
UNION ALL
SELECT 
    'Books with search_vector' as metric,
    COUNT(*) as value
FROM public.books 
WHERE search_vector IS NOT NULL
UNION ALL
SELECT 
    'Books with search_text' as metric,
    COUNT(*) as value
FROM public.books 
WHERE search_text IS NOT NULL;
"

echo ""
echo "🔧 Applying search vector trigger fix..."
psql "$DATABASE_URL" -f FIX_SEARCH_VECTOR_TRIGGER_V6.sql

if [ $? -eq 0 ]; then
    echo "✅ Search vector trigger fix applied successfully!"
    
    echo ""
    echo "📊 Database status after fix:"
    psql "$DATABASE_URL" -c "
    SELECT 
        'Books count' as metric,
        COUNT(*) as value
    FROM public.books
    UNION ALL
    SELECT 
        'Books with search_vector' as metric,
        COUNT(*) as value
    FROM public.books 
    WHERE search_vector IS NOT NULL
    UNION ALL
    SELECT 
        'Books with search_text' as metric,
        COUNT(*) as value
    FROM public.books 
    WHERE search_text IS NOT NULL;
    "
    
    echo ""
    echo "🎉 Fix completed! You can now try importing the remaining 31 books from CSV."
    echo "The search vector trigger should now work correctly."
else
    echo "❌ Error applying the fix. Please check the error messages above."
    exit 1
fi
