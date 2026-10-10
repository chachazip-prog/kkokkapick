# 꼬까픽 UI/UX 2차 비교 — 06 · 08 · 09

> **최신 검토: [실제 서비스 참고 분석과 탐색 동작 보완](commercial-reference-review.md).** Product Owner는 아래 2차 시안의 디자인 품질을 다시 거절했습니다. 아래 이미지는 이전 검토 기록이며 최종 선정안이 아닙니다. 기존 08 추천은 보류하고, 공개 상업 서비스 화면에 근거한 다음 시각 검토 기준을 정리했습니다.

사용자가 관심을 보인 세 안을 구조부터 다시 다듬었습니다. **최종 디자인 선정 전의 검토 시안**입니다. 이전 열 가지 방향을 섞어 새 최종안을 정하지 않았습니다.

| 안                      | 새 탐색 흐름                                       | 홈 · 휴대폰                                 | 검색                                          | 상세                                          | PC 홈                                        |
| ----------------------- | -------------------------------------------------- | ------------------------------------------- | --------------------------------------------- | --------------------------------------------- | -------------------------------------------- |
| **06 브랜드 산책**      | 실제 브랜드 이름 → 의류 목록 → 가격·판매처         | [화면](round-two-images/06-home-mobile.jpg) | [화면](round-two-images/06-search-mobile.jpg) | [화면](round-two-images/06-detail-mobile.jpg) | [화면](round-two-images/06-home-desktop.jpg) |
| **08 마음에 담은 보드** | 무간격 3×4 사진 → 선택 상품 카드 → 찜·정보 보기    | [화면](round-two-images/08-home-mobile.jpg) | [화면](round-two-images/08-search-mobile.jpg) | [화면](round-two-images/08-detail-mobile.jpg) | [화면](round-two-images/08-home-desktop.jpg) |
| **09 입고, 놀고**       | 의류 / 장난감·교구 분리 → 각 품목·조건 → 상품 정보 | [화면](round-two-images/09-home-mobile.jpg) | [화면](round-two-images/09-search-mobile.jpg) | [화면](round-two-images/09-detail-mobile.jpg) | [화면](round-two-images/09-home-desktop.jpg) |

2차 라운드에서는 반복 캠페인 그리드와 큰 선언형 제목, 중첩 카드, 빈 찜 보드를 제거했습니다. 상품 이미지 경계와 둥근 한국어 글꼴을 유지했지만 Product Owner는 여전히 상업 서비스의 디자인 수준에 미치지 못한다고 판단했습니다. 최신 설계 기준과 내부 동작 변경은 위 링크에서 확인합니다.

**현재 상품 사진은 만료 상태입니다.** 위 18개 실제 브라우저 캡처는 사진·가격을 정상 상품처럼 꾸미지 않은 현재 상태이며, 캠페인은 승인된 한국인 두 아이 이미지입니다. 상품이 있는 사진 피드·브랜드 목록·상세·팝업은 별도 테스트 데이터로 검증했지만 실제 상품 사진 품질 QA와 구분합니다. 소재·판매 사이즈 원본과 안정적인 사진 공급도 아직 미해결입니다.

- [단일 HTML 다운로드 데모](../../react-preview/offline.html): Raw 파일을 다운로드한 뒤 PC의 로컬 HTTP 서버에서 열 수 있습니다. 임시 상품 사진·테스트 상품·아이 정보를 포함하지 않습니다. 공개 실행 앱 URL은 현재 확보하지 못했습니다.
- 경로 예: `offline.html#/proposals?proposal=08&surface=home&device=mobile`. 06/08/09와 기존 01–10, home/search/detail, mobile/desktop, 각 팝업을 비교할 수 있습니다.
- [이번 변경·검증·한계](round-two-review.md), [이전 10안의 설명](design-proposals.md), [상품 원본 근거](catalog-evidence.md).
- 실제 iPhone Product Owner 승인 전이며 main 미병합·운영 미배포입니다.

<details open>
<summary>06 · 브랜드 산책 — 새 홈</summary>

![06 새 홈 · 상품 원본 만료](round-two-images/06-home-mobile.jpg)

</details>

<details open>
<summary>08 · 마음에 담은 보드 — 새 홈</summary>

![08 새 홈 · 상품 원본 만료](round-two-images/08-home-mobile.jpg)

</details>

<details open>
<summary>09 · 입고, 놀고 — 새 홈</summary>

![09 새 홈 · 상품 원본 만료](round-two-images/09-home-mobile.jpg)

</details>

## 이전 10안 — 1차 자료

아래 캡처는 **1차 비교 자료**입니다. 새 06/08/09는 위 표와 다운로드 데모를 기준으로 확인합니다.

| 번호   | 방향                 | 홈                                  | 검색                                  | 상세                                  |
| ------ | -------------------- | ----------------------------------- | ------------------------------------- | ------------------------------------- |
| **01** | **사진으로 쏙쏙**    | [화면](proposal-images/01-home.jpg) | [화면](proposal-images/01-search.jpg) | [화면](proposal-images/01-detail.jpg) |
| **02** | **오늘의 작은 옷장** | [화면](proposal-images/02-home.jpg) | [화면](proposal-images/02-search.jpg) | [화면](proposal-images/02-detail.jpg) |
| **03** | **한눈에 가격 비교** | [화면](proposal-images/03-home.jpg) | [화면](proposal-images/03-search.jpg) | [화면](proposal-images/03-detail.jpg) |
| **04** | **우리 아이 기준**   | [화면](proposal-images/04-home.jpg) | [화면](proposal-images/04-search.jpg) | [화면](proposal-images/04-detail.jpg) |
| **05** | **품목별 옷장**      | [화면](proposal-images/05-home.jpg) | [화면](proposal-images/05-search.jpg) | [화면](proposal-images/05-detail.jpg) |
| **06** | **브랜드 산책**      | [화면](proposal-images/06-home.jpg) | [화면](proposal-images/06-search.jpg) | [화면](proposal-images/06-detail.jpg) |
| **07** | **바로 찾는 꼬까**   | [화면](proposal-images/07-home.jpg) | [화면](proposal-images/07-search.jpg) | [화면](proposal-images/07-detail.jpg) |
| **08** | **마음에 담은 보드** | [화면](proposal-images/08-home.jpg) | [화면](proposal-images/08-search.jpg) | [화면](proposal-images/08-detail.jpg) |
| **09** | **입고, 놀고**       | [화면](proposal-images/09-home.jpg) | [화면](proposal-images/09-search.jpg) | [화면](proposal-images/09-detail.jpg) |
| **10** | **작은 옷 이야기**   | [화면](proposal-images/10-home.jpg) | [화면](proposal-images/10-search.jpg) | [화면](proposal-images/10-detail.jpg) |

아래 항목을 펼치면 홈 구성을 비교할 수 있습니다. 이미지별 검색·상세 링크는 위 표에 있습니다.

<details open>
<summary>01 · 사진으로 쏙쏙</summary>

![01 홈 · 캠페인 구성 검토](proposal-images/01-home.jpg)

</details>

<details>
<summary>02 · 오늘의 작은 옷장</summary>

![02 홈 · 캠페인 구성 검토](proposal-images/02-home.jpg)

</details>

<details>
<summary>03 · 한눈에 가격 비교</summary>

![03 홈 · 캠페인 구성 검토](proposal-images/03-home.jpg)

</details>

<details>
<summary>04 · 우리 아이 기준</summary>

![04 홈 · 캠페인 구성 검토](proposal-images/04-home.jpg)

</details>

<details>
<summary>05 · 품목별 옷장</summary>

![05 홈 · 캠페인 구성 검토](proposal-images/05-home.jpg)

</details>

<details>
<summary>06 · 브랜드 산책</summary>

![06 홈 · 캠페인 구성 검토](proposal-images/06-home.jpg)

</details>

<details>
<summary>07 · 바로 찾는 꼬까</summary>

![07 홈 · 캠페인 구성 검토](proposal-images/07-home.jpg)

</details>

<details>
<summary>08 · 마음에 담은 보드</summary>

![08 홈 · 캠페인 구성 검토](proposal-images/08-home.jpg)

</details>

<details>
<summary>09 · 입고, 놀고</summary>

![09 홈 · 캠페인 구성 검토](proposal-images/09-home.jpg)

</details>

<details>
<summary>10 · 작은 옷 이야기</summary>

![10 홈 · 캠페인 구성 검토](proposal-images/10-home.jpg)

</details>
