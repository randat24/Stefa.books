#!/bin/bash

# 🚀 Скрипт автоматической настройки Stefa.Books для локальной разработки

set -e

echo "🚀 Настройка Stefa.Books для локальной разработки..."
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка Node.js
print_status "Проверка Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js не установлен. Установите Node.js 18+ с https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Требуется Node.js 18+, текущая версия: $(node --version)"
    exit 1
fi
print_success "Node.js $(node --version) ✓"

# Проверка pnpm
print_status "Проверка pnpm..."
if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm не установлен. Устанавливаем..."
    npm install -g pnpm
fi
print_success "pnpm $(pnpm --version) ✓"

# Проверка Git
print_status "Проверка Git..."
if ! command -v git &> /dev/null; then
    print_error "Git не установлен. Установите Git с https://git-scm.com"
    exit 1
fi
print_success "Git $(git --version) ✓"

# Переключение на ветку разработки
print_status "Переключение на ветку Lklhost..."
if git branch --list | grep -q "Lklhost"; then
    git checkout Lklhost
    print_success "Переключено на ветку Lklhost ✓"
else
    print_warning "Ветка Lklhost не найдена, остаемся на текущей ветке"
fi

# Установка зависимостей
print_status "Установка зависимостей..."
pnpm install
print_success "Зависимости установлены ✓"

# Очистка кэша
print_status "Очистка кэша..."
pnpm run clean:cache
print_success "Кэш очищен ✓"

# Создание .env.local если не существует
print_status "Проверка файла .env.local..."
if [ ! -f ".env.local" ]; then
    print_warning "Файл .env.local не найден. Создаем шаблон..."
    
    cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Environment
NODE_ENV=development
EOF
    
    print_warning "Создан файл .env.local с шаблоном"
    print_warning "⚠️  ВАЖНО: Заполните переменные окружения в .env.local"
else
    print_success "Файл .env.local уже существует ✓"
fi

# Проверка TypeScript
print_status "Проверка TypeScript..."
pnpm run type-check
print_success "TypeScript проверка пройдена ✓"

# Проверка ESLint
print_status "Проверка ESLint..."
pnpm run lint
print_success "ESLint проверка пройдена ✓"

# Проверка сборки
print_status "Проверка сборки..."
pnpm run build
print_success "Сборка успешна ✓"

echo ""
print_success "🎉 Настройка завершена успешно!"
echo ""
print_status "Следующие шаги:"
echo "1. Заполните переменные окружения в .env.local"
echo "2. Запустите проект: pnpm dev"
echo "3. Откройте http://localhost:3000 в браузере"
echo ""
print_status "Полезные команды:"
echo "• pnpm dev              - Запуск dev сервера"
echo "• pnpm build            - Сборка проекта"
echo "• pnpm test             - Запуск тестов"
echo "• pnpm lint:fix         - Исправление ESLint ошибок"
echo "• pnpm clean            - Очистка временных файлов"
echo ""
print_status "Документация:"
echo "• LOCAL_SETUP_GUIDE.md  - Полное руководство"
echo "• DATABASE_DOCUMENTATION.md - Документация БД"
echo "• README.md             - Основная документация"
echo ""

# Предложение запуска
read -p "Запустить проект сейчас? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Запуск проекта..."
    pnpm dev
fi
