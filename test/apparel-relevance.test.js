import assert from 'node:assert/strict';
import { isKidsApparel } from '../src/apparel-relevance.js';
import { classifyCategory } from '../src/product-classifier.js';
for (const title of ['10Pcs 수지 단추 어린이 셔츠 DIY 공예', '12 개/몫 라인스톤 코트 단추', '유아 인테리어 모빌', '키즈 스토리 프로젝터', '동아 싸인펜 유아용', '영국군 P37 레깅스', '여성 자켓 BABY BLUE', '우리문화한시리즈(한복)', '아기 트림 천 트림 타월', '아기 DIY 바느질 용품 패치 장식 20개', '유아 구명조끼 암튜브 퍼들점퍼', '아기옷 미니세탁기', '아기옷 빨래건조대', '미니건조기 아기옷', '아기용 세탁통 세면대', '아기옷 세탁소다', '양모 원사 DIY 아기 옷', '직조 면 목 라벨 아동복', '자수 패치 스틱 온 자기 접착 스티커 아기 의류', '여성 프로 쉴드 자켓 BABY PINK', '성인 남성 티셔츠', '귀여운 조끼 여름 유아 소형 중형견용 의류', '아기 강아지옷 원피스', '시온가구 엘리 와이드 3단 아기옷 아이방 옷방 속옷 다용도 서랍장', '여성원피스', '남성티셔츠', '아기옷 깨끗하게 해주는 탄산 워싱소다 3kg+원형컵 계량스푼 1개']) assert.equal(isKidsApparel(title), false, title);
for (const title of ['베베비치 피그패치 상하세트 유아 여름옷', '여아 별패치 데님팬츠', '라벨크라운 남아여아 배냇 우주복', '오가닉맘 아기 내복', '[여성트랜드패션] 여아 원피스', '돌잔치 유아 한복', '백일 아기 드레스', '유아 래쉬가드', '아동 레인코트', '남자 아기 티셔츠', '유아 자동차 프린트 티셔츠', '아동 고양이 자수 원피스', '아동 버튼 카디건', '신생아 레이스 장식 바디수트']) assert.equal(isKidsApparel(title), true, title);
for (const [title, category] of [['아기 롬퍼','바디수트'],['유아 수면조끼','실내복'],['키즈 카디건','아우터'],['키즈 풀오버','상의'],['아동 트랙슈트','상하복'],['키즈 스윔 팬츠','수영복']]) assert.equal(classifyCategory(title, '아기 티셔츠'), category);
assert.equal(classifyCategory('유아 원피스', '신생아 바디수트'), '원피스');
console.log('Apparel relevance and title classification tests passed');

assert.equal(isKidsApparel("비비홈 w 데일리 코튼 크림버터 반팔 티셔츠"), false);
assert.equal(isKidsApparel("와이프로젝트/[Y프로젝트] SS24 Y Baby Tee 반팔 티셔츠 104TO004OPTICWHITE 2535818/의류 반팔티셔츠"), false);
assert.equal(isKidsApparel("남녀공용 깨어있으리라 반팔티 아기천사 티셔츠 가족티 키밍 라운드티"), false);
assert.equal(isKidsApparel("[하프클럽/에이치플러스몰]반팔티앞뒤 크리스마스 아기예수 구유 라인아트 AI이미지 남녀공용 전사이즈 가능"), false);
assert.equal(isKidsApparel("슬리/[한정특가]/[단독]Sheer Tencel Trench_Charcoal/아우터 코트"), false);
assert.equal(isKidsApparel("유유존 셔링힙업레깅스 요가 필라테스레깅스 엉뽕 하이웨스트 9color"), false);
assert.equal(isKidsApparel("휴고보스/26FW 휴고보스 스웨터 50565523 118 OPEN WHITE DOM/의류 니트"), false);
assert.equal(isKidsApparel("폴로랄프로렌/[폴로랄프로렌] FW26티셔츠 710671438539 7591739/의류 반팔티셔츠"), false);

// Actual expanded-source regressions: reject the item being sold, preserve child motifs and clothing bundles.
for (const title of ['귀여운 네발옷 강아지 겨울옷 도그베이비', 'Sphynx 고양이 여름 옷 네다리 면 잠옷 수술 재활복', '코코테일 고양이겨울옷 아기고양이 뚱냥이 옷', '아기용 100% 면 플란넬 원단 잠옷 턱받이 옷 T315', '어린이 빌딩 블록 벽 스티커 자체 접착 벽지', '여아용 원피스 딸기 담요', '아기 고양이 인쇄 욕실 얼굴 수건', '나이키키즈 조던 프랜차이즈 힙 백', '메종키츠네 SS26 BABY FOX 반팔 티셔츠', '폴로랄프로렌 FW26 반팔 티셔츠', '반팔티 챗지피티 생성 아기코끼리 티셔츠']) assert.equal(isKidsApparel(title), false, title);
for (const title of ['페리미츠 강아지 전판 티셔츠', '베베샤 유아 롬퍼 모자세트 강아지 고양이', 'IL GUFO KIDS 테크원단 남아 상하복', '에뜨와 이브가방 OPS SET', '[베네통키즈] 컬러 블럭 가디건', '[디즈니베이비] 블럭 오픈내의', '키즈 썬블럭 모자세트', '[언더아머] 키즈 컬러블록 Leggings Set', '[빈폴키즈] 피나포어 원피스', 'pm6 키즈 귀달이 모자']) assert.equal(isKidsApparel(title), true, title);
assert.equal(classifyCategory('pm6 키즈 귀달이 모자'), '패션잡화');

assert.equal(classifyCategory('아가방 아양우주복(모자)(O/WHITE)_01R71750503'), '바디수트');
assert.equal(classifyCategory('블로니우주복모자 양말SET'), '바디수트');
assert.equal(classifyCategory('핑크베리 여아 래쉬가드 썬블럭 모자세트'), '수영복');

assert.equal(classifyCategory('아동 양말'), '패션잡화');
