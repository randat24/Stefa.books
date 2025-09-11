# Stefa.Books - Единый стиль-гайд

## 🎨 Принципы дизайна

### 1. Цветовая палитра
- **Бренд**: `#F7C948` (теплый янтарный)
- **Акцент**: `#111827` (темно-серый)
- **Текст**: `#1F2937` (основной), `#6B7280` (приглушенный)
- **Поверхности**: `#FFFFFF` (карточки), `#F9FAFB` (подложка)
- **Семантика**: Success `#10B981`, Warning `#F59E0B`, Error `#EF4444`, Info `#3B82F6`

### 2. Типографика
- **Шрифт**: SF Pro Text (системный)
- **Заголовки**: 700 weight, tight line-height
- **Основной текст**: 400 weight, 1.65 line-height
- **Флюидные размеры**: clamp() для адаптивности

### 3. Радиусы и тени
- **Маленькие**: 10px
- **Средние**: 14px  
- **Большие**: 18px
- **Очень большие**: 24px
- **Тени**: мягкие, с низкой прозрачностью

## 📝 Правила использования Tailwind

### ✅ Правильно
```tsx
// Используем CSS переменные через Tailwind
className="bg-surface border-line text-text"

// Используем готовые классы из globals.css
className="card hover-lift"

// Стандартные Tailwind классы
className="flex items-center gap-4 p-4"
```

### ❌ Неправильно
```tsx
// Инлайн стили
style={{ backgroundColor: '#fff' }}

// Кастомные CSS переменные в className
className="bg-[var(--card)]"

// Смешивание разных подходов
className="bg-white border-[var(--line)]"
```

## 🧩 Компоненты

### Кнопки
```tsx
// Основная кнопка
<button className="btn btn-primary btn-md">
  Текст кнопки
</button>

// Вторичная кнопка  
<button className="btn btn-secondary btn-md">
  Текст кнопки
</button>

// Ghost кнопка
<button className="btn btn-ghost btn-md">
  Текст кнопки
</button>
```

### Карточки
```tsx
// Обычная карточка
<div className="card">
  Контент карточки
</div>

// Мягкая карточка
<div className="card-soft">
  Контент карточки
</div>
```

### Формы
```tsx
// Поле ввода
<input className="field" placeholder="Введите текст" />

// Поле с ошибкой
<input className="field is-error" />

// Поле с успехом
<input className="field is-success" />

// Метка
<label className="label">Название поля</label>

// Подсказка
<div className="help">Подсказка для пользователя</div>
```

### Алёрты
```tsx
// Успех
<div className="alert alert-success">Сообщение об успехе</div>

// Предупреждение
<div className="alert alert-warning">Предупреждение</div>

// Ошибка
<div className="alert alert-error">Сообщение об ошибке</div>

// Информация
<div className="alert alert-info">Информационное сообщение</div>
```

## 📱 Адаптивность

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1200px
- `2xl`: 1280px

### Container
```tsx
<div className="container">
  Контент с автоматическими отступами
</div>
```

### Секции
```tsx
<section className="section">
  Основная секция
</section>

<section className="section-sm">
  Маленькая секция
</section>

<section className="section-lg">
  Большая секция
</section>
```

## 🎭 Анимации

### Готовые классы
```tsx
// Появление
<div className="animate-fade-in">Контент</div>

// Подъем снизу
<div className="animate-slide-up">Контент</div>

// Масштабирование
<div className="animate-scale-in">Контент</div>

// Hover эффекты
<div className="hover-lift">Поднимается при наведении</div>

// Click эффекты
<button className="click-scale">Уменьшается при клике</button>
```

## 🔧 Утилиты

### Отступы
```tsx
// Флюидные отступы
<div className="p-fluid">Адаптивные отступы</div>
<div className="m-fluid">Адаптивные маргины</div>
<div className="gap-fluid">Адаптивные промежутки</div>
```

### Обрезка текста
```tsx
<h1 className="line-clamp-1">Однострочный заголовок</h1>
<p className="line-clamp-2">Двухстрочный текст</p>
<p className="line-clamp-3">Трехстрочный текст</p>
```

### Скелетоны
```tsx
<div className="skel">Загрузочная полоса</div>
```

## 📋 Чек-лист для компонентов

- [ ] Используются только CSS переменные через Tailwind
- [ ] Нет инлайн стилей
- [ ] Нет кастомных CSS переменных в className
- [ ] Используются готовые классы из globals.css
- [ ] Добавлены hover и focus состояния
- [ ] Поддержка темной темы (если нужно)
- [ ] Адаптивность для всех экранов
- [ ] Accessibility атрибуты
- [ ] Семантические HTML теги
