# Настройка Google Sheets интеграции

Этот документ описывает, как настроить интеграцию с Google Sheets для резервного копирования и синхронизации данных книг.

## 🔧 Пошаговая настройка

### 1. Создание Google Cloud Project

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Запомните Project ID (понадобится позже)

### 2. Включение Google Sheets API

1. В Google Cloud Console перейдите в "APIs & Services" > "Library"
2. Найдите "Google Sheets API"
3. Нажмите "Enable"

### 3. Создание Service Account

1. Перейдите в "APIs & Services" > "Credentials"
2. Нажмите "Create Credentials" > "Service Account"
3. Заполните:
   - **Service account name**: `stefa-books-bot`
   - **Service account ID**: `stefa-books-bot`
   - **Description**: `Bot for Stefa.books Google Sheets integration`
4. Нажмите "Create and Continue"
5. Пропустите шаги с ролями (нажмите "Continue" и "Done")

### 4. Создание ключа Service Account

1. В списке Service Accounts найдите созданный аккаунт
2. Нажмите на него
3. Перейдите на вкладку "Keys"
4. Нажмите "Add Key" > "Create new key"
5. Выберите формат **JSON**
6. Скачайте файл (сохраните в безопасном месте!)

### 5. Создание Google Sheets таблицы

1. Перейдите в [Google Sheets](https://sheets.google.com)
2. Создайте новую таблицу
3. Назовите её "Stefa Books Database"
4. Скопируйте ID таблицы из URL:
   ```
   https://docs.google.com/spreadsheets/d/1fFGQxVE8gmgNZRzheFz4sY2gyyufrMVSAQ0JhKvDZ7I/edit
                                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                          Это ваш SPREADSHEET_ID
   ```

### 6. Предоставление доступа Service Account

**Очень важно!** Service Account должен иметь доступ к таблице:

1. В Google Sheets нажмите кнопку "Поделиться" (Share)
2. В поле email вставьте email Service Account из JSON файла
3. Email выглядит как: `stefa-books-bot@your-project-id.iam.gserviceaccount.com`
4. Установите права "Редактор" (Editor)
5. Снимите галочку "Уведомить людей"
6. Нажмите "Поделиться"

### 7. Настройка переменных окружения

Откройте скачанный JSON файл и извлеките данные:

```json
{
  "client_email": "stefa-books-bot@your-project-id.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\\n"
}
```

Обновите файлы `.env.local` и `.env.production`:

```env
# Google Sheets Configuration
GOOGLE_SHEETS_CLIENT_EMAIL=stefa-books-bot@your-project-id.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nВАШ_ПРИВАТНЫЙ_КЛЮЧ\\n-----END PRIVATE KEY-----\\n"
GOOGLE_SHEETS_SPREADSHEET_ID=ваш_spreadsheet_id
```

**Важно**: В private_key все символы `\\n` должны остаться как есть - это правильный формат.

## 🚀 Использование

После настройки доступны следующие API endpoints:

### Проверка статуса синхронизации
```bash
GET /api/sync
```

Возвращает информацию о количестве книг в Supabase и Google Sheets.

### Резервное копирование в Google Sheets
```bash
POST /api/sync
Content-Type: application/json

{
  "action": "backup_to_sheets"
}
```

Создает резервную копию всех книг из Supabase в Google Sheets.

### Импорт из Google Sheets
```bash
POST /api/sync
Content-Type: application/json

{
  "action": "import_from_sheets"
}
```

Импортирует данные из Google Sheets в Supabase (заменяет существующие данные).

## 📊 Структура таблицы

Google Sheets таблица будет иметь следующие колонки:

| Колонка | Описание | Пример |
|---------|----------|--------|
| id | UUID книги | `123e4567-e89b-12d3-a456-426614174000` |
| code | Код книги | `MD-001` |
| title | Название | `Таємниці старого замку` |
| author | Автор | `Володимир Винниченко` |
| category | Категория | `Містика для дітей` |
| subcategory | Подкатегория | *(может быть пустой)* |
| description | Полное описание | *текст описания* |
| short_description | Краткое описание | *краткий текст* |
| isbn | ISBN номер | `978-966-000-000-0` |
| pages | Количество страниц | `192` |
| age_range | Возрастная группа | `8+` |
| language | Язык | `Ukrainian` |
| publisher | Издатель | *название издательства* |
| publication_year | Год издания | `2023` |
| cover_url | Ссылка на обложку | `/images/books/cover.jpg` |
| status | Статус книги | `available`, `issued`, `reserved`, `lost` |
| available | Доступна ли | `TRUE` / `FALSE` |
| qty_total | Всего экземпляров | `1` |
| qty_available | Доступно экземпляров | `1` |
| price_uah | Цена в гривнах | `294` |
| location | Местоположение | `вул. Маріупольська 13/2, Миколаїв` |
| rating | Рейтинг | `4.6` |
| rating_count | Количество оценок | `156` |
| badges | Бейджи | `В тренді, Нове` (через запятую) |
| tags | Теги | `містика для дітей, в тренді` (через запятую) |
| created_at | Дата создания | `2025-08-28T09:51:31.435+00:00` |
| updated_at | Дата обновления | `2025-08-28T10:59:18.535652+00:00` |

## 📝 Примеры использования

### 1. Создание еженедельной резервной копии

```bash
curl -X POST "https://your-domain.com/api/sync" \
  -H "Content-Type: application/json" \
  -d '{"action":"backup_to_sheets"}'
```

### 2. Импорт новых книг из таблицы

1. Отредактируйте Google Sheets таблицу (добавьте/измените книги)
2. Выполните импорт:

```bash
curl -X POST "https://your-domain.com/api/sync" \
  -H "Content-Type: application/json" \
  -d '{"action":"import_from_sheets"}'
```

### 3. Проверка статуса синхронизации

```bash
curl "https://your-domain.com/api/sync"
```

## 🔒 Безопасность

- **Никогда не коммитьте** `.env.local` файл в git
- **Храните JSON ключ** в безопасном месте
- **Ограничьте доступ** к Google Sheets только необходимым людям
- **Регулярно проверяйте** логи на предмет подозрительной активности

## ❗ Устранение проблем

### Ошибка "The caller does not have permission"

1. Проверьте, что Service Account email добавлен в Google Sheets с правами "Редактор"
2. Убедитесь, что GOOGLE_SHEETS_SPREADSHEET_ID правильный
3. Проверьте, что Google Sheets API включен в вашем проекте

### Ошибка "Invalid private key"

1. Убедитесь, что private_key содержит `\\n` (двойной слеш + n)
2. Проверьте, что ключ начинается с `-----BEGIN PRIVATE KEY-----`
3. Убедитесь, что нет лишних пробелов в начале/конце ключа

### Ошибка "Sheet not found"

1. Таблица должна содержать лист с названием "Books"
2. Убедитесь, что у Service Account есть доступ к таблице
3. Проверьте SPREADSHEET_ID в URL таблицы

## 🤖 Автоматизация

Вы можете настроить cron job для автоматического создания резервных копий:

```bash
# Создание резервной копии каждый день в 2:00
0 2 * * * curl -X POST "https://your-domain.com/api/sync" -H "Content-Type: application/json" -d '{"action":"backup_to_sheets"}'
```

## 📞 Поддержка

Если возникли проблемы с настройкой:

1. Проверьте все переменные окружения
2. Убедитесь, что Service Account имеет доступ к таблице
3. Проверьте логи приложения
4. Обратитесь к разработчику

---

*Документация обновлена: 28.08.2025*