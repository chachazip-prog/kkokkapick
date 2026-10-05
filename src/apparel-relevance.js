import domains from './product-domain.js';
import { normalizeProductName } from './product-grouper.js';
// Independent catalog review: these exact titles lack positive child-apparel evidence.
// Preserve raw offers; quarantine display until explicit child sizing is supplied.
const REVIEW_QUARANTINE = new Set([
  "비비홈 w 데일리 코튼 크림버터 반팔 티셔츠",
  "와이프로젝트/[Y프로젝트] SS24 Y Baby Tee 반팔 티셔츠 104TO004OPTICWHITE 2535818/의류 반팔티셔츠",
  "남녀공용 깨어있으리라 반팔티 아기천사 티셔츠 가족티 키밍 라운드티",
  "[하프클럽/에이치플러스몰]반팔티앞뒤 크리스마스 아기예수 구유 라인아트 AI이미지 남녀공용 전사이즈 가능",
  "슬리/[한정특가]/[단독]Sheer Tencel Trench_Charcoal/아우터 코트",
  "유유존 셔링힙업레깅스 요가 필라테스레깅스 엉뽕 하이웨스트 9color",
  "휴고보스/26FW 휴고보스 스웨터 50565523 118 OPEN WHITE DOM/의류 니트",
  "폴로랄프로렌/[폴로랄프로렌] FW26티셔츠 710671438539 7591739/의류 반팔티셔츠"
].map(normalizeProductName));
// Product-title relevance, separate from query-derived discovery labels.
const APPAREL = /(\bOPS\b|leggings|상하의|유아복|아동복|정장|교복|남방|고무신|투피스|후디|후드|트랙\s*탑|져지|저지|다운|조끼|수면\s*조끼|바디\s*[슈수]트|옷|내의|실내복|잠옷|드레스|상하세트|셋업|트랙슈트|풀오버|스웨터|스커트|모자|양말|헤어밴드|머리띠|터번|운동화|구두|샌들|장화|팬츠|바디수트|바디슈트|우주복|배냇|내복|상하복|티셔츠|맨투맨|블라우스|셔츠|바지|레깅스|원피스|가디건|카디건|아우터|점퍼|자켓|코트|의류|롬퍼|점프수트|점프슈트|수면조끼|우비|레인코트|수영복|래[쉬시]가드|한복)/i;
const NON_PRODUCT = /(크랭크|센서|자동차 ?부품|차량용|부품|케이블|공구|휴대폰|케이스|골프|호텔|입장권|eSIM|이름표|장식판|벽 ?장식|아기방|사진 ?소품|기념품|완구|장난감|인형|식기|젖병|기저귀|물티슈|유모차|카시트|배너|커튼|자전거|타이어|라이딩|수납|파우치|압축팩|모피 ?칼라|트리밍|패브릭|봉제|욕조|앞치마|에이프런|물병|물통|옷걸이|소파|의자|수유일지|침대|반려동물|애완동물|반려견|반려묘|펫의류|강아지\s*옷|고양이\s*옷|소형견|중형견|대형견|견용|묘용|금형|폴더|보관|이불|토퍼|베이비 ?모니터|모니터|가방고리|키링|성인|액세서리)/i;
const SUPPLIES = /(모빌|프로젝터|플래시라이트|싸인펜|사인펜|영국군|세계 대전|우리문화한시리즈|단추.*(?:DIY|공예|개\/몫)|(?:\d+Pcs|\d+ ?개\/몫).*단추|트림 ?(?:천|타월)|바느질 ?용품|구명조끼|퍼들점퍼|암튜브|암링|팔튜브|가구|서랍장|수납장|베개|세탁기|건조기|건조대|세탁통|세면대|세탁용품|세탁소다|워싱소다|과탄산|베이킹소다|양모 원사|뜨개실|뜨게|크로셰|직조.*라벨|목 라벨|자기 접착|접착 스티커|패치 스틱 온)/i;
const PET_WEAR = /(?:강아지|고양이|도그|Sphynx|데빈\s*렉스|비숑|포메라니안).*(?:겨울옷|여름\s*옷|네\s*발|네\s*다리|재활복|하네스|옷|잠옷)|아기고양이|도그베이비|뚱냥이/i;
const SUPPLY_ITEM = /옷입히기|벽지|벽\s*스티커|수건|담요|힙\s*백|원단.*(?:T\d+|턱받이|봉제|플란넬)|(?:플란넬|인쇄|프린트가 있는).*원단/i;
const CHILD_BRAND = /아가방|에뜨와|압소바|밍크뮤|모이몰른|블루독|쇼콜라|오가닉맘|위드오가닉|보누맘|달퐁|삠뽀요|해피프린스|페리미츠|프렌치캣|프랜치캣|베베드피노|케어베어|닥스리틀|더에르고|모이모키/i;
const CHILD = /(신생아|아기|유아|키즈|아동|어린이|토들러|출산|백일|주니어|남아|여아|남자\s*아기|베이비|baby|kids|junior)/i;
export function isKidsApparel(name = '') {
  const title = String(name);
  if (REVIEW_QUARANTINE.has(normalizeProductName(title))) return false;
  if (SUPPLY_ITEM.test(title)) return false;
  // An animal motif on explicitly child-targeted clothing remains eligible.
  if (/네\s*발\s*옷|네\s*다리|하네스|도그베이비|아기고양이|뚱냥이|고양이.*(?:수술|재활복)/i.test(title)) return false;
  if (PET_WEAR.test(title) && !/(아동|유아|키즈|어린이|남아|여아)/.test(title)) return false;
  if (!APPAREL.test(title) || NON_PRODUCT.test(title) || SUPPLIES.test(title)) return false;
  // BABY PINK is a color, not evidence that an adult garment is for a child.
  const productTitle = normalizeProductName(title).replace(/baby\s*(?:pink|blue)|베이비\s*(?:핑크|블루)/ig, '');
  const targetTitle=productTitle.replace(/BABY\s*FOX|Y\s*Baby\s*Tee|아기\s*(?:천사|예수|코끼리)|(?:아기|베이비)\s*(?:핑크|블루)/ig, '');
  if (!CHILD.test(targetTitle) && !CHILD_BRAND.test(targetTitle) && !/배냇|우주복|바디[슈수]트/.test(targetTitle)) return false;
  if (/(여성|여자|남성|남자)/.test(productTitle) && !CHILD.test(productTitle)) return false;
  return true;
}

export function classifyCatalogRelevance(product={}) {
 const domain=domains.nonApparelDomain(product.name);
 if(domain)return {eligible:true,domain,reason:null};
 if(domains.isNonApparelCandidate(product.name))return {eligible:false,domain:null,reason:"non_apparel_scope_or_safety_unverified"};
 return {eligible:isKidsApparel(product.name),domain:"apparel",reason:"child_apparel_evidence_required"};
}
