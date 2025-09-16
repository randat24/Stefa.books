# 📚 Индекс документации Stefa.Books

## 🌟 Основная документация

### 📋 Документация проекта
- [README.md](/README.md) - Основная информация о проекте
- [docs/README.md](/docs/README.md) - Общий обзор документации
- [docs/Project.md](/docs/Project.md) - Описание проекта и архитектуры
- [docs/Tasktracker.md](/docs/Tasktracker.md) - Задачи и их статусы
- [docs/Sprints.md](/docs/Sprints.md) - План спринтов
- [docs/Diary.md](/docs/Diary.md) - Технический журнал

### 🛠️ Руководства по разработке
- [docs/development/README.md](/docs/development/README.md) - Руководство разработчика
- [docs/development/CODING_STANDARDS.md](/docs/development/CODING_STANDARDS.md) - Стандарты кода
- [docs/development/DEVELOPER_ONBOARDING.md](/docs/development/DEVELOPER_ONBOARDING.md) - Адаптация новых разработчиков
- [docs/development/PROJECT_MAINTENANCE_GUIDE.md](/docs/development/PROJECT_MAINTENANCE_GUIDE.md) - Поддержка проекта

### 🎨 Дизайн и UI
- [docs/Branding.md](/docs/Branding.md) - Руководство по брендингу
- [docs/COLOR_SYSTEM.md](/docs/COLOR_SYSTEM.md) - Цветовая система
- [docs/FORMS_DOCUMENTATION.md](/docs/FORMS_DOCUMENTATION.md) - Документация форм

## 💾 База данных

### 📊 Основная документация БД
- [docs/DATABASE_DOCUMENTATION.md](/docs/DATABASE_DOCUMENTATION.md) - Полная документация БД
- [docs/QUICK_DB_GUIDE.md](/docs/QUICK_DB_GUIDE.md) - Краткое руководство по БД

### 📈 Оптимизация и безопасность БД
- [docs/INDEXES_GUIDE.md](/docs/INDEXES_GUIDE.md) - Руководство по индексам
- [docs/FUNCTION_SECURITY.md](/docs/FUNCTION_SECURITY.md) - Безопасность функций PostgreSQL
- [docs/DATABASE_CLEANUP_REPORT.md](/docs/DATABASE_CLEANUP_REPORT.md) - Отчет по очистке БД

### 🛠️ SQL скрипты
- [database/maintenance_scripts.sql](/database/maintenance_scripts.sql) - Скрипты обслуживания
- [database/fix_function_security.sql](/database/fix_function_security.sql) - Исправление безопасности функций
- [database/fix_final_warnings.sql](/database/fix_final_warnings.sql) - Исправление предупреждений

## 🔌 API и интеграции

### 🌐 API документация
- [docs/API_DOCUMENTATION.md](/docs/API_DOCUMENTATION.md) - Общая документация API
- [MONOBANK_PAYMENT_FIX_DOCUMENTATION.md](/MONOBANK_PAYMENT_FIX_DOCUMENTATION.md) - Интеграция платежей Monobank

### ☁️ Облачные сервисы
- [docs/CLOUDINARY_OPTIMIZATION.md](/docs/CLOUDINARY_OPTIMIZATION.md) - Оптимизация изображений в Cloudinary

## 📊 Отчеты и анализ

### 🔍 Анализ и аудиты
- [docs/ANALYSIS_SUMMARY.md](/docs/ANALYSIS_SUMMARY.md) - Сводка по анализу проекта
- [docs/development/CODE_QUALITY_AUDIT_REPORT.md](/docs/development/CODE_QUALITY_AUDIT_REPORT.md) - Аудит качества кода

### 📝 Отчеты по оптимизации
- [TAILWIND_V4_UPGRADE_REPORT.md](/TAILWIND_V4_UPGRADE_REPORT.md)
- [PNPM_MIGRATION_REPORT.md](/PNPM_MIGRATION_REPORT.md)
- [TYPESCRIPT_FIXES_REPORT.md](/TYPESCRIPT_FIXES_REPORT.md)

## 🚨 Когда обращаться к документации

### 🧩 При добавлении нового функционала
1. **Проверить архитектуру**: [docs/Project.md](/docs/Project.md)
2. **Следовать стандартам кода**: [docs/development/CODING_STANDARDS.md](/docs/development/CODING_STANDARDS.md)
3. **Обновить документацию** при внесении изменений

### 🔧 При работе с базой данных
1. **Прочитать общую документацию**: [docs/DATABASE_DOCUMENTATION.md](/docs/DATABASE_DOCUMENTATION.md)
2. **Оптимизировать индексы**: [docs/INDEXES_GUIDE.md](/docs/INDEXES_GUIDE.md)
3. **Обеспечить безопасность функций**: [docs/FUNCTION_SECURITY.md](/docs/FUNCTION_SECURITY.md)

### 🔒 При настройке безопасности
1. **Изучить требования к RLS**: [docs/DATABASE_DOCUMENTATION.md](/docs/DATABASE_DOCUMENTATION.md)
2. **Проверить политики**: используйте скрипты из [database/maintenance_scripts.sql](/database/maintenance_scripts.sql)
3. **Исправить проблемы безопасности функций**: [database/fix_function_security.sql](/database/fix_function_security.sql)

### 🌐 При деплое и публикации
1. **Проверить переменные окружения** в [docs/README.md](/docs/README.md)
2. **Убедиться в прохождении всех проверок** типов и линтинга
3. **Следовать инструкциям по деплою** из основного [README.md](/README.md)

## 📅 График обновления документации

Для поддержания документации в актуальном состоянии рекомендуется:

1. **Ежедневно**: Обновлять [docs/Diary.md](/docs/Diary.md) при решении сложных задач
2. **Еженедельно**: Проверять статусы задач в [docs/Tasktracker.md](/docs/Tasktracker.md)
3. **При завершении спринта**: Обновлять [docs/Sprints.md](/docs/Sprints.md)
4. **При значительных изменениях**: Обновлять соответствующие разделы документации

## 🔄 Процесс работы с документацией

**Подробная информация**: [DOCUMENTATION_PROCESS.md](/docs/DOCUMENTATION_PROCESS.md) - Полное руководство по работе с документацией

Основные принципы:
1. **Поддерживать актуальность**: обновлять документацию вместе с кодом
2. **Использовать Markdown**: соблюдать единый стиль форматирования
3. **Следить за ссылками**: проверять, что все ссылки между документами работают
4. **Добавлять даты обновления**: указывать в конце документов дату последнего обновления

---

**Последнее обновление**: 15 сентября 2025
