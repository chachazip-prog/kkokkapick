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

for (const name of ['옥스포드 아기 블럭 유아 창의력블록', '유아 역할 놀이 소꿉 놀이 주방 놀이', '핑크퐁 아기상어 양치놀이']) { assert.equal(classifyCatalogRelevance({name}).domain, 'toy', name); assert.equal(domains.ageEvidence(name), null); }
for (const name of ['키즈 컬러블럭 가디건', '디즈니베이비 블럭 오픈내의', '유아 썬블럭 모자세트', '언더아머 키즈 컬러블록 Leggings Set']) assert.equal(classifyCatalogRelevance({name}).domain, 'apparel', name);
assert.equal(classifyCatalogRelevance({name:'뽀로로 유아 가방퍼즐'}).domain, 'learning');
assert.equal(classifyCatalogRelevance({name:'에뜨와 신생아 딸랑이세트 치아발육기'}).eligible, false);

const flooring='[해외] EVA 폼 퍼즐 부드러운 어린이 매트, 놀이 매트, 크롤링 카펫 어린이 방, 나뭇결 바닥 패드, 연동 퍼즐 타일';
assert.equal(domains.isFloorCovering(flooring),true);
assert.equal(classifyCatalogRelevance({name:flooring}).eligible,false,'interlocking floor tiles are not learning materials');
for(const name of ['유아 놀이 매트 퍼즐','어린이 floor tile 퍼즐','아기 카페트 퍼즐'])assert.equal(classifyCatalogRelevance({name}).eligible,false,name);
for(const name of ['클래식월드 가든 야채 퍼즐 18개월 유아','유아 도로놀이 퍼즐형 트랙','뽀로로 유아 가방퍼즐','아기 헝겊책 그림책','옥스포드 아기 유아 놀이 블록'])assert.equal(classifyCatalogRelevance({name}).eligible,true,name);

// Fresh source2026-10-08: a per-length fabric listing used child-garment
// keywords. Omit this item at collection and runtime without rewriting it.
const fabric='[해외] 여아용 원피스 의류 그물 원단, 흰색 핑크 딸기 생일 케이크 글자 활 자수 메쉬 원단 핑크, SC283, 1 계량기 가격';
for(const name of [fabric,'아기 원피스 제작용 면 원단 1미터 가격','키즈 셔츠 원단 야드당 가격','kids dress fabric per metre']){
 assert.equal(domains.isLengthPricedFabric(name),true,name);
 assert.equal(classifyCatalogRelevance({name}).eligible,false,name);
}
const sourceListing=Object.freeze({name:fabric,id:'adpickbiz_cc4376e9',domain:'apparel',imageUrl:'https://supplier.example/original-photo.jpg',checkedAt:'2026-10-08T11:21:07.566Z'});
const originalListing=JSON.stringify(sourceListing);
assert.equal(classifyCatalogRelevance(sourceListing).reason,'length_priced_sewing_fabric');
assert.equal(JSON.stringify(sourceListing),originalListing,'Raw source facts must be preserved');
for(const name of ['[기타] IL GUFO KIDS 테크원단 남아 상하복 세트 블루 A26GDF0039V0021499[이마트몰]','유아 원피스 면 원단 총장 50cm','아동 코트 테크원단']){
 assert.equal(domains.isLengthPricedFabric(name),false,name);
 assert.equal(classifyCatalogRelevance({name}).eligible,true,name);
}
const fs=await import('node:fs');
const vm=await import('node:vm');
const runtime=fs.readFileSync('src/release-ui.js','utf8').match(/^function isDiscoveryProduct\(p\)\{[^\n]+\}/m)?.[0];
assert.ok(runtime,'Discovery must enforce the shared fabric check');
const browser=vm.createContext({KkokkapickProductDomain:domains});vm.runInContext(runtime,browser);
assert.equal(browser.isDiscoveryProduct(sourceListing),false,'Previously published fabric must be omitted in the browser too');
assert.equal(browser.isDiscoveryProduct({name:'IL GUFO KIDS 테크원단 남아 상하복 세트',domain:'apparel'}),true);
assert.equal(browser.isDiscoveryProduct({name:flooring,domain:'learning'}),false,'Existing floor-covering exclusion remains');
