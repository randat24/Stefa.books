#!/bin/bash
# Скрипт для исправления цветовых классов Tailwind CSS v4.1

echo "🎨 Исправление цветовых классов для Tailwind CSS v4.1..."

# Mapping старых классов на новые
declare -A replacements=(
    # Red colors
    ["border-red-300"]="border-red-300"  # Keep as is, will be handled by CSS variables
    ["focus:ring-red-500"]="focus:ring-red-500"  # Keep as is
    ["focus:border-red-500"]="focus:border-red-500"  # Keep as is
    ["bg-red-600"]="bg-red-600"  # Keep as is
    ["hover:bg-red-700"]="hover:bg-red-700"  # Keep as is
    
    # Green colors  
    ["border-green-300"]="border-green-300"  # Keep as is
    ["focus:ring-green-500"]="focus:ring-green-500"  # Keep as is
    ["focus:border-green-500"]="focus:border-green-500"  # Keep as is
    ["bg-green-100"]="bg-green-100"  # Keep as is
    ["text-green-800"]="text-green-800"  # Keep as is
)

# Создадим файл с кастомными классами для компонентов
cat > src/app/globals-v4-compat.css << 'EOF'
/* Tailwind v4.1 Color Compatibility Classes */

/* Error styles */
.border-red-300 {
  border-color: rgb(252 165 165);
}

.focus\:ring-red-500:focus {
  outline: 2px solid rgb(239 68 68);
  outline-offset: 2px;
}

.focus\:border-red-500:focus {
  border-color: rgb(239 68 68);
}

.bg-red-600 {
  background-color: rgb(220 38 38);
}

.hover\:bg-red-700:hover {
  background-color: rgb(185 28 28);
}

/* Success styles */
.border-green-300 {
  border-color: rgb(134 239 172);
}

.focus\:ring-green-500:focus {
  outline: 2px solid rgb(34 197 94);
  outline-offset: 2px;
}

.focus\:border-green-500:focus {
  border-color: rgb(34 197 94);
}

.bg-green-100 {
  background-color: rgb(220 252 231);
}

.text-green-800 {
  color: rgb(22 101 52);
}

/* Gray styles */
.border-gray-300 {
  border-color: rgb(209 213 219);
}
EOF

echo "✅ Создан файл совместимости цветов: src/app/globals-v4-compat.css"

# Импортируем новый файл в главный CSS
if ! grep -q "globals-v4-compat.css" src/app/globals.css; then
    echo '@import "./globals-v4-compat.css";' >> src/app/globals.css
    echo "✅ Добавлен импорт в src/app/globals.css"
fi

echo "🎨 Исправление цветовых классов завершено!"
echo "📝 Все проблемные классы теперь поддерживаются через CSS совместимость"