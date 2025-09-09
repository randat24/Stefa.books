#!/usr/bin/env bash
set -euo pipefail

# Скрипт для замены всех серых цветов текста на единый черный #212121

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="$ROOT_DIR/src"
BACKUP_DIR="$ROOT_DIR/src_backup_text_colors_$(date +%Y%m%d_%H%M%S)"

info()  { printf "\033[1;34m[INFO]\033[0m %s\n" "$*"; }
success(){ printf "\033[1;32m[DONE]\033[0m %s\n" "$*"; }
warn()  { printf "\033[1;33m[WARN]\033[0m %s\n" "$*"; }

DRY_RUN="${DRY_RUN:-0}"
SED_INPLACE=("-i")
# macOS BSD sed compatibility
if sed --version >/dev/null 2>&1; then :; else SED_INPLACE=("-i" ""); fi

info "Исправление цветов текста - замена на единый черный #212121"
info "============================================================="
info "Сканирование файлов в: $SRC_DIR"

# 1) Backup
if [[ "$DRY_RUN" != "1" ]]; then
  rsync -av --exclude='.vercel' --exclude='node_modules' --exclude='.next' "$SRC_DIR/" "$BACKUP_DIR/"
  success "Backup создан: $BACKUP_DIR"
else
  warn "DRY_RUN включен — файлы не будут изменены."
fi

# 2) Замены цветов текста на единый черный
patterns=(
  # Заменяем все text-neutral-* на text-black
  's/\btext-neutral-900\b/text-black/g'
  's/\btext-neutral-800\b/text-black/g'
  's/\btext-neutral-700\b/text-black/g'
  's/\btext-neutral-600\b/text-black/g'
  's/\btext-neutral-500\b/text-black/g'
  's/\btext-neutral-400\b/text-black/g'
  's/\btext-neutral-300\b/text-black/g'
  's/\btext-neutral-200\b/text-black/g'
  's/\btext-neutral-100\b/text-black/g'
  's/\btext-neutral-50\b/text-black/g'
  
  # Заменяем все text-gray-* на text-black
  's/\btext-gray-900\b/text-black/g'
  's/\btext-gray-800\b/text-black/g'
  's/\btext-gray-700\b/text-black/g'
  's/\btext-gray-600\b/text-black/g'
  's/\btext-gray-500\b/text-black/g'
  's/\btext-gray-400\b/text-black/g'
  's/\btext-gray-300\b/text-black/g'
  's/\btext-gray-200\b/text-black/g'
  's/\btext-gray-100\b/text-black/g'
  's/\btext-gray-50\b/text-black/g'
)

apply() {
  local expr="$1"
  if [[ "$DRY_RUN" == "1" ]]; then
    info "Предварительный просмотр: ${expr#s/\\b}"
    find "$SRC_DIR" -type f \( -name '*.tsx' -o -name '*.ts' -o -name '*.jsx' -o -name '*.js' -o -name '*.css' \) \
      -exec grep -n "${expr#s/\\b}" {} + 2>/dev/null || true
  else
    find "$SRC_DIR" -type f \( -name '*.tsx' -o -name '*.ts' -o -name '*.jsx' -o -name '*.js' -o -name '*.css' \) \
      -exec sed "${SED_INPLACE[@]}" "$expr" {} \;
  fi
}

info "Применение исправлений цветов текста..."

for p in "${patterns[@]}"; do
  apply "$p"
done

success "Исправление цветов текста завершено!"
info "Backup доступен в: $BACKUP_DIR"

info "Статистика изменений:"
echo "Файлы с text-black:"
grep -r "text-black" "$SRC_DIR" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" --include="*.css" | wc -l

success "Скрипт исправления цветов текста завершен!"
info "Следующие шаги:"
info "1. Проверьте изменения"
info "2. Протестируйте приложение"
info "3. Зафиксируйте изменения"
