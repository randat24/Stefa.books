# ✅ Решение проблемы с админ пользователем

## 🎉 Проблема решена!

Админ пользователь успешно создан с email `admin@stefabooks.com.ua` (без дефиса).

## 📋 Данные для входа

- **URL**: `http://localhost:3000/admin/login`
- **Email**: `admin@stefabooks.com.ua`
- **Password**: `admin123456`

## 🔧 Что было исправлено

### 1. Создан новый админ пользователь
- Email: `admin@stefabooks.com.ua` (без дефиса)
- Пароль: `admin123456`
- Роль: `admin`
- Статус: `active`

### 2. Обновлен код для поддержки нового email
- `src/lib/auth/roles.ts` - добавлена поддержка нового email
- `src/app/admin/login/page.tsx` - обновлен placeholder

### 3. Пользователь готов к использованию
- Создан в `auth.users`
- Создан в таблице `users`
- Протестирован вход

## 🧪 Тестирование

1. Перейдите на `http://localhost:3000/admin/login`
2. Введите:
   - Email: `admin@stefabooks.com.ua`
   - Password: `admin123456`
3. Нажмите "Увійти"
4. Должно произойти перенаправление на админ панель

## 🔍 Почему не работал старый email?

Проблема была в том, что:
1. Пользователь `admin@stefa-books.com.ua` был в "зависшем" состоянии
2. Supabase не мог его удалить через API
3. При попытке создать нового с тем же email получалась ошибка "Database error creating new user"

## 🛠️ Альтернативные решения

Если нужно использовать именно `admin@stefa-books.com.ua`:

### Через Supabase Dashboard:
1. `Authentication` → `Users`
2. Найдите пользователя с проблемным email
3. Удалите его вручную
4. Создайте нового с тем же email

### Через SQL (если есть доступ):
```sql
-- Удаляем из auth.users (осторожно!)
DELETE FROM auth.users WHERE email = 'admin@stefa-books.com.ua';

-- Удаляем из users
DELETE FROM users WHERE email = 'admin@stefa-books.com.ua';
```

## 🔒 Безопасность

- Используйте надежный пароль в продакшене
- Рассмотрите использование 2FA
- Регулярно меняйте пароли
- Мониторьте логи входа

## 📝 Логи для отладки

Следите за логами в терминале:
```
[INFO] User login attempt { email: 'admin@stefabooks.com.ua' }
[INFO] User logged in successfully { userId: '...' }
```

## ✅ Готово!

Админ панель теперь работает с новым пользователем!
