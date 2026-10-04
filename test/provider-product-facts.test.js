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
