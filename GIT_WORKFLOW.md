# Git Workflow для Stefa.books

## 🌿 Стратегия веток

### `main` - Продакшен ветка
- **Назначение**: Финальная версия для продакшена
- **Деплой**: Автоматический на Vercel
- **Защита**: ❌ Прямые push запрещены
- **Обновление**: Только через Pull Request

### `Lklhost` - Разработка ветка  
- **Назначение**: Разработка и тестирование
- **Деплой**: Локальный (localhost:3000)
- **Защита**: ✅ Прямые push разрешены
- **Обновление**: Прямые коммиты

## 🔄 Workflow

### Для разработки:
```bash
# 1. Переключиться на ветку разработки
git checkout Lklhost

# 2. Создать новую ветку для фичи (опционально)
git checkout -b feature/new-feature

# 3. Разрабатывать и тестировать
npm run dev

# 4. Коммитить изменения
git add .
git commit -m "feat: add new feature"

# 5. Отправить в удаленный репозиторий
git push origin Lklhost
```

### Для продакшена:
```bash
# 1. Убедиться что все тесты проходят
npm run test
npm run build

# 2. Создать Pull Request на GitHub
# 3. Провести Code Review
# 4. Смержить PR в main
# 5. Vercel автоматически задеплоит
```

## 🛡️ Защита веток

### main ветка:
- ❌ Прямые push заблокированы
- ✅ Только через Pull Request
- ✅ Обязательный Code Review
- ✅ Автоматические тесты

### Lklhost ветка:
- ✅ Прямые push разрешены
- ✅ Быстрая разработка
- ✅ Локальное тестирование

## 📋 Правила коммитов

### Формат сообщений:
```
type(scope): description

feat: новая функциональность
fix: исправление бага
docs: документация
style: форматирование
refactor: рефакторинг
test: тесты
chore: служебные задачи
```

### Примеры:
```bash
git commit -m "feat(auth): add login functionality"
git commit -m "fix(ui): resolve button alignment issue"
git commit -m "docs: update API documentation"
```

## 🚀 Деплой

### Локальная разработка:
```bash
git checkout Lklhost
npm run dev
# http://localhost:3000
```

### Продакшен:
```bash
# Автоматически через Vercel при push в main
# https://stefa-books.com.ua
```

## 🔧 Полезные команды

### Переключение веток:
```bash
git checkout main          # Переключиться на main
git checkout Lklhost       # Переключиться на Lklhost
```

### Синхронизация:
```bash
git pull origin main       # Обновить main
git pull origin Lklhost    # Обновить Lklhost
```

### Создание Pull Request:
1. Перейти на GitHub
2. Выбрать ветку Lklhost
3. Нажать "Compare & pull request"
4. Заполнить описание
5. Назначить ревьюера
6. Смержить после одобрения

## ⚠️ Важные правила

1. **Никогда не коммитьте** чувствительные файлы (.env, credentials)
2. **Всегда тестируйте** перед коммитом
3. **Используйте осмысленные** сообщения коммитов
4. **Создавайте PR** для изменений в main
5. **Проводите Code Review** перед мержем

## 🆘 В случае проблем

### Откат изменений:
```bash
git reset --hard HEAD~1    # Отменить последний коммит
git checkout -- .          # Отменить все изменения
```

### Синхронизация с удаленным репозиторием:
```bash
git fetch origin
git reset --hard origin/main
```

### Просмотр истории:
```bash
git log --oneline          # Краткая история
git log --graph            # Графическая история
```
