# 🔐 Настройка администратора randat24@gmail.com

**Цель**: Настроить единственного администратора `randat24@gmail.com` для доступа к админ панели

## ✅ **Что у нас есть:**

- ✅ Пользователь `randat24@gmail.com` существует в `auth.users`
- ✅ Пользователь `randat24@gmail.com` существует в `public.users`
- ❌ Нужно сбросить пароль и обновить роль

## 🎯 **Пошаговая настройка:**

### **Шаг 1: Сбросить пароль в Supabase Auth**

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите проект **stefa-books**
3. Перейдите в **Authentication** → **Users**
4. Найдите пользователя `randat24@gmail.com`
5. Нажмите на пользователя
6. В разделе **"Reset password"** нажмите **"Send password recovery"**
7. Проверьте почту `randat24@gmail.com` и перейдите по ссылке
8. Установите новый пароль: `xqcBT*A*N!.88p.`

### **Шаг 2: Обновить роль в public.users**

1. В Supabase Dashboard перейдите в **SQL Editor**
2. Выполните SQL запрос:

```sql
-- Обновляем роль пользователя randat24@gmail.com на admin
UPDATE public.users 
SET 
    role = 'admin',
    name = 'Розробник',
    status = 'active',
    subscription_type = 'premium',
    updated_at = NOW()
WHERE email = 'randat24@gmail.com';

-- Проверяем результат
SELECT id, email, name, role, status, subscription_type 
FROM public.users 
WHERE email = 'randat24@gmail.com';
```

### **Шаг 3: Войти в админ панель**

1. Перейдите на: [https://stefa-books.com.ua/admin/login](https://stefa-books.com.ua/admin/login)
2. Введите данные:
   - **Email**: `randat24@gmail.com`
   - **Password**: `xqcBT*A*N!.88p.`
3. Нажмите **"Войти"**

## 🔄 **Альтернативный способ (если сброс пароля не работает):**

### **Использовать Magic Link:**

1. В Supabase Dashboard → Authentication → Users
2. Найдите пользователя `randat24@gmail.com`
3. Нажмите **"Send magic link"**
4. Проверьте почту и перейдите по ссылке
5. Вы автоматически войдете в систему

## ✅ **Проверка результата:**

После успешного входа вы должны увидеть:
- ✅ Админ панель с данными
- ✅ Список книг (105 книг)
- ✅ Список пользователей (3 пользователя)
- ✅ Статистику системы

## 🎯 **Финальные данные для входа:**

- **Email**: `randat24@gmail.com`
- **Password**: `xqcBT*A*N!.88p.`
- **Роль**: `admin`
- **Статус**: `active`
- **Подписка**: `premium`

---

**Время настройки**: 2-3 минуты  
**Сложность**: Простая  
**Результат**: Полный доступ к админ панели
