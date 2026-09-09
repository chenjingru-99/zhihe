const VERSION = 'zhihe-v1.4.0';
const SHELL = [
  './',
  'index.html',
  'manifest.json',
  'css/style.css',
  'js/core.js',
  'js/models.js',
  'js/pet.js',
  'js/views-home.js',
  'js/views-learn.js',
  'js/views-life.js',
  'js/views-media.js',
  'js/views-me.js',
  'js/app.js',
  'img/bg-home.jpg',
  'img/bg-learn.jpg',
  'img/bg-life.jpg',
  'img/bg-media.jpg',
  'img/bg-me.jpg',
  'img/bg-focus.jpg',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  if (e.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html')) {
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(VERSION).then(c => c.put('index.html', copy));
        return r;
      }).catch(() => caches.match('index.html'))
    );
    return;
  }

  if (url.pathname.includes('/data/news/')) {
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  if (url.pathname.includes('/data/')) {
    e.respondWith(
      caches.match(e.request).then(hit => {
        const fetching = fetch(e.request).then(r => {
          if (r.ok) {
            const copy = r.clone();
            caches.open(VERSION).then(c => c.put(e.request, copy));
          }
          return r;
        }).catch(() => hit);
        return hit || fetching;
      })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request))
  );
});
