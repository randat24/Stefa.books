# Руководство по работе с проектом Stefa.Books на Netlify

## 🚀 Быстрый старт

### Основные URL
- **Сайт:** https://stefa-books.com.ua
- **Netlify Dashboard:** https://app.netlify.com/sites/stefabooks
- **Admin панель проекта:** https://app.netlify.com/projects/stefabooks

### Доступы
- **Netlify аккаунт:** randat24@gmail.com
- **Проект ID:** `cb75fb42-cc85-41da-a68b-f5a69f892c66`
- **Site name:** `stefabooks`

---

## 📝 Ежедневные операции

### Обновление контента

#### 1. Локальная разработка
```bash
# Клонирование репозитория (если нужно)
git clone https://github.com/your-repo/stefa-books.com.ua.git
cd stefa-books.com.ua

# Установка зависимостей
npm install

# Запуск локального сервера
npm run dev
# Сайт доступен на http://localhost:3000
```

#### 2. Внесение изменений
```bash
# Создание новой ветки для изменений
git checkout -b feature/new-updates

# Внесение изменений в коде
# ... редактирование файлов ...

# Проверка изменений
npm run build  # Проверка сборки
npm run type-check  # Проверка типов

# Коммит изменений
git add .
git commit -m "feat: описание изменений"
```

#### 3. Деплой изменений
```bash
# Отправка в репозиторий
git push origin feature/new-updates

# Мануальный деплой через Netlify CLI
netlify deploy --prod
```

---

## 🔄 Автоматизация деплоя

### Настройка GitHub/GitLab интеграции

#### В панели Netlify:
1. Перейти в **Site settings → Build & deploy**
2. Подключить Git repository
3. Настроить автоматические деплои:
   - **Production branch:** `main`
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`

#### Рекомендуемая структура веток:
```
main          ← Продакшн (автодеплой)
├── staging   ← Тестирование (preview деплой)
└── develop   ← Разработка
```

---

## ⚙️ Управление Environment Variables

### Просмотр переменных
```bash
# Через CLI
netlify env:list

# Или в веб-интерфейсе
# https://app.netlify.com/sites/stefabooks/settings/env
```

### Обновление переменных
```bash
# Добавление новой переменной
netlify env:set VARIABLE_NAME "value"

# Удаление переменной
netlify env:unset VARIABLE_NAME

# После изменения переменных - передеплой
netlify deploy --prod
```

### Критически важные переменные
```bash
# Supabase (основная база данных)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Cloudinary (изображения)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

# Сайт
NEXT_PUBLIC_SITE_URL="https://stefa-books.com.ua"
NODE_ENV="production"
```

---

## 🏗️ Процесс деплоя

### Автоматический деплой (рекомендуется)
1. Push в `main` ветку → автоматический деплой
2. Pull request → preview деплой
3. Уведомления в Slack/email (настраивается)

### Мануальный деплой
```bash
# Сборка проекта
npm run build

# Деплой preview (для тестирования)
netlify deploy

# Деплой в продакшн
netlify deploy --prod

# Деплой конкретной папки
netlify deploy --prod --dir=.next
```

### Rollback (откат к предыдущей версии)
```bash
# В веб-интерфейсе Netlify:
# Site overview → Deploys → выбрать деплой → "Publish deploy"

# Или через CLI
netlify api deployId --json | jq '.id'  # получить ID
netlify api publishDeploy --deploy-id="DEPLOY_ID"
```

---

## 🔍 Мониторинг и отладка

### Логи и диагностика
```bash
# Статус сайта
netlify status

# Логи функций
netlify logs

# Открыть админку
netlify open:admin

# Открыть сайт
netlify open:site
```

### Веб-интерфейс мониторинга
- **Deploy logs:** https://app.netlify.com/sites/stefabooks/deploys
- **Function logs:** https://app.netlify.com/sites/stefabooks/logs/functions
- **Analytics:** https://app.netlify.com/sites/stefabooks/analytics

### Типичные проблемы

#### 1. Ошибка сборки
```bash
# Локальная проверка
npm run build
npm run type-check

# Очистка кеша
npm run clean:cache
rm -rf node_modules && npm install
```

#### 2. API не работает
- Проверить environment variables
- Проверить логи функций в Netlify
- Проверить подключение к Supabase

#### 3. Изображения не загружаются
- Проверить Cloudinary настройки
- Проверить CORS политики
- Проверить API ключи

---

## 🚀 Оптимизация производительности

### Регулярные проверки
```bash
# Анализ бандла
npm run analyze:bundle

# Проверка производительности
npm run performance

# Lighthouse проверка
npx lighthouse https://stefa-books.com.ua --output html
```

### Кеширование
- **Static assets:** кешируются автоматически Netlify CDN
- **API responses:** настроены в `next.config.js`
- **Images:** оптимизируются Cloudinary

---

## 📊 Backup и восстановление

### Резервное копирование кода
```bash
# Код хранится в Git репозитории
git clone --mirror https://github.com/your-repo/stefa-books.com.ua.git

# Экспорт Netlify настроек
netlify api sites --json > netlify-backup.json
```

### Резервное копирование данных
- **Supabase:** автоматические backups (настроить в dashboard)
- **Cloudinary:** синхронизация с локальным хранилищем
- **Environment variables:** периодический экспорт

### Восстановление сайта
1. Восстановить репозиторий из backup
2. Создать новый Netlify сайт
3. Импортировать environment variables
4. Настроить домен
5. Запустить деплой

---

## 🔐 Безопасность

### Обновление зависимостей
```bash
# Проверка уязвимостей
npm audit

# Обновление зависимостей
npm update

# Безопасные обновления
npm audit fix
```

### Ротация ключей
1. **Supabase keys:** обновить в Supabase dashboard → API settings
2. **Cloudinary keys:** регенерировать в Cloudinary console
3. **JWT secrets:** сгенерировать новые и обновить

### Мониторинг безопасности
- Настроить уведомления о неудачных деплоях
- Регулярно проверять логи на подозрительную активность
- Использовать HTTPS everywhere

---

## 📋 Чек-лист для обновлений

### Перед каждым деплоем
- [ ] Протестировать локально (`npm run dev`)
- [ ] Проверить сборку (`npm run build`)
- [ ] Проверить типы (`npm run type-check`)
- [ ] Запустить тесты (`npm run test`)
- [ ] Проверить линтинг (`npm run lint`)

### После деплоя
- [ ] Проверить основные страницы
- [ ] Проверить API endpoints
- [ ] Проверить mobile версию
- [ ] Проверить производительность
- [ ] Проверить SEO метрики

### Еженедельно
- [ ] Проверить аналитику Netlify
- [ ] Обновить зависимости
- [ ] Проверить логи на ошибки
- [ ] Backup environment variables

### Ежемесячно
- [ ] Аудит безопасности (`npm audit`)
- [ ] Проверка производительности (Lighthouse)
- [ ] Обновление документации
- [ ] Ротация sensitive ключей

---

## 🆘 Контакты для поддержки

### Netlify Support
- **Документация:** https://docs.netlify.com/
- **Community:** https://community.netlify.com/
- **Support:** support@netlify.com

### Технологии проекта
- **Next.js:** https://nextjs.org/docs
- **Supabase:** https://supabase.com/docs
- **Cloudinary:** https://cloudinary.com/documentation

### Emergency контакты
- **Главный разработчик:** [ваш email]
- **DevOps:** [email администратора]
- **Domain registrar (NIC.UA):** https://nic.ua/

---

**Последнее обновление:** 17 сентября 2025
**Версия документа:** 1.0