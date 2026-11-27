// Offline: keeps the app in the phone so it works at the campfire without wifi.
const C='pcz-v8';
const FILES=['./','./index.html','./app.css','./manifest.webmanifest','./apple-touch-icon.png','./icon-512.png','./favicon.png','./js/core.js','./js/i18n.js','./js/chords.js','./js/lessons.js','./js/song.js','./js/train.js','./js/quest.js','./js/help.js','./js/rhythm.js','./js/tuner.js','./js/main.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(u.origin===location.origin){
  // network first (fresh updates when online), cache as fallback (offline)
  e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./index.html'))));
 }else if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
  e.respondWith(caches.open(C).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{c.put(r,res.clone());return res}))));
 }
});
