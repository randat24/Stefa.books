# 🔧 Технічний огляд проекту Stefa.Books

**Дата оновлення**: 9 вересня 2025  
**Версія**: 2.2.0  
**Статус**: 🟢 Повністю функціональний

## 📋 Загальний огляд

Stefa.Books - це сучасна веб-платформа для оренди дитячих книг, побудована на Next.js 15 з повною інтеграцією з Supabase, AI сервісами та сучасною дизайн-системою.

## 🏗️ Архітектура системи

### Frontend Architecture
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Корневий лейаут з метаданими
│   ├── page.tsx           # Головна сторінка з lazy loading
│   ├── books/             # Каталог книг
│   ├── admin/             # Адмін панель
│   ├── auth/              # Авторизація
│   └── api/               # API маршрути
├── components/
│   ├── ui/                # Базові UI компоненти
│   ├── sections/          # Секції сторінок
│   ├── admin/             # Адмін компоненти
│   ├── layouts/           # Лейаути (Header, Footer)
│   └── performance/       # Оптимізація продуктивності
├── lib/
│   ├── types/             # TypeScript типи
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Утиліти
│   └── ai/                # AI інтеграція
└── styles/
    └── globals.css        # Глобальні стилі + CSS змінні
```

### Backend Architecture
```
Supabase (PostgreSQL)
├── auth.users             # Користувачі
├── public.books           # Каталог книг
├── public.categories      # Категорії
├── public.rentals         # Оренди
├── public.subscriptions   # Підписки
└── RLS Policies           # Безпека на рівні рядків
```

## 🛠️ Технічний стек

### Core Technologies
- **Next.js 15.5.2** - React фреймворк з App Router
- **React 19.1.1** - UI бібліотека
- **TypeScript 5.5.4** - Статична типізація
- **Tailwind CSS 3.4.17** - Utility-first CSS фреймворк

### UI/UX Libraries
- **shadcn/ui** - Компоненти інтерфейсу
- **Lucide React 0.542.0** - Іконки
- **Framer Motion 12.23.12** - Анімації
- **Radix UI** - Доступні примітиви

### State Management
- **Zustand 5.0.8** - Легковесне управління станом
- **React Hook Form 7.53.0** - Управління формами
- **Zod 3.23.8** - Валідація схем

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Реляційна база даних
- **Row Level Security (RLS)** - Безпека на рівні рядків
- **Edge Functions** - Серверна логіка

### External Services
- **Netlify** - Хостинг та CDN
- **Cloudinary** - Управління зображеннями
- **Groq** - AI сервіс (Llama 3 70B)

### Development Tools
- **pnpm 10.15.1** - Пакетний менеджер
- **ESLint** - Лінтер коду
- **Prettier** - Форматування коду
- **Playwright** - E2E тестування

## 🎨 Дизайн-система

### CSS Architecture
```css
/* CSS Variables для консистентності */
:root {
  --brand: #0B1220;           /* Основний бренд */
  --brand-yellow: #eab308;    /* Жовтий акцент */
  --accent: #2563eb;          /* Синій акцент */
  --ink: #111827;             /* Текст */
  --text-muted: #6b7280;      /* Вторинний текст */
  --surface: #f9fafb;         /* Фон карток */
  --border: #e5e7eb;          /* Границі */
}
```

### Typography System
```css
/* Флюїдна типографіка */
--font-size-base: clamp(0.833rem, 0.75rem + 0.25vw, 0.938rem);
--font-size-lg: clamp(0.938rem, 0.833rem + 0.333vw, 1.042rem);
--font-size-xl: clamp(1.042rem, 0.917rem + 0.5vw, 1.25rem);
```

### Component System
- **Button** - Уніфіковані кнопки з варіантами
- **Card** - Картки з hover ефектами
- **Input** - Форми з валідацією
- **Badge** - Статусні бейджі
- **Modal** - Модальні вікна

## 🚀 Performance Optimization

### Code Splitting
```typescript
// Lazy loading компонентів
const PlansLite = lazy(() => import("@/components/widgets/PlansLite"));
const Catalog = lazy(() => import("@/components/sections/Catalog"));
```

### Image Optimization
```typescript
// Next.js Image з оптимізацією
<Image
  src={book.cover_url}
  alt={book.title}
  width={300}
  height={400}
  className="object-cover"
  priority={isAboveFold}
  sizes="(max-width: 768px) 100vw, 300px"
/>
```

### Caching Strategy
- **Static Generation** - Статичні сторінки
- **ISR** - Incremental Static Regeneration
- **API Caching** - Кешування API відповідей
- **CDN** - Netlify Edge Network

## 🔒 Security Implementation

### Authentication
```typescript
// Supabase Auth
const { data: { user } } = await supabase.auth.getUser();
```

### Row Level Security (RLS)
```sql
-- Приклад RLS політики
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);
```

### Input Validation
```typescript
// Zod схеми для валідації
const bookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  category_id: z.string().uuid(),
});
```

## 🤖 AI Integration

### Groq Llama 3 70B
```typescript
// AI аналіз контенту
const response = await groq.chat.completions.create({
  model: "llama3-70b-8192",
  messages: [{ role: "user", content: prompt }],
});
```

### AI Endpoints
- `POST /api/ai/analyze` - Аналіз контенту
- `GET /api/llms.txt` - AI discoverability
- `POST /api/ai/generate` - Генерація контенту

## 📊 Monitoring & Analytics

### Performance Monitoring
```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Error Tracking
- **Error Boundaries** - React error handling
- **Console Logging** - Development debugging
- **Production Monitoring** - Netlify Analytics

## 🧪 Testing Strategy

### Unit Testing
```typescript
// Jest + React Testing Library
import { render, screen } from '@testing-library/react';
import BookCard from '@/components/BookCard';

test('renders book title', () => {
  render(<BookCard book={mockBook} />);
  expect(screen.getByText(mockBook.title)).toBeInTheDocument();
});
```

### E2E Testing
```typescript
// Playwright tests
import { test, expect } from '@playwright/test';

test('user can browse catalog', async ({ page }) => {
  await page.goto('/books');
  await expect(page.getByRole('heading')).toContainText('Каталог');
});
```

## 🚀 Deployment Pipeline

### Netlify Configuration
```toml
[build]
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Groq AI
GROQ_API_KEY=your_groq_key
```

## 📈 Performance Metrics

### Core Web Vitals
- **LCP** - < 2.5s (Largest Contentful Paint)
- **FID** - < 100ms (First Input Delay)
- **CLS** - < 0.1 (Cumulative Layout Shift)

### Bundle Analysis
- **Total Bundle Size** - ~500KB gzipped
- **First Load JS** - ~200KB
- **Code Splitting** - 15+ chunks

## 🔧 Development Workflow

### Local Development
```bash
# Встановлення залежностей
pnpm install

# Запуск dev сервера
pnpm dev

# Перевірка типів
pnpm type-check

# Лінтінг
pnpm lint
```

### Production Build
```bash
# Збірка проекту
pnpm build

# Запуск production сервера
pnpm start

# Аналіз bundle
pnpm analyze:bundle
```

## 🐛 Troubleshooting

### Common Issues
1. **Tailwind CSS конфлікти** - Використовувати v3.4.17
2. **TypeScript помилки** - Перевірити типи в lib/types/
3. **API помилки** - Перевірити RLS політики
4. **Чорні іконки** - Додати правильні CSS класи

### Debug Commands
```bash
# Перевірка стилів
pnpm check-styles

# Виправлення стилів
pnpm fix-styles

# Екстрене відновлення
pnpm emergency:quick
```

## 📚 Documentation

### Key Documents
- **README.md** - Основна документація
- **DOCUMENTATION.md** - Детальний опис
- **DESIGN_SYSTEM.md** - Дизайн-система
- **TROUBLESHOOTING_STYLES.md** - Вирішення проблем

### API Documentation
- **Swagger/OpenAPI** - Автоматична генерація
- **Postman Collection** - Тестування API
- **TypeScript Types** - Автодоповнення

## 🎯 Future Roadmap

### Short-term (1-2 months)
- [ ] PWA implementation
- [ ] Advanced AI features
- [ ] Mobile app (React Native)
- [ ] Payment integration

### Long-term (3-6 months)
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Machine learning recommendations
- [ ] Social features

---

**Технічний огляд створено**: 9 вересня 2025  
**Версія документації**: v1.0  
**Автор**: Claude Code Assistant 🤖
