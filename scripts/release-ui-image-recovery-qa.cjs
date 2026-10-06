/* Fault injection only. Mock photos/observation times do not establish source or visual QA. */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
async function main(){
 const root=process.cwd(),original=JSON.parse(fs.readFileSync('data/catalog.json','utf8'));
 assert.ok(Array.isArray(original.products),'catalog products required');
 assert.ok(original.products.filter(p=>!p.domain||p.domain==='apparel').length>=12,'12 apparel products required for the fixture');
 const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.woff':'font/woff'};
 const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}fs.readFile(file,(e,data)=>{if(e){res.writeHead(404);res.end();return}res.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream'});res.end(data)})});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try{
  browser=await chromium.launch({...process.env.QA_CHROMIUM_PATH?{executablePath:process.env.QA_CHROMIUM_PATH}:{},args:['--no-sandbox','--disable-dev-shm-usage']});
  for(const width of [320,375,390,430]){
   const context=await browser.newContext({viewport:{width,height:844},serviceWorkers:'block'}),page=await context.newPage(),fail=new Set(),counts=new Map(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   let stamp=Date.now();const fixture=original.products.filter(p=>!p.domain||p.domain==='apparel').slice(0,12).map((p,i)=>({...p,imageUrl:'https://photo-fixture.invalid/'+i+'/1.png',imageUrls:[1,2,3].map(n=>'https://photo-fixture.invalid/'+i+'/'+n+'.png')}));
   const first=String(fixture[0].id),urls=fixture[0].imageUrls;
   await page.route('**/data/catalog.json*',route=>route.fulfill({json:{...original,syncedAt:new Date(stamp).toISOString(),expiresAt:new Date(stamp+86400000).toISOString(),products:fixture,productCount:fixture.length}}));
   await page.route('**/data/price-history.json*',route=>route.fulfill({json:{events:[]}}));
   const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64');
   await page.route('https://photo-fixture.invalid/**',route=>{const u=route.request().url();counts.set(u,(counts.get(u)||0)+1);return fail.has(u)?route.fulfill({status:404,body:'expired'}):route.fulfill({contentType:'image/png',body:png})});
   fail.add(urls[0]);
   await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');
   await page.waitForFunction(()=>catalogState==='ready');await page.evaluate(()=>{limit=12;render()});await page.locator('.card[data-id="'+first+'"]').first().scrollIntoViewIfNeeded();
   await page.waitForFunction(id=>{const c=[...document.querySelectorAll('.card')].find(c=>c.dataset.id===id);return c?.querySelector('img')?.src.endsWith('/2.png')},first,{timeout:8000}).catch(async e=>{console.error({first,state:await page.evaluate(()=>({generation:photoAvailability.generation(),failed:photoAvailability.failedCount(),products:products.length,cards:[...document.querySelectorAll('.card')].map(c=>({id:c.dataset.id,src:c.querySelector('img')?.src,natural:c.querySelector('img')?.naturalWidth,retry:c.querySelector('img')?.dataset.imageRetry}))})),counts:[...counts.entries()],errors});throw e});
   assert.equal(await page.evaluate(()=>photoAvailability.failedCount()),1);
   const badge=page.locator('.card[data-id="'+first+'"] .image-count-badge').first();assert.equal(await badge.getAttribute('aria-label'),'상품 사진 2장');
   const seen=counts.get(urls[0]);await page.evaluate(async()=>{render();await loadProducts();render()});
   assert.equal(counts.get(urls[0]),seen,'same snapshot should not reload failed original');
   await page.evaluate(id=>openDetail(id),first);
   await page.waitForFunction(()=>document.querySelector('.detailpic img')?.naturalWidth>0);
   await page.evaluate(()=>{const track=document.querySelector('.detailpic .gallery-track');track.scrollLeft=track.clientWidth;track.dispatchEvent(new Event('scroll'))});
   await page.evaluate(url=>{photoAvailability.markFailed(url);refreshProductGallery(currentProduct,document.querySelector('.detailpic'))},urls[1]);
   await page.waitForFunction(()=>document.querySelectorAll('.detailpic .gallery-slide').length===1);
   assert.equal(await page.locator('.detailpic .gallery-dots').count(),0);assert.equal(await page.locator('.card[data-id="'+first+'"] .image-count-badge').count(),0);assert.equal(await page.locator('.detailpic img').getAttribute('src'),urls[2]);
   await page.evaluate(id=>{favs.add(id);localStorage.setItem('favs',JSON.stringify([...favs]));localStorage.setItem('priceAlerts',JSON.stringify({[id]:20000}))},first);
   await page.locator('#alertPrice').fill('12345');
   await page.evaluate(()=>{currentProduct.imageUrls.forEach(u=>photoAvailability.markFailed(u));hideProductWithoutPhotos(currentProduct)});
   assert.equal(await page.locator('#detail.on').count(),0);assert.equal(await page.evaluate(id=>products.some(p=>String(p.id)===id),first),false);
   assert.equal(await page.evaluate(id=>readStore('priceAlerts',{})[id],first),20000);assert.equal(await page.evaluate(id=>favs.has(id),first),true);
   assert.equal(await page.evaluate(id=>priceAlertDrafts.get(id),first),'12345');
   await page.evaluate(()=>{openFit();document.getElementById('childName').value='입력 중'});
   await page.evaluate(()=>{for(const p of [...products]){productImages(p).forEach(u=>photoAvailability.markFailed(u));hideProductWithoutPhotos(p)}});
   assert.equal(await page.locator('#childName').inputValue(),'입력 중');assert.equal(await page.evaluate(()=>products.length),0);
   assert.ok((await page.locator('#grid').innerText()).includes('상품 사진을 확인하지 못했어요'));
   fail.clear();stamp+=1000;await page.evaluate(()=>loadProducts());
   assert.equal(await page.evaluate(()=>products.length),fixture.length);assert.equal(await page.evaluate(()=>photoAvailability.failedCount()),0);
   assert.equal(await page.locator('#childName').inputValue(),'입력 중');await page.evaluate(()=>closeFit());await page.evaluate(id=>openDetail(id),first);
   assert.equal(await page.locator('#alertPrice').inputValue(),'12345');await page.evaluate(()=>closeDetail());
   // Explicit offline injection: failed display must not quarantine an original URL.
   const second=String(fixture[1].id),secondUrl=fixture[1].imageUrl.replace('/1.png','/offline.png');fail.add(secondUrl);await page.evaluate(()=>Object.defineProperty(navigator,'onLine',{value:false,configurable:true}));await page.locator('.card[data-id="'+second+'"]').first().scrollIntoViewIfNeeded();
   await page.evaluate(id=>{Object.defineProperty(navigator,'onLine',{value:false,configurable:true});const c=[...document.querySelectorAll('.card')].find(c=>c.dataset.id===id);const img=c.querySelector('img');img.removeAttribute('src');const p=products.find(p=>String(p.id)===id),url=p.imageUrl.replace('/1.png','/offline.png');p.imageUrls.push(url);img.src=url},second);
   await page.waitForFunction(()=>[...document.querySelectorAll('.image-unavailable')].some(e=>e.textContent.includes('인터넷 연결')),{},{timeout:8000}).catch(async e=>{console.error(await page.evaluate(()=>({online:navigator.onLine,failed:photoAvailability.failedCount(),notes:[...document.querySelectorAll('.image-unavailable')].map(e=>e.textContent),images:[...document.querySelectorAll('.card img')].map(i=>({url:i.src,natural:i.naturalWidth,complete:i.complete,connected:i.isConnected}))})));console.error([...counts.entries()]);throw e});
   assert.equal(await page.evaluate(()=>photoAvailability.failedCount()),0);
   fail.delete(secondUrl);await page.evaluate(()=>{Object.defineProperty(navigator,'onLine',{value:true,configurable:true});window.dispatchEvent(new Event('online'))});
   await page.waitForFunction(()=>![...document.querySelectorAll('.image-unavailable')].some(e=>e.textContent.includes('인터넷 연결')));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
   console.log('PASS '+width+'px: shared recovery, quarantine, gallery dots, saved records, draft/child input, new snapshot, offline distinction');
   await context.close();
  }
 }finally{try{if(browser)await browser.close()}finally{await new Promise(r=>server.close(r))}}
}
main().catch(e=>{console.error(e);process.exitCode=1});
