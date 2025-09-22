# 🚀 Полное руководство по деплою Stefa.books на Netlify

> **⚠️ ВАЖНО:** Этот документ содержит критически важную информацию для стабильного деплоя проекта. Всегда следуйте инструкциям точно!

## 📋 Оглавление
1. [Краткое резюме проблем](#краткое-резюме-проблем)
2. [Исправленные проблемы](#исправленные-проблемы)
3. [Пошаговая инструкция деплоя](#пошаговая-инструкция-деплоя)
4. [Устранение типичных ошибок](#устранение-типичных-ошибок)
5. [Предотвращение будущих проблем](#предотвращение-будущих-проблем)
6. [Команды для диагностики](#команды-для-диагностики)
7. [Что делать при ошибках](#что-делать-при-ошибках)
8. [Аварийные процедуры](#аварийные-процедуры)
9. [Мониторинг и метрики](#мониторинг-и-метрики)
10. [Быстрые команды](#быстрые-команды)

---

## 🚨 Краткое резюме проблем

### Проблемы которые были:
- **17 сентября 22:22** - последний успешный деплой
- **18-20 сентября** - серия неудачных деплоев
- **20 сентября 13:43** - ПЕРВЫЙ УСПЕШНЫЙ ДЕПЛОЙ после исправлений

### Основные причины сбоев:
1. **Html import error** - неправильный импорт `<Html>` компонента
2. **Case sensitivity** - проблемы с регистром файлов на Linux
3. **Missing dependencies** - отсутствующие зависимости
4. **Unterminated strings** - незакрытые строковые литералы

---

## ✅ Исправленные проблемы

### 1. Html Import Error
**Проблема:** Ошибка `<Html> should not be imported outside of pages/_document`
```
Error: <Html> should not be imported outside of pages/_document.
Read more: https://nextjs.org/docs/messages/no-document-import-in-page
```

**Решение:**
- Удалена директория `test-pages-backup` которая содержала проблемные файлы
- Упрощены error страницы (error.tsx, not-found.tsx)
- Добавлено `export const dynamic = 'force-dynamic'` в проблемные страницы

### 2. Case Sensitivity Issues
**Проблема:** На macOS работает, на Linux (Netlify) - нет
```
Module not found: Can't resolve '@/components/ui/badge'
Module not found: Can't resolve '@/components/ui/checkbox'
```

**Решение:**
```bash
# Переименованы файлы в git:
git mv src/components/ui/Badge.tsx src/components/ui/badge.tsx
git mv src/components/ui/Checkbox.tsx src/components/ui/checkbox.tsx
```

### 3. Missing Dependencies
**Проблема:** Отсутствующие пакеты
```
Module not found: Can't resolve '@radix-ui/react-checkbox'
```

**Решение:**
Добавлено в `package.json`:
```json
{
  "dependencies": {
    "@radix-ui/react-checkbox": "^1.2.7"
  }
}
```

### 4. Unterminated String Literals
**Проблема:** Сломанные строки в компонентах
```
error TS1002: Unterminated string literal.
```

**Решение:**
Исправлены файлы:
- `src/components/admin/CacheManager.tsx`
- `src/components/admin/EnhancedBooksManager.tsx`
- `src/components/ui/OptimizedImageUpload.tsx`

---

## 🚀 Пошаговая инструкция деплоя

### Шаг 1: Предварительная проверка
```bash
# 1. Проверить статус git
git status

# 2. Проверить последние коммиты
git log --oneline -5

# 3. Проверить статус Netlify
netlify status
```

### Шаг 2: Локальная сборка
```bash
# 1. Очистить кеш
npm run clean:cache

# 2. Проверить TypeScript (игнорируем ошибки в .next/)
npm run type-check

# 3. Проверить готовность к деплою (ВСЕГДА!)
npm run deploy:check

# 4. Локальная сборка
npm run build
```

### Шаг 3: Деплой на Netlify

#### Вариант A: Preview Deploy (тестовый) - РЕКОМЕНДУЕТСЯ
```bash
# Деплой preview версии через скрипт
npm run netlify:deploy:preview

# Или напрямую через Netlify CLI
netlify deploy

# Результат: получите URL вида
# https://xxx--stefabooks.netlify.app
```

#### Вариант B: Production Deploy - ТОЛЬКО ПОСЛЕ ТЕСТИРОВАНИЯ
```bash
# Деплой в продакшен через скрипт
npm run netlify:deploy:prod

# Или напрямую через Netlify CLI
netlify deploy --prod

# Результат: обновится https://stefa-books.com.ua
```

#### Вариант C: Автоматический деплой
```bash
# Просто пуш в main - деплой запустится автоматически
git add .
git commit -m "fix: your changes description"
git push origin main
```

#### Вариант D: Экстренный деплой
```bash
# Если нужно срочно исправить критическую ошибку
npm run emergency:quick

# Полный экстренный деплой с очисткой
npm run emergency:full
```

### Шаг 4: Мониторинг деплоя
```bash
# Смотреть логи деплоя в реальном времени
netlify logs:deploy

# Открыть админку Netlify
netlify open:admin

# Открыть деплоенный сайт
netlify open:site
```

---

## 🔧 Устранение типичных ошибок

### Ошибка: Module not found
```
Module not found: Can't resolve '@/components/ui/some-component'
```

**Диагностика:**
1. Проверить существование файла:
```bash
ls -la src/components/ui/some-component.tsx
```

2. Проверить case sensitivity:
```bash
git ls-files src/components/ui/ | grep -i some-component
```

3. Проверить импорты в коде:
```bash
grep -r "some-component" src/
```

**Исправление:**
```bash
# Если файл есть с другим регистром:
git mv src/components/ui/SomeComponent.tsx src/components/ui/some-component.tsx

# Или создать недостающий файл:
touch src/components/ui/some-component.tsx
# (добавить содержимое)

git add .
git commit -m "fix: resolve case sensitivity for some-component"
git push origin main
```

### Ошибка: Missing dependency
```
Module not found: Can't resolve '@some-package/react-something'
```

**Исправление:**
```bash
# Добавить зависимость в package.json
npm install @some-package/react-something

# Или добавить вручную в package.json и коммитить:
git add package.json
git commit -m "fix: add missing dependency @some-package/react-something"
git push origin main
```

### Ошибка: Build script returned non-zero exit code
**Причины:**
- TypeScript ошибки
- Отсутствующие файлы
- Синтаксические ошибки

**Диагностика:**
```bash
# Локальная проверка
npm run build

# TypeScript проверка
npm run type-check

# Проверка синтаксиса
npm run lint
```

---

## 🛡️ Предотвращение будущих проблем

### 1. Правила именования файлов
- **UI компоненты**: всегда с маленькой буквы (`button.tsx`, `badge.tsx`)
- **Бизнес компоненты**: PascalCase (`BookCard.tsx`, `UserProfile.tsx`)
- **Страницы**: kebab-case (`about-us`, `contact-info`)

### 2. Проверка перед коммитом
```bash
# Всегда проверяйте локально:
npm run type-check
npm run build
npm run test

# Затем коммитим:
git add .
git commit -m "fix: your description"
git push origin main
```

### 3. Стандартная структура коммитов
```bash
# Типы коммитов:
fix: исправление багов
feat: новые функции
refactor: рефакторинг кода
style: стили и UI
docs: документация
deps: обновление зависимостей

# Примеры:
git commit -m "fix: resolve case sensitivity for badge component"
git commit -m "feat: add new payment integration"
git commit -m "deps: add missing @radix-ui/react-checkbox"
```

### 4. Регулярные проверки
```bash
# Еженедельно:
npm audit
npm outdated

# После крупных изменений:
npm run clean:cache
npm run deploy:check
```

---

## 🔍 Команды для диагностики

### Проверка файлов и зависимостей
```bash
# Найти все UI компоненты
find src/components/ui -name "*.tsx" | sort

# Проверить импорты конкретного компонента
grep -r "from '@/components/ui/badge'" src/

# Проверить зависимости в package.json
grep -A 20 "dependencies" package.json

# Найти все файлы с заглавными буквами в ui/
git ls-files src/components/ui/ | grep -E '^src/components/ui/[A-Z]'
```

### Проверка сборки
```bash
# Полная проверка готовности к деплою
npm run deploy:check

# Только сборка
npm run build

# Только типы
npm run type-check

# Очистка всего
npm run clean
```

### Проверка Netlify
```bash
# Статус проекта
netlify status

# Список деплоев
netlify api listSiteDeploys --site-id=cb75fb42-cc85-41da-a68b-f5a69f892c66

# Переменные окружения
netlify env:list

# Логи функций
netlify logs:function
```

---

## 🚨 Что делать при ошибках

### 1. Ошибка сборки на Netlify
```bash
# Шаг 1: Воспроизвести локально
npm run clean:cache
npm run build

# Шаг 2: Если локально работает, проверить зависимости
npm ls | grep -E "radix|lucide|next"

# Шаг 3: Проверить различия в регистре
git ls-files src/components/ui/ | sort

# Шаг 4: Исправить и деплоить
git add .
git commit -m "fix: resolve build issue"
git push origin main
```

### 2. Сайт не работает после деплоя
```bash
# Проверить логи
netlify logs:function

# Проверить переменные окружения
netlify env:list

# Откатиться к предыдущей версии в админке Netlify
netlify open:admin
```

### 3. Медленная загрузка сайта
```bash
# Анализ производительности
npm run analyze:bundle
npm run analyze:performance

# Проверить Lighthouse scores
# (автоматически запускается при деплое)
```

---

## 📊 Мониторинг и метрики

### Автоматические проверки при деплое:
- ✅ **Build Success**: сборка без ошибок
- ✅ **Lighthouse Audit**: проверка производительности
- ✅ **Function Deploy**: развертывание server functions
- ✅ **Edge Functions**: развертывание middleware

### Текущие показатели:
- **Performance**: 34/100 (требует оптимизации)
- **Accessibility**: 90/100 ✅
- **Best Practices**: 92/100 ✅
- **SEO**: 99/100 ✅
- **PWA**: 90/100 ✅

### URLs для мониторинга:
- **Production**: https://stefa-books.com.ua
- **Netlify Admin**: https://app.netlify.com/projects/stefabooks
- **Build Logs**: https://app.netlify.com/projects/stefabooks/deploys

---

## 📝 Итоговые рекомендации

### ✅ ДЕЛАТЬ:
1. Всегда тестировать локально перед деплоем
2. Использовать правильные имена файлов (case sensitivity)
3. Проверять зависимости в package.json
4. Коммитить маленькими порциями
5. Использовать осмысленные commit messages
6. Следить за Lighthouse scores

### ❌ НЕ ДЕЛАТЬ:
1. Не пушить без локальной проверки
2. Не создавать файлы с неправильным регистром
3. Не оставлять незакрытые строки в коде
4. Не добавлять зависимости без проверки
5. Не игнорировать предупреждения TypeScript
6. Не деплоить сразу в продакшен без preview

### 🚀 Финальный чеклист перед деплоем:
```bash
□ npm run clean:cache
□ npm run type-check
□ npm run build
□ git status (check clean)
□ git add . && git commit -m "meaningful message"
□ git push origin main
□ netlify logs:deploy (monitor)
□ Test on preview URL
□ Deploy to production
```

---

## 🚨 Аварийные процедуры

### 1. Критическая ошибка в продакшене
```bash
# Шаг 1: Немедленный откат
git revert HEAD
git push origin main

# Шаг 2: Или откат через Netlify
netlify rollback

# Шаг 3: Проверить статус
netlify status
```

### 2. Сайт полностью не работает
```bash
# Экстренное исправление
npm run emergency:full

# Проверить логи
netlify logs:function

# Перезапустить функции
netlify functions:invoke --name=function-name
```

### 3. Проблемы с базой данных
```bash
# Проверить подключение к Supabase
npm run check:users

# Проверить переменные окружения
netlify env:list

# Перезапустить с очисткой кеша
npm run clean:full
npm run build
npm run netlify:deploy:prod
```

### 4. Проблемы с производительностью
```bash
# Анализ производительности
npm run analyze:performance
npm run analyze:bundle

# Очистка и пересборка
npm run clean:full
npm run build:fix
npm run netlify:deploy:prod
```

---

## 📊 Мониторинг и метрики

### Автоматические проверки при деплое:
- ✅ **Build Success**: сборка без ошибок
- ✅ **Lighthouse Audit**: проверка производительности
- ✅ **Function Deploy**: развертывание server functions
- ✅ **Edge Functions**: развертывание middleware

### Текущие показатели:
- **Performance**: 34/100 (требует оптимизации)
- **Accessibility**: 90/100 ✅
- **Best Practices**: 92/100 ✅
- **SEO**: 99/100 ✅
- **PWA**: 90/100 ✅

### URLs для мониторинга:
- **Production**: https://stefa-books.com.ua
- **Netlify Admin**: https://app.netlify.com/projects/stefabooks
- **Build Logs**: https://app.netlify.com/projects/stefabooks/deploys

### Команды мониторинга:
```bash
# Статус проекта
npm run netlify:status

# Открыть админку
npm run netlify:open

# Логи в реальном времени
netlify logs:deploy --follow

# Проверка производительности
npm run perf:check
```

---

## ⚡ Быстрые команды

### 🚀 Разработка
```bash
npm run dev                    # Запуск dev сервера
npm run dev:safe              # Безопасный запуск с проверками
npm run dev:workflow          # Полный workflow разработки
```

### 🔍 Проверки
```bash
npm run lint                  # Проверка кода
npm run type-check           # Проверка типов
npm run deploy:check         # Полная проверка готовности
npm run test:all             # Все тесты
```

### 🚀 Деплоймент
```bash
npm run netlify:deploy:preview    # Preview деплой
npm run netlify:deploy:prod       # Production деплой
npm run deploy:clean              # Чистый деплой с очисткой
```

### 🧹 Очистка
```bash
npm run clean:cache          # Очистка кеша
npm run clean:scripts:dry    # Проверка временных скриптов (без удаления)
npm run clean:scripts        # Очистка временных скриптов
npm run clean:full           # Полная очистка
```

### 🚨 Экстренные команды
```bash
npm run emergency:quick      # Быстрое исправление
npm run emergency:full       # Полное исправление
npm run emergency:rollback   # Откат к предыдущей версии
```

### 🔧 Анализ и диагностика
```bash
npm run analyze:performance  # Анализ производительности
npm run analyze:bundle       # Анализ размера бандла
npm run perf:check          # Проверка производительности
```

---

## 📋 Финальный чеклист перед деплоем

### ✅ Обязательные проверки:
```bash
□ npm run clean:cache
□ npm run type-check
□ npm run lint
□ npm run build
□ npm run deploy:check
□ npm run clean:scripts:dry
□ git status (check clean)
□ git add . && git commit -m "meaningful message"
□ git push origin main
□ netlify logs:deploy (monitor)
□ Test on preview URL
□ Deploy to production
```

### 🚨 Критические правила:
1. **НИКОГДА** не деплойте без `npm run deploy:check`
2. **ВСЕГДА** тестируйте на preview перед production
3. **ОБЯЗАТЕЛЬНО** проверяйте логи после деплоя
4. **ПОМНИТЕ** о case sensitivity для файлов в `ui/`
5. **НЕ ИГНОРИРУЙТЕ** предупреждения TypeScript

---

## 📚 Дополнительные ресурсы

### Документация проекта:
- [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) - Основные правила разработки
- [QUICK_DEPLOY_REFERENCE.md](./QUICK_DEPLOY_REFERENCE.md) - Быстрая справка
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Структура проекта

### Полезные ссылки:
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Netlify Documentation](https://docs.netlify.com/)
- [Supabase Documentation](https://supabase.com/docs)

---

**Создано:** 20 сентября 2025  
**Последнее обновление:** 8 января 2025  
**Статус:** ✅ Все основные проблемы решены, деплой работает стабильно  
**Версия:** 2.0 (расширенная)