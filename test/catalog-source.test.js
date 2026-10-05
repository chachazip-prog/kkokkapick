const test=require('node:test');const assert=require('node:assert/strict');const source=require('../src/catalog-source.js');
test('immutable review preview reads live generated catalog without freezing source URLs',()=>{const urls=source.urls({hostname:'raw.githack.com',pathname:'/chachazip-prog/kkokkapick/'+ 'a'.repeat(40)+'/index.html'},123);assert.equal(urls.catalog,'https://raw.githubusercontent.com/chachazip-prog/kkokkapick/main/data/catalog.json?ts=123');assert.ok(urls.history.endsWith('/price-history.json?ts=123'))});
test('production and local browsers keep their own generated catalog',()=>{for(const location of [{hostname:'localhost',pathname:'/'},{hostname:'chachazip-prog.github.io',pathname:'/kkokkapick/'},{hostname:'raw.githack.com',pathname:'/another/project/'},{hostname:'raw.githack.com.evil.test',pathname:'/chachazip-prog/kkokkapick/'+ 'a'.repeat(40)+'/'}])assert.equal(source.urls(location,123).catalog,'./data/catalog.json?ts=123')});
test('an explicit expiry is enforced at its boundary',()=>{assert.equal(source.isExpired({expiresAt:'2026-10-04T00:00:00Z'},Date.parse('2026-10-04T00:00:00Z')),true);assert.equal(source.isExpired({expiresAt:'2026-10-04T00:00:00Z'},Date.parse('2026-10-03T23:59:59Z')),false)});

test("malformed explicit expiry cannot silently admit stale source data",()=>{assert.equal(source.isExpired({expiresAt:"invalid"}),true)});

test("legacy TTL catalogs cannot bypass expiry by omitting expiresAt",()=>{assert.equal(source.isExpired({storagePolicy:"ttl_cache",syncedAt:"2026-10-03T00:00:00Z"},Date.parse("2026-10-04T00:00:00Z")),true);assert.equal(source.isExpired({storagePolicy:"ttl_cache"}),true)});

const previewLocation={hostname:'raw.githack.com',pathname:'/chachazip-prog/kkokkapick/'+ 'a'.repeat(40)+'/index.html'};
test('preview chooses fresher review metadata with its matching price history',async()=>{const now=Date.parse('2026-10-04T12:00:00Z');const calls=[];const result=await source.load(async url=>{calls.push(url);return new Response(JSON.stringify(url.includes('price-history')?{events:[{branch:url.includes('/codex/')}]}:{groupingVersion:2,products:[],storagePolicy:'ttl_cache',syncedAt:url.includes('/codex/')?'2026-10-04T11:00:00Z':'2026-10-04T05:00:00Z'}))},previewLocation,now);assert.equal(result.catalog.syncedAt,'2026-10-04T11:00:00Z');assert.equal(result.history.events[0].branch,true);assert.equal(calls.length,3)});
test('failed review source still allows current main; both failures never silently reuse expired data',async()=>{const result=await source.load(async url=>url.includes('/codex/')?new Response('',{status:503}):new Response(JSON.stringify(url.includes('price-history')?{events:[]}:{groupingVersion:2,products:[],syncedAt:'2026-10-04T05:00:00Z',storagePolicy:'ttl_cache'})),previewLocation,Date.parse('2026-10-04T12:00:00Z'));assert.equal(result.catalog.syncedAt,'2026-10-04T05:00:00Z');await assert.rejects(source.load(async()=>new Response('',{status:503}),previewLocation),/Catalog fetch failed/)});
test('expired source does not fetch history or pretend it is fresh',async()=>{let calls=0;const result=await source.load(async()=>{calls++;return new Response(JSON.stringify({groupingVersion:2,products:[],storagePolicy:'ttl_cache',syncedAt:'2026-10-03T00:00:00Z'}))},{hostname:'localhost'},Date.parse('2026-10-04T12:00:00Z'));assert.equal(source.isExpired(result.catalog,Date.parse('2026-10-04T12:00:00Z')),true);assert.equal(result.history,null);assert.equal(calls,1)});

test('temporary provider photos use a display window distinct from24h metadata retention',()=>{
 const catalog={storagePolicy:'ttl_cache',syncedAt:'2026-10-04T12:00:00Z',expiresAt:'2026-10-05T12:00:00Z',products:[{imageUrl:'https://d2iaagr1j041pi.cloudfront.net/apis/search_img.php?code=123'}]};
 assert.equal(source.isExpired(catalog,Date.parse('2026-10-04T13:29:59Z')),false);
 assert.equal(source.isExpired(catalog,Date.parse('2026-10-04T13:30:00Z')),true);
 assert.equal(source.isExpired({...catalog,syncedAt:'invalid'},Date.parse('2026-10-04T12:00:00Z')),true);
 assert.equal(source.isExpired({...catalog,products:[{imageUrl:'https://shop.example/product.jpg'}]},Date.parse('2026-10-04T14:00:00Z')),false);
});

test('fresh legacy main cannot override corrected review grouping',async()=>{const now=Date.parse('2026-10-04T12:00:00Z');const result=await source.load(async url=>new Response(JSON.stringify(url.includes('price-history')?{events:[]}:{groupingVersion:url.includes('/codex/')?2:1,products:[],syncedAt:url.includes('/codex/')?'2026-10-04T11:00:00Z':'2026-10-04T11:50:00Z'})),previewLocation,now);assert.equal(result.catalog.groupingVersion,2);assert.equal(result.catalog.syncedAt,'2026-10-04T11:00:00Z');});

test('open-view timer uses the earliest metadata or photo deadline',()=>{
 const stamp=Date.now(),syncedAt=new Date(stamp).toISOString(),photo={imageUrl:'https://d2iaagr1j041pi.cloudfront.net/apis/search_img.php?code=1'};
 const catalog={syncedAt,storagePolicy:'ttl_cache',expiresAt:new Date(stamp+24*3600000).toISOString(),products:[photo]};
 assert.equal(source.expirationTime(catalog),stamp+90*60000);
 assert.equal(source.expirationTime({...catalog,expiresAt:new Date(stamp+30*60000).toISOString()}),stamp+30*60000);
 assert.equal(source.expirationTime({syncedAt,storagePolicy:'ttl_cache',products:[]}),stamp+24*3600000);
 assert.equal(source.expirationTime({...catalog,expiresAt:'invalid'}),0);
});
