# 🚀 Быстрая справка по деплою Stefa.books

## ⚡ Экстренные команды

### При ошибке деплоя:
```bash
# 1. Быстрая диагностика
npm run build                    # проверить локально
git status                       # проверить изменения
netlify logs:deploy              # смотреть логи Netlify

# 2. Быстрое исправление
npm run clean:cache              # очистить кеш
git add . && git commit -m "fix: description" && git push origin main
```

### При ошибке "Module not found":
```bash
# Проверить case sensitivity
git ls-files src/components/ui/ | grep -i component-name

# Исправить регистр
git mv src/components/ui/ComponentName.tsx src/components/ui/component-name.tsx
git add . && git commit -m "fix: case sensitivity for component-name" && git push origin main
```

### При ошибке отсутствующей зависимости:
```bash
# Добавить в package.json и пушить
npm install @package/name
git add package.json && git commit -m "deps: add missing @package/name" && git push origin main
```

---

## 🔧 Стандартный процесс деплоя

### Вариант 1: Полная проверка (рекомендуется)
```bash
npm run clean:cache
npm run type-check
npm run build
git add .
git commit -m "feat: your changes"
git push origin main
netlify logs:deploy  # мониторинг
```

### Вариант 2: Быстрый деплой (если уверены)
```bash
git add . && git commit -m "fix: quick changes" && git push origin main
```

### Вариант 3: Preview сначала
```bash
netlify deploy        # тестовый URL
netlify deploy --prod  # после проверки
```

---

## 📋 Частые ошибки и решения

| Ошибка | Быстрое решение |
|--------|----------------|
| `Module not found '@/components/ui/badge'` | `git mv src/components/ui/Badge.tsx src/components/ui/badge.tsx` |
| `Can't resolve '@radix-ui/react-checkbox'` | Добавить в package.json: `"@radix-ui/react-checkbox": "^1.2.7"` |
| `Unterminated string literal` | Проверить кавычки в импортах компонентов |
| `Html import error` | Удалить `export const dynamic` или проблемные файлы |
| `Build script returned non-zero exit code` | `npm run build` локально для диагностики |

---

## 🎯 Правила именования файлов

```bash
✅ ПРАВИЛЬНО:
src/components/ui/badge.tsx        # shadcn компоненты - маленькие буквы
src/components/ui/button.tsx       # shadcn компоненты - маленькие буквы
src/components/BookCard.tsx        # бизнес компоненты - PascalCase
src/app/about-us/page.tsx          # страницы - kebab-case

❌ НЕПРАВИЛЬНО:
src/components/ui/Badge.tsx        # будет работать на macOS, но не на Linux
src/components/ui/Button.tsx       # будет работать на macOS, но не на Linux
```

---

## 🔍 Быстрая диагностика

### Проверить что сломалось:
```bash
git log --oneline -5              # последние коммиты
git diff HEAD~1                   # что изменилось
netlify status                    # статус Netlify
```

### Найти проблемные файлы:
```bash
find src/components/ui -name "*.tsx" | grep -E "^.*[A-Z].*\.tsx$"  # файлы с заглавными буквами
grep -r "from '@/components/ui/" src/ | grep -v node_modules       # все импорты UI компонентов
```

### Проверить зависимости:
```bash
npm ls | grep radix              # установленные radix пакеты
grep -A 50 "dependencies" package.json | grep radix              # пакеты в package.json
```

---

## 🎛️ Полезные алиасы (добавить в ~/.bashrc или ~/.zshrc)

```bash
# Алиасы для деплоя
alias deploy-preview="netlify deploy"
alias deploy-prod="netlify deploy --prod"
alias deploy-logs="netlify logs:deploy"
alias deploy-check="npm run clean:cache && npm run build"

# Алиасы для git
alias quick-commit="git add . && git commit -m"
alias quick-push="git add . && git commit -m 'quick fix' && git push origin main"

# Алиасы для диагностики
alias check-ui="git ls-files src/components/ui/ | sort"
alias check-deps="npm ls | grep -E 'radix|lucide|next'"
```

---

## 📞 Экстренные контакты

- **Netlify Admin**: https://app.netlify.com/projects/stefabooks
- **GitHub Repo**: https://github.com/randat24/Stefa.books.com.ua
- **Production URL**: https://stefa-books.com.ua
- **Build Logs**: https://app.netlify.com/projects/stefabooks/deploys

---

## 📈 Мониторинг

### После каждого деплоя проверить:
- ✅ Сайт загружается: https://stefa-books.com.ua
- ✅ API работает: https://stefa-books.com.ua/api/health
- ✅ Lighthouse score > 80 (общий)
- ✅ Нет ошибок в консоли браузера

### Команды мониторинга:
```bash
netlify open:site                # открыть сайт
netlify open:admin               # открыть админку
curl https://stefa-books.com.ua/api/health  # проверить API
```

---

**💡 Главное правило:** Всегда тестируйте локально перед пушем в main!