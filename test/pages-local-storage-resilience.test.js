const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const ui=fs.readFileSync('src/release-ui.js','utf8');
const profiles=fs.readFileSync('src/child-profiles.js','utf8');
function section(from,to){return ui.slice(ui.indexOf(from),ui.indexOf(to,ui.indexOf(from)))}
const controller=[
 profiles,
 section('const localDataStorage=','let editingChildId='),
 section('function fav(','function renderMy('),
 section('function openDetail(','function bindBuy('),
 section('function savePriceAlert(','function lockPageScroll(')
].join('\n');

function harness(initial={},denied=false){
 const data=new Map(Object.entries(initial)),blocked=new Set(),messages=[],opened=[],elements=new Map();
 let renders=0,myRenders=0;
 const storage={getItem:k=>data.get(k)??null,setItem(k,v){if(blocked.has(k))throw Error('quota');data.set(k,v)},removeItem:k=>data.delete(k)};
 const element=id=>{if(!elements.has(id))elements.set(id,{value:'',innerHTML:'',scrollTop:0,classList:{contains:()=>false},querySelector:()=>({}),setAttribute(){}});return elements.get(id)};
 const context=vm.createContext({
  favs:new Set(),selectedPhotoId:null,currentProduct:null,products:[{id:'p',name:'아이 옷',price:19000,offers:[{merchant:'판매처',price:19000}]}],
  localStorage:storage,priceAlertDrafts:new Map(),$:element,document:{querySelectorAll:()=>[]},render:()=>renders++,renderMy:()=>myRenders++,toast:message=>messages.push(message),
  closeAccount(){},closePhotoCard(){},bindBuy(){},bindImages(){},bindImageGalleries(){},showSheet:id=>opened.push(id),
  esc:v=>String(v??''),displayName:p=>p.name,won:v=>v+'원',discountOf:()=>null,safeDestination:()=>null,imageHtml:()=>'',fitSection:()=>'',productInfoHtml:()=>'',priceAlertHtml:()=>''
 });
 if(denied)vm.runInContext('Object.defineProperty(globalThis,"localStorage",{get(){throw Error("storage denied")}})',context);
 vm.runInContext(controller,context);
 return{context,data,blocked,messages,opened,element,renders:()=>renders,myRenders:()=>myRenders,evaluate:code=>vm.runInContext(code,context)};
}

test('denied browser storage access leaves child-profile initialization and reads usable',()=>{
 const h=harness({},true);
 assert.equal(h.evaluate('childStore.all().length'),0);
 assert.equal(h.evaluate('readStore("favs",[]).length'),0);
 assert.equal(h.evaluate('writeStore("favs",["p"],"저장 실패")'),false);
 assert.deepEqual(h.messages,['저장 실패']);
 assert.throws(()=>h.evaluate('childStore.save({months:"12",height:"76",weight:"10"})'),/storage denied/);
 assert.equal(h.evaluate('childStore.all().length'),0,'denied child writes remain atomic');
});

test('wrong JSON collection shapes fall back without deleting the stored record',()=>{
 for(const raw of ['{}','3','"value"','null']){
  const h=harness({favs:raw,recentProducts:raw});
  assert.equal(h.evaluate('readStore("favs",[]).length'),0);
  assert.equal(h.evaluate('readStore("recentProducts",[]).length'),0);
  assert.equal(h.data.get('favs'),raw);
  assert.equal(h.data.get('recentProducts'),raw);
 }
 for(const raw of ['[]','3','"value"','null']){
  const h=harness({priceAlerts:raw});
  assert.equal(h.evaluate('Object.keys(readStore("priceAlerts",{})).length'),0);
  assert.equal(h.data.get('priceAlerts'),raw);
 }
});

test('valid favorite, recent and target-price records are preserved',()=>{
 const h=harness({favs:'["a","b"]',recentProducts:'["b","a"]',priceAlerts:'{"a":10000,"b":20000}'});
 assert.equal(h.evaluate('JSON.stringify(readStore("favs",[]))'),'["a","b"]');
 assert.equal(h.evaluate('JSON.stringify(readStore("recentProducts",[]))'),'["b","a"]');
 assert.equal(h.evaluate('readStore("priceAlerts",{}).b'),20000);
});

test('failed favorite addition or removal preserves both saved and visible state',()=>{
 for(const saved of [[],['p']]){
  const h=harness({favs:JSON.stringify(saved)});h.context.favs=new Set(saved);h.blocked.add('favs');
  h.context.fav('p');
  assert.deepEqual([...h.context.favs],saved);
  assert.equal(h.data.get('favs'),JSON.stringify(saved));
  assert.equal(h.renders(),0);
  assert.match(h.messages[0],/저장하지 못했어요/);
 }
});

test('successful favorite updates commit saved and visible state together',()=>{
 const h=harness({favs:'["other"]'});h.context.favs=new Set(['other']);
 h.context.fav('p');assert.deepEqual(JSON.parse(h.data.get('favs')),['other','p']);assert.equal(h.context.favs.has('p'),true);
 h.context.fav('p');assert.deepEqual(JSON.parse(h.data.get('favs')),['other']);assert.equal(h.context.favs.has('p'),false);
 assert.equal(h.renders(),2);
});

test('failed target-price writes preserve the saved value and unsaved draft',()=>{
 const h=harness({priceAlerts:'{"p":15000,"other":25000}'});h.blocked.add('priceAlerts');h.element('alertPrice').value='20000';h.context.priceAlertDrafts.set('p','20000');
 h.context.savePriceAlert('p');
 assert.equal(h.data.get('priceAlerts'),'{"p":15000,"other":25000}');
 assert.equal(h.context.priceAlertDrafts.get('p'),'20000');
 assert.equal(h.element('alertPrice').value,'20000');
 assert.equal(h.myRenders(),0);assert.match(h.messages[0],/저장하지 못했어요/);
});

test('a successful target-price write repairs wrong collection type without a false success',()=>{
 const h=harness({priceAlerts:'3'});h.element('alertPrice').value='20000';h.context.priceAlertDrafts.set('p','20000');
 h.context.savePriceAlert('p');
 assert.deepEqual(JSON.parse(h.data.get('priceAlerts')),{p:20000});
 assert.equal(h.context.priceAlertDrafts.has('p'),false);
 assert.deepEqual(h.messages,['희망 가격을 저장했어요']);
});

test('recent-history quota failure does not prevent product detail browsing',()=>{
 const h=harness({recentProducts:'["other"]'});h.blocked.add('recentProducts');
 h.context.openDetail('p');
 assert.deepEqual(h.opened,['detail']);assert.equal(h.context.currentProduct.id,'p');
 assert.equal(h.data.get('recentProducts'),'["other"]');
 assert.match(h.messages[0],/상품은 볼 수 있지만/);
});

test('wrong recent-history type does not prevent detail and an explicit visit saves the new record',()=>{
 const h=harness({recentProducts:'{}'});
 h.context.openDetail('p');
 assert.deepEqual(h.opened,['detail']);assert.deepEqual(JSON.parse(h.data.get('recentProducts')),['p']);
 assert.equal(h.messages.length,0);
});
