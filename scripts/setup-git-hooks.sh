#!/bin/bash

# 🔧 НАСТРОЙКА GIT HOOKS ДЛЯ АВТОМАТИЧЕСКИХ ПРОВЕРОК
# Устанавливает pre-commit hook для автоматической проверки кода

set -e

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 НАСТРОЙКА GIT HOOKS${NC}"
echo "=========================="

# Проверка наличия .git
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Git репозиторий не найден!${NC}"
    echo "Инициализируйте git репозиторий: git init"
    exit 1
fi

# Создание директории hooks если не существует
mkdir -p .git/hooks

# Создание pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# 🔍 PRE-COMMIT HOOK
# Автоматически запускается перед каждым коммитом

echo "🔍 Проверка кода перед коммитом..."

# Запуск предварительной проверки
if [ -f "scripts/pre-commit-check.sh" ]; then
    chmod +x scripts/pre-commit-check.sh
    ./scripts/pre-commit-check.sh
    
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ КОММИТ ОТМЕНЕН!"
        echo "Исправьте ошибки и попробуйте снова."
        echo ""
        echo "💡 Для быстрого исправления:"
        echo "   pnpm run emergency:quick"
        exit 1
    fi
else
    echo "⚠️  Скрипт проверки не найден: scripts/pre-commit-check.sh"
fi

echo "✅ Проверка пройдена, коммит разрешен!"
EOF

# Создание commit-msg hook для проверки сообщений коммитов
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash

# 📝 COMMIT-MSG HOOK
# Проверяет формат сообщений коммитов

commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "❌ Неверный формат сообщения коммита!"
    echo ""
    echo "Используйте формат: type(scope): description"
    echo ""
    echo "Типы:"
    echo "  feat     - новая функция"
    echo "  fix      - исправление бага"
    echo "  docs     - документация"
    echo "  style    - форматирование кода"
    echo "  refactor - рефакторинг"
    echo "  test     - тесты"
    echo "  chore    - рутинные задачи"
    echo "  perf     - улучшение производительности"
    echo "  ci       - CI/CD"
    echo "  build    - сборка"
    echo "  revert   - откат изменений"
    echo ""
    echo "Примеры:"
    echo "  feat: добавить авторизацию"
    echo "  fix(admin): исправить баг в панели"
    echo "  docs: обновить README"
    echo ""
    exit 1
fi
EOF

# Создание post-commit hook для уведомлений
cat > .git/hooks/post-commit << 'EOF'
#!/bin/bash

# 🎉 POST-COMMIT HOOK
# Запускается после успешного коммита

echo ""
echo "🎉 Коммит успешно создан!"
echo ""
echo "💡 Полезные команды:"
echo "   pnpm run deploy:check  - проверка готовности к деплою"
echo "   pnpm run deploy        - preview деплой"
echo "   pnpm run deploy:prod   - production деплой"
echo ""
EOF

# Установка прав на выполнение
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/commit-msg
chmod +x .git/hooks/post-commit

echo -e "${GREEN}✅ Git hooks установлены успешно!${NC}"
echo ""
echo "🔧 Установленные hooks:"
echo "  - pre-commit  - проверка кода перед коммитом"
echo "  - commit-msg  - проверка формата сообщений"
echo "  - post-commit - уведомления после коммита"
echo ""
echo "💡 Теперь при каждом коммите будет автоматически:"
echo "  - Проверяться TypeScript"
echo "  - Проверяться ESLint"
echo "  - Проверяться сборка"
echo "  - Проверяться безопасность"
echo "  - Проверяться стили"
echo ""
echo "🚀 Готово к работе!"
