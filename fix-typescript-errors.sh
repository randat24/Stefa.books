#!/bin/bash

# Script to fix common TypeScript errors

echo "Fixing TypeScript errors..."

# Find all files with book.category usage
files_with_category=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "book\.category" 2>/dev/null)

for file in $files_with_category; do
    echo "Fixing $file..."
    
    # Add import for getCategoryName if not already present
    if ! grep -q "getCategoryName" "$file"; then
        # Add import after existing imports
        sed -i '' '/^import.*from.*$/a\
import { getCategoryName } from "@/lib/utils/categoryUtils";
' "$file"
    fi
    
    # Replace book.category with getCategoryName(book.category_id)
    sed -i '' 's/book\.category/getCategoryName(book.category_id)/g' "$file"
done

echo "Fixed category usage in files:"
echo "$files_with_category"

echo "Done!"
