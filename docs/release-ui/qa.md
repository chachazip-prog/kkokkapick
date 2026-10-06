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
