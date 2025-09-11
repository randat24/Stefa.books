# API Documentation - Stefa.Books

## Обзор

Этот документ описывает все API endpoints в проекте Stefa.Books, их структуру запросов/ответов и примеры использования.

## Содержание

1. [Публичные API](#публичные-api)
   - [Книги](#книги)
   - [Подписка](#подписка)
   - [Аренда книг](#аренда-книг)
2. [Админские API](#админские-api)
   - [Управление книгами](#управление-книгами)
   - [Пользователи](#пользователи)
   - [Дашборд](#дашборд)
3. [Статус кодов](#статус-кодов)
4. [Обработка ошибок](#обработка-ошибок)

---

## Публичные API

### Книги

#### GET /api/books
Получение списка книг с фильтрацией и пагинацией.

**Query параметры:**
- `q` или `search` (string) - поисковый запрос
- `category` (string) - фильтр по категории
- `author` (string) - фильтр по автору
- `available` или `available_only` (boolean) - только доступные книги
- `limit` (number) - количество записей (default: 20)
- `offset` (number) - смещение для пагинации (default: 0)
- `sort` (string) - поле для сортировки (default: 'title')
- `order` (string) - порядок сортировки 'asc' или 'desc' (default: 'asc')

**Пример запроса:**
```bash
GET /api/books?q=казки&category=дошкільний&limit=10
```

**Пример ответа:**
```json
{
  "books": [
    {
      "id": "3d00fb5c-b573-4c12-bf4f-b5cd190350ee",
      "title": "Баба-Яга",
      "author": "Ен Лейсен",
      "category": "Казки, дошкільний вік",
      "description": "Класична казка для дітей",
      "pages": 32,
      "cover_url": "https://res.cloudinary.com/...",
      "available": true,
      "is_active": true,
      "created_at": "2025-09-10T12:40:04.314426+00:00"
    }
  ],
  "total": 105,
  "hasMore": true
}
```

#### GET /api/books/[id]
Получение информации о конкретной книге.

**Пример запроса:**
```bash
GET /api/books/3d00fb5c-b573-4c12-bf4f-b5cd190350ee
```

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "id": "3d00fb5c-b573-4c12-bf4f-b5cd190350ee",
    "title": "Баба-Яга",
    "author": "Ен Лейсен",
    "category": "Казки, дошкільний вік",
    "description": null,
    "pages": 32,
    "cover_url": "https://res.cloudinary.com/...",
    "available": true,
    "is_active": true
  }
}
```

### Подписка

#### POST /api/subscribe
Создание заявки на подписку.

**Request body:**
```json
{
  "name": "Іван Петренко",
  "email": "ivan@example.com",
  "phone": "+380501234567",
  "social": "@ivan_petrenko",  // опционально
  "plan": "mini",              // "mini" или "maxi"
  "paymentMethod": "Онлайн оплата", // или "Переказ на карту"
  "message": "Коментар",       // опционально
  "screenshot": "url",         // опционально, для переказа на карту
  "privacyConsent": true
}
```

**Пример ответа (успех):**
```json
{
  "success": true,
  "subscriptionId": "d4e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9",
  "message": "Заявка успішно відправлена"
}
```

**Пример ответа (онлайн оплата):**
```json
{
  "success": true,
  "subscriptionId": "d4e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9",
  "paymentUrl": "https://pay.monobank.ua/...",
  "message": "Перенаправлення на сторінку оплати"
}
```

### Аренда книг

#### POST /api/rent
Создание заявки на аренду книги.

**Request body:**
```json
{
  "book_id": "3d00fb5c-b573-4c12-bf4f-b5cd190350ee",
  "plan": "basic",              // "basic", "extended", "premium"
  "delivery_method": "pickup",  // "pickup", "kyiv", "ukraine"
  "customer_info": {
    "first_name": "Іван",
    "last_name": "Петренко",
    "email": "ivan@example.com",
    "phone": "+380501234567",
    "address": "вул. Хрещатик, 1",
    "city": "Київ",
    "postal_code": "01001",
    "notes": "Додаткова інформація"
  },
  "payment_method": "card",     // "card", "cash", "bank"
  "total_price": 100
}
```

**Пример ответа:**
```json
{
  "success": true,
  "rental_id": "54ac2728-0343-431f-9c56-20bbf6cdfa1b",
  "message": "Заявка на оренду успішно створена"
}
```

#### GET /api/rent?rental_id=xxx
Получение информации об аренде.

**Пример ответа:**
```json
{
  "success": true,
  "rental": {
    "id": "54ac2728-0343-431f-9c56-20bbf6cdfa1b",
    "book_id": "3d00fb5c-b573-4c12-bf4f-b5cd190350ee",
    "rental_date": "2025-09-11T13:08:01.46+00:00",
    "return_date": "2025-09-25T13:08:01.46+00:00",
    "status": "active",
    "customer_name": "Іван Петренко",
    "customer_email": "ivan@example.com",
    "customer_phone": "+380501234567",
    "rental_plan": "basic",
    "delivery_method": "pickup",
    "payment_method": "card",
    "total_price": 100,
    "book": {
      "id": "3d00fb5c-b573-4c12-bf4f-b5cd190350ee",
      "title": "Баба-Яга",
      "author": "Ен Лейсен",
      "cover_url": "https://res.cloudinary.com/..."
    }
  }
}
```

---

## Админские API

### Управление книгами

#### GET /api/admin/books
Получение списка всех книг для админ панели.

**Query параметры:**
- `search` (string) - поиск по названию, автору, категории
- `category` (string) - фильтр по категории
- `available` (boolean) - фильтр по доступности
- `limit` (number) - количество записей (default: 1000)
- `offset` (number) - смещение
- `sortBy` (string) - поле сортировки (default: 'created_at')
- `sortOrder` (string) - порядок 'asc' или 'desc' (default: 'desc')

**Пример ответа:**
```json
{
  "success": true,
  "data": [...],
  "count": 105,
  "total": 105,
  "hasMore": false
}
```

#### POST /api/admin/books
Создание новой книги.

**Request body:**
```json
{
  "title": "Нова книга",
  "author": "Автор книги",
  "category": "Казки",
  "description": "Опис книги",
  "pages": 100,
  "cover_url": "https://example.com/cover.jpg",
  "isbn": "978-3-16-148410-0",
  "publisher": "Видавництво",
  "publication_year": 2024,
  "available": true,
  "price_uah": 250
}
```

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "id": "новый-uuid",
    "title": "Нова книга",
    ...
  },
  "message": "Книга успешно создана"
}
```

### Пользователи

#### GET /api/admin/users
Получение списка пользователей.

**Пример ответа:**
```json
{
  "success": true,
  "users": [
    {
      "id": "user-uuid",
      "email": "admin@stefa-books.com.ua",
      "is_admin": true,
      "created_at": "2025-09-01T00:00:00Z",
      "last_sign_in_at": "2025-09-11T12:00:00Z"
    }
  ]
}
```

### Дашборд

#### GET /api/admin/dashboard
Получение статистики для админ панели.

**Пример ответа:**
```json
{
  "success": true,
  "stats": {
    "totalBooks": 105,
    "availableBooks": 98,
    "totalUsers": 15,
    "activeRentals": 7,
    "pendingReturns": 2,
    "monthlyRevenue": 15000,
    "recentActivity": [...]
  }
}
```

---

## Статус кодов

- `200 OK` - Успешный запрос
- `201 Created` - Ресурс успешно создан
- `400 Bad Request` - Неверные данные запроса
- `401 Unauthorized` - Требуется авторизация
- `403 Forbidden` - Доступ запрещен
- `404 Not Found` - Ресурс не найден
- `500 Internal Server Error` - Внутренняя ошибка сервера

## Обработка ошибок

Все ошибки возвращаются в формате:

```json
{
  "error": "Описание ошибки",
  "details": "Дополнительная информация" // опционально
}
```

Для ошибок валидации (400):
```json
{
  "error": "Невірні дані",
  "details": [
    {
      "field": "email",
      "message": "Невірний формат email"
    }
  ]
}
```

## Аутентификация

Для админских API требуется авторизация через Supabase Auth. Токен должен передаваться в заголовке:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Либо использовать service role key для серверных запросов (только в production).

---

*Последнее обновление: 11 сентября 2025*
