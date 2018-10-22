const CACHE_NAME = `${process.env.NAME}${process.env.VERSION}`;

self.addEventListener('install', event =>
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      fetch('manifest.json')
        .then(response => response.json())
        .then(assets => cache.addAll(assets));
    }),
  ),
);

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;

      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic')
          return response;

        const responseToCache = response.clone();

        caches
          .open(CACHE_NAME)
          .then(
            cache =>
              event.request.method === 'GET' &&
              cache.put(event.request, responseToCache),
          );

        return response;
      });
    }),
  );
});

self.addEventListener('activate', event =>
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames.filter(Boolean).map(cacheName => caches.delete(cacheName)),
        ),
      ),
  ),
);
