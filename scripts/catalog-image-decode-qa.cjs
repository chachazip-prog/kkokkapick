// Actual original-photo decoding only. No URL replacement, pruning or source-clock renewal.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const CONCURRENCY=5,TIMEOUT_MS=10000,DELAYS=[350,900];
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function requestBelongsTo(request,root){for(let r=request;r;r=r.redirectedFrom())if(r===root)return true;return false}
function decoded(row){return row.reason==='loaded'&&row.width>0&&row.height>0&&(row.httpStatus==null||row.httpStatus===304||row.httpStatus>=200&&row.httpStatus<300)}
async function runBoundedUrl(url,probe,waitImpl=wait){
 const attempts=[];
 for(let index=0;index<3;index++){
  if(index)await waitImpl(DELAYS[index-1]);
  let row;try{row=await probe(url,index+1)}catch{row={reason:'probe_error',httpStatus:null,originalHttpStatus:null,width:0,height:0,measuredAt:new Date().toISOString()}}
  const attempt={...row,attempt:index+1};attempt.ok=decoded(attempt);attempts.push(attempt);
  if(attempt.ok||(attempt.originalHttpStatus??attempt.httpStatus)!==400)break;
 }
 return{url,attempts,ok:attempts.at(-1).ok,recovered:!attempts[0].ok&&attempts.at(-1).ok};
}
function summarize(results){const firstOk=results.filter(r=>r.attempts[0].ok).length,finalOk=results.filter(r=>r.ok).length;return{
 firstPass:{checked:results.length,ok:firstOk,failed:results.length-firstOk},
 finalCounts:{checked:results.length,ok:finalOk,failed:results.length-finalOk},
 boundedRecovered:results.filter(r=>r.recovered).length,totalAttempts:results.reduce((sum,r)=>sum+r.attempts.length,0)}}
async function main(){
 const [input='data/catalog.json',output='artifacts/actual-image-decoding.json']=process.argv.slice(2);
 const bytes=fs.readFileSync(input),catalog=JSON.parse(bytes);
 const source=require('../src/catalog-source.js');
 if(source.isExpired(catalog))throw Error('Catalog is expired; source observations must not be renewed for QA');
 const products=Array.isArray(catalog.products)?catalog.products:[],urls=[...new Set(products.flatMap(p=>[p.imageUrl,...(Array.isArray(p.imageUrls)?p.imageUrls:[])])).values()].filter(u=>typeof u==='string'&&/^https:\/\//.test(u));
 if(!urls.length)throw Error('No actual HTTPS product photos in the catalog');
 const {chromium}=require('playwright');
 const browser=await chromium.launch({...process.env.QA_CHROMIUM_PATH?{executablePath:process.env.QA_CHROMIUM_PATH}:{},args:['--no-sandbox']});
 const startedAt=new Date().toISOString();
 try{
  const context=await browser.newContext({serviceWorkers:'block'});let cursor=0;const results=new Array(urls.length);
  async function probe(url){
   const page=await context.newPage();let rootRequest=null,originalHttpStatus=null,httpStatus=null;
   page.on('request',request=>{if(rootRequest===null&&request.url()===url)rootRequest=request});
   page.on('response',response=>{const request=response.request();if(rootRequest&&requestBelongsTo(request,rootRequest)){httpStatus=response.status();if(request===rootRequest)originalHttpStatus=httpStatus}});
   try{
    await page.goto('about:blank');
    const row=await page.evaluate(({url,timeoutMs})=>new Promise(resolve=>{
     const image=new Image(),start=performance.now();let done=false;
     const finish=reason=>{if(done)return;done=true;clearTimeout(timer);const width=image.naturalWidth,height=image.naturalHeight;image.onload=image.onerror=null;
      resolve({reason,width,height,durationMs:Math.round(performance.now()-start),measuredAt:new Date().toISOString()});if(reason!=='loaded')image.removeAttribute('src')};
     const timer=setTimeout(()=>finish('timeout'),timeoutMs);image.onload=()=>finish('loaded');image.onerror=()=>finish('error');image.src=url;
    }),{url,timeoutMs:TIMEOUT_MS});
    return{...row,originalHttpStatus,httpStatus};
   }finally{await page.close()}
  }
  async function worker(){while(cursor<urls.length){const index=cursor++;results[index]=await runBoundedUrl(urls[index],probe)}}
  await Promise.all(Array.from({length:Math.min(CONCURRENCY,urls.length)},worker));
  const summary={startedAt,finishedAt:new Date().toISOString(),sourceHash:crypto.createHash('sha256').update(bytes).digest('hex'),
   catalogSyncedAt:catalog.syncedAt??null,catalogExpiresAt:catalog.expiresAt??null,temporaryDisplayDeadline:source.expirationTime(catalog),
   catalogProductCount:products.length,uniqueImageCount:urls.length,...summarize(results),concurrency:CONCURRENCY,timeoutMs:TIMEOUT_MS,
   maxAttemptsPerUrl:3,retryStatus:400,retryDelaysMs:DELAYS,sourceUrlsUnchanged:true,imagesPersisted:false,continuousAvailabilityVerified:false,results};
  if(!fs.readFileSync(input).equals(bytes))throw Error('Catalog input changed during image QA');
  fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(summary,null,2)+'\n');
  console.log(JSON.stringify({...summary,results:undefined,output}));
  if(summary.finalCounts.failed)process.exitCode=1;
 }finally{await browser.close()}
}
module.exports={decoded,runBoundedUrl,summarize,requestBelongsTo};
if(require.main===module)main().catch(error=>{console.error(String(error.message).replace(/https?:\/\/\S+/g,'[redacted URL]'));process.exitCode=1});
