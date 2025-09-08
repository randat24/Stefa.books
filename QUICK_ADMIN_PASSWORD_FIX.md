# 🚀 Быстрое исправление пароля админ пользователя

## 🎯 Проблема
В логах видно: `Invalid login credentials` - пароль админ пользователя неправильный.

## ⚡ Быстрое решение

### 1. Откройте Supabase Dashboard
- Перейдите на [supabase.com/dashboard](https://supabase.com/dashboard)
- Выберите ваш проект

### 2. Найдите админ пользователя
- `Authentication` → `Users`
- Найдите `admin@stefa-books.com.ua`

### 3. Смените пароль
- Нажмите на пользователя
- `Update user`
- Новый пароль: `admin123456`
- `Update`

### 4. Установите роль администратора
- `SQL Editor`
- Выполните:
```sql
UPDATE users 
SET role = 'admin', updated_at = NOW()
WHERE email = 'admin@stefa-books.com.ua';
```

### 5. Протестируйте вход
- Перейдите на `http://localhost:3000/admin/login`
- Email: `admin@stefa-books.com.ua`
- Password: `admin123456`

## 🔄 Если пользователь не существует

### Создайте нового:
1. `Authentication` → `Users` → `Add user`
2. Email: `admin@stefa-books.com.ua`
3. Password: `admin123456`
4. Email confirm: ✅
5. `Create user`

### Установите роль:
```sql
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

## ✅ Готово!
После этих действий админ панель должна работать.
