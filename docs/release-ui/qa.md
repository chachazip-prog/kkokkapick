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
