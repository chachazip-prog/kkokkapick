# Product Owner review candidate — 2026-10-08 한국시간

이번 기록은 신생아·유아 의류 중심 탐색, 장난감·교구 확장 및 원색 컴포넌트 개선의 최신 검토입니다. R01과 채택된 남녀 아이 2명 히어로 3안을 유지합니다. 기술 검토는 위임된 범위에서 진행했습니다. 실제 iPhone Product Owner 검토·승인은 아직 관측하지 않았으며 main 병합·운영 배포를 하지 않았습니다.

아래 10월 7일 기록의 상품 원본과 사진 표시 기한은 이미 만료했습니다. 이전 READY 문구와 screenshot은 현재 정상 상품 화면이나 지속 가용성의 근거가 아닙니다.

## 새 상품 원본과 검증 코드

- [수집·게시 실행 37769439139](https://github.com/chachazip-prog/kkokkapick/actions/runs/37769439139) SUCCESS. 승인된 85개 검색을 모두 수행했습니다. 반환 1,700행, 중복 제거 전후의 unique 후보 1,249개, 관련 판매처 자료 1,052개입니다. 0건 검색과 새 자료 0건 검색은 각각 0개이며 API 전체 상품 수를 확인한 결과는 아닙니다.
- 게시 데이터 SHA `bd06b3d27bf656f42c9e3b1be08bccf56b19e7f1`. 이 hosted 실행은 시작 코드 `45e4d46d244e53e8392badffab2ce8a7bd41343a`와 게시 데이터 조합을 검사했습니다. 이후 수정 코드 QA로 잘못 표시하지 않습니다.
- 전체 수집 이미지에서 건강한 원본 1,044개와 HTTP 404 원본 8개를 구분했습니다. 실패 8개의 원본 URL·HTTP 상태·관측 시각을 원시 판매처 자료에 보존하고 표시에서 제외했습니다. 게시 직전 원본 전체 100% gate를 통과한 원본만 사용했습니다.
- 원본 catalog 955개와 SHA256 `5e4f0b5c41cc93291f8bb6723f77bbb2f04151bf783e2d52f242818ee7c4cbaa`는 후속 코드 수정에서 변하지 않았습니다. 최종 코드 `802b3a59da7b5b6ac4b2d48ce65dfbdd94a223fd`는 잘못 분류된 미터 단위 재봉 원단 1개를 browsing·검색·deep link 상세에서 제외합니다. 실제 표시 **954개: 의류 871·장난감 48·교구 35**, 복수 사진 상품 81개, 표시 사진 원본 1,043개입니다. 테크원단 완성 아동복은 유지합니다.
- 최종 코드의 [Code quality 37772506498](https://github.com/chachazip-prog/kkokkapick/actions/runs/37772506498) SUCCESS. 로컬 구성 검사 99개(테스트 스크립트 65개, 구문/구조 검사 34개)도 같은 SHA에서 PASS했습니다. 문서만 추가하는 후속 commit은 이 코드 QA와 구분합니다.
- 실제 Chromium 전체 디코딩은 `6de8c51e3206d8d6bbec69322b61b55b0d323f0f`에서 11:43:12–11:45:54 UTC에 수행했습니다. **1,044/1,044 첫 시도 PASS**, 복구 시도·최종 실패 0, 양의 자연 이미지 크기 확인. 최종 802 코드의 디코더와 원본 bytes/URL이 동일하며, 별도 검토자가 최종 표시 1,043개 URL이 이 검증된 원본의 부분집합임을 대조했습니다. 최종 코드에서 전체 디코딩을 새로 했다고 표시하지 않습니다.

원본 관측 **2026-10-08 20:21:07.566 KST**, 내부 사진 표시 기한 **2026-10-08 21:51:07.566 KST**, metadata 기한 2026-10-09 20:21:07.566 KST입니다. 내부 90분/24시간 기준은 공급자 TTL·지속 가용성·재표시 권리 보장이 아닙니다. 원본 사진은 더 일찍 만료할 수 있습니다. QA로 원본 URL·관측 시각·기한을 연장하지 않았으며 원본 사진 파일을 영구 저장하지 않았습니다.

## 실제 화면 및 독립 육안 검토

최종 802 코드와 같은 원본으로 실제 Chromium QA를 수행했습니다. **320/375/390/430px, 80개 화면 상태 지표·92개 PNG**입니다. 가로 넘침, 보이는 깨진/미로딩 이미지, 이미지 격리, 주요 감지 잘림과 runtime 오류는 0입니다.

root는 새 핵심 Home/Search/Detail/Wishlist/My 20개를 모두 열고, 사진 피드 320/430·사진 카드 320·필터 320·두 번째 사진 390·놀이 상세 320·놀이 월령 320·아이 관리 320 등 추가 8개를 열었습니다. 별도 검토자는 **새 PNG 31개**를 개별로 열었습니다(핵심 20, 사진 피드 네 폭, 사진 카드/필터/두 번째 사진/놀이 상세/놀이 월령/아이 관리/데모 각 1). **독립 Visual QA PASS, 필수 UI 수정 0**입니다. 이전 6de 코드의 31개를 최종 802 검토로 재사용하지 않았습니다.

검색·카테고리·브랜드/판매처/가격 필터, 자동 상품/사진 스크롤, 무간격 3×4 사진 피드, 사진 카드와 복수 사진 도트, 여러 아이 등록/선택과 선택 아이 꼬까핏, 찜·최근 기록·로컬 희망 가격, 판매처 이동, 원본 없는 놀이 연령 필터의 빈 결과/복원 및 만료 복귀를 검증했습니다. 가격은 해당 판매처 offer 기준을 유지하고 소재/실제 판매 사이즈/놀이 연령을 추정하지 않습니다. 주문·배송 UI는 제거된 상태입니다.

공개 GitHack 802 preview는 정상 first-visit **Open the page** 절차로 2026-10-08 20:59:30–20:59:32 KST에 확인했습니다. 홈 표시 954개 중 초기 카드 8개, 보이는 원본 사진의 양의 크기, 두 self-hosted font family 로딩, 넘침·runtime 오류 0을 확인했습니다. 데모 iframe의 실제 상품 수집/표시 기한도 확인하고 root가 공개 홈·데모 PNG 2개를 열었습니다. 앞선 데모 40초 로딩 timeout 1회는 보존하며 후속 정상 상태 PASS와 구분합니다. 외부 preview 호스팅의 초기 지연은 상품 지속 가용성 근거가 아닙니다.

근거는 [최신 검토 receipt](release-verification-2026-10-08.json)에 정리했습니다. 최종 실제 QA 폴더는 `/tmp/kkokkapick-release-802b3a5-actual-visual-qa`, 디코딩 기록은 `/tmp/kkokkapick-release-6de8c51-actual-image-decoding.json`, 독립 검토는 `/tmp/kkokkapick-release-802b3a5-independent-review.json`입니다. 로컬 PNG 92개와 hosted 수집 실행의 이전 코드 artifact는 서로 다른 검증 묶음입니다. 최종 로컬 PNG를 hosted artifact로 표시하지 않습니다.

## 수정된 코드와 실제 실패 상태

통합 코드74ae5f64c650e0cec76cfe34fc53de495d6e723f에서 만료 URL 진입/데모 상태, 브라우저 저장 오류, 꼬까픽 소유 캐시 정리 및 기존 상품 동기화 구문/실행 경계를 수정했습니다. R01/선택 히어로3을 유지하고 화면 오류/재시도 중복을 한 차례 교정했습니다. 기술 승인은 위임된 범위에서 처리했으며 main/운영 배포는 하지 않았습니다.

- 로컬 구성 검사99개(65테스트 스크립트 포함) PASS. 의미 있는 새 회귀는 만료/실패 URL과 성공 재시도/첫 상품 진입8개, 저장소 차단/형식/원자적 상태/상세 탐색9개, 다른 앱 캐시 보존1개 및 실제 격리 shell 게시/변경 head 거절입니다. 해당 문제의 기존 코드 실패를 재현했습니다.
- 기존 실제 원본 hash f52e1bb1587398db5ea218d477fc3e09e989155d660bae7f6d0f6da24e7336e6을 바꾸지 않고 독립 검토자가74ae5f6 고정 archive로 Chromium QA를 수행했습니다. 320/375/390/430px, 실제 만료68상태+명시적 장애 주입6상태=74PNG/검사. 34개 실제 PNG를 개별로 열었습니다(핵심 만료6화면×4, 마이 데모4, 네트워크2, 저장 실패 아이 폼4). root도 이 최종 묶음6개 PNG를 열었습니다.
- 가로 넘침/주요 잘림/런타임 오류/보이는 깨진 사진/만료 상품 노출0. 요청 URL과 데모 view/layout, 한국시간 원본 시각/기한/검토 보류 안내, 입력·찜/희망가격/최근 기록 보존 PASS. 정상 상품 상세·사진 QA를 이 실패 상태 PASS로 대체하지 않습니다.
- 별도의 합성 사진/시각 오류 주입 회귀는 네 폭에서 PASS했습니다. 이는 실제 상품/이미지 지속 가용성 증거가 아닙니다. 서비스 워커 lifecycle은 별도 Node 실험에서 검사했고 Chromium 실패 상태 QA에서는 service worker를 막아 UI를 분리했습니다.
- Security/Privacy는 변경 범위 검토 PASS, 필수 추가 사항0. 저장소 수정 작성자의 직접 검증은 작성자 독립 QA로 계산하지 않았습니다. 웹 브라우저 독립 검토자가 저장 접근 거부/아이 저장 실패도 실제로 확인했습니다. Ops의 코드 준비 검토 PASS이며 동기화 변경은 운영에 활성화하지 않았습니다.

## 남은 공개 출시 조건

소재와 실제 판매 사이즈 원본은 각각 0개이며 놀이 83개 모두 명시 연령 원본이 없습니다. 지속 이미지 갱신 계약/재표시 권리, 허용된 상품 상세 원본, 실제 운영 주체/지원/최종 정책, 운영 계정·푸시 활성화 시 실제 환경·기기 검증, 실제 iPhone Product Owner 승인은 남았습니다. 현재 웹 후보의 기록은 기기 로컬입니다. 없는 원본을 만들어 채우거나 공급자 권리를 임의로 승인하지 않습니다. [릴리즈 준비표](release-preparation.md)에 필요한 정보와 운영 절차를 정리했습니다. 내일 **2026-10-09 07:00 KST 일회성 원본 갱신**, **08:00 정각 진행 보고**를 예약했습니다. 실행 여부와 결과는 내일 사실대로 확인하며 성공을 미리 약속하지 않습니다.

---

# Verification record — 2026-10-07 KST

Scope: newborn/infant apparel first, separate toys/learning discovery and primary-colour component refinement. UI remains the owner-selected R01 reference with hero proposal3. This record supersedes older completion wording and palette proposals below. Technical implementation approvals were delegated to the team; actual iPhone review and Product Owner approval have not been observed. No main merge or production deployment.

## Fresh source and exact identities

- Code commit: aa6d725f28673ef1caaae5f5e66cab66cb7f110e; hosted Code quality run37542518418 SUCCESS,63configured Node scripts plus structure/syntax/security checks. The reviewed local repair tree exactly matches this remote commit.
- Full collection/publication/actual-photo QA run37542521424 SUCCESS. All85approved queries completed;1,146returned rows,941unique before relevance selection,783eligible seller offers. Display catalog718products: apparel634,toys47,learning37;57multi-image products. The nine zero-result queries are retained as negative collection evidence; API-wide inventory size is not established.
- Exact published/QA commit: a58f192515eca248e35c06cf8a9979665353a74f, parent aa6d725. Only catalog data and its quality report differ; UI/source code is unchanged. At this published identity, root ran the same63configured test scripts and35catalog/syntax checks locally, allPASS. This local verification is not labelled a new hosted Code quality run.
- Source observed2026-10-06T22:45:03.803Z; metadata expires2026-10-07T22:45:03.803Z; internal temporary-image display deadline2026-10-07 09:15:03KST. Rechecks do not extend these clocks. Provider images may expire earlier; continuous availability is not established.
- Initial783/783source-offer images healthy. Quarantine783/783with0exclusions; independent prepublication gate783/783unique photos healthy. Exact catalog SHA256 f52e1bb1587398db5ea218d477fc3e09e989155d660bae7f6d0f6da24e7336e6 matches published bytes and decoding input.
- Browser decoding783/783on the first attempt, zero recovery/final failures. Positive natural dimensions, bounded same-URL400retries, source URLs/clocks unchanged; original-photo files were not persisted. Temporary screenshots are QA artifacts.

## Responsive and independent visual QA

Fresh actual-photo artifact11449718565 contains92PNGs and80screen-state metrics at320/375/390/430px. Metrics show zero horizontal overflow, broken/pending visible images, image quarantine, critical detected clipping and runtime errors. Failure injection/recovery is separate from real-source evidence.

Root opened all20core Home/Search/Detail/Wishlist/My PNGs plus8photo/sheet/play/filter/gallery captures. The independent fresh_release_visual_qa reviewer opened39fresh PNGs, not the earlier e551 images:20core, photo-feed320/430, photo-card all4widths, multi-child-manager all4widths, play-detail320, play-age-filter320, multiple-photos-second375/390/430 and filters all4widths. Independent Visual QA PASS; critical issues0, required visual fixes0. Minor nonblocking follow-ups: home section spacing and remaining SET/coupon/title noise. Earlier corrective work on feed continuation, modal/focus handling and narrow layouts remains verified by the new regression run.

Live external preview at2026-10-06T23:05:42Z/390px displayed8home cards from634apparel products, positive image dimensions, both self-hosted font families loaded, no overflow/runtime errors. Root opened that screenshot. GitHack may show an external-content notice; normal first-visit Open the page button continues to the app. After the old source expired at07:30KST, the earlier07:46check showed honest unavailable/retry state rather than stale products; that negative-state check was not a photo-health PASS.

## Preserved behaviour and remaining launch gates

Regression includes search/category/seller and price filtering, same-offer display prices, infinite product/photo scrolling, gapless3x4initial photo feed, gallery dots/second actual photo, multiple child registration/selection, newborn fit, favourites/recent/local targets, seller handoff, empty/restore play-age filtering, expiry sheet closure/focus and saved-record/input preservation. Play does not inherit apparel fit/size or admit unknown source ages; floor coverings remain excluded. Order/delivery UI remains removed.

The prior run37539008425 failed with491/790source photos and299HTTP404,62.2%; it did not publish. Review quarantine now records negative raw evidence and selects healthy originals before a fresh100%final gate. Production80%, approved85query plan,250minimum/65%previous coverage,5%additional exclusion,90minute ceiling, exact catalog hash and source clocks remain enforced. No partial or expired source is relabelled PASS.

Material/live sale sizes remain0in search source; all84displayed play products lack explicit source age. Presentation shows missing-information/seller-verification guidance and never invents facts/stock/age. Favourites, child information and target prices are browser-local; this candidate does not prove production account sync or push delivery. Supplier rights/stable URL renewal/detail feed, actual operator/support/privacy policy and physical iPhone/PO approval remain launch gates. The public guide was examined through a search index; direct guide access returned403. Internal TTL is not supplier-rights evidence. No new paid infrastructure, personal-data upload, seller crawl, original-photo storage or outbound supplier message.

---

# Release UI verification history

The dated sections below are historical checks, not completion evidence for the 2026-10-05 apparel/play and primary-component task. That task requires refreshed original images, current responsive browser QA and independent visual review before its review-candidate marker is published. Product Owner iPhone approval remains pending.

# Product Owner review candidate — 2026-10-04

## Current review candidate — 2026-10-04

Owner selected hero proposal3 (Korean boy and girl); homepage now uses that approved campaign. Photo-first discovery retains12initialtiles in a gapless3column×4row grid. Design specialist reviewed the previous feed and prescribed compact controls/fullbleed images/thin boundaries. Product and photo lists append on scroll without more buttons; wheel/touch continuation also works when the first feed exactly fits the screen. Existing nodes and scroll position are preserved. Multi-image galleries use selectable bullet dots beneath the image, plus swipe/arrow-key support.

Multi-child information remains browser-local with optional nickname and existing measurements only. Selected child drives recommendations and fit. Primary storage writes commit atomically; denied reads and failed compatibility mirrors are handled. Tests cover newborn migration, multiple profiles, selection persistence, write failures, invalid/duplicate data, and deletion. Privacy review findings were resolved; local deletion instructions/inventory now match behavior.

Validation:57Node tests PASS; browser regression at320/375/390/430 PASS,56checked states and64PNG captures. Independent reviewer actually inspected all64captures, including20core screens. Corrective pass fixed continuation at the exact viewport boundary, narrow fit-copy wrapping, and mobile demo iframe clipping. Independent rereview checked9final images and confirmed those visual fixes. Demo preserves chosen logical viewport while scaling to fit the outer device.

Source-image release QA remains BLOCKED: initial real feed images render, but expired provider URLs affect later products/demo samples. Placeholder/error messaging is not healthy catalog imagery. No original material/size facts are fabricated. Physical iPhone testing and Product Owner approval remain pending. No main merge.

Earlier sections below retain the prior review history; this section supersedes earlier hero/counter/demo-width status.


Selected direction: owner-supplied R01 reference, refined by explicit requests for image borders, softer type, warmer backgrounds, improved photo feed, and removal of unsupported capabilities. Main is not merged.

## Evidence

- Baseline audit: 620 CSS rules, 445 `!important` occurrences and repeated selectors; replaced accumulated inline overrides with owned tokens and component styles.
- 56 Node test executions pass; syntax and whitespace checks pass.
- Chromium: 320 / 375 / 390 / 430px, 40 captures covering Home, Search, Detail, empty/filled Wishlist, My, photo feed/card, profile and filters.
- Parent and independent reviewer visually inspected the warm refinement. Horizontal overflow, detected critical clipping, unhandled broken images and runtime errors: zero. Image-source failures are reported separately, not disguised as a healthy catalog.
- Regression: search, category, sorting, price validation, favorites, target-price persistence, recent products, newborn fit, photo selection/detail, modal exclusivity and focus restoration.
- Corrective passes: hero crop/seam, softer typography, coherent image borders, photo feed layout, detail image at 430px, zero-month profile, stacked sheets and detached favorite-trigger focus.
- Latest My screenshots refreshed after removing unsupported announcement menu.

## Capability audit

`docs/client-data-contract.md`, `docs/mobile-ux-direction.md`, `docs/account-data-ux.md`, `docs/provider-integration.md` define discovery, merchant handoff, fit and saved local state. Order/delivery integration is absent; its menu/controller were removed. Fake release-announcement content was removed. Real support/privacy links remain. Price alerts currently save a target locally; this does not claim production push delivery.

## Release blocks

Provider image reliability remains blocked (up to six image failures in the reviewed capture set). Owner authorized continuing UI work and will find a current catalog source later. Some material/size fields are absent; show seller-verification guidance, never invented product facts. Existing hero source is low resolution. Actual iPhone Safari/safe-area review and Product Owner approval remain pending. CI alone does not establish design approval.

No provider/backend/auth changes, new personal-data upload, paid infrastructure or main merge.

## Web demo

`demo.html` provides six actual screen links, an embedded mobile preview, viewport selector and a new-tab link. Query parameters select existing views without injecting sample favorites or changing stored data. Product detail uses a real catalog id. Browser QA verifies all six destinations and new-tab link synchronization at four widths, plus four demo captures (44 total). Iframe preserves the selected 320/375/390/430px width, with internal horizontal scrolling on smaller devices. If all provider images fail, browser QA reports SOURCE BLOCK and checks selected-product behavior separately; that does not grant catalog image QA approval.

## 3 × 4 feed and rounded type refinement

Shared self-hosted NanumSquareRound applies to logo, all commerce surfaces and demo. Gallery checks: unique source URLs, two-slide real product, next/previous counter transitions. Initial photo feed: three columns, zero gap, up to12 live tiles, four rows fit above bottom navigation. Catalog contains50 products with multiple image URLs. Demo sample: `adpickbiz_2a757e84` (아가방 아양 우주복 + 모자 세트), two original provider images. Provider expiry can prevent photo rendering; carousel structure does not imply healthy source images. Hero proposals generated separately and await owner choice.

Independent corrective review: preserved12tile reset paths after tab/search/filter changes; gallery controls have a dedicated44px strip beneath images so garments remain unobstructed. Browser regression checks3columns/gap0/feed bottom above nav and the two-image next/previous path.

The multiple-photo demo entry resolves a real current multi-image product at runtime (`sample=multiple`) so catalog refreshes do not invalidate a fixed sample id. The reviewed immutable catalog includes the Agabang sample above.
