# 🚀 Правила разработки Stefa.Books - НИКОГДА НЕ ЛОМАЙТЕ!

## 🎯 ОСНОВНЫЕ ПРИНЦИПЫ

### 1. НИКОГДА НЕ КОММИТЬТЕ БЕЗ ПРОВЕРКИ
```bash
# ОБЯЗАТЕЛЬНО перед каждым коммитом:
pnpm run deploy:check
pnpm run lint
pnpm run type-check
pnpm run build
```

### 2. ВСЕГДА ИСПОЛЬЗУЙТЕ АВТОМАТИЗИРОВАННЫЕ СКРИПТЫ
```bash
# Деплоймент ТОЛЬКО через скрипты:
pnpm run deploy:check    # Проверка готовности
pnpm run deploy          # Preview деплой
pnpm run deploy:prod     # Production деплой
```

---

## 🔧 ПРАВИЛА ДЕПЛОЙМЕНТА

### ❌ ЗАПРЕЩЕНО
- Коммитить с ошибками TypeScript
- Деплоить без проверки `pnpm run deploy:check`
- Изменять `next.config.js` без тестирования
- Игнорировать предупреждения ESLint
- Деплоить на main без тестирования на preview

### ✅ ОБЯЗАТЕЛЬНО
- Всегда тестировать локально перед коммитом
- Использовать preview деплой для тестирования
- Проверять все environment variables
- Мониторить логи после деплоя

### 🚨 КРИТИЧЕСКИЕ НАСТРОЙКИ

#### next.config.js - НЕ ТРОГАТЬ БЕЗ НЕОБХОДИМОСТИ
```javascript
// ЭТИ НАСТРОЙКИ КРИТИЧНЫ ДЛЯ РАБОТЫ:
typescript: {
  ignoreBuildErrors: true,  // НЕ УБИРАТЬ!
},
eslint: {
  ignoreDuringBuilds: true, // НЕ УБИРАТЬ!
}
```

#### package.json - КРИТИЧНЫЕ СКРИПТЫ
```json
{
  "scripts": {
    "dev": "npm run clean:cache && next dev",        // Очистка кеша
    "build": "npm run clean:cache && next build",    // Очистка кеша
    "deploy:check": "./scripts/deployment-checklist.sh", // ПРОВЕРКА
    "deploy": "./scripts/deploy.sh",                 // ДЕПЛОЙ
    "deploy:prod": "./scripts/deploy.sh --prod"      // PRODUCTION
  }
}
```

---

## 🎨 ПРАВИЛА СТИЛЕЙ И UI

### ❌ ЗАПРЕЩЕНО
- Использовать inline стили (`style={{}}`)
- Создавать новые CSS файлы без необходимости
- Изменять базовые цвета в `globals.css`
- Игнорировать responsive дизайн
- Использовать `!important` без крайней необходимости

### ✅ ОБЯЗАТЕЛЬНО
- Использовать только Tailwind CSS классы
- Следовать mobile-first подходу
- Использовать существующие компоненты из `components/ui`
- Тестировать на всех breakpoints: 320px, 768px, 1024px, 1440px

### 🎯 СИСТЕМА ЦВЕТОВ - НЕ ТРОГАТЬ!

#### Основные цвета (globals.css)
```css
:root {
  --brand: #0B1220;           /* НЕ МЕНЯТЬ! */
  --brand-yellow: #eab308;    /* НЕ МЕНЯТЬ! */
  --accent: #2563eb;          /* НЕ МЕНЯТЬ! */
}
```

#### Типографика - ИСПОЛЬЗОВАТЬ ТОЛЬКО ЭТИ КЛАССЫ
```css
.text-display    /* Главные заголовки */
.text-h1         /* H1 заголовки */
.text-h2         /* H2 заголовки */
.text-h3         /* H3 заголовки */
.text-h4         /* H4 заголовки */
.text-h5         /* H5 заголовки */
.text-h6         /* H6 заголовки */
.text-readable   /* Основной текст */
.text-body       /* Обычный текст */
.text-body-sm    /* Мелкий текст */
.text-caption    /* Подписи */
```

### 📱 RESPONSIVE ПРАВИЛА

#### Grid система для книг
```css
.books-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(1, 1fr);  /* Мобильные */
}

@media (min-width: 640px) {
  .books-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 780px) {
  .books-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1020px) {
  .books-grid { grid-template-columns: repeat(4, 1fr); }
}

@media (min-width: 1680px) {
  .books-grid { grid-template-columns: repeat(6, 1fr); }
}
```

---

## 🔐 ПРАВИЛА АДМИН ПАНЕЛИ

### ❌ ЗАПРЕЩЕНО
- Изменять логику аутентификации без тестирования
- Удалять проверки ролей
- Изменять API endpoints без обновления документации
- Игнорировать логи ошибок

### ✅ ОБЯЗАТЕЛЬНО
- Всегда проверять права доступа
- Логировать все действия админа
- Валидировать все входные данные
- Тестировать все функции админ панели

### 🛡️ СИСТЕМА БЕЗОПАСНОСТИ

#### Проверка админ прав - НЕ МЕНЯТЬ!
```typescript
// В каждом API endpoint админ панели:
const isAdminByEmail = user.email === 'admin@stefabooks.com.ua' || 
                      user.email === 'admin@stefa-books.com.ua';
const isAdminByRole = profile?.role === 'admin';

if (!isAdminByEmail && !isAdminByRole) {
  return NextResponse.json(
    { success: false, error: 'Admin access required' },
    { status: 403 }
  );
}
```

#### Логирование - ОБЯЗАТЕЛЬНО
```typescript
import { logger } from '@/lib/logger';

// Логировать все действия
logger.info('Admin action', { 
  action: 'user_created', 
  userId: user.id, 
  adminId: adminUser.id 
});
```

---

## 🗄️ ПРАВИЛА БАЗЫ ДАННЫХ

### ❌ ЗАПРЕЩЕНО
- Изменять структуру таблиц без миграций
- Удалять RLS политики
- Изменять типы данных без обновления TypeScript
- Игнорировать валидацию данных

### ✅ ОБЯЗАТЕЛЬНО
- Всегда использовать RLS
- Валидировать данные с помощью Zod
- Обновлять типы в `database.types.ts`
- Тестировать все запросы к БД

---

## 🧹 ПРАВИЛА ОЧИСТКИ СКРИПТОВ

### ❌ ЗАПРЕЩЕНО
- Оставлять временные скрипты в `scripts/`
- Коммитить тестовые файлы с результатами (`.json`)
- Хранить дублирующиеся скрипты
- Оставлять устаревшие версии скриптов

### ✅ ОБЯЗАТЕЛЬНО
- Удалять временные скрипты сразу после использования
- Очищать папку `scripts/` от ненужных файлов
- Оставлять только актуальные и используемые скрипты
- Обновлять документацию при удалении скриптов

### 🗑️ АВТОМАТИЧЕСКАЯ ОЧИСТКА

#### Категории файлов для удаления:
- **Временные скрипты** - `test-*.js`, `temp-*.js`, `debug-*.js`
- **Дублирующиеся** - `*-v2.js`, `*-backup.js`, `*-old.js`
- **Результаты выполнения** - `*-results.json`, `*-output.json`
- **Устаревшие миграции** - `migration-*.sql` (старше 30 дней)
- **Legacy папки** - `legacy/`, `old/`, `backup/`

#### Процедура очистки:
```bash
# 1. Найти временные файлы
find scripts/ -name "test-*" -o -name "temp-*" -o -name "debug-*"

# 2. Найти JSON результаты
find scripts/ -name "*-results.json" -o -name "*-output.json"

# 3. Найти дублирующиеся файлы
find scripts/ -name "*-v2.*" -o -name "*-backup.*" -o -name "*-old.*"

# 4. Удалить найденные файлы
find scripts/ -name "test-*" -o -name "temp-*" -o -name "debug-*" -o -name "*-results.json" -o -name "*-output.json" -o -name "*-v2.*" -o -name "*-backup.*" -o -name "*-old.*" -delete
```

#### Проверка перед удалением:
- Убедиться, что скрипт не используется в `package.json`
- Проверить, что скрипт не упоминается в документации
- Убедиться, что это не критичный файл

### 📋 ЧЕКЛИСТ ОЧИСТКИ СКРИПТОВ

Перед каждым коммитом проверять:
- [ ] Нет временных файлов в `scripts/`
- [ ] Нет JSON файлов с результатами
- [ ] Нет дублирующихся скриптов
- [ ] Обновлена документация при удалении
- [ ] Все оставшиеся скрипты используются

---

## 🚀 ПРОЦЕДУРА ДЕПЛОЙМЕНТА

### 1. ПОДГОТОВКА
```bash
# 1. Проверить статус
git status

# 2. Проверить готовность
pnpm run deploy:check

# 3. Локальная сборка
pnpm run build
```

### 2. ТЕСТИРОВАНИЕ
```bash
# 1. Preview деплой
pnpm run deploy

# 2. Проверить на preview URL
# 3. Протестировать все функции
# 4. Проверить админ панель
```

### 3. PRODUCTION ДЕПЛОЙ
```bash
# ТОЛЬКО после успешного тестирования preview
pnpm run deploy:prod
```

### 4. МОНИТОРИНГ
```bash
# Проверить логи
vercel logs

# Проверить статус
vercel status
```

---

## 🚨 АВАРИЙНЫЕ ПРОЦЕДУРЫ

### Если деплой сломался:
```bash
# 1. Откат к предыдущей версии
git revert HEAD
git push origin main

# 2. Или откат через Vercel
vercel rollback

# 3. Проверить логи
vercel logs --follow
```

### Если админ панель не работает:
```bash
# 1. Проверить логи
vercel logs

# 2. Проверить environment variables
vercel env ls

# 3. Перезапустить
vercel redeploy
```

### Если стили сломались:
```bash
# 1. Очистить кеш
pnpm run clean:cache

# 2. Пересобрать
pnpm run build

# 3. Проверить globals.css
```

---

## 📋 ЧЕКЛИСТ ПЕРЕД КАЖДЫМ КОММИТОМ

- [ ] `pnpm run lint` - без ошибок
- [ ] `pnpm run type-check` - без ошибок  
- [ ] `pnpm run build` - успешная сборка
- [ ] `pnpm run clean:scripts:dry` - проверить временные файлы
- [ ] `pnpm run deploy:check` - все проверки пройдены
- [ ] Тестирование на мобильных устройствах
- [ ] Проверка админ панели
- [ ] Проверка всех форм и кнопок

---

## 🎯 КРИТИЧЕСКИЕ ФАЙЛЫ - НЕ ТРОГАТЬ!

### НЕ ИЗМЕНЯТЬ БЕЗ КРАЙНЕЙ НЕОБХОДИМОСТИ:
- `next.config.js` - настройки сборки
- `globals.css` - базовые стили
- `src/middleware.ts` - аутентификация
- `src/lib/supabase.ts` - подключение к БД
- `scripts/deploy.sh` - скрипт деплоя
- `scripts/deployment-checklist.sh` - проверки

### МОЖНО ИЗМЕНЯТЬ:
- `src/components/` - компоненты UI
- `src/app/` - страницы и API
- `src/lib/types/` - типы TypeScript
- `tailwind.config.ts` - настройки Tailwind

---

## 🚀 БЫСТРЫЕ КОМАНДЫ

```bash
# Разработка
pnpm run dev                    # Запуск dev сервера
pnpm run dev:safe              # Безопасный запуск с проверками

# Проверки
pnpm run lint                  # Проверка кода
pnpm run type-check           # Проверка типов
pnpm run deploy:check         # Полная проверка готовности

# Деплоймент
pnpm run deploy               # Preview деплой
pnpm run deploy:prod          # Production деплой

# Очистка
pnpm run clean:cache          # Очистка кеша
pnpm run clean:scripts:dry    # Проверка временных скриптов (без удаления)
pnpm run clean:scripts        # Очистка временных скриптов
pnpm run clean:full           # Полная очистка
```

---

## 🎉 ПОМНИТЕ!

**Лучше потратить 10 минут на проверки, чем 2 часа на исправление сломанного деплоя!**

**Всегда тестируйте на preview перед production!**

**Если что-то не работает - проверьте логи и документацию!**

---

*Создано: 2025-01-08*  
*Версия: 1.0*  
*Статус: АКТИВНО*
