# 🔑 Налаштування облікових даних Supabase для Stefa.Books

Цей документ описує процес налаштування змінних середовища для підключення до Supabase.

## ✅ Встановлені облікові дані

Ваші облікові дані Supabase були успішно налаштовані і збережені в файлі `.env.local`. Вони включають:

- URL проєкту Supabase
- Анонімний ключ API (для публічного доступу)
- Ключ Service Role (для адміністративного доступу)
- JWT Secret (для валідації токенів)
- Налаштування бази даних PostgreSQL

## 🛠️ Як працюють змінні середовища

1. Файл `.env.local` містить всі необхідні змінні середовища
2. Next.js автоматично завантажує ці змінні під час запуску
3. Клієнт Supabase використовує `NEXT_PUBLIC_SUPABASE_URL` та `NEXT_PUBLIC_SUPABASE_ANON_KEY` для з'єднання

## 🔐 Безпека

- **ВАЖЛИВО**: файл `.env.local` доданий до `.gitignore` і НЕ повинен публікуватись у репозиторії
- Префікс `NEXT_PUBLIC_` означає, що змінна доступна на клієнті (у браузері)
- Змінні без префіксу `NEXT_PUBLIC_` доступні тільки на сервері

## 📋 Змінні середовища

```bash
# Налаштування Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Налаштування бази даних
POSTGRES_URL=your_postgres_connection_string
POSTGRES_PRISMA_URL=your_prisma_connection_string
POSTGRES_URL_NON_POOLING=your_non_pooling_connection_string
POSTGRES_USER=postgres
POSTGRES_HOST=your_postgres_host
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=postgres
```

## ⚙️ Як оновити облікові дані

Якщо вам потрібно оновити облікові дані Supabase:

1. Відредагуйте файл `.env.local` вручну
2. АБО запустіть скрипт `setup-env-local.sh` з оновленими даними

```bash
# Запуск скрипту для налаштування
./setup-env-local.sh
```

## 🧪 Перевірка підключення

Підключення до Supabase було перевірено і працює коректно. Якщо ви хочете перевірити його знову:

1. Запустіть додаток командою `pnpm dev`
2. Відкрийте [http://localhost:3000](http://localhost:3000) у браузері
3. Функціонал, що використовує Supabase, повинен працювати

## 📚 Додаткові ресурси

- [Документація Supabase](https://supabase.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [ENV_SETUP.md](./ENV_SETUP.md) - детальний опис усіх змінних середовища проєкту

---

**Примітка:** Якщо у вас виникнуть проблеми з підключенням до Supabase, перевірте правильність облікових даних у файлі `.env.local`.
