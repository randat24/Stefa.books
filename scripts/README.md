# 📚 Скрипты для импорта книг

## 🎯 Назначение
Набор скриптов для полного импорта всех книг из Google таблицы в базу данных с автоматической загрузкой обложек в Cloudinary.

## 📁 Структура файлов

### Основные скрипты:
- **`complete-import.js`** - Полный импорт: Google Sheets → Supabase → Cloudinary
- **`quick-import.js`** - Создает SQL файл для импорта книг
- **`auto-upload-covers.js`** - Автоматически загружает обложки в Cloudinary
- **`fetch-google-sheets.js`** - Получает данные из Google таблицы

### SQL файлы:
- **`quick-import-books.sql`** - SQL файл с книгами для импорта

### Вспомогательные:
- **`package.json`** - Зависимости Node.js
- **`env.example`** - Пример файла переменных окружения

### Документация:
- **`IMPORT_INSTRUCTIONS.md`** - Подробная инструкция по импорту
- **`COMPLETE_IMPORT_GUIDE.md`** - Полная инструкция по импорту
- **`COVER_UPLOAD_SETUP.md`** - Настройка загрузки обложек
- **`QUICK_START.md`** - Быстрый старт
- **`FINAL_INSTRUCTIONS.md`** - Финальные инструкции

## 🚀 Быстрый старт (РЕКОМЕНДУЕТСЯ)

### 1. Установка зависимостей
```bash
cd scripts/
npm install
```

### 2. Настройка переменных окружения
Создайте файл `.env.local`:
```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=dchx7vd97
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Sheets
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_RANGE=Sheet1!A:Z
```

### 3. Полный импорт
```bash
node complete-import.js
```

## 🔄 Альтернативный способ (пошаговый)

### 1. Создать SQL файл
```bash
node quick-import.js
```

### 2. Выполнить SQL в Supabase
```sql
scripts/quick-import-books.sql
```

### 3. Загрузить обложки
```bash
node auto-upload-covers.js
```

## ✅ Результат

После успешного импорта:
- ✅ Все книги из Google таблицы
- ✅ Правильно разделенные категории
- ✅ Обложки в Cloudinary
- ✅ Авторы созданы и связаны
- ✅ Рабочий поиск

## 🔧 Настройка

### Структура данных в Google таблице:
| Колонка | Описание |
|---------|----------|
| Код книги | Уникальный код |
| Название | Полное название |
| Автор | Имя автора |
| Категорія | Категории через запятую |
| Опис | Полное описание |
| ISBN | Международный номер |
| Сторінки | Количество страниц |
| Вік | Возрастная категория |
| Мова | Язык книги |
| Видавництво | Издательство |
| Рік | Год издания |
| Фото (URL) | Ссылка на обложку |
| Ціна | Цена в гривнах |

## 🆘 Решение проблем

### Ошибка Cloudinary:
- Проверьте API ключи
- Убедитесь в правильности cloud_name

### Ошибка Supabase:
- Проверьте URL и ключи
- Убедитесь в правильности структуры таблиц

### Ошибка Google Sheets:
- Проверьте права доступа
- Убедитесь в правильности ID таблицы
