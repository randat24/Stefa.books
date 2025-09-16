# 🖼️ Унифицированная система загрузки изображений

## 📋 Обзор

Все формы загрузки изображений на сайте теперь работают через единую систему с Cloudinary интеграцией. Это обеспечивает консистентность, безопасность и оптимизацию всех загружаемых изображений.

## 🎯 Принципы работы

### 1. **Единый API endpoint**
Все загрузки изображений проходят через `/api/upload/image` с указанием типа:
- `cover` - обложки книг
- `screenshot` - скриншоты переводов
- `avatar` - аватары пользователей  
- `general` - общие изображения

### 2. **Автоматическая оптимизация**
- Автовыбор формата (WebP для современных браузеров)
- Адаптивное качество
- Масштабирование до оптимальных размеров
- CDN доставка по всему миру

### 3. **Безопасность**
- Валидация типов файлов
- Ограничение размера (5MB)
- Защищенные API ключи
- Логирование всех операций

## 🛠️ Компоненты системы

### 1. **Универсальный компонент ImageUpload**
```typescript
import { ImageUpload } from '@/components/ui/ImageUpload';

<ImageUpload
  currentImageUrl={currentUrl}
  onImageUploaded={(url) => setImageUrl(url)}
  onImageRemoved={() => setImageUrl('')}
  uploadEndpoint="/api/upload/image"
  fieldName="file"
  type="cover" // или screenshot, avatar, general
  previewSize="md"
  placeholder="Загрузить обложку книги"
/>
```

### 2. **API endpoints**

#### `/api/upload/image` - Универсальный endpoint
```typescript
// POST /api/upload/image
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'cover'); // cover, screenshot, avatar, general

const response = await fetch('/api/upload/image', {
  method: 'POST',
  body: formData
});
```

#### `/api/admin/upload/cover` - Прокси для обложек
- Перенаправляет запросы к `/api/upload/image` с типом `cover`
- Сохраняет обратную совместимость

#### `/api/subscribe/upload-screenshot` - Прокси для скриншотов
- Перенаправляет запросы к `/api/upload/image` с типом `screenshot`
- Используется в формах подписки

## 📁 Структура папок в Cloudinary

```
stefa-books/
├── covers/                    # Обложки книг (400x600px)
├── subscription-screenshots/  # Скриншоты переводов (800x1200px)
├── avatars/                   # Аватары пользователей (200x200px)
└── uploads/                   # Общие изображения (1000x1000px)
```

## 🎨 Конфигурации оптимизации

### Обложки книг (`cover`)
```typescript
{
  width: 400,
  height: 600,
  crop: 'limit',
  quality: 'auto:best',
  format: 'auto'
}
```

### Скриншоты переводов (`screenshot`)
```typescript
{
  width: 800,
  height: 1200,
  crop: 'limit',
  quality: 'auto:best',
  format: 'auto'
}
```

### Аватары (`avatar`)
```typescript
{
  width: 200,
  height: 200,
  crop: 'fill',
  gravity: 'face',
  quality: 'auto:best',
  format: 'auto'
}
```

## 🔧 Использование в компонентах

### 1. **Форма подписки с скриншотом**
```typescript
// В SubscribeFormHome.tsx и SubscribeModal.tsx
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

### 2. **Админ-панель - загрузка обложек**
```typescript
// В CoverUpload.tsx
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/admin/upload/cover', {
  method: 'POST',
  body: formData
});
```

### 3. **Универсальный компонент**
```typescript
// Для любых новых форм
<ImageUpload
  uploadEndpoint="/api/upload/image"
  fieldName="file"
  type="general"
  onImageUploaded={handleImageUploaded}
  previewSize="lg"
/>
```

## 📊 Преимущества системы

### ✅ **Консистентность**
- Единый подход ко всем загрузкам
- Стандартизированные размеры и качество
- Общий UI/UX для всех форм

### ✅ **Производительность**
- Автоматическая оптимизация изображений
- CDN доставка через Cloudinary
- Ленивая загрузка и кэширование

### ✅ **Безопасность**
- Централизованная валидация
- Защищенные API ключи
- Логирование всех операций

### ✅ **Масштабируемость**
- Легко добавлять новые типы изображений
- Гибкая конфигурация оптимизации
- Автоматическое управление папками

## 🚀 Добавление новых типов изображений

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
        crop: 'fill'
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

## 🔍 Мониторинг и логирование

Все операции загрузки логируются с деталями:
```typescript
logger.info('Image uploaded successfully', {
  public_id: result.public_id,
  secure_url: result.secure_url,
  size: result.bytes,
  format: result.format,
  type,
  folder: uploadConfig.folder,
  timestamp: new Date().toISOString()
});
```

## 📝 Примеры использования

### Форма с загрузкой аватара
```typescript
const [avatarUrl, setAvatarUrl] = useState('');

<ImageUpload
  currentImageUrl={avatarUrl}
  onImageUploaded={setAvatarUrl}
  uploadEndpoint="/api/upload/image"
  fieldName="file"
  type="avatar"
  placeholder="Загрузить аватар"
  previewSize="sm"
/>
```

### Форма с загрузкой документа
```typescript
<ImageUpload
  uploadEndpoint="/api/upload/image"
  fieldName="document"
  type="general"
  acceptedTypes="image/*,.pdf"
  maxFileSize={10 * 1024 * 1024} // 10MB
  placeholder="Загрузить документ"
/>
```

## 🚀 Продвинутые возможности оптимизации

### 1. **API оптимизации изображений**

#### `/api/optimize/image` - Динамическая оптимизация
```typescript
// GET запрос с параметрами
const params = new URLSearchParams({
  public_id: 'stefa-books/covers/book-123',
  width: '400',
  height: '600',
  quality: 'auto:best',
  format: 'auto',
  preset: 'web'
});

const response = await fetch(`/api/optimize/image?${params}`);
const result = await response.json();
// result.optimized_url содержит оптимизированный URL
```

#### POST запрос для кастомных трансформаций
```typescript
const response = await fetch('/api/optimize/image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    public_id: 'stefa-books/covers/book-123',
    transformations: [
      { width: 400, height: 600, crop: 'fill', gravity: 'auto' },
      { quality: 'auto:best', fetch_format: 'webp' },
      { effect: 'sharpen', radius: 2 }
    ],
    preset: 'web'
  })
});
```

### 2. **Предустановленные оптимизации**

#### Web оптимизация
```typescript
{
  fetch_format: 'auto',
  quality: 'auto:good',
  flags: ['progressive', 'strip_profile'],
  color_space: 'srgb',
  dpr: 'auto'
}
```

#### Mobile оптимизация
```typescript
{
  fetch_format: 'auto',
  quality: 'auto:best',
  flags: ['progressive', 'strip_profile'],
  color_space: 'srgb',
  dpr: 'auto',
  responsive: true
}
```

#### Print оптимизация
```typescript
{
  fetch_format: 'auto',
  quality: 'auto:best',
  flags: ['strip_profile'],
  color_space: 'srgb',
  dpr: 'auto'
}
```

#### Social оптимизация
```typescript
{
  fetch_format: 'auto',
  quality: 'auto:good',
  flags: ['progressive', 'strip_profile'],
  color_space: 'srgb',
  dpr: 'auto',
  gravity: 'auto'
}
```

### 3. **Компонент OptimizedImage**

#### Базовое использование
```typescript
import { OptimizedImage } from '@/components/ui/OptimizedImage';

<OptimizedImage
  publicId="stefa-books/covers/book-123"
  alt="Обложка книги"
  width={400}
  height={600}
  optimizationType="web"
  className="rounded-lg shadow-md"
/>
```

#### Специализированные компоненты
```typescript
import { 
  WebOptimizedImage,
  MobileOptimizedImage,
  PrintOptimizedImage,
  SocialOptimizedImage 
} from '@/components/ui/OptimizedImage';

// Для веб-сайта
<WebOptimizedImage
  publicId="stefa-books/covers/book-123"
  alt="Обложка книги"
  width={400}
  height={600}
/>

// Для мобильных устройств
<MobileOptimizedImage
  publicId="stefa-books/covers/book-123"
  alt="Обложка книги"
  width={200}
  height={300}
/>

// Для печати
<PrintOptimizedImage
  publicId="stefa-books/covers/book-123"
  alt="Обложка книги"
  width={600}
  height={900}
/>

// Для социальных сетей
<SocialOptimizedImage
  publicId="stefa-books/covers/book-123"
  alt="Обложка книги"
  width={400}
  height={400}
/>
```

#### Кастомные трансформации
```typescript
<OptimizedImage
  publicId="stefa-books/covers/book-123"
  alt="Обложка книги"
  width={400}
  height={600}
  optimizationType="custom"
  customTransformations={{
    width: 400,
    height: 600,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:best',
    effect: 'sharpen',
    radius: 2,
    border: '2px_solid_rgb:ffffff'
  }}
/>
```

### 4. **Новые типы изображений**

#### Hero изображения
```typescript
// В конфигурации upload
'hero': {
  folder: 'stefa-books/hero-images',
  transformation: [
    { 
      fetch_format: 'auto', 
      quality: 'auto:best',
      width: 1920,
      height: 1080,
      crop: 'limit',
      flags: ['progressive', 'strip_profile'],
      color_space: 'srgb',
      dpr: 'auto',
      responsive: true,
      gravity: 'auto'
    }
  ],
  alt: 'Hero зображення Stefa.books'
}
```

#### Миниатюры
```typescript
'thumbnail': {
  folder: 'stefa-books/thumbnails',
  transformation: [
    { 
      fetch_format: 'auto', 
      quality: 'auto:good',
      width: 150,
      height: 150,
      crop: 'fill',
      gravity: 'center',
      flags: ['progressive', 'strip_profile'],
      color_space: 'srgb',
      radius: 8
    }
  ],
  alt: 'Мініатюра Stefa.books'
}
```

#### Документы
```typescript
'document': {
  folder: 'stefa-books/documents',
  transformation: [
    { 
      fetch_format: 'auto', 
      quality: 'auto:best',
      width: 1200,
      height: 1600,
      crop: 'limit',
      flags: ['progressive', 'strip_profile'],
      color_space: 'srgb',
      dpr: 'auto'
    }
  ],
  alt: 'Документ Stefa.books'
}
```

### 5. **Продвинутые трансформации Cloudinary**

#### Флаги оптимизации
```typescript
flags: [
  'progressive',      // Прогрессивная загрузка JPEG
  'strip_profile',    // Удаление ICC профилей
  'immutable_cache'   // Неизменяемый кэш
]
```

#### Автоматические параметры
```typescript
{
  fetch_format: 'auto',    // Автовыбор формата (WebP/AVIF)
  quality: 'auto:best',    // Адаптивное качество
  dpr: 'auto',            // Автоматический DPR
  responsive: true        // Responsive изображения
}
```

#### Эффекты и фильтры
```typescript
{
  effect: 'sharpen',      // Повышение резкости
  radius: 2,              // Радиус эффекта
  gravity: 'auto',        // Автоопределение фокуса
  border: '2px_solid_rgb:ffffff'  // Рамка
}
```

### 6. **Использование в проекте**

#### Обложки книг с автооптимизацией
```typescript
// В BookCard.tsx
<OptimizedImage
  publicId={book.cover_public_id}
  alt={`Обложка: ${book.title}`}
  width={300}
  height={450}
  optimizationType="web"
  className="w-full h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
/>
```

#### Hero изображения для главной страницы
```typescript
// В Hero секции
<OptimizedImage
  publicId="stefa-books/hero-images/main-hero"
  alt="Stefa.books - детские книги"
  width={1920}
  height={1080}
  optimizationType="web"
  priority={true}
  className="w-full h-screen object-cover"
/>
```

#### Аватары с автоопределением лица
```typescript
// В профиле пользователя
<OptimizedImage
  publicId={user.avatar_public_id}
  alt={`Аватар ${user.name}`}
  width={100}
  height={100}
  optimizationType="web"
  customTransformations={{
    width: 100,
    height: 100,
    crop: 'fill',
    gravity: 'face',
    radius: 'max'
  }}
  className="rounded-full border-2 border-white shadow-md"
/>
```

## 🎯 Результат

Теперь система загрузки изображений включает:

### ✅ **Базовая функциональность**
- Форма подписки с скриншотами переводов
- Админ-панель для загрузки обложек книг
- Универсальный компонент для новых форм
- Автоматическая оптимизация и CDN доставка
- Централизованная валидация и безопасность

### 🚀 **Продвинутые возможности**
- Динамическая оптимизация через API
- Предустановленные оптимизации (web, mobile, print, social)
- Кастомные трансформации Cloudinary
- Специализированные компоненты для разных типов
- Автоматический выбор формата (WebP/AVIF)
- Responsive изображения с DPR
- Прогрессивная загрузка
- Автоопределение фокуса и лица
- Эффекты и фильтры
- Неизменяемый кэш для производительности

### 📊 **Преимущества**
- **Производительность**: Автоматическая оптимизация для каждого устройства
- **Гибкость**: Кастомные трансформации для любых потребностей
- **Масштабируемость**: Легко добавлять новые типы оптимизации
- **UX**: Прогрессивная загрузка и blur placeholder
- **SEO**: Правильные alt теги и размеры
- **Мониторинг**: Подробное логирование всех операций
