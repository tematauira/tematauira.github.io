const SHELL_CACHE = 'etude-shell-v1';
const RUNTIME_CACHE = 'etude-runtime-v1';
const SHELL_ASSETS = ["/tematauira.github.io/", "/tematauira.github.io/index.html", "/tematauira.github.io/styles.css?v=4b67781a", "/tematauira.github.io/script.js?v=8963d4c6", "/tematauira.github.io/manifest.json", "/tematauira.github.io/offline.html", "/tematauira.github.io/icons/icon-192.png", "/tematauira.github.io/icons/icon-512.png", "/tematauira.github.io/icons/apple-touch-icon.png"];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(function(cache) { return cache.addAll(SHELL_ASSETS); })
      .then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names
          .filter(function(name) { return name !== SHELL_CACHE && name !== RUNTIME_CACHE; })
          .map(function(name) { return caches.delete(name); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  var request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }
  event.respondWith(
    fetch(request).then(function(response) {
      if (response && response.ok) {
        var copy = response.clone();
        caches.open(RUNTIME_CACHE).then(function(cache) { cache.put(request, copy); });
      }
      return response;
    }).catch(function() {
      return caches.match(request).then(function(cached) {
        if (cached) return cached;
        if (request.mode === 'navigate') return caches.match('/tematauira.github.io/offline.html');
        return undefined;
      });
    })
  );
});
