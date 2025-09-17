# Настройка переменных окружения для Monobank

## Добавьте в .env.local

```bash
# Monobank Configuration
MONOBANK_TOKEN=uSjulrJT5jqGnzy8lSQoasq04GRtKMo0myvxJk5D0EKY
```

## Для Vercel (Production)

1. Перейдите в настройки проекта на Vercel
2. Откройте раздел "Environment Variables"
3. Добавьте новую переменную:
   - **Name:** `MONOBANK_TOKEN`
   - **Value:** `uSjulrJT5jqGnzy8lSQoasq04GRtKMo0myvxJk5D0EKY`
   - **Environment:** Production, Preview, Development

## Проверка настройки

После добавления переменной:

1. Перезапустите сервер разработки: `pnpm dev`
2. Перейдите в админ панель: `/admin`
3. Откройте таб "Monobank"
4. Нажмите "Курсы валют" для проверки API

## Обновленные номера карт

- **Старый номер:** 5375 4114 0000 0000
- **Новый номер:** 5408 8100 4185 0776

Номер обновлен в следующих компонентах:
- `src/components/subscribe/SubscribeFormHome.tsx`
- `src/components/RentalForm.tsx`

## Функции Monobank API

### Доступные без токена:
- Получение курсов валют
- Конвертация валют

### Доступные с токеном:
- Информация о клиенте
- Выписка по счету
- Проверка поступлений
- Настройка webhook

## Тестирование

Используйте компонент `MonobankTest` в админ панели для проверки всех функций API.
