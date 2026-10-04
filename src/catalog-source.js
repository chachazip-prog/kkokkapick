(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KkokkapickCatalogSource=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const liveBase='https://raw.githubusercontent.com/chachazip-prog/kkokkapick/main/data/';
 function isSnapshotPreview(location){return location?.hostname==='raw.githack.com'&&/^\/chachazip-prog\/kkokkapick\/[0-9a-f]{40}\//i.test(location.pathname||'')}
 function urls(location,now=Date.now()){const base=isSnapshotPreview(location)?liveBase:'./data/';return{catalog:base+'catalog.json?ts='+now,history:base+'price-history.json?ts='+now}}
 function isExpired(catalog,now=Date.now()){
  if(catalog?.expiresAt){const stamp=Date.parse(catalog.expiresAt);return !Number.isFinite(stamp)||now>=stamp}
  if(catalog?.storagePolicy==='ttl_cache'){const stamp=Date.parse(catalog.syncedAt||'');return !Number.isFinite(stamp)||now>=stamp+24*3600000}
  return false;
 }
 return{isSnapshotPreview,urls,isExpired};
});
