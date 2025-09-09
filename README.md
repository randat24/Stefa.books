# 📚 Stefa.Books - Дитяча бібліотека

Сучасна платформа для оренди дитячих книг з адмін-панеллю, AI інтеграцією та повною інтеграцією з базою даних.

## 🚀 Статус проекту

- **✅ Розробка завершена** - Всі основні функції реалізовані
- **✅ Деплой виконано** - Сайт доступний за адресою https://stefa-books.com.ua
- **✅ Стилі виправлені** - Дизайн-система відновлена та стабілізована
- **✅ AI інтеграція** - Groq Llama 3 70B працює
- **✅ TypeScript** - 0 помилок компіляції
- **✅ Tailwind CSS** - Стабільна версія 3.4.17

## 🌐 Живий сайт

**Основна адреса**: https://stefa-books.com.ua

- **API Health**: https://stefa-books.com.ua/api/health ✅
- **API Books**: https://stefa-books.com.ua/api/books ✅
- **Адмін панель**: https://stefa-books.com.ua/admin ✅
- **AI API**: https://stefa-books.com.ua/api/llms.txt ✅

## 🛠 Технології

- **Frontend**: Next.js 15.5.2, React 19.1.1, TypeScript 5.5.4
- **UI**: Tailwind CSS 3.4.17, shadcn/ui, Lucide React
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Хостинг**: Vercel
- **Зображення**: Cloudinary
- **Пакетний менеджер**: pnpm 10.15.1
- **AI Integration**: Groq Llama 3 70B (безкоштовна модель)
- **Анімації**: Framer Motion 12.23.12

## 📦 Встановлення

### ⚡ Швидкий старт
```bash
# Клонуйте репозиторій
git clone <your-repo-url>
cd Stefa.books.com.ua

# Автоматична настройка (рекомендуется)
./setup-local.sh
```

### 🔧 Ручна настройка

1. **Клонуйте репозиторій**
```bash
git clone <your-repo-url>
cd Stefa.books.com.ua
git checkout Lklhost  # Переключитесь на ветку разработки
```

2. **Встановіть залежності**
```bash
# Встановіть pnpm глобально (якщо ще не встановлено)
npm install -g pnpm

# Встановіть залежності проекту
pnpm install
```

3. **Налаштуйте змінні середовища**
```bash
# Створіть файл .env.local
touch .env.local

# Заповніть змінні (див. QUICK_START.md)
```

4. **Запустіть проект**
```bash
pnpm dev
```

### 📖 Детальна інструкція
- [QUICK_START.md](./QUICK_START.md) - Швидкий старт
- [LOCAL_SETUP_GUIDE.md](./LOCAL_SETUP_GUIDE.md) - Повне керівництво
- [DATABASE_DOCUMENTATION.md](./DATABASE_DOCUMENTATION.md) - Документація БД

## 🔧 Налаштування бази даних

### Швидке налаштування
1. Відкрийте [Supabase Dashboard](https://supabase.com/dashboard)
2. Перейдіть в SQL Editor
3. Виконайте SQL скрипт з файлу `fix_rls_users_policy.sql`

### Детальна інструкція
Дивіться [PRODUCTION_RLS_FIX_GUIDE.md](./PRODUCTION_RLS_FIX_GUIDE.md)

## 📖 Документація

### Основні гіди
- [Виправлення RLS в продакшені](./PRODUCTION_RLS_FIX_GUIDE.md) 🔥
- [Як додати книги](./HOW_TO_ADD_BOOKS.md)
- [Синхронізація з сайтом](./SYNC_BOOKS_TO_SITE.md)
- [Налаштування Vercel](./VERCEL_DOCUMENTATION_REPORT.md)

### Технічна документація
- [Структура проекту](./PROJECT_STRUCTURE.md)
- [Стандарти коду](./docs/development/CODING_STANDARDS.md)
- [API документація](./docs/API.md)
- [Тестування](./TESTING_INSTRUCTIONS.md)

## 🎯 Основні функції

### Для користувачів
- ✅ Перегляд каталогу книг (105+ книг)
- ✅ Пошук та фільтрація
- ✅ Перегляд деталей книги
- ✅ Система оренди
- ✅ Реєстрація та авторизація

### Для адміністраторів
- ✅ Управління книгами
- ✅ Синхронізація з базою даних
- ✅ Аналітика та звіти
- ✅ Управління користувачами
- ✅ Завантаження обкладинок

## 📊 Статистика

- **105+ книг** в базі даних
- **27 категорій** книг
- **99+ доступних** книг для оренди
- **88+ книг** з обкладинками Cloudinary
- **3 адміністратори** в системі
  - admin@stefa-books.com.ua (Головний Адміністратор)
  - anastasia@stefa-books.com.ua (Анастасія)
  - randat24@gmail.com (Розробник)

## 🎨 Дизайн-система

- **✅ Відновлена** - Повністю функціональна дизайн-система
- **✅ Стабільна** - Tailwind CSS 3.4.17 (стабільна версія)
- **✅ Документована** - Повна документація в DESIGN_SYSTEM.md
- **✅ Виправлена** - Всі проблеми з іконками та стилями вирішені

## 🚀 Деплой

### Автоматичний деплой
Проект налаштований для автоматичного деплою на Vercel при push в гілку `main`.

### Ручний деплой
```bash
# Перевірка готовності до деплою
pnpm run build

# Деплой на production
vercel --prod
```

### Перевірка після деплою
```bash
# Перевірка API
curl https://stefa-books.com.ua/api/health

# Перевірка книг (після виправлення RLS)
curl https://stefa-books.com.ua/api/books
```

## 🔧 Розробка

### Основні команди
```bash
pnpm dev              # Запуск dev сервера
pnpm build            # Збірка проекту
pnpm start            # Запуск production сервера
pnpm type-check       # Перевірка TypeScript
pnpm lint             # Перевірка коду
pnpm test             # Запуск тестів
```

### Перевірка підключення до БД
```bash
node check_site_database_connection.mjs
```

### AI Integration (mdream)
```bash
# Генерація markdown версії сторінки книги
curl https://stefa-books.com.ua/books/[id].md

# AI discoverability файл
curl https://stefa-books.com.ua/api/llms.txt

# HTML to Markdown API
curl -X POST https://stefa-books.com.ua/api/markdown -d '{"html":"<h1>Test</h1>"}'
```

## 🐛 Відомі проблеми

### Вирішені ✅
- ✅ Помилки збірки Next.js
- ✅ TypeScript помилки (0 помилок)
- ✅ ESLint помилки
- ✅ Деплой на Vercel
- ✅ RLS політики в Supabase
- ✅ API Books працює
- ✅ Стилі та дизайн-система
- ✅ Черні іконки виправлені
- ✅ Tailwind CSS конфлікти

### Поточний стан
- **🟢 Всі системи працюють** - Проект повністю функціональний
- **🟢 AI інтеграція** - Groq Llama 3 70B працює стабільно
- **🟢 Дизайн-система** - Відновлена та стабілізована

## 📝 Ліцензія

MIT License

## 👥 Автори

Stefa.Books Team

---

**Проект готовий до використання!** 🎉

**Наступний крок**: Виправити RLS політики в Supabase для повної функціональності.