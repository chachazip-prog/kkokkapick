const frame=document.getElementById('screen');
function updateReviewStatus(){
 let status;try{status=frame.contentWindow.getCatalogReviewStatus?.()}catch{}
 const state=document.getElementById('reviewState'),timing=document.getElementById('reviewTiming');
 if(!status){state.textContent='상품 원본을 확인하고 있어요.';timing.textContent='';return}
 state.textContent=status.state==='expired'?'상품 사진 검토 보류 · 표시 기한이 지났어요.':status.state==='unavailable'?'상품 사진 검토 보류 · 원본을 불러오지 못했어요.':status.state==='ready'?status.unavailablePhotos?'상품 사진 일부 연결 실패 · 원본 확인이 필요해요.':status.displayedProducts?'상품 원본 표시 기한 내 · 사진 연결을 확인하며 둘러보세요.':'현재 표시할 상품이 없어요.':'상품 원본을 확인하고 있어요.';
 const format=value=>{const date=new Date(value);return value&&Number.isFinite(date.getTime())?new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(date)+' 한국시간':null};
 timing.textContent=[status.observedAt?'상품 수집 '+(format(status.observedAt)||'시각 확인 필요'):'',status.displayDeadline?'내부 사진 표시 기한 '+(format(status.displayDeadline)||'확인 필요'):''].filter(Boolean).join(' · ');
}
frame.addEventListener('load',()=>{try{frame.contentWindow.addEventListener('kkokkapick:catalog-status',updateReviewStatus)}catch{}updateReviewStatus()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateReviewStatus()});
updateReviewStatus();
document.querySelectorAll('nav a').forEach(link=>link.addEventListener('click',()=>{
 document.querySelectorAll('nav a').forEach(item=>item.removeAttribute('aria-current'));
 link.setAttribute('aria-current','page');
 const label=link.querySelector('strong').textContent;
 document.getElementById('screenLabel').textContent=label;
 frame.title='꼬까픽 '+label+' 미리보기';
 document.getElementById('openScreen').href=link.href;
 if(window.matchMedia('(max-width:740px)').matches)document.querySelector('.preview').scrollIntoView({block:'start'});
}));
const widthSelect=document.getElementById('previewWidth');
const screenWrap=document.querySelector('.screen-wrap');
function fitPreview(){const width=Number(widthSelect.value);const height=window.matchMedia('(max-width:740px)').matches?740:844;const available=Math.max(1,screenWrap.clientWidth-16);const scale=Math.min(1,available/width);frame.style.width=width+'px';frame.style.height=height+'px';frame.style.transform='scale('+scale+')';frame.style.left=Math.max(0,(available-width*scale)/2)+'px';screenWrap.style.height=height*scale+18+'px';}
widthSelect.addEventListener('change',fitPreview);
new ResizeObserver(fitPreview).observe(screenWrap);
fitPreview();
