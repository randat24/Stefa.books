# 🔐 Смена пароля админ пользователя

## 🚨 Проблема
В логах видно ошибку `Invalid login credentials` - это означает, что админ пользователь существует, но пароль неправильный.

## ✅ Решения

### Способ 1: Через Supabase Dashboard (Рекомендуется)

1. **Откройте Supabase Dashboard**
   - Перейдите на [supabase.com/dashboard](https://supabase.com/dashboard)
   - Выберите ваш проект

2. **Найдите админ пользователя**
   - Перейдите в `Authentication` → `Users`
   - Найдите пользователя с email `admin@stefa-books.com.ua`

3. **Смените пароль**
   - Нажмите на пользователя
   - Нажмите `Update user`
   - Введите новый пароль
   - Нажмите `Update`

4. **Проверьте роль**
   - Перейдите в `SQL Editor`
   - Выполните:
   ```sql
   UPDATE users 
   SET role = 'admin', updated_at = NOW()
   WHERE email = 'admin@stefa-books.com.ua';
   ```

### Способ 2: Через скрипт (если настроены переменные окружения)

```bash
node reset-admin-password.mjs
```

### Способ 3: Создание нового админ пользователя

Если админ пользователь не существует:

1. **Через Supabase Dashboard:**
   - `Authentication` → `Users` → `Add user`
   - Email: `admin@stefa-books.com.ua`
   - Password: `admin123456`
   - Email confirm: ✅
   - Нажмите `Create user`

2. **Установите роль администратора:**
   ```sql
   UPDATE users 
   SET role = 'admin', updated_at = NOW()
   WHERE email = 'admin@stefa-books.com.ua';
   ```

## 🧪 Тестирование

После смены пароля:

1. **Перейдите на** `http://localhost:3000/admin/login`

2. **Введите данные:**
   - Email: `admin@stefa-books.com.ua`
   - Password: `admin123456` (или ваш новый пароль)

3. **Нажмите "Увійти"**

4. **Должно произойти** перенаправление на админ панель

## 🔍 Диагностика

### Проверка существования пользователя:
```sql
SELECT id, email, role, status, created_at 
FROM users 
WHERE email = 'admin@stefa-books.com.ua';
```

### Проверка в auth.users:
```sql
SELECT id, email, email_confirmed_at, created_at
FROM auth.users 
WHERE email = 'admin@stefa-books.com.ua';
```

### Проверка прав доступа:
```sql
SELECT 
  u.email,
  u.role,
  u.status,
  au.email_confirmed_at
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = 'admin@stefa-books.com.ua';
```

## 🛠️ Альтернативные пароли для тестирования

- `admin123456` - простой для тестирования
- `Admin123!` - с символами
- `stefa-books-2024` - связанный с проектом
- `StefaBooks2024!` - сложный пароль

## 🔒 Безопасность

- Используйте надежные пароли в продакшене
- Регулярно меняйте пароли
- Не используйте простые пароли в продакшене
- Рассмотрите использование 2FA для админ панели

## 📝 Логи для отладки

Следите за логами в терминале:
```
[2025-09-08T06:01:27.175Z] INFO [Auth] User login attempt { email: 'admin@stefa-books.com.ua' }
[2025-09-08T06:01:27.714Z] ERROR [Auth] Login failed { error: 'Invalid login credentials' }
```

Если видите `Invalid login credentials` - проблема с паролем.
Если видите `User not found` - пользователь не существует.
