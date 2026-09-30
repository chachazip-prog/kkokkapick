# KKOKKAPICK visual rebuild acceptance

Status: BLOCKING visual QA

The 2026-09-30 device review invalidates the previous visual PASS. Do not promote the current v9 preview as a release candidate.

## Product Owner device findings — all required
1. Home must not duplicate the Search tab with another full search surface. Search intent belongs to Search; Home is discovery/editorial-first.
2. Category labels must render fully; no fade/truncation for ordinary category names at 320/360/390/430 widths.
3. Replace the generic lavender icon mark with the approved-reference wordmark treatment: bold black `꼬까픽` with a small warm/pink accent. Header presence must match the approved visual reference.
4. Product cards need a visible image/card boundary on white imagery (subtle neutral stroke/surface/shadow); card geometry must remain calm and editorial.
5. Multi-image gallery must be testable with real evidence. Canonical aggregation must collect multiple distinct HTTPS images when source offers provide them; cards/details show swipe affordance only when >1 image exists.
6. Merchant/channel prefixes such as `[현대백화점]`, `[롯데백화점]`, `[보리보리]` must never appear in canonical display titles. Preserve actual brand/style brackets such as `[에뜨와]`.
7. Recommendation section typography/hierarchy must match the approved editorial reference and must not awkwardly wrap the heading on common phone widths.
8. Product detail must expose useful product information before/with offer comparison: gallery, brand/name, lowest price, merchant count, size range, material/composition, season/thickness/color where evidence exists, review metadata where rights-safe, and price-down alert.
9. Home must provide an Instagram/feed-like continuous discovery surface: horizontally swipeable editorial/recommendation rail(s) plus a vertically scrollable product feed/grid so users can keep browsing without being bounced into Search.
10. Stop generic AI-dashboard/card styling. Layout, rhythm, typography, imagery, section hierarchy, header and editorial modules must follow the Product Owner-approved reference, not just reuse existing components with new copy.

## Release gate
- Design Agent review against the approved reference image.
- FE implementation review against all 10 items.
- Independent QA at 320/360/390/430 widths and iOS Safari.
- QA must explicitly verify channel-title cleaning and at least one real multi-image canonical item when source evidence exists.
- Only after deployed Pages visual QA passes may the preview be shared back as a replacement candidate.
