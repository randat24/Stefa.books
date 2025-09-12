# Інтеграція з Monobank Personal API

## Поточна конфігурація

Ваш проект налаштований для роботи з **особистим API Monobank** використовуючи токен:
```env
MONOBANK_TOKEN=uSjulrJT5jqGnzy8lSQoasq04GRtKMo0myvxJk5D0EKY
```

## Що працює зараз

### ✅ Доступні функції (особистий API)

1. **Інформація про клієнта**
   - Ім'я власника рахунків
   - ID клієнта
   - Налаштований webhook URL
   - Дозволи доступу

2. **Рахунки та баланси**
   - Список всіх ваших карток
   - Поточний баланс
   - Кредитний ліміт
   - Тип картки (чорна, біла, платинова)

3. **Виписки по рахунках**
   - Операції за будь-який період (до 31 дня)
   - Деталі транзакцій
   - Категорії витрат (MCC коди)
   - Кешбек інформація

4. **Курси валют**
   - Поточні курси Monobank
   - Оновлюються кожні 5 хвилин

### 🔄 Демо-режим (платежі)

Оскільки у вас немає комерційного API, платежі працюють у демо-режимі:

- ✅ Створення "платежу" повертає демо-дані
- ✅ UI показує кнопку "Імітувати оплату (демо)"
- ✅ Через 3 секунди платіж стає "успішним"
- ✅ Дані зберігаються в базі як демо-транзакції
- ❌ Реальні гроші не списуються

## API Endpoints

### GET /api/monobank/client-info
Отримання інформації про вашого клієнта Monobank.

**Приклад відповіді:**
```json
{
  "success": true,
  "data": {
    "clientId": "3MSaMMtczs",
    "name": "Ваше Ім'я",
    "accounts": [
      {
        "id": "kKGVoZuHWzqVoZuH",
        "sendId": "5375411234567890",
        "balance": 184000,
        "creditLimit": 200000,
        "type": "black",
        "currencyCode": 980
      }
    ],
    "permissions": ["p", "s"]
  }
}
```

### GET /api/monobank/statement
Отримання виписки по рахунку.

**Параметри:**
- `account` - ID рахунку з client-info
- `from` - Unix timestamp початкової дати
- `to` - Unix timestamp кінцевої дати (опціонально)

**Приклад:**
```
GET /api/monobank/statement?account=kKGVoZuHWzqVoZuH&from=1672531200
```

## UI Компоненти

### MonobankInfo
Компонент для відображення інформації про ваші Monobank рахунки:

```tsx
import MonobankInfo from '@/components/payment/MonobankInfo';

function DashboardPage() {
  return (
    <div>
      <h1>Monobank Integration</h1>
      <MonobankInfo />
    </div>
  );
}
```

**Що показує:**
- 🟢 Статус особистого API (активний)
- 🟡 Статус комерційного API (не налаштовано)
- 👤 Ваше ім'я та ID клієнта
- 💳 Список рахунків з балансами
- 📊 Останні операції
- ⚠️ Пояснення демо-режиму для платежів

### MonobankPayment (демо-режим)
Компонент для "оплати" в демо-режимі:

```tsx
import MonobankPayment from '@/components/payment/MonobankPayment';

<MonobankPayment
  amount={500}
  description="Підписка Maxi"
  currency="UAH"
  customerEmail="user@example.com"
  customerName="Іван Петров"
  onPaymentSuccess={(data) => {
    console.log('Демо-платіж успішний:', data);
    // Перенаправити на сторінку успіху
  }}
  onPaymentError={(error) => {
    console.error('Помилка:', error);
  }}
/>
```

**Як працює:**
1. Показує форму з сумою та описом
2. Кнопка "Імітувати оплату (демо)" замість реального платежу
3. Після кліку - 3 секунди "обробка" і success
4. Викликається `onPaymentSuccess` з демо-даними

## Інтеграція в процес замовлення

Платежі вже інтегровані в компонент `OrderConfirmationForm`:

```tsx
// src/components/OrderConfirmationForm.tsx
// Автоматично перемикається на MonobankPayment після заповнення форми
// Показує демо-режим з поясненням
```

## Переключення на справжні платежі

### Крок 1: Зареєструватися в Monobank Business
1. Відвідайте [business.monobank.ua](https://business.monobank.ua)
2. Зареєструйте бізнес-акаунт
3. Пройдіть верифікацію

### Крок 2: Підключити еквайринг
1. В особистому кабінеті бізнес-акаунту
2. Подайте заявку на підключення еквайрингу
3. Дочекайтеся схвалення (зазвичай 1-3 дні)

### Крок 3: Отримати API ключі
В особистому кабінеті отримайте:
- `MONOBANK_PRIVATE_KEY` - для створення платежів
- `MONOBANK_PUBLIC_KEY` - для валідації webhook'ів  
- `MONOBANK_MERCHANT_ID` - ваш merchant ID

### Крок 4: Оновити змінні середовища
Додайте до `.env.local`:

```env
# Залишити особистий токен
MONOBANK_TOKEN=uSjulrJT5jqGnzy8lSQoasq04GRtKMo0myvxJk5D0EKY

# Додати комерційні ключі
MONOBANK_PRIVATE_KEY=your_merchant_private_key
MONOBANK_PUBLIC_KEY=your_merchant_public_key
MONOBANK_MERCHANT_ID=your_merchant_id
MONOBANK_API_URL=https://api.monobank.ua/api/merchant
```

### Крок 5: Налаштувати webhook
URL для webhook'ів: `https://stefa-books.com.ua/api/payments/monobank/webhook`

### Крок 6: Перезапустити додаток
Після додавання змінних система автоматично переключиться на справжні платежі.

## Тестування

### Поточне тестування (демо-режим)
```bash
# Запустити додаток
pnpm run dev

# Перейти на сторінку замовлення
http://localhost:3000/books/[book-id]/order

# Заповнити форму і перейти до "оплати"
# Натиснути "Імітувати оплату (демо)"
# Через 3 секунди побачити success
```

### Тестування реального API
```bash
# Запустити тести
pnpm test src/__tests__/monobank-integration.test.ts

# Перевірити особистий API
curl -H "X-Token: $MONOBANK_TOKEN" https://api.monobank.ua/personal/client-info
```

## Моніторинг та логи

Всі операції логуються:

```typescript
import { logger } from '@/lib/logger';

// Успішний запит до особистого API
logger.info('Client info retrieved', { 
  clientId: 'xxx', 
  accountsCount: 3 
});

// Демо-платіж
logger.info('Creating demo payment', { 
  reference: 'order-123', 
  amount: 500 
});

// Помилки
logger.error('Monobank API error', { 
  error: 'Too many requests',
  endpoint: '/personal/client-info'
});
```

## Обмеження особистого API

- **Частота запитів**: не частіше 1 разу на хвилину для client-info
- **Період виписки**: максимум 31 день + 1 година
- **Тільки читання**: неможливо створювати справжні платежі
- **Особисті дані**: доступ тільки до власних рахунків

## Порівняння API

| Функція | Особистий API | Комерційний API |
|---------|---------------|------------------|
| 👤 Інформація про рахунки | ✅ | ❌ |
| 📊 Виписки та операції | ✅ | ❌ |
| 💰 Створення платежів | ❌ | ✅ |
| 🔔 Webhook'и платежів | ❌ | ✅ |
| 🔄 Повернення коштів | ❌ | ✅ |
| 📈 Аналітика продажів | ❌ | ✅ |

## Підтримка

### Документація
- [Monobank Personal API](https://api.monobank.ua/docs/index.html)
- [Monobank Acquiring API](https://api.monobank.ua/docs/acquiring.html)

### Технічна підтримка
- Email: support@monobank.ua
- Телефон: 3700 (з мобільного безкоштовно)

### Файли проекту
- Сервіс: `src/lib/services/monobank.ts`
- Типи: `src/lib/types/monobank.ts` 
- API endpoints: `src/app/api/monobank/*/route.ts`
- UI компоненти: `src/components/payment/Monobank*.tsx`
- Тести: `src/__tests__/monobank-integration.test.ts`

---

*Документація актуальна для поточної конфігурації з особистим API токеном.*