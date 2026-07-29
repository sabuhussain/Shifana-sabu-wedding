const CACHE='shifana-sabu-v1';
const ASSETS=["./", "./index.html", "./style.css", "./script.js", "./manifest.webmanifest", "./preview.jpg", "./icons/icon-192.png", "./icons/icon-512.png", "./hero.jpg", "./photo-01.jpeg", "./photo-02.jpeg", "./photo-03.jpeg", "./wedding-venue.jpg", "./reception-venue.jpg", "./wedding-music.mp3"];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
    const copy=resp.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); return resp;
  }).catch(()=>caches.match('./index.html'))));
});
