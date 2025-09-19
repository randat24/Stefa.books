# Инструкции по деплою системы подписки

## ✅ Что исправлено

1. **Удалены несуществующие таблицы** - код теперь работает с существующими таблицами `users` и `subscription_requests`
2. **Исправлен SubscriptionService** - использует таблицу `users` вместо несуществующей `subscriptions`
3. **Обновлен webhook** - правильно обрабатывает успешные и неудачные платежи
4. **Упрощена документация** - убраны ссылки на несуществующие миграции

## 🚀 Быстрый деплой

### 1. Настройте переменные окружения

**В Netlify Dashboard:**
- `MONOBANK_TOKEN=uSjulrJT5jqGnzy8lSQoasq04GRtKMo0myvxJk5D0EKY`
- `NEXT_PUBLIC_SITE_URL=https://stefa-books.com.ua`

### 2. Настройте webhook в Monobank

- URL: `https://stefa-books.com.ua/api/payments/monobank/webhook`
- События: `invoice.status.changed`

### 3. Деплой кода

```bash
git add .
git commit -m "feat: интеграция Monobank с существующей структурой БД"
git push origin main
```

## 🧪 Тестирование

1. Перейдите на `https://stefa-books.com.ua/subscribe`
2. Заполните форму, выберите "Онлайн оплата"
3. Проверьте, что вы перенаправлены на Monobank
4. После оплаты проверьте, что подписка активирована

## 📊 Проверка работы

### В Supabase SQL Editor:

```sql
-- Проверьте заявки на подписку
SELECT id, name, email, plan, payment_method, status, created_at 
FROM subscription_requests 
ORDER BY created_at DESC 
LIMIT 10;

-- Проверьте пользователей с подписками
SELECT id, name, email, subscription_type, subscription_start, subscription_end, status 
FROM users 
WHERE subscription_type IS NOT NULL
ORDER BY created_at DESC 
LIMIT 10;
```

## 🔧 Структура данных

### Таблица `subscription_requests`
- `id` - UUID заявки
- `name`, `email`, `phone` - данные пользователя
- `plan` - mini/maxi/premium
- `payment_method` - monobank/online/cash
- `status` - pending/approved/rejected/completed

### Таблица `users`
- `id` - UUID пользователя
- `name`, `email`, `phone` - данные пользователя
- `subscription_type` - mini/maxi/premium
- `subscription_start`, `subscription_end` - даты подписки
- `status` - active/inactive/suspended

## 🎯 Логика работы

1. **Пользователь** заполняет форму подписки
2. **Заявка** сохраняется в `subscription_requests` со статусом `pending`
3. **Платеж** создается в Monobank
4. **Пользователь** перенаправляется на оплату
5. **Monobank** отправляет webhook при изменении статуса
6. **Webhook** активирует подписку:
   - Обновляет `subscription_requests.status = 'completed'`
   - Создает/обновляет пользователя в `users`
   - Устанавливает `subscription_type`, `subscription_start`, `subscription_end`

## 🚨 Важно

- **Не нужно создавать новые таблицы** - используем существующие
- **RLS политики** уже настроены для `subscription_requests`
- **Логирование** работает через существующий `logger`
- **Валидация** данных через Zod схемы

## 📞 Поддержка

Если что-то не работает:
1. Проверьте логи в Netlify Dashboard
2. Проверьте переменные окружения
3. Проверьте webhook в Monobank
4. Проверьте базу данных в Supabase

---

**Готово!** 🎉 Система подписки с Monobank полностью интегрирована и готова к использованию.
