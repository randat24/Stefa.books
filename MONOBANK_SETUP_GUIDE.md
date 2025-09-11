# Настройка интеграции с Monobank

## Обзор

Интеграция с Monobank API позволяет:
- Получать актуальные курсы валют
- Проверять поступления платежей на карту
- Конвертировать валюты по курсу Monobank
- Получать информацию о клиенте (при наличии токена)

## Настройка переменных окружения

Добавьте в ваш `.env.local` файл:

```bash
# Monobank Configuration
MONOBANK_TOKEN=uSjulrJT5jqGnzy8lSQoasq04GRtKMo0myvxJk5D0EKY
```

## Получение токена Monobank

1. Перейдите на https://api.monobank.ua/
2. Войдите в свой аккаунт Monobank
3. Создайте новый токен для персонального использования
4. Скопируйте токен и добавьте в переменные окружения

## Обновленные номера карт

Номер карты для переводов обновлен на: **5408 8100 4185 0776**

## API Endpoints

### GET /api/monobank

Параметры:
- `action=currency-rates` - получить курсы валют
- `action=client-info` - получить информацию о клиенте (требует токен)
- `action=usd-rate` - получить курс USD к UAH

### POST /api/monobank

Параметры:
- `action=check-payment` - проверить поступление платежа
- `action=set-webhook` - установить webhook URL
- `action=convert-uah-to-usd` - конвертировать UAH в USD

## Использование в компонентах

### MonobankPaymentInfo

Компонент для отображения информации о платеже через Monobank:

```tsx
import MonobankPaymentInfo from '@/components/payment/MonobankPaymentInfo';

<MonobankPaymentInfo
  amount={299}
  currency="UAH"
  description="Оплата за підписку"
  orderId="order_123"
/>
```

### Проверка платежа

```tsx
import { paymentService } from '@/lib/payments/payment-service';

const checkPayment = async () => {
  const result = await paymentService.checkMonobankPayment(
    '5408810041850776', // номер карты
    299, // сумма
    'Оплата за підписку', // описание
    24 // окно времени в часах
  );
  
  if (result.received) {
    console.log('Платеж получен!', result.transaction);
  }
};
```

## Курсы валют

### Получение курса USD к UAH

```tsx
const rate = await paymentService.getUsdToUahRate();
console.log('1 USD =', rate, 'UAH');
```

### Конвертация USD в UAH

```tsx
const uahAmount = await paymentService.convertUsdToUah(100);
console.log('100 USD =', uahAmount, 'UAH');
```

## Безопасность

- Токен Monobank хранится только в переменных окружения
- API endpoints защищены от несанкционированного доступа
- Все запросы логируются для отладки

## Ограничения API

- Курсы валют обновляются не чаще 1 раза в 5 минут
- Информация о клиенте - не чаще 1 раза в 60 секунд
- Выписка - не чаще 1 раза в 60 секунд
- Максимальный период выписки - 31 день + 1 час

## Тестирование

Для тестирования интеграции:

1. Убедитесь, что токен добавлен в `.env.local`
2. Перезапустите сервер разработки
3. Проверьте работу API endpoints
4. Протестируйте компоненты с платежной информацией

## Логирование

Все операции с Monobank API логируются через `logger`:
- Успешные запросы
- Ошибки API
- Результаты проверки платежей
- Конвертация валют

## Поддержка

При возникновении проблем:
1. Проверьте правильность токена
2. Убедитесь в доступности API Monobank
3. Проверьте логи в консоли
4. Убедитесь, что номер карты корректный
