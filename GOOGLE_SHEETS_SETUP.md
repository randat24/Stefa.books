# Настройка обновления обложек книг из Google таблицы

## Описание

Скрипты для автоматического обновления обложек книг в базе данных из Google таблицы с Cloudinary ссылками.

## Варианты использования

### Вариант 1: Cloudinary URLs из Google таблицы (рекомендуется)

Использует Cloudinary ссылки из Google таблицы для обновления обложек.

**Файл:** `update_book_covers_from_cloudinary_sheets.mjs`

**Настройка:**
1. Создайте Google таблицу с колонками:
   - A: Название книги
   - B: Автор  
   - C: Cloudinary URL (например: `https://res.cloudinary.com/dchx7vd97/image/upload/v1234567890/book-cover.jpg`)

2. Сделайте таблицу публичной:
   - Поделитесь таблицей → "Все, у кого есть ссылка" → "Читатель"

3. Скопируйте ID таблицы из URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
   ```

4. Обновите `.env.local`:
   ```env
   GOOGLE_SHEETS_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0
   ```

**Запуск:**
```bash
# Тестирование подключения
node update_book_covers_from_cloudinary_sheets.mjs --test

# Обновление обложек
node update_book_covers_from_cloudinary_sheets.mjs
```

**Особенности:**
- Автоматически проверяет доступность Cloudinary URL
- Оптимизирует URL для лучшего качества (добавляет параметры `f_auto,q_auto,w_400,h_600,c_fill`)
- Показывает детальную статистику обновлений

### Вариант 1: Простой (рекомендуется)

Использует публичный доступ к Google таблице через CSV экспорт.

**Файл:** `update_book_covers_simple.mjs`

**Настройка:**
1. Создайте Google таблицу с колонками:
   - A: Название книги
   - B: Автор
   - C: Ссылка на обложку

2. Сделайте таблицу публичной:
   - Поделитесь таблицей → "Все, у кого есть ссылка" → "Читатель"

3. Скопируйте ID таблицы из URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
   ```

4. Обновите `.env.local`:
   ```env
   GOOGLE_SHEETS_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0
   ```

**Запуск:**
```bash
node update_book_covers_simple.mjs
```

### Вариант 2: С API ключом

Использует Google Sheets API для более надежного доступа.

**Файл:** `update_book_covers_from_google_sheets.mjs`

**Настройка:**
1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google Sheets API
4. Создайте API ключ
5. Обновите `.env.local`:
   ```env
   GOOGLE_SHEETS_ID=your_sheet_id_here
   GOOGLE_API_KEY=your_api_key_here
   ```

**Запуск:**
```bash
node update_book_covers_from_google_sheets.mjs
```

## Формат Google таблицы

Таблица должна содержать следующие колонки:

| A (Название) | B (Автор) | C (Обложка) |
|--------------|-----------|-------------|
| 1984 | Джордж Орвелл | https://example.com/cover1.jpg |
| Алиса в стране чудес | Льюис Кэрролл | https://example.com/cover2.jpg |

## Примеры ссылок на обложки

- **Google Drive:** `https://drive.google.com/uc?id=FILE_ID`
- **Cloudinary:** `https://res.cloudinary.com/your-cloud/image/upload/v1234567890/book-cover.jpg`
- **Любые другие публичные URL изображений**

## Проверка работы

Скрипты покажут:
- ✅ Количество обновленных книг
- ⏭️ Количество книг, которые уже актуальны
- ❓ Количество книг, не найденных в базе данных

## Устранение неполадок

### Ошибка "No data found"
- Проверьте, что таблица публичная
- Проверьте правильность URL
- Убедитесь, что в таблице есть данные

### Ошибка "Book not found in database"
- Проверьте точное совпадение названий и авторов
- Убедитесь, что в базе данных есть соответствующие книги

### Ошибка API ключа
- Проверьте правильность API ключа
- Убедитесь, что Google Sheets API включен
- Проверьте права доступа к таблице

## Автоматизация

Для регулярного обновления можно добавить в cron:
```bash
# Обновление каждый день в 2:00
0 2 * * * cd /path/to/project && node update_book_covers_simple.mjs
```