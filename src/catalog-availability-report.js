// Evidence diagnostics only: these timestamps do not renew source TTL.
export function catalogAvailabilityReport(catalog={},source={},now=Date.now()){
 const rows=Array.isArray(source.products)?source.products:[];
 const observed=Date.parse(catalog.syncedAt||source.syncedAt||'');
 const validTime=stamp=>Number.isFinite(stamp)&&stamp<=now+300000;
 const sourceTimeValid=validTime(observed);
 const stamps=rows.map(p=>Date.parse(p.checkedAt)).filter(validTime);
 const first=stamps.length?Math.min(...stamps):sourceTimeValid?observed:null;
 const last=stamps.length?Math.max(...stamps):sourceTimeValid?observed:null;
 const products=Array.isArray(catalog.products)?catalog.products:[];
 const urls=[...new Set(products.flatMap(p=>[p.imageUrl,...(p.imageUrls||[])].filter(Boolean)))];
 const evidence=products.flatMap(p=>Array.isArray(p.imageEvidence)?p.imageEvidence:[]).filter(e=>{
  const observation=Date.parse(e?.observedAt),verification=Date.parse(e?.verifiedAt);
  return urls.includes(e?.url)&&e.status>=200&&e.status<300&&validTime(observation)&&validTime(verification)&&verification>=observation;
 });
 const verified=evidence.length?Math.max(...evidence.map(e=>Date.parse(e.verifiedAt))):null;
 const temporary=urls.some(value=>{try{const u=new URL(value);return u.hostname==='d2iaagr1j041pi.cloudfront.net'&&u.pathname==='/apis/search_img.php'}catch{return false}});
 const deadline=temporary&&sourceTimeValid?observed+90*60000:null;
 return {
  measuredAt:new Date(now).toISOString(),
  sourceFields:source.productFacts?.sourceFields||[],
  materialOffers:rows.filter(p=>p.material).length,
  availableSizeOffers:rows.filter(p=>p.availableSizes?.length).length,
  imageUrls:urls.length,
  imageUrlsWithVerification:new Set(evidence.map(e=>e.url)).size,
  collectionDurationSeconds:first!==null&&last!==null?Math.round((last-first)/1000):null,
  lastVerificationAt:verified===null?null:new Date(verified).toISOString(),
  sourceAgeAtLastVerificationSeconds:verified!==null&&first!==null&&verified>=first?Math.round((verified-first)/1000):null,
  temporaryImageDisplayDeadline:deadline===null?null:new Date(deadline).toISOString(),
  remainingImageDisplaySeconds:deadline===null?null:Math.max(0,Math.min(90*60,Math.floor((deadline-now)/1000))),
  imageStatus:temporary&&!sourceTimeValid?'invalid_source_time':deadline!==null&&now>=deadline?'display_window_expired':'current_health_not_measured',
  missingFields:['material','availableSizes'].filter(key=>!rows.some(p=>key==='material'?Boolean(p.material):p.availableSizes?.length)),
  displayCeilingIsLifetimeGuarantee:false,
  continuousAvailabilityVerified:false
 };
}
