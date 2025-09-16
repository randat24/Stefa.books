# 🚀 Быстрая справка по админ панели

## 🔐 **Данные для входа**
- **URL:** `http://localhost:3001/admin/login`
- **Email:** `admin@stefabooks.com.ua`
- **Password:** `admin123456`

## 🛠️ **Быстрые исправления**

### **Изменить пароль админа:**
1. Supabase Dashboard → Authentication → Users
2. Найти `admin@stefabooks.com.ua`
3. Reset Password → ввести новый пароль

### **Создать нового админа:**
```bash
# Запустить скрипт
node create-new-admin.mjs
```

### **Проверить API:**
```bash
# Логин
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@stefabooks.com.ua","password":"admin123456"}'

# API пользователей (нужен токен)
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/admin/users
```

## 🚨 **Частые проблемы**

| Проблема | Решение |
|----------|---------|
| `users.filter is not a function` | Проверить, что `users` - массив |
| `No authentication token` | Проверить localStorage токен |
| `Admin access required` | Проверить email и роль пользователя |
| `Could not find table 'payments'` | Убрать запросы к таблице payments |

## 📁 **Важные файлы**
- `src/app/api/admin/users/route.ts` - API пользователей
- `src/app/api/admin/dashboard/route.ts` - API дашборда
- `src/contexts/AuthContext.tsx` - Аутентификация
- `src/app/admin/page.tsx` - Главная админки

## 🔍 **Проверка работы**
1. Открыть `http://localhost:3001/admin/login`
2. Войти с данными выше
3. Проверить загрузку данных
4. Проверить логи в терминале

---
**Полная документация:** `ADMIN_PANEL_COMPLETE_DOCUMENTATION.md`
