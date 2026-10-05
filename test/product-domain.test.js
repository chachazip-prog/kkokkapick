import assert from 'node:assert/strict';
import domains from '../src/product-domain.js';
import { classifyCatalogRelevance } from '../src/apparel-relevance.js';
import { classifyProduct } from '../src/product-classifier.js';
import { groupProducts } from '../src/product-grouper.js';
assert.equal(classifyCatalogRelevance({name:'아기 딸랑이 장난감'}).domain,'toy');
assert.equal(classifyCatalogRelevance({name:'유아 보드북 3세 이상'}).domain,'learning');
for(const name of ['성인 수집용 키즈 피규어','아기 봉제 DIY 인형','반려동물 아기 장난감','아기 인형 옷','유아 인테리어 장식 모빌'])assert.equal(classifyCatalogRelevance({name}).eligible,false,name);
assert.equal(domains.ageEvidence('유아 블록 3단 10개'),null);
assert.equal(domains.ageEvidence('유아 퍼즐'),null);
const e=domains.ageEvidence('유아 퍼즐 3세 이상');assert.equal(e.minMonths,36);assert.equal(e.maxMonths,null);assert.equal(e.source,'product_title');
assert.equal(domains.matchesMonths({ageEvidence:e},12),false);assert.equal(domains.matchesMonths({ageEvidence:e},36),true);
assert.equal(domains.matchesMonths({},12),false);
assert.deepEqual(domains.ageEvidence('아기 보드북 6–24개월').minMonths,6);
const toy=classifyProduct({name:'아가방 아기 딸랑이',domain:'toy',query:'신생아 장난감'});assert.equal(toy.stage,'전체');assert.equal(toy.fitStatus,'unverified');assert.equal(toy.sizeGuide,null);
const groups=groupProducts([{name:'같은 ABC12345',domain:'apparel',externalProductId:'a',price:1000},{name:'같은 ABC12345',domain:'toy',externalProductId:'b',price:2000}]);assert.equal(groups.length,2);
console.log('Product domain, age provenance and cross-domain identity tests passed');

assert.equal(domains.matchesMonths({ageEvidence:{minMonths:0,maxMonths:12}},null),false);
assert.equal(domains.matchesMonths({ageEvidence:{minMonths:0,maxMonths:12}},''),false);
const providerToy=classifyProduct({domain:'toy',name:'유아 블록',offers:[{ageEvidence:domains.ageEvidence('',{recommended_age:'3세 이상'})}]});assert.equal(providerToy.ageEvidence.minMonths,36);assert.equal(providerToy.ageEvidence.source,'provider');

for(const name of ['유아 고양이용 퍼즐','유아 구독 보드북','유아 장난감 세척제','유아 장난감 보관함'])assert.equal(classifyCatalogRelevance({name}).eligible,false,name);
assert.equal(domains.ageEvidence('아기 그림책 3세 이상 사용 금지'),null);
assert.equal(classifyCatalogRelevance({name:'유아 봉제 인형 장난감'}).domain,'toy');

for(const name of ['유아 구독 숫자놀이','유아 고양이용 모양맞추기','키즈 랜덤 놀이 블록'])assert.equal(classifyCatalogRelevance({name}).eligible,false,name);
