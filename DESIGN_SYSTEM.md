# 🎨 Design System - Stefa.Books

> Полное руководство по дизайн-системе дитячої бібліотеки Stefa.Books

## 📋 Обзор

Дизайн-система Stefa.Books построена на **Tailwind CSS v3.4.17** с кастомными CSS переменными и компонентами. Система обеспечивает консистентный, доступный и красивый интерфейс для детской аудитории.

## 🎯 Основные принципы

### 1. **Дружелюбный к детям**
- Яркие, но не агрессивные цвета
- Крупные, читабельные шрифты
- Интуитивные иконки и элементы

### 2. **Доступность (Accessibility)**
- Контрастность цветов соответствует WCAG 2.1 AA
- Поддержка клавиатурной навигации
- Семантичная HTML разметка

### 3. **Адаптивность**
- Mobile-first подход
- Флюидная типографика
- Адаптивные компоненты

---

## 🎨 Цветовая палитра

### Основные цвета

```css
/* Фирменные цвета */
--brand: #0B1220;           /* Темно-синий основной */
--brand-light: #1e293b;     /* Светлее основного */
--accent: #2563eb;          /* Синий акцент */
--accent-light: #3b82f6;    /* Светлый акцент */

/* Желтый брендовый */
--brand-yellow: #eab308;      /* rgb(234 179 8) - Основной желтый */
--brand-yellow-light: #facc15; /* rgb(250 204 21) - Светлый желтый */
--brand-yellow-dark: #ca8a04;  /* rgb(202 138 4) - Темный желтый */
```

### Семантические цвета

```css
/* Состояния */
--success: #10b981;         /* Успех */
--success-light: #d1fae5;   /* Фон успеха */
--warning: #f59e0b;         /* Предупреждение */
--warning-light: #fef3c7;   /* Фон предупреждения */
--error: #ef4444;           /* Ошибка */
--error-light: #fee2e2;     /* Фон ошибки */
```

### Нейтральные цвета

```css
/* Текст и интерфейс */
--ink: #111827;             /* Заголовки */
--text: #1f2937;            /* Основной текст */
--text-muted: #6b7280;      /* Вторичный текст */
--text-light: #9ca3af;      /* Подсказки */
--border: #e5e7eb;          /* Границы */
--surface: #f9fafb;         /* Фон карточек */
--surface-hover: #f3f4f6;   /* Hover состояние */
```

---

## ✏️ Типографика

### Флюидная система шрифтов

```css
/* Основные размеры (адаптивные) */
--font-size-xs: clamp(0.625rem, 0.583rem + 0.125vw, 0.729rem);   /* 10-12px */
--font-size-sm: clamp(0.729rem, 0.667rem + 0.167vw, 0.833rem);   /* 12-13px */
--font-size-base: clamp(0.833rem, 0.75rem + 0.25vw, 0.938rem);   /* 13-15px */
--font-size-lg: clamp(0.938rem, 0.833rem + 0.333vw, 1.042rem);   /* 15-17px */
--font-size-xl: clamp(1.042rem, 0.917rem + 0.5vw, 1.25rem);      /* 17-20px */
--font-size-2xl: clamp(1.25rem, 1.083rem + 0.667vw, 1.563rem);   /* 20-25px */
--font-size-3xl: clamp(1.563rem, 1.333rem + 1vw, 1.875rem);      /* 25-30px */
--font-size-4xl: clamp(1.875rem, 1.583rem + 1.333vw, 2.5rem);    /* 30-40px */
--font-size-5xl: clamp(2.5rem, 2rem + 2vw, 3.125rem);            /* 40-50px */
--font-size-6xl: clamp(3.125rem, 2.5rem + 2.5vw, 3.75rem);       /* 50-60px */
```

### Заголовки

```css
/* Стили заголовков */
h1, .h1 { 
  font-size: var(--font-size-5xl);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.1;
}

h2, .h2 { 
  font-size: var(--font-size-4xl);
  font-weight: 700;
  letter-spacing: -0.030em;
  line-height: 1.15;
}

h3, .h3 { 
  font-size: var(--font-size-3xl);
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.2;
}
```

### Семейство шрифтов

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
```

---

## 📐 Пространство и отступы

### Система пространства (8px grid)

```css
--space-px: 1px;
--space-0: 0;
--space-1: 0.25rem;  /* 4px  */
--space-2: 0.5rem;   /* 8px  */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
--space-24: 6rem;    /* 96px */
--space-32: 8rem;    /* 128px */
```

### Флюидные секции

```css
--section-padding: clamp(2rem, 1.5rem + 2vw, 4rem);      /* Обычные секции */
--section-padding-sm: clamp(1rem, 0.5rem + 1.5vw, 2rem); /* Малые секции */
--section-padding-lg: clamp(3rem, 2rem + 3vw, 6rem);     /* Большие секции */
```

---

## 🔄 Анимации и переходы

### Keyframes

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
```

### Утилитарные классы

```css
.animate-fade-in { animation: fadeIn 0.5s ease; }
.animate-slide-up { animation: slideUp 0.5s ease; }
.animate-scale-in { animation: scaleIn 0.3s ease; }

.hover-lift { transition: transform 200ms; }
.hover-lift:hover { transform: translateY(-2px); }

.click-scale { transition: transform 150ms; }
.click-scale:active { transform: scale(0.98); }
```

---

## 🖱️ Компоненты

### Кнопки

#### Основная кнопка (.btn-primary)
```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  padding: 0.75em 1.5em;
  border-radius: 9999px; /* полностью округлая */
  background-color: rgb(234 179 8); /* brand-yellow */
  color: rgb(15 23 42);
  transition: all 200ms;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  background-color: rgb(250 204 21); /* brand-yellow-light */
  transform: scale(1.02);
}
```

#### Контурная кнопка (.btn-outline)
```css
.btn-outline {
  /* Аналогично primary, но с border и прозрачным фоном */
  border: 1px solid rgb(226 232 240);
  background-color: white;
}
```

#### Прозрачная кнопка (.btn-ghost)
```css
.btn-ghost {
  /* Аналогично, но полностью прозрачная */
  background-color: transparent;
}
```

### Карточки

#### Основная карточка (.card)
```css
.card {
  padding: var(--space-4);
  gap: var(--space-3);
  border-radius: var(--radius-lg);
  border: var(--space-px) solid var(--border);
  background: white;
  box-shadow: var(--shadow-md);
  transition: all 200ms;
  container-type: inline-size; /* Container queries */
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-1px);
}
```

### Формы

#### Инпуты (.input)
```css
.input {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: var(--space-px) solid var(--border);
  background: white;
  font-size: var(--font-size-base);
  color: var(--text);
  transition: all 200ms;
}

.input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-light), var(--shadow-sm);
  outline: none;
}

.input:hover:not(:focus) {
  border-color: var(--text-muted);
}
```

#### Состояния форм
```css
.input-error {
  border-color: var(--error);
  outline: 2px solid var(--error);
}

.input-success {
  border-color: var(--success);
  outline: 2px solid var(--success);
}
```

---

## 📱 Адаптивность

### Точки прерывания

```javascript
screens: {
  sm: "640px",
  md: "768px", 
  lg: "1024px",
  xl: "1200px",
  "2xl": "1280px",
}
```

### Container Queries

```css
@container (min-width: 480px) {
  .card-grid, .book-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container (min-width: 768px) {
  .card-grid, .book-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@container (min-width: 1024px) {
  .book-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

## 🎪 Иконки и графика

### Иконки

- **Библиотека:** Lucide React v0.542.0
- **Стиль:** Outline иконки
- **Размеры:** 16px, 20px, 24px, 32px
- **Цвета:** Наследуют от текста или кастомные

### Правила использования

```tsx
// ✅ Хорошо
<BookOpen className="h-5 w-5 text-brand" />
<Heart className="h-4 w-4 text-error" />

// ❌ Плохо
<BookOpen color="black" size={20} /> // Не используйте прямые цвета
```

### Проблема черных иконок

Если иконки отображаются черными, проверьте:

1. **CSS классы:** `className="h-5 w-5 text-brand"`
2. **Наследование цвета:** Убедитесь что родительский элемент имеет правильный `color`
3. **CSS конфликты:** Проверьте не перекрывает ли другой CSS

---

## 🎯 Использование в компонентах

### Пример BookCard

```tsx
export function BookCard({ book }: BookCardProps) {
  return (
    <div className="card hover-lift">
      <div className="aspect-[3/4] mb-4">
        <OptimizedBookImage src={book.cover_url} alt={book.title} />
      </div>
      <h3 className="text-lg font-semibold text-ink mb-2 line-clamp-2">
        {book.title}
      </h3>
      <p className="text-sm text-text-muted mb-4">
        {book.author}
      </p>
      <button className="btn-primary w-full">
        <BookOpen className="h-4 w-4 mr-2" />
        Детальніше
      </button>
    </div>
  )
}
```

### Пример Hero секции

```tsx
export function Hero() {
  return (
    <section className="hero section-lg">
      <div className="container">
        <h1 className="hero-title text-ink mb-6 animate-fade-in">
          📚 Дитяча бібліотека у Миколаєві
        </h1>
        <p className="hero-description text-text mb-8 animate-slide-up">
          Читай легко. Оформлюй підписку та забирай книги зручно.
        </p>
        <div className="flex gap-4 animate-scale-in">
          <button className="btn-primary">
            Оформити підписку
          </button>
          <button className="btn-outline">
            Перейти до каталогу
          </button>
        </div>
      </div>
    </section>
  )
}
```

---

## 🔧 Технические требования

### Версии пакетов

```json
{
  "tailwindcss": "^3.4.17",
  "@tailwindcss/forms": "0.5.10",
  "postcss": "8.4.47",
  "autoprefixer": "^10.4.20"
}
```

### Конфигурация Tailwind (tailwind.config.ts)

```typescript
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { /* breakpoints */ },
    },
    extend: {
      colors: { /* custom colors */ },
      fontFamily: { /* custom fonts */ },
      fontSize: { /* fluid typography */ },
      spacing: { /* custom spacing */ },
      borderRadius: { /* custom radius */ },
      boxShadow: { /* custom shadows */ },
      animation: { /* custom animations */ },
      keyframes: { /* keyframes */ },
    },
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: 'class',
    }),
  ],
} satisfies Config;
```

### Конфигурация PostCSS (postcss.config.js)

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## 📖 Рекомендации

### ✅ Лучшие практики

1. **Используйте CSS переменные** для цветов вместо прямых значений
2. **Применяйте флюидную типографику** для адаптивности
3. **Используйте semantic HTML** для доступности
4. **Тестируйте на разных устройствах** и размерах экрана
5. **Проверяйте контрастность** цветов

### ❌ Чего избегать

1. **Не используйте фиксированные размеры** шрифтов
2. **Не применяйте инлайновые стили** без крайней необходимости
3. **Не забывайте про accessibility** атрибуты
4. **Не используйте слишком яркие** или агрессивные цвета
5. **Не перегружайте интерфейс** анимациями

---

## 🚀 Следующие шаги

1. **Регулярно обновляйте** эту документацию
2. **Добавляйте новые компоненты** в систему
3. **Тестируйте доступность** с реальными пользователями
4. **Оптимизируйте производительность** CSS
5. **Создавайте Storybook** для компонентов

---

*Документация обновлена: 9 сентября 2025*  
*Версия дизайн-системы: v1.0*  
*Автор: Claude Code* 🤖