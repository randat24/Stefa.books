# 🚀 Полное руководство по локальному запуску Stefa.Books

## Предварительные требования

### 1. Установленные программы
- **Node.js** 18+ (рекомендуется 20+)
- **pnpm** (пакетный менеджер)
- **Git**

### 2. Проверка установки
```bash
# Проверяем версии
node --version    # Должно быть 18+
pnpm --version    # Должно быть 8+
git --version     # Любая версия
```

## Пошаговая установка

### Шаг 1: Клонирование репозитория
```bash
# Клонируем репозиторий
git clone https://github.com/your-username/Stefa.books.com.ua.git
cd Stefa.books.com.ua

# Переключаемся на ветку для разработки
git checkout Lklhost
```

### Шаг 2: Установка зависимостей
```bash
# Устанавливаем pnpm глобально (если не установлен)
npm install -g pnpm

# Устанавливаем зависимости проекта
pnpm install

# Очищаем кэш (если возникают проблемы)
pnpm run clean:cache
```

### Шаг 3: Настройка переменных окружения

#### 3.1 Создаем файл .env.local
```bash
# В корне проекта создаем файл
touch .env.local
```

#### 3.2 Заполняем переменные окружения
Откройте `.env.local` и добавьте:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

#### 3.3 Получение ключей Supabase
1. Перейдите на [supabase.com](https://supabase.com/dashboard)
2. Войдите в ваш проект
3. Перейдите в **Settings → API**
4. Скопируйте:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

#### 3.4 Получение ключей Cloudinary
1. Перейдите на [cloudinary.com](https://cloudinary.com/console)
2. В Dashboard скопируйте:
   - **Cloud name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

### Шаг 4: Запуск проекта

#### 4.1 Разработческий режим
```bash
# Основная команда для разработки
pnpm dev

# Или с проверкой стилей
pnpm run dev-safe

# Или с очисткой кэша
pnpm run dev:workflow
```

#### 4.2 Проверка запуска
После запуска откройте браузер:
- **Основной сайт**: http://localhost:3000
- **API Health**: http://localhost:3000/api/health
- **API Books**: http://localhost:3000/api/books
- **Админ панель**: http://localhost:3000/admin

## Возможные проблемы и решения

### Проблема 1: Ошибки при установке зависимостей
```bash
# Решение: Очистка и переустановка
rm -rf node_modules package-lock.json
pnpm install
```

### Проблема 2: Ошибки TypeScript
```bash
# Решение: Перезапуск TypeScript сервера
pnpm run ts:restart

# Или исправление типов
pnpm run fix:react-types
```

### Проблема 3: Ошибки ESLint
```bash
# Решение: Автоматическое исправление
pnpm run lint:fix

# Или проверка стилей
pnpm run check-styles
```

### Проблема 4: Ошибки сборки
```bash
# Решение: Очистка и пересборка
pnpm run clean
pnpm run build
```

### Проблема 5: Ошибки подключения к базе данных
```bash
# Решение: Проверка подключения
node check_site_database_connection.mjs

# Или проверка структуры БД
node check_table_structure.mjs
```

## Команды для разработки

### Основные команды
```bash
# Разработка
pnpm dev                    # Запуск dev сервера
pnpm build                  # Сборка проекта
pnpm start                  # Запуск production сервера

# Проверки
pnpm type-check            # Проверка TypeScript
pnpm lint                  # Проверка кода
pnpm test                  # Запуск тестов
pnpm test:e2e              # E2E тесты

# Очистка
pnpm clean                 # Очистка временных файлов
pnpm clean:full            # Полная очистка с переустановкой
```

### Специальные команды
```bash
# Работа с книгами
pnpm insert-books          # Загрузка книг в БД
pnpm check-books           # Проверка книг в БД

# Администрирование
pnpm create-admin          # Создание админа
pnpm netlify:check         # Проверка Netlify

# Анализ производительности
pnpm analyze:bundle        # Анализ размера бандла
pnpm perf:check            # Проверка производительности
```

## Структура проекта

```
Stefa.books.com.ua/
├── src/                    # Исходный код
│   ├── app/               # Next.js App Router
│   ├── components/        # React компоненты
│   ├── lib/              # Утилиты и конфигурация
│   └── contexts/         # React контексты
├── public/               # Статические файлы
├── supabase/            # Конфигурация Supabase
├── scripts/             # Скрипты для разработки
├── tests/               # Тесты
├── docs/                # Документация
└── database/            # SQL скрипты
```

## Настройка IDE

### VS Code (рекомендуется)
Установите расширения:
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **TypeScript Importer**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**

### Настройки VS Code (.vscode/settings.json)
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.includeLanguages": {
    "typescript": "typescript",
    "typescriptreact": "typescriptreact"
  }
}
```

## Отладка

### 1. Проверка логов
```bash
# В терминале где запущен dev сервер
# Смотрите на ошибки в консоли

# Проверка логов Netlify (если деплоите)
netlify logs
```

### 2. Проверка базы данных
```bash
# Проверка подключения
node check_site_database_connection.mjs

# Проверка структуры таблиц
node check_table_structure.mjs

# Проверка книг
node check_books_structure.mjs
```

### 3. Проверка API
```bash
# Health check
curl http://localhost:3000/api/health

# Books API
curl http://localhost:3000/api/books

# Admin API (требует авторизации)
curl http://localhost:3000/api/admin/books
```

## Полезные ссылки

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Cloudinary Console**: https://cloudinary.com/console
- **Netlify Dashboard**: https://app.netlify.com
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

## Поддержка

Если возникают проблемы:

1. **Проверьте логи** в терминале
2. **Очистите кэш** командой `pnpm run clean:cache`
3. **Переустановите зависимости** командой `pnpm install`
4. **Проверьте переменные окружения** в `.env.local`
5. **Обратитесь к документации** в папке `docs/`

## Готово! 🎉

После выполнения всех шагов ваш проект должен запуститься локально на http://localhost:3000

**Следующие шаги:**
1. Проверьте работу всех страниц
2. Протестируйте API endpoints
3. Настройте админ панель
4. Начните разработку новых функций
