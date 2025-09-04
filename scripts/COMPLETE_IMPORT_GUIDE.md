# 📚 Полный импорт книг из Google таблицы

## 🎯 Цель
Импортировать все книги из Google таблицы с автоматической загрузкой обложек в Cloudinary.

## 📋 Пошаговая инструкция

### 1. Настройка переменных окружения

Создайте файл `.env` в папке `scripts/`:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dchx7vd97
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google Sheets Configuration
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google-credentials.json
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_RANGE=Sheet1!A:Z
```

### 2. Установка зависимостей

```bash
cd scripts/
npm install
```

### 3. Получение данных из Google таблицы

```bash
node fetch-google-sheets.js
```

Это создаст файл `import-from-google-sheets-generated.sql` с данными из вашей таблицы.

### 4. Импорт книг в базу данных

Выполните созданный SQL файл в Supabase:

```sql
scripts/import-from-google-sheets-generated.sql
```

### 5. Автоматическая загрузка обложек

```bash
node auto-upload-covers.js
```

## 🔧 Настройка Google таблицы

### Структура колонок:

| Колонка | Описание | Пример |
|---------|----------|---------|
| Код книги | Уникальный код | 7873 |
| Название | Полное название | Ким хотіла бути Панда? |
| Автор | Имя автора | Світлана Мирошниченко |
| Категорія | Категории через запятую | Пригоди, молодший вік |
| Опис | Полное описание | Повна опис книги... |
| ISBN | Международный номер | 978-966-942-123-4 |
| Сторінки | Количество страниц | 32 |
| Вік | Возрастная категория | 3-6 років |
| Мова | Язык книги | uk |
| Видавництво | Издательство | Віват |
| Рік | Год издания | 2023 |
| Фото (URL) | Ссылка на обложку | https://drive.google.com/... |
| Ціна | Цена в гривнах | 240.00 |

## 📊 Результат

После успешного импорта:

- ✅ Все книги из Google таблицы
- ✅ Правильно разделенные категории
- ✅ Обложки загружены в Cloudinary
- ✅ Авторы созданы и связаны
- ✅ Рабочий поиск
- ✅ Статистика импорта

## 🔍 Проверка результата

```sql
-- Проверка количества книг
SELECT COUNT(*) FROM public.books;

-- Проверка обложек
SELECT 
    code,
    title,
    CASE 
        WHEN cover_url LIKE '%cloudinary.com%' THEN 'Cloudinary'
        WHEN cover_url LIKE '%drive.google.com%' THEN 'Google Drive'
        ELSE 'Other'
    END as cover_source
FROM public.books
LIMIT 10;

-- Проверка авторов
SELECT 
    name,
    COUNT(*) as book_count
FROM public.authors a
JOIN public.book_authors ba ON a.id = ba.author_id
GROUP BY a.name
ORDER BY book_count DESC
LIMIT 10;
```

## 🚨 Важные моменты

1. **Категории** - автоматически разделяются по запятым
2. **Обложки** - автоматически загружаются в Cloudinary
3. **Поиск** - автоматически создается search_vector
4. **Авторы** - автоматически создаются и связываются
5. **ID** - автоматически генерируются UUID

## 🆘 Решение проблем

### Ошибка Google Sheets API:
- Проверьте GOOGLE_APPLICATION_CREDENTIALS
- Убедитесь, что API включен
- Проверьте права доступа к таблице

### Ошибка Cloudinary:
- Проверьте API ключи
- Убедитесь в правильности cloud_name

### Ошибка Supabase:
- Проверьте URL и ключи
- Убедитесь в правильности структуры таблиц

## 📈 Статистика

После импорта у вас будет:
- Все книги из Google таблицы
- Оптимизированные обложки в Cloudinary
- Рабочий поиск и фильтрация
- Связанные авторы и категории
