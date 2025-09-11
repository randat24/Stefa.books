#!/bin/bash

# 🧹 Скрипт автоматической очистки временных файлов
# Использование: ./scripts/cleanup-temp-files.sh [--dry-run]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log() {
    echo -e "${BLUE}[CLEANUP]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Проверка аргументов
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    log "Режим предварительного просмотра (файлы не будут удалены)"
fi

log "Начинаем очистку временных файлов в scripts/..."

# Счетчики
deleted_count=0
skipped_count=0

# Функция для безопасного удаления файла
safe_delete() {
    local file="$1"
    local reason="$2"
    
    if [[ -f "$file" ]]; then
        if [[ "$DRY_RUN" == "true" ]]; then
            warn "БУДЕТ УДАЛЕН: $file ($reason)"
        else
            rm "$file"
            success "Удален: $file ($reason)"
        fi
        ((deleted_count++))
    else
        ((skipped_count++))
    fi
}

# 1. Временные скрипты
log "Поиск временных скриптов..."
find scripts/ -maxdepth 1 -name "test-*" -type f | while read -r file; do
    safe_delete "$file" "временный тестовый скрипт"
done

find scripts/ -maxdepth 1 -name "temp-*" -type f | while read -r file; do
    safe_delete "$file" "временный файл"
done

find scripts/ -maxdepth 1 -name "debug-*" -type f | while read -r file; do
    safe_delete "$file" "отладочный скрипт"
done

# 2. JSON файлы с результатами
log "Поиск JSON файлов с результатами..."
find scripts/ -maxdepth 1 -name "*-results.json" -type f | while read -r file; do
    safe_delete "$file" "JSON файл с результатами"
done

find scripts/ -maxdepth 1 -name "*-output.json" -type f | while read -r file; do
    safe_delete "$file" "JSON файл с выводом"
done

find scripts/ -maxdepth 1 -name "*-data.json" -type f | while read -r file; do
    safe_delete "$file" "JSON файл с данными"
done

# 3. Дублирующиеся файлы
log "Поиск дублирующихся файлов..."
find scripts/ -maxdepth 1 -name "*-v2.*" -type f | while read -r file; do
    safe_delete "$file" "дублирующийся файл v2"
done

find scripts/ -maxdepth 1 -name "*-backup.*" -type f | while read -r file; do
    safe_delete "$file" "резервная копия"
done

find scripts/ -maxdepth 1 -name "*-old.*" -type f | while read -r file; do
    safe_delete "$file" "устаревший файл"
done

find scripts/ -maxdepth 1 -name "*-copy.*" -type f | while read -r file; do
    safe_delete "$file" "копия файла"
done

# 4. Временные SQL файлы
log "Поиск временных SQL файлов..."
find scripts/ -maxdepth 1 -name "temp-*.sql" -type f | while read -r file; do
    safe_delete "$file" "временный SQL файл"
done

find scripts/ -maxdepth 1 -name "test-*.sql" -type f | while read -r file; do
    safe_delete "$file" "тестовый SQL файл"
done

# 5. Логи и временные файлы
log "Поиск логов и временных файлов..."
find scripts/ -maxdepth 1 -name "*.log" -type f | while read -r file; do
    safe_delete "$file" "лог файл"
done

find scripts/ -maxdepth 1 -name "*.tmp" -type f | while read -r file; do
    safe_delete "$file" "временный файл"
done

# 6. Пустые папки
log "Поиск пустых папок..."
find scripts/ -type d -empty | while read -r dir; do
    if [[ "$dir" != "scripts/" && "$dir" != "scripts/node_modules" ]]; then
        if [[ "$DRY_RUN" == "true" ]]; then
            warn "БУДЕТ УДАЛЕНА ПУСТАЯ ПАПКА: $dir"
        else
            rmdir "$dir"
            success "Удалена пустая папка: $dir"
        fi
    fi
done

# Итоговая статистика
echo ""
log "=== ИТОГИ ОЧИСТКИ ==="
if [[ "$DRY_RUN" == "true" ]]; then
    warn "Режим предварительного просмотра - файлы НЕ были удалены"
    warn "Для реального удаления запустите: ./scripts/cleanup-temp-files.sh"
else
    success "Удалено файлов: $deleted_count"
    if [[ $skipped_count -gt 0 ]]; then
        warn "Пропущено файлов: $skipped_count"
    fi
fi

# Проверка оставшихся файлов
log "Оставшиеся файлы в scripts/:"
ls -la scripts/ | grep -v "^total" | grep -v "^d.*node_modules"

echo ""
success "Очистка завершена!"
