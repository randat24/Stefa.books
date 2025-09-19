# Руководство по деплою системы подписки с Monobank

## Предварительные требования

1. ✅ Проект настроен на Netlify
2. ✅ Supabase подключен и настроен
3. ✅ Получен токен Monobank
4. ✅ Созданы необходимые таблицы в базе данных

## Пошаговый деплой

### 1. Обновление базы данных

Выполните миграции в Supabase:

```sql
-- Выполните в Supabase SQL Editor
-- 1. Создание таблицы платежей
\i supabase/migrations/013_add_payments_table.sql

-- 2. Создание таблицы подписок  
\i supabase/migrations/014_add_subscriptions_table.sql
```

### 2. Настройка переменных окружения в Netlify

1. Перейдите в [Netlify Dashboard](https://app.netlify.com)
2. Выберите проект `stefa-books-next`
3. Перейдите в Settings → Environment Variables
4. Добавьте следующие переменные:

```
MONOBANK_TOKEN=uSjulrJT5jqGnzy8lSQoasq04GRtKMo0myvxJk5D0EKY
NEXT_PUBLIC_SITE_URL=https://stefa-books.com.ua
```

**Важно:** Убедитесь, что переменные добавлены для всех окружений (Production, Preview, Development).

### 3. Настройка webhook в Monobank

1. Войдите в [личный кабинет Monobank](https://api.monobank.ua)
2. Перейдите в раздел "API" → "Webhook"
3. Добавьте URL webhook: `https://stefa-books.com.ua/api/payments/monobank/webhook`
4. Выберите события: `invoice.status.changed`

### 4. Деплой кода

```bash
# Переключитесь на ветку main
git checkout main

# Слейте изменения из Lklhost
git merge Lklhost

# Запушьте изменения
git push origin main
```

Netlify автоматически задеплоит изменения.

### 5. Проверка деплоя

#### 5.1. Проверка API endpoints

```bash
# Проверка создания платежа
curl -X POST https://stefa-books.com.ua/api/payments/monobank \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 300,
    "description": "Test payment",
    "customer_email": "test@example.com"
  }'

# Проверка статуса платежа
curl "https://stefa-books.com.ua/api/payments/monobank?invoice_id=test_invoice"
```

#### 5.2. Проверка webhook

1. Создайте тестовую заявку на подписку
2. Выберите "Онлайн оплата"
3. Проверьте, что вы перенаправлены на страницу Monobank
4. Проверьте логи в Netlify Dashboard

#### 5.3. Проверка базы данных

```sql
-- Проверьте, что таблицы созданы
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('payments', 'subscriptions');

-- Проверьте RLS политики
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('payments', 'subscriptions');
```

### 6. Тестирование полного флоу

1. **Создание заявки:**
   - Перейдите на https://stefa-books.com.ua/subscribe
   - Заполните форму
   - Выберите "Онлайн оплата"
   - Отправьте форму

2. **Оплата:**
   - Вы должны быть перенаправлены на страницу Monobank
   - Выполните тестовую оплату

3. **Активация подписки:**
   - После успешной оплаты вы будете перенаправлены на `/payment/success`
   - Webhook должен активировать подписку
   - Проверьте в базе данных, что подписка создана

### 7. Мониторинг

#### 7.1. Логи Netlify

```bash
# Просмотр логов в реальном времени
netlify logs --follow

# Просмотр логов конкретного сайта
netlify logs --site-id=YOUR_SITE_ID
```

#### 7.2. Логи Supabase

1. Перейдите в Supabase Dashboard
2. Выберите проект
3. Перейдите в Logs → API
4. Фильтруйте по таблицам `payments` и `subscriptions`

#### 7.3. Мониторинг Monobank

1. Войдите в личный кабинет Monobank
2. Перейдите в раздел "API" → "Webhook"
3. Проверьте статус доставки webhook'ов

### 8. Troubleshooting

#### 8.1. Частые проблемы

**"Monobank token not configured"**
```bash
# Проверьте переменные окружения
netlify env:list
```

**"Webhook not received"**
- Проверьте URL webhook в Monobank
- Убедитесь, что сервер доступен извне
- Проверьте логи Netlify

**"Database error"**
- Проверьте подключение к Supabase
- Убедитесь, что миграции выполнены
- Проверьте RLS политики

#### 8.2. Откат изменений

Если что-то пошло не так:

```bash
# Откат к предыдущей версии
git revert HEAD
git push origin main

# Или откат к конкретному коммиту
git reset --hard <commit-hash>
git push --force origin main
```

### 9. Безопасность

#### 9.1. Проверка безопасности

- [ ] RLS политики настроены правильно
- [ ] Webhook валидация включена (в продакшене)
- [ ] Токены не логируются
- [ ] Ошибки не раскрывают внутреннюю информацию

#### 9.2. Резервное копирование

```bash
# Создайте бэкап базы данных перед деплоем
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 10. Обновления

При обновлении системы:

1. **Тестирование:**
   - Протестируйте на staging окружении
   - Проверьте все API endpoints
   - Убедитесь, что webhook'и работают

2. **Деплой:**
   - Создайте feature branch
   - Протестируйте изменения
   - Слейте в main
   - Мониторьте после деплоя

3. **Уведомления:**
   - Уведомите команду о breaking changes
   - Обновите документацию
   - Сообщите о новых возможностях

## Контакты

- **Netlify Support**: https://docs.netlify.com/support
- **Supabase Support**: https://supabase.com/support
- **Monobank API**: https://api.monobank.ua
