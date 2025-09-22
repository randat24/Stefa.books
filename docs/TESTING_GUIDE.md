# Руководство по тестированию системы подписки

## 🧪 Быстрое тестирование

### 1. Локальное тестирование

```bash
# Запустите проект
npm run dev

# Откройте в браузере
http://localhost:3000/subscribe
```

### 2. Тестирование формы подписки

1. **Заполните форму:**
   - Имя: `Тест Тестович`
   - Email: `test@example.com`
   - Телефон: `+380123456789`
   - План: `Mini` (300 ₴)
   - Способ оплаты: `Онлайн оплата`

2. **Отправьте форму** - вы должны быть перенаправлены на страницу Monobank

### 3. Тестирование API endpoints

```bash
# Создание платежа
curl -X POST http://localhost:3000/api/payments/monobank \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 300,
    "description": "Test payment",
    "customer_email": "test@example.com"
  }'

# Проверка статуса (замените invoice_id на реальный)
curl "http://localhost:3000/api/payments/monobank?invoice_id=test_invoice"
```

### 4. Проверка базы данных

В Supabase SQL Editor выполните:

```sql
-- Проверьте заявки на подписку
SELECT * FROM subscription_requests 
ORDER BY created_at DESC 
LIMIT 5;

-- Проверьте пользователей с подписками
SELECT id, name, email, subscription_type, subscription_start, subscription_end, status 
FROM users 
WHERE subscription_type IS NOT NULL
ORDER BY created_at DESC 
LIMIT 5;
```

## 🔍 Что проверить

### ✅ Успешный сценарий

1. **Форма подписки:**
   - [ ] Форма валидируется корректно
   - [ ] При выборе "Онлайн оплата" показывается информационное сообщение
   - [ ] После отправки происходит перенаправление на Monobank

2. **API создание платежа:**
   - [ ] Возвращает `success: true`
   - [ ] Содержит `paymentUrl` и `invoiceId`
   - [ ] Логируется в консоли

3. **База данных:**
   - [ ] Заявка сохраняется в `subscription_requests`
   - [ ] Статус заявки: `pending`
   - [ ] Платеж создается в Monobank

### ❌ Обработка ошибок

1. **Неправильные данные:**
   - [ ] Неверный email формат
   - [ ] Неправильный номер телефона
   - [ ] Незаполненные обязательные поля

2. **API ошибки:**
   - [ ] Отсутствует `MONOBANK_TOKEN`
   - [ ] Неверный формат запроса
   - [ ] Ошибки подключения к Supabase

## 🐛 Отладка

### Логи в консоли браузера

```javascript
// Откройте DevTools (F12) → Console
// Ищите сообщения с префиксом:
// - "SubscriptionService:"
// - "MonobankPaymentService:"
// - "Payment creation"
```

### Логи сервера

```bash
# В терминале где запущен npm run dev
# Ищите сообщения:
# - "Creating Monobank payment"
# - "Payment created successfully"
# - "Subscription activated successfully"
```

### Проверка переменных окружения

```bash
# Проверьте .env.local
cat .env.local

# Должно содержать:
# MONOBANK_TOKEN=uSjulrJT5jqGnzy8lSQoasq04GRtKMo0myvxJk5D0EKY
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🚨 Частые проблемы

### 1. "Monobank token not configured"

**Решение:** Проверьте переменную `MONOBANK_TOKEN` в `.env.local`

### 2. "Failed to create payment"

**Решение:** 
- Проверьте токен Monobank
- Убедитесь, что API Monobank доступен
- Проверьте логи в консоли

### 3. "Database error"

**Решение:**
- Проверьте подключение к Supabase
- Убедитесь, что таблицы `users` и `subscription_requests` существуют
- Проверьте RLS политики

### 4. "Webhook not received"

**Решение:**
- Проверьте URL webhook в настройках Monobank
- Убедитесь, что сервер доступен извне (используйте ngrok для локального тестирования)

## 📊 Мониторинг

### Ключевые метрики

1. **Успешные платежи:**
   ```sql
   SELECT COUNT(*) as successful_payments
   FROM subscription_requests 
   WHERE status = 'completed';
   ```

2. **Активные подписки:**
   ```sql
   SELECT COUNT(*) as active_subscriptions
   FROM users 
   WHERE status = 'active' 
   AND subscription_end > NOW();
   ```

3. **Ошибки платежей:**
   ```sql
   SELECT COUNT(*) as failed_payments
   FROM subscription_requests 
   WHERE status = 'rejected';
   ```

## 🔧 Настройка для продакшена

### 1. Переменные окружения в Netlify

```
MONOBANK_TOKEN=uSjulrJT5jqGnzy8lSQoasq04GRtKMo0myvxJk5D0EKY
NEXT_PUBLIC_SITE_URL=https://stefa-books.com.ua
```

### 2. Webhook в Monobank

- URL: `https://stefa-books.com.ua/api/payments/monobank/webhook`
- События: `invoice.status.changed`

### 3. Тестирование в продакшене

1. Создайте тестовую заявку на подписку
2. Проверьте, что вы перенаправлены на Monobank
3. Выполните тестовую оплату
4. Проверьте, что подписка активирована

## 📞 Поддержка

Если что-то не работает:

1. **Проверьте логи** в Netlify Dashboard → Functions → Logs
2. **Проверьте базу данных** в Supabase Dashboard
3. **Проверьте настройки** Monobank в личном кабинете
4. **Создайте issue** с описанием проблемы и логами

---

**Готово!** 🎉 Теперь вы можете протестировать систему подписки с Monobank.
