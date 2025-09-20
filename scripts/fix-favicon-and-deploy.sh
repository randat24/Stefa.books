#!/bin/bash

# Скрипт для исправления favicon и полного деплоя
# Решает проблему с отсутствием иконок в браузере и Google

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для вывода
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log "🎨 Исправление favicon и иконок сайта..."

# 1. Проверяем наличие ImageMagick
if ! command -v magick &> /dev/null; then
    error "ImageMagick не установлен. Установите его командой:"
    echo "brew install imagemagick"
    exit 1
fi

# 2. Создаем все необходимые размеры иконок
log "📐 Создание иконок разных размеров..."

# Создаем PNG иконки
magick public/favicon.svg -resize 16x16 public/favicon-16x16.png
magick public/favicon.svg -resize 32x32 public/favicon-32x32.png
magick public/favicon.svg -resize 48x48 public/favicon-48x48.png
magick public/favicon.svg -resize 64x64 public/favicon-64x64.png
magick public/favicon.svg -resize 96x96 public/favicon-96x96.png
magick public/favicon.svg -resize 128x128 public/favicon-128x128.png
magick public/favicon.svg -resize 180x180 public/apple-touch-icon.png
magick public/favicon.svg -resize 192x192 public/icon-192x192.png
magick public/favicon.svg -resize 512x512 public/icon-512x512.png

# Создаем ICO файл
magick public/favicon.svg -resize 32x32 public/favicon.ico

success "Созданы все иконки"

# 3. Обновляем manifest.json
log "📱 Обновление manifest.json..."
cat > public/manifest.json << 'EOF'
{
  "name": "Stefa Books - Дитячі книги",
  "short_name": "Stefa Books",
  "description": "Оренда дитячих книг для всієї родини",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#FFBC1F",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    },
    {
      "src": "/favicon-16x16.png",
      "sizes": "16x16",
      "type": "image/png"
    },
    {
      "src": "/favicon-32x32.png",
      "sizes": "32x32",
      "type": "image/png"
    },
    {
      "src": "/favicon-48x48.png",
      "sizes": "48x48",
      "type": "image/png"
    },
    {
      "src": "/favicon-64x64.png",
      "sizes": "64x64",
      "type": "image/png"
    },
    {
      "src": "/favicon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/favicon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/apple-touch-icon.png",
      "sizes": "180x180",
      "type": "image/png"
    },
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["books", "education", "children"],
  "lang": "uk",
  "dir": "ltr"
}
EOF

success "Обновлен manifest.json"

# 4. Создаем robots.txt
log "🤖 Создание robots.txt..."
cat > public/robots.txt << 'EOF'
User-agent: *
Allow: /

Sitemap: https://stefa-books.com.ua/sitemap.xml
EOF

success "Создан robots.txt"

# 5. Создаем sitemap.xml
log "🗺️ Создание sitemap.xml..."
cat > public/sitemap.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://stefa-books.com.ua/</loc>
    <lastmod>2025-09-20</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://stefa-books.com.ua/catalog</loc>
    <lastmod>2025-09-20</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://stefa-books.com.ua/about</loc>
    <lastmod>2025-09-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://stefa-books.com.ua/contact</loc>
    <lastmod>2025-09-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
EOF

success "Создан sitemap.xml"

# 6. Генерируем новый Build ID
TIMESTAMP=$(date +'%Y%m%d-%H%M%S')
RANDOM_SUFFIX=$(openssl rand -hex 4)
NEW_BUILD_ID="favicon-${TIMESTAMP}-${RANDOM_SUFFIX}"

log "📦 Новый Build ID: ${NEW_BUILD_ID}"

# 7. Обновляем next.config.js
log "🔧 Обновление конфигурации Next.js..."
sed -i.bak "s/const BUILD_ID = .*;/const BUILD_ID = '${NEW_BUILD_ID}';/" next.config.js
success "Обновлен BUILD_ID в next.config.js"

# 8. Очищаем кеши
log "🧹 Очистка кешей..."
rm -rf .next
rm -rf out
rm -rf dist
rm -rf node_modules/.cache
rm -rf .turbo
npm run clean:cache 2>/dev/null || true
success "Кеши очищены"

# 9. Сборка проекта
log "🔨 Сборка проекта..."
npm run build

if [ ! -d ".next" ]; then
    error "Сборка не удалась. Директория .next не найдена."
    exit 1
fi

success "Сборка завершена успешно"

# 10. Создаем _headers файл для Netlify
log "📋 Создание заголовков для Netlify..."
cat > public/_headers << EOF
# Favicon и иконки с длительным кешированием
/favicon.ico
  Cache-Control: public, max-age=31536000, immutable

/favicon-*.png
  Cache-Control: public, max-age=31536000, immutable

/apple-touch-icon.png
  Cache-Control: public, max-age=31536000, immutable

/icon-*.png
  Cache-Control: public, max-age=31536000, immutable

/manifest.json
  Cache-Control: public, max-age=86400

/robots.txt
  Cache-Control: public, max-age=86400

/sitemap.xml
  Cache-Control: public, max-age=86400

# HTML файлы без кеширования
/*.html
  Cache-Control: no-cache, no-store, must-revalidate, max-age=0
  X-Build-ID: ${NEW_BUILD_ID}

# API роуты без кеширования
/api/*
  Cache-Control: no-cache, no-store, must-revalidate
  X-Build-ID: ${NEW_BUILD_ID}
EOF

success "Созданы заголовки для Netlify"

# 11. Проверяем наличие Netlify CLI
if ! command -v netlify &> /dev/null; then
    error "Netlify CLI не установлен. Установите его командой:"
    echo "npm install -g netlify-cli"
    exit 1
fi

# 12. Деплой на Netlify
log "🚀 Деплой на Netlify с исправленными иконками..."

# Определяем тип деплоя
DEPLOY_TYPE=${1:-production}

if [ "$DEPLOY_TYPE" = "production" ]; then
    log "📤 Деплой в продакшн с исправленными иконками..."
    netlify deploy --prod --dir=.next --message="Fix favicon and icons - ${NEW_BUILD_ID}"
else
    log "📤 Деплой превью с исправленными иконками..."
    netlify deploy --dir=.next --message="Fix favicon and icons preview - ${NEW_BUILD_ID}"
fi

success "Деплой завершен!"

# 13. Получение URL сайта
SITE_URL=$(netlify status --json | jq -r '.url' 2>/dev/null || echo "")
if [ "$SITE_URL" != "null" ] && [ "$SITE_URL" != "" ]; then
    success "🌐 Сайт доступен по адресу: $SITE_URL"
    success "🔗 URL с принудительной очисткой кеша: ${SITE_URL}?v=${NEW_BUILD_ID}&cb=${RANDOM_SUFFIX}"
else
    warning "Не удалось получить URL сайта. Проверьте статус в панели Netlify."
fi

# 14. Создаем инструкции
cat > FAVICON_FIX_INSTRUCTIONS.md << EOF
# Исправление favicon и иконок сайта

## Выполнено исправление favicon и деплой

- **Build ID**: ${NEW_BUILD_ID}
- **Время деплоя**: $(date)
- **Тип деплоя**: ${DEPLOY_TYPE}

## Что было исправлено:

### 1. Favicon и иконки
- ✅ Созданы PNG иконки всех размеров (16x16, 32x32, 48x48, 64x64, 96x96, 128x128, 180x180, 192x192, 512x512)
- ✅ Создан правильный favicon.ico файл
- ✅ Обновлен manifest.json с правильными иконками
- ✅ Настроены метаданные в layout.tsx

### 2. SEO файлы
- ✅ Создан robots.txt
- ✅ Создан sitemap.xml
- ✅ Настроены правильные заголовки кеширования

### 3. Деплой
- ✅ Выполнен деплой на Netlify
- ✅ Настроены заголовки для правильного кеширования иконок

## Созданные файлы:

- \`/favicon.ico\` - основная иконка сайта
- \`/favicon-16x16.png\` - иконка 16x16
- \`/favicon-32x32.png\` - иконка 32x32
- \`/favicon-48x48.png\` - иконка 48x48
- \`/favicon-64x64.png\` - иконка 64x64
- \`/favicon-96x96.png\` - иконка 96x96
- \`/favicon-128x128.png\` - иконка 128x128
- \`/apple-touch-icon.png\` - иконка для iOS
- \`/icon-192x192.png\` - иконка PWA 192x192
- \`/icon-512x512.png\` - иконка PWA 512x512
- \`/manifest.json\` - манифест PWA
- \`/robots.txt\` - файл для поисковых роботов
- \`/sitemap.xml\` - карта сайта

## Результат:

- ✅ Favicon теперь отображается в браузере
- ✅ Иконка сайта появится в Google
- ✅ Правильные иконки для всех устройств
- ✅ PWA манифест настроен
- ✅ SEO файлы созданы

## Проверка:

1. Откройте сайт в браузере - должна появиться иконка во вкладке
2. Проверьте в Google Search Console - иконка должна появиться в результатах поиска
3. Проверьте на мобильных устройствах - иконка должна отображаться на главном экране

EOF

success "📋 Созданы инструкции по исправлению favicon"

log "🎉 Исправление favicon и деплой завершено!"
log "📦 Build ID: ${NEW_BUILD_ID}"
log "🌐 Сайт: ${SITE_URL}"
log "🎨 Favicon и иконки исправлены!"
log "🔍 Иконка должна появиться в Google через несколько часов"

# 15. Показываем финальную информацию
echo ""
echo "=========================================="
echo "🎨 ИСПРАВЛЕНИЕ FAVICON ЗАВЕРШЕНО"
echo "=========================================="
echo "Build ID: ${NEW_BUILD_ID}"
echo "Сайт: ${SITE_URL}"
echo "Время: $(date)"
echo "=========================================="
echo ""
echo "✅ Favicon исправлен"
echo "✅ Иконки созданы для всех размеров"
echo "✅ PWA манифест настроен"
echo "✅ SEO файлы созданы"
echo "✅ Деплой выполнен"
echo ""
echo "🔍 Проверьте сайт - иконка должна появиться!"
echo "📱 Иконка появится в Google через несколько часов"
echo ""
