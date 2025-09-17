# Настройка интеграции с Monobank

## 1. Переменные окружения

### Локальная разработка (.env.local)

Создайте файл `.env.local` в корне проекта и добавьте:

```bash
# Monobank Configuration
MONOBANK_TOKEN=uSjulrJT5jqGnzy8lSQoasq04GRtKMo0myvxJk5D0EKY

# Site URL для webhook'ов
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Продакшн (Vercel)

В настройках проекта Vercel добавьте переменные окружения:

1. Перейдите в Dashboard Vercel → ваш проект → Settings → Environment Variables
2. Добавьте следующие переменные:

```
MONOBANK_TOKEN=uSjulrJT5jqGnzy8lSQoasq04GRtKMo0myvxJk5D0EKY
NEXT_PUBLIC_SITE_URL=https://stefa-books.com.ua
```

**Важно:** Убедитесь, что переменные добавлены для всех окружений:
- Production
- Preview
- Development

## 2. Настройка webhook в Monobank

1. Войдите в личный кабинет Monobank
2. Перейдите в раздел "API" → "Webhook"
3. Добавьте URL webhook: `https://stefa-books.com.ua/api/payments/monobank/webhook`
4. Выберите события: `invoice.status.changed`

## 3. Тестирование

### Локальное тестирование

1. Запустите проект: `npm run dev`
2. Перейдите на страницу подписки
3. Заполните форму и выберите "Онлайн оплата"
4. После отправки формы вы будете перенаправлены на тестовую страницу Monobank

### Проверка webhook

Для тестирования webhook'ов локально можно использовать ngrok:

```bash
# Установите ngrok
npm install -g ngrok

# Запустите туннель
ngrok http 3000

# Используйте полученный URL для webhook в Monobank
# Например: https://abc123.ngrok.io/api/payments/monobank/webhook
```

## 4. Структура платежей

### Суммы по тарифам

- **Mini**: 300 ₴/месяц
- **Maxi**: 500 ₴/месяц  
- **Premium**: 800 ₴/месяц

### Reference формат

- Подписки: `sub_{subscription_request_id}`
- Обычные платежи: `pay_{uuid}`

## 5. Логирование

Все операции с платежами логируются. Проверьте логи в:

- Vercel Dashboard → Functions → Logs
- Консоль браузера (для клиентских ошибок)
- Supabase Dashboard → Logs

## 6. Безопасность

### Валидация webhook

В продакшене рекомендуется включить проверку подписи webhook:

```typescript
// В monobank-payment-service.ts
validateWebhook(body: string, signature: string): boolean {
  // Реализуйте проверку HMAC-SHA256 подписи
  // Согласно документации Monobank
}
```

### RLS политики

Убедитесь, что в Supabase настроены правильные RLS политики для таблиц:
- `subscription_requests`
- `subscriptions` 
- `payments`

## 7. Мониторинг

### Ключевые метрики для отслеживания:

1. **Успешные платежи**: количество и сумма
2. **Неудачные платежи**: причины ошибок
3. **Время обработки**: от создания до активации подписки
4. **Webhook доставка**: успешность получения уведомлений

### Алерты

Настройте уведомления для:
- Ошибок создания платежей
- Неудачных webhook'ов
- Проблем с активацией подписок

## 8. Troubleshooting

### Частые проблемы:

1. **"Monobank token not configured"**
   - Проверьте переменную `MONOBANK_TOKEN` в окружении

2. **"Webhook validation failed"**
   - Проверьте URL webhook в настройках Monobank
   - Убедитесь, что сервер доступен извне

3. **"Subscription activation failed"**
   - Проверьте подключение к Supabase
   - Убедитесь, что таблица `subscriptions` существует

4. **"Invalid response from Monobank API"**
   - Проверьте формат запроса к Monobank
   - Убедитесь, что токен действителен

### Логи для отладки:

```bash
# Локально
npm run dev

# В Vercel
vercel logs --follow
```

## 9. Обновление

При обновлении кода:

1. Проверьте совместимость с текущим API Monobank
2. Протестируйте на staging окружении
3. Обновите документацию при изменении API
4. Уведомите команду о breaking changes

## 10. Контакты

- **Monobank API**: https://api.monobank.ua
- **Документация**: https://docs.monobank.ua
- **Поддержка**: через личный кабинет Monobank
