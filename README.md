# 📚 Stefa.Books - Дитяча бібліотека

Сучасна платформа для оренди дитячих книг з адмін-панеллю та повною інтеграцією з базою даних.

## 🚀 Особливості

- **Каталог книг** - 105+ дитячих книг з пошуком та фільтрами
- **Адмін-панель** - управління книгами, користувачами та орендами
- **Синхронізація** - автоматична синхронізація з базою даних
- **Сучасний UI** - адаптивний дизайн з Tailwind CSS
- **API** - RESTful API для всіх операцій

## 🛠 Технології

- **Frontend**: Next.js 15.5.2, React 19.1.1, TypeScript 5.5.4
- **UI**: Tailwind CSS 4.1.13, shadcn/ui, Lucide React
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Хостинг**: Vercel
- **Зображення**: Cloudinary
- **Пакетний менеджер**: pnpm 10.15.1
- **AI Integration**: mdream (HTML to Markdown conversion)

## 📦 Встановлення

1. **Клонуйте репозиторій**
```bash
git clone <your-repo-url>
cd Stefa-books-v2.1
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
cp .env.example .env.local
# Відредагуйте .env.local з вашими ключами
```

4. **Запустіть проект**
```bash
pnpm dev
```

## 🔧 Налаштування бази даних

Дивіться детальну інструкцію в [SETUP_DATABASE_NOW.md](./SETUP_DATABASE_NOW.md)

## 📖 Документація

- [Як додати книги](./HOW_TO_ADD_BOOKS.md)
- [Синхронізація з сайтом](./SYNC_BOOKS_TO_SITE.md)
- [Налаштування Vercel](./VERCEL_DOCUMENTATION_REPORT.md)

## 🎯 Основні функції

### Для користувачів
- Перегляд каталогу книг
- Пошук та фільтрація
- Перегляд деталей книги
- Система оренди

### Для адміністраторів
- Управління книгами
- Синхронізація з базою даних
- Аналітика та звіти
- Управління користувачами

## 📊 Статистика

- **105 книг** в базі даних
- **27 категорій** книг
- **99 доступних** книг для оренди
- **88 книг** з обкладинками

## 🚀 Деплой

Проект готовий для деплою на Vercel:

```bash
# Перевірка готовності до деплою
pnpm run vercel:check

# Деплой на production
pnpm run vercel:deploy:prod

# Або через Vercel CLI
vercel --prod
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

### AI Integration (mdream)
```bash
# Генерація markdown версії сторінки книги
curl https://stefa-books.com.ua/books/[id].md

# AI discoverability файл
curl https://stefa-books.com.ua/api/llms.txt

# HTML to Markdown API
curl -X POST https://stefa-books.com.ua/api/markdown -d '{"html":"<h1>Test</h1>"}'
```

## 📝 Ліцензія

MIT License

## 👥 Автори

Stefa.Books Team

---

**Готово до використання!** 🎉