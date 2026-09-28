const cfg=window.KKOKKAPICK_ADMIN_CONFIG||{};
const state={session:null,campaigns:[]};
const $=s=>document.querySelector(s);
const status=$('#connectionStatus'), save=$('#saveCampaign'), savePopup=$('#savePopup');
function configured(){return Boolean(cfg.enabled&&cfg.supabaseUrl&&cfg.supabaseAnonKey)}
function headers(extra={}){return {'apikey':cfg.supabaseAnonKey,'Authorization':'Bearer '+(state.session?.access_token||cfg.supabaseAnonKey),'Content-Type':'application/json',...extra}}
async function api(path,options={}){const r=await fetch(cfg.supabaseUrl+'/rest/v1/'+path,{...options,headers:headers(options.headers)});if(!r.ok)throw new Error(await r.text());return r.status===204?null:r.json()}
async function loadCampaigns(){if(!configured()||!state.session)return;state.campaigns=await api('commercial_campaigns?select=id,title,campaign_type,status,starts_at,ends_at,placement,priority&order=created_at.desc');state.popups=await api('managed_popups?select=id,title,status,surface,dismiss_policy,starts_at,ends_at,priority&order=created_at.desc');render()}
function render(){const box=$('#campaignRows');if(box)box.innerHTML=state.campaigns.length?state.campaigns.map(c=>`<div class="row"><b>${escapeHtml(c.title)}</b><span class="badge">${escapeHtml(c.status)}</span><span>${escapeHtml(c.campaign_type)}</span><span>${escapeHtml(c.placement||'—')}</span></div>`).join(''):'<div class="row"><b>등록된 캠페인이 없습니다.</b><span class="badge">—</span><span>—</span><span>—</span></div>';const p=$('#popupRows');if(p)p.innerHTML=(state.popups||[]).length?state.popups.map(x=>`<div class="row"><b>${escapeHtml(x.title)}</b><span class="badge">${escapeHtml(x.status)}</span><span>${escapeHtml(x.surface)}</span><span>${escapeHtml(x.dismiss_policy)}</span></div>`).join(''):'<div class="row"><b>등록된 팝업이 없습니다.</b><span class="badge">—</span><span>전체</span><span>—</span></div>'}
function escapeHtml(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function signIn(email,password){const r=await fetch(cfg.supabaseUrl+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:cfg.supabaseAnonKey,'Content-Type':'application/json'},body:JSON.stringify({email,password})});if(!r.ok)throw new Error('로그인에 실패했습니다.');state.session=await r.json();await loadCampaigns()}
async function saveDraft(){
 const payload={title:$('#campaignTitle').value.trim(),campaign_type:$('#campaignType').value,status:'draft',disclosure_label:'Sponsored',placement:$('#placement').value||null};
 if(!payload.title)return alert('캠페인명을 입력하세요.');
 await api('commercial_campaigns',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(payload)});await loadCampaigns();
}
$('#loginForm')?.addEventListener('submit',async e=>{e.preventDefault();try{await signIn($('#adminEmail').value,$('#adminPassword').value);status.textContent='관리자 연결됨';save.disabled=false;if(savePopup)savePopup.disabled=false;$('#loginPanel').hidden=true}catch(err){alert(err.message)}});
save?.addEventListener('click',()=>saveDraft().catch(e=>alert('저장 실패: '+e.message)));
savePopup?.addEventListener('click',async()=>{try{const title=$('#popupTitle').value.trim();if(!title)return alert('팝업 제목을 입력하세요.');const url=$('#popupUrl').value.trim();if(url&&!/^https?:\/\//i.test(url))return alert('링크는 http/https 주소만 입력하세요.');await api('managed_popups',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({title,status:'draft',surface:$('#popupSurface').value,dismiss_policy:$('#popupDismiss').value,destination_url:url||null})});await loadCampaigns()}catch(e){alert('팝업 저장 실패: '+e.message)}});
if(configured()){status.textContent='Supabase 연결 준비됨 · 관리자 로그인 필요';}else{status.textContent='안전 모드 · Supabase 설정 전에는 조회/저장이 비활성화됩니다.';}
