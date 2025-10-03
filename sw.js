const CACHE_NAME = 'assistente-saude-ia-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  // Adicione aqui outros arquivos estáticos importantes que você queira cachear
  // Ex: '/styles.css', '/logo.png', etc.
  // As dependências via importmap (react, tailwind, etc.) serão cacheadas dinamicamente.
];

self.addEventListener('install', event => {
  // Realiza a instalação do Service Worker
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se o recurso estiver no cache, retorna ele
        if (response) {
          return response;
        }

        // Caso contrário, busca na rede
        return fetch(event.request).then(
          response => {
            // Se a resposta for inválida, não armazena em cache
            if(!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
              return response;
            }

            // Clona a resposta. Uma stream só pode ser consumida uma vez.
            // Precisamos de uma para o navegador e outra para o cache.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Deleta caches antigos
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});