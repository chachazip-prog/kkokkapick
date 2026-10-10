# Proposal visual review — 2026-10-10

**Result: ten concrete directions are ready for Product Owner comparison. No production direction is selected.** The review covers the isolated proposal gallery, not release approval of ten separate products. The [proposal specification](design-proposals.md) records each composition, interaction, and tradeoff; [AGENTS.md](../../AGENTS.md) still requires the owner's numbered choice before production visual work.

## Data and image boundary

The checked-in commercial snapshot is expired. Its sync timestamp is `2026-10-09T00:35:14.464Z`; the original-image display ceiling ended 90 minutes later. The actual-source browser run rendered the expired/campaign-only state, with **zero supplier-image elements across all 150 compositions**. The approved local `hero-3.webp` remained campaign imagery. No source timestamp, TTL, supplier URL, raw catalog, or collection behavior was changed for this review.

Product-bearing layouts were inspected with **browser-controlled synthetic fixtures only**. `web/e2e/fixtures.ts` installs a fixed test clock and intercepts synthetic supplier-image URLs with SVGs visibly labeled `CONTROLLED UI TEST`. A persistent browser notice reads `CONTROLLED UI TEST · 실제 상품/출시 사진 검증 아님`. These fixtures are test harness data, not a shipped catalog source. Their synthetic prices, names, size evidence, sellers, and gray image rectangles verify UI geometry and state handling; they do not verify current merchandise or launch photography.

## Measured and interacted coverage

Chromium ran at browser widths **320, 375, 390, 430, and 1440 px**. Mobile product frames measured exactly 320/375/390/430 px; the desktop comparison frame measured 1130 px within the 1440 px browser. This corrects the former 352 px inset frame inside a 390 px browser.

| Check                                           |                                               Exact coverage | Result                                                                                                                                |
| ----------------------------------------------- | -----------------------------------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------- |
| Actual expired-source home/search/detail        | 10 directions × 3 surfaces × 5 widths = **150 compositions** | No supplier-image elements; correct page/frame widths; no browser page errors                                                         |
| Controlled-fixture home/search/detail           |                                         **150 compositions** | No text/control overflow beyond the frame and no page overflow; no browser page errors                                                |
| Controlled product-screen axe checks            |                        10 × 3 at 390 and 1440 = **60 scans** | Zero WCAG 2 A/AA and 2.1 AA violations reported                                                                                       |
| Gallery frame/control axe checks                |                                   **5 scans**, one per width | Zero violations reported                                                                                                              |
| Overlay opening, Escape, and opener restoration |                                        10 × 5 = **50 cases** | All closed and restored their opener                                                                                                  |
| Overlay forward/reverse Tab recheck             |                **50 cases**, after the explicit boundary fix | All passed: 1,615 forward and 1,615 reverse Tab presses, zero focus escapes, 50/50 Escape and opener restoration, zero browser errors |

The overflow check excludes intentional product/category rail scrolling and clipped campaign-image transforms. Before full-page screenshot capture caused offscreen lazy images to load, two desktop search snapshots recorded pending synthetic images. The bounded image recheck confirmed all 12 synthetic images decoded in each of those two layouts after capture; this is a loading-timing check, not a supplier-photo availability claim.

Additional exercised states: zero search results remove the stale selected card; clear empties the query and restores input focus; the shared domain filter reaches four synthetic play items without clothing size fields; two selected example children produce two individually labeled evidence rows; a 25-step mobile Tab path had no focus obscured by the bottom navigation; reduced motion computed a zero-second image transition. A supplemental CSS 200% zoom check produced no page overflow at a 720 px browser width. That zoom check does not substitute for native browser zoom, screen-reader, Safari, or physical-device testing.

## Screenshots actually opened

Screenshot generation and DOM measurement were not counted as visual inspection. Two reviewers opened rendered PNGs with `view_image`, inspected them, and made corrections from those outputs.

- **60 distinct controlled compositions:** all ten home, search, and detail compositions at both 320 and 1440 px. Home views were opened individually; search/detail views were also opened in paired comparison PNGs. The final 06/07 home crop and shelf fixes were reopened separately on desktop and phone.
- **20 controlled overlay views:** all ten patterns at both 320 and 1440 px, opened individually by the independent reviewer.
- **3 gallery control views:** 320, 430, and 1440 px opened individually.
- **4 actual expired-source views:** 01 desktop home, 01 phone detail, 06 desktop search, and 09 phone overlay opened individually.
- **2 supplemental controlled views:** the two-child evidence layout and the 200% CSS zoom layout opened individually.

The independent reviewer's exact cumulative count is **47 `view_image` opens across 43 distinct PNG paths**, including initial comparisons and explicit post-fix reopens. The five intermediate browser widths were measured and interacted with as described above; the three intermediate widths are not claimed as complete screenshot-by-screenshot visual reviews.

Current post-fix proof folder: `/tmp/kkokkapick-proposal-verified-20261010/`. Files use `controlled-{01..10}-{home|search|detail}-{320|1440}.png` and `controlled-{01..10}-overlay-{320|375|390|430|1440}.png`. Its `controlled-matrix.json` contains the 150 layout records, the initial 50 overlay records that exposed the Tab boundary, 60 axe results, and page-error list. The passing keyboard rerun is independently recorded in `focus-recheck.json`; pending-image resolution is recorded in `image-decode-recheck.json`. Paired files are named `inspect-{search|detail}-{01-02..09-10}-{width}.png`.

Other dated proof: `/tmp/kkokkapick-proposal-final-review/expired-matrix.json`, `frame.json`, actual expired-source captures, and desktop detail comparisons; `/tmp/kkokkapick-proposal-review/interactions.json` records the supplemental behaviors. Earlier aborted runs remain evidence of interrupted automation, not additional successful coverage. The final complete controlled matrix used isolated Vite port 5175 after shared dependency/CSS changes had settled.

## Corrections made from review

The phone comparison frame now uses the actual browser width. Nested composition grids and brand shelves can shrink inside their assigned columns, fixing clipped search controls and the 06 “브랜드 상품” label. The 02 campaign heading uses deliberate mobile line breaks; long comparison-row names are bounded to three lines. The 07 campaign crop preserves both children's eyes and mouths on phone and desktop.

Controls now describe implemented behavior: category filtering does not promise sorting, and all proposals can reach clothing/play through the common domain filter. Empty results no longer retain an unrelated selected product. Seller counts use unique merchant names, while distinct offers remain separate rows. Fit evidence uses understandable Korean copy, and example children are labeled individually without invented measurements or size recommendations. Each surface also sets an appropriate document title.

The initial native-dialog keyboard run found that Chromium could move focus to the document body at a complete Tab-cycle boundary. The review-only dialog now explicitly loops Tab and Shift+Tab at its first and last reachable controls. Escape and return-focus behavior remain intact. The selected production implementation still belongs to the host's maintained shadcn/Radix primitives.

Measured text contrasts on white: primary ink **16.03:1**, product muted text **5.82:1**, gallery muted text **4.75:1**, and direction accents **5.20–9.96:1**. Gallery surface controls are 40 px high; narrow-screen device controls are 36 px high, exceeding the 24 px AA minimum. Main icon and image-dot controls retain 44 px hit areas.

## Distinctness and remaining limits

The home compositions change structure and the primary task: contact sheet, editorial shelf, comparison desk, child workspace, category matrix, brand directory, dominant search, saved board, separated domains, and chapter/index. Details change the image/facts/offer hierarchy and contextual return path. The independent reviewer confirmed these are composition changes beyond color.

Some catalog screens deliberately share the same information-card grid, especially 02/05/06/08/09. Their category rail, brand masthead, saved context, domain context, and surrounding hierarchy differ. The review does not claim ten unrelated search engines or business-rule implementations.

There are no remaining review-blocking geometry issues observed in this scope. **Owner selection remains pending.** Current original-photo rendering cannot be signed off from the expired source; it needs a genuinely fresh source within the original-image deadline. After selection, the chosen visual composition must be integrated with the host's production routing, persisted child/profile, fit evidence, favorite/alert, recovery, and canonical Radix/shadcn behavior and verified as that one complete production experience.
