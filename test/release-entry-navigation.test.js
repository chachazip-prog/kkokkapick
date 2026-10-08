const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('src/release-ui.js','utf8');
const controller=source.slice(source.indexOf('let catalogRefreshing='),source.indexOf('function scheduleCatalogExpiry('));
function fixture(query,load){
 const views=[],layouts=[],details=[];
 const context=vm.createContext({URL,Date,location:{href:'https://example.test/index.html'+query},fetch(){},
  KkokkapickCatalogSource:{load,isExpired:d=>d.expired},views,layouts,details,
  setView(value){context.view=value;views.push(value)},setSearchLayout:value=>layouts.push(value),
  products:[],priceHistory:[],cats:[],view:'home',photoAvailability:{setSnapshot(){},failedCount:()=>0},
  render(){},renderCatalogSourceNotice(){},scheduleCatalogExpiry(){},isDiscoveryProduct:()=>true,
  productImages:p=>p.imageUrls||[],categoryOf:()=>'',openDetail:id=>details.push(id),
  invalidateExpiredCatalog(){vm.runInContext("catalogState='expired';products=[]",context)},
 });
 vm.runInContext(controller,context);
 // UI rendering is exercised by browser QA; isolate entry/load state here.
 vm.runInContext('renderCatalogSourceNotice=()=>{}',context);
 return{context,views,layouts,details,run:code=>vm.runInContext(code,context)};
}
for(const [query,expected,layout] of [['?view=search','search'],['?view=my','my'],['?view=favorites','favorites'],['?view=search&mode=photos','search','photos'],['?sample=multiple','search','products']]){
 test('expired entry preserves requested destination '+query,async()=>{
  const f=fixture(query,async()=>({catalog:{expired:true,syncedAt:'2026-01-01T00:00:00Z'},history:null}));
  f.run('initializeEntryNavigation()');await f.run('loadProducts()');
  assert.deepEqual(f.views,[expected]);if(layout)assert.deepEqual(f.layouts,[layout]);
  assert.equal(f.run('catalogState'),'expired');assert.deepEqual(f.details,[]);assert.equal(f.run('products.length'),0);
 });
}
test('unavailable source preserves destination and successful retry does not replay navigation',async()=>{
 let reject=true;
 const f=fixture('?view=my',async()=>{if(reject)throw Error('offline');return{catalog:{syncedAt:'2026-10-08T12:00:00Z',products:[]},history:null}});
 f.run('initializeEntryNavigation()');await f.run('loadProducts()');assert.equal(f.run('catalogState'),'unavailable');
 f.context.setView('favorites');reject=false;await f.run('loadProducts()');
 assert.deepEqual(f.views,['my','favorites']);assert.equal(f.run('view'),'favorites');
});
test('pending product entry opens only on first valid source and is not reopened by refresh',async()=>{
 let expired=true;
 const f=fixture('?sample=multiple',async()=>({catalog:{expired,syncedAt:'2026-10-08T12:00:00Z',products:[{id:'real-source-id',imageUrls:['https://shop.test/a.jpg','https://shop.test/b.jpg']}]},history:null}));
 f.run('initializeEntryNavigation()');await f.run('loadProducts()');assert.deepEqual(f.details,[]);
 expired=false;await f.run('loadProducts()');await f.run('loadProducts()');
 assert.deepEqual(f.details,['real-source-id']);assert.deepEqual(f.views,['search']);
});
test('unsupported view and layout are ignored',()=>{
 const f=fixture('?view=external&mode=untrusted',async()=>{});f.run('initializeEntryNavigation()');f.run('initializeEntryNavigation()');
 assert.deepEqual(f.views,['home']);assert.deepEqual(f.layouts,[]);
});
