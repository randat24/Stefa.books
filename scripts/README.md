# 📚 Скрипты для импорта книг

## 🎯 Назначение
Набор скриптов для полного импорта всех книг из Google таблицы в базу данных с автоматической загрузкой обложек в Cloudinary.

## 🚀 НОВЫЙ ПОЛНЫЙ ИМПОРТ

### Основной скрипт:
- **`complete-import.js`** - Полный импорт: Google Sheets → Supabase → Cloudinary

### Тестирование:
- **`test-connections.js`** - Проверяет все подключения перед импортом

## 📁 Структура файлов

### Основные скрипты:
- **`complete-import.js`** - 🆕 Полный импорт в одном скрипте
- **`quick-import.js`** - Создает SQL файл для импорта книг
- **`auto-upload-covers.js`** - Автоматически загружает обложки в Cloudinary
- **`fetch-google-sheets.js`** - Получает данные из Google таблицы

### SQL скрипты:
- **`clear-all-books.sql`** - Очищает все книги из базы данных
- **`process-categories.sql`** - Обрабатывает категории (разделяет по запятым)
- **`process-covers.sql`** - Обрабатывает URL обложек
- **`test-existing-functions.sql`** - Проверяет функции базы данных

### Вспомогательные:
- **`package.json`** - Зависимости Node.js
- **`delete-existing-covers.sql`** - Показывает обложки для удаления
- **`upload-covers-to-cloudinary.js`** - Загружает обложки в Cloudinary

### Документация:
- **`IMPORT_INSTRUCTIONS.md`** - 🆕 Подробная инструкция по импорту
- **`COMPLETE_IMPORT_GUIDE.md`** - Полная инструкция по импорту
- **`COVER_UPLOAD_SETUP.md`** - Настройка загрузки обложек

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

### 3. Тестирование подключений
```bash
node test-connections.js
```

### 4. Полный импорт
```bash
node complete-import.js
```

## 🔄 Старый способ (пошаговый)

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

## 📋 Пошаговая инструкция

### Шаг 1: Подготовка данных
1. Откройте `quick-import.js`
2. Замените тестовые данные на ваши реальные данные из Google таблицы
3. Запустите: `node quick-import.js`

### Шаг 2: Импорт в базу данных
1. Выполните созданный SQL файл в Supabase
2. Проверьте результат: `scripts/test-existing-functions.sql`

### Шаг 3: Загрузка обложек
1. Настройте API ключи Cloudinary
2. Запустите: `node auto-upload-covers.js`
3. Проверьте результат в Cloudinary

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
