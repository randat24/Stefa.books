# 📚 Руководство по импорту обложек книг с Cloudinary

## 🎯 Цель
Импортировать все обложки книг из Google таблицы с Cloudinary ссылками в базу данных.

## 📋 Требования
- Google таблица с колонками: **Название** | **Автор** | **Cloudinary URL**
- Таблица должна быть публично доступной
- Cloudinary URL должны быть полными и валидными

## 🚀 Быстрый старт

### 1. Настройка Google таблицы
```bash
node setup_cloudinary_import.mjs
```
Следуйте инструкциям для настройки URL таблицы.

### 2. Просмотр текущих обложек
```bash
node import_cloudinary_covers.mjs --show
```

### 3. Тестирование подключения
```bash
node import_cloudinary_covers.mjs --test
```

### 4. Импорт обложек
```bash
node import_cloudinary_covers.mjs
```

## 📊 Что делает скрипт

### `import_cloudinary_covers.mjs` - основной скрипт
- ✅ Загружает данные из Google таблицы
- ✅ Фильтрует ТОЛЬКО записи с Cloudinary URL
- ✅ Проверяет доступность каждого Cloudinary URL
- ✅ Оптимизирует URL для лучшего качества
- ✅ Сопоставляет книги по названию и автору
- ✅ Обновляет обложки в базе данных
- ✅ Показывает детальную статистику

### `setup_cloudinary_import.mjs` - настройка
- ✅ Помогает настроить URL Google таблицы
- ✅ Проверяет доступность таблицы
- ✅ Проверяет наличие Cloudinary URL в данных
- ✅ Обновляет `.env.local` файл

## 🔧 Параметры запуска

```bash
# Показать текущие обложки
node import_cloudinary_covers.mjs --show

# Тестировать подключение
node import_cloudinary_covers.mjs --test

# Запустить импорт
node import_cloudinary_covers.mjs
```

## 📈 Статистика импорта

Скрипт показывает:
- ✅ **Updated**: Количество обновленных книг
- ⏭️ **Already up to date**: Книги с актуальными обложками
- ❓ **Not found**: Книги не найдены в базе данных
- ❌ **Invalid Cloudinary URLs**: Невалидные URL
- ❌ **Errors**: Ошибки при обработке

## ☁️ Оптимизация Cloudinary URL

Скрипт автоматически добавляет параметры оптимизации:
```
?f_auto,q_auto,w_400,h_600,c_fill
```

Где:
- `f_auto` - автоматический формат
- `q_auto` - автоматическое качество
- `w_400,h_600` - размер 400x600px
- `c_fill` - заполнение с обрезкой

## 🔍 Примеры Cloudinary URL

**Правильные:**
```
https://res.cloudinary.com/dchx7vd97/image/upload/v1234567890/book-cover.jpg
https://res.cloudinary.com/your-cloud/image/upload/f_auto,q_auto/book-title.jpg
```

**Неправильные:**
```
https://res.cloudinary.com/dchx7vd97/in
https://drive.google.com/file/d/123/view
```

## ⚠️ Устранение неполадок

### Ошибка "No Cloudinary data found"
- Проверьте, что в таблице есть Cloudinary URL
- Убедитесь, что URL содержат `cloudinary.com`

### Ошибка "Invalid Cloudinary URL"
- Проверьте, что URL полные и доступны
- Убедитесь, что изображения существуют в Cloudinary

### Ошибка "Book not found in database"
- Проверьте точное совпадение названий и авторов
- Убедитесь, что книги есть в базе данных

## 📝 Формат Google таблицы

| A (Название) | B (Автор) | C (Cloudinary URL) |
|--------------|-----------|-------------------|
| Сапієнс | Юваль Ноа Харарі | https://res.cloudinary.com/dchx7vd97/image/upload/v1234567890/sapiens.jpg |
| Космос | Карл Саган | https://res.cloudinary.com/dchx7vd97/image/upload/v1234567890/cosmos.jpg |

## 🎉 Результат

После успешного импорта все книги в базе данных будут иметь оптимизированные Cloudinary обложки вместо placeholder изображений.
