# Product Owner review candidate — 2026-10-04

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

Provider image reliability remains blocked (up to four image failures in the reviewed capture set). Owner authorized continuing UI work and will find a current catalog source later. Some material/size fields are absent; show seller-verification guidance, never invented product facts. Existing hero source is low resolution. Actual iPhone Safari/safe-area review and Product Owner approval remain pending. CI alone does not establish design approval.

No provider/backend/auth changes, new personal-data upload, paid infrastructure or main merge.

## Web demo

`demo.html` provides six actual screen links, an embedded mobile preview, viewport selector and a new-tab link. Query parameters select existing views without injecting sample favorites or changing stored data. Product detail uses a real catalog id. Browser QA verifies all six destinations and new-tab link synchronization at four widths, plus four demo captures (44 total). Iframe preserves the selected 320/375/390/430px width, with internal horizontal scrolling on smaller devices. If all provider images fail, browser QA reports SOURCE BLOCK and checks selected-product behavior separately; that does not grant catalog image QA approval.
