# 📚 Полная документация админ панели Stefa.books

## 🎯 **Обзор**

Данная документация содержит все исправления, настройки и инструкции по админ панели проекта Stefa.books.

---

## 🔐 **Аутентификация и доступ**

### **Данные для входа:**
- **URL:** `http://localhost:3001/admin/login`
- **Email:** `admin@stefabooks.com.ua`
- **Password:** `admin123456`

### **Альтернативный email (если нужен):**
- **Email:** `admin@stefa-books.com.ua`
- **Password:** `admin123456`

---

## 🛠️ **Исправленные проблемы**

### 1. **TypeScript ошибки**

#### **Проблема:** `getServerSession` не найден
```typescript
// ❌ Было:
const session = await getServerSession();

// ✅ Стало:
const authHeader = request.headers.get('authorization');
const cookieHeader = request.headers.get('cookie');
const token = authHeader?.replace('Bearer ', '') || 
  (cookieHeader?.includes('sb-access-token=') ? 
    cookieHeader.split('sb-access-token=')[1]?.split(';')[0] : null);
```

#### **Проблема:** Дублирование переменных `authError`
```typescript
// ❌ Было:
const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
const { data: authData, error: authError } = await supabase.auth.admin.createUser({

// ✅ Стало:
const { data: { user }, error: userAuthError } = await supabaseClient.auth.getUser(token);
const { data: authData, error: createAuthError } = await supabase.auth.admin.createUser({
```

#### **Проблема:** Неявные типы `any[]`
```typescript
// ❌ Было:
const payments = [] // Поки що таблиця payments не існує

// ✅ Стало:
const payments: Array<{ id: string; amount: number; created_at: string; user_id: string }> = []
```

### 2. **ESLint ошибки**

#### **Проблема:** Неиспользуемые переменные
```typescript
// ❌ Было:
} catch (e) {
  // Invalid session, remove it
  localStorage.removeItem('supabase.auth.token');
}

// ✅ Стало:
} catch {
  // Invalid session, remove it
  localStorage.removeItem('supabase.auth.token');
}
```

#### **Проблема:** Неиспользуемые импорты
```typescript
// ❌ Было:
import { NextRequest, NextResponse } from 'next/server'

// ✅ Стало:
import { NextResponse } from 'next/server'
```

### 3. **Runtime ошибки**

#### **Проблема:** `users.filter is not a function`
```typescript
// ❌ Было:
setUsers(usersData.data || [])

// ✅ Стало:
setUsers(usersData.data?.users || usersData.data || [])
```

#### **Проблема:** Ошибки с таблицей `payments`
```typescript
// ❌ Было:
const [usersRes, booksRes, rentalsRes, paymentsRes] = await Promise.all([
  supabase.from('users').select('*'),
  supabase.from('books').select('*'),
  supabase.from('rentals').select('*'),
  supabase.from('payments').select('*') // Таблица не существует!
])

// ✅ Стало:
const [usersRes, booksRes, rentalsRes] = await Promise.all([
  supabase.from('users').select('*'),
  supabase.from('books').select('*'),
  supabase.from('rentals').select('*')
])
const payments: Array<{ id: string; amount: number; created_at: string; user_id: string }> = []
```

---

## 🔧 **Настройка и конфигурация**

### **Файлы, которые были изменены:**

1. **`src/app/api/admin/users/route.ts`**
   - Исправлена аутентификация
   - Добавлена проверка ролей
   - Исправлены TypeScript ошибки

2. **`src/app/api/admin/dashboard/route.ts`**
   - Убрана таблица `payments`
   - Добавлены типы
   - Исправлены импорты

3. **`src/app/api/admin/analytics/route.ts`**
   - Убрана таблица `payments`
   - Добавлены типы

4. **`src/contexts/AuthContext.tsx`**
   - Исправлена обработка ошибок
   - Добавлено сохранение профиля в localStorage

5. **`src/app/admin/page.tsx`**
   - Исправлена загрузка данных
   - Добавлены fallback значения

---

## 🔄 **Как изменить пароль админа**

### **Способ 1: Через Supabase Dashboard**

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **Authentication** → **Users**
4. Найдите пользователя `admin@stefabooks.com.ua`
5. Нажмите на пользователя
6. В разделе **Password** нажмите **Reset Password**
7. Введите новый пароль
8. Обновите пароль в коде (если нужно)

### **Способ 2: Через API (программно)**

```javascript
// Создайте файл reset-admin-password.mjs
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function resetAdminPassword() {
  const { data, error } = await supabase.auth.admin.updateUserById(
    'aa8dc94e-999f-4e57-9ce4-2b019e0ddd45', // ID админа
    { password: 'новый_пароль' }
  )
  
  if (error) {
    console.error('Ошибка:', error)
  } else {
    console.log('Пароль обновлен:', data)
  }
}

resetAdminPassword()
```

### **Способ 3: Создать нового админа**

```javascript
// Создайте файл create-new-admin.mjs
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createNewAdmin() {
  // Создаем пользователя в auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'newadmin@stefabooks.com.ua',
    password: 'newpassword123',
    email_confirm: true
  })
  
  if (authError) {
    console.error('Ошибка создания пользователя:', authError)
    return
  }
  
  // Создаем профиль в таблице users
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email: 'newadmin@stefabooks.com.ua',
      name: 'New Admin',
      role: 'admin',
      subscription_type: 'premium',
      status: 'active'
    })
  
  if (profileError) {
    console.error('Ошибка создания профиля:', profileError)
  } else {
    console.log('Новый админ создан:', authData.user.id)
  }
}

createNewAdmin()
```

---

## 🚨 **Устранение неполадок**

### **Проблема: "No authentication token provided"**

**Причина:** API не получает токен аутентификации

**Решение:**
1. Проверьте, что пользователь залогинен
2. Проверьте localStorage: `localStorage.getItem('supabase.auth.token')`
3. Убедитесь, что токен передается в заголовках

### **Проблема: "Admin access required"**

**Причина:** Пользователь не имеет прав администратора

**Решение:**
1. Проверьте email пользователя в коде
2. Убедитесь, что пользователь имеет роль 'admin' в таблице users
3. Проверьте логику проверки ролей в API

### **Проблема: "users.filter is not a function"**

**Причина:** `users` не является массивом

**Решение:**
```typescript
// Добавьте проверку типа
const users = Array.isArray(usersData.data?.users) ? usersData.data.users : 
              Array.isArray(usersData.data) ? usersData.data : []
```

### **Проблема: "Could not find the table 'public.payments'"**

**Причина:** Обращение к несуществующей таблице

**Решение:**
```typescript
// Замените запросы к payments на пустой массив
const payments: Array<{ id: string; amount: number; created_at: string; user_id: string }> = []
```

---

## 🔍 **Проверка работоспособности**

### **1. Проверка API:**

```bash
# Проверка логина
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@stefabooks.com.ua","password":"admin123456"}'

# Проверка API пользователей (требует токен)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/admin/users

# Проверка API дашборда
curl http://localhost:3001/api/admin/dashboard
```

### **2. Проверка в браузере:**

1. Откройте `http://localhost:3001/admin/login`
2. Введите данные для входа
3. Проверьте, что админ панель загружается
4. Проверьте, что данные отображаются

### **3. Проверка логов:**

```bash
# Запустите сервер и смотрите логи
pnpm dev
```

Ищите в логах:
- `Admin access check` - проверка доступа
- `Admin API: Books fetched successfully` - загрузка книг
- `Admin API: Users fetched successfully` - загрузка пользователей

---

## 📝 **Важные файлы для резервного копирования**

1. **`src/app/api/admin/users/route.ts`** - API пользователей
2. **`src/app/api/admin/dashboard/route.ts`** - API дашборда
3. **`src/app/api/admin/analytics/route.ts`** - API аналитики
4. **`src/contexts/AuthContext.tsx`** - Контекст аутентификации
5. **`src/app/admin/page.tsx`** - Главная страница админки
6. **`src/app/admin/login/page.tsx`** - Страница входа

---

## 🚀 **Развертывание**

### **Переменные окружения (.env.local):**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Команды для развертывания:**

```bash
# Установка зависимостей
pnpm install

# Запуск в режиме разработки
pnpm dev

# Сборка для продакшена
pnpm build

# Запуск продакшен версии
pnpm start
```

---

## 📞 **Поддержка**

Если что-то не работает:

1. **Проверьте логи** в терминале
2. **Проверьте консоль браузера** на ошибки
3. **Проверьте переменные окружения**
4. **Проверьте подключение к Supabase**
5. **Проверьте права доступа в Supabase**

---

## 🎯 **Заключение**

Данная документация содержит все необходимые инструкции для:
- Исправления проблем
- Изменения паролей
- Создания новых админов
- Устранения неполадок
- Развертывания системы

**Сохраните эту документацию для будущего использования!** 📚
