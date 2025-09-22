# 🚀 Новые компоненты Stefa.Books - Руководство по использованию

Этот документ описывает все новые компоненты, созданные для улучшения производительности, доступности и пользовательского опыта.

## 📋 Содержание

1. [🖼️ Оптимизированные изображения](#оптимизированные-изображения)
2. [🔄 Skeleton Loading States](#skeleton-loading-states)
3. [📊 SEO и структурированные данные](#seo-и-структурированные-данные)
4. [🛡️ Error Boundaries](#error-boundaries)
5. [🏗️ Семантические HTML компоненты](#семантические-html-компоненты)
6. [⌨️ Клавиатурная навигация](#клавиатурная-навигация)

---

## 🖼️ Оптимизированные изображения

### `UltraOptimizedImage`

Максимально оптимизированный компонент изображения с поддержкой:

- Lazy loading с Intersection Observer
- Blur placeholder
- Error handling с fallback
- WebP поддержка
- Accessibility атрибуты
- Performance оптимизации

```tsx
import { UltraOptimizedImage } from "@/components/ui/UltraOptimizedImage";

<UltraOptimizedImage
  src="/images/book.jpg"
  alt="Обложка книги"
  width={300}
  height={400}
  priority={false}
  loading="lazy"
  sizes="(max-width: 768px) 100vw, 50vw"
  quality={85}
  placeholder="blur"
  showLoadingState={true}
  showErrorState={true}
  ariaLabel="Обложка книги 'Название'"
/>;
```

### Специализированные компоненты

#### `OptimizedBookImage`

Для изображений книг с предустановленными параметрами:

```tsx
import { OptimizedBookImage } from "@/components/ui/UltraOptimizedImage";

<OptimizedBookImage
  src="/images/book-cover.jpg"
  alt="Обложка книги"
  width={300}
  height={400}
  priority={false}
/>;
```

#### `OptimizedHeroImage`

Для hero изображений с высоким приоритетом:

```tsx
import { OptimizedHeroImage } from "@/components/ui/UltraOptimizedImage";

<OptimizedHeroImage
  src="/images/hero-banner.jpg"
  alt="Главный баннер"
  width={1200}
  height={600}
/>;
```

#### `OptimizedAvatarImage`

Для аватаров пользователей:

```tsx
import { OptimizedAvatarImage } from "@/components/ui/UltraOptimizedImage";

<OptimizedAvatarImage
  src="/images/avatar.jpg"
  alt="Аватар пользователя"
  width={40}
  height={40}
/>;
```

---

## 🔄 Skeleton Loading States

### Базовый `Skeleton`

```tsx
import { Skeleton } from '@/components/ui/SkeletonLoader';

<Skeleton className="w-full h-4" />
<Skeleton className="w-3/4 h-6" />
<Skeleton className="w-16 h-16 rounded-full" />
```

### Специализированные skeleton компоненты

#### `BookCardSkeleton`

Для карточек книг:

```tsx
import { BookCardSkeleton } from "@/components/ui/SkeletonLoader";

<BookCardSkeleton />;
```

#### `BookListSkeleton`

Для списков книг:

```tsx
import { BookListSkeleton } from "@/components/ui/SkeletonLoader";

<BookListSkeleton count={6} />;
```

#### `HeroSkeleton`

Для hero секций:

```tsx
import { HeroSkeleton } from "@/components/ui/SkeletonLoader";

<HeroSkeleton />;
```

#### `NavigationSkeleton`

Для навигации:

```tsx
import { NavigationSkeleton } from "@/components/ui/SkeletonLoader";

<NavigationSkeleton />;
```

#### `UserProfileSkeleton`

Для профилей пользователей:

```tsx
import { UserProfileSkeleton } from "@/components/ui/SkeletonLoader";

<UserProfileSkeleton />;
```

---

## 📊 SEO и структурированные данные

### `BookStructuredData`

Для структурированных данных книг:

```tsx
import { BookStructuredData } from "@/components/seo/StructuredData";

<BookStructuredData
  book={{
    id: "1",
    title: "Название книги",
    author: "Автор",
    isbn: "978-5-699-12345-6",
    description: "Описание книги",
    coverUrl: "/images/cover.jpg",
    price: 299,
    currency: "UAH",
    availability: "InStock",
    genre: ["Детская литература"],
    rating: 4.8,
    reviewCount: 156,
  }}
/>;
```

### `OrganizationStructuredData`

Для данных организации:

```tsx
import { OrganizationStructuredData } from "@/components/seo/StructuredData";

<OrganizationStructuredData
  organization={{
    name: "Stefa.Books",
    url: "https://stefa-books.com.ua",
    logo: "/images/logo.png",
    description: "Детская библиотека по подписке",
    address: {
      streetAddress: "ул. Соборная, 1",
      addressLocality: "Николаев",
      addressRegion: "Николаевская область",
      postalCode: "54001",
      addressCountry: "UA",
    },
    contactPoint: {
      telephone: "+38 (0512) 123-456",
      contactType: "customer service",
    },
  }}
/>;
```

### `BreadcrumbStructuredData`

Для хлебных крошек:

```tsx
import { BreadcrumbStructuredData } from "@/components/seo/StructuredData";

<BreadcrumbStructuredData
  items={[
    { name: "Главная", url: "/", position: 1 },
    { name: "Книги", url: "/books", position: 2 },
    { name: "Детские книги", url: "/books/children", position: 3 },
  ]}
/>;
```

### `FAQStructuredData`

Для FAQ секций:

```tsx
import { FAQStructuredData } from "@/components/seo/StructuredData";

<FAQStructuredData
  faqs={[
    {
      question: "Как работает подписка?",
      answer: "Вы выбираете план и получаете доступ к каталогу книг.",
    },
    {
      question: "Сколько книг можно взять?",
      answer: "Зависит от выбранного плана: от 2 до 6 книг.",
    },
  ]}
/>;
```

---

## 🛡️ Error Boundaries

### `EnhancedErrorBoundary`

Компонент с тремя уровнями обработки ошибок:

```tsx
import { EnhancedErrorBoundary } from '@/components/error-boundary/EnhancedErrorBoundary';

// Критический уровень
<EnhancedErrorBoundary level="critical" showDetails={true}>
  <CriticalComponent />
</EnhancedErrorBoundary>

// Уровень страницы
<EnhancedErrorBoundary level="page" showDetails={false}>
  <PageComponent />
</EnhancedErrorBoundary>

// Уровень компонента
<EnhancedErrorBoundary level="component" showDetails={true}>
  <RegularComponent />
</EnhancedErrorBoundary>
```

### HOC `withErrorBoundary`

```tsx
import { withErrorBoundary } from "@/components/error-boundary/EnhancedErrorBoundary";

const SafeComponent = withErrorBoundary(MyComponent, {
  level: "component",
  showDetails: true,
});
```

### Хук `useErrorHandler`

```tsx
import { useErrorHandler } from "@/components/error-boundary/EnhancedErrorBoundary";

function MyComponent() {
  const { handleError, clearError } = useErrorHandler();

  const handleAsyncOperation = async () => {
    try {
      await someAsyncOperation();
    } catch (error) {
      handleError(error);
    }
  };

  return <button onClick={handleAsyncOperation}>Выполнить операцию</button>;
}
```

---

## 🏗️ Семантические HTML компоненты

### Основные семантические компоненты

```tsx
import {
  Main,
  Section,
  Article,
  Navigation,
  Heading,
  List,
  ListItem,
  Container,
  Group,
} from "@/components/semantic/SemanticComponents";

<Main>
  <Container>
    <Section ariaLabel="Основная секция">
      <Article>
        <Heading level={1}>Заголовок статьи</Heading>
        <p>Содержимое статьи...</p>

        <Heading level={2}>Список преимуществ</Heading>
        <List>
          <ListItem>Преимущество 1</ListItem>
          <ListItem>Преимущество 2</ListItem>
          <ListItem>Преимущество 3</ListItem>
        </List>
      </Article>
    </Section>
  </Container>
</Main>;
```

### Дополнительные семантические компоненты

```tsx
import {
  Quote,
  Code,
  Pre,
  Mark,
  Emphasis,
  Strong,
  Small,
  Abbreviation,
  Progress,
  Details,
  Time,
  Address
} from '@/components/semantic/SemanticComponents';

<Quote cite="https://example.com">
  "Книги - это окно в мир знаний."
</Quote>

<Code>const book = "Stefa.Books";</Code>

<Mark>Важная информация выделена</Mark>

<Emphasis>Подчеркнутый текст</Emphasis>

<Strong>Жирный текст</Strong>

<Abbreviation title="HyperText Markup Language">HTML</Abbreviation>

<Progress value={75} max={100} />

<Details summary="Показать детали">
  <p>Скрытое содержимое...</p>
</Details>

<Time dateTime="2024-01-15">15 января 2024</Time>

<Address>
  ул. Соборная, 1<br />
  Николаев, 54001
</Address>
```

---

## ⌨️ Клавиатурная навигация

### `EnhancedKeyboardNavigation`

Основной компонент для клавиатурной навигации:

```tsx
import { EnhancedKeyboardNavigation } from "@/components/accessibility/EnhancedKeyboardNavigation";

<EnhancedKeyboardNavigation
  trapFocus={true}
  autoFocus={false}
  restoreFocus={true}
  onEscape={() => console.log("Escape pressed")}
>
  <div>{/* Интерактивные элементы */}</div>
</EnhancedKeyboardNavigation>;
```

### `KeyboardButton`

Кнопка с улучшенной клавиатурной навигацией:

```tsx
import { KeyboardButton } from "@/components/accessibility/EnhancedKeyboardNavigation";

<KeyboardButton
  onClick={() => console.log("Clicked")}
  ariaLabel="Описание действия кнопки"
  className="px-4 py-2 bg-emerald-600 text-white rounded"
>
  Нажми меня
</KeyboardButton>;
```

### `KeyboardLink`

Ссылка с клавиатурной навигацией:

```tsx
import { KeyboardLink } from "@/components/accessibility/EnhancedKeyboardNavigation";

<KeyboardLink
  href="/books"
  ariaLabel="Перейти к каталогу книг"
  className="px-4 py-2 bg-blue-600 text-white rounded"
>
  Каталог книг
</KeyboardLink>;
```

### `KeyboardMenu`

Навигационное меню с клавиатурной поддержкой:

```tsx
import { KeyboardMenu } from "@/components/accessibility/EnhancedKeyboardNavigation";

<KeyboardMenu
  items={[
    { label: "Главная", href: "/", current: true },
    { label: "Книги", href: "/books" },
    { label: "О нас", href: "/about" },
  ]}
  orientation="horizontal"
/>;
```

### Хук `useKeyboardNavigation`

```tsx
import { useKeyboardNavigation } from "@/components/accessibility/EnhancedKeyboardNavigation";

function MyComponent() {
  const { isKeyboardUser } = useKeyboardNavigation();

  return (
    <div className={isKeyboardUser ? "keyboard-navigation" : ""}>
      {/* Контент с учетом типа навигации */}
    </div>
  );
}
```

---

## 🎯 Лучшие практики

### 1. Использование изображений

- Всегда указывайте `alt` текст для изображений
- Используйте подходящие `sizes` для responsive изображений
- Устанавливайте `priority={true}` только для hero изображений

### 2. Skeleton Loading

- Показывайте skeleton только при первой загрузке
- Используйте соответствующие skeleton компоненты для разных типов контента
- Скрывайте skeleton после загрузки данных

### 3. Error Boundaries

- Размещайте Error Boundaries на разных уровнях (страница, секция, компонент)
- Включайте `showDetails={true}` только в development режиме
- Всегда предоставляйте fallback UI

### 4. Семантическая разметка

- Используйте правильную иерархию заголовков (h1 → h2 → h3)
- Добавляйте `aria-label` для секций без заголовков
- Группируйте связанный контент с помощью семантических тегов

### 5. Клавиатурная навигация

- Тестируйте навигацию только с клавиатуры
- Обеспечивайте видимые focus indicators
- Используйте `tabIndex={0}` для интерактивных элементов

### 6. SEO

- Добавляйте структурированные данные для всех важных сущностей
- Используйте правильные типы данных (Book, Organization, etc.)
- Проверяйте валидность через Google Rich Results Test

---

## 🔧 Интеграция

### Добавление в существующие компоненты

1. **Замените обычные `<img>` на оптимизированные компоненты**
2. **Добавьте skeleton loading для асинхронных данных**
3. **Оберните компоненты в Error Boundaries**
4. **Используйте семантические компоненты вместо обычных div**
5. **Добавьте клавиатурную навигацию для интерактивных элементов**

### Пример интеграции

```tsx
import { Suspense } from "react";
import { EnhancedErrorBoundary } from "@/components/error-boundary/EnhancedErrorBoundary";
import { BookListSkeleton } from "@/components/ui/SkeletonLoader";
import { OptimizedBookImage } from "@/components/ui/UltraOptimizedImage";
import {
  Main,
  Section,
  Container,
} from "@/components/semantic/SemanticComponents";

export function BooksPage() {
  return (
    <Main>
      <Container>
        <Section ariaLabel="Каталог книг">
          <EnhancedErrorBoundary level="page">
            <Suspense fallback={<BookListSkeleton count={6} />}>
              <BooksList />
            </Suspense>
          </EnhancedErrorBoundary>
        </Section>
      </Container>
    </Main>
  );
}
```

---

## 📈 Производительность

Все новые компоненты оптимизированы для:

- **Core Web Vitals** (LCP, FID, CLS)
- **Accessibility** (WCAG 2.1 AA)
- **SEO** (структурированные данные)
- **Mobile-first** подход
- **Progressive enhancement**

---

## 🐛 Отладка

### Проверка производительности

```bash
# Lighthouse audit
npm run lighthouse

# Bundle analysis
npm run analyze
```

### Проверка доступности

```bash
# Accessibility testing
npm run test:a11y
```

### Проверка SEO

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

---

## 📞 Поддержка

При возникновении вопросов или проблем:

1. Проверьте консоль браузера на ошибки
2. Убедитесь в правильности импортов
3. Проверьте типы данных для структурированных данных
4. Обратитесь к документации соответствующих библиотек

---

**Создано для Stefa.Books** 🚀
