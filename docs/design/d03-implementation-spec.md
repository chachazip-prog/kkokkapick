# KKOKKAPICK D03 — Implementation Design Spec

Status: Design refinement / FE handoff candidate
Source: `docs/design/d03-product-owner-direction.md`
Product Owner direction: D03 primary + D05 restraint + D01 commerce IA

## 1. Design intent

The app should read first as a credible fashion-commerce product and second as a friendly baby/kids service. Product imagery, product names and price should dominate. Brand personality comes from typography, whitespace, selective lavender accents and editorial grouping rather than decorative containers.

Target impression:
- modern, fashion-forward, trustworthy
- warm enough for baby/kids, but not toy-like
- premium through restraint rather than luxury ornament
- dense enough for shopping utility without looking like a marketplace admin screen

Do not use:
- gradient backgrounds as default page surfaces
- rounded cards around every section
- badge-heavy product cards
- decorative emoji as core navigation
- multiple competing accent colors
- oversized hero modules that hide products below the first viewport

## 2. Existing brand tokens to retain

Existing Flutter theme already defines the following foundation and remains the starting point:
- Lavender: `#7567D8`
- Lavender Deep: `#5146A6`
- Lavender Soft: `#F0EDFF`
- Ink: `#25232B`
- Muted: `#77737F`
- Neutral Surface: `#F7F6FA`
- White/Cream: `#FFFFFF`

These colors remain valid. D03 refinement changes **usage discipline**, not necessarily the raw palette.

### Usage rules

- `#5146A6`: primary active/CTA emphasis. Use sparingly.
- `#7567D8`: secondary brand accent, selected states, editorial labels.
- `#F0EDFF`: light selected/filter/fit background; never large full-screen wash.
- `#25232B`: primary text and strong iconography.
- `#77737F`: secondary metadata only.
- `#F7F6FA`: subtle section or input surface.
- white: dominant commerce surface.

Maximum accent density guideline: no more than one visually dominant lavender control/module per viewport unless the screen is a dedicated branded onboarding surface.

## 3. Typography

Font family priority remains:
1. Pretendard
2. Apple SD Gothic Neo
3. Noto Sans KR

### Scale

- Display / editorial hero: 28 / 34, weight 800, letter spacing -0.8
- Screen title: 24 / 30, weight 800, letter spacing -0.7
- Section title: 20 / 26, weight 750-800, letter spacing -0.5
- Product price primary: 17 / 22, weight 800
- Product title: 14 / 20, weight 500-600
- Brand label: 12 / 17, weight 700
- Body: 14 / 21, weight 400-500
- Secondary metadata: 12 / 17, weight 400-500
- Navigation label: 11-12 / 16, weight 600 selected / 500 default

### Rules

- Use weight and spacing before adding new font sizes.
- Product name is never visually stronger than price on catalog cards.
- Merchant name is never stronger than product brand/title.
- Editorial copy may be larger, but should not consume more than roughly 35% of the first viewport on standard mobile height.
- Dynamic text scaling must not clip CTA, prices, tabs or navigation labels.

## 4. Spacing system

Base rhythm: 4 px.

Preferred tokens:
- 4: micro icon/text gap
- 8: tight related content
- 12: card internal small gap
- 16: standard horizontal page inset and control spacing
- 20: section content gap
- 24: section vertical separation
- 32: major section separation
- 40/48: editorial breathing room only

### Page gutters

- 320 px: 14 px horizontal
- 360 px: 16 px
- 390 px: 16 px
- 430 px: 20 px

Do not solve narrow layouts by shrinking text below the typography scale. Reduce horizontal gaps or change composition first.

## 5. Radius / elevation

- Inputs/search: 12 px
- Standard buttons: 10-12 px
- Product image frame: 12-14 px
- Product card outer container: preferably no visible card shell; when needed, 12 px
- Editorial hero: 18-20 px
- Bottom sheet: 24 px top corners
- Chips/pills: fully rounded

Elevation:
- default commerce cards: 0
- bottom sheet/modal: system shadow only
- sticky navigation/header: divider or very subtle elevation
- avoid decorative drop shadows on product cards

## 6. Home / discovery composition

Order:
1. Compact brand/header row
2. Search field
3. Primary category strip or compact category grid
4. One editorial/curated module
5. Product section heading + optional sort/filter affordance
6. Product grid/list
7. Persistent bottom navigation

### Header

- Brand mark left.
- Search/favorite/cart-like secondary actions only if actually functional.
- Avoid combining logo + tagline + multiple utility rows.

### Search

- High-visibility, low-decoration neutral field.
- Full-width below header on 320-390.
- 44-48 px minimum touch height.
- Placeholder should describe product/brand search, not generic marketing copy.

### Category

D03 styling, D01 structure:
- familiar category labels
- selected state uses lavender soft + deep lavender text/icon
- no forced icon illustration if category imagery is weak
- horizontally scrollable chips are acceptable, but first useful categories should appear without requiring a precision swipe

### Editorial hero

Purpose: brand differentiation, not ad-banner decoration.
- max one hero above initial product grid
- 16:9 to ~1.45:1 visual area depending viewport
- image-led
- 1 eyebrow, 1 headline, max 2-line supporting copy, 1 CTA
- lavender may appear as CTA/accent, not full saturated background by default

## 7. Product grid

Default phone grid: 2 columns.

Recommended geometry:
- image aspect: 1:1 or 4:5; use one consistent ratio per grid
- inter-column gap: 10-12 px
- row gap: 24-28 px
- no outer card border by default

Card hierarchy:
1. Image
2. Brand
3. Product title
4. Price / discount
5. Optional fit/price-alert metadata
6. Merchant metadata only when needed

### Product title

- customer-facing cleaned title only
- 3 line max where card height permits
- merchant prefixes such as `[롯데백화점]`, `[보리보리]` must be removed
- product/brand-significant bracket content may remain
- do not append merchant name to title

### Price

- primary price always visually stronger than merchant label
- original price/discount secondary
- multiple offer range should be understandable without adding several stacked badges

### Favorite

- top-right image overlay
- 40-44 px hit target
- icon visual footprint restrained
- overlay must not cover meaningful product image content more than necessary

### Fit / alert state

Use compact text or one low-emphasis chip below price. Never show multiple competing badges on the image.

## 8. Search / filter result screen

Structure:
1. search field / search title
2. active filter summary
3. category/filter controls
4. result count + sort
5. product results

- D01 information architecture governs behavior.
- D05 spacing prevents stacked filter bars from consuming too much height.
- Active filter state must be obvious but not saturated.
- Clear-all control appears only when filters are active.

Narrow behavior:
- sort and result count may share one row
- filter chips scroll horizontally
- no horizontal page overflow

## 9. Product detail

Order:
1. Image gallery / primary image
2. Brand
3. Cleaned product title
4. Price / offer range
5. Primary actions: favorite / price alert / external purchase as applicable
6. Verified child-fit block
7. Merchant offer comparison
8. Supporting details / disclaimers

### Image

- dominate top of detail
- use full content width within safe page inset
- no oversized rounded frame with unused decorative space

### Title

- long title may wrap naturally
- do not truncate critical product identity on detail screen
- merchant name kept outside title

### Offer comparison

Each offer row:
- merchant
- price
- original price/discount if available
- clear purchase action

Lowest-price state may use one subtle accent label. Do not color every offer differently.

## 10. Child profile bottom sheet

Visual reference: D05 restraint.

- white sheet
- 24 px top radius
- clear drag affordance optional
- title + concise explanatory copy
- fields use identical height/radius/padding
- numeric keyboard where appropriate
- primary save action remains visible or reachable when keyboard opens
- safe-area inset applied at bottom
- sheet may become scrollable under short viewport / large text

Field geometry target:
- 48-52 px height
- 12 px radius
- neutral surface or 1 px neutral border
- focused state: lavender border/accent only

Do not place three narrow numeric fields in a row at 320 px if labels/units become cramped. Prefer stacked or 2+1 responsive arrangement.

## 11. Bottom navigation

Use conventional D01 structure with D03 active-state styling.

- 4 primary destinations preferred
- 64 px visual bar height plus system safe-area inset
- active: deep lavender icon/text, optional lavender-soft indicator
- inactive: ink/muted
- no custom floating decorative geometry unless it serves a functional primary action
- content bottom padding must always exceed navigation + safe-area height

## 12. Responsive contracts

### 320 px
- 14 px page gutter
- 2-column grid retained only if minimum card content width remains usable; otherwise evaluate one-column list for specific dense states
- long filters horizontally scroll
- bottom-sheet fields stack
- product card title and price never overlap

### 360 px
- baseline compact target
- 16 px gutter
- 2-column grid

### 390 px
- primary design reference width
- 16 px gutter
- use this width for visual polish decisions, then regress to 320 and expand to 430

### 430 px
- 20 px gutter
- do not simply stretch hero/card widths without spacing adjustment
- retain 2 columns unless an intentional adaptive breakpoint is justified

## 13. Accessibility

- minimum actionable target: 44 x 44 logical px where practical
- body and metadata contrast must meet WCAG AA target against actual surface
- semantic labels for icon-only actions
- large text must not hide essential CTA
- color is never the only signal for selected/discount/fit state

## 14. Implementation component inventory

Required reusable Flutter primitives:
- `KkokkapickHeader`
- `CommerceSearchField`
- `CategorySelector`
- `EditorialHero`
- `ProductGrid`
- `ProductCard`
- `PriceBlock`
- `FavoriteButton`
- `FitStatusLabel`
- `FilterChipRow`
- `ResultToolbar`
- `ProductImageGallery`
- `MerchantOfferList`
- `MerchantOfferRow`
- `ChildProfileSheet`
- `KkokkapickBottomNavigation`

These names are implementation guidance; existing components may be reused/renamed if behavior and contracts match.

## 15. Visual QA acceptance checklist

A visual candidate fails if any of the following is observed on a deployed build:
- horizontal overflow
- clipped search/filter/navigation controls
- image distortion or inconsistent aspect treatment
- excessive hero height hiding shopping content
- product title/price hierarchy broken by long names
- merchant channel text leaking into product identity
- bottom nav overlays content
- keyboard covers save action without a scroll path
- inconsistent field geometry
- unreadable muted text
- multiple decorative accents competing in one viewport
- CI is green but deployed screen differs from intended source revision

## 16. Handoff gate

Team Lead may mark this spec implementation-ready when:
- the selected D03 direction remains clearly dominant
- D05 restraint is visible in type/spacing/surface usage
- D01 commerce IA remains recognizable
- no new Product Owner decision is required
- FE can implement without inventing a new visual language

Independent QA remains the final deployed visual gate after FE implementation.