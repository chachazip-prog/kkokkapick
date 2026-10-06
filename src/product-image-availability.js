(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KkokkapickProductImages=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
 function imageProbe(url){
  return new Promise(resolve=>{
   const img=new Image();let done=false;
   const finish=ok=>{if(done)return;done=true;clearTimeout(timer);img.onload=img.onerror=null;resolve(ok)};
   const timer=setTimeout(()=>{finish(false);img.removeAttribute('src')},5000);
   img.onload=()=>finish(img.naturalWidth>0);img.onerror=()=>finish(false);img.src=url;
  });
 }
 function createState({probeImpl=imageProbe,waitImpl=ms=>new Promise(r=>setTimeout(r,ms)),onlineImpl=()=>typeof navigator==='undefined'||navigator.onLine!==false}={}){
  let stamp=null,generation=0;const failed=new Set(),recoveries=new Map();
  const validUrl=value=>typeof value==='string'&&/^https:\/\//.test(value);
  function setSnapshot(value,now=Date.now()){const next=Date.parse(value);if(!Number.isFinite(next)||next>now+300000||stamp!==null&&next<=stamp)return false;stamp=next;generation++;failed.clear();recoveries.clear();return true}
  function urls(p={}){return [...new Set([p.imageUrl,...(Array.isArray(p.imageUrls)?p.imageUrls:[])].filter(u=>validUrl(u)&&!failed.has(u)))]}
  function markFailed(url,token=generation){if(token!==generation||!onlineImpl()||!validUrl(url))return false;failed.add(url);return true}
  async function recover(url,token=generation){
   if(token!==generation)return 'stale';if(!onlineImpl())return 'offline';if(!validUrl(url)||failed.has(url))return 'unavailable';
   if(recoveries.has(url))return recoveries.get(url);
   const task=(async()=>{
    for(const delay of [350,900]){
     await waitImpl(delay);if(token!==generation)return 'stale';if(!onlineImpl())return 'offline';
     let ok=false;try{ok=await probeImpl(url)}catch{}
     if(token!==generation)return 'stale';if(!onlineImpl())return 'offline';if(ok)return 'available';
    }
    markFailed(url,token);return 'unavailable';
   })().then(result=>{if(result==='offline'&&token===generation)recoveries.delete(url);return result});
   recoveries.set(url,task);return task;
  }
  return {setSnapshot,urls,markFailed,recover,generation:()=>generation,failedCount:()=>failed.size};
 }
 return {createState};
});
