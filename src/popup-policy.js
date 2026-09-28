export function selectPopup(popups=[], {surface='web', now=new Date(), dismissed=()=>false}={}) {
  const t=now instanceof Date?now:new Date(now);
  return popups.filter(p=>{
    if(p.surface!=='all'&&p.surface!==surface)return false;
    const start=p.starts_at?new Date(p.starts_at):null,end=p.ends_at?new Date(p.ends_at):null;
    return (!start||start<=t)&&(!end||end>t)&&!dismissed(p);
  }).sort((a,b)=>(Number(b.priority)||0)-(Number(a.priority)||0))[0]||null;
}
export function dismissKey(popup,day=new Date()){
  const id=String(popup?.id||'');
  if(popup?.dismiss_policy==='daily')return `kk_popup_daily_${id}_${day.getFullYear()}-${day.getMonth()+1}-${day.getDate()}`;
  if(popup?.dismiss_policy==='forever')return `kk_popup_forever_${id}`;
  if(popup?.dismiss_policy==='session')return `kk_popup_session_${id}`;
  return null;
}
