# MCP Integration Guide для Stefa.Books

Руководство по интеграции Model Context Protocol (MCP) инструментов в проект Stefa.Books.

## Обзор MCP интеграции

Проект интегрирован с тремя ключевыми MCP серверами:

1. **PostgreSQL MCP** - для работы с Supabase базой данных
2. **Browserbase MCP** - для облачного E2E тестирования с Playwright
3. **F2C MCP** - для конвертации Figma дизайнов в React компоненты

## Быстрый старт

### 1. Установка MCP серверов

```bash
# Установить все MCP серверы
npm run mcp:setup

# Проверить конфигурацию MCP
npm run mcp:test
```

### 2. Настройка переменных окружения

Скопируйте `.env.mcp.example` в `.env.local` и заполните значения:

```bash
cp .env.mcp.example .env.local
```

Заполните следующие переменные:

```env
# PostgreSQL MCP (Supabase)
POSTGRES_CONNECTION_STRING=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Browserbase MCP
BROWSERBASE_API_KEY=your_browserbase_api_key
BROWSERBASE_PROJECT_ID=your_browserbase_project_id

# Figma to Code MCP
FIGMA_ACCESS_TOKEN=your_figma_token
FIGMA_FILE_ID=your_figma_file_id
```

## PostgreSQL MCP

### Назначение
Обеспечивает read-only доступ к Supabase PostgreSQL базе данных для инспекции схемы и мониторинга.

### Конфигурация
- **Файл конфигурации**: `mcp-config.json`
- **Connection string**: Получите из Supabase Dashboard → Settings → Database

### Использование

```bash
# Инспекция базы данных
npm run db:inspect

# Просмотр схемы таблиц
# (команды будут доступны через MCP интерфейс)
```

### Возможности
- Просмотр схемы базы данных
- Инспекция таблиц и связей
- Мониторинг производительности запросов
- Анализ использования индексов

## Browserbase MCP

### Назначение
Облачное выполнение Playwright E2E тестов в реальных браузерах без локальной установки.

### Конфигурация
- **Файл конфигурации**: `browserbase.config.js`
- **Playwright конфигурация**: `playwright-browserbase.config.ts`
- **Тесты**: `src/__tests__/e2e/browserbase/`

### Регистрация
1. Зайдите на https://browserbase.com
2. Создайте аккаунт и проект
3. Получите API ключ и Project ID
4. Добавьте в `.env.local`

### Использование

```bash
# Запуск облачных E2E тестов
npm run test:browserbase

# Запуск с UI интерфейсом
npm run test:browserbase:ui

# Общая команда для всех облачных тестов
npm run test:cloud
```

### Особенности для Stefa.Books
- **Украинская локализация**: `uk-UA`
- **Временная зона**: `Europe/Kiev`
- **Геолокация**: Киев (50.4501, 30.5234)
- **Производительность**: Мониторинг Core Web Vitals
- **Мобильные тесты**: iPhone, Samsung Galaxy, iPad

### Доступные тесты
- `book-catalog.spec.ts` - Тестирование каталога книг
- Поиск и фильтрация книг
- Отзывчивый дизайн
- Производительность загрузки

## F2C MCP (Figma to Code)

### Назначение
Автоматическая конвертация Figma дизайнов в React компоненты с TypeScript и Tailwind CSS.

### Конфигурация
- **Файл конфигурации**: `figma-to-code.config.js`
- **Скрипт генерации**: `scripts/figma-generate.js`
- **Выходная директория**: `src/components/figma-generated/`

### Настройка Figma
1. Получите Personal Access Token:
   - Figma → Account Settings → Personal Access Tokens
   - Создайте новый токен с доступом к вашим файлам
2. Найдите File ID в URL вашего Figma файла:
   - `https://www.figma.com/file/[FILE_ID]/...`

### Использование

```bash
# Генерация всех компонентов из файла
npm run figma:generate

# Генерация конкретного узла
npm run figma:generate -- --node-id=123:456

# Генерация с кастомным именем
npm run figma:generate -- --component-name=NewBookCard

# Справка по командам
npm run figma:generate:help
```

### Особенности генерации

#### Автоматические улучшения
- Добавление украинских комментариев
- Интеграция с дизайн-системой Stefa.Books
- Генерация accessibility атрибутов
- Оптимизация для производительности
- TypeScript типизация

#### Поддерживаемые паттерны
- **BookCard** варианты: `default`, `simple`, `featured`
- **Navigation**: `header`, `breadcrumb`, `pagination`, `category-filter`
- **Forms**: `subscription`, `search`, `contact`, `rental`
- **Modals**: `book-preview`, `subscription`, `confirmation`

#### Дизайн-токены
```javascript
// Цвета бренда Stefa.Books
colors: {
  primary: '#2563eb',      // Синий
  secondary: '#059669',    // Зеленый
  accent: '#dc2626',       // Красный
  neutral: '#6b7280',      // Серый
}

// Типографика
fontFamily: {
  sans: ['Inter', 'sans-serif'],
  display: ['Outfit', 'sans-serif'],
}
```

### Постобработка
После генерации компоненты автоматически:
- Добавляются украинские комментарии
- Интегрируются с `@/lib/utils`
- Добавляются ARIA атрибуты
- Генерируется `index.ts` файл для экспорта

## Интеграция с Cursor IDE

### Настройка .cursorrules
Файл `.cursorrules` обновлен для поддержки MCP:

```markdown
## MCP Integration
- Use PostgreSQL MCP for Supabase database inspection
- Browserbase MCP for cloud E2E testing
- F2C MCP for Figma to code conversion
- Follow MCP configuration in mcp-config.json
```

### Расширенные правила
- Предпочтение Server Components (Next.js 15)
- Ukrainian локализация в UI
- Типизация с TypeScript 5.5.4
- Accessibility для детского интерфейса

## Мониторинг и отладка

### PostgreSQL MCP
```bash
# Проверка подключения к Supabase
psql $POSTGRES_CONNECTION_STRING -c "SELECT current_database();"
```

### Browserbase MCP
```bash
# Просмотр логов тестирования
npx playwright show-report test-results/browserbase-results.json
```

### F2C MCP
```bash
# Проверка Figma API
curl -H "X-Figma-Token: $FIGMA_ACCESS_TOKEN" \
  "https://api.figma.com/v1/files/$FIGMA_FILE_ID"
```

## Устранение неполадок

### Общие проблемы

#### MCP серверы не найдены
```bash
# Переустановить MCP серверы
npm run mcp:setup
```

#### Неверные credentials
- Проверьте `.env.local` файл
- Убедитесь, что токены действительны
- Проверьте права доступа

#### Ошибки генерации компонентов
```bash
# Проверить Figma API
npm run figma:generate -- --help

# Просмотреть логи
DEBUG=* npm run figma:generate
```

### Специфичные решения

#### PostgreSQL MCP
- Убедитесь, что connection string правильный
- Проверьте доступ к Supabase из вашей сети
- Используйте правильный пароль базы данных

#### Browserbase MCP
- Проверьте квоты в Browserbase аккаунте
- Убедитесь, что проект активен
- Проверьте API ключ и Project ID

#### F2C MCP
- Убедитесь, что токен Figma имеет доступ к файлу
- Проверьте корректность File ID
- Убедитесь, что узлы существуют в файле

## Рекомендации

### Лучшие практики
1. **Версионирование**: Коммитьте сгенерированные компоненты в git
2. **Тестирование**: Всегда тестируйте сгенерированные компоненты
3. **Документация**: Документируйте кастомные изменения
4. **Безопасность**: Не коммитьте токены в репозиторий

### Рабочий процесс
1. Создайте дизайн в Figma
2. Сгенерируйте компоненты с F2C MCP
3. Кастомизируйте при необходимости
4. Тестируйте с Browserbase MCP
5. Мониторьте производительность

### Производительность
- Используйте lazy loading для тяжелых компонентов
- Оптимизируйте изображения через Cloudinary
- Мониторьте bundle size после генерации
- Используйте React.memo для дорогих ре-рендеров

## Дополнительные ресурсы

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Browserbase Documentation](https://docs.browserbase.com/)
- [Figma API Documentation](https://www.figma.com/developers/api)
- [Playwright Documentation](https://playwright.dev/)

## Обновления

Для обновления MCP серверов:

```bash
# Обновить все серверы
npm run mcp:setup

# Проверить новые версии
npm outdated @modelcontextprotocol/server-postgres
npm outdated @browserbasehq/mcp-server-browserbase
npm outdated @figma-to-code/mcp-server
```