# ⚡ Швидкий старт з Vercel

Коротке керівництво для швидкого деплою проекту Stefa.Books на Vercel.

## 🚀 Швидкий деплой

### 1. Перевірка готовності
```bash
pnpm vercel:check
```

### 2. Деплой в preview
```bash
pnpm vercel:deploy:preview
```

### 3. Деплой в production
```bash
pnpm vercel:deploy:prod
```

## 🔧 Налаштування

### Змінні середовища в Vercel
Додайте в Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### Vercel CLI
```bash
# Встановлення
npm i -g vercel

# Авторизація
vercel login

# Деплой
vercel --prod
```

## 📋 Чек-лист

- [ ] Всі тести проходять (`pnpm test`)
- [ ] TypeScript компілюється (`pnpm type-check`)
- [ ] Лінтінг без помилок (`pnpm lint`)
- [ ] Проект білдиться (`pnpm build`)
- [ ] Змінні середовища налаштовані в Vercel
- [ ] Vercel CLI встановлено (`vercel --version`)

## 🆘 Допомога

- **Повна документація**: `VERCEL_DEPLOYMENT_GUIDE.md`
- **Налаштування середовища**: `ENV_SETUP.md`
- **Скрипт перевірки**: `pnpm vercel:check`

---
*Швидкий старт оновлено: Грудень 2024*
