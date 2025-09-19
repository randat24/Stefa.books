const CACHE_NAME = 'stefa-books-cache-20250919-1841';
const BUILD_ID = '20250919-1841';

// Файлы, которые нужно кешировать
const urlsToCache = [
  '/',
  '/catalog',
  '/about',
  '/contact',
  '/manifest.json'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Принудительная активация нового Service Worker
        return self.skipWaiting();
      })
  );
});


// Перехват запросов
self.addEventListener('fetch', (event) => {
  // Пропускаем не-HTTP запросы
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Для HTML страниц - всегда идем в сеть, игнорируем кеш
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
        .then((response) => {
          // Проверяем, что получили валидный ответ
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // НЕ кешируем HTML страницы
          return response;
        })
        .catch(() => {
          // Если сеть недоступна, показываем offline страницу
          return new Response(
            '<html><body><h1>Offline</h1><p>Пожалуйста, проверьте подключение к интернету</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
  } else {
    // Для статических ресурсов - сначала кеш, потом сеть
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }

          return fetch(event.request).then((response) => {
            // Проверяем валидность ответа
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Клонируем ответ для кеша
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
        })
    );
  }
});

// Обработка сообщений от основного потока
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: BUILD_ID,
      cacheName: CACHE_NAME
    });
  }

  if (event.data && event.data.type === 'CLEAR_ALL_CACHE') {
    console.log('Service Worker: Clearing all caches...');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('Service Worker: Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        // Уведомляем о завершении очистки
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

// Активация Service Worker с уведомлением клиентов
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating version', BUILD_ID);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
          // Удаляем старые кеши
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Принудительно берем контроль над всеми клиентами
      return self.clients.claim();
    }).then(() => {
      // Уведомляем всех клиентов о новой версии
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'NEW_VERSION_AVAILABLE',
            buildId: BUILD_ID,
            cacheName: CACHE_NAME,
            message: 'Доступна новая версия сайта! Обновите страницу для получения последних изменений.'
          });
        });
      });
    })
  );
});