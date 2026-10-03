const CACHE='kkokkapick-pages-v3';
const ASSETS=['./','./index.html','./manifest.json','./config.public.js','./src/public-commercial-client.js','./src/popup-policy.js','./src/commercial-client.js','./src/kkokkafit-engine.js','./src/brand-size-charts.js','./src/price-tracker.js','./src/recommendation-ranker.js','./data/catalog.json','./data/price-history.json'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys()
    .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
    .then(()=>self.clients.claim()));
});

function networkFirst(request){
  return fetch(request).then(response=>{
    if(response&&response.ok){
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(request,copy));
    }
    return response;
  }).catch(()=>caches.match(request));
}

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;

  const isNavigation=event.request.mode==='navigate';
  const isAppCode=/\.(?:html|js|json)$/.test(url.pathname);
  const isLiveData=url.pathname.endsWith('/data/catalog.json')||url.pathname.endsWith('/data/price-history.json');

  if(isNavigation||isAppCode||isLiveData){
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(caches.match(event.request).then(cached=>cached||networkFirst(event.request)));
});
