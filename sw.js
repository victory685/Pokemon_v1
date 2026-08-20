const APP_CACHE='pokemon-app-v2';
const IMAGE_CACHE='pokemon-images-v2';
const APP=['./','./index.html','./manifest.webmanifest','./icon.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(APP_CACHE).then(c=>c.addAll(APP)));
  self.skipWaiting();
});
self.addEventListener('activate',event=>{
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  const url=new URL(req.url);

  if(url.hostname==='raw.githubusercontent.com' && url.pathname.includes('/PokeAPI/sprites/')){
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async cache=>{
        const hit=await cache.match(req);
        if(hit) return hit;
        try{
          const res=await fetch(req);
          if(res && res.ok) cache.put(req,res.clone());
          return res;
        }catch(e){
          return new Response('',{status:504,statusText:'Offline image unavailable'});
        }
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(hit=>hit || fetch(req).then(res=>{
      if(req.method==='GET' && url.origin===self.location.origin){
        const clone=res.clone();
        caches.open(APP_CACHE).then(c=>c.put(req,clone));
      }
      return res;
    }))
  );
});
