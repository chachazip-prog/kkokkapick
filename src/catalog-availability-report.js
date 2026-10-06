// Diagnostic evidence: successful verification never renews source TTL.
export function catalogAvailabilityReport(catalog={},source={},now=Date.now()){
 const rows=source.products||[], observed=Date.parse(catalog.syncedAt||source.syncedAt||'');
 const stamps=rows.map(p=>Date.parse(p.checkedAt)).filter(Number.isFinite);
 const first=stamps.length?Math.min(...stamps):observed,last=stamps.length?Math.max(...stamps):observed;
 const urls=[...new Set((catalog.products||[]).flatMap(p=>[p.imageUrl,...(p.imageUrls||[])].filter(Boolean)))];
 const evidence=(catalog.products||[]).flatMap(p=>p.imageEvidence||[]).filter(e=>urls.includes(e.url)&&Number.isFinite(Date.parse(e.verifiedAt))&&Date.parse(e.verifiedAt)<=now+300000&&(!Number.isFinite(first)||Date.parse(e.verifiedAt)>=first));
 const verified=evidence.length?Math.max(...evidence.map(e=>Date.parse(e.verifiedAt))):null;
 const temporary=urls.some(value=>{try{const u=new URL(value);return u.hostname==='d2iaagr1j041pi.cloudfront.net'&&u.pathname==='/apis/search_img.php'}catch{return false}});
 const deadline=temporary&&Number.isFinite(observed)?observed+90*60000:null;
 return {measuredAt:new Date(now).toISOString(),sourceFields:source.productFacts?.sourceFields||[],materialOffers:rows.filter(p=>p.material).length,availableSizeOffers:rows.filter(p=>p.availableSizes?.length).length,imageUrls:urls.length,imageUrlsWithVerification:new Set(evidence.map(e=>e.url)).size,collectionDurationSeconds:Number.isFinite(first)&&Number.isFinite(last)?Math.round((last-first)/1000):null,lastVerificationAt:verified===null?null:new Date(verified).toISOString(),sourceAgeAtLastVerificationSeconds:verified!==null&&Number.isFinite(first)?Math.round((verified-first)/1000):null,temporaryImageDisplayDeadline:deadline===null?null:new Date(deadline).toISOString(),remainingImageDisplaySeconds:deadline===null?null:Math.max(0,Math.floor((deadline-now)/1000)),imageStatus:deadline!==null&&now>=deadline?'display_window_expired':'current_health_not_measured',missingFields:['material','availableSizes'].filter(key=>!rows.some(p=>key==='material'?Boolean(p.material):p.availableSizes?.length)),displayCeilingIsLifetimeGuarantee:false,continuousAvailabilityVerified:false};
}
