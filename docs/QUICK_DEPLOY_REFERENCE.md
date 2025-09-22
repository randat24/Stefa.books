# ⚡ Быстрая справка по деплою Stefa.books

> **🚨 ЭКСТРЕННАЯ СПРАВКА** - Используйте когда нужно быстро исправить или задеплоить

## 🚀 Быстрый деплой (если всё проверено)

```bash
# 1. Проверка готовности
npm run deploy:check

# 2. Preview деплой (РЕКОМЕНДУЕТСЯ)
npm run netlify:deploy:preview

# 3. Production деплой (ТОЛЬКО после тестирования)
npm run netlify:deploy:prod
```

## 🚨 Экстренные команды

```bash
# Быстрое исправление
npm run emergency:quick

# Полное исправление с очисткой
npm run emergency:full

# Откат к предыдущей версии
npm run emergency:rollback
```

## 🔧 Частые ошибки и решения

| Ошибка | Решение |
|--------|---------|
| `Module not found: Can't resolve '@/components/ui/badge'` | `git mv src/components/ui/Badge.tsx src/components/ui/badge.tsx` |
| `Module not found: Can't resolve '@radix-ui/react-checkbox'` | `npm install @radix-ui/react-checkbox` |
| `Build script returned non-zero exit code` | `npm run clean:cache && npm run build` |
| `Html should not be imported outside of pages/_document` | Удалить импорт `<Html>` из компонентов |
| `Unterminated string literal` | Проверить кавычки в коде |

## 📋 Чеклист перед деплоем

```bash
□ npm run clean:cache
□ npm run type-check
□ npm run lint
□ npm run build
□ npm run deploy:check
□ npm run clean:scripts:dry
□ git status (check clean)
□ git add . && git commit -m "fix: description"
□ git push origin main
□ Test on preview URL
□ Deploy to production
```

## 🎯 Правила именования файлов

- **UI компоненты**: `button.tsx`, `badge.tsx` (маленькие буквы)
- **Бизнес компоненты**: `BookCard.tsx`, `UserProfile.tsx` (PascalCase)
- **Страницы**: `about-us`, `contact-info` (kebab-case)

## 🔍 Диагностика проблем

```bash
# Проверить статус
npm run netlify:status

# Открыть админку
npm run netlify:open

# Логи деплоя
netlify logs:deploy --follow

# Проверить производительность
npm run perf:check
```

## 📊 Мониторинг

- **Production**: https://stefa-books.com.ua
- **Netlify Admin**: https://app.netlify.com/projects/stefabooks
- **Build Logs**: https://app.netlify.com/projects/stefabooks/deploys

## 🚨 Критические правила

1. **НИКОГДА** не деплойте без `npm run deploy:check`
2. **ВСЕГДА** тестируйте на preview перед production
3. **ОБЯЗАТЕЛЬНО** проверяйте case sensitivity для файлов в `ui/`
4. **ПОМНИТЕ** о commit messages на русском языке
5. **НЕ ИГНОРИРУЙТЕ** предупреждения TypeScript

---

**Создано:** 8 января 2025  
**Версия:** 1.0  
**Статус:** ✅ Активно используется