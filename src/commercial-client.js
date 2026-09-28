export const COMMERCIAL_EVENT_TYPES=Object.freeze(['impression','click','conversion']);
export function validHttpUrl(value=''){
  try { const u=new URL(value); return u.protocol==='http:'||u.protocol==='https:'; } catch { return false; }
}
export function commercialEvent({campaignId,productId=null,type,sessionKey=null,revenue=null}={}){
  if(!campaignId||!COMMERCIAL_EVENT_TYPES.includes(type))return null;
  const amount=revenue==null?null:Number(revenue);
  if(amount!=null&&(!Number.isFinite(amount)||amount<0))return null;
  return {campaign_id:String(campaignId),product_id:productId?String(productId):null,event_type:type,session_key:sessionKey?String(sessionKey):null,revenue:amount};
}
export function campaignIsVisible(c,{now=new Date()}={}){
  if(!c)return false;
  const t=now instanceof Date?now:new Date(now),s=c.startsAt||c.starts_at,e=c.endsAt||c.ends_at;
  return (!s||new Date(s)<=t)&&(!e||new Date(e)>t);
}
