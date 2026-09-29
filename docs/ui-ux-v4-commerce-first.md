# UI/UX v4 — commerce-first release architecture

Updated: 2026-09-29
Status: implementation decision

## Problem observed in mobile preview
The previous preview was functionally coherent but visually behaved like a settings/filter utility: explanatory cards dominated home, three full horizontal filter rows pushed products below the fold, and image fallbacks made the discovery surface feel empty. This is not the intended release experience.

## Decision
Product photography and product intent are the primary visual hierarchy. KKOKKAPICK explains itself through the shopping flow rather than through repeated explanatory cards.

### Home
1. Compact brand chrome.
2. One discovery hero with primary 상품 둘러보기 action and secondary child-profile action.
3. Category shortcuts.
4. Visual product discovery carousel.
5. KKOKKAFIT entry after products, not before them.
6. 전체 상품 grid.

Remove the two-up KKOKKAPICK/KKOKKAFIT explanation cards from the shopping path.

### Find
1. Search.
2. Stage chips.
3. Category chips.
4. Brand is one compact picker, populated only from products surviving stage/category/fit context.
5. KKOKKAFIT toggle + sort.
6. Product count and grid immediately follow.

Do not show empty brands. Avoid making filters visually stronger than products.

### Product cards
- Image receives the largest area.
- Brand/merchant is secondary metadata.
- Product name max two lines.
- Price is strong.
- Merchant count and KKOKKAFIT evidence are compact metadata, not oversized chips.
- Grid height expands under accessibility text scaling.

### Detail evidence order
Product image/name/price context -> KKOKKAFIT result -> actual product sizes when known -> verified official brand guide -> merchant offers. Never imply a brand guide is SKU inventory.

## Image state
Real provider image URL is preferred. Loading has progress feedback; missing/error has an explicit neutral fallback. A failed image must not become a broken-image icon or fabricate apparel imagery. Image proxy/cache is not introduced until provider rights are confirmed.

## Acceptance matrix
- 320/360/390/430 logical-pixel phones.
- 100% and 200% text.
- no horizontal/vertical RenderFlex overflow in core discovery widgets.
- product grid visible without traversing three brand/filter rows.
- contextual brand picker never offers a brand with zero products under current stage/category/fit constraints.
- KKOKKAFIT remains evidence-qualified.
