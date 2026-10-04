(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KkokkapickCatalogSource=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const liveBase='https://raw.githubusercontent.com/chachazip-prog/kkokkapick/main/data/';
 function isSnapshotPreview(location){return location?.hostname==='raw.githack.com'&&/^\/chachazip-prog\/kkokkapick\/[0-9a-f]{40}\//i.test(location.pathname||'')}
 function urls(location,now=Date.now()){const base=isSnapshotPreview(location)?liveBase:'./data/';return{catalog:base+'catalog.json?ts='+now,history:base+'price-history.json?ts='+now}}
 function isExpired(catalog,now=Date.now()){const stamp=Date.parse(catalog?.expiresAt||'');return catalog?.expiresAt ? !Number.isFinite(stamp)||now>=stamp : false}
 return{isSnapshotPreview,urls,isExpired};
});
