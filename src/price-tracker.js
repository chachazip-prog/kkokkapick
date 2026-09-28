export function buildPriceChanges(previousProducts=[], currentProducts=[], observedAt=new Date().toISOString()) {
  const oldPrice=new Map(previousProducts.map(p=>[String(p.id),positivePrice(p.minPrice)]));
  return currentProducts.flatMap(p=>{
    const id=String(p.id);
    const before=oldPrice.get(id);
    const after=positivePrice(p.minPrice);
    if(before===null||before===undefined||after===null||before===after) return [];
    return [{
      productId:id,
      observedAt,
      previousPrice:before,
      price:after,
      direction:after<before?"down":"up",
      changeAmount:after-before
    }];
  });
}
export function positivePrice(value){
  if(value===null||value===undefined||value==="") return null;
  const n=Number(value);
  return Number.isFinite(n)&&n>0?n:null;
}
export function latestPriceChange(events=[], productId){
  for(let i=events.length-1;i>=0;i--) if(String(events[i].productId)===String(productId)) return events[i];
  return null;
}
export function isTargetPriceReached(currentPrice,targetPrice){
  const current=positivePrice(currentPrice), target=positivePrice(targetPrice);
  return current!==null&&target!==null&&current<=target;
}
