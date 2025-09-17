# Деплой на Netlify - ЗАВЕРШЕН ✅

**Статус:** Проект успешно развернут на Netlify
**URL:** https://stefa-books.com.ua
**Netlify URL:** https://stefabooks.netlify.app
**Дата деплоя:** 17 сентября 2025

## ✅ Завершенные настройки

1. ✅ Установлен Netlify CLI:
```bash
npm install -g netlify-cli
```

2. ✅ Проведена авторизация в Netlify:
```bash
netlify login
```

## ✅ Настроенные переменные окружения

Все переменные окружения успешно добавлены через Netlify CLI:

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` - URL вашего Supabase проекта
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon ключ Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role ключ Supabase

### Cloudinary
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Имя облака Cloudinary
- `CLOUDINARY_API_KEY` - API ключ Cloudinary
- `CLOUDINARY_API_SECRET` - API секрет Cloudinary

### Другие
- `NEXT_PUBLIC_SITE_URL` - URL вашего сайта на Netlify
- `NODE_ENV` - production

## Деплой

### Автоматический деплой
```bash
# Превью деплой
npm run netlify:deploy:preview

# Продакшн деплой
npm run netlify:deploy:prod
```

### Ручной деплой
```bash
# Сборка
npm run build

# Деплой
netlify deploy --dir=.next --prod
```

## Настройка домена

1. В панели Netlify перейдите в Site settings > Domain management
2. Добавьте ваш кастомный домен
3. Настройте DNS записи:
   - A запись: `@` → `75.2.60.5`
   - CNAME запись: `www` → `your-site.netlify.app`
4. Включите HTTPS

## Полезные команды

```bash
# Статус деплоя
npm run netlify:status

# Открыть сайт
npm run netlify:open

# Логи деплоя
netlify logs
```

## Структура файлов

- `netlify.toml` - конфигурация Netlify
- `scripts/netlify-deploy.sh` - скрипт деплоя
- `.next/` - собранное приложение (создается при сборке)
