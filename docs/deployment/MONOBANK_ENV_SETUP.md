# Налаштування змінних середовища для Monobank

## Додайте в .env.local

```bash
# Monobank Configuration (Production)
MONOBANK_TOKEN=your_production_monobank_token_here
```

## Для Netlify (Production)

1. Перейдіть в налаштування проекту на Netlify
2. Відкрийте розділ "Environment Variables"
3. Додайте нову змінну:
   - **Key:** `MONOBANK_TOKEN`
   - **Value:** `your_production_monobank_token_here`
   - **Environment:** Production, Deploy Previews, Branch Deploys

## Перевірка налаштування

Після додавання змінної:

1. Перезапустіть сервер розробки: `pnpm dev`
2. Перейдіть в адмін панель: `/admin`
3. Відкрийте таб "Monobank"
4. Натисніть "Курси валют" для перевірки API

## Оновлені номери карток

- **Старий номер:** 5375 4114 0000 0000
- **Новий номер:** 5408 8100 4185 0776

Номер оновлено в наступних компонентах:
- `src/components/subscribe/SubscribeFormHome.tsx`
- `src/components/RentalForm.tsx`

## Функції Monobank API

### Доступні без токена:
- Отримання курсів валют
- Конвертація валют

### Доступні з токеном:
- Інформація про клієнта
- Виписка по рахунку
- Перевірка надходжень
- Налаштування webhook

## Моніторинг

Використовуйте компонент `MonobankTest` в адмін панелі для перевірки статусу інтеграції та функцій API.
