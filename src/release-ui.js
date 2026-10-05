// Presentation and interaction controller. Provider data and fit evidence stay unchanged.
const VERIFIED_SIZE_CHARTS={
  "에뜨와":{source:"official_ettoimall_brand_size_guide",rows:[{size:"70",months:[0,3],height:64,weight:null},{size:"75",months:[3,6],height:70,weight:null},{size:"80",months:[6,12],height:74,weight:null},{size:"90",months:[12,24],height:80,weight:null},{size:"100",months:[24,36],height:87,weight:null},{size:"3Y",months:[36,48],height:95,weight:null},{size:"4Y",months:[36,48],height:105,weight:null}]},
  "아가방":{source:"official_brand_size_guide",rows:[{size:"1M",months:[1,1],height:48,weight:5.1},{size:"3M",months:[3,3],height:54,weight:7.2},{size:"60",months:[3,6],height:60,weight:8.4},{size:"9M",months:[6,9],height:68,weight:9.5},{size:"75",months:[7,10],height:72,weight:10.3},{size:"80",months:[9,12],height:76,weight:null},{size:"90",months:[12,24],height:84,weight:12.8},{size:"100",months:[36,36],height:92,weight:13.7},{size:"110",months:[48,48],height:101,weight:15.7},{size:"120",months:[60,60],height:110,weight:19.7},{size:"130",months:[72,72],height:119,weight:23.6}]}
};
function detectBrand(name){name=String(name||"");if(/(?:아가방|AGABANG)/i.test(name))return"아가방";if(/(?:에뜨와(?:HB)?|ETTOI)/i.test(name))return"에뜨와";return null}
function positiveNumber(value){if(value===null||value===undefined||value==="")return null;const n=Number(value);return Number.isFinite(n)&&n>0?n:null}
function evaluateFit(profile,product){if(product.domain&&product.domain!=="apparel")return{status:"not_applicable",label:"의류 전용 사이즈 안내"};const rawMonths=profile&&profile.months,months=rawMonths!==null&&rawMonths!==undefined&&rawMonths!==''&&Number(rawMonths)>=0?Number(rawMonths):null,height=positiveNumber(profile&&profile.height),weight=positiveNumber(profile&&profile.weight);if(months===null||height===null||weight===null)return{status:"profile_required",label:"아이 정보가 더 필요해요"};const brand=product.brand||detectBrand(product.name),chart=VERIFIED_SIZE_CHARTS[brand];if(!chart)return{status:"insufficient_product_data",label:"사이즈 정보 확인 필요"};const ranked=chart.rows.map(function(row){let s=Math.abs(height-row.height);if(row.weight!=null)s+=Math.abs(weight-row.weight)*1.5;const lo=row.months[0],hi=row.months[1];if(months<lo)s+=(lo-months)*.6;if(months>hi)s+=(months-hi)*.6;return{row:row,score:s}}).sort(function(a,b){return a.score-b.score});const best=ranked[0]&&ranked[0].row;if(!best)return{status:"insufficient_product_data",label:"사이즈 정보 확인 필요"};return{status:"recommended",label:best.size+" 우선 확인",recommendedSize:best.size,brand:brand,source:chart.source}}
function positivePrice(value){if(value===null||value===undefined||value==="")return null;const n=Number(value);return Number.isFinite(n)&&n>0?n:null}
function getLatestPriceChange(events,productId){let latest=null,latestTime=-Infinity;(events||[]).forEach(function(event){if(String(event.productId)!==String(productId))return;const time=Date.parse(event.observedAt);if(Number.isFinite(time)&&time>=latestTime){latest=event;latestTime=time}});return latest}
function isTargetPriceReached(currentPrice,targetPrice){const current=positivePrice(currentPrice),target=positivePrice(targetPrice);return current!==null&&target!==null&&current<=target}
function recommendationScore(product,context){product=product||{};context=context||{};let score=0;if(product.domain&&product.domain!=="apparel"){if(context.months!==undefined){score+=KkokkapickProductDomain.matchesMonths(product,context.months)?12:0;}return score;}if(product.fitStatus==="verified")score+=18;else if(product.fitStatus==="candidate")score+=4;if(product.brand)score+=3;const offers=Number(product.offerCount||(product.offers&&product.offers.length)||0);score+=Math.min(Math.max(offers-1,0),4)*5;if(context.stage&&context.stage!=="전체"){if(product.stage===context.stage)score+=12;else if(context.stage==="토들러"&&(product.stage==="유아"||product.stage==="키즈"))score+=5}if(Number(product.minPrice)>0)score+=1;return score}
function compareRecommended(a,b,context){const diff=recommendationScore(b,context)-recommendationScore(a,context);if(diff)return diff;const ao=Number(a.offerCount||(a.offers&&a.offers.length)||0),bo=Number(b.offerCount||(b.offers&&b.offers.length)||0);if(bo!==ao)return bo-ao;const ap=Number(a.minPrice)||Infinity,bp=Number(b.minPrice)||Infinity;if(ap!==bp)return ap-bp;return String(a.id||"").localeCompare(String(b.id||""))}
function safeDestination(value){try{const u=new URL(value);return u.protocol==="http:"||u.protocol==="https:"?value:null}catch(e){return null}}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function won(n){return n?Number(n).toLocaleString('ko-KR')+'원':'가격 확인'}
function priceRange(p){return p.offerCount>1&&p.maxPrice>p.minPrice?won(p.minPrice)+' ~ '+won(p.maxPrice):won(p.minPrice)}
function discountOf(o){const a=Number(o?.originalPrice),p=Number(o?.price);return a>p&&p>0?Math.round((1-p/a)*100):null}
function categoryOf(p){let q=p.query||'',n=p.name||'';if(/바디수트|바디슈트|우주복/.test(q+n))return'바디수트';if(/원피스/.test(q+n))return'원피스';if(/가디건|아우터|점퍼|자켓|코트/.test(q+n))return'아우터';if(/상하복|내복|내의|실내복/.test(q+n))return'상하복';if(/티셔츠|맨투맨|셔츠/.test(q+n))return'상의';if(/바지|레깅스/.test(q+n))return'하의';return'기타'}
function stageForMonths(m){if(m<4)return'신생아';if(m<24)return'베이비';if(m<48)return'유아';if(m<72)return'토들러';return'키즈'} function fitLabel(){let raw=activeChild()?.months;if(raw===null||raw===undefined||raw==='')return null;return stageForMonths(+raw)+' 상품'}
function fitForProduct(p){
 if(!KkokkapickProductDomain.isApparel(p))return {kind:'not_applicable',html:''};
 const profile=activeChild()||{};
 const result=evaluateFit(profile,p);
 if(result.status==='profile_required')
   return{kind:'profile',html:'<div class="offer"><div><span>아이 정보를 알려주시면<br>공식 사이즈표를 확인해요.</span></div><button class="buy" onclick="closeDetail();openFit()">아이 등록</button></div>'};
 if(result.status==='recommended')
   return{kind:'verified',html:'<div class="offer"><div><b>꼬까핏 · '+esc(result.label)+'</b><br><span>'+esc(result.brand)+' 공식 권장 사이즈표 기준</span></div><span class="fit">공식 기준</span></div><p class="note">아이 체형과 상품별 핏에 따라 달라질 수 있으므로 판매처의 실제 옵션과 상세 사이즈를 최종 확인하세요.</p>'};
 if(p.fitStatus==='candidate')
   return{kind:'candidate',html:'<div class="offer"><div><b>꼬까핏 · 공식 사이즈표 확인 중</b><br><span>판매처 자료는 확인했지만 브랜드 공식 원문 검증 전이라 사이즈를 추천하지 않아요.</span></div></div>'};
 return{kind:'unknown',html:'<div class="offer"><div><b>꼬까핏 · 사이즈 정보 확인 필요</b><br><span>검증된 브랜드 사이즈표가 없어 임의로 추천하지 않아요.</span></div></div>'};
}
function materialLabel(p){const value=p.material||p.materials||p.composition;return Array.isArray(value)?value.join(', '):value||'판매처 상세페이지 확인'}
function sizeLabel(p){return (p.availableSizes||[]).length?p.availableSizes.join(', '):'판매처 옵션 및 실측 확인'}
function productInfoHtml(p){
 if(!KkokkapickProductDomain.isApparel(p)){const e=p.ageEvidence;const age=e?esc(e.rawText)+(e.source==='product_title'?' · 상품명 기준':' · 판매처 제공'):'판매처 권장 연령 확인';return `<div class="product-info"><div class="info-row"><b>카테고리</b><span>${esc(p.cat)}</span></div><div class="info-row"><b>대상 연령</b><span>${age}</span></div><div class="info-row"><b>소재</b><span>${esc(materialLabel(p))}</span></div><div class="info-row"><b>구성 · 규격</b><span>판매처 상세페이지 확인</span></div><div class="info-row"><b>사용상 주의</b><span>판매처 사용 연령·주의사항·인증 정보 확인</span></div></div><p class="note">월령만으로 사용 적합성이나 안전성을 보장하지 않습니다. 구매 전 작은 부품, 보호자 지도 및 원본 주의사항을 확인해 주세요.</p>`;}
 const rows=[['브랜드',p.brand||'판매처에서 확인'],['카테고리',p.cat||'판매처에서 확인'],['소재',materialLabel(p)],['사이즈',sizeLabel(p)]];
 const color=p.color||p.colors;if(color)rows.push(['색상',Array.isArray(color)?color.join(', '):color]);
 for(const [key,label] of [['season','시즌'],['thickness','두께'],['careInstructions','세탁 / 취급']])if(p[key])rows.push([label,p[key]]);
 return '<div class="product-info">'+rows.map(([label,value])=>'<div class="info-row"><b>'+esc(label)+'</b><span>'+esc(value)+'</span></div>').join('')+'</div><p class="note">소재와 사이즈는 판매처가 제공한 정보만 표시합니다. 구매 전 상세페이지의 혼용률·실측·옵션을 확인해 주세요.</p>';
}

function readStore(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
const childStore=KkokkapickChildProfiles.createStore(localStorage);
let editingChildId=null;
let products=[], priceHistory=[], cat='전체', stage='전체', brand='전체', view='home', favOnly=false;
let favs=new Set(readStore('favs',[]).map(String)), cats=['전체'], limit=20;
let searchLayout='browse',selectedPhotoId=null, searchDomain='apparel';
function matchesPlayStage(p,value){if(value==='전체')return true;if(value==='아이월령')return KkokkapickProductDomain.matchesMonths(p,activeChild()?.months);const bounds={신생아:[0,3],베이비:[4,23],유아:[24,47],토들러:[48,71],키즈:[72,180]}[value];const e=p.ageEvidence;return !!e&&!!bounds&&e.minMonths<=bounds[0]&&(e.maxMonths===null||e.maxMonths>=bounds[1]);}
function setSearchDomain(value){searchDomain=value==='play'?'play':'apparel';clearFilters();searchLayout='products';limit=20;render();}
function fitSection(p){return KkokkapickProductDomain.isApparel(p)?`<section class="detail-section fit-section"><h2>꼬까핏 <small>${esc(activeChild()?.name||'우리 아이')} 사이즈</small></h2>${fitForProduct(p).html}</section>`:'';}

let filters={size:'',seller:'',min:0,max:0}, draftStage='전체', currentProduct=null, lastFocus=null, focusOrigin=null, overlayScrollY=0;
const $=id=>document.getElementById(id);
const heartIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 8.8c0 5.2-8.5 10.2-8.5 10.2S3.5 14 3.5 8.8C3.5 5.7 7.3 4 9.5 6.3L12 8.8l2.5-2.5c2.2-2.3 6-.6 6 2.5Z"/></svg>';
// Only remove identifiable commerce metadata. Never rewrite the provider payload.
function displayName(p) {
  let name=String(p.name||'');
  name=name.replace(/\[[^\]]*\]/g,' ').replace(/\((?:[A-Z][A-Z/ _-]*|\d{5,})\)/g,' ').replace(/[_\s]?[A-Z0-9]*\d[A-Z0-9]{7,}\b/g,' ');
  name=name.trim();
  if(p.brand) { const escaped=p.brand.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); name=name.replace(new RegExp('^(?:'+escaped+'\\s*)+','i'),''); }
  return name.replace(/\(모자\)/g,' + 모자 세트').replace(/아양우주복/g,'아양 우주복').replace(/\s+/g,' ').trim() || p.name;
}
function productImages(p){return [...new Set([p.imageUrl,...(Array.isArray(p.imageUrls)?p.imageUrls:[])].filter(u=>typeof u==='string'&&/^https:\/\//.test(u)))];}
function imageGallery(p,className){
 const urls=productImages(p);if(!urls.length)return `<div class="${className}"><span class="image-unavailable">상품 사진 준비 중</span></div>`;
 return `<div class="${className} image-gallery${urls.length>1?' with-multiple':''}"><div class="gallery-track" tabindex="0" aria-label="${esc(displayName(p))} 상품 사진, 좌우로 넘기기">${urls.map((url,i)=>`<div class="gallery-slide"><img src="${esc(url)}" alt="${esc(displayName(p))} 사진 ${i+1}" ${i?'loading="lazy"':''}></div>`).join('')}</div>${urls.length>1?`<div class="gallery-dots" role="group" aria-label="상품 사진 선택">${urls.map((_,i)=>`<button type="button" class="gallery-dot" data-gallery-dot="${i}" aria-label="${i+1}번째 상품 사진, 총 ${urls.length}장" aria-pressed="${i===0}"><span aria-hidden="true"></span></button>`).join('')}</div>`:''}</div>`;
}
function bindImageGalleries(root){root.querySelectorAll('.image-gallery').forEach(gallery=>{
 const track=gallery.querySelector('.gallery-track'),slides=[...track.children];
 const update=()=>{const i=Math.round(track.scrollLeft/track.clientWidth);gallery.querySelectorAll('[data-gallery-dot]').forEach(dot=>dot.setAttribute('aria-pressed',Number(dot.dataset.galleryDot)===i));};
 const behavior=()=>window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth';
 gallery.querySelectorAll('[data-gallery-dot]').forEach(dot=>dot.addEventListener('click',()=>track.scrollTo({left:Number(dot.dataset.galleryDot)*track.clientWidth,behavior:behavior()})));track.addEventListener('scroll',update,{passive:true});track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();track.scrollBy({left:(e.key==='ArrowRight'?1:-1)*track.clientWidth,behavior:behavior()})}});update();
 });}
function imageHtml(p,detail=false) { if(detail)return imageGallery(p,'detailpic');return `<div class="${detail?'detailpic':'pic'}">${p.imageUrl?`<img src="${esc(p.imageUrl)}" alt="${esc(displayName(p))}" ${detail?'':'loading="lazy"'}>`:'<span class="image-unavailable">상품 사진 준비 중</span>'}</div>`; }
function bindImages(root=document) { root.querySelectorAll('img').forEach(img=>{if(img.dataset.imageBound)return;img.dataset.imageBound='true';const owner=img.closest('[data-photo],.card[data-id]');const product=owner?products.find(p=>String(p.id)===String(owner.dataset.photo||owner.dataset.id)):null;const candidates=img.closest('.image-gallery')?[]:productImages(product||{});const attempted=new Set([img.getAttribute('src')]);let retryCount=0,retryPending=false;const recover=()=>{if(retryPending||!img.isConnected||!img.complete||img.naturalWidth>0)return;if(retryCount<2){const url=img.getAttribute('src');const delay=[350,900][retryCount++];retryPending=true;img.dataset.imageRetry='true';img.removeAttribute('src');setTimeout(()=>{retryPending=false;if(img.isConnected)img.src=url;delete img.dataset.imageRetry},delay);return}const next=candidates.find(url=>!attempted.has(url));if(next){attempted.add(next);retryCount=0;img.src=next;return}if(img.closest('.photo-tile')){img.closest('.photo-tile').remove();$('photoFeedNote').hidden=false;$('photoFeedNote').textContent='일부 사진을 확인 중이에요. 나머지 상품은 상품 목록에서 볼 수 있어요.';if(!$('photoGrid').querySelector('.photo-tile'))$('photoFeedNote').textContent='상품 사진을 확인 중이에요. 상품 목록에서 가격과 정보를 확인해 주세요.';return;}const text=document.createElement('span');text.className='image-unavailable';text.textContent='상품 사진을 불러올 수 없어요';img.replaceWith(text);};img.addEventListener('error',recover);if(img.complete&&!img.naturalWidth)queueMicrotask(recover); }); }
function productCard(p) {
  const best=(p.offers||[]).slice().sort((a,b)=>(a.price||Infinity)-(b.price||Infinity))[0], discount=discountOf(best);
  return `<article class="card" data-id="${esc(p.id)}"><button class="product-link" data-product="${esc(p.id)}" aria-label="${esc(displayName(p))} 상세 보기">${imageHtml(p)}${productImages(p).length>1?`<span class="image-count-badge" aria-label="상품 사진 ${productImages(p).length}장">▧ ${productImages(p).length}</span>`:''}<span class="brandline">${esc(p.brand||p.merchant||'키즈 셀렉션')}</span><span class="name">${esc(displayName(p))}</span><span class="price">${discount?`<span class="discount">${discount}%</span>`:''}${won(p.price)}${p.offerCount>1?'부터':''}</span><span class="merchant">${p.offerCount>1?`${p.offerCount}개 판매처 · 가격 비교`:esc(p.merchant||'판매처에서 확인')}</span>${p.fitStatus==='verified'?'<span class="fit">꼬까핏 가능</span>':''}</button><button class="heart" data-fav="${esc(p.id)}" aria-label="${esc(displayName(p))} 찜" aria-pressed="${favs.has(String(p.id))}">${heartIcon}</button></article>`;
}
function bindCards(root) {
  root.querySelectorAll('[data-product]').forEach(b=>b.onclick=()=>openDetail(b.dataset.product));
  root.querySelectorAll('[data-fav]').forEach(b=>b.onclick=()=>fav(b.dataset.fav)); bindImages(root);
}
let catalogItems=[],catalogMorePending=false;
const catalogObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)&&window.scrollY>0)growCatalog()},{rootMargin:'0px 0px -80px 0px'});
function checkCatalogScroll(event){if((window.scrollY<=0&&event?.type==='scroll')||$('catalogSentinel').hidden)return;const edge=$('catalogSentinel').getBoundingClientRect().top;if(edge<window.innerHeight+120)growCatalog()}
window.addEventListener('scroll',checkCatalogScroll,{passive:true});
window.addEventListener('wheel',e=>{if(e.deltaY>0)checkCatalogScroll(e)},{passive:true});
let catalogTouchY=0;window.addEventListener('touchstart',e=>{catalogTouchY=e.touches[0]?.clientY||0},{passive:true});window.addEventListener('touchmove',e=>{if((e.touches[0]?.clientY||0)<catalogTouchY)checkCatalogScroll(e)},{passive:true});
function updateCatalogObserver(){catalogObserver.disconnect();const photo=view==='search'&&searchLayout==='photos';const total=photo?catalogItems.filter(p=>p.imageUrl).length:catalogItems.length;const canLoad=view!=='my'&&!(view==='search'&&searchLayout==='browse')&&total>limit;$('catalogSentinel').hidden=!canLoad;$('catalogStatus').hidden=!total||view==='my';$('catalogStatus').textContent=canLoad?'스크롤하면 상품을 더 불러와요.':'상품을 모두 확인했어요.';if(canLoad)catalogObserver.observe($('catalogSentinel'))}
function photoTile(p){return `<button class="photo-tile" data-photo="${esc(p.id)}" aria-label="${esc(displayName(p))} 상품 카드 보기"><img src="${esc(p.imageUrl)}" alt="${esc(displayName(p))}" loading="lazy"></button>`}
function growCatalog(){if(catalogMorePending||document.querySelector('.sheet.on'))return;const photo=view==='search'&&searchLayout==='photos';const items=photo?catalogItems.filter(p=>p.imageUrl):catalogItems;if(limit>=items.length)return;if(photo&&!$('photoGrid').querySelector('.photo-tile')){catalogObserver.disconnect();$('catalogStatus').textContent='상품 사진을 확인 중이에요. 상품 목록에서 정보를 확인해 주세요.';return}catalogMorePending=true;
 requestAnimationFrame(()=>{try{const start=limit;limit=Math.min(items.length,limit+(photo?12:20));const root=photo?$('photoGrid'):$('grid');root.insertAdjacentHTML('beforeend',items.slice(start,limit).map(photo?photoTile:productCard).join(''));if(photo){root.querySelectorAll('[data-photo]').forEach(b=>b.onclick=()=>openPhotoCard(b.dataset.photo));bindImages(root)}else bindCards(root);updateCatalogObserver()}finally{catalogMorePending=false}});
}
function render() {
 const play=searchDomain==='play';cats=['전체',...new Set(products.filter(p=>play?!KkokkapickProductDomain.isApparel(p):KkokkapickProductDomain.isApparel(p)).map(p=>p.cat))];
 $('domainSwitch').querySelectorAll('[data-domain]').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.domain===searchDomain);b.onclick=()=>setSearchDomain(b.dataset.domain)});$('playAgeNote').hidden=!play;$('browseMode').hidden=play;
 if(play&&searchLayout==='browse')searchLayout='products';
 $('fitOnly').closest('label').hidden=play;$('filterFitOnly').closest('label').hidden=play;$('filterSize').closest('label').hidden=play;$('sizeFilterNote').hidden=play;

  $('chips').innerHTML=cats.map(c=>`<button class="category-tab ${cat===c?'active':''}" data-cat="${esc(c)}" aria-pressed="${cat===c}">${esc(c==='바디수트'?'우주복':c)}</button>`).join('');
  $('chips').querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{cat=b.dataset.cat;limit=searchLayout==='photos'?12:20;render()});
  $('searchStages').innerHTML=['전체',...(searchDomain==='play'&&activeChild()?['아이월령']:[]),'신생아','베이비','유아','토들러','키즈'].map(c=>`<button class="chip ${stage===c?'active':''}" data-search-stage="${c}" aria-pressed="${stage===c}">${c}</button>`).join('');
  $('searchStages').querySelectorAll('button').forEach(b=>b.onclick=()=>{stage=b.dataset.searchStage;if(searchLayout==='browse')searchLayout='products';limit=searchLayout==='photos'?12:20;render()});
  const brands=['전체',...new Set(products.map(p=>p.brand).filter(Boolean))];
  $('brands').innerHTML=brands.map(c=>`<button class="chip ${brand===c?'active':''}" data-brand="${esc(c)}" aria-pressed="${brand===c}">${esc(c)}</button>`).join('');
  $('brands').querySelectorAll('[data-brand]').forEach(b=>b.onclick=()=>{brand=b.dataset.brand;if(searchLayout==='browse')searchLayout='products';limit=searchLayout==='photos'?12:20;render()});
  const q=view==='search'?$('q').value.trim().toLowerCase():'', fitOnly=view==='search'&&$('fitOnly').checked;
  let a=products.filter(p=>{
    const hay=`${p.name} ${p.brand||''} ${p.cat} ${p.stage} ${(p.offers||[]).map(o=>o.merchant).join(' ')}`.toLowerCase();
    return (view!=='home'||KkokkapickProductDomain.isApparel(p))&&(view!=='search'||(searchDomain==='apparel'?KkokkapickProductDomain.isApparel(p):!KkokkapickProductDomain.isApparel(p)))&&(!favOnly||favs.has(String(p.id))) && (view!=='search'||((brand==='전체'||p.brand===brand)&&(searchDomain==='play'?matchesPlayStage(p,stage):(stage==='전체'||p.stage===stage||(stage==='토들러'&&['유아','키즈'].includes(p.stage))))&&(cat==='전체'||cat===p.cat)&&(!fitOnly||p.fitStatus==='verified')&&(!filters.size||(p.availableSizes||[]).includes(filters.size))&&(!filters.seller||(p.offers||[]).some(o=>o.merchant===filters.seller))&&(!filters.min||p.price>=filters.min)&&(!filters.max||p.price<=filters.max)&&q.split(/\s+/).every(t=>hay.includes(t))));
  });
  const sort=view==='search'?$('sort').value:'popular';
  if(sort==='low') a.sort((x,y)=>(x.price||Infinity)-(y.price||Infinity));
  if(sort==='high') a.sort((x,y)=>(y.price||0)-(x.price||0));
  if(sort==='drop') a.sort((x,y)=>{const drop=p=>{const e=getLatestPriceChange(priceHistory,p.id);return e?.direction==='down'?Math.abs(e.changeAmount):0};return drop(y)-drop(x)});
  if(sort==='popular') a.sort((x,y)=>compareRecommended(x,y,{months:activeChild()?.months,stage:view==='search'&&stage!=='전체'?stage:(fitLabel()?stageForMonths(+activeChild().months):null)}));
  catalogItems=a;
  const active=view==='search'?[stage!=='전체'?stage:'',cat!=='전체'?cat:'',brand!=='전체'?brand:'',filters.size?`사이즈 ${filters.size}`:'',filters.seller,filters.min||filters.max?`${filters.min?won(filters.min):'0원'} ~ ${filters.max?won(filters.max):'제한 없음'}`:'',fitOnly?'꼬까핏':'',q?`“${q}”`:''].filter(Boolean):[];
  $('resultCount').textContent=`${a.length.toLocaleString('ko-KR')}개`;
  $('activeSummary').textContent=active.join(' · '); $('clearFilters').hidden=!active.length;
  $('filterCount').textContent=[stage!=='전체',brand!=='전체',!!filters.size,!!filters.seller,!!filters.min||!!filters.max].filter(Boolean).length||'';
  let html=a.slice(0,limit).map(productCard).join('');
  if(!a.length) {
    html=favOnly?`<div class="empty wishlist-empty"><div class="empty-heart" aria-hidden="true">♥</div><h3>마음에 드는 상품을 모아두세요</h3><p>상품의 하트를 누르면 여기에서 다시 볼 수 있어요.</p><button class="text-link" onclick="setView('search')">상품 둘러보기 ↗</button></div><h3 class="empty-recommendations">이런 상품은 어때요?</h3>${products.slice().sort((x,y)=>compareRecommended(x,y,{})).slice(0,4).map(productCard).join('')}`:`<div class="empty"><h3>조건에 맞는 상품이 없어요</h3><p>검색어나 필터를 바꿔서 다시 찾아보세요.</p><button class="text-link" onclick="clearFilters()">전체 상품 보기</button></div>`;
  }
  if(!a.length&&view==='search'&&searchDomain==='play'&&stage!=='전체'&&catalogState==='ready')html='<div class="empty"><h3>이 월령으로 확인할 수 있는 상품이 없어요</h3><p>사용 연령 근거가 없는 상품은 월령 검색에 포함하지 않아요.</p><button class="text-link" onclick="clearFilters()">전체 놀이 · 교구 보기</button></div>';
  if(['expired','unavailable'].includes(catalogState))html='<div class="empty"><h3>최신 상품 정보를 확인하지 못했어요</h3><p>잠시 후 다시 확인해 주세요.</p><button class="text-link" onclick="loadProducts()">다시 확인</button></div>';
  $('grid').innerHTML=html; bindCards($('grid'));
  const photoMode=view==='search'&&searchLayout==='photos';document.querySelector('.app').classList.toggle('photo-mode',photoMode);$('searchStages').hidden=photoMode;$('grid').hidden=photoMode;$('photoGrid').hidden=!photoMode;$('photoFeedNote').hidden=true;$('browsePanel').hidden=searchLayout!=='browse';$('chips').hidden=searchLayout==='browse';
  for(const [mode,id] of [['browse','browseMode'],['photos','photoMode'],['products','productsMode']])$(id).setAttribute('aria-pressed',searchLayout===mode);
  if(photoMode){$('sectionTitle').textContent='사진으로 만나는 꼬까픽';$('photoFeedNote').textContent='눈길이 가는 옷, 사진을 눌러 만나보세요.';$('photoGrid').innerHTML=a.filter(p=>p.imageUrl).slice(0,limit).map(photoTile).join('');$('photoGrid').querySelectorAll('[data-photo]').forEach(b=>b.onclick=()=>openPhotoCard(b.dataset.photo));bindImages($('photoGrid'));requestAnimationFrame(sizePhotoGrid);if(!a.length){$('photoFeedNote').hidden=false;$('photoFeedNote').textContent=['expired','unavailable'].includes(catalogState)?'최신 상품 사진을 확인하지 못했어요. 잠시 후 다시 확인해 주세요.':searchDomain==='play'&&stage!=='전체'?'이 월령으로 확인할 수 있는 상품이 없어요. 전체 월령에서 더 둘러보세요.':'조건에 맞는 상품이 없어요. 검색어나 필터를 바꿔 보세요.';}}else if(view==='search')$('sectionTitle').textContent='검색 결과'; updateCatalogObserver(); $('favCount').textContent=favs.size?`찜 ${favs.size}`:'찜';
  const child=activeChild(); $('fitHero').textContent=child?`${child.name} · ${child.months}개월 사이즈 확인`:'우리 아이에게 맞는 사이즈';renderChildContexts();
  if(view==='home'){const compared=products.filter(p=>KkokkapickProductDomain.isApparel(p)&&p.offerCount>1).slice(0,4);$('comparisonGrid').innerHTML=compared.map(productCard).join('');bindCards($('comparisonGrid'));$('homeMore').hidden=!compared.length;}
  if(view==='my')renderMy();
}
function browseCategory(c){if(searchDomain!=='apparel')setSearchDomain('apparel');cat=c;setView('search')}
function fav(id){id=String(id);favs.has(id)?favs.delete(id):favs.add(id);localStorage.setItem('favs',JSON.stringify([...favs]));render();document.querySelectorAll('[data-fav]').forEach(b=>b.setAttribute('aria-pressed',favs.has(String(b.dataset.fav))));if(selectedPhotoId&&$('photoCard').classList.contains('on')){const b=$('photoCardContent').querySelector('[data-photo-fav]');if(b){b.setAttribute('aria-pressed',favs.has(String(selectedPhotoId)));b.textContent=favs.has(String(selectedPhotoId))?'♥ 찜':'♡ 찜'}}if(currentProduct&&$('detail').classList.contains('on')){const b=$('detailPanel').querySelector('.wishlist-action');b.setAttribute('aria-pressed',favs.has(String(currentProduct.id)));b.textContent=favs.has(String(currentProduct.id))?'♥ 찜':'♡ 찜'} }
function renderMy(){const child=activeChild();const parts=['months','height','weight'].map((k,i)=>child?.[k]!==undefined&&child?.[k]!==''?child[k]+['개월','cm','kg'][i]:'').filter(Boolean);if(child)parts.unshift(child.name);$('myProfileSummary').textContent=parts.join(' · ')||'월령 · 키 · 몸무게를 등록해 주세요.';$('myFavStat').textContent=favs.size;$('myRecentStat').textContent=readStore('recentProducts',[]).length;$('myAlertStat').textContent=Object.keys(readStore('priceAlerts',{})).length;$('myFavSummary').textContent=favs.size+'개';$('myAlertSummary').textContent=Object.keys(readStore('priceAlerts',{})).length+'개 저장됨'}
function setView(next){
  document.querySelector('.toast')?.remove();
  view=next;favOnly=next==='favorites';limit=next==='home'?4:next==='search'&&searchLayout==='photos'?12:20;
  $('searchTools').hidden=next!=='search';$('homeHero').hidden=next!=='home';$('homeCategories').hidden=next!=='home';$('homeFit').hidden=next!=='home';$('homeMore').hidden=next!=='home';$('myPage').hidden=next!=='my';$('catalogSection').hidden=next==='my';
  $('sectionTitle').textContent=next==='search'?'검색 결과':next==='favorites'?'찜한 상품':fitLabel()?'우리 아이를 위한 추천':'오늘의 꼬까픽';$('catalogEyebrow').textContent=next==='search'?'PRODUCTS':next==='favorites'?'MY PICKS':'DISCOVER';
  ['homeNav','searchNav','favNav','myNav'].forEach(id=>{const b=$(id),active=id===({home:'homeNav',search:'searchNav',favorites:'favNav',my:'myNav'}[next]);b.classList.toggle('on',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});render();window.scrollTo(0,0);
}
function toggleFavOnly(){setView(favOnly?'home':'favorites')}
function clearFilters(){cat='전체';stage='전체';brand='전체';filters={size:'',seller:'',min:0,max:0};$('q').value='';$('fitOnly').checked=false;$('sort').value='popular';limit=searchLayout==='photos'?12:20;render()}
function populateSelect(id,values,selected,all='전체'){ $(id).innerHTML=`<option value="">${all}</option>`+[...new Set(values)].filter(Boolean).sort((a,b)=>String(a).localeCompare(String(b),'ko',{numeric:true})).map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');$(id).value=selected; }
function openFilters(){const domainProducts=products.filter(p=>searchDomain==='apparel'?KkokkapickProductDomain.isApparel(p):!KkokkapickProductDomain.isApparel(p));$('filterFitOnly').checked=$('fitOnly').checked;draftStage=stage;renderStages();populateSelect('filterBrand',domainProducts.map(p=>p.brand),brand==='전체'?'':brand);populateSelect('filterSize',domainProducts.flatMap(p=>p.availableSizes||[]),filters.size);populateSelect('filterSeller',domainProducts.flatMap(p=>(p.offers||[]).map(o=>o.merchant)),filters.seller);$('minPrice').value=filters.min||'';$('maxPrice').value=filters.max||'';$('filterError').textContent='';showSheet('filters')}
function renderStages(){$('stages').innerHTML=['전체',...(searchDomain==='play'&&activeChild()?['아이월령']:[]),'신생아','베이비','유아','토들러','키즈'].map(s=>`<button type="button" class="chip ${draftStage===s?'active':''}" data-stage="${s}" aria-pressed="${draftStage===s}">${s}</button>`).join('');$('stages').querySelectorAll('button').forEach(b=>b.onclick=()=>{draftStage=b.dataset.stage;renderStages()})}
function applyFilters(){const min=Number($('minPrice').value),max=Number($('maxPrice').value);if(max&&max<min){$('filterError').textContent='최대 가격은 최소 가격보다 커야 해요.';return}$('fitOnly').checked=$('filterFitOnly').checked;stage=draftStage;brand=$('filterBrand').value||'전체';filters={size:$('filterSize').value,seller:$('filterSeller').value,min,max};if(searchLayout==='browse')searchLayout='products';limit=searchLayout==='photos'?12:20;closeFilters();render()}
function closeFilters(){hideSheet('filters')}
function openDetail(id){
  if($('accountSheet').classList.contains('on'))closeAccount();if($('photoCard').classList.contains('on'))closePhotoCard();
  const p=products.find(x=>String(x.id)===String(id));if(!p)return;currentProduct=p;
  const recent=readStore('recentProducts',[]).filter(x=>String(x)!==String(id));localStorage.setItem('recentProducts',JSON.stringify([String(id),...recent].slice(0,20)));
  const offers=(p.offers||[]).slice().sort((a,b)=>(a.price||Infinity)-(b.price||Infinity));
  const rows=offers.map((o,i)=>`<div class="offer"><div><b>${esc(o.merchant||'판매처')}</b>${i===0&&offers.length>1?' <span class="fit">최저가</span>':''}<br><strong>${won(o.price)}</strong>${discountOf(o)?`<span class="oldprice">${won(o.originalPrice)}</span>`:''}</div><button class="buy" ${safeDestination(o.affiliateUrl)?`data-buy="${esc(o.affiliateUrl)}"`:'disabled'}>판매처 보기 ↗</button></div>`).join('');
  $('detailPanel').innerHTML=`<div class="detail-header"><button class="close" onclick="closeDetail()" aria-label="상품 상세 닫기">←</button><span>상품 상세</span><div class="detail-tools"><button class="icon-button" onclick="shareProduct()" aria-label="상품 공유"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3m-4 4 4-4 4 4M7 10H4v11h16V10h-3"/></svg></button></div></div>${imageHtml(p,true)}<div class="detail-summary"><p class="detail-brand">${esc(p.brand||p.merchant)}</p><h1 id="detailTitle">${esc(displayName(p))}</h1><p class="detail-price">${discountOf(offers[0])?`<span class="discount">${discountOf(offers[0])}%</span>`:''}${won(p.price)}</p><p class="meta">${esc(p.cat)}${offers.length>1?' · '+offers.length+'개 판매처에서 비교':''}</p></div>${fitSection(p)}<section class="detail-section"><h2>판매처 가격 비교 <small>${offers.length}곳</small></h2>${rows||'<p class="meta">판매처 정보를 확인하고 있어요.</p>'}<p class="note">판매처에서 옵션·배송비·최종 가격을 확인해 주세요.</p></section><section class="detail-section"><h2>상품 정보</h2>${productInfoHtml(p)}<details class="raw-name"><summary>판매처 원본 상품명</summary><p>${esc(p.name)}</p></details></section><section class="detail-section"><h2>가격 알림</h2>${priceAlertHtml(p)}</section><div class="detail-actions"><button class="buy wishlist-action" aria-label="상품 찜" aria-pressed="${favs.has(String(p.id))}" data-detail-fav="${esc(p.id)}">${favs.has(String(p.id))?'♥ 찜':'♡ 찜'}</button><button class="buy" ${safeDestination(offers[0]?.affiliateUrl)?`data-buy="${esc(offers[0].affiliateUrl)}"`:'disabled'}>구매하기 ↗</button></div>`;
  $('detailPanel').querySelector('[data-detail-fav]').onclick=()=>fav(p.id);bindBuy($('detailPanel'));bindImages($('detailPanel'));showSheet('detail');bindImageGalleries($('detailPanel'));$('detailPanel').scrollTop=0;
}
function bindBuy(root){root.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{const url=safeDestination(b.dataset.buy);if(url)window.open(url,'_blank','noopener')})}
function priceChangeHtml(p){const e=getLatestPriceChange(priceHistory,p.id);if(!e)return'';return `<p class="meta">지난 확인보다 ${won(Math.abs(Number(e.changeAmount)||0))} ${e.direction==='down'?'내려갔어요':'올랐어요'}</p>`}
function priceAlertHtml(p){const v=readStore('priceAlerts',{})[p.id]||'';return `${priceChangeHtml(p)}<label class="field" for="alertPrice">희망 가격${isTargetPriceReached(p.price,v)?' · 희망가 도달':''}</label><div class="alert-controls"><input id="alertPrice" type="number" min="1" inputmode="numeric" value="${esc(v)}" placeholder="예: 30000" aria-label="희망 가격"><button class="buy" data-save-price-alert="${esc(p.id)}">저장</button></div><p class="note">희망 가격은 이 기기에 저장돼요. 알림 발송은 로그인·백엔드 연동 후 제공됩니다.</p>`}
function savePriceAlert(id){const v=Number($('alertPrice').value),alerts=readStore('priceAlerts',{});if(v>0&&Number.isFinite(v))alerts[id]=Math.round(v);else delete alerts[id];localStorage.setItem('priceAlerts',JSON.stringify(alerts));toast(v>0?'희망 가격을 저장했어요':'희망 가격을 해제했어요');renderMy()}
function lockPageScroll(){if(document.body.dataset.overlayLocked==='1')return;overlayScrollY=window.scrollY||0;document.body.dataset.overlayLocked='1';document.body.style.position='fixed';document.body.style.top=`-${overlayScrollY}px`;document.body.style.left='0';document.body.style.right='0';document.body.style.width='100%';document.querySelector('.app').inert=true;document.querySelector('.bottom').inert=true}
function unlockPageScroll(){if(document.body.dataset.overlayLocked!=='1')return;document.body.dataset.overlayLocked='0';document.body.style.position='';document.body.style.top='';document.body.style.left='';document.body.style.right='';document.body.style.width='';document.querySelector('.app').inert=false;document.querySelector('.bottom').inert=false;window.scrollTo(0,overlayScrollY)}
function showSheet(id){document.querySelector('.toast')?.remove();if(!document.querySelector('.sheet.on')){lastFocus=document.activeElement;focusOrigin=null;for(const key of ['photo','product','fav'])if(lastFocus?.dataset?.[key]){focusOrigin={key,value:lastFocus.dataset[key],scope:lastFocus.closest('[id]')?.id};break}}lockPageScroll();$(id).classList.add('on');$(id).querySelector('.panel').focus()}
function hideSheet(id){$(id).classList.remove('on');if(!document.querySelector('.sheet.on')){unlockPageScroll();restoreOverlayFocus();requestAnimationFrame(()=>{sizePhotoGrid();updateCatalogObserver()})}}
function restoreOverlayFocus(){if(lastFocus?.isConnected){lastFocus.focus({preventScroll:true});return}const root=focusOrigin?.scope?$(focusOrigin.scope):document;const next=focusOrigin&&root?root.querySelector(`[data-${focusOrigin.key}="${CSS.escape(focusOrigin.value)}"]`):null;(next||document.querySelector('.nav.on'))?.focus({preventScroll:true})}
function closeDetail(){hideSheet('detail');currentProduct=null}
function openFit(){fillChildForm(activeChild());renderChildManager();showSheet('fit')}
function closeFit(){hideSheet('fit')}
function saveFit(){try{childStore.save({name:$('childName').value,months:$('months').value,height:$('height').value,weight:$('weight').value},editingChildId)}catch(e){$('childFormError').hidden=false;$('childFormError').textContent=/월령/.test(e.message)?e.message:'아이 정보를 저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.';return}closeFit();limit=view==='home'?4:searchLayout==='photos'?12:20;render();renderMy();toast('아이 정보를 저장했어요')}
function toast(message){document.querySelector('.toast')?.remove();const el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.textContent=message;document.body.append(el);setTimeout(()=>el.remove(),2600)}
function openAccount(kind){
 const titles={recent:'최근 본 상품',alerts:'가격 알림',settings:'설정'};$('accountSheetTitle').textContent=titles[kind];let html='';
 if(kind==='recent'||kind==='alerts'){const ids=kind==='recent'?readStore('recentProducts',[]):Object.keys(readStore('priceAlerts',{}));const list=ids.map(id=>products.find(p=>String(p.id)===String(id))).filter(Boolean);html=list.length?`<div class="grid">${list.map(productCard).join('')}</div>`:`<p class="empty">${kind==='recent'?'최근 본 상품이 없어요.':'저장한 희망 가격이 없어요.'}</p>`;}
 if(kind==='settings')html='<div class="account-menu"><button onclick="closeAccount();openFit()">아이 정보 수정<span>›</span></button><a href="privacy.html">개인정보 처리방침<span>›</span></a><a href="account-deletion.html">정보 삭제 안내<span>›</span></a><a href="support.html">고객센터<span>›</span></a></div><p class="note">찜과 희망 가격, 아이 정보는 현재 기기에 저장됩니다.</p>';
 $('accountContent').innerHTML=html;bindCards($('accountContent'));showSheet('accountSheet');
}
function closeAccount(){hideSheet('accountSheet')}
let catalogRefreshing=false, catalogInitialized=false, catalogLastAttempt=0, catalogState='loading';
async function loadProducts(){
 if(catalogRefreshing)return;
 catalogRefreshing=true;catalogLastAttempt=Date.now();
 try{
  const {catalog:d,history}=await KkokkapickCatalogSource.load(fetch,location);
  priceHistory=Array.isArray(history?.events)?history.events:[];
  if(KkokkapickCatalogSource.isExpired(d)){
   catalogState='expired';products=[];render();
   return;
  }
  catalogState='ready';
  products=(d.products||[]).filter(p=>p.imageUrl||p.imageUrls?.length).map((p,i)=>({...p,id:p.id||String(i),price:p.minPrice,merchant:p.offers?.[0]?.merchant||'',cat:p.category||categoryOf(p),stage:p.stage||'전체'}));
  cats=['전체',...new Set(products.map(p=>p.cat))];render();
  // Background refresh preserves the current view, filters and scroll depth.
  if(!catalogInitialized){
   catalogInitialized=true;
   const params=new URL(location.href).searchParams;const entryView=params.get('view');
   if(['home','search','favorites','my'].includes(entryView))setView(entryView);
   if(entryView==='search'&&['browse','photos','products'].includes(params.get('mode')))setSearchLayout(params.get('mode'));
   const deepLink=params.get('product')||(params.get('sample')==='detail'?products[0]?.id:params.get('sample')==='multiple'?products.find(p=>productImages(p).length>1)?.id:null);
   if(deepLink)openDetail(deepLink);
  }
 }catch(e){if(!products.length){catalogState='unavailable';render()}}
 finally{catalogRefreshing=false}
}
function refreshVisibleCatalog(){if(!document.hidden&&!document.querySelector('.sheet.on')&&Date.now()-catalogLastAttempt>=5*60*1000)loadProducts()}
setInterval(refreshVisibleCatalog,5*60*1000);
document.addEventListener('visibilitychange',refreshVisibleCatalog);
window.addEventListener('online',refreshVisibleCatalog);
async function loadCommercialHome(){return{campaigns:[],popup:null}}
document.querySelectorAll('[data-home-stage]').forEach(b=>b.onclick=()=>{if(searchDomain!=='apparel')setSearchDomain('apparel');stage=b.dataset.homeStage;setView('search')});
$('q').addEventListener('input',()=>{if(searchLayout==='browse')searchLayout='products';limit=searchLayout==='photos'?12:20;render()});
document.addEventListener('click',e=>{const b=e.target.closest('[data-save-price-alert]');if(b)savePriceAlert(b.dataset.savePriceAlert)});
document.querySelectorAll('.sheet').forEach(sheet=>{sheet.addEventListener('touchmove',e=>{if(e.target===sheet)e.preventDefault()},{passive:false});sheet.addEventListener('click',e=>{if(e.target===sheet){({detail:closeDetail,fit:closeFit,filters:closeFilters,accountSheet:closeAccount,photoCard:closePhotoCard})[sheet.id]()}})});
document.addEventListener('keydown',e=>{const sheets=[...document.querySelectorAll('.sheet.on')];const sheet=sheets.at(-1);if(!sheet)return;if(e.key==='Escape'){({detail:closeDetail,fit:closeFit,filters:closeFilters,accountSheet:closeAccount,photoCard:closePhotoCard})[sheet.id]();return}if(e.key==='Tab'){const nodes=[...sheet.querySelectorAll('button,input,select,a,summary,[tabindex="0"]')].filter(el=>el.offsetWidth&&!el.disabled);const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===sheet.querySelector('.panel'))){e.preventDefault();last?.focus()}else if(!e.shiftKey&&(document.activeElement===last)){e.preventDefault();first?.focus()}}});
window.__kkokkapickBooted=true;
setView('home');loadProducts();if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>console.warn('오프라인 캐시를 준비하지 못했어요. 온라인 탐색은 계속 사용할 수 있어요.'));

function setSearchLayout(mode){searchLayout=mode;limit=mode==='photos'?12:30;render()}
function openPhotoCard(id){
 const p=products.find(p=>String(p.id)===String(id));if(!p)return;selectedPhotoId=String(id);
 $('photoCardContent').innerHTML=`${imageGallery(p,'photo-card-image')}<div class="selected-product"><p class="detail-brand">${esc(p.brand||p.merchant)}</p><h3 id="photoCardTitle">${esc(displayName(p))}</h3><p class="price">${won(p.price)}</p><p class="meta">${p.offerCount>1?p.offerCount+'개 판매처에서 가격 비교':esc(p.merchant)}</p>${KkokkapickProductDomain.isApparel(p)?`<p class="product-meta">소재 · ${esc(materialLabel(p))}<br>사이즈 · ${esc(sizeLabel(p))}</p>`:`<p class="product-meta">대상 연령 · ${p.ageEvidence?esc(p.ageEvidence.rawText)+(p.ageEvidence.source==='product_title'?' (상품명 기준)':''):'판매처 권장 연령 확인'}<br>소재 · ${esc(materialLabel(p))}</p>`}</div><div class="photo-card-actions"><button class="buy" data-photo-fav aria-pressed="${favs.has(String(id))}">${favs.has(String(id))?'♥ 찜':'♡ 찜'}</button><button class="cta" data-photo-detail>상품 자세히 보기</button></div>`;
 $('photoCardContent').querySelector('[data-photo-fav]').onclick=()=>fav(id);$('photoCardContent').querySelector('[data-photo-detail]').onclick=()=>openDetail(id);bindImages($('photoCardContent'));showSheet('photoCard');bindImageGalleries($('photoCardContent'));
}
function closePhotoCard(){hideSheet('photoCard');selectedPhotoId=null}
async function shareProduct(){if(!currentProduct)return;const url=new URL(location.href);url.searchParams.set('product',currentProduct.id);try{if(navigator.share)await navigator.share({title:displayName(currentProduct),url:url.href});else if(navigator.clipboard){await navigator.clipboard.writeText(url.href);toast('상품 링크를 복사했어요')}else toast('이 브라우저에서는 공유 기능을 지원하지 않아요')}catch(e){if(e.name!=='AbortError')toast('상품 링크를 공유하지 못했어요')}}
document.querySelectorAll('[data-search-stage]').forEach(b=>{if(!b.closest('#searchStages'))b.onclick=()=>{stage=b.dataset.searchStage;setSearchLayout('products')}});
document.querySelectorAll('[data-search-cat]').forEach(b=>b.onclick=()=>{cat=b.dataset.searchCat;setSearchLayout('products')});

function sizePhotoGrid(){const grid=$('photoGrid');if(grid.hidden||document.querySelector('.sheet.on'))return;const top=grid.getBoundingClientRect().top+window.scrollY;const nav=document.querySelector('.bottom').getBoundingClientRect().height;grid.style.setProperty('--photo-row-height',Math.max(60,Math.min(grid.clientWidth/3,(window.innerHeight-nav-top-12)/4))+'px')}
window.addEventListener('resize',sizePhotoGrid);window.visualViewport?.addEventListener('resize',sizePhotoGrid);

function activeChild(){return childStore.current()}
function renderChildContexts(){const children=childStore.all(),child=activeChild();
 for(const id of ['childContext','myChildSelector']){const el=$(id);el.hidden=id==='childContext'&&view==='my';el.innerHTML=children.length?`<label>아이 기준 <select class="child-switch" aria-label="추천 기준 아이 선택">${children.map(c=>`<option value="${esc(c.id)}" ${c.id===child?.id?'selected':''}>${esc(c.name)} · ${esc(c.months)}개월</option>`).join('')}</select></label><button class="text-link" onclick="openFit()">아이 정보</button>${id==='childContext'&&view==='search'?`<span class="context-count">${catalogItems.length}개</span>`:''}`:`<button class="text-link" onclick="openFit()">${view==='search'&&searchDomain==='play'?'아이 정보로 월령 확인':'아이 정보로 사이즈 확인'} ›</button>${id==='childContext'&&view==='search'?`<span class="context-count">${catalogItems.length}개</span>`:''}`;el.querySelector('select')?.addEventListener('change',e=>selectChild(e.target.value));}
}
function selectChild(id){try{if(!childStore.select(id))return}catch{renderChildContexts();toast('아이 선택을 저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.');return}limit=view==='home'?4:searchLayout==='photos'?12:20;render();renderMy();if($('fit').classList.contains('on'))fillChildForm(activeChild());if(currentProduct&&$('detail').classList.contains('on')){const section=$('detailPanel').querySelector('.fit-section');if(section)section.innerHTML=`<h2>꼬까핏 <small>${esc(activeChild().name)}의 사이즈</small></h2>${fitForProduct(currentProduct).html}`;}if(!$('fit').classList.contains('on'))$(view==='my'?'myChildSelector':'childContext').querySelector('select')?.focus();}
function renderChildManager(){const child=activeChild();$('childManager').innerHTML=`<div class="child-tabs">${childStore.all().map(c=>`<button type="button" data-select-child="${esc(c.id)}" aria-pressed="${c.id===editingChildId}">${esc(c.name)}</button>`).join('')}<button type="button" class="add-child" onclick="beginNewChild()">+ 아이 추가</button></div>`;$('childManager').querySelectorAll('[data-select-child]').forEach(b=>b.onclick=()=>{selectChild(b.dataset.selectChild);renderChildManager();$('childManager').querySelector(`[data-select-child="${CSS.escape(b.dataset.selectChild)}"]`)?.focus()})}
function fillChildForm(child){editingChildId=child?.id||null;$('childName').value=child?.name||'';['months','height','weight'].forEach(k=>$(k).value=child?.[k]??'');$('childFormError').hidden=true;$('deleteChild').hidden=!child;$('childDeleteConfirm').hidden=true;}
function beginNewChild(){fillChildForm(null);renderChildManager();$('childName').focus();}

function confirmChildDelete(){if(!editingChildId)return;$('childDeleteConfirm').hidden=false;$('childDeleteText').textContent=`${$('childName').value||'이 아이'}의 정보를 이 브라우저에서 삭제할까요? 찜과 희망 가격은 유지됩니다.`;$('cancelChildDelete').focus()}
function removeChild(){try{if(!childStore.remove(editingChildId))return}catch{toast('삭제를 저장하지 못했어요. 다시 확인해 주세요.');return}fillChildForm(activeChild());renderChildManager();render();renderMy();toast('아이 정보를 삭제했어요')}
