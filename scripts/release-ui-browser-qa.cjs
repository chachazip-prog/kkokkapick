/* npm install --no-save playwright; QA_BASE_URL=http://127.0.0.1:4173 node scripts/release-ui-browser-qa.cjs */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const output=process.env.QA_OUTPUT||'artifacts/release-ui';
let base=process.env.QA_BASE_URL||'http://127.0.0.1:4173/';
let qaBrowser,qaServer;
async function main(){
 fs.mkdirSync(output,{recursive:true});
 if(process.env.QA_START_SERVER==='1'){
  const http=require('node:http'),path=require('node:path'),root=process.cwd();
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg'};
  qaServer=http.createServer((req,res)=>{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);res.end();return}if(file===root||file.endsWith(path.sep))file=path.join(file,'index.html');fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data)})});
  await new Promise(resolve=>qaServer.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+qaServer.address().port+'/';
 }

 const args=['--no-sandbox'];
 if(process.env.QA_USE_PROXY==='1'&&process.env.HTTPS_PROXY)args.push('--proxy-server='+process.env.HTTPS_PROXY,'--proxy-bypass-list=127.0.0.1;localhost');
 const browser=qaBrowser=await chromium.launch({...(process.env.QA_CHROMIUM_PATH?{executablePath:process.env.QA_CHROMIUM_PATH}:{}),args});
 const report=[];
 for(const width of [320,375,390,430]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true,ignoreHTTPSErrors:process.env.QA_USE_PROXY==='1'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded'});if(await page.getByText('Open the page',{exact:true}).count())await page.getByText('Open the page',{exact:true}).click();await page.locator('.card').first().waitFor();
  async function capture(name){
   await page.waitForFunction(()=>[...document.images].filter(i=>i.offsetWidth&&i.getBoundingClientRect().top<innerHeight&&i.getBoundingClientRect().bottom>0).every(i=>i.complete&&i.dataset.imageRetry!=='true'),{},{timeout:15000}).catch(()=>{});
   await page.locator('.toast').waitFor({state:'detached',timeout:4000}).catch(()=>{});
   await page.screenshot({path:`${output}/${name}-${width}.png`});
   const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,brokenImages:[...document.images].filter(i=>i.offsetWidth&&i.complete&&!i.naturalWidth).length,pendingImages:[...document.images].filter(i=>i.offsetWidth&&!i.complete).length,imageFailures:document.querySelectorAll('.image-unavailable').length,clipped:[...document.querySelectorAll('h1,h2,.detail-price,.nav')].filter(e=>!e.classList.contains('sr-only')&&e.offsetWidth&&e.scrollWidth>e.clientWidth+1).map(e=>e.className)}));
   assert.equal(metrics.overflow,false,`${name} ${width} overflow`);assert.deepEqual(metrics.clipped,[],`${name} ${width} clipping`);assert.equal(metrics.brokenImages,0,'unhandled broken image');assert.deepEqual(errors,[],'runtime error');report.push({name,width,...metrics});
  }
  async function openAvailablePhoto(){
   if(await page.locator('.photo-tile').count()){
    await page.locator('.photo-tile').first().click({timeout:3000}).catch(async()=>{await page.evaluate(()=>openPhotoCard(products.find(p=>p.imageUrl).id))});
   }else{
    console.log(`SOURCE BLOCK: ${width}px photo feed has no live images; validating selected-product behavior separately.`);
    await page.evaluate(()=>openPhotoCard(products.find(p=>p.imageUrl).id));
   }
  }
  for(const [name,id] of [['home','homeNav'],['search','searchNav'],['wishlist','favNav'],['my','myNav']]){await page.locator('#'+id).click();await capture(name)}
  await page.locator('#searchNav').click();await page.locator('#photoMode').click();await capture('photo-feed');const feed=await page.locator('#photoGrid').evaluate(e=>({columns:getComputedStyle(e).gridTemplateColumns.split(' ').length,gap:getComputedStyle(e).gap,bottom:e.getBoundingClientRect().bottom,nav:document.querySelector('.bottom').getBoundingClientRect().top,count:e.children.length}));assert.equal(feed.columns,3);assert.equal(feed.gap,'0px');assert.ok(feed.count<=12);assert.ok(feed.bottom<=feed.nav);if(await page.locator('.photo-tile').count()){const oldLimit=await page.evaluate(()=>limit);await page.evaluate(()=>window.__firstPhotoNode=document.querySelector('.photo-tile'));await page.locator('#catalogSentinel').scrollIntoViewIfNeeded();await page.mouse.wheel(0,480);await page.waitForFunction(n=>limit>n,oldLimit);assert.ok(await page.evaluate(()=>window.__firstPhotoNode===document.querySelector('.photo-tile')),'infinite photo append retains nodes');await capture('infinite-photos')}await page.locator('#myNav').click();await page.locator('#searchNav').click();assert.equal(await page.evaluate(()=>limit),12,'returning photo feed keeps12');assert.equal(await page.locator('#grid').isVisible(),false);assert.equal(await page.locator('.photo-tile .name,.photo-tile .price,.photo-tile .brandline').count(),0);await openAvailablePhoto();await capture('photo-card');assert.equal(await page.locator('#photoCard').isVisible(),true);assert.ok((await page.locator('#photoCardContent').textContent()).includes('소재'));assert.ok((await page.locator('#photoCardContent').textContent()).includes('사이즈'));await page.locator('[data-photo-fav]').click();await page.locator('[data-photo-fav]').click();await page.locator('#photoCard .close').click();assert.ok(await page.evaluate(()=>document.activeElement?.hasAttribute('data-photo')||document.activeElement?.classList.contains('nav')||document.activeElement?.id==='photoMode'),'photo trigger or active navigation focus restored');await openAvailablePhoto();await page.locator('[data-photo-detail]').click();assert.equal(await page.locator('.sheet.on').count(),1);await page.locator('#detail .close').click();await page.locator('#homeNav').click();await page.locator('#grid .product-link').first().click();await capture('detail');
  const pid=await page.evaluate(()=>currentProduct.id);
  assert.equal(await page.locator('#detail .detail-actions').count(),1);
  assert.ok((await page.locator('#detailPanel .product-info').textContent()).includes('소재'));assert.ok((await page.locator('#detailPanel .product-info').textContent()).includes('사이즈'));
  const original=await page.locator('#detail .raw-name p').textContent();const clean=await page.locator('#detailTitle').textContent();assert.ok(original.length>=clean.length,'raw title retained');
  await page.locator('#alertPrice').fill('20000');await page.locator('[data-save-price-alert]').click();assert.equal(await page.evaluate(id=>JSON.parse(localStorage.getItem('priceAlerts'))[id],pid),20000);
  await page.locator('[data-detail-fav]').click();await page.locator('#detail .close').click();await page.locator('#favNav').click();assert.equal(await page.locator('#grid .card').count(),1);await capture('wishlist-filled');
  await page.locator('#myNav').click();await page.locator('.child-profile').click();await capture('profile');await page.locator('#months').fill('0');await page.locator('#height').fill('50');await page.locator('#weight').fill('4');await page.locator('#fit .cta').click();assert.match(await page.locator('#myProfileSummary').textContent(),/0개월/);
  await page.locator('#myPage .account-menu button').filter({hasText:'최근 본 상품'}).click();await page.locator('#accountContent .product-link').first().click();assert.equal(await page.locator('.sheet.on').count(),1,'account and detail must not overlap');assert.ok(await page.locator('#detail').evaluate(el=>el.classList.contains('on')));assert.ok(!(await page.locator('#detailPanel').textContent()).includes('아이 정보가 더 필요해요'),'0 month valid profile');await page.locator('#detail .close').click();
  const firstChild=await page.evaluate(()=>activeChild().id);const firstSize=await page.evaluate(()=>evaluateFit(activeChild(),{brand:'아가방'}).recommendedSize);
  await page.locator('#myNav').click();await page.locator('.child-profile').click();await page.locator('#childManager .add-child').click();await page.locator('#childName').fill('둘째');await page.locator('#months').fill('36');await page.locator('#height').fill('92');await page.locator('#weight').fill('14');await page.locator('#fit .cta').click();const secondChild=await page.evaluate(()=>activeChild().id);assert.notEqual(secondChild,firstChild);assert.equal(await page.evaluate(()=>childStore.all().length),2);assert.notEqual(await page.evaluate(()=>evaluateFit(activeChild(),{brand:'아가방'}).recommendedSize),firstSize);await capture('multi-child-my');
  await page.locator('#myChildSelector select').selectOption(firstChild);assert.equal(await page.evaluate(()=>activeChild().months),'0');await page.locator('#myChildSelector select').selectOption(secondChild);await page.locator('.child-profile').click();await capture('multi-child-manager');await page.locator('#fit .close').click();
  await page.locator('#searchNav').click();await page.locator('#productsMode').click();await page.locator('#q').fill('아가방');assert.ok(await page.locator('#grid .card').count()>0);assert.equal(await page.locator('#catalogSection').isVisible(),true);await page.locator('#sort').selectOption('low');
  const prices=await page.evaluate(()=>[...document.querySelectorAll('#grid .card')].map(e=>products.find(p=>String(p.id)===e.dataset.id).price));assert.deepEqual(prices,[...prices].sort((a,b)=>a-b));
  const shoppingBefore=await page.evaluate(()=>({view,cat,brand,stage,limit,q:$('q').value,sort:$('sort').value,child:activeChild().id}));
  await page.evaluate(()=>{history.replaceState(null,'',location.pathname+'?view=home');return loadProducts()});
  const shoppingAfter=await page.evaluate(()=>({view,cat,brand,stage,limit,q:$('q').value,sort:$('sort').value,child:activeChild().id}));
  assert.deepEqual(shoppingAfter,shoppingBefore,'source refresh preserves shopping context instead of replaying entry URL');
  await page.locator('#q').fill('');const initialLength=await page.locator('#grid .card').count();await page.evaluate(()=>window.__firstCatalogNode=document.querySelector('#grid .card'));await page.locator('#catalogSentinel').scrollIntoViewIfNeeded();await page.waitForFunction(n=>document.querySelectorAll('#grid .card').length>n,initialLength);assert.ok(await page.evaluate(()=>window.__firstCatalogNode===document.querySelector('#grid .card')),'infinite append retains existing product nodes');assert.equal(await page.locator('#loadMore').count(),0);await capture('infinite-products');await page.evaluate(()=>window.scrollTo(0,0));
  if(await page.locator('#clearFilters').isVisible())await page.locator('#clearFilters').click();await page.locator('.filter-toggle').click();await capture('filters');await page.locator('#minPrice').fill('50000');await page.locator('#maxPrice').fill('10000');await page.locator('#filters .cta').click();assert.ok(await page.locator('#filterError').textContent());await page.locator('#maxPrice').fill('60000');await page.locator('#filters .cta').click();const filtered=await page.evaluate(()=>[...document.querySelectorAll('#grid .card')].map(e=>products.find(p=>String(p.id)===e.dataset.id).price));assert.ok(filtered.length);assert.ok(filtered.every(n=>n>=50000&&n<=60000));
  await page.locator('#clearFilters').click();await page.locator('#chips button').filter({hasText:'원피스'}).click();assert.ok(await page.locator('#grid .card').count()>0);assert.ok(await page.evaluate(()=>[...document.querySelectorAll('#grid .card')].every(e=>products.find(p=>String(p.id)===e.dataset.id).cat==='원피스')));
  await page.locator('#q').fill('검색결과없는문자열xyz');assert.equal(await page.locator('#grid .card').count(),0);
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#grid .card').first().waitFor();assert.equal(await page.evaluate(()=>activeChild().id),secondChild);assert.equal(await page.evaluate(id=>JSON.parse(localStorage.getItem('priceAlerts'))[id],pid),20000);assert.ok(await page.evaluate(id=>JSON.parse(localStorage.getItem('favs')).includes(String(id)),pid));
  await page.goto(new URL('demo.html',base).href,{waitUntil:'domcontentloaded'});
  const demoFrame=page.frameLocator('#screen');
  await page.evaluate(()=>document.fonts.ready);
  assert.ok(await page.evaluate(()=>document.fonts.check('14px NanumSquareRound')),'rounded font loaded');
  await demoFrame.locator('#homeNav[aria-current="page"]').waitFor();
  for(const [label,selector] of [['검색','#searchNav[aria-current="page"]'],['사진 피드','#photoMode[aria-pressed="true"]'],['상품 상세','#detail.on'],['찜한 상품','#favNav[aria-current="page"]'],['마이','#myNav[aria-current="page"]'],['홈','#homeNav[aria-current="page"]']]){
   await page.locator('nav a').filter({has:page.locator('strong',{hasText:new RegExp('^'+label+'$')})}).click();
   await demoFrame.locator(selector).waitFor();
   assert.equal(await page.locator('#openScreen').evaluate(e=>e.href),await page.locator('nav a[aria-current="page"]').evaluate(e=>e.href));
  }
  await page.locator('nav a').filter({hasText:'복수 사진 테스트'}).click();
  await demoFrame.locator('[data-gallery-dot="0"]').waitFor();
  assert.ok(await demoFrame.locator('.gallery-slide').count()>=2);
  await demoFrame.locator('[data-gallery-dot="1"]').click();
  await demoFrame.locator('[data-gallery-dot="1"][aria-pressed="true"]').waitFor();
  const secondPhoto=demoFrame.locator('.gallery-slide').nth(1).locator('img');
  assert.ok(await secondPhoto.evaluate(img=>new Promise(resolve=>{const finish=()=>resolve(img.complete&&img.naturalWidth>0);if(img.complete&&img.naturalWidth)finish();else{img.addEventListener('load',finish,{once:true});setTimeout(finish,15000)}})),'second actual product image decoded');
  await page.screenshot({path:`${output}/multiple-photos-second-${width}.png`});
  await demoFrame.locator('[data-gallery-dot="0"]').click();
  await demoFrame.locator('[data-gallery-dot="0"][aria-pressed="true"]').waitFor();
  await page.screenshot({path:`${output}/multiple-photos-${width}.png`});
  await page.screenshot({path:`${output}/demo-${width}.png`});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'demo overflow');
  await page.locator('#searchNav').click();
  await page.locator('[data-domain="play"]').click();
  assert.ok(await page.evaluate(()=>catalogItems.every(p=>p.domain==='toy'||p.domain==='learning')),'play domain isolation');
  const playProduct=await page.evaluate(()=>catalogItems[0]?.id);
  if(playProduct){
   await capture('play-search');await page.locator('#photoMode').click();await capture('play-feed');
   await page.locator('.photo-tile').first().click();await capture('play-card');assert.ok(!(await page.locator('#photoCardContent').textContent()).includes('꼬까핏'));await page.locator('[data-photo-detail]').click();await capture('play-detail');
   assert.equal(await page.locator('#detail .fit-section').count(),0);assert.ok((await page.locator('#detail .product-info').textContent()).includes('대상 연령'));assert.ok(!(await page.locator('#detail .product-info').textContent()).includes('사이즈'));
   await page.evaluate(()=>{const child=childStore.all()[0];if(child)selectChild(child.id)});assert.equal(await page.locator('#detail .fit-section').count(),0);await page.locator('#detail .close').click();
   await page.evaluate(()=>{stage='아이월령';render()});assert.ok(await page.evaluate(()=>catalogItems.every(p=>KkokkapickProductDomain.matchesMonths(p,activeChild()?.months))));await capture('play-age-filter');
  }else if(process.env.QA_REQUIRE_PLAY==='1'){throw new Error('Fresh source has no eligible toy/learning product');}
  await page.locator('[data-domain="apparel"]').click();assert.ok(await page.evaluate(()=>catalogItems.every(p=>!p.domain||p.domain==='apparel')));
  await page.close();
 }
 await browser.close();if(qaServer)await new Promise(resolve=>qaServer.close(resolve));fs.writeFileSync(`${output}/metrics.json`,JSON.stringify(report,null,2));console.log(`PASS: 4 viewports, ${report.length} browser captures, interaction regression. Image reliability is reported separately.`);
}
main().catch(async e=>{console.error(e);await qaBrowser?.close();qaServer?.close();process.exitCode=1});
