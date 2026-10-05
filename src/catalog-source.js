(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KkokkapickCatalogSource=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const liveBase='https://raw.githubusercontent.com/chachazip-prog/kkokkapick/main/data/';
 function isSnapshotPreview(location){return location?.hostname==='raw.githack.com'&&/^\/chachazip-prog\/kkokkapick\/[0-9a-f]{40}\//i.test(location.pathname||'')}
 function urls(location,now=Date.now()){const preview=isSnapshotPreview(location);const base=preview?liveBase:'./data/';const result={catalog:base+'catalog.json?ts='+now,history:base+'price-history.json?ts='+now};if(preview){const review=liveBase.replace('/main/','/codex/release-ui-rebuild/');result.alternateCatalog=review+'catalog.json?ts='+now;result.alternateHistory=review+'price-history.json?ts='+now}return result}
 // Internal display ceiling, not a claim about the provider's URL lifetime.
 // The internal90min ceiling is conservative; hourly refresh plus a30min job has no delay margin.
 function imageWindowExpired(catalog,now=Date.now()){
  const hasTemporaryImages=(catalog?.products||[]).some(p=>[p.imageUrl,...(p.imageUrls||[])].some(value=>{try{const url=new URL(value);return url.hostname==='d2iaagr1j041pi.cloudfront.net'&&url.pathname==='/apis/search_img.php'}catch{return false}}));
  if(!hasTemporaryImages)return false;
  const observed=Date.parse(catalog.syncedAt||'');
  return !Number.isFinite(observed)||observed>now+300000||now>=observed+90*60000;
 }
 function expirationTime(catalog){
  const deadlines=[];
  const observed=Date.parse(catalog?.syncedAt||'');
  // Use the same temporary-image predicate as the display gate.
  if(imageWindowExpired(catalog,Number.isFinite(observed)?observed+90*60000:Date.now()))deadlines.push(Number.isFinite(observed)?observed+90*60000:0);
  if(catalog?.expiresAt){const stamp=Date.parse(catalog.expiresAt);deadlines.push(Number.isFinite(stamp)?stamp:0)}
  else if(catalog?.storagePolicy==='ttl_cache')deadlines.push(Number.isFinite(observed)?observed+24*3600000:0);
  return deadlines.length?Math.min(...deadlines):null;
 }
 function isExpired(catalog,now=Date.now()){
  if(imageWindowExpired(catalog,now))return true;
  if(catalog?.expiresAt){const stamp=Date.parse(catalog.expiresAt);return !Number.isFinite(stamp)||now>=stamp}
  if(catalog?.storagePolicy==='ttl_cache'){const stamp=Date.parse(catalog.syncedAt||'');return !Number.isFinite(stamp)||now>=stamp+24*3600000}
  return false;
 }
 async function load(fetchImpl,location,now=Date.now()){
  const paths=urls(location,now);
  async function read(url){const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),10000);try{const response=await fetchImpl(url,{cache:'no-store',signal:controller.signal});if(!response.ok)throw new Error('Catalog source unavailable');return await response.json()}finally{clearTimeout(timeout)}}
  const sources=[{catalog:paths.catalog,history:paths.history}];if(paths.alternateCatalog)sources.push({catalog:paths.alternateCatalog,history:paths.alternateHistory});
  const candidates=(await Promise.all(sources.map(async source=>{try{const catalog=await read(source.catalog);if(!Array.isArray(catalog?.products))return null;if(isSnapshotPreview(location)&&catalog.groupingVersion!==2)return null;return{catalog,source}}catch{return null}}))).filter(Boolean);
  if(!candidates.length)throw new Error('Catalog fetch failed');
  const valid=candidates.filter(item=>!isExpired(item.catalog,now));const chosen=(valid.length?valid:candidates).sort((a,b)=>(Date.parse(b.catalog.syncedAt)||0)-(Date.parse(a.catalog.syncedAt)||0))[0];
  if(isExpired(chosen.catalog,now))return{catalog:chosen.catalog,history:null};
  let history=null;try{history=await read(chosen.source.history)}catch{}
  return{catalog:chosen.catalog,history};
 }
 return{isSnapshotPreview,urls,isExpired,imageWindowExpired,expirationTime,load};
});
