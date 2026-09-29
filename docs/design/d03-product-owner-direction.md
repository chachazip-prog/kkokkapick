# KKOKKAPICK — Product Owner selected design direction

Status: SELECTED / refinement gate open
Decision owner: Product Owner
Selected direction: D03 — Trendy & Refined
Reference blend: D03 primary + D05 restraint + D01 information architecture

## Decision

The visual system will be refined from D03 as the primary identity. D05 contributes typography, spacing, whitespace discipline and premium restraint. D01 contributes the most proven commerce information architecture and discoverability patterns.

Working weighting for design reviews:
- D03: ~70% — visual identity, fashion-forward tone, image treatment, branded moments
- D05: ~20% — typography, whitespace, density control, restrained chrome
- D01: ~10% — navigation, search/category structure, commerce information hierarchy

The weighting is directional, not a pixel-by-pixel composition rule. A refinement may deviate when usability, accessibility, responsive behavior or product-data constraints require it.

## Design principles

1. Product photography is the primary visual content. Decorative UI must not compete with merchandise.
2. The app must feel like a real fashion-commerce product, not an AI-generated showcase or landing page.
3. Visual hierarchy must remain clear when the catalog grows to thousands of products and many brands/providers.
4. Brand personality should come from typography, spacing, controlled accent usage and curated editorial moments rather than excessive gradients, badges or rounded containers.
5. Search, category discovery, favorites, price alerts, child-fit information and merchant comparison must remain easy to scan.
6. Do not expose merchant/channel prefixes such as `[롯데백화점]` or `[보리보리]` in customer-facing product titles. Product/brand-significant tags such as `[에뜨와]` may remain.

## Home / discovery direction

- Use D03's modern fashion-editorial hero and confident category presentation.
- Reduce decorative visual noise using D05's whitespace and restrained surfaces.
- Preserve D01's predictable top-level structure: brand/header -> search -> category/discovery -> curated/featured section -> product grid -> persistent bottom navigation.
- Avoid oversized hero treatment that pushes products below the first useful viewport.
- Above-the-fold content must establish both brand identity and immediate shopping utility.

## Product cards

- Product image remains dominant.
- Brand and product title hierarchy must be consistent across cards.
- Long product names: maximum 3 visible lines in supported card contexts; no layout breakage.
- Price is visually stronger than merchant metadata.
- Merchant/provider information is secondary and visually separated from the product identity.
- Favorites and fit/price-alert states must not obscure the product image.
- Card chrome should be minimal; avoid every product appearing inside a heavy elevated container.

## Search / category / filtering

- Follow D01's familiar commerce information structure and clear active-filter state.
- Use D03 visual styling for selected categories and editorial groupings.
- Use D05 spacing to avoid crowded chip/tool rows.
- Search and category interaction must remain usable at 320/360/390/430 widths.

## Product detail

Hierarchy target:
1. Product imagery
2. Brand + cleaned product title
3. Primary price / price range
4. Fit / child-size guidance when verified
5. Merchant/offer comparison
6. Price-alert / favorite actions
7. Supporting metadata and disclaimers

Merchant comparison must read as an offer layer, not as part of the product title.

## Child profile / bottom sheet

- White, keyboard-safe bottom sheet.
- D05-style restrained form presentation and spacing.
- Consistent field geometry and clear save action.
- Safe-area aware and robust with keyboard open.
- No clipping or bottom-navigation interference.

## Bottom navigation

- Preserve D01's conventional navigation clarity.
- Use D03's brand accent sparingly for active state.
- Respect device safe areas and provide sufficient bottom breathing room.

## Typography and spacing

- D05 is the reference for text scale hierarchy, spacing rhythm and whitespace.
- Prefer fewer text sizes with stronger weight/spacing discipline over many decorative styles.
- Dense commerce screens may tighten spacing, but must retain scanability.
- Increased text scale must not cause clipping, overlap or inaccessible actions.

## Color and surfaces

- D03 provides the primary brand mood.
- Use one controlled primary accent plus a limited semantic palette.
- Neutral surfaces should dominate catalog-heavy screens.
- Gradients are editorial accents only, not default card/background treatment.
- Avoid pastel-on-pastel combinations that reduce contrast.

## Responsive acceptance

Required widths: 320, 360, 390, 430 px.
Also validate increased text scale and keyboard-open states.

No acceptance if any of the following are present:
- horizontal overflow
- clipped text/action controls
- overlapping bottom navigation
- inaccessible keyboard-covered form actions
- product imagery distorted by container geometry
- product names pushing price/action hierarchy out of view
- merchant channel prefixes leaking into customer-facing titles

## Implementation gate

The design agent must first produce a refined D03-derived system and representative screens for review. Material Flutter visual implementation may start only from that refined selected direction, not from D01/D05/D03 independently.

Non-visual engineering remains unblocked and continues in parallel.

## Refinement deliverables

The next design package should include, at minimum:
- home/discovery
- search/category state
- product grid with short and long names
- product detail with multiple merchants
- favorites / price-alert state
- child-profile bottom sheet with keyboard-safe state
- bottom navigation / safe-area behavior
- 320 and 430 width extremes
- typography/color/spacing mini-spec for implementation handoff

Team Lead gate: design coherence + production feasibility.
Independent QA gate after implementation: responsive, accessibility, overflow/clipping, real deployed visual review.