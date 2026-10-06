const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('src/release-ui.js','utf8');
const escape=source.slice(source.indexOf('function esc('),source.indexOf('function won('));
const names=source.slice(source.indexOf('function displayName('),source.indexOf('function imageHtml('));
const information=source.slice(source.indexOf('function isDiscoveryProduct('),source.indexOf('function readStore('));
const engine=source.slice(source.indexOf('const VERIFIED_SIZE_CHARTS='),source.indexOf('function positivePrice('));
const context=vm.createContext({URL,KkokkapickProductImages:require('../src/product-image-availability.js'),KkokkapickProductDomain:require('../src/product-domain.js')});vm.runInContext(source.slice(source.indexOf('function positivePrice('),source.indexOf('function getLatestPriceChange('))+source.slice(source.indexOf('function safeDestination('),source.indexOf('function esc('))+escape+names+information+engine,context);
const original={brand:'아가방',name:'아가방 아양우주복(모자)(O/WHITE)_01R71750503'};
assert.equal(context.displayName(original),'아양 우주복 + 모자 세트');assert.equal(original.name,'아가방 아양우주복(모자)(O/WHITE)_01R71750503','source preserved');
assert.equal(context.displayName({brand:'아가방',name:'[이마트몰] 아가방 아가방 봄 원피스 (52935592)'}),'봄 원피스');
assert.equal(context.displayName({name:'키즈 코튼 티셔츠 2종 세트'}),'키즈 코튼 티셔츠 2종 세트','meaningful quantity preserved');
assert.equal(context.materialLabel({materials:['면 95%','폴리에스터 5%']}),'면 95%, 폴리에스터 5%');
assert.equal(context.sizeLabel({availableSizes:['80','90','100']}),'80, 90, 100');
const absent=context.productInfoHtml({cat:'바디수트',availableSizes:[]});assert.ok(absent.includes('소재'));assert.ok(absent.includes('판매처 상세페이지 확인'));assert.ok(absent.includes('사이즈'));assert.ok(absent.includes('판매처 옵션 및 실측 확인'));assert.ok(!absent.includes('면 100%'),'do not invent material');
assert.ok(context.productInfoHtml({material:'<img onerror=alert(1)>',availableSizes:[]}).includes('&lt;img'));
assert.equal(context.evaluateFit({months:0,height:50,weight:4},{brand:'아가방'}).status,'recommended','newborn age 0 is valid');
console.log('Release presentation: source-preserving names, truthful material/size and zero-month fit PASS');
const photos={imageUrl:'https://example.com/front.jpg',imageUrls:['https://example.com/front.jpg','https://example.com/back.jpg','javascript:bad']};
assert.deepEqual(Array.from(context.productImages(photos)),['https://example.com/front.jpg','https://example.com/back.jpg']);
const gallery=context.imageGallery({...photos,name:'아기 옷'},'detailpic');assert.equal((gallery.match(/class="gallery-slide"/g)||[]).length,2);assert.equal((gallery.match(/data-gallery-dot=/g)||[]).length,2);assert.ok(gallery.includes('aria-pressed="true"'));assert.ok(!gallery.includes('gallery-count'));

const playInfo=context.productInfoHtml({domain:'toy',cat:'감각놀이',ageEvidence:null});assert.ok(playInfo.includes('대상 연령'));assert.ok(!playInfo.includes('사이즈'));assert.ok(playInfo.includes('판매처 권장 연령 확인'));assert.equal(context.evaluateFit({months:12,height:76,weight:10},{domain:'toy',brand:'아가방'}).status,'not_applicable');

const sellerOptions={availableSizes:['80','90'],offers:[{merchant:'A',price:30000,availableSizes:['80']},{merchant:'B',price:10000,availableSizes:['90']}]};
assert.equal(context.matchesSellerOptions(sellerOptions,{seller:'A',size:'90'}),false);
assert.equal(context.matchesSellerOptions(sellerOptions,{seller:'A',size:'80'}),true);
assert.equal(context.matchesSellerOptions(sellerOptions,{seller:'B',size:''}),true);
assert.equal(context.matchesSellerOptions(sellerOptions,{seller:'',size:'90'}),true);
const sellerHtml=context.sellerFactsHtml({offers:[{merchant:'<bad>',affiliateUrl:'javascript:alert(1)'},{merchant:'판매처 A',affiliateUrl:'https://example.test/buy',material:'<img>',availableSizes:['80']}]});
assert.ok(!sellerHtml.includes('javascript:'));assert.ok(sellerHtml.includes('&lt;img&gt;'));assert.ok(sellerHtml.includes('noopener noreferrer'));
assert.equal(context.materialLabel({material:'면',materialConflict:true}),'판매처별 소재 정보가 달라요');

assert.equal(context.matchesSellerOptions(sellerOptions,{seller:'A',size:'80',max:15000}),false);
assert.equal(context.matchesSellerOptions(sellerOptions,{seller:'B',size:'90',max:15000}),true);
assert.equal(context.matchesSellerOptions(sellerOptions,{seller:'A',size:'80',min:20000}),true);

const oldFlooring={domain:'learning',name:'EVA 폼 퍼즐 어린이 놀이 매트, 크롤링 카펫, 바닥 패드, 퍼즐 타일'};
assert.equal(context.isDiscoveryProduct(oldFlooring),false,'previous catalog floor coverings are not shown while preserving the snapshot');
assert.equal(oldFlooring.domain,'learning','original source classification is preserved');
assert.equal(context.isDiscoveryProduct({domain:'learning',name:'클래식월드 유아 원목 야채 퍼즐'}),true);
assert.equal(context.isDiscoveryProduct({domain:'apparel',name:'유아 카펫 무늬 가디건'}),true,'apparel motifs are not excluded as floor coverings');
