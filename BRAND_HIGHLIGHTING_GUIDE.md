# Фирменное выделение текста - Руководство

## Обзор

На сайте Stefa.Books реализовано фирменное выделение текста с использованием желтого цвета из брендбука. Выделение работает как автоматически (при выделении текста мышью), так и программно через компоненты и CSS классы.

## Цветовая палитра

- **Основной желтый**: `#eab308` (rgb(234 179 8))
- **Светлый желтый**: `#facc15` (rgb(250 204 21))  
- **Темный желтый**: `#ca8a04` (rgb(202 138 4))
- **Текст на желтом**: `#0B1220` (темно-синий)

## Автоматическое выделение

При выделении текста мышью автоматически применяется фирменный желтый цвет:

```css
::selection {
    background-color: var(--brand-yellow);
    color: var(--brand);
}
```

## Компонент TextHighlight

### Использование

```tsx
import TextHighlight from '@/components/ui/TextHighlight'

// Основное выделение
<TextHighlight>важный текст</TextHighlight>

// Светлое выделение
<TextHighlight variant="light">важный текст</TextHighlight>

// С дополнительными классами
<TextHighlight className="text-lg font-bold">важный текст</TextHighlight>
```

### Пропсы

- `children` - текст для выделения
- `variant` - вариант выделения: `'default'` | `'light'`
- `className` - дополнительные CSS классы

## CSS классы

### Компонентные классы

```css
.highlight {
    background-color: var(--brand-yellow);
    color: var(--brand);
    padding: 0.125em 0.25em;
    border-radius: 0.25em;
    font-weight: 500;
}

.highlight-light {
    background-color: var(--brand-yellow-light);
    color: var(--brand);
    padding: 0.125em 0.25em;
    border-radius: 0.25em;
    font-weight: 500;
}
```

### Утилитарные классы

```css
.selection-brand {
    @apply selection:bg-brand-yellow selection:text-brand;
}

.selection-brand-light {
    @apply selection:bg-brand-yellow-light selection:text-brand;
}
```

## Tailwind классы

```html
<!-- Фоны -->
<div class="bg-brand-yellow">Основной желтый</div>
<div class="bg-brand-yellow-light">Светлый желтый</div>
<div class="bg-brand-yellow-dark">Темный желтый</div>

<!-- Текст -->
<span class="text-brand">Темный текст на желтом</span>

<!-- Выделение текста -->
<p class="selection-brand">Текст с фирменным выделением</p>
```

## Примеры использования

### В кнопках и CTA

```tsx
<button className="btn-primary">
    Оформи <TextHighlight>підписку</TextHighlight> зараз
</button>
```

### В заголовках

```tsx
<h1 className="text-4xl font-bold">
    Читай <TextHighlight>легко</TextHighlight>
</h1>
```

### В описаниях

```tsx
<p className="text-lg">
    Забирай книги <TextHighlight variant="light">зручно</TextHighlight> та швидко
</p>
```

### В уведомлениях

```tsx
<div className="bg-green-50 p-4 rounded-lg">
    <p>Специальная скидка <TextHighlight>20%</TextHighlight> на первую подписку!</p>
</div>
```

## CSS переменные

```css
:root {
    --brand-yellow: #eab308;
    --brand-yellow-light: #facc15;
    --brand-yellow-dark: #ca8a04;
}
```

## Тестирование

Для тестирования выделения текста перейдите на страницу `/test-highlight`, где представлены все варианты использования.

## Рекомендации

1. **Используйте умеренно** - не перегружайте текст выделениями
2. **Выделяйте ключевые слова** - подписка, скидка, новинка
3. **Сохраняйте читаемость** - темный текст на желтом фоне
4. **Тестируйте контрастность** - убедитесь в достаточном контрасте
5. **Используйте единообразно** - применяйте одинаковые стили по всему сайту

## Доступность

- Контрастность текста на желтом фоне соответствует стандартам WCAG
- Выделение не мешает чтению основного текста
- Поддерживается всеми современными браузерами
