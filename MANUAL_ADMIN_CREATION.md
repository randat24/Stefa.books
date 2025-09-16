# 👤 Ручное создание админ пользователя

## 🚨 Проблема
Пользователь `admin@stefa-books.com.ua` не существует в системе. API не может создать пользователя из-за ограничений.

## ✅ Решение через Supabase Dashboard

### 1. Откройте Supabase Dashboard
- Перейдите на [supabase.com/dashboard](https://supabase.com/dashboard)
- Выберите ваш проект

### 2. Создайте пользователя
- Перейдите в `Authentication` → `Users`
- Нажмите `Add user` или `Invite user`
- Заполните форму:
  - **Email**: `admin@stefa-books.com.ua`
  - **Password**: `admin123456`
  - **Email confirm**: ✅ (поставьте галочку)
- Нажмите `Create user`

### 3. Установите роль администратора
- Перейдите в `SQL Editor`
- Выполните следующий SQL:

```sql
-- Сначала проверим, что пользователь создался
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'admin@stefa-books.com.ua';

-- Создадим запись в таблице users
INSERT INTO users (id, email, name, role, status, created_at, updated_at)
SELECT 
  id, 
  email, 
  'Admin User', 
  'admin', 
  'active', 
  NOW(), 
  NOW()
FROM auth.users 
WHERE email = 'admin@stefa-books.com.ua';
```

### 4. Проверьте создание
Выполните проверочный запрос:

```sql
SELECT 
  u.id,
  u.email,
  u.role,
  u.status,
  au.email_confirmed_at
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = 'admin@stefa-books.com.ua';
```

## 🧪 Тестирование

После создания пользователя:

1. **Перейдите на** `http://localhost:3000/admin/login`
2. **Введите данные:**
   - Email: `admin@stefa-books.com.ua`
   - Password: `admin123456`
3. **Нажмите "Увійти"**

## 🔧 Альтернативные пароли

Если `admin123456` не работает, попробуйте:
- `Admin123!`
- `stefa-books-2024`
- `StefaBooks2024!`

## 🗑️ Если нужно удалить пользователя

### Через Supabase Dashboard:
1. `Authentication` → `Users`
2. Найдите `admin@stefa-books.com.ua`
3. Нажмите на пользователя
4. Нажмите `Delete user`

### Через SQL:
```sql
-- Удаляем из таблицы users
DELETE FROM users WHERE email = 'admin@stefa-books.com.ua';

-- Удаляем из auth.users (если нужно)
-- Внимание: это может быть недоступно через SQL Editor
```

## 🔍 Диагностика проблем

### Если пользователь не может войти:

1. **Проверьте, что email подтвержден:**
```sql
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'admin@stefa-books.com.ua';
```

2. **Проверьте роль:**
```sql
SELECT email, role, status FROM users WHERE email = 'admin@stefa-books.com.ua';
```

3. **Проверьте логи в терминале** - там будут видны ошибки

### Если получаете "Invalid login credentials":
- Пароль неправильный
- Email не подтвержден
- Пользователь не существует

### Если получаете "User not found":
- Пользователь не создан в auth.users
- Нет записи в таблице users

## ✅ Готово!

После выполнения всех шагов админ панель должна работать.