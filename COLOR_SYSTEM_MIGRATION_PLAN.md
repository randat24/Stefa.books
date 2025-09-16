# Stefa.Books — План миграции цветовой системы (v2)

> **Статус:** Аудит завершен, план готов к выполнению  
> **Дата:** 2025-01-09  
> **Цель:** Мигрировать 1551 использование `gray-*` классов на новую систему

## 📊 Текущее состояние

### ✅ Уже реализовано
- **CSS переменные:** Полная система в `globals.css` (строки 6-100)
- **Tailwind mapping:** Настроен в `tailwind.config.ts` (строки 12-78)
- **Семантические утилиты:** Добавлены в `globals.css` (строки 780-796)
- **Примеры компонентов:** Созданы в `src/components/examples/`

### ❌ Требует миграции
- **1551 использование** `gray-*` классов в **136 файлах**
- **159 использование** `brand-*` классов (частично устаревших)
- **Только 42 использования** новых `neutral-*` классов

## 🎯 Стратегия миграции

### Этап 1: Подготовка (5 мин)
1. Создать backup ветку
2. Запустить DRY_RUN миграции
3. Проанализировать результаты

### Этап 2: Массовая миграция (15 мин)
1. Запустить автоматическую замену `gray-*` → `neutral-*`
2. Запустить замену устаревших `brand-*` → новые токены
3. Проверить критические компоненты

### Этап 3: Ручная доработка (20 мин)
1. Исправить специфичные случаи
2. Обновить компоненты с хардкодом цветов
3. Проверить accessibility

### Этап 4: Тестирование (10 мин)
1. Визуальная проверка всех страниц
2. Проверка контрастности
3. Тестирование на мобильных

## 🔧 Команды для выполнения

```bash
# 1. Создать backup
git checkout -b color-system-migration-$(date +%Y%m%d)

# 2. DRY RUN миграции
DRY_RUN=1 bash scripts/apply-color-system.sh

# 3. Запустить миграцию
DRY_RUN= bash scripts/apply-color-system.sh

# 4. Проверить результат
pnpm type-check && pnpm lint && pnpm build
```

## 📋 Маппинг классов

### Основные замены
```css
/* Старые → Новые */
text-gray-900 → text-neutral-900
text-gray-800 → text-neutral-800
text-gray-700 → text-neutral-700
text-gray-600 → text-neutral-600
text-gray-500 → text-neutral-500
text-gray-400 → text-neutral-400
text-gray-300 → text-neutral-300
text-gray-200 → text-neutral-200
text-gray-100 → text-neutral-100
text-gray-50 → text-neutral-50

bg-gray-900 → bg-neutral-900
bg-gray-800 → bg-neutral-800
bg-gray-700 → bg-neutral-700
bg-gray-600 → bg-neutral-600
bg-gray-500 → bg-neutral-500
bg-gray-400 → bg-neutral-400
bg-gray-300 → bg-neutral-300
bg-gray-200 → bg-neutral-200
bg-gray-100 → bg-neutral-100
bg-gray-50 → bg-neutral-50

border-gray-900 → border-neutral-900
border-gray-800 → border-neutral-800
border-gray-700 → border-neutral-700
border-gray-600 → border-neutral-600
border-gray-500 → border-neutral-500
border-gray-400 → border-neutral-400
border-gray-300 → border-neutral-300
border-gray-200 → border-neutral-200
border-gray-100 → border-neutral-100
border-gray-50 → border-neutral-50
```

### Семантические замены
```css
/* Семантические утилиты */
.text-readable → .text-readable (уже есть)
.text-muted → .text-muted (уже есть)
.text-subtle → .text-subtle (уже есть)
.text-disabled → .text-disabled (уже есть)

.surface → .surface (уже есть)
.surface-subtle → .surface-subtle (уже есть)
.surface-raised → .surface-raised (уже есть)
```

## 🚨 Критические компоненты для проверки

1. **Header** (`src/components/Header.tsx`)
2. **BookCard** (`src/components/BookCard.tsx`)
3. **Button** (`src/components/ui/button.tsx`)
4. **Chip** (`src/components/ui/chip.tsx`)
5. **AnimatedButton** (`src/components/forms/AnimatedButton.tsx`)
6. **Categories** (`src/components/sections/Categories.tsx`)

## 📝 Чеклист после миграции

- [ ] Все `gray-*` классы заменены на `neutral-*`
- [ ] Устаревшие `brand-*` классы обновлены
- [ ] Контрастность соответствует WCAG 2.1 AA
- [ ] Мобильная версия работает корректно
- [ ] TypeScript компилируется без ошибок
- [ ] ESLint проходит без ошибок
- [ ] Build проходит успешно
- [ ] Визуальная проверка всех страниц

## 🔄 Rollback план

Если что-то пойдет не так:
```bash
git checkout main
git branch -D color-system-migration-$(date +%Y%m%d)
```

## 📊 Ожидаемые результаты

- **Уменьшение** использования `gray-*` классов с 1551 до 0
- **Увеличение** использования `neutral-*` классов с 42 до 1500+
- **Улучшение** консистентности цветовой системы
- **Готовность** к будущему добавлению темной темы
