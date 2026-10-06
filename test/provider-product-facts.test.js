import test from 'node:test';
import assert from 'node:assert/strict';
import { providerProductFacts, catalogCacheWindow } from '../src/provider-product-facts.js';
import { AdpickBizProvider } from '../src/adpick-biz-provider.js';
import { groupProducts } from '../src/product-grouper.js';
import { classifyProduct } from '../src/product-classifier.js';
test('provider facts exclude inferred title and size chart, preserve offered sizes',()=>{
 assert.deepEqual(providerProductFacts({title:'면100% 90 100',sizes:['90'],size:'100'}).availableSizes,[]);
 const p=providerProductFacts({composition:' 면 100% ',size_options:[{size:'80',stock:0},{size:'90',in_stock:true},{size:'100',sold_out:true},'110']});
 assert.equal(p.material,'면 100%');assert.deepEqual(p.availableSizes,['90','110']);assert.equal(p.productFactFields.material,'composition');
});
test('adapter and canonical classifier retain original facts and seller provenance',()=>{
 const adapter=new AdpickBizProvider({apiKey:'test'});
 const row=adapter.normalize({title:'아기 상하복',product_id:'1',material:'면 100%',available_sizes:['90','100'],commissionlink:'https://example.test/buy',price:10000},'아기');
 const [p]=groupProducts([row]).map(classifyProduct);
 assert.equal(p.material,'면 100%');assert.deepEqual(p.availableSizes,['90','100']);assert.equal(p.productFactSources[0].fields.availableSizes,'available_sizes');
 const [conflict]=groupProducts([row,{...row,externalProductId:'2',affiliateUrl:'https://example.test/other',material:'폴리에스터 100%'}]);
 assert.equal(conflict.material,null);assert.equal(conflict.materialConflict,true);assert.equal(conflict.productFactSources.length,2);
});
test('TTL is explicit and anchored to actual source observation',()=>{
 assert.equal(catalogCacheWindow('2026-10-04T00:00:00Z').expiresAt,'2026-10-05T00:00:00.000Z');
 assert.throws(()=>catalogCacheWindow('invalid'));
});

test('original photo verification preserves observation and seller evidence',async()=>{
 const row={name:'아가방 아기 우주복',externalProductId:'1',affiliateUrl:'https://example.test/buy',imageUrl:'https://example.test/photo.jpg',checkedAt:'2026-10-05T00:00:00Z',material:'면 100%',availableSizes:['80'],productFactFields:{material:'material'},imageEvidence:{url:'https://example.test/photo.jpg',observedAt:'2026-10-05T00:00:00Z',verifiedAt:'2026-10-05T00:20:00Z',status:200}};
 const [p]=groupProducts([row]);assert.deepEqual(p.imageEvidence,[row.imageEvidence]);assert.equal(p.offers[0].checkedAt,row.checkedAt);
 const {toClientProduct}=await import('../src/client-product.js');const client=toClientProduct(p);assert.equal(client.offers[0].checkedAt,row.checkedAt);assert.equal(client.offers[0].material,row.material);assert.deepEqual(client.offers[0].availableSizes,['80']);
 const {catalogAvailabilityReport}=await import('../src/catalog-availability-report.js');
 const url='https://d2iaagr1j041pi.cloudfront.net/apis/search_img.php?code=1',catalog={syncedAt:row.checkedAt,products:[{imageUrl:url,imageEvidence:[{...row.imageEvidence,url}]}]};
 const report=catalogAvailabilityReport(catalog,{products:[row]},Date.parse('2026-10-05T00:30:00Z'));assert.equal(report.remainingImageDisplaySeconds,3600);assert.equal(report.sourceAgeAtLastVerificationSeconds,1200);assert.equal(report.continuousAvailabilityVerified,false);
 assert.equal(catalogAvailabilityReport(catalog,{},Date.parse('2026-10-05T02:00:00Z')).imageStatus,'display_window_expired');
 assert.equal(catalogAvailabilityReport({...catalog,products:[{imageUrl:url}]},{},Date.parse('2026-10-05T00:30:00Z')).lastVerificationAt,null);
});

test('verification evidence rejects failed, reversed and future timestamps',async()=>{
 const {catalogAvailabilityReport}=await import('../src/catalog-availability-report.js');
 const url='https://d2iaagr1j041pi.cloudfront.net/apis/search_img.php?code=1',now=Date.parse('2026-10-05T00:30:00Z'),stamp='2026-10-05T00:00:00Z';
 for(const evidence of [
  {url,status:404,observedAt:stamp,verifiedAt:'2026-10-05T00:10:00Z'},
  {url,status:200,observedAt:'2026-10-05T00:20:00Z',verifiedAt:'2026-10-05T00:10:00Z'},
  {url,status:200,observedAt:stamp,verifiedAt:'2026-10-05T01:00:00Z'},
  {url,status:200,observedAt:'invalid',verifiedAt:'2026-10-05T00:10:00Z'}
 ]){const r=catalogAvailabilityReport({syncedAt:stamp,products:[{imageUrl:url,imageEvidence:[evidence]}]},{},now);assert.equal(r.imageUrlsWithVerification,0);assert.equal(r.lastVerificationAt,null)}
 const invalid=catalogAvailabilityReport({syncedAt:'2026-10-05T01:00:00Z',products:[{imageUrl:url}]},{},now);assert.equal(invalid.remainingImageDisplaySeconds,null);assert.equal(invalid.imageStatus,'invalid_source_time');
});
