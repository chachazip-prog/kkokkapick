// Product-title relevance, separate from query-derived discovery labels.
const APPAREL = /(신생아|아기|베이비|유아|키즈|아동|주니어|남아|여아|팬츠|바디수트|바디슈트|우주복|배냇|내복|상하복|티셔츠|맨투맨|블라우스|셔츠|바지|레깅스|원피스|가디건|카디건|아우터|점퍼|자켓|코트|의류|롬퍼|점프수트|수면조끼|우비|레인코트|수영복|래[쉬시]가드|한복)/i;
const NON_PRODUCT = /(크랭크|센서|자동차 ?부품|차량용|부품|케이블|공구|휴대폰|케이스|골프|호텔|입장권|eSIM|이름표|장식판|벽 ?장식|아기방|사진 ?소품|기념품|완구|장난감|인형|식기|젖병|기저귀|물티슈|유모차|카시트|배너|커튼|자전거|타이어|라이딩|수납|파우치|압축팩|모피 ?칼라|트리밍|패브릭|봉제|욕조|앞치마|에이프런|물병|물통|옷걸이|소파|의자|수유일지|침대|반려동물|애완동물|반려견|반려묘|펫의류|강아지\s*옷|고양이\s*옷|소형견|중형견|대형견|견용|묘용|금형|폴더|보관|이불|토퍼|베이비 ?모니터|모니터|가방고리|키링|성인|액세서리)/i;
const SUPPLIES = /(세탁기|건조기|건조대|세탁통|세면대|세탁용품|세탁소다|워싱소다|과탄산|베이킹소다|양모 원사|뜨개실|뜨게|크로셰|직조.*라벨|목 라벨|자기 접착|접착 스티커|패치 스틱 온)/i;
const CHILD = /(신생아|아기|유아|키즈|아동|주니어|남아|여아|남자\s*아기|베이비|baby|kids|junior)/i;
export function isKidsApparel(name = '') {
  const title = String(name);
  if (!APPAREL.test(title) || NON_PRODUCT.test(title) || SUPPLIES.test(title)) return false;
  // BABY PINK is a color, not evidence that an adult garment is for a child.
  const productTitle = title.replace(/^\[[^\]]*\]\s*/, '').replace(/baby\s*pink|베이비\s*핑크/ig, '');
  if (/(여성|여자|남성|남자)/.test(productTitle) && !CHILD.test(productTitle)) return false;
  return true;
}
