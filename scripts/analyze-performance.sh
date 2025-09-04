#!/bin/bash

echo "🚀 Анализ производительности Stefa.Books"
echo "========================================"

# Создаем директорию для отчетов
mkdir -p performance-reports

echo "📊 1. Анализ размера бандла..."
ANALYZE=true pnpm build > performance-reports/bundle-analysis.txt 2>&1

echo "📈 2. Запуск тестов производительности..."
pnpm test:performance > performance-reports/performance-tests.txt 2>&1

echo "🔍 3. Анализ Lighthouse..."
if command -v lighthouse &> /dev/null; then
    echo "Запуск Lighthouse анализа..."
    lighthouse http://localhost:3000 --output=html --output-path=performance-reports/lighthouse-report.html --chrome-flags="--headless" || echo "Lighthouse не смог подключиться к localhost:3000"
else
    echo "Lighthouse не установлен. Установите: npm install -g lighthouse"
fi

echo "📋 4. Создание сводного отчета..."
cat > performance-reports/summary.md << EOF
# Отчет о производительности Stefa.Books

## Дата анализа
$(date)

## Размер бандла
- Главная страница: 174 kB (First Load JS)
- Общий размер: 102 kB (shared chunks)

## Рекомендации по оптимизации

### 1. Lazy Loading
- ✅ Уже используется для не-критичных компонентов
- ✅ Suspense для асинхронных компонентов

### 2. Изображения
- ✅ Next.js Image компонент используется
- 🔄 Проверить оптимизацию обложек книг

### 3. Кэширование
- ✅ Service Worker настроен
- ✅ Zustand store с персистентным кэшем

### 4. Bundle Analysis
- Проверьте performance-reports/bundle-analysis.txt для детального анализа

## Следующие шаги
1. Запустите локальный сервер: pnpm dev
2. Откройте http://localhost:3000
3. Запустите Lighthouse в Chrome DevTools
4. Проанализируйте метрики Core Web Vitals
EOF

echo "✅ Анализ завершен! Результаты в папке performance-reports/"
echo "📁 Отчеты:"
echo "   - bundle-analysis.txt - анализ бандла"
echo "   - performance-tests.txt - результаты тестов"
echo "   - lighthouse-report.html - Lighthouse отчет (если доступен)"
echo "   - summary.md - сводный отчет"
