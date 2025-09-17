# Правила работы с тестовыми файлами

## 🧪 Принцип работы

1. **Создаем тестовые файлы** для проверки функциональности
2. **Тестируем** и убеждаемся, что все работает
3. **Создаем реальные рабочие файлы** на основе протестированного кода
4. **Удаляем все тестовые файлы** после создания рабочих версий

## 📁 Структура тестирования

### Тестовые файлы (временные)
```
src/app/test-*/
├── test-admin/page.tsx          → src/app/admin/page.tsx
├── test-ai/page.tsx             → src/app/ai/page.tsx
├── test-auto-registration/page.tsx → src/app/registration/page.tsx
├── test-highlight/page.tsx      → src/app/highlight/page.tsx
├── test-payment/page.tsx        → src/app/payment/page.tsx
├── test-subscribe/page.tsx      → src/app/subscribe/page.tsx
├── test-subscribe-home/page.tsx → src/app/subscribe-home/page.tsx
└── test-user-subscription/page.tsx → src/app/user-subscription/page.tsx
```

### Рабочие файлы (постоянные)
```
src/app/
├── admin/page.tsx               # Админ-панель
├── ai/page.tsx                  # AI помощник
├── registration/page.tsx        # Авторегистрация
├── highlight/page.tsx           # Подсветка текста
├── payment/page.tsx             # Платежи
├── subscribe/page.tsx           # Подписка
├── subscribe-home/page.tsx      # Подписка на главной
└── user-subscription/page.tsx   # Управление подпиской
```

## 🔄 Процесс работы

### 1. Создание тестового файла
```bash
# Создаем тестовую страницу
mkdir src/app/test-feature
touch src/app/test-feature/page.tsx
```

### 2. Разработка и тестирование
- Пишем код в тестовом файле
- Тестируем функциональность
- Исправляем ошибки
- Убеждаемся, что все работает

### 3. Создание рабочего файла
```bash
# Создаем рабочую страницу
mkdir src/app/feature
cp src/app/test-feature/page.tsx src/app/feature/page.tsx
```

### 4. Удаление тестового файла
```bash
# Удаляем тестовую страницу
rm -rf src/app/test-feature
```

## ⚠️ Важные правила

### ✅ Что можно делать с тестовыми файлами:
- Создавать любые тестовые страницы
- Экспериментировать с кодом
- Тестировать новые функции
- Делать быстрые прототипы

### ❌ Что нельзя делать:
- Оставлять тестовые файлы в продакшене
- Коммитить тестовые файлы в main ветку
- Использовать тестовые файлы как рабочие
- Забывать удалять тестовые файлы

## 🧹 Очистка проекта

### Автоматическая очистка
```bash
# Удалить все тестовые папки
find src/app -name "test-*" -type d -exec rm -rf {} +

# Удалить все тестовые файлы
find src -name "test-*" -type f -delete
```

### Ручная очистка
```bash
# Удалить конкретные тестовые папки
rm -rf src/app/test-admin
rm -rf src/app/test-ai
rm -rf src/app/test-auto-registration
rm -rf src/app/test-highlight
rm -rf src/app/test-payment
rm -rf src/app/test-subscribe
rm -rf src/app/test-subscribe-home
rm -rf src/app/test-user-subscription
```

## 📋 Чек-лист перед деплоем

- [ ] Все тестовые файлы удалены
- [ ] Созданы рабочие версии
- [ ] Код протестирован
- [ ] Нет ссылок на тестовые файлы
- [ ] Проект готов к продакшену

## 🎯 Цель

**Чистый, организованный проект без мусора!**

Тестовые файлы помогают в разработке, но не должны засорять финальный продукт.
