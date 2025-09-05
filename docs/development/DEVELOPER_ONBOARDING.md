# 👋 Руководство для новых разработчиков Stefa.Books

## 🎯 Добро пожаловать в команду!

Этот документ поможет вам быстро освоиться с проектом Stefa.Books и начать эффективно работать с кодом.

---

## 🚀 **БЫСТРЫЙ СТАРТ**

### 1. **Установка проекта**

```bash
# 1. Клонировать репозиторий
git clone https://github.com/your-org/stefa-books.git
cd stefa-books

# 2. Установить зависимости
pnpm install

# 3. Настроить переменные окружения
cp .env.example .env.local
# Отредактировать .env.local с вашими данными

# 4. Запустить проект
pnpm dev
```

### 2. **Первая проверка**

```bash
# Проверить, что все работает
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

---

## 📚 **ИЗУЧЕНИЕ ПРОЕКТА**

### 1. **Обязательные документы для изучения**

1. **`CODING_STANDARDS.md`** - Стандарты кодирования
2. **`CODE_QUALITY_AUDIT_REPORT.md`** - Отчет о качестве кода
3. **`PROJECT_MAINTENANCE_GUIDE.md`** - Руководство по поддержке
4. **`README.md`** - Общее описание проекта

### 2. **Структура проекта**

```
stefa-books/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── (auth)/         # Auth pages
│   │   └── admin/          # Admin pages
│   ├── components/         # React компоненты
│   │   ├── ui/            # Базовые UI компоненты
│   │   ├── forms/         # Формы
│   │   └── sections/      # Секции страниц
│   ├── lib/               # Утилиты и сервисы
│   │   ├── auth/          # Аутентификация
│   │   ├── search/        # Поиск
│   │   └── hooks/         # Кастомные хуки
│   └── types/             # TypeScript типы
├── scripts/               # Утилитарные скрипты
├── supabase/             # База данных
└── docs/                 # Документация
```

### 3. **Ключевые технологии**

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL)
- **Storage:** Cloudinary
- **Deployment:** Vercel

---

## 🔧 **НАСТРОЙКА РАЗРАБОТЧЕСКОЙ СРЕДЫ**

### 1. **VS Code (рекомендуется)**

#### Обязательные расширения:
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

#### Настройки VS Code:
```json
{
  "typescript.preferences.strictNullChecks": true,
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "tailwindCSS.includeLanguages": {
    "typescript": "typescript",
    "typescriptreact": "typescriptreact"
  }
}
```

### 2. **Git настройки**

```bash
# Настроить имя и email
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Настроить pre-commit hooks (рекомендуется)
npx husky install
npx husky add .husky/pre-commit "pnpm lint && pnpm type-check"
```

---

## 📋 **ПРАВИЛА РАБОТЫ С КОДОМ**

### 1. **СТРОГО ЗАПРЕЩЕНО**

```typescript
// ❌ НИКОГДА НЕ ДЕЛАЙТЕ ТАК!
const data: any = response.data;
console.log('Debug:', data);
console.error('Error:', error);

try {
  await operation();
} catch {
  // пустой catch
}

<button onClick={handleClick}>
  <Icon />
</button>
```

### 2. **ОБЯЗАТЕЛЬНО ДЕЛАТЬ**

```typescript
// ✅ ВСЕГДА ДЕЛАЙТЕ ТАК!
const data: unknown = response.data;
logger.debug('Debug info', { data });
logger.error('Error occurred', { error });

try {
  await operation();
} catch (error) {
  logger.error('Operation failed', { error });
  throw error;
}

<button 
  onClick={handleClick}
  aria-label="Описание действия"
  tabIndex={0}
>
  <Icon />
</button>
```

---

## 🎯 **ПЕРВЫЕ ЗАДАЧИ**

### 1. **Неделя 1: Изучение**

- [ ] Прочитать всю документацию
- [ ] Настроить среду разработки
- [ ] Изучить структуру проекта
- [ ] Запустить проект локально
- [ ] Понять основные компоненты

### 2. **Неделя 2: Практика**

- [ ] Исправить простые ESLint предупреждения
- [ ] Добавить JSDoc к функциям
- [ ] Улучшить доступность компонентов
- [ ] Написать тесты для существующих функций

### 3. **Неделя 3: Разработка**

- [ ] Создать простой компонент
- [ ] Добавить API endpoint
- [ ] Написать тесты
- [ ] Создать Pull Request

---

## 🔍 **ПРОЦЕДУРЫ РАЗРАБОТКИ**

### 1. **Создание новой функции**

```bash
# 1. Создать ветку
git checkout -b feature/your-feature-name

# 2. Разработать с тестами
# - Написать тесты
# - Реализовать функцию
# - Проверить типизацию

# 3. Проверить качество
pnpm lint && pnpm type-check && pnpm test

# 4. Создать PR
git push origin feature/your-feature-name
```

### 2. **Исправление багов**

```bash
# 1. Создать ветку
git checkout -b fix/bug-description

# 2. Исправить с тестами
# - Написать тест для бага
# - Исправить код
# - Убедиться, что тест проходит

# 3. Проверить качество
pnpm lint && pnpm type-check && pnpm test

# 4. Создать PR
git push origin fix/bug-description
```

---

## 📊 **ПРОВЕРКИ КАЧЕСТВА**

### 1. **Перед каждым коммитом**

```bash
pnpm lint && pnpm type-check && pnpm test
```

### 2. **Перед Pull Request**

```bash
pnpm lint && pnpm type-check && pnpm test && pnpm build
```

### 3. **Code Review Checklist**

- [ ] ❌ Нет `any` типов
- [ ] ❌ Нет `console.log` в production коде
- [ ] ❌ Нет пустых catch блоков
- [ ] ✅ Все интерактивные элементы доступны
- [ ] ✅ Ошибки обрабатываются правильно
- [ ] ✅ JSDoc для сложных функций
- [ ] ✅ Тесты покрывают новую функциональность

---

## 🛠️ **ПОЛЕЗНЫЕ КОМАНДЫ**

### Разработка:
```bash
pnpm dev              # Запуск dev сервера
pnpm build            # Сборка проекта
pnpm start            # Запуск production сервера
```

### Качество кода:
```bash
pnpm lint             # ESLint проверка
pnpm type-check       # TypeScript проверка
pnpm test             # Запуск тестов
pnpm format           # Форматирование кода
```

### Анализ:
```bash
pnpm analyze          # Анализ размера бандла
pnpm lighthouse       # Lighthouse анализ
pnpm metrics          # Метрики производительности
```

### База данных:
```bash
pnpm db:reset         # Сброс базы данных
pnpm db:migrate       # Применение миграций
pnpm db:seed          # Заполнение тестовыми данными
```

---

## 📞 **ПОМОЩЬ И ПОДДЕРЖКА**

### При возникновении проблем:

1. **Проверить документацию** - начните с этого документа
2. **Поискать в issues** - возможно, проблема уже решена
3. **Обратиться к команде** - не стесняйтесь задавать вопросы
4. **Создать issue** - если проблема новая

### Полезные ресурсы:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🎯 **ЦЕЛИ НА ПЕРВЫЙ МЕСЯЦ**

### Неделя 1:
- [ ] Полностью настроить среду разработки
- [ ] Изучить структуру проекта
- [ ] Понять основные компоненты
- [ ] Запустить проект локально

### Неделя 2:
- [ ] Исправить 5+ ESLint предупреждений
- [ ] Добавить JSDoc к 3+ функциям
- [ ] Улучшить доступность 2+ компонентов
- [ ] Написать тесты для 2+ функций

### Неделя 3:
- [ ] Создать простой компонент
- [ ] Добавить API endpoint
- [ ] Написать тесты
- [ ] Создать первый PR

### Неделя 4:
- [ ] Получить feedback от команды
- [ ] Улучшить код на основе feedback
- [ ] Изучить advanced паттерны
- [ ] Готовиться к более сложным задачам

---

## 🚀 **СЛЕДУЮЩИЕ ШАГИ**

После изучения этого документа:

1. **Настройте среду разработки**
2. **Изучите код проекта**
3. **Выберите простую задачу**
4. **Начните разработку**

**Удачи в разработке! 🎉**

---

*Документ создан: Декабрь 2024*  
*Версия: 1.0*  
*Статус: Актуально*
