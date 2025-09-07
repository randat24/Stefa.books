# 🔧 Environment Variables для Vercel

## 📋 Обязательные переменные окружения

### 🗄️ Supabase (База данных)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Где найти:**
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### ☁️ Cloudinary (Изображения)
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Где найти:**
- **Cloud name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- **API Key** → `CLOUDINARY_API_KEY`
- **API Secret** → `CLOUDINARY_API_SECRET`

### 🌐 Базовые настройки
```
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
NODE_ENV=production
```

## 🔧 Как добавить в Vercel

### Способ 1: Через Vercel Dashboard
1. Зайдите в ваш проект на [vercel.com](https://vercel.com)
2. Перейдите в **Settings** → **Environment Variables**
3. Добавьте каждую переменную:
   - **Name**: название переменной
   - **Value**: значение
   - **Environment**: Production (или All)

### Способ 2: Через Vercel CLI
```bash
# Добавить переменные
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
vercel env add NEXT_PUBLIC_BASE_URL

# Проверить переменные
vercel env ls
```

## 📝 Пример заполнения

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Cloudinary
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dchx7vd97
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

### Базовые
```
NEXT_PUBLIC_BASE_URL=https://stefa-books-com-ua.vercel.app
NODE_ENV=production
```

## ⚠️ Важные моменты

### Безопасность
- ✅ `NEXT_PUBLIC_*` переменные доступны в браузере
- ❌ `SUPABASE_SERVICE_ROLE_KEY` и `CLOUDINARY_API_SECRET` - только на сервере
- 🔒 Никогда не коммитьте секретные ключи в Git

### Проверка
После добавления переменных:
1. Перезапустите деплой: `vercel --prod`
2. Проверьте логи: `vercel logs`
3. Убедитесь что приложение работает

## 🚀 После настройки

1. **Деплой**: `vercel --prod`
2. **Проверка**: Откройте ваш сайт
3. **Тестирование**: Проверьте все функции
4. **Мониторинг**: Следите за логами

## 📞 Поддержка

Если что-то не работает:
1. Проверьте логи: `vercel logs`
2. Убедитесь что все переменные добавлены
3. Проверьте права доступа в Supabase/Cloudinary
4. Перезапустите деплой
