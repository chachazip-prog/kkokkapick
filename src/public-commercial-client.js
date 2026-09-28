import {selectPopup,dismissKey} from './popup-policy.js';
import {validHttpUrl} from './commercial-client.js';

const cfg=window.KKOKKAPICK_PUBLIC_CONFIG||{};
const ready=()=>Boolean(cfg.commercialEnabled&&cfg.supabaseUrl&&cfg.supabaseAnonKey);
async function read(path){
  if(!ready())return [];
  const r=await fetch(cfg.supabaseUrl+'/rest/v1/'+path,{headers:{apikey:cfg.supabaseAnonKey,Authorization:'Bearer '+cfg.supabaseAnonKey}});
  if(!r.ok)return [];
  return r.json();
}
export async function loadCommercialHome(){
  if(!ready())return {campaigns:[],popup:null};
  const [campaigns,popups]=await Promise.all([
    read('published_commercial_campaigns?select=*&placement=eq.home&order=priority.desc'),
    read('published_popups?select=*&or=(surface.eq.all,surface.eq.web)&placement=eq.home&order=priority.desc')
  ]);
  return {campaigns,popup:selectPopup(popups,{surface:'web',dismissed:isDismissed})};
}
export function isDismissed(p){
  const key=dismissKey(p);
  if(!key)return false;
  return p.dismiss_policy==='session'?sessionStorage.getItem(key)==='1':localStorage.getItem(key)==='1';
}
export function dismissPopup(p){
  const key=dismissKey(p);if(!key)return;
  (p.dismiss_policy==='session'?sessionStorage:localStorage).setItem(key,'1');
}
export function safeDestination(value){return validHttpUrl(value)?value:null}

export async function recordCommercialEvent(campaignId,type,{productId=null,sessionKey=null}={}){
  if(!ready()||!campaignId||!['impression','click'].includes(type))return false;
  const r=await fetch(cfg.supabaseUrl+'/rest/v1/rpc/record_commercial_event',{method:'POST',headers:{apikey:cfg.supabaseAnonKey,Authorization:'Bearer '+cfg.supabaseAnonKey,'Content-Type':'application/json'},body:JSON.stringify({p_campaign_id:campaignId,p_event_type:type,p_product_id:productId,p_session_key:sessionKey})});
  return r.ok;
}
