# 🚀 Керівництво з деплою на Vercel

Повне керівництво з підготовки та деплою проекту Stefa.Books на Vercel.

## 📋 Передумови

### Системні вимоги
- Node.js 18+ 
- pnpm (менеджер пакетів)
- Git репозиторій на GitHub
- Аккаунт Vercel
- Налаштовані сервіси (Supabase, Cloudinary)

### Необхідні сервіси
- **Supabase** - база даних та аутентифікація
- **Cloudinary** - зберігання зображень
- **Vercel** - хостинг та деплой

## 🔧 Підготовка проекту

### 1. Перевірка конфігурації

#### package.json
```json
{
  "name": "stefa-books-final",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

#### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output file tracing root to resolve lockfile warning
  outputFileTracingRoot: __dirname,
  
  // Bundle optimization
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/photo-*',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 днів
  },
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    memoryBasedWorkersCount: true,
  }
};

module.exports = nextConfig;
```

### 2. Створення vercel.json

Створіть файл `vercel.json` в корені проекту:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "/api/sitemap"
    }
  ]
}
```

### 3. Налаштування змінних середовища

#### Створення .env.example
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app

# Environment
NODE_ENV=production

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Optional: Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🚀 Процес деплою

### 1. Підготовка репозиторія

```bash
# Перевірка статусу Git
git status

# Додавання всіх змін
git add .

# Коміт змін
git commit -m "feat: підготовка до деплою на Vercel"

# Пуш в репозиторій
git push origin main
```

### 2. Підключення до Vercel

#### Через веб-інтерфейс Vercel:

1. Перейдіть на [vercel.com](https://vercel.com)
2. Натисніть **"New Project"**
3. Підключіть GitHub репозиторій
4. Виберіть проект `Stefa-books-v2.1`

#### Через Vercel CLI:

```bash
# Встановлення Vercel CLI
npm i -g vercel

# Авторизація
vercel login

# Ініціалізація проекту
vercel

# Деплой
vercel --prod
```

### 3. Налаштування змінних середовища в Vercel

#### Через веб-інтерфейс:
1. Перейдіть в **Settings → Environment Variables**
2. Додайте змінні для кожного середовища:

**Production:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_production_cloud_name
CLOUDINARY_API_KEY=your_production_api_key
CLOUDINARY_API_SECRET=your_production_api_secret
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NODE_ENV=production
```

**Preview:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_preview_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_preview_service_role_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_preview_cloud_name
CLOUDINARY_API_KEY=your_preview_api_key
CLOUDINARY_API_SECRET=your_preview_api_secret
NEXT_PUBLIC_SITE_URL=https://your-preview-branch.vercel.app
NODE_ENV=production
```

**Development:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_development_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_development_service_role_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_development_cloud_name
CLOUDINARY_API_KEY=your_development_api_key
CLOUDINARY_API_SECRET=your_development_api_secret
NEXT_PUBLIC_SITE_URL=https://your-dev-branch.vercel.app
NODE_ENV=development
```

#### Через Vercel CLI:

```bash
# Додавання змінних
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
vercel env add NEXT_PUBLIC_SITE_URL

# Перегляд змінних
vercel env ls
```

## 🔧 Налаштування Vercel

### 1. Build Settings

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "outputDirectory": ".next"
}
```

### 2. Domain Configuration

#### Кастомний домен:
1. Перейдіть в **Settings → Domains**
2. Додайте ваш домен (наприклад, `stefa-books.com.ua`)
3. Налаштуйте DNS записи:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.19.61
   ```

### 3. Performance Settings

```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["fra1", "iad1"],
  "framework": "nextjs"
}
```

## 🧪 Тестування деплою

### 1. Локальне тестування

```bash
# Встановлення залежностей
pnpm install

# Перевірка типів
pnpm type-check

# Лінтінг
pnpm lint

# Білд
pnpm build

# Тестування
pnpm test
```

### 2. Preview деплой

```bash
# Створення preview деплою
vercel

# Перегляд preview
vercel ls
```

### 3. Production деплой

```bash
# Production деплой
vercel --prod

# Перевірка статусу
vercel inspect
```

## 📊 Моніторинг та аналітика

### 1. Vercel Analytics

```bash
# Встановлення Vercel Analytics
pnpm add @vercel/analytics

# Додавання в layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Performance Monitoring

```bash
# Встановлення Web Vitals
pnpm add web-vitals

# Додавання в _app.tsx або layout.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Відправка метрик в аналітику
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## 🔒 Безпека

### 1. Environment Variables Security

- ✅ Використовуйте різні ключі для різних середовищ
- ✅ Ніколи не комітьте `.env` файли
- ✅ Регулярно ротуйте API ключі
- ✅ Використовуйте Vercel Environment Variables

### 2. Headers Security

```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ];
}
```

### 3. API Security

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Rate limiting
  const rateLimit = new Map();
  const ip = request.ip || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;

  if (rateLimit.has(ip)) {
    const requests = rateLimit.get(ip);
    if (requests.count >= maxRequests && now - requests.resetTime < windowMs) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  return NextResponse.next();
}
```

## 🚨 Усунення проблем

### 1. Build Errors

```bash
# Перевірка логів білду
vercel logs

# Локальний білд для діагностики
pnpm build

# Перевірка типів
pnpm type-check
```

### 2. Environment Variables Issues

```bash
# Перевірка змінних в Vercel
vercel env ls

# Тестування змінних
vercel env pull .env.vercel
```

### 3. Performance Issues

```bash
# Аналіз бандлу
pnpm analyze:bundle

# Перевірка розміру
vercel inspect --logs
```

### 4. Database Connection Issues

```typescript
// Перевірка підключення до Supabase
import { supabase } from '@/lib/supabase';

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Supabase connection successful');
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
  }
}
```

## 📈 Оптимізація

### 1. Bundle Optimization

```javascript
// next.config.js
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion'
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};
```

### 2. Image Optimization

```typescript
// Використання Next.js Image компонента
import Image from 'next/image';

<Image
  src={book.cover_url}
  alt={book.title}
  width={300}
  height={400}
  priority={isAboveFold}
  sizes="(max-width: 768px) 100vw, 300px"
  className="object-cover"
/>
```

### 3. Caching Strategy

```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/books',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};
```

## 🔄 CI/CD Pipeline

### 1. GitHub Actions

Створіть `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm type-check
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 2. Vercel Git Integration

1. Підключіть GitHub репозиторій
2. Налаштуйте автоматичні деплої:
   - **Production**: з гілки `main`
   - **Preview**: з інших гілок
3. Налаштуйте перевірки перед деплоєм

## 📚 Додаткові ресурси

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Performance Best Practices](https://vercel.com/docs/concepts/next.js/performance)

## ✅ Чек-лист деплою

### Перед деплоєм:
- [ ] Всі тести проходять
- [ ] Лінтінг без помилок
- [ ] TypeScript компілюється без помилок
- [ ] Змінні середовища налаштовані
- [ ] База даних готова
- [ ] Зображення оптимізовані

### Після деплою:
- [ ] Сайт завантажується
- [ ] API працює
- [ ] База даних підключається
- [ ] Зображення завантажуються
- [ ] Форми працюють
- [ ] Аналітика налаштована

---

**Важливо**: Завжди тестуйте деплой в preview режимі перед production! 🚀

*Vercel Deployment Guide оновлено: Грудень 2024*
