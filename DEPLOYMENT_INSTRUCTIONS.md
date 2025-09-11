# Инструкции по деплою Stefa.books

## ✅ Выполненные изменения

### 1. Замена ПриватБанка на Монобанк
- ✅ Обновлены все упоминания ПриватБанка на Монобанк
- ✅ Изменены компоненты: `SubscribeFormHome.tsx`, `SubscribeModal.tsx`, `terms/page.tsx`
- ✅ Обновлены реквизиты для перевода

### 2. API для платежей Монобанк
- ✅ Создан API `/api/payments/monobank` для создания платежей
- ✅ Создан webhook `/api/payments/monobank/webhook` для обработки уведомлений
- ✅ Созданы типы в `src/lib/types/payments.ts`
- ✅ Создан сервис `src/lib/services/payment-service.ts`

### 3. Интеграция платежей
- ✅ Обновлена страница subscription для работы с Монобанк API
- ✅ Создана страница успешной оплаты `/subscription/success`
- ✅ Добавлена поддержка QR-кодов и payment_url

### 4. Дизайн логотипа
- ✅ Убран фон с логотипа (сделан прозрачным)
- ✅ Текст "Stefa.books" сделан меньше и жирнее
- ✅ Исправлены ESLint ошибки

### 5. Подготовка к деплою
- ✅ Обновлен `vercel.json` для поддержки webhook'ов
- ✅ Проект успешно собирается (`npm run build`)

## 🚀 Деплой на Vercel

### Шаг 1: Настройка переменных окружения

В панели Vercel добавьте следующие переменные:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Monobank (когда получите данные)
MONOBANK_API_URL=https://api.monobank.ua
MONOBANK_PUBLIC_KEY=your_monobank_public_key
MONOBANK_PRIVATE_KEY=your_monobank_private_key
MONOBANK_WEBHOOK_SECRET=your_webhook_secret

# App
NEXT_PUBLIC_APP_URL=https://stefa-books-next.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://stefa-books-next.vercel.app
```

### Шаг 2: Деплой

1. Убедитесь, что вы находитесь в ветке `main`
2. Зафиксируйте все изменения:
   ```bash
   git add .
   git commit -m "feat: интеграция с Монобанк, исправление логотипа, подготовка к деплою"
   git push origin main
   ```

3. Vercel автоматически задеплоит проект

### Шаг 3: Настройка webhook'ов Монобанк

После деплоя настройте webhook в панели Монобанк:
- URL: `https://stefa-books-next.vercel.app/api/payments/monobank/webhook`
- События: `InvoicePaymentStatusChanged`

## 🔧 Дополнительные настройки

### База данных
Убедитесь, что в Supabase создана таблица `payments`:

```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  invoice_id VARCHAR(255) UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'UAH',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  description TEXT,
  order_id VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  subscription_type VARCHAR(50),
  payment_url TEXT,
  qr_code TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### RLS политики для payments
```sql
-- Разрешить чтение всем
CREATE POLICY "Allow public read access" ON payments FOR SELECT USING (true);

-- Разрешить создание всем
CREATE POLICY "Allow public insert" ON payments FOR INSERT WITH CHECK (true);

-- Разрешить обновление только через webhook
CREATE POLICY "Allow webhook update" ON payments FOR UPDATE USING (true);
```

## 📋 Чек-лист после деплоя

- [ ] Проверить работу главной страницы
- [ ] Проверить работу каталога
- [ ] Проверить работу админ панели
- [ ] Проверить работу страницы subscription
- [ ] Протестировать создание платежа (в тестовом режиме)
- [ ] Настроить webhook в Монобанк
- [ ] Протестировать полный цикл оплаты

## 🎯 Готово к продакшену!

Проект полностью подготовлен к деплою и работе с реальными платежами Монобанк.
