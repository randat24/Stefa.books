# 📚 Полный импорт книг из Google Sheets

## 🎯 Что делает скрипт

Скрипт `complete-import.js` выполняет полный цикл импорта:

1. **Получает данные** из Google Sheets
2. **Импортирует книги** в базу данных Supabase
3. **Скачивает обложки** с Google Drive
4. **Загружает обложки** в Cloudinary
5. **Обновляет ссылки** на обложки в базе данных

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd scripts/
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env.local` в папке `scripts/`:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dchx7vd97
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google Sheets Configuration
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_RANGE=Sheet1!A:Z
```

### 3. Настройка Google Sheets API

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google Sheets API
4. Создайте сервисный аккаунт
5. Скачайте JSON файл с ключами
6. Поместите файл в папку `scripts/` как `google-credentials.json`
7. Поделитесь Google таблицей с email сервисного аккаунта

### 4. Запуск импорта

```bash
node complete-import.js
```

## 📋 Структура Google таблицы

Таблица должна содержать следующие колонки:

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

## 🔧 Настройка Cloudinary

1. Зарегистрируйтесь на [Cloudinary](https://cloudinary.com/)
2. Получите API ключи в Dashboard
3. Добавьте их в `.env.local`

## 🔧 Настройка Supabase

1. Получите URL и ключи из Supabase Dashboard
2. Добавьте их в `.env.local`

## 📊 Результат

После успешного импорта:

- ✅ Все книги из Google таблицы импортированы
- ✅ Авторы созданы и связаны с книгами
- ✅ Обложки загружены в Cloudinary
- ✅ Ссылки на обложки обновлены в базе данных
- ✅ Создан файл `import-results.json` с результатами

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

## 🆘 Решение проблем

### Ошибка Google Sheets API:
- Проверьте `GOOGLE_APPLICATION_CREDENTIALS`
- Убедитесь, что API включен
- Проверьте права доступа к таблице

### Ошибка Cloudinary:
- Проверьте API ключи
- Убедитесь в правильности `cloud_name`

### Ошибка Supabase:
- Проверьте URL и ключи
- Убедитесь в правильности структуры таблиц

### Ошибка загрузки обложек:
- Проверьте доступность Google Drive ссылок
- Убедитесь, что файлы не приватные
- Проверьте размер файлов

## 📈 Статистика

После импорта у вас будет:
- Все книги из Google таблицы
- Оптимизированные обложки в Cloudinary
- Рабочий поиск и фильтрация
- Связанные авторы и категории
- Полная статистика импорта

## 🔄 Повторный импорт

Для повторного импорта:

1. Скрипт автоматически очистит существующие данные
2. Импортирует новые данные
3. Обновит обложки

⚠️ **Внимание**: Повторный импорт удалит все существующие книги!
