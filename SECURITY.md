# 🔒 БЕЗПЕКА ПРОЕКТУ STEFA.BOOKS

## ⚠️ КРИТИЧНО - Перед розгортанням

### 1. Змінні середовища (.env файли)

**❌ НЕ РОБИТИ:**
- Не комітьте файл `.env.local` з реальними ключами
- Не використовуйте тестові/дефолтні ключі у продакшені
- Не залишайте реальні API ключі в `.env.local.example`

**✅ ПРАВИЛЬНО:**
```bash
# Використовуйте .env.local.example як шаблон
cp .env.local.examle .env.local

# Замініть всі YOUR_* значення на реальні
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
CLOUDINARY_API_SECRET="your-real-secret"
ADMIN_JWT_SECRET="generate-strong-jwt-secret"
```

### 2. Cloudinary безпека

**Налаштування Upload Preset:**
1. Увійдіть в [Cloudinary Console](https://cloudinary.com/console)
2. Settings → Upload → Add upload preset
3. Створіть preset `stefa_books_upload`:
   - **Signing Mode**: Unsigned
   - **Folder**: `stefa-books/screenshots`
   - **Max file size**: 5MB
   - **Allowed formats**: jpg,png,jpeg,webp

### 3. Supabase RLS (Row Level Security)

**✅ Налаштовано правильно:**
- Всі таблиці мають увімкнений RLS
- Публічний доступ тільки для читання каталогу книг
- Адміністративні функції захищені

**Перевірка RLS:**
```sql
-- Перевірити статус RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 4. Next.js Security Headers

**Налаштовано в `next.config.js`:**
```javascript
// Захисні заголовки
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
]
```

### 5. Адміністративний доступ

**Аутентифікація через middleware:**
- Development: відкритий доступ на localhost
- Production: JWT токен в cookie `admin_token`

**Генерація JWT секрету:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🚨 Виявлені вразливості (ВИПРАВЛЕНО)

### ✅ Хардкод URL-ів - ВИПРАВЛЕНО
- **Було**: `'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload'`
- **Стало**: `process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

### ✅ Відкриті API ключі - ЗАХИЩЕНО
- Реальні ключі переміщені з `.env.local.examle`
- Створено безпечний шаблон з плейсхолдерами

## 📋 Чеклист безпеки перед деплоєм

- [ ] Згенеровано нові JWT секрети
- [ ] Замінено всі тестові API ключі
- [ ] Налаштовано Cloudinary upload presets
- [ ] Перевірено RLS політики в Supabase
- [ ] Встановлено HTTPS домен для продакшену
- [ ] Налаштовано CORS для API endpoints
- [ ] Перевірено CSP заголовки

## 🔐 Регулярне обслуговування

### Щомісяця:
- Ротація API ключів Cloudinary
- Перевірка логів безпеки Supabase
- Оновлення залежностей з `npm audit`

### Щоквартально:
- Аудит RLS політик
- Перегляд JWT токенів
- Backup security налаштувань

## 📞 Контакти у випадку інциденту

**Адміністратор безпеки:** [Ваш контакт]
**Incident Response:** [План дій при інциденті]

---
*Останнє оновлення: 28.08.2025*
*Версія документу: 1.0*