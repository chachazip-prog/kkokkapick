# Independent workbench visual review

Reviewed on 2026-10-10. **PASS for the existing technical workbench** within the
controlled conditions below. No material production visual direction is approved
by this review. Product Owner selection from the ten proposals remains pending.
Actual supplier release-photo QA remains **HOLD** because the checked-in supplier
publication is expired.

## Inspected evidence

Opened every listed image with `view_image` at original detail: **25 viewport
screenshots**, comprising Home, Search, Product Detail, Wishlist and My at
320, 375, 390, 430 and 1440 pixels wide. This is 20 mobile frames plus five desktop
frames. The mobile frames are 844 pixels high; the desktop frames are 1000 pixels
high. These are the root browser run's saved viewport frames, not merely test
assertion results.

All catalog goods and gallery images in these frames are **controlled test
fixtures**. Their conspicuous `CONTROLLED UI TEST` labeling is part of the test
evidence. The fixture clock is `2026-10-10T05:01:00Z`. The static home hero is an
existing local asset. No provider-photo availability, current price/stock, or
supplier rights status can be inferred from these fixture frames.

## Findings

- No horizontal page clipping or overlapping toolbar controls was visible in
  the inspected frames. Search, filter, mode and sort controls retain readable
  labels at 320 pixels. The four-item navigation stays within the viewport.
- Home's hero and two-line heading remain readable. The tighter 320-pixel and
  desktop hero crops keep both children recognizable. The 320-pixel crop trims
  the older child's right edge; the desktop crop trims upper hair and lower
  body. The large mobile hero puts catalog cards
  below the initial fold. These are baseline workbench presentation observations,
  not an approved production hierarchy.
- Search uses two columns on mobile and six on desktop. Card prices and seller
  counts remain distinguishable. Wishlist source titles wrap rather than being
  cut horizontally. The deliberately extreme fixture title produces a tall,
  uneven row and continues below the mobile fold.
- Product Detail fits the viewport, retains its visible close action, and keeps
  the purchase/favorite bar readable at every width. Lower fit, seller, facts and
  target-price content requires modal scrolling. Initial partial visibility of
  those lower sections is scroll positioning, not lost content.
- The returned wishlist opener has a visible blue focus outline. The focused
  gallery rail has a visible bottom-edge outline; its outer clipped gallery
  container limits the rest of that outline. This is a nonblocking workbench
  polish observation, not a claim that every focus state was visually verified.
  Separate controlled browser checks establish opener restoration and modal
  focus containment.
- My keeps child registration, shopping counts, saved-item links and privacy
  disclosure readable. The sparse desktop utility page and empty saved-history
  sections are faithful to the test state.

## Independent live scroll check

A separate Chromium session checked the two boundary mobile sizes using the
same synthetic source, without changing source files or collecting products.

| Width | Long title after normal manual scroll | Fixed navigation top | Focused target-price bottom | Sticky action-bar top |
| --- | --- | --- | --- | --- |
| 320 | 735.5px | 776px | 672.6px | 735.2px |
| 430 | 726.5px | 776px | 691.8px | 735.0px |

The long title's price and complete card button become visible above navigation
after ordinary scrolling. Focusing the target-price input scrolls it entirely
above the sticky purchase bar. The input remained the active focused element at
both widths.
A native focus or generic scroll-into-view call can leave the bottom of the
extreme long-title button under navigation initially; its content remains
reachable with normal scrolling. No inaccessible control was demonstrated.
Exact measured output is in
[`workbench-scroll-evidence.json`](workbench-scroll-evidence.json).

## Independent source-boundary re-review

The read-only domain reviewer reran:

```sh
cd web && npm test -- src/domain/__tests__/malformed-source.test.ts src/domain/__tests__/catalog-source.test.ts
```

**15/15 passed:** seven malformed-source tests and eight catalog-source tests.
Malformed provenance is now rejected; malformed price or direction events are
discarded individually while healthy observed history survives. Independent
local reproductions also confirmed mixed history survives `loadCatalog()`.

Static review confirmed the original 90-minute internal photo ceiling, 24-hour
metadata TTL, five-minute JSON refresh, published source URLs, `no-store`
requests and ten-second request timeout are unchanged. Source timestamps are
preserved. No new source collection, data edit, upload, authentication scope or
recurring cost was introduced.

Root integration owns its full 108-unit/10-browser result and final code SHA.
This independent review directly inspected the frames, performed the bounded
scroll check, and reran the targeted source guards; it does not relabel those
activities as fresh supplier QA or production design approval.

## Exact screenshot paths inspected

- `web/test-results/commerce-controlled-five-s-b6473-cessibility-checks-at-320px/320-home-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-b6473-cessibility-checks-at-320px/320-search-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-b6473-cessibility-checks-at-320px/320-detail-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-b6473-cessibility-checks-at-320px/320-wishlist-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-b6473-cessibility-checks-at-320px/320-my-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-e246e-cessibility-checks-at-375px/375-home-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-e246e-cessibility-checks-at-375px/375-search-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-e246e-cessibility-checks-at-375px/375-detail-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-e246e-cessibility-checks-at-375px/375-wishlist-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-e246e-cessibility-checks-at-375px/375-my-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-02f4d-cessibility-checks-at-390px/390-home-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-02f4d-cessibility-checks-at-390px/390-search-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-02f4d-cessibility-checks-at-390px/390-detail-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-02f4d-cessibility-checks-at-390px/390-wishlist-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-02f4d-cessibility-checks-at-390px/390-my-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-cf2a3-cessibility-checks-at-430px/430-home-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-cf2a3-cessibility-checks-at-430px/430-search-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-cf2a3-cessibility-checks-at-430px/430-detail-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-cf2a3-cessibility-checks-at-430px/430-wishlist-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-cf2a3-cessibility-checks-at-430px/430-my-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-fdb14-essibility-checks-at-1440px/1440-home-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-fdb14-essibility-checks-at-1440px/1440-search-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-fdb14-essibility-checks-at-1440px/1440-detail-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-fdb14-essibility-checks-at-1440px/1440-wishlist-controlled-viewport.png`
- `web/test-results/commerce-controlled-five-s-fdb14-essibility-checks-at-1440px/1440-my-controlled-viewport.png`
