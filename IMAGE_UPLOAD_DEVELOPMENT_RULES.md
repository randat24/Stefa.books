# 📋 Правила разработки системы загрузки изображений

## 🎯 Основные принципы

### 1. **Единообразие**
Все формы загрузки изображений на сайте ДОЛЖНЫ использовать унифицированную систему:
- ✅ `/api/upload/image` - универсальный endpoint
- ✅ `/api/optimize/image` - динамическая оптимизация  
- ✅ `ImageUpload` компонент - для загрузки
- ✅ `OptimizedImage` компонент - для отображения

### 2. **Безопасность**
- Все загрузки проходят через централизованную валидацию
- Максимальный размер файла: 5MB
- Разрешенные типы: JPG, PNG, WebP, GIF
- API ключи Cloudinary хранятся только в переменных окружения

### 3. **Производительность**
- Автоматическая оптимизация для каждого типа изображения
- Автовыбор формата (WebP/AVIF для современных браузеров)
- Прогрессивная загрузка JPEG
- Responsive изображения с DPR

## 🚫 Что НЕЛЬЗЯ делать

### ❌ Прямые обращения к Cloudinary API
```typescript
// НЕПРАВИЛЬНО - прямое обращение к Cloudinary
const response = await fetch(
  `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  { method: 'POST', body: formData }
);

// ПРАВИЛЬНО - через наш API
const response = await fetch('/api/upload/image', {
  method: 'POST',
  body: formData
});
```

### ❌ Загрузка без оптимизации
```typescript
// НЕПРАВИЛЬНО - обычный img тег
<img src={imageUrl} alt="Изображение" />

// ПРАВИЛЬНО - с оптимизацией
<OptimizedImage
  publicId={imagePublicId}
  alt="Изображение"
  width={400}
  height={300}
  optimizationType="web"
/>
```

### ❌ Хардкод URL изображений
```typescript
// НЕПРАВИЛЬНО - хардкод URL
const imageUrl = "https://res.cloudinary.com/stefa-books/image/upload/v1/...";

// ПРАВИЛЬНО - использование public_id
const publicId = "stefa-books/covers/book-123";
```

## ✅ Что ДОЛЖНО быть сделано

### 1. **Использование правильных компонентов**

#### Для загрузки изображений:
```typescript
import { ImageUpload } from '@/components/ui/ImageUpload';

<ImageUpload
  uploadEndpoint="/api/upload/image"
  fieldName="file"
  type="cover" // или screenshot, avatar, general
  onImageUploaded={(url) => setImageUrl(url)}
  previewSize="md"
/>
```

#### Для отображения изображений:
```typescript
import { OptimizedImage, WebOptimizedImage } from '@/components/ui/OptimizedImage';

// Базовое использование
<OptimizedImage
  publicId="stefa-books/covers/book-123"
  alt="Обложка книги"
  width={400}
  height={600}
  optimizationType="web"
/>

// Специализированные компоненты
<WebOptimizedImage
  publicId="stefa-books/covers/book-123"
  alt="Обложка книги"
  width={400}
  height={600}
/>
```

### 2. **Правильная структура папок в Cloudinary**

```
stefa-books/
├── covers/                    # Обложки книг
├── subscription-screenshots/  # Скриншоты переводов
├── avatars/                   # Аватары пользователей
├── hero-images/              # Hero изображения
├── thumbnails/               # Миниатюры
├── documents/                # Документы
└── uploads/                  # Общие изображения
```

### 3. **Использование правильных типов оптимизации**

#### Обложки книг:
```typescript
type: 'cover'
// Оптимизация: 400x600px, progressive JPEG, auto format
```

#### Скриншоты переводов:
```typescript
type: 'screenshot'
// Оптимизация: 800x1200px, progressive JPEG, auto format
```

#### Аватары:
```typescript
type: 'avatar'
// Оптимизация: 200x200px, fill crop, face gravity, круглый
```

#### Hero изображения:
```typescript
type: 'hero'
// Оптимизация: 1920x1080px, responsive, auto gravity
```

### 4. **Правильное логирование**

```typescript
import { logger } from '@/lib/logger';

// При загрузке
logger.info('Image uploaded successfully', {
  public_id: result.public_id,
  secure_url: result.secure_url,
  size: result.bytes,
  format: result.format,
  type,
  timestamp: new Date().toISOString()
});

// При оптимизации
logger.info('Image optimized', {
  public_id,
  transformations,
  optimized_url,
  preset,
  timestamp: new Date().toISOString()
});
```

## 🔧 Добавление новых типов изображений

### 1. **Обновить конфигурацию в `/api/upload/image/route.ts`**
```typescript
const configs = {
  'new-type': {
    folder: 'stefa-books/new-type',
    transformation: [
      { 
        fetch_format: 'auto', 
        quality: 'auto:best',
        width: 500,
        height: 500,
        crop: 'limit',
        flags: ['progressive', 'strip_profile'],
        color_space: 'srgb',
        dpr: 'auto'
      }
    ],
    alt: 'Новый тип изображения'
  }
  // ... остальные конфигурации
}
```

### 2. **Создать прокси endpoint (опционально)**
```typescript
// /api/new-type/upload/route.ts
export async function POST(req: Request) {
  const formData = await req.formData();
  const newFormData = new FormData();
  newFormData.append('file', formData.get('file'));
  newFormData.append('type', 'new-type');

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: newFormData
  });

  return response;
}
```

### 3. **Использовать в компонентах**
```typescript
<ImageUpload
  uploadEndpoint="/api/new-type/upload"
  type="new-type"
  onImageUploaded={handleUpload}
/>
```

## 📊 Мониторинг и отладка

### 1. **Проверка загрузки**
```bash
# Проверить статус API
curl -X POST http://localhost:3000/api/upload/image \
  -F "file=@test-image.jpg" \
  -F "type=cover"
```

### 2. **Проверка оптимизации**
```bash
# Проверить оптимизацию
curl "http://localhost:3000/api/optimize/image?public_id=stefa-books/covers/test&width=400&height=600&preset=web"
```

### 3. **Логи в консоли**
Все операции логируются с деталями:
- Время выполнения
- Размер файла
- Формат изображения
- URL результата
- Ошибки (если есть)

## 🚀 Примеры правильной реализации

### Форма подписки с скриншотом:
```typescript
// В SubscribeFormHome.tsx
if (uploadedFile) {
  const uploadFormData = new FormData();
  uploadFormData.append('screenshot', uploadedFile);

  const uploadResponse = await fetch('/api/subscribe/upload-screenshot', {
    method: 'POST',
    body: uploadFormData
  });
  
  const result = await uploadResponse.json();
  screenshotUrl = result.secure_url;
}
```

### Админ-панель - загрузка обложек:
```typescript
// В CoverUpload.tsx
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/admin/upload/cover', {
  method: 'POST',
  body: formData
});
```

### Отображение обложек книг:
```typescript
// В BookCard.tsx
<OptimizedImage
  publicId={book.cover_public_id}
  alt={`Обложка: ${book.title}`}
  width={300}
  height={450}
  optimizationType="web"
  className="w-full h-auto rounded-lg shadow-md"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
/>
```

## 🎯 Результат

Следуя этим правилам, мы получаем:

### ✅ **Консистентность**
- Единый подход ко всем изображениям
- Стандартизированные размеры и качество
- Общий UI/UX для всех форм

### ✅ **Производительность**
- Автоматическая оптимизация
- CDN доставка
- Responsive изображения

### ✅ **Безопасность**
- Централизованная валидация
- Защищенные API ключи
- Логирование операций

### ✅ **Масштабируемость**
- Легко добавлять новые типы
- Гибкая конфигурация
- Автоматическое управление

## 📝 Чек-лист для разработчиков

Перед добавлением новой формы загрузки изображений:

- [ ] Определен тип изображения (cover, screenshot, avatar, etc.)
- [ ] Используется `ImageUpload` компонент
- [ ] Настроен правильный `uploadEndpoint`
- [ ] Добавлено логирование
- [ ] Проведено тестирование на разных размерах файлов
- [ ] Проверена работа на мобильных устройствах
- [ ] Обновлена документация (если добавлен новый тип)

Перед отображением изображений:

- [ ] Используется `OptimizedImage` компонент
- [ ] Указан правильный `publicId`
- [ ] Выбран подходящий `optimizationType`
- [ ] Добавлены правильные `alt` теги
- [ ] Настроены `sizes` для responsive
- [ ] Проверена производительность загрузки
