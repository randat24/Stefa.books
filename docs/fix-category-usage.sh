#!/bin/bash

# Script to fix book.category usage to book.category_id

echo "Fixing book.category usage..."

# Find all files with book.category usage
files_with_category=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "book\.category" 2>/dev/null)

for file in $files_with_category; do
    echo "Fixing $file..."
    
    # Replace book.category with book.category_id
    sed -i '' 's/book\.category/book.category_id/g' "$file"
done

echo "Fixed category usage in files:"
echo "$files_with_category"

echo "Done!"
