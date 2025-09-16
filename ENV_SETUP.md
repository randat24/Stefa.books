# 🔧 Налаштування змінних середовища

Повне керівництво з налаштування змінних середовища для проекту Stefa.Books.

## 📁 Структура файлів

```
.env.example          # Приклад змінних (комітиться в Git)
.env.local           # Локальна розробка (НЕ комітиться)
.env.production      # Продакшн (НЕ комітиться)
.env.development     # Розробка (НЕ комітиться)
```

## 🚀 Швидкий старт

### 1. Створіть файл `.env.local`

```bash
# Скопіюйте приклад
cp .env.example .env.local

# Відредагуйте файл
nano .env.local
```

### 2. Налаштуйте змінні

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

## 🔑 Отримання ключів

### Supabase

1. Перейдіть на [supabase.com](https://supabase.com/dashboard)
2. Виберіть ваш проект
3. Перейдіть в **Settings → API**
4. Скопіюйте:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### Cloudinary

1. Перейдіть на [cloudinary.com](https://cloudinary.com/console)
2. У Dashboard скопіюйте:
   - **Cloud name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

## 🌍 Середовища

### Development (.env.local)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_development_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_development_service_role_key

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Environment
NODE_ENV=development

# Debug
DEBUG=true
LOG_LEVEL=debug
```

### Production (.env.production)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_production_cloud_name
CLOUDINARY_API_KEY=your_production_api_key
CLOUDINARY_API_SECRET=your_production_api_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://stefa-books.com.ua

# Environment
NODE_ENV=production

# Security
DEBUG=false
LOG_LEVEL=error
```

### Staging (.env.staging)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_staging_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_staging_service_role_key

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_staging_cloud_name
CLOUDINARY_API_KEY=your_staging_api_key
CLOUDINARY_API_SECRET=your_staging_api_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://staging.stefa-books.com.ua

# Environment
NODE_ENV=production
DEBUG=true
```

## 🔒 Безпека

### Важливі правила:

- ❌ **НІКОЛИ** не комітьте `.env` файли в Git
- ✅ Використовуйте різні ключі для різних середовищ
- ✅ Регулярно ротуйте API ключі
- ✅ Використовуйте `.env.example` як шаблон
- ✅ Перевіряйте права доступу до файлів

### .gitignore

Переконайтеся, що в `.gitignore` є:

```gitignore
# Environment variables
.env
.env.local
.env.development
.env.production
.env.staging
.env.*.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
```

## 🧪 Перевірка налаштувань

### Скрипт перевірки

Створіть `scripts/check-env.js`:

```javascript
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'NEXT_PUBLIC_SITE_URL'
]

const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.error('❌ Відсутні змінні середовища:')
  missingVars.forEach(varName => console.error(`  - ${varName}`))
  process.exit(1)
}

console.log('✅ Всі змінні середовища налаштовані')
```

### Запуск перевірки

```bash
# Додайте в package.json
{
  "scripts": {
    "check-env": "node scripts/check-env.js",
    "dev": "npm run check-env && next dev"
  }
}
```

## 🔧 Налаштування для різних платформ

### Vercel

1. Перейдіть в **Settings → Environment Variables**
2. Додайте всі змінні для кожного середовища:
   - **Development**
   - **Preview** 
   - **Production**

### Netlify

1. Перейдіть в **Site settings → Environment variables**
2. Додайте змінні для кожного контексту

### Railway

1. Перейдіть в **Variables**
2. Додайте змінні для кожного середовища

## 🐛 Усунення проблем

### Помилка "Environment variable not found"

```bash
# Перевірте, що файл існує
ls -la .env.local

# Перевірте вміст файлу
cat .env.local

# Перезапустіть сервер
pnpm dev
```

### Помилка підключення до Supabase

```bash
# Перевірте URL
curl -I $NEXT_PUBLIC_SUPABASE_URL

# Перевірте ключ
curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
     $NEXT_PUBLIC_SUPABASE_URL/rest/v1/
```

### Помилка підключення до Cloudinary

```bash
# Перевірте підключення
curl "https://api.cloudinary.com/v1_1/$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME/resources/image"
```

## 📝 Шаблон .env.example

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

# Optional: Debug
DEBUG=false
LOG_LEVEL=info

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn

# Optional: Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🚀 Автоматизація

### Скрипт налаштування

Створіть `scripts/setup-env.sh`:

```bash
#!/bin/bash

echo "🔧 Налаштування змінних середовища..."

# Створення .env.local з .env.example
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Створено .env.local з .env.example"
else
    echo "⚠️  .env.local вже існує"
fi

# Перевірка наявності змінних
echo "🔍 Перевірка змінних середовища..."
node scripts/check-env.js

echo "🎉 Налаштування завершено!"
echo "📝 Відредагуйте .env.local з вашими ключами"
```

### Запуск

```bash
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh
```

## 📚 Додаткові ресурси

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Configuration](https://supabase.com/docs/guides/getting-started)
- [Cloudinary Setup](https://cloudinary.com/documentation/node_integration)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Важливо**: Ніколи не діліться вашими API ключами та не комітьте їх в Git! 🔒

*Environment Setup Guide оновлено: Грудень 2024*
