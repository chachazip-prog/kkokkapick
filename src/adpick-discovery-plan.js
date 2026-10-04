export const ADPICK_DISCOVERY_QUERIES = Object.freeze([
  // Broad queries restore recall under the provider's current search semantics.
  "아기옷","유아복","아동복","키즈옷","베이비옷",
  "여아옷","남아옷","아기 여름옷","아기 겨울옷","유아 여름옷","유아 겨울옷",
  "아동 티셔츠","아동 바지","아동 원피스","아동 상하복",
  "여아 원피스","여아 티셔츠","여아 바지","남아 티셔츠","남아 바지","남아 상하복",
  "아동 맨투맨","아동 셔츠","아동 자켓","아동 점퍼",
  "신생아 바디수트","신생아 우주복","신생아 내의","아기 내복","아기 실내복","아기 상하복",
  "아기 티셔츠","아기 바지","아기 레깅스","아기 원피스","아기 가디건","아기 아우터",
  "아기 수면조끼","유아 티셔츠","유아 맨투맨","유아 셔츠","유아 바지","유아 레깅스",
  "유아 원피스","유아 가디건","유아 점퍼","유아 자켓","키즈 상하복","유아 수영복",
  "키즈 맨투맨","키즈 셔츠","키즈 바지","키즈 레깅스","키즈 원피스","키즈 가디건",
  "키즈 점퍼","키즈 자켓",
  "아가방 아기옷","에뜨와 아기옷","밍크뮤 아기옷","모이몰른 아기옷","키즈 래쉬가드",
  "블루독베이비 아기옷","유아 한복","쇼콜라 아기옷","빈폴키즈 아동복",
  "헤지스키즈 아동복","토들러 옷","아기 롬퍼","MLB키즈 아동복",
  "휠라키즈 아동복","나이키키즈 아동복","아디다스키즈 아동복",
  // Retain the six earlier queries: their latest baseline contributed21 offers.
  // Diversity additions supplement coverage instead of silently replacing it.
  "유아 상하복","키즈 티셔츠","압소바 아기옷","해피프린스 아기옷",
  "베네통키즈 아동복","캉골키즈 아동복"
]);

export const ADPICK_SEARCH_LIMIT = 20;
export const ADPICK_DISCOVERY_PACING_MS = 6500;

// Broad canaries are intentionally separate from the publication discovery plan.
// They let us detect provider search-semantic changes without silently changing catalog composition.
export const ADPICK_BROAD_QUERY_CANARIES = Object.freeze([
  "아기옷", "유아복", "아동복", "키즈옷", "베이비옷"
]);
