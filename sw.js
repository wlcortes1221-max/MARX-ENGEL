// Marx Engel Team — Service Worker
const CACHE = 'met-v1';
const ASSETS = [
  './marx-engel-supabase.html',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@400;700;900&family=Inter:wght@300;400;500;600&display=swap',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Instala e faz cache dos assets principais
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
});

// Limpa caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estratégia: Network first, fallback para cache
self.addEventListener('fetch', e => {
  // Ignora requests do Supabase (sempre precisa de rede)
  if(e.request.url.includes('supabase.co')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Salva no cache se for bem sucedido
        if(res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Notificações push (base para futuro)
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  self.registration.showNotification(data.title || 'Marx Engel Team', {
    body: data.body || 'Você tem uma nova notificação',
    icon: './logo.png',
    badge: './logo.png',
    vibrate: [200, 100, 200],
    data: data
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./marx-engel-supabase.html'));
});
