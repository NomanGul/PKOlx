const CACHE_NAME = 'PKOLX-v0.4';
const urlsToCache = [
    '/',
    '/index.html',
    '/addPost.html',
    '/favourites.html',    
    '/conversations.html',
    '/chat.html',
    '/signin.html',
    '/signup.html',
    '/src/css/bootstrap.min.css',
    '/src/css/style.css',
    '/src/js/conversations.js',
    '/src/js/index.js',
    '/src/js/main.js',
    '/src/js/chat.js',
    '/src/js/signin.js',
    '/src/js/signup.js',
    '/src/images/loader.png',
    '/src/images/right-arrow.png',
    '/src/images/forrest.png',                                                                                                                                         
];

// INSTALL EVENT
self.addEventListener('install', event => {
  console.log('SW Installing');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// ACTIVATE EVENT
self.addEventListener('activate', event => {
    console.log('SW Activating');
    event.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(keyList.map(key => {
          if (key !== CACHE_NAME) {
              console.log('SW Removing old cache', key);
              return caches.delete(key);
          }
        }));
      })
    );
    return self.clients.claim();
})

// FETCH EVENT
self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
});

// CODE 4 PUSH NOTIFICATIONS

// PUSH EVENT
self.addEventListener('push', event => {
  console.log('Push message Received', event);
  let notification = event.data.json().notification;
  let title = notification.title;
  let body = notification.body;
  let url = notification.click_action;
  let icon = '/src/images/192.png';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: icon,
      data: url
    })
  );
});

// NOTIFICATION CLICK EVENT
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked: ', event.notification);
  event.notification.close();
  clients.openWindow(event.notification.data);
});