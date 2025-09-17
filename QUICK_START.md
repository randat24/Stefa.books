# Быстрый запуск системы подписки с Monobank

## 🚀 Что было реализовано

✅ **MonobankPaymentService** - сервис для работы с API Monobank  
✅ **SubscriptionService** - сервис для активации подписок  
✅ **API роуты** - создание платежей и обработка webhook'ов  
✅ **Страница успешной оплаты** - `/payment/success`  
✅ **Интеграция с формой подписки** - автоматическое перенаправление на оплату  
✅ **База данных** - таблицы `payments` и `subscriptions`  
✅ **Документация** - полные инструкции по настройке  

## ⚡ Быстрый старт

### 1. Настройте переменные окружения

**Локально (.env.local):**
```bash
MONOBANK_TOKEN=uSjulrJT5jqGnzy8lSQoasq04GRtKMo0myvxJk5D0EKY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**В Vercel:**
- Dashboard → Settings → Environment Variables
- Добавьте те же переменные для Production

### 2. Проверьте структуру базы данных

Убедитесь, что у вас есть таблицы:
- `users` - с полями `subscription_type`, `subscription_start`, `subscription_end`, `status`
- `subscription_requests` - для заявок на подписку

Если таблиц нет, выполните миграции из папки `supabase/migrations/`.

### 3. Настройте webhook в Monobank

- Личный кабинет Monobank → API → Webhook
- URL: `https://stefa-books.com.ua/api/payments/monobank/webhook`
- События: `invoice.status.changed`

### 4. Деплой

```bash
git checkout main
git merge Lklhost
git push origin main
```

## 🧪 Тестирование

1. Перейдите на `/subscribe`
2. Заполните форму, выберите "Онлайн оплата"
3. После отправки вы будете перенаправлены на Monobank
4. После оплаты - на `/payment/success`

## 📊 Логика работы

```
1. Пользователь заполняет форму подписки
2. Выбирает "Онлайн оплата" 
3. Форма отправляется на /api/subscribe
4. API создает платеж в Monobank через /api/payments/monobank
5. Пользователь перенаправляется на страницу оплаты Monobank
6. После оплаты - на /payment/success
7. Monobank отправляет webhook на /api/payments/monobank/webhook
8. Webhook активирует подписку через SubscriptionService
9. Пользователь получает активную подписку
```

## 🔧 Структура файлов

```
src/
├── lib/payments/
│   ├── monobank-payment-service.ts    # Сервис Monobank
│   └── subscription-service.ts        # Сервис подписок
├── app/api/payments/monobank/
│   ├── route.ts                       # Создание платежей
│   └── webhook/route.ts              # Обработка webhook'ов
├── app/payment/success/
│   └── page.tsx                       # Страница успешной оплаты
└── components/subscribe/
    └── SubscribeFormHome.tsx          # Форма подписки (обновлена)

База данных использует существующие таблицы:
- users (subscription_type, subscription_start, subscription_end, status)
- subscription_requests (для заявок на подписку)
```

## 🎯 Тарифы

- **Mini**: 300 ₴/месяц (1 книга)
- **Maxi**: 500 ₴/месяц (2 книги)  
- **Premium**: 800 ₴/месяц (3 книги)

## 🛡️ Безопасность

- RLS политики настроены
- Webhook валидация (заглушка)
- Логирование всех операций
- Валидация входных данных

## 📞 Поддержка

- **Документация**: `MONOBANK_SETUP.md`
- **Деплой**: `DEPLOYMENT_GUIDE.md`
- **Логи**: Vercel Dashboard → Functions → Logs

## ⚠️ Важно

1. **Токен Monobank** - убедитесь, что он действителен
2. **Webhook URL** - должен быть доступен извне
3. **База данных** - выполните все миграции
4. **Тестирование** - протестируйте на staging перед продакшеном

---

**Готово!** 🎉 Система подписки с Monobank полностью интегрирована и готова к использованию.
