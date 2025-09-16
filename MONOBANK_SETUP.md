# Настройка интеграции с Монобанком

## Переменные окружения

Добавьте следующие переменные в ваш `.env.local`:

```env
# Monobank Configuration
MONOBANK_API_URL=https://api.monobank.ua/api
MONOBANK_PUBLIC_KEY=your_monobank_public_key
MONOBANK_PRIVATE_KEY=your_monobank_private_key
MONOBANK_MERCHANT_ID=your_monobank_merchant_id

# App Configuration (для webhook)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Получение ключей Монобанка

1. **Зарегистрируйтесь в Монобанк Business**
   - Перейдите на https://business.monobank.ua/
   - Создайте аккаунт для вашего бизнеса

2. **Создайте приложение**
   - В личном кабинете перейдите в раздел "API"
   - Создайте новое приложение
   - Получите `public_key` и `private_key`

3. **Настройте webhook**
   - Укажите URL: `https://your-domain.com/api/payment/webhook`
   - Монобанк будет отправлять уведомления о статусе платежей

## Тестирование

### Тестовые данные
- Используйте тестовые карты Монобанка для проверки
- В тестовом режиме платежи не списываются реально

### Проверка webhook
```bash
curl -X GET https://your-domain.com/api/payment/webhook
```

Должен вернуть: `{"status":"ok","message":"Monobank webhook endpoint is active"}`

## Структура платежа

### Создание платежа
```typescript
POST /api/payment/create
{
  "subscriptionRequestId": "uuid",
  "amount": 300, // в гривнах
  "description": "Підписка MINI - 300 ₴",
  "redirectUrl": "https://your-domain.com/subscribe/success"
}
```

### Webhook от Монобанка
```typescript
POST /api/payment/webhook
{
  "invoiceId": "string",
  "status": "success|failure|process",
  "amount": 30000, // в копейках
  "ccy": 980,
  "reference": "sub_uuid_timestamp",
  "createdDate": 1234567890,
  "modifiedDate": 1234567890
}
```

## Безопасность

1. **Проверка подписи webhook**
   - В продакшене обязательно проверяйте подпись от Монобанка
   - Используйте HMAC для валидации

2. **HTTPS обязателен**
   - Webhook URL должен быть доступен по HTTPS
   - Используйте SSL сертификат

3. **Логирование**
   - Все операции с платежами логируются
   - Проверяйте логи на предмет ошибок

## Отладка

### Логи
```bash
# Проверьте логи приложения
tail -f logs/app.log | grep -i monobank
```

### Тестирование локально
```bash
# Используйте ngrok для тестирования webhook
ngrok http 3000
# Обновите MONOBANK_WEBHOOK_URL в .env.local
```

## Поддержка

При возникновении проблем:
1. Проверьте логи приложения
2. Убедитесь, что все переменные окружения настроены
3. Проверьте доступность webhook URL
4. Обратитесь в поддержку Монобанка
