#!/bin/bash

# 🔍 ПРЕДВАРИТЕЛЬНАЯ ПРОВЕРКА ПЕРЕД КОММИТОМ
# Автоматически запускается перед каждым коммитом

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Счетчик ошибок
ERRORS=0

# Функция для вывода сообщений
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    ((ERRORS++))
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Проверка статуса git
check_git_status() {
    log "Проверка статуса Git..."
    
    # Проверка на неотслеживаемые файлы
    if [ -n "$(git status --porcelain | grep '^??')" ]; then
        warning "Обнаружены неотслеживаемые файлы:"
        git status --porcelain | grep '^??' | sed 's/^?? /  - /'
        echo ""
    fi
    
    # Проверка на незакоммиченные изменения
    if [ -n "$(git status --porcelain | grep -v '^??')" ]; then
        info "Изменения для коммита:"
        git status --porcelain | grep -v '^??' | sed 's/^/  /'
        echo ""
    fi
}

# Проверка package.json
check_package_json() {
    log "Проверка package.json..."
    
    if [ ! -f "package.json" ]; then
        error "package.json не найден!"
        return 1
    fi
    
    # Проверка обязательных скриптов
    REQUIRED_SCRIPTS=("dev" "build" "start" "lint" "type-check")
    for script in "${REQUIRED_SCRIPTS[@]}"; do
        if ! grep -q "\"$script\":" package.json; then
            error "Отсутствует обязательный скрипт: $script"
        fi
    done
    
    # Проверка версии Node.js
    if grep -q '"engines"' package.json; then
        NODE_VERSION=$(node --version | sed 's/v//')
        REQUIRED_VERSION=$(grep -o '"node": "[^"]*"' package.json | sed 's/"node": "//' | sed 's/"//')
        
        if [ -n "$REQUIRED_VERSION" ]; then
            info "Требуемая версия Node.js: $REQUIRED_VERSION"
            info "Текущая версия Node.js: $NODE_VERSION"
        fi
    fi
    
    log "package.json проверен ✅"
}

# Проверка TypeScript
check_typescript() {
    log "Проверка TypeScript..."
    
    if [ ! -f "tsconfig.json" ]; then
        error "tsconfig.json не найден!"
        return 1
    fi
    
    # Проверка типов
    if pnpm run type-check > /dev/null 2>&1; then
        log "TypeScript проверка пройдена ✅"
    else
        error "TypeScript ошибки обнаружены!"
        warning "Запуск type-check для деталей..."
        pnpm run type-check || true
    fi
}

# Проверка ESLint
check_eslint() {
    log "Проверка ESLint..."
    
    # Проверка ESLint
    if pnpm run lint > /dev/null 2>&1; then
        log "ESLint проверка пройдена ✅"
    else
        warning "ESLint предупреждения обнаружены!"
        info "Запуск lint для деталей..."
        pnpm run lint || true
    fi
}

# Проверка сборки
check_build() {
    log "Проверка сборки..."
    
    # Очистка кеша перед проверкой
    pnpm run clean:cache > /dev/null 2>&1 || true
    
    # Попытка сборки
    if pnpm run build > /dev/null 2>&1; then
        log "Сборка успешна ✅"
    else
        error "Сборка не удалась!"
        warning "Запуск build для деталей..."
        pnpm run build || true
    fi
}

# Проверка критических файлов
check_critical_files() {
    log "Проверка критических файлов..."
    
    CRITICAL_FILES=(
        "next.config.js"
        "tsconfig.json"
        "tailwind.config.ts"
        "src/middleware.ts"
        "src/lib/supabase.ts"
    )
    
    for file in "${CRITICAL_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            error "Критический файл отсутствует: $file"
        else
            log "✓ $file"
        fi
    done
}

# Проверка environment variables
check_env_vars() {
    log "Проверка environment variables..."
    
    if [ ! -f ".env.local" ]; then
        warning ".env.local не найден!"
        info "Создайте .env.local с необходимыми переменными"
    else
        # Проверка обязательных переменных
        REQUIRED_VARS=(
            "NEXT_PUBLIC_SUPABASE_URL"
            "NEXT_PUBLIC_SUPABASE_ANON_KEY"
            "SUPABASE_SERVICE_ROLE_KEY"
        )
        
        for var in "${REQUIRED_VARS[@]}"; do
            if ! grep -q "^$var=" .env.local; then
                warning "Отсутствует переменная: $var"
            else
                log "✓ $var"
            fi
        done
    fi
}

# Проверка безопасности
check_security() {
    log "Проверка безопасности..."
    
    # Проверка на секреты в коде
    SECRET_PATTERNS=(
        "password.*=.*['\"].*['\"]"
        "secret.*=.*['\"].*['\"]"
        "key.*=.*['\"].*['\"]"
        "token.*=.*['\"].*['\"]"
    )
    
    for pattern in "${SECRET_PATTERNS[@]}"; do
        if grep -r -i "$pattern" src/ --exclude-dir=node_modules 2>/dev/null | grep -v "// TODO\|// FIXME\|// NOTE"; then
            warning "Возможные секреты в коде обнаружены!"
            info "Проверьте файлы на наличие захардкоженных секретов"
        fi
    done
    
    # Проверка на console.log в production коде
    if grep -r "console\.log\|console\.warn\|console\.error" src/ --exclude-dir=node_modules 2>/dev/null | grep -v "// TODO\|// FIXME"; then
        warning "console.log обнаружены в коде!"
        info "Удалите или закомментируйте console.log перед коммитом"
    fi
}

# Проверка стилей
check_styles() {
    log "Проверка стилей..."
    
    # Проверка на inline стили
    if grep -r "style=" src/ --exclude-dir=node_modules 2>/dev/null | grep -v "// TODO\|// FIXME"; then
        warning "Inline стили обнаружены!"
        info "Используйте Tailwind CSS классы вместо inline стилей"
    fi
    
    # Проверка на !important
    if grep -r "!important" src/ --exclude-dir=node_modules 2>/dev/null | grep -v "// TODO\|// FIXME"; then
        warning "!important обнаружен в коде!"
        info "Избегайте использования !important"
    fi
}

# Проверка админ панели
check_admin_panel() {
    log "Проверка админ панели..."
    
    # Проверка API endpoints админ панели
    ADMIN_APIS=(
        "src/app/api/admin/dashboard/route.ts"
        "src/app/api/admin/users/route.ts"
        "src/app/api/admin/books/route.ts"
    )
    
    for api in "${ADMIN_APIS[@]}"; do
        if [ -f "$api" ]; then
            # Проверка на наличие проверки прав доступа
            if ! grep -q "isAdminByEmail\|isAdminByRole" "$api"; then
                warning "API $api может не иметь проверки прав доступа!"
            else
                log "✓ $api"
            fi
        fi
    done
}

# Показать статистику
show_stats() {
    echo ""
    echo "📊 СТАТИСТИКА ПРОВЕРКИ"
    echo "====================="
    
    if [ $ERRORS -eq 0 ]; then
        log "Все проверки пройдены успешно! ✅"
        echo ""
        echo "🚀 Готово к коммиту!"
    else
        error "Обнаружено $ERRORS ошибок!"
        echo ""
        echo "❌ НЕ КОММИТЬТЕ до исправления ошибок!"
        echo ""
        echo "💡 Для быстрого исправления запустите:"
        echo "   ./scripts/emergency-fix.sh quick"
    fi
    
    echo ""
}

# Основная функция
main() {
    echo "🔍 ПРЕДВАРИТЕЛЬНАЯ ПРОВЕРКА ПЕРЕД КОММИТОМ"
    echo "=========================================="
    echo ""
    
    # Проверки
    check_git_status
    check_package_json
    check_critical_files
    check_env_vars
    check_typescript
    check_eslint
    check_build
    check_security
    check_styles
    check_admin_panel
    
    # Статистика
    show_stats
    
    # Возврат кода ошибки если есть проблемы
    if [ $ERRORS -gt 0 ]; then
        exit 1
    fi
}

# Запуск
main "$@"
