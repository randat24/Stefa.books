# 🚀 Быстрый старт - Импорт книг

## Что нужно сделать

1. **Настроить переменные окружения**
2. **Установить зависимости** 
3. **Протестировать подключения**
4. **Запустить импорт**

## 📋 Пошаговая инструкция

### 1. Настройка переменных окружения

Создайте файл `.env.local` в папке `scripts/`:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary  
CLOUDINARY_CLOUD_NAME=dchx7vd97
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google Sheets
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_RANGE=Sheet1!A:Z
```

### 2. Настройка Google Sheets API

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте проект или выберите существующий
3. Включите Google Sheets API
4. Создайте сервисный аккаунт
5. Скачайте JSON файл с ключами
6. Поместите файл в папку `scripts/` как `google-credentials.json`
7. Поделитесь Google таблицей с email сервисного аккаунта

### 3. Установка зависимостей

```bash
cd scripts/
npm install
```

### 4. Тестирование подключений

```bash
npm test
```

Или:

```bash
node test-connections.js
```

### 5. Запуск импорта

```bash
npm run import
```

Или:

```bash
node complete-import.js
```

## ✅ Результат

После успешного импорта:

- ✅ Все книги из Google таблицы импортированы в Supabase
- ✅ Обложки загружены в Cloudinary
- ✅ Ссылки на обложки обновлены в базе данных
- ✅ Авторы созданы и связаны с книгами
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
```

## 🆘 Если что-то пошло не так

1. **Проверьте переменные окружения** - все ли правильно настроены
2. **Проверьте Google credentials** - файл существует и доступен
3. **Проверьте права доступа** - сервисный аккаунт имеет доступ к таблице
4. **Проверьте API ключи** - Cloudinary и Supabase ключи действительны

## 📞 Поддержка

Если возникли проблемы, проверьте:
- Файл `IMPORT_INSTRUCTIONS.md` для подробной инструкции
- Логи выполнения скрипта
- Настройки в Google Cloud Console
- Права доступа к таблице
