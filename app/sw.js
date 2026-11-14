/* COSMO FARM PWA service worker: keeps the app's own files on the phone. Same origin only; calls to Apps Script are never kept here. */
var NAME='cosmo-pwa-96446e20824f',FILES=["./","index.html","app.css","boot.js","config.js","shim.js","pwa.js","app.js","manifest.webmanifest","icon-192.png","icon-512.png","icon-maskable-512.png","apple-touch-icon.png"];
self.addEventListener('install',function(e){e.waitUntil(caches.open(NAME).then(function(c){return c.addAll(FILES);}).then(function(){return self.skipWaiting();}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k.indexOf('cosmo-pwa-')===0&&k!==NAME;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){var u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin)return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(function(r){return r||fetch(e.request);}));});
