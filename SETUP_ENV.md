# 🚀 Настройка переменных окружения

## Проблема
В терминале видны ошибки:
```
⨯ Error: Missing Supabase environment variables
```

## Решение

### 1. Создайте файл `.env.local`

Скопируйте файл `env.example` в `.env.local`:

```bash
cp env.example .env.local
```

### 2. Заполните переменные Supabase

Откройте `.env.local` и замените заглушки на реальные значения:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Google Sheets (опционально для админ-панели)
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
```

### 3. Где взять ключи Supabase

1. Зайдите в [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **Settings** → **API**
4. Скопируйте:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Где взять ключи Google Sheets (опционально)

1. Создайте Service Account в [Google Cloud Console](https://console.cloud.google.com/)
2. Скачайте JSON ключ
3. Скопируйте:
   - **client_email** → `GOOGLE_SHEETS_CLIENT_EMAIL`
   - **private_key** → `GOOGLE_SHEETS_PRIVATE_KEY`
   - **spreadsheet_id** из URL Google Sheets → `GOOGLE_SHEETS_SPREADSHEET_ID`

### 5. Перезапустите сервер разработки

```bash
pnpm dev
```

## Временное решение

Если у вас пока нет Supabase проекта, код будет работать с заглушками, но API не будет функционировать.

Google Sheets интеграция опциональна - админ-панель будет работать без неё.

## Проверка

После настройки проверьте:
- [ ] Ошибки Supabase исчезли из терминала
- [ ] Ошибки Google Sheets исчезли из консоли
- [ ] Страница `/my-rentals` загружается без ошибок
- [ ] Админ-панель `/admin` работает корректно
- [ ] API endpoints отвечают корректно

## Безопасность

⚠️ **Важно**: Никогда не коммитьте `.env.local` в Git!
Файл уже добавлен в `.gitignore`.
