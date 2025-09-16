# 👤 Настройка администратора

## Проблема с миграцией

Ошибка `violates foreign key constraint "user_profiles_id_fkey"` возникает потому, что мы пытаемся создать запись в `user_profiles` с `id`, который не существует в таблице `auth.users`.

## ✅ Решение

### Способ 1: Через Supabase Dashboard (Рекомендуется)

1. **Откройте Supabase Dashboard**
   - Перейдите на [supabase.com/dashboard](https://supabase.com/dashboard)
   - Выберите ваш проект

2. **Создайте пользователя**
   - Перейдите в `Authentication` → `Users`
   - Нажмите `Add user` или `Invite user`
   - Введите email: `admin@stefa-books.com.ua`
   - Установите пароль (выберите надежный пароль)
   - Нажмите `Create user`

3. **Назначьте роль администратора**
   - Перейдите в `SQL Editor`
   - Выполните следующий SQL:
   ```sql
   UPDATE user_profiles 
   SET role = 'admin', updated_at = NOW()
   WHERE email = 'admin@stefa-books.com.ua';
   ```

### Способ 2: Через API (Программно)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Используйте service role key
);

// Создать пользователя
const { data: authData, error: authError } = await supabase.auth.admin.createUser({
  email: 'admin@stefa-books.com.ua',
  password: 'your-secure-password',
  email_confirm: true,
  user_metadata: {
    first_name: 'Admin',
    last_name: 'User'
  }
});

if (authError) {
  console.error('Error creating user:', authError);
} else {
  // Обновить роль в user_profiles
  const { error: profileError } = await supabase
    .from('user_profiles')
    .update({ role: 'admin' })
    .eq('id', authData.user.id);
    
  if (profileError) {
    console.error('Error updating role:', profileError);
  }
}
```

### Способ 3: Через SQL (Если есть доступ к service_role)

```sql
-- Создать пользователя в auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@stefa-books.com.ua',
  crypt('your-secure-password', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Admin", "last_name": "User"}',
  NOW(),
  NOW()
);

-- Получить ID созданного пользователя
-- Затем обновить роль в user_profiles
UPDATE user_profiles 
SET role = 'admin', updated_at = NOW()
WHERE email = 'admin@stefa-books.com.ua';
```

## 🔧 Исправленная миграция

Миграция `019_add_admin_role.sql` была исправлена и теперь:
- ✅ Не пытается создать пользователя напрямую
- ✅ Только обновляет существующих пользователей
- ✅ Предоставляет инструкции по созданию администратора

## 🚀 После создания администратора

1. **Запустите миграции**:
   ```bash
   supabase db push
   ```

2. **Проверьте доступ**:
   - Перейдите на `/admin`
   - Войдите с `admin@stefa-books.com.ua` и вашим паролем
   - Должен открыться доступ к админ-панели

## 🔒 Безопасность

- **Используйте надежный пароль** для администратора
- **Не храните пароли в коде** или конфигурационных файлах
- **Регулярно меняйте пароли** администраторов
- **Используйте двухфакторную аутентификацию** если возможно

## 🐛 Устранение неполадок

### Ошибка: "User not found"
- Убедитесь, что пользователь создан в `auth.users`
- Проверьте email на опечатки

### Ошибка: "Role not updated"
- Убедитесь, что запись существует в `user_profiles`
- Проверьте права доступа к базе данных

### Ошибка: "Cannot access admin panel"
- Проверьте, что роль установлена как `admin`
- Убедитесь, что middleware правильно настроен

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи Supabase
2. Убедитесь в правильности настроек окружения
3. Проверьте RLS политики
4. Обратитесь к документации Supabase Auth
