# Release UI rebuild audit — 2026-10-04

Base: main before `codex/release-ui-rebuild`. Inspected repository, CSS/DOM, catalog, navigation/controller, existing workflows and 5 browser screenshots at 390px **before implementing**.

## Why the rejected UI looked like an automated prototype

- Inline CSS: 45,770 bytes, 620 rule openings, 445 `!important` declarations. `.home-cat-icon` repeated 13 times, `.home-categories` 10, `.hero` 9, `.sheet .panel` 8. These counts come from a textual selector audit (media variants counted).
- Successive reference, mockup-lock, device-QA, D03 and soft-editorial layers competed for the same styles. Rules switched fonts, gradients, radius, heading size, and detail-action positioning without removing the preceding implementation.
- Gradient hero, pale category blocks, profile containers and large empty state repeatedly emphasized component silhouettes. Even later list-style overrides retained obsolete pastel component styles in the source.
- Main headings and prices used 800–900 weights; OS-dependent display fonts competed with Korean text fonts. Raw SKU/color/merchant noise remained in the detail title.
- Search navigation set `catalogSection.hidden = isMy || next === 'search'`; results needed a subsequent category/search event to become visible. Hidden stages/categories made filter capability hard to discover.
- Detail actions were alternately sticky, fixed, and relative. The detail container, rather than the product information, drove composition. My menu entries looked interactive but had no handlers; false order counts suggested connected order data.
- Home product discovery began too late; empty wishlist left a large central gap. Account decoration received more space than shopping information.

## Browser and data evidence

Original screenshots: Home, Search, Detail, Wishlist, My. Images initially failed in the browser without the execution environment proxy; command-line HTTP probes returned 404 for 13 catalog samples. With the proxy, real browser requests did render some original provider-hosted photos. Consequently neither URL presence nor command-line status is sufficient to certify image health. Image reliability remains a separate release blocker, acknowledged by the Product Owner (fresh catalog path deferred).

667 actual catalog products were retained. No dummy products, substitute product photos, synthetic SKU descriptions, fabricated discounts or seller prices were introduced. Original names remain accessible in detail and unchanged in source data.

## Scope and approval

The initial Master Task authorized structural implementation after audit. The follow-up explicitly selected the attached five-screen pink/lavender reference (R01), replacing the first editorial interpretation, and added photo-only discovery plus material/size rows. The selected attachment is the final visual contract; the user's direct selection supersedes the repository's older ten-proposal workflow. No main merge or auto-merge; Product Owner iPhone review and final approval remain mandatory.
