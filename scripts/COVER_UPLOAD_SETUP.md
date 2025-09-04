# 🖼️ Настройка загрузки обложек в Cloudinary

## 🎯 Цель
Автоматически загрузить все обложки с Google Drive в Cloudinary.

## 📋 Пошаговая инструкция

### 1. Удаление существующих обложек
```sql
scripts/delete-existing-covers.sql
```

### 2. Настройка переменных окружения

Создайте файл `.env` в папке `scripts/`:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dchx7vd97
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google Drive Configuration
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google-credentials.json
```

### 3. Получение API ключей

#### Cloudinary:
1. Зайдите в [Cloudinary Dashboard](https://cloudinary.com/console)
2. Скопируйте:
   - Cloud Name
   - API Key
   - API Secret

#### Google Drive:
1. Зайдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте проект или выберите существующий
3. Включите Google Drive API
4. Создайте Service Account
5. Скачайте JSON файл с ключами
6. Поместите файл в папку `scripts/`

### 4. Установка зависимостей
```bash
cd scripts/
npm install
```

### 5. Запуск загрузки
```bash
npm run upload
```

## 🔧 Настройка скрипта

### Обновите массив книг в `upload-covers.js`:

```javascript
const books = [
  {
    id: 'book1',
    code: '7873',
    title: 'Ким хотіла бути Панда?',
    cover_url: 'https://drive.google.com/file/d/1ABC123/view'
  },
  {
    id: 'book2',
    code: '5560',
    title: 'Котигорошко',
    cover_url: 'https://drive.google.com/file/d/1DEF456/view'
  }
  // Добавьте все ваши книги
];
```

### Или подключите к базе данных:

```javascript
// Подключение к Supabase
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Получение книг из базы данных
const { data: books, error } = await supabase
  .from('books')
  .select('id, code, title, cover_url')
  .not('cover_url', 'is', null);
```

## 📊 Результат

После успешной загрузки:
- ✅ Все обложки в Cloudinary
- ✅ URL обновлены в базе данных
- ✅ Оптимизированные изображения (300x400px)
- ✅ Автоматическое сжатие

## 🚨 Важные моменты

1. **Размер файлов** - Cloudinary автоматически оптимизирует
2. **Формат** - поддерживаются JPG, PNG, WebP
3. **Лимиты** - проверьте лимиты Cloudinary
4. **Безопасность** - не коммитьте .env файл

## 🔍 Проверка результата

```sql
-- Проверка обложек
SELECT 
    code,
    title,
    cover_url,
    CASE 
        WHEN cover_url LIKE '%cloudinary.com%' THEN 'Cloudinary'
        WHEN cover_url LIKE '%drive.google.com%' THEN 'Google Drive'
        ELSE 'Other'
    END as source
FROM public.books
WHERE cover_url IS NOT NULL
ORDER BY code;
```

## 🆘 Решение проблем

### Ошибка аутентификации Google:
- Проверьте путь к credentials.json
- Убедитесь, что API включен

### Ошибка Cloudinary:
- Проверьте API ключи
- Убедитесь в правильности cloud_name

### Ошибка загрузки файла:
- Проверьте доступность Google Drive файла
- Убедитесь в правильности URL
