import assert from 'node:assert/strict';
import { isKidsApparel } from '../src/apparel-relevance.js';
import { classifyCategory } from '../src/product-classifier.js';
for (const title of ['10Pcs 수지 단추 어린이 셔츠 DIY 공예', '12 개/몫 라인스톤 코트 단추', '유아 인테리어 모빌', '키즈 스토리 프로젝터', '동아 싸인펜 유아용', '영국군 P37 레깅스', '여성 자켓 BABY BLUE', '우리문화한시리즈(한복)', '아기 트림 천 트림 타월', '아기 DIY 바느질 용품 패치 장식 20개', '유아 구명조끼 암튜브 퍼들점퍼', '아기옷 미니세탁기', '아기옷 빨래건조대', '미니건조기 아기옷', '아기용 세탁통 세면대', '아기옷 세탁소다', '양모 원사 DIY 아기 옷', '직조 면 목 라벨 아동복', '자수 패치 스틱 온 자기 접착 스티커 아기 의류', '여성 프로 쉴드 자켓 BABY PINK', '성인 남성 티셔츠', '귀여운 조끼 여름 유아 소형 중형견용 의류', '아기 강아지옷 원피스', '시온가구 엘리 와이드 3단 아기옷 아이방 옷방 속옷 다용도 서랍장', '여성원피스', '남성티셔츠', '아기옷 깨끗하게 해주는 탄산 워싱소다 3kg+원형컵 계량스푼 1개']) assert.equal(isKidsApparel(title), false, title);
for (const title of ['베베비치 피그패치 상하세트 유아 여름옷', '여아 별패치 데님팬츠', '라벨크라운 남아여아 배냇 우주복', '오가닉맘 아기 내복', '[여성트랜드패션] 여아 원피스', '돌잔치 유아 한복', '백일 아기 드레스', '유아 래쉬가드', '아동 레인코트', '남자 아기 티셔츠', '유아 자동차 프린트 티셔츠', '아동 고양이 자수 원피스', '아동 버튼 카디건', '신생아 레이스 장식 바디수트']) assert.equal(isKidsApparel(title), true, title);
for (const [title, category] of [['아기 롬퍼','바디수트'],['유아 수면조끼','실내복'],['키즈 카디건','아우터'],['키즈 풀오버','상의'],['아동 트랙슈트','상하복'],['키즈 스윔 팬츠','수영복']]) assert.equal(classifyCategory(title, '아기 티셔츠'), category);
assert.equal(classifyCategory('유아 원피스', '신생아 바디수트'), '원피스');
console.log('Apparel relevance and title classification tests passed');
