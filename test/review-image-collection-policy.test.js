import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { isReviewQuarantineCollection, assertCollectionImageHealth, collectionProducts } from '../src/review-image-collection-policy.js';
import { applyPublicationImageAudit } from '../src/image-publication-policy.js';
import { groupProducts } from '../src/product-grouper.js';
import { ADPICK_DISCOVERY_QUERIES } from '../src/adpick-discovery-plan.js';

const reviewEnv={GITHUB_REPOSITORY:'chachazip-prog/kkokkapick',GITHUB_REF:'refs/heads/codex/release-ui-rebuild',GITHUB_EVENT_NAME:'workflow_dispatch',ADPICK_COLLECTION_MODE:'review-quarantine'};
const degraded={checked:1000,ok:622,failed:378,rate:0.622};

test('production still rejects62.2% source health, review opt-in keeps it truthful',()=>{
 assert.equal(isReviewQuarantineCollection({}),false);
 assert.throws(()=>assertCollectionImageHealth(degraded,0.8),/62.2% < 80.0%/);
 assert.doesNotThrow(()=>assertCollectionImageHealth(degraded,0.8,isReviewQuarantineCollection(reviewEnv)));
 assert.deepEqual(degraded,{checked:1000,ok:622,failed:378,rate:0.622});
 assert.throws(()=>assertCollectionImageHealth({...degraded,checked:0},0.8,true),/No original/);
});

test('review opt-in fails closed outside the exact manual repository and branch',()=>{
 for(const override of [{GITHUB_REF:'refs/heads/main'},{GITHUB_REPOSITORY:'other/fork'},{GITHUB_EVENT_NAME:'schedule'},{GITHUB_EVENT_NAME:'pull_request'},{ADPICK_COLLECTION_MODE:'disable-health'}]){
  assert.throws(()=>isReviewQuarantineCollection({...reviewEnv,...override}),/manual canonical review-branch|Unknown/);
 }
});

test('failed originals retain URL, HTTP status and clocks but never become display photos or verified evidence',()=>{
 const observedAt='2026-10-06T22:29:56.000Z',verifiedAt='2026-10-06T22:30:30.000Z';
 const originals=[{externalProductId:'ok',imageUrl:'https://cdn.example/ok.jpg',checkedAt:observedAt,material:'provider cotton',availableSizes:['80']},{externalProductId:'bad',imageUrl:'https://cdn.example/expired.jpg',checkedAt:observedAt,price:12000,merchant:'original seller'}];
 const validated=originals.map((p,i)=>({...p,imageUrl:i?null:p.imageUrl,imageHealth:{ok:!i,status:i?404:200,checkedAt:verifiedAt,reason:i?'http_error':null}}));
 const result=collectionProducts(originals,validated,true);
 assert.equal(result[0].imageEvidence.url,originals[0].imageUrl);
 assert.equal(result[0].imageEvidence.observedAt,observedAt);
 assert.equal(result[1].imageUrl,null);assert.equal(result[1].imageEvidence,null);
 assert.equal(result[1].collectionImageHealth.url,originals[1].imageUrl);
 assert.equal(result[1].collectionImageHealth.status,404);
 assert.equal(result[1].collectionImageHealth.observedAt,observedAt);
 assert.equal(result[1].collectionImageHealth.checkedAt,verifiedAt);
 assert.equal(result[1].checkedAt,observedAt);assert.equal(result[1].price,12000);assert.equal(result[1].merchant,'original seller');
 assert.equal(result[0].material,'provider cotton');assert.deepEqual(result[0].availableSizes,['80']);
 assert.equal(collectionProducts(originals,validated)[1].collectionImageHealth,undefined);
 assert.throws(()=>collectionProducts(originals,validated.slice(1),true),/Incomplete/);
 assert.equal(originals[1].imageUrl,'https://cdn.example/expired.jpg');
});

test('canonical projection retains seller facts with a healthy alternate and drops products with no healthy photo',()=>{
 const observedAt='2026-10-06T22:29:56Z';
 const originals=[{name:'아가방 아양 우주복 01R71750503',externalProductId:'a',merchant:'a',price:10000,imageUrl:'https://cdn.example/a.jpg',checkedAt:observedAt},{name:'아가방 아양 우주복 01R71750503',externalProductId:'b',merchant:'b',price:12000,imageUrl:'https://cdn.example/b.jpg',checkedAt:observedAt},{name:'별도 딸랑이 장난감',externalProductId:'c',merchant:'c',price:1000,imageUrl:'https://cdn.example/c.jpg',checkedAt:observedAt}];
 const validated=originals.map((p,i)=>({...p,imageUrl:i===1?p.imageUrl:null,imageHealth:{ok:i===1,status:i===1?200:404,checkedAt:observedAt}}));
 const collection=collectionProducts(originals,validated,true);
 const visible=groupProducts(collection).filter(p=>p.imageUrl||p.imageUrls?.length);
 assert.equal(visible.length,1);assert.equal(visible[0].offerCount,2);assert.equal(visible[0].minPrice,10000);assert.deepEqual(visible[0].imageUrls,['https://cdn.example/b.jpg']);
 assert.equal(groupProducts(collectionProducts(originals,validated.map(p=>({...p,imageUrl:null,imageHealth:{...p.imageHealth,ok:false,status:404}})),true)).filter(p=>p.imageUrl||p.imageUrls?.length).length,0);
});

test('review quarantine does not weaken the existing5% drift exclusion gate',()=>{
 const urls=Array.from({length:20},(_,i)=>`https://cdn.example/${i}.jpg`);
 const source={syncedAt:'2026-10-06T22:29:56Z',expiresAt:'2026-10-07T22:29:56Z',products:urls.map(imageUrl=>({imageUrl}))};
 const results=urls.map((url,i)=>({url,ok:i>1,status:i>1?200:404,reason:i>1?null:'http_error'}));
 assert.throws(()=>applyPublicationImageAudit(source,results,urls,undefined,{reviewQuarantine:true}),/exceeds publication exclusion limit/);
 const updated=applyPublicationImageAudit(source,results.map((r,i)=>i===1?{...r,ok:true,status:200}:r),urls,undefined,{reviewQuarantine:true});
 assert.equal(updated.publicationImageAudit.mode,'review-quarantine');assert.equal(updated.products[0].imageUrl,null);
 assert.equal(updated.syncedAt,source.syncedAt);assert.equal(updated.expiresAt,source.expiresAt);
});

const handoffScript=path.resolve('scripts/handoff-review-catalog.cjs');
function handoffFixture(override={}){
 const cwd=fs.mkdtempSync(path.join(os.tmpdir(),'kk-review-quarantine-'));
 const now=Date.now(),syncedAt=new Date(now-60000).toISOString(),expiresAt=new Date(now+23*3600000).toISOString();
 const domainFor=i=>i===0?'toy':i===1?'learning':'apparel';
 const products=Array.from({length:300},(_,i)=>({domain:override.forceDomain||(override.dropDomain===domainFor(i)?'apparel':domainFor(i)),imageUrl:`https://cdn.example/${i}.jpg`,imageUrls:[`https://cdn.example/${i}.jpg`]}));
 const source={count:500,products:Array.from({length:500},(_,i)=>({domain:domainFor(i),imageUrl:i<300?products[i].imageUrl:null,collectionImageHealth:{url:`https://cdn.example/${i}.jpg`,ok:i<311,status:i<311?200:404,observedAt:syncedAt}})),storagePolicy:'ttl_cache',syncedAt,expiresAt,imageHealth:{checked:500,ok:311,failed:189,rate:0.622},queries:[...ADPICK_DISCOVERY_QUERIES],reviewCollection:{mode:'review-quarantine',requiresFinalImageGate:true,sourceHealthPassed:false,completedQueries:85,plannedQueries:85},publicationImageAudit:{mode:'review-quarantine',checkedAt:new Date(now-1000).toISOString(),checked:300,ok:300,excluded:0}};
 const catalog={products,productCount:products.length,sourceCount:source.count,storagePolicy:'ttl_cache',syncedAt,expiresAt};
 const catalogText=JSON.stringify(catalog);
 const report={generatedAt:new Date(now).toISOString(),catalogProductCount:products.length,catalogSyncedAt:syncedAt,catalogExpiresAt:expiresAt,catalogSha256:createHash('sha256').update(catalogText).digest('hex'),uniqueHttpsImageUrls:300,sampleSize:300,ok:300,failed:0,successRate:1,minSuccessRate:1,failures:[]};
 fs.mkdirSync(path.join(cwd,'.review-catalog'));fs.mkdirSync(path.join(cwd,'data'));fs.mkdirSync(path.join(cwd,'artifacts'));
 const baseline={syncedAt:new Date(now-120000).toISOString(),products:Array.from({length:400},()=>({}))};
 fs.writeFileSync(path.join(cwd,'data/catalog.json'),JSON.stringify(baseline));
 fs.writeFileSync(path.join(cwd,'.review-catalog/catalog.json'),catalogText);
 fs.writeFileSync(path.join(cwd,'.review-catalog/adpick-biz-products.json'),JSON.stringify({...source,...override.source}));
 fs.writeFileSync(path.join(cwd,'.review-catalog/price-history.json'),JSON.stringify({events:[]}));
 if(!override.noReport)fs.writeFileSync(path.join(cwd,'artifacts/review-image-health.json'),JSON.stringify({...report,...override.report}));
 return{cwd,baseline};
}
function runHandoff(cwd){return spawnSync(process.execPath,[handoffScript],{cwd,env:{...process.env,...reviewEnv},encoding:'utf8'})}

test('review handoff accepts degraded raw evidence only after an exact complete100% quarantine audit',()=>{
 const {cwd}=handoffFixture();try{
  const result=runHandoff(cwd);assert.equal(result.status,0,result.stderr);
  const published=JSON.parse(fs.readFileSync(path.join(cwd,'data/adpick-biz-products.json')));
  assert.equal(published.imageHealth.rate,0.622);assert.equal(published.reviewCollection.sourceHealthPassed,false);
  assert.equal(published.products[499].collectionImageHealth.url,'https://cdn.example/499.jpg');
 }finally{fs.rmSync(cwd,{recursive:true,force:true})}
});

test('raw review handoff rejects missing, partial, mismatched, stale or failed final audit without replacing data',()=>{
 for(const override of [{noReport:true},{source:{publicationImageAudit:null}},{source:{imageHealth:{checked:500,ok:311,failed:189,rate:1}}},{source:{publicationImageAudit:{mode:'review-quarantine',checked:400,ok:300,excluded:100}}},{report:{sampleSize:40}},{report:{catalogProductCount:999}},{report:{catalogSha256:'wrong'}},{report:{catalogSyncedAt:'wrong'}},{report:{catalogExpiresAt:'wrong'}},{source:{reviewCollection:{mode:'review-quarantine',requiresFinalImageGate:true,completedQueries:84,plannedQueries:85}}},{report:{ok:299,failed:1,successRate:299/300,failures:[{status:404}]}},{report:{minSuccessRate:0.8}},{report:{uniqueHttpsImageUrls:0,sampleSize:0,ok:0}},{report:{generatedAt:'2000-01-01T00:00:00Z'}}]){
  const {cwd,baseline}=handoffFixture(override);try{
   const result=runHandoff(cwd);assert.notEqual(result.status,0);
   assert.deepEqual(JSON.parse(fs.readFileSync(path.join(cwd,'data/catalog.json'))),baseline);
  }finally{fs.rmSync(cwd,{recursive:true,force:true})}
 }
});

test('review quarantine retains the existing65% coverage-collapse guard',()=>{
 const {cwd,baseline}=handoffFixture();try{
  baseline.products=Array.from({length:1000},()=>({}));fs.writeFileSync(path.join(cwd,'data/catalog.json'),JSON.stringify(baseline));
  const result=runHandoff(cwd);assert.notEqual(result.status,0);assert.match(result.stderr,/Unexpected coverage collapse/);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(cwd,'data/catalog.json'))),baseline);
 }finally{fs.rmSync(cwd,{recursive:true,force:true})}
});


test('review handoff rejects a consistently shortened query list and counts',()=>{
 const {cwd,baseline}=handoffFixture({source:{queries:ADPICK_DISCOVERY_QUERIES.slice(1),reviewCollection:{mode:'review-quarantine',requiresFinalImageGate:true,completedQueries:84,plannedQueries:84}}});
 try{const result=runHandoff(cwd);assert.notEqual(result.status,0);assert.match(result.stderr,/approved discovery plan/);assert.deepEqual(JSON.parse(fs.readFileSync(path.join(cwd,'data/catalog.json'))),baseline)}finally{fs.rmSync(cwd,{recursive:true,force:true})}
});

test('a complete healthy photo audit cannot publish an apparel-free review catalog',()=>{
 const {cwd,baseline}=handoffFixture({forceDomain:'toy'});
 try{const result=runHandoff(cwd);assert.notEqual(result.status,0);assert.match(result.stderr,/healthy apparel/);assert.deepEqual(JSON.parse(fs.readFileSync(path.join(cwd,'data/catalog.json'))),baseline)}finally{fs.rmSync(cwd,{recursive:true,force:true})}
});

test('review preserves healthy toys and learning products when their original source offers exist',()=>{
 for(const domain of ['toy','learning']){
  const {cwd,baseline}=handoffFixture({dropDomain:domain});
  try{const result=runHandoff(cwd);assert.notEqual(result.status,0);assert.match(result.stderr,new RegExp(`healthy ${domain} coverage`));assert.deepEqual(JSON.parse(fs.readFileSync(path.join(cwd,'data/catalog.json'))),baseline)}finally{fs.rmSync(cwd,{recursive:true,force:true})}
 }
});
