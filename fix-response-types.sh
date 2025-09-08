#!/bin/bash

# Скрипт для исправления типов Response в API routes
echo "Исправление типов Response в API routes..."

# Находим все файлы route.ts в папке api
find src/app/api -name "route.ts" -type f | while read file; do
    echo "Обрабатываем файл: $file"
    
    # Создаем временный файл
    temp_file=$(mktemp)
    
    # Заменяем "as Response" на "as unknown as Response"
    sed 's/) as Response;/) as unknown as Response;/g' "$file" > "$temp_file"
    
    # Проверяем, изменился ли файл
    if ! cmp -s "$file" "$temp_file"; then
        echo "  ✓ Исправлен: $file"
        mv "$temp_file" "$file"
    else
        echo "  - Без изменений: $file"
        rm "$temp_file"
    fi
done

echo "Исправление завершено!"
