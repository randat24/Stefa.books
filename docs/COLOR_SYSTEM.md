# Stefa.Books Color System (Light‑only, WCAG 2.1 AA)

> **Статус:** ✅ Реализовано | **Версия:** 2.0 | **Дата:** 2025-01-09

## 🎯 Принципы

- **Приоритет читаемости** и спокойных поверхностей
- **Семантические токены** вместо хардкода hex-значений
- **Tailwind theme aliases** (brand, accent, success, error, info, neutral)
- **WCAG 2.1 AA** контрастность (≥ 4.5:1 для обычного текста)

## 🎨 Цветовые палитры

Определены в `globals.css` через CSS переменные. Сопоставлены в `tailwind.config.ts`.

### 🎯 Brand Colors (Основные)
```css
--brand-primary: #2563eb        /* Blue 600 - основной бренд */
--brand-primary-50: #eff6ff     /* Светлый фон */
--brand-primary-100: #dbeafe    /* Очень светлый */
--brand-primary-500: #3b82f6    /* Средний */
--brand-primary-700: #1d4ed8    /* Темный */
--brand-primary-900: #1e3a8a    /* Очень темный */
```

### 🌟 Accent Colors (Акценты)
```css
--accent-warm: #f59e0b          /* Amber 500 - теплый акцент */
--accent-warm-50: #fffbeb       /* Светлый фон */
--accent-warm-100: #fef3c7      /* Очень светлый */
--accent-warm-700: #d97706      /* Темный */
--accent-warm-900: #92400e      /* Очень темный */
```

### ✅ Semantic Colors (Семантические)
```css
--success: #10b981              /* Emerald 500 - успех */
--warning: #f59e0b              /* Amber 500 - предупреждение */
--error: #ef4444                /* Red 500 - ошибка */
--info: #06b6d4                 /* Cyan 500 - информация */
```

### ⚫ Neutral Colors (Нейтральные)
```css
--neutral-0: #ffffff            /* Белый */
--neutral-50: #fafafa           /* Очень светлый серый */
--neutral-100: #f5f5f5          /* Светлый серый */
--neutral-200: #e5e5e5          /* Границы */
--neutral-300: #d4d4d4          /* Слабые границы */
--neutral-400: #a3a3a3          /* Отключенный текст */
--neutral-500: #737373          /* Вторичный текст */
--neutral-600: #525252          /* Вторичный текст */
--neutral-700: #404040          /* Основной текст */
--neutral-800: #262626          /* Темный текст */
--neutral-900: #171717          /* Очень темный текст */
```

## 🎯 Использование в компонентах

### 📝 Текст и поверхности
```tsx
// Основной текст
<h1 className="text-neutral-900">Заголовок</h1>

// Вторичный текст
<p className="text-neutral-600">Описание</p>

// Отключенный текст
<span className="text-neutral-300">Недоступно</span>

// Поверхности
<div className="bg-neutral-0">Белая поверхность</div>
<div className="bg-neutral-50">Светлая поверхность</div>
<div className="bg-neutral-100">Серая поверхность</div>

// Границы
<div className="border border-neutral-200">Стандартная граница</div>
<div className="border border-neutral-300">Выделенная граница</div>
```

### 🎨 Brand и действия
```tsx
// Основное действие
<button className="bg-brand text-white hover:bg-brand-700">
  Основная кнопка
</button>

// Вторичное действие
<button className="bg-neutral-0 text-neutral-900 border border-neutral-300 hover:bg-neutral-50">
  Вторичная кнопка
</button>

// Акцентное действие
<button className="bg-accent text-white hover:bg-accent-700">
  Акцентная кнопка
</button>
```

### 📊 Обратная связь
```tsx
// Успех
<div className="bg-success-50 text-success-900 border border-success-100">
  Операция выполнена успешно
</div>

// Предупреждение
<div className="bg-warning-50 text-warning-900 border border-warning-100">
  Внимание!
</div>

// Ошибка
<div className="bg-error-50 text-error-900 border border-error-100">
  Произошла ошибка
</div>

// Информация
<div className="bg-info-50 text-info-900 border border-info-100">
  Полезная информация
</div>
```

## 🛠️ Семантические утилиты

Доступны готовые семантические классы:

```tsx
// Текст
<p className="text-readable">Основной читаемый текст</p>
<p className="text-muted">Приглушенный текст</p>
<p className="text-subtle">Тонкий текст</p>
<p className="text-disabled">Отключенный текст</p>

// Поверхности
<div className="surface">Основная поверхность</div>
<div className="surface-subtle">Приглушенная поверхность</div>
<div className="surface-raised">Приподнятая поверхность</div>

// Фокус
<button className="focus-ring">Кнопка с фокусом</button>
```

## 📱 Адаптивность

Цветовая система полностью адаптивна:

```tsx
// Адаптивные цвета
<div className="bg-neutral-0 md:bg-neutral-50">
  Адаптивный фон
</div>

// Адаптивный текст
<h1 className="text-neutral-900 md:text-neutral-800">
  Адаптивный заголовок
</h1>
```

## ✅ Правила использования

### ✅ Do (Рекомендуется)
- Используйте `brand/*`, `neutral/*`, `success/*` из Tailwind mapping
- Поддерживайте контраст ≥ 4.5:1 для основного текста
- Используйте семантические утилиты где возможно
- Тестируйте на разных устройствах

### ❌ Don't (Не рекомендуется)
- Не переопределяйте Tailwind core utilities глобально
- Не смешивайте произвольные hex-значения с токенами
- Не используйте устаревшие `gray-*` классы
- Не игнорируйте accessibility

## 🔧 Миграция

### Автоматическая миграция
```bash
# DRY RUN (просмотр изменений)
DRY_RUN=1 bash scripts/apply-color-system.sh

# Реальная миграция
DRY_RUN= bash scripts/apply-color-system.sh
```

### Ручная миграция
```tsx
// Было
<div className="bg-gray-100 text-gray-900 border-gray-200">

// Стало
<div className="bg-neutral-100 text-neutral-900 border-neutral-200">
```

## 🧪 Тестирование

### Чеклист QA
- [ ] Визуальная проверка: кнопки, инпуты, карточки, ссылки
- [ ] Проверка контрастности для body (neutral-900 на neutral-0)
- [ ] Hover/focus состояния видны с клавиатуры
- [ ] Нет регрессий в shadcn/ui примитивах
- [ ] Мобильная версия работает корректно

### Инструменты
- **Contrast Checker:** [WebAIM](https://webaim.org/resources/contrastchecker/)
- **Color Blindness:** [Sim Daltonism](https://michelf.ca/projects/sim-daltonism/)
- **Accessibility:** [axe DevTools](https://www.deque.com/axe/devtools/)

## 🚀 Будущие улучшения

### Темная тема (планируется)
```css
[data-theme="dark"] {
  --text-primary: var(--neutral-0);
  --bg-primary: var(--neutral-900);
  /* ... */
}
```

### Дополнительные токены
- Цвета для состояний (loading, disabled)
- Специальные цвета для категорий книг
- Градиенты и тени

## 📚 Ресурсы

- **Tailwind CSS:** [Документация](https://tailwindcss.com/docs/customizing-colors)
- **WCAG 2.1:** [Руководство](https://www.w3.org/WAI/WCAG21/quickref/)
- **Color Theory:** [Основы](https://color.adobe.com/create/color-wheel)

---

**Последнее обновление:** 2025-01-09  
**Версия:** 2.0  
**Статус:** ✅ Production Ready