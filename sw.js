/* Study with IUB — offline service worker */
const CACHE = 'iub-app-v3.0.0';
const SHELL = ['./', './index.html', './manifest.json', './pdf.min.mjs', './pdf.worker.min.mjs', './jszip.min.js', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png'];
const RUNTIME_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate') { e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put('./index.html', c)); return r; }).catch(() => caches.match('./index.html'))); return; }
  if (url.origin === location.origin) { e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; }))); return; }
  if (RUNTIME_HOSTS.includes(url.hostname)) { e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => { const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => hit); return hit || net; }))); }
});
