(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KkokkapickCatalogSource=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const liveBase='https://raw.githubusercontent.com/chachazip-prog/kkokkapick/main/data/';
 function isSnapshotPreview(location){return location?.hostname==='raw.githack.com'&&/^\/chachazip-prog\/kkokkapick\/[0-9a-f]{40}\//i.test(location.pathname||'')}
 function urls(location,now=Date.now()){const preview=isSnapshotPreview(location);const base=preview?liveBase:'./data/';const result={catalog:base+'catalog.json?ts='+now,history:base+'price-history.json?ts='+now};if(preview){const review=liveBase.replace('/main/','/codex/release-ui-rebuild/');result.alternateCatalog=review+'catalog.json?ts='+now;result.alternateHistory=review+'price-history.json?ts='+now}return result}
 function isExpired(catalog,now=Date.now()){
  if(catalog?.expiresAt){const stamp=Date.parse(catalog.expiresAt);return !Number.isFinite(stamp)||now>=stamp}
  if(catalog?.storagePolicy==='ttl_cache'){const stamp=Date.parse(catalog.syncedAt||'');return !Number.isFinite(stamp)||now>=stamp+24*3600000}
  return false;
 }
 async function load(fetchImpl,location,now=Date.now()){
  const paths=urls(location,now);
  async function read(url){const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),10000);try{const response=await fetchImpl(url,{cache:'no-store',signal:controller.signal});if(!response.ok)throw new Error('Catalog source unavailable');return await response.json()}finally{clearTimeout(timeout)}}
  const sources=[{catalog:paths.catalog,history:paths.history}];if(paths.alternateCatalog)sources.push({catalog:paths.alternateCatalog,history:paths.alternateHistory});
  const candidates=(await Promise.all(sources.map(async source=>{try{const catalog=await read(source.catalog);if(!Array.isArray(catalog?.products))return null;return{catalog,source}}catch{return null}}))).filter(Boolean);
  if(!candidates.length)throw new Error('Catalog fetch failed');
  const valid=candidates.filter(item=>!isExpired(item.catalog,now));const chosen=(valid.length?valid:candidates).sort((a,b)=>(Date.parse(b.catalog.syncedAt)||0)-(Date.parse(a.catalog.syncedAt)||0))[0];
  if(isExpired(chosen.catalog,now))return{catalog:chosen.catalog,history:null};
  let history=null;try{history=await read(chosen.source.history)}catch{}
  return{catalog:chosen.catalog,history};
 }
 return{isSnapshotPreview,urls,isExpired,load};
});
