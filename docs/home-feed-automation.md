# KKOKKAPICK home feed automation policy

Status: Product Owner direction / implementation contract
Refs: #96, #97

## 1. Operating assumption

KKOKKAPICK must remain useful and visually complete with **zero daily merchandising operations**.

The product must not require a human operator to keep banners, campaigns, collections, or editorial curation fresh. Those surfaces may exist later, but they are optional enhancement modules, not structural dependencies.

## 2. Durable home composition

The default home experience is composed from data that already exists or can be generated automatically:

1. compact header
2. search
3. category navigation
4. personalized recommendations when signals exist
5. automatic discovery / trending module
6. product grid
7. bottom navigation

### Optional operational modules

The following are optional and collapse completely when absent:
- editorial hero/banner
- campaign / event
- manually curated collection
- brand feature

No placeholder, empty reserved space, fake campaign copy, or evergreen banner is inserted only to preserve layout.

If an optional module is absent, the next durable module moves up naturally.

## 3. Automatic personalized recommendations

V1 personalization runs without per-request ML inference.

Available signals:
- child profile stage derived from month age
- catalog stage / category / brand / size-guide metadata
- favorite product IDs
- price-alert product IDs
- optional recent-view product IDs when that repository is introduced
- optional aggregate product engagement score

Ranking principles:
- exact child-stage relevance receives a strong boost
- favorite and price-alert history forms category/brand affinity
- already-favorited or very recently viewed items are mildly down-ranked for discovery diversity
- products missing image or valid price are strongly penalized
- products with usable offer depth and verified fit metadata receive a modest quality boost
- stable product ID is used as the final tie-break so QA can reproduce ordering

If there are insufficient user signals, the module automatically falls back to discovery ranking. It never falls back to a manual curation slot.

## 4. Automatic trending / discovery

### V1 fallback

Until aggregate behavioral data is available, the feed uses deterministic catalog-quality ranking. This is an **automatic discovery fallback**, not proof of popularity.

The UI must not label the fallback as “most viewed”, “popular”, or “trending” unless a behavioral score snapshot is actually present.

Safe fallback labels include:
- 지금 만나볼 상품
- 추천 상품
- 둘러보기

### V2 behavioral trending

When aggregate events are available, rank with rolling product-level engagement scores.

Suggested event inputs:
- product_view
- favorite_add
- price_alert_create
- outbound_purchase_click

Recommended implementation:
- aggregate by product ID
- 24h and 7d windows
- recency decay
- minimum-event threshold before a product receives a popularity claim
- no child-profile fields in analytics dimensions
- no user identifier in the public aggregate score response

The client ranking contract already accepts an optional aggregate score map, so V2 must not require a visual redesign.

## 5. Diversity

Ranking quality is not only score order.

For the first visible group:
- avoid one brand monopolizing the grid
- avoid one category monopolizing the grid when other qualified categories exist
- preserve score order as much as possible while applying light diversity constraints

This rule may be implemented as a post-ranking diversity pass.

## 6. Cost and operations

V1:
- local deterministic ranking
- reuse catalog JSON / existing account snapshot
- no new always-on service
- no inference API
- no CMS dependency

V2:
- prefer scheduled or incremental aggregation in the existing backend/Supabase stack
- serve compact product-level score snapshots
- avoid ranking computation that scales linearly with every request when a precomputed snapshot is sufficient

## 7. UX fallback contract

### Personalized module
- user signals available: show personalized heading
- insufficient signals: show automatic discovery heading
- zero eligible products: omit module entirely

### Trending module
- valid behavioral snapshot: may use a popularity/trending label
- snapshot unavailable/stale/under threshold: use automatic discovery label
- zero eligible products: omit module entirely

### Promotional modules
- content present: render according to approved design
- content absent: remove the module from layout with no blank region

## 8. Privacy

- personalization should use existing local/account data and not create new sensitive analytics dimensions
- child month/height/weight are not included in behavioral trending events
- event aggregation exposes product-level scores, not per-user histories

## 9. QA contract

For fixed catalog + fixed signals + fixed engagement snapshot:
- ordering is deterministic
- no invalid-price or image-less item should outrank a complete equivalent solely because of tie ordering
- merchant-channel prefixes never become ranking/display identity
- fallback label must match the evidence source
- home must remain visually complete with every optional promotional module disabled
