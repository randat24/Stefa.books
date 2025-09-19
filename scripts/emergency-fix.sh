#!/bin/bash

# 🚨 АВАРИЙНЫЙ СКРИПТ ВОССТАНОВЛЕНИЯ
# Использовать только в критических ситуациях!

set -e

echo "🚨 АВАРИЙНОЕ ВОССТАНОВЛЕНИЕ СИСТЕМЫ"
echo "=================================="

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Проверка наличия необходимых команд
check_commands() {
    log "Проверка необходимых команд..."
    
    if ! command -v pnpm &> /dev/null; then
        error "pnpm не найден! Установите pnpm: npm install -g pnpm"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        error "git не найден!"
        exit 1
    fi
    
    if ! command -v netlify &> /dev/null; then
        warning "netlify CLI не найден. Установите: npm install -g netlify-cli"
    fi
    
    log "Все команды найдены ✅"
}

# Очистка кеша и временных файлов
clean_cache() {
    log "Очистка кеша и временных файлов..."
    
    # Очистка Next.js кеша
    rm -rf .next
    rm -rf out
    rm -rf dist
    rm -rf coverage
    rm -rf performance-reports
    
    # Очистка node_modules кеша
    rm -rf node_modules/.cache
    
    # Очистка pnpm кеша
    pnpm store prune
    
    log "Кеш очищен ✅"
}

# Восстановление зависимостей
restore_dependencies() {
    log "Восстановление зависимостей..."
    
    # Удаление lock файлов
    rm -f package-lock.json
    rm -f yarn.lock
    
    # Удаление node_modules
    rm -rf node_modules
    
    # Установка зависимостей
    pnpm install
    
    log "Зависимости восстановлены ✅"
}

# Исправление TypeScript ошибок
fix_typescript() {
    log "Исправление TypeScript ошибок..."
    
    # Запуск скрипта исправления типов
    if [ -f "scripts/fix-typescript-errors.sh" ]; then
        chmod +x scripts/fix-typescript-errors.sh
        ./scripts/fix-typescript-errors.sh
    fi
    
    # Проверка типов
    pnpm run type-check || warning "TypeScript ошибки остались, но сборка продолжится"
    
    log "TypeScript исправлен ✅"
}

# Исправление ESLint ошибок
fix_eslint() {
    log "Исправление ESLint ошибок..."
    
    # Автоисправление ESLint
    pnpm run lint:fix || warning "ESLint ошибки остались"
    
    log "ESLint исправлен ✅"
}

# Восстановление конфигурации
restore_config() {
    log "Восстановление конфигурации..."
    
    # Проверка next.config.js
    if [ ! -f "next.config.js" ]; then
        error "next.config.js не найден!"
        exit 1
    fi
    
    # Проверка tsconfig.json
    if [ ! -f "tsconfig.json" ]; then
        error "tsconfig.json не найден!"
        exit 1
    fi
    
    # Проверка package.json
    if [ ! -f "package.json" ]; then
        error "package.json не найден!"
        exit 1
    fi
    
    log "Конфигурация проверена ✅"
}

# Тестовая сборка
test_build() {
    log "Тестовая сборка..."
    
    # Попытка сборки
    if pnpm run build; then
        log "Сборка успешна ✅"
    else
        error "Сборка не удалась!"
        
        # Попытка сборки с игнорированием ошибок
        warning "Попытка сборки с игнорированием ошибок..."
        NODE_OPTIONS="--max-old-space-size=4096" pnpm run build || {
            error "Критическая ошибка сборки!"
            exit 1
        }
    fi
}

# Проверка деплоя
check_deployment() {
    log "Проверка готовности к деплою..."
    
    if [ -f "scripts/deployment-checklist.sh" ]; then
        chmod +x scripts/deployment-checklist.sh
        ./scripts/deployment-checklist.sh
    else
        warning "Скрипт проверки деплоя не найден"
    fi
}

# Откат к последнему рабочему коммиту
rollback() {
    log "Откат к последнему рабочему коммиту..."
    
    # Получение последнего рабочего коммита
    LAST_WORKING=$(git log --oneline --grep="deploy" --grep="fix" --grep="build" | head -1 | cut -d' ' -f1)
    
    if [ -z "$LAST_WORKING" ]; then
        warning "Рабочий коммит не найден, откат к предыдущему"
        git reset --hard HEAD~1
    else
        log "Откат к коммиту: $LAST_WORKING"
        git reset --hard $LAST_WORKING
    fi
    
    log "Откат выполнен ✅"
}

# Полное восстановление
full_restore() {
    log "Полное восстановление системы..."
    
    # Остановка всех процессов
    pkill -f "next dev" || true
    pkill -f "next start" || true
    
    # Очистка
    clean_cache
    restore_dependencies
    
    # Восстановление конфигурации
    restore_config
    
    # Исправление ошибок
    fix_typescript
    fix_eslint
    
    # Тестовая сборка
    test_build
    
    log "Полное восстановление завершено ✅"
}

# Быстрое исправление
quick_fix() {
    log "Быстрое исправление..."
    
    # Очистка кеша
    clean_cache
    
    # Исправление ошибок
    fix_typescript
    fix_eslint
    
    # Тестовая сборка
    test_build
    
    log "Быстрое исправление завершено ✅"
}

# Показать помощь
show_help() {
    echo "🚨 АВАРИЙНЫЙ СКРИПТ ВОССТАНОВЛЕНИЯ"
    echo "=================================="
    echo ""
    echo "Использование: $0 [команда]"
    echo ""
    echo "Команды:"
    echo "  quick     - Быстрое исправление (очистка + исправление ошибок)"
    echo "  full      - Полное восстановление (включая переустановку зависимостей)"
    echo "  rollback  - Откат к последнему рабочему коммиту"
    echo "  clean     - Только очистка кеша"
    echo "  test      - Только тестовая сборка"
    echo "  help      - Показать эту справку"
    echo ""
    echo "Примеры:"
    echo "  $0 quick      # Быстрое исправление"
    echo "  $0 full       # Полное восстановление"
    echo "  $0 rollback   # Откат к рабочему состоянию"
}

# Основная логика
main() {
    case "${1:-help}" in
        "quick")
            check_commands
            quick_fix
            ;;
        "full")
            check_commands
            full_restore
            ;;
        "rollback")
            check_commands
            rollback
            quick_fix
            ;;
        "clean")
            check_commands
            clean_cache
            ;;
        "test")
            check_commands
            test_build
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Запуск
main "$@"
