# Stefa.Books — Брендинг (логотипы и иконки)

## Файловая структура

```
public/
├── brand/
│   ├── logo.svg              # Основной логотип (светлый фон)
│   ├── logo-dark.svg         # Инверсия (тёмные хедеры/баннеры)
│   ├── favicon.svg           # Иконка-монохром, упрощённый знак
│   └── README.md             # Описание бренд-ассетов
├── favicon.ico               # 32×32 для совместимости
├── apple-touch-icon.png      # 180×180 для iOS
├── icon-192.png             # 192×192 для PWA
└── icon-512.png             # 512×512 для PWA

app/
└── icon.png                 # 512×512 для Next.js App Router
```

## Подключение

### Логотип в хедере
```tsx
// components/Header.tsx
import Logo from '@/public/brand/logo.svg';

export default function Header() {
  return (
    <header>
      <Logo className="h-8 w-auto md:h-10" />
    </header>
  );
}
```

### Иконки Next App Router
- `app/icon.png` — автоматически используется как favicon в Next 15
- Дополнительно `public/favicon.ico` для совместимости

### PWA/OG
Обновить `app/manifest.webmanifest`:
```json
{
  "name": "Stefa.Books",
  "short_name": "Stefa.Books",
  "description": "Аренда детских книг в Миколаїві",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## Требования к SVG

### Основной логотип
- Векторный формат SVG
- Без лишних групп/inline-стилей
- Оптимизированный код
- Размеры: 180×60px (рекомендуется)

### Инверсия логотипа
- Версия для тёмного фона
- Контрастные цвета
- Сохранение читаемости

### Фавикон
- Упрощённый знак
- Монохромный дизайн
- Хорошо смотрится в 16×16px

## Проверка

### Браузер
- Откройте вкладку браузера и закрепите — иконка должна быть чёткой 16–32px
- Проверьте на разных устройствах

### Lighthouse
- Прогоните Lighthouse (maskable icon — опционально для PWA)
- Проверьте мета-теги и OG изображения

### Разные размеры
- 16×16 — фавикон
- 32×32 — Windows
- 180×180 — Apple Touch Icon
- 192×192 — Android
- 512×512 — PWA

## Цветовая палитра

### Основные цвета
```css
/* Бежево-песочная основа */
--color-sand-50: #fafaf9;
--color-sand-100: #f5f5f4;
--color-sand-200: #e7e5e4;
--color-sand-300: #d6d3d1;
--color-sand-400: #a8a29e;
--color-sand-500: #78716c;
--color-sand-600: #57534e;
--color-sand-700: #44403c;
--color-sand-800: #292524;
--color-sand-900: #1c1917;

/* Изумрудные акценты */
--color-emerald-50: #ecfdf5;
--color-emerald-100: #d1fae5;
--color-emerald-200: #a7f3d0;
--color-emerald-300: #6ee7b7;
--color-emerald-400: #34d399;
--color-emerald-500: #10b981;
--color-emerald-600: #059669;
--color-emerald-700: #047857;
--color-emerald-800: #065f46;
--color-emerald-900: #064e3b;
```

### Состояния
```css
/* Hover */
--color-hover: var(--color-emerald-600);

/* Active */
--color-active: var(--color-emerald-700);

/* Disabled */
--color-disabled: var(--color-sand-300);

/* Success */
--color-success: var(--color-emerald-500);

/* Warning */
--color-warning: #f59e0b;

/* Error */
--color-error: #ef4444;
```

## Типографика

### Шрифты
```css
/* Заголовки */
font-family: 'Literata', serif;

/* Основной текст */
font-family: 'Manrope', sans-serif;
```

### Размеры
```css
/* Заголовки */
--text-h1: 3rem;      /* 48px */
--text-h2: 2.25rem;   /* 36px */
--text-h3: 1.875rem;  /* 30px */
--text-h4: 1.5rem;    /* 24px */
--text-h5: 1.25rem;   /* 20px */
--text-h6: 1.125rem;  /* 18px */

/* Основной текст */
--text-base: 1rem;    /* 16px */
--text-sm: 0.875rem;  /* 14px */
--text-xs: 0.75rem;   /* 12px */
```

### Межстрочные интервалы
```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

## Компоненты

### Кнопки
```css
/* Основная кнопка */
.btn-primary {
  background-color: var(--color-emerald-600);
  color: white;
  border-radius: 0.75rem;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary:hover {
  background-color: var(--color-emerald-700);
  transform: translateY(-1px);
}
```

### Карточки
```css
/* Карточка книги */
.book-card {
  background-color: white;
  border-radius: 1rem;
  border: 1px solid var(--color-sand-200);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.book-card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
```

### Формы
```css
/* Поле ввода */
.input {
  border: 1px solid var(--color-sand-300);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: white;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: var(--color-emerald-500);
  outline: none;
  box-shadow: 0 0 0 3px var(--color-emerald-100);
}
```

## Адаптивность

### Брейкпоинты
```css
/* Mobile first */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Размеры логотипа
```css
.logo {
  height: 2rem;        /* 32px на мобильных */
}

@media (min-width: 768px) {
  .logo {
    height: 2.5rem;    /* 40px на планшетах */
  }
}

@media (min-width: 1024px) {
  .logo {
    height: 3rem;      /* 48px на десктопе */
  }
}
```

## Доступность

### Контрастность
- Минимальный контраст 4.5:1 для обычного текста
- Минимальный контраст 3:1 для крупного текста
- Проверка через инструменты доступности

### Фокус
```css
/* Видимый фокус */
.focus-visible:focus {
  outline: 2px solid var(--color-emerald-500);
  outline-offset: 2px;
}
```

### Скринридеры
```html
<!-- Семантическая разметка -->
<header role="banner">
  <nav role="navigation" aria-label="Основная навигация">
    <img src="/brand/logo.svg" alt="Stefa.Books - Аренда детских книг" />
  </nav>
</header>
```

## Экспорт и оптимизация

### SVG
```bash
# Оптимизация SVG
npx svgo public/brand/logo.svg

# Проверка размера
ls -la public/brand/*.svg
```

### PNG/ICO
```bash
# Генерация разных размеров
convert logo.svg -resize 32x32 favicon.ico
convert logo.svg -resize 180x180 apple-touch-icon.png
convert logo.svg -resize 192x192 icon-192.png
convert logo.svg -resize 512x512 icon-512.png
```

### WebP (опционально)
```bash
# Конвертация в WebP для лучшей производительности
cwebp logo.png -o logo.webp
```

## Проверочный чек-лист

### Файлы
- [ ] `public/brand/logo.svg` создан и оптимизирован
- [ ] `public/brand/logo-dark.svg` создан
- [ ] `public/favicon.ico` (32×32) создан
- [ ] `app/icon.png` (512×512) создан
- [ ] `public/apple-touch-icon.png` (180×180) создан
- [ ] `public/icon-192.png` и `public/icon-512.png` созданы

### Интеграция
- [ ] Логотип подключен в `Header.tsx`
- [ ] Фавикон отображается в браузере
- [ ] PWA иконки работают
- [ ] OG изображения настроены

### Тестирование
- [ ] Проверка на мобильных устройствах
- [ ] Проверка на планшетах
- [ ] Проверка на десктопе
- [ ] Lighthouse тест пройден
- [ ] Контрастность соответствует стандартам

### Документация
- [ ] README обновлен
- [ ] Команда проинформирована
- [ ] Дизайн-система задокументирована
