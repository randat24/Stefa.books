#!/usr/bin/env bash
set -euo pipefail

# Stefa.Books Color System Migration Script
# Мигрирует gray-* классы на neutral-* систему

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="$ROOT_DIR/src"
BACKUP_DIR="$ROOT_DIR/src_backup_$(date +%Y%m%d_%H%M%S)"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()  { printf "${BLUE}[INFO]${NC} %s\n" "$*"; }
success(){ printf "${GREEN}[DONE]${NC} %s\n" "$*"; }
warn()  { printf "${YELLOW}[WARN]${NC} %s\n" "$*"; }
error() { printf "${RED}[ERROR]${NC} %s\n" "$*"; }

# Настройки
DRY_RUN="${DRY_RUN:-0}"
SED_INPLACE=("-i")
# macOS BSD sed compatibility
if ! sed --version >/dev/null 2>&1; then 
    SED_INPLACE=("-i" "")
fi

info "🎨 Stefa.Books Color System Migration"
info "📁 Scanning files under: $SRC_DIR"
info "🔍 DRY_RUN mode: $([ "$DRY_RUN" = "1" ] && echo "ON" || echo "OFF")"

# 1) Backup
if [[ "$DRY_RUN" != "1" ]]; then
    info "📦 Creating backup..."
    cp -R "$SRC_DIR" "$BACKUP_DIR"
    success "✅ Backup created: $BACKUP_DIR"
else
    warn "🔍 DRY_RUN is ON — no files will be modified"
fi

# 2) Статистика до миграции
info "📊 Analyzing current color usage..."

GRAY_COUNT=$(grep -r "gray-[0-9]" "$SRC_DIR" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" | wc -l | tr -d ' ')
NEUTRAL_COUNT=$(grep -r "neutral-[0-9]" "$SRC_DIR" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" | wc -l | tr -d ' ')
BRAND_OLD_COUNT=$(grep -r "brand-yellow" "$SRC_DIR" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" | wc -l | tr -d ' ')

info "📈 Current state:"
info "   - Files with gray-* classes: $GRAY_COUNT"
info "   - Files with neutral-* classes: $NEUTRAL_COUNT"
info "   - Files with old brand-yellow: $BRAND_OLD_COUNT"

# 3) Паттерны замены
declare -a patterns=(
    # Основные gray-* → neutral-* замены
    's/text-gray-900/text-neutral-900/g'
    's/text-gray-800/text-neutral-800/g'
    's/text-gray-700/text-neutral-700/g'
    's/text-gray-600/text-neutral-600/g'
    's/text-gray-500/text-neutral-500/g'
    's/text-gray-400/text-neutral-400/g'
    's/text-gray-300/text-neutral-300/g'
    's/text-gray-200/text-neutral-200/g'
    's/text-gray-100/text-neutral-100/g'
    's/text-gray-50/text-neutral-50/g'
    
    's/bg-gray-900/bg-neutral-900/g'
    's/bg-gray-800/bg-neutral-800/g'
    's/bg-gray-700/bg-neutral-700/g'
    's/bg-gray-600/bg-neutral-600/g'
    's/bg-gray-500/bg-neutral-500/g'
    's/bg-gray-400/bg-neutral-400/g'
    's/bg-gray-300/bg-neutral-300/g'
    's/bg-gray-200/bg-neutral-200/g'
    's/bg-gray-100/bg-neutral-100/g'
    's/bg-gray-50/bg-neutral-50/g'
    
    's/border-gray-900/border-neutral-900/g'
    's/border-gray-800/border-neutral-800/g'
    's/border-gray-700/border-neutral-700/g'
    's/border-gray-600/border-neutral-600/g'
    's/border-gray-500/border-neutral-500/g'
    's/border-gray-400/border-neutral-400/g'
    's/border-gray-300/border-neutral-300/g'
    's/border-gray-200/border-neutral-200/g'
    's/border-gray-100/border-neutral-100/g'
    's/border-gray-50/border-neutral-50/g'
    
    # Дополнительные gray-* замены
    's/from-gray-900/from-neutral-900/g'
    's/from-gray-800/from-neutral-800/g'
    's/from-gray-700/from-neutral-700/g'
    's/from-gray-600/from-neutral-600/g'
    's/from-gray-500/from-neutral-500/g'
    's/from-gray-400/from-neutral-400/g'
    's/from-gray-300/from-neutral-300/g'
    's/from-gray-200/from-neutral-200/g'
    's/from-gray-100/from-neutral-100/g'
    's/from-gray-50/from-neutral-50/g'
    
    's/to-gray-900/to-neutral-900/g'
    's/to-gray-800/to-neutral-800/g'
    's/to-gray-700/to-neutral-700/g'
    's/to-gray-600/to-neutral-600/g'
    's/to-gray-500/to-neutral-500/g'
    's/to-gray-400/to-neutral-400/g'
    's/to-gray-300/to-neutral-300/g'
    's/to-gray-200/to-neutral-200/g'
    's/to-gray-100/to-neutral-100/g'
    's/to-gray-50/to-neutral-50/g'
    
    # Устаревшие brand-* замены
    's/brand-yellow/accent/g'
    's/brand-yellow-light/accent-100/g'
    's/brand-yellow-dark/accent-700/g'
    
    # Специальные случаи
    's/bg-white/bg-neutral-0/g'
    's/text-white/text-neutral-0/g'
    's/border-white/border-neutral-0/g'
)

# 4) Функция применения замен
apply_pattern() {
    local expr="$1"
    local pattern_name="${expr%% *}"
    
    # Извлекаем паттерн для поиска (убираем s/ и /g)
    local search_pattern=$(echo "$expr" | sed 's/s\///g' | sed 's/\/.*$//g')
    
    if [[ "$DRY_RUN" == "1" ]]; then
        # DRY RUN: показываем что будет заменено
        local matches=$(grep -r "$search_pattern" "$SRC_DIR" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" 2>/dev/null | wc -l | tr -d ' ')
        if [ "$matches" -gt 0 ]; then
            info "   🔍 $pattern_name: $matches occurrences would be replaced"
        fi
    else
        # Реальная замена
        local matches=$(grep -r "$search_pattern" "$SRC_DIR" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" 2>/dev/null | wc -l | tr -d ' ')
        if [ "$matches" -gt 0 ]; then
            find "$SRC_DIR" -type f \( -name '*.tsx' -o -name '*.ts' -o -name '*.jsx' -o -name '*.js' \) \
                -print0 | xargs -0 sed "${SED_INPLACE[@]}" "$expr"
            success "   ✅ $pattern_name: $matches occurrences replaced"
        fi
    fi
}

# 5) Применение всех паттернов
info "🔄 Applying color system patterns..."

for pattern in "${patterns[@]}"; do
    apply_pattern "$pattern"
done

# 6) Статистика после миграции
if [[ "$DRY_RUN" != "1" ]]; then
    info "📊 Post-migration analysis..."
    
    GRAY_COUNT_AFTER=$(grep -r "gray-[0-9]" "$SRC_DIR" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" 2>/dev/null | wc -l | tr -d ' ')
    NEUTRAL_COUNT_AFTER=$(grep -r "neutral-[0-9]" "$SRC_DIR" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" 2>/dev/null | wc -l | tr -d ' ')
    BRAND_OLD_COUNT_AFTER=$(grep -r "brand-yellow" "$SRC_DIR" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" 2>/dev/null | wc -l | tr -d ' ')
    
    info "📈 After migration:"
    info "   - Files with gray-* classes: $GRAY_COUNT_AFTER (was $GRAY_COUNT)"
    info "   - Files with neutral-* classes: $NEUTRAL_COUNT_AFTER (was $NEUTRAL_COUNT)"
    info "   - Files with old brand-yellow: $BRAND_OLD_COUNT_AFTER (was $BRAND_OLD_COUNT)"
    
    # Проверка успешности
    if [ "$GRAY_COUNT_AFTER" -lt "$GRAY_COUNT" ]; then
        success "✅ Migration successful! Reduced gray-* usage by $((GRAY_COUNT - GRAY_COUNT_AFTER)) files"
    else
        warn "⚠️  No gray-* classes were replaced"
    fi
    
    if [ "$NEUTRAL_COUNT_AFTER" -gt "$NEUTRAL_COUNT" ]; then
        success "✅ Neutral-* usage increased by $((NEUTRAL_COUNT_AFTER - NEUTRAL_COUNT)) files"
    fi
fi

# 7) Следующие шаги
if [[ "$DRY_RUN" == "1" ]]; then
    info "🎯 Next steps:"
    info "   1. Review the changes above"
    info "   2. Run: DRY_RUN= bash $0"
    info "   3. Test: pnpm type-check && pnpm lint && pnpm build"
    info "   4. Visual check: pnpm dev"
else
    info "🎯 Next steps:"
    info "   1. Test: pnpm type-check && pnpm lint && pnpm build"
    info "   2. Visual check: pnpm dev"
    info "   3. Check accessibility and contrast"
    info "   4. Commit changes: git add . && git commit -m 'feat(ui): migrate to neutral color system'"
fi

success "🎉 Color system migration completed!"