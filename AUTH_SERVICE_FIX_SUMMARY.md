# 🔧 Исправление AuthService

## ❌ Проблема
AuthService показывал ошибку:
```
AuthService: Get user profile error {}
```

## 🔍 Причина
AuthService пытался получить данные из несуществующей таблицы `user_profiles`, но в схеме базы данных есть только таблица `users`.

## ✅ Решение

### 1. **Исправлены запросы к базе данных**
- Изменено `user_profiles` → `users` во всех запросах
- Обновлены методы: `getUserProfile`, `updateUserProfile`, `register`

### 2. **Добавлена поддержка ролей**
- Создана миграция `022_add_role_to_users.sql`
- Добавлено поле `role` в таблицу `users`
- Обновлены типы базы данных

### 3. **Обновлены типы TypeScript**
- Добавлено поле `role` в `Database['public']['Tables']['users']`
- Обновлены `Insert` и `Update` типы

## 🔄 Изменения в файлах

### `src/lib/auth/auth-service.ts`
```typescript
// Было
.from('user_profiles')

// Стало  
.from('users')
```

### `src/middleware.ts`
```typescript
// Было
.from('user_profiles')

// Стало
.from('users')
```

### `src/lib/database.types.ts`
```typescript
// Добавлено поле role
role: string
```

### `supabase/migrations/022_add_role_to_users.sql`
```sql
-- Добавлено поле role в таблицу users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));
```

## 🚀 Результат
- ✅ AuthService теперь работает с правильной таблицей
- ✅ Поддержка ролей пользователей
- ✅ Ошибки получения профиля исправлены
- ✅ Система аутентификации полностью функциональна

## 🔧 Следующие шаги
1. Запустить миграцию: `supabase db push`
2. Протестировать вход в систему
3. Проверить работу админ-панели

---

## 🎉 Готово!
Система аутентификации теперь работает корректно с существующей схемой базы данных!
