# ДИАГРАММЫ СХЕМЫ БАЗЫ ДАННЫХ STEFA.BOOKS

## 📊 ER-диаграмма (Entity-Relationship)

```
┌─────────────────┐    ┌─────────────────┐
│     USERS       │    │    PROFILES     │
├─────────────────┤    ├─────────────────┤
│ id (PK)         │◄───┤ id (PK, FK)     │
│ email           │    │ first_name      │
│ created_at      │    │ last_name       │
│ updated_at      │    │ phone           │
│ is_admin        │    │ subscription_id │
└─────────────────┘    │ created_at      │
                       │ updated_at      │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  SUBSCRIPTIONS  │
                       ├─────────────────┤
                       │ id (PK)         │
                       │ user_id (FK)    │
                       │ plan_id (FK)    │
                       │ status          │
                       │ started_at      │
                       │ expires_at      │
                       │ auto_renew      │
                       │ books_used_*    │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │     PLANS       │
                       ├─────────────────┤
                       │ id (PK)         │
                       │ name            │
                       │ description     │
                       │ price_monthly   │
                       │ price_yearly    │
                       │ max_books_*     │
                       │ is_active       │
                       └─────────────────┘

┌─────────────────┐    ┌─────────────────┐
│     BOOKS       │    │    AUTHORS      │
├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │
│ title           │    │ name            │
│ description     │    │ biography       │
│ cover_url       │    │ created_at      │
│ pages           │    │ updated_at      │
│ category        │    └─────────────────┘
│ subcategory_id  │             │
│ tsvector        │             │
│ created_at      │             │
│ updated_at      │             │
└─────────────────┘             │
         │                      │
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│  BOOK_AUTHORS   │    │ MAIN_CATEGORIES │
├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │
│ book_id (FK)    │    │ name            │
│ author_id (FK)  │    │ description     │
│ created_at      │    │ icon            │
└─────────────────┘    │ created_at      │
                       │ updated_at      │
                                │
                                ▼
                       ┌─────────────────┐
                       │  SUBCATEGORIES  │
                       ├─────────────────┤
                       │ id (PK)         │
                       │ name            │
                       │ main_category_id│
                       │ created_at      │
                       │ updated_at      │
                       └─────────────────┘

┌─────────────────┐    ┌─────────────────┐
│    PAYMENTS     │    │NOTIFICATION_QUEUE│
├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │
│ user_id (FK)    │    │ user_id (FK)    │
│ subscription_id │    │ type            │
│ amount          │    │ title           │
│ currency        │    │ message         │
│ status          │    │ is_read         │
│ payment_method  │    │ sent_at         │
│ transaction_id  │    │ created_at      │
│ created_at      │    └─────────────────┘
│ updated_at      │
└─────────────────┘

┌─────────────────┐
│ READING_HISTORY │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ book_id (FK)    │
│ started_at      │
│ finished_at     │
│ rating          │
│ review          │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

## 🔄 Диаграмма потоков данных

### Процесс добавления книги
```
1. Админ → Создание автора
   ↓
2. Админ → Создание книги
   ↓
3. Система → Связывание книги с автором
   ↓
4. Система → Обновление поискового индекса
   ↓
5. Система → Публикация в каталоге
```

### Процесс создания подписки
```
1. Пользователь → Выбор плана
   ↓
2. Система → Проверка лимитов
   ↓
3. Платежная система → Обработка платежа
   ↓
4. Система → Создание подписки
   ↓
5. Система → Обновление профиля пользователя
   ↓
6. Система → Отправка уведомления
```

## 🏗️ Архитектурная диаграмма

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  • React Components                                        │
│  • Tailwind CSS                                           │
│  • Framer Motion                                          │
│  • Supabase Client                                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTPS/API Calls
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 SUPABASE PLATFORM                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   AUTH SERVICE  │  │  DATABASE (PG)  │  │   STORAGE   │ │
│  │                 │  │                 │  │             │ │
│  │ • JWT Tokens    │  │ • Tables        │  │ • Images    │ │
│  │ • User Mgmt     │  │ • RLS Policies  │  │ • Files     │ │
│  │ • Sessions      │  │ • Functions     │  │ • Backups   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ API Integration
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 EXTERNAL SERVICES                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   CLOUDINARY    │  │   VERCEL CDN    │  │   ANALYTICS │ │
│  │                 │  │                 │  │             │ │
│  │ • Image Storage │  │ • Global CDN    │  │ • Tracking  │ │
│  │ • Transformations│  │ • Edge Functions│  │ • Metrics   │ │
│  │ • Optimization  │  │ • Deployments   │  │ • Reports   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔒 Диаграмма безопасности

### RLS Политики по уровням доступа

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC ACCESS                           │
├─────────────────────────────────────────────────────────────┤
│  • books (SELECT)                                          │
│  • authors (SELECT)                                        │
│  • main_categories (SELECT)                                │
│  • subcategories (SELECT)                                  │
│  • plans (SELECT)                                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 AUTHENTICATED USERS                        │
├─────────────────────────────────────────────────────────────┤
│  • users (own data only)                                   │
│  • profiles (own data only)                                │
│  • subscriptions (own data only)                           │
│  • payments (own data only)                                │
│  • notification_queue (own data only)                      │
│  • reading_history (own data only)                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   ADMIN USERS                              │
├─────────────────────────────────────────────────────────────┤
│  • All tables (full access)                                │
│  • System functions                                         │
│  • Analytics and reports                                    │
│  • User management                                          │
└─────────────────────────────────────────────────────────────┘
```

## 📈 Диаграмма производительности

### Индексы и оптимизация

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE INDEXES                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   PRIMARY KEYS  │  │   FOREIGN KEYS  │  │   SEARCH    │ │
│  │                 │  │                 │  │             │ │
│  │ • id (UUID)     │  │ • user_id       │  │ • tsvector  │ │
│  │ • Auto-generated│  │ • book_id       │  │ • GIN Index │ │
│  │ • Clustered     │  │ • author_id     │  │ • Full-text │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   UNIQUE KEYS   │  │   COMPOSITE     │  │   PARTIAL   │ │
│  │                 │  │                 │  │             │ │
│  │ • email         │  │ • (book_id,     │  │ • Active    │ │
│  │ • transaction_id│  │   author_id)    │  │   records   │ │
│  │ • Unique pairs  │  │ • Multi-column  │  │ • Filtered  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Диаграмма жизненного цикла данных

### Жизненный цикл книги
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   CREATION  │───▶│ PUBLICATION │───▶│  ARCHIVING  │
│             │    │             │    │             │
│ • Add book  │    │ • Make      │    │ • Soft      │
│ • Add author│    │   available │    │   delete    │
│ • Categorize│    │ • Index     │    │ • Archive   │
│ • Upload    │    │ • Publish   │    │ • Cleanup   │
│   cover     │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   DRAFT     │    │  ACTIVE     │    │  INACTIVE   │
│             │    │             │    │             │
│ • Hidden    │    │ • Searchable│    │ • Hidden    │
│ • Editable  │    │ • Rentable  │    │ • Read-only │
│ • Private   │    │ • Public    │    │ • Archived  │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Жизненный цикл подписки
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   CREATION  │───▶│   ACTIVE    │───▶│  EXPIRATION │
│             │    │             │    │             │
│ • Payment   │    │ • Rent      │    │ • Grace     │
│ • Validation│    │   books     │    │   period    │
│ • Setup     │    │ • Track     │    │ • Renewal   │
│             │    │   usage     │    │   reminder  │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   PENDING   │    │  RENEWAL    │    │  CANCELLED  │
│             │    │             │    │             │
│ • Processing│    │ • Auto-renew│    │ • Manual    │
│ • Payment   │    │ • Manual    │    │   cancel    │
│   validation│    │   renewal   │    │ • End of    │
│             │    │             │    │   period    │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 📊 Диаграмма мониторинга

### Ключевые метрики
```
┌─────────────────────────────────────────────────────────────┐
│                    MONITORING DASHBOARD                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   PERFORMANCE   │  │   SECURITY      │  │   BUSINESS  │ │
│  │                 │  │                 │  │             │ │
│  │ • Query time    │  │ • Failed logins │  │ • Users     │ │
│  │ • Connection    │  │ • RLS violations│  │ • Books     │ │
│  │   count         │  │ • Suspicious    │  │ • Revenue   │ │
│  │ • Memory usage  │  │   activity      │  │ • Growth    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   AVAILABILITY  │  │   DATA HEALTH   │  │   ALERTS    │ │
│  │                 │  │                 │  │             │ │
│  │ • Uptime        │  │ • Data integrity│  │ • Errors    │ │
│  │ • Response time │  │ • Backup status │  │ • Warnings  │ │
│  │ • Error rate    │  │ • Storage usage │  │ • Critical  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

**Версия диаграмм**: 1.0  
**Дата создания**: 10 сентября 2025  
**Формат**: Mermaid/ASCII Art
