# KKOKKAPICK v9 approved home design contract

Status: Product Owner approved

## Visual reference lock
Preserve the approved home reference structure and mood:
- compact brand header with secondary utility icons
- prominent but restrained search field
- evergreen editorial hero banner
- icon-based category shortcuts
- personalized/editorial recommendation strip
- trending product grid
- secondary editorial/curation strip
- four-tab bottom navigation

The home must feel like a polished kids-fashion commerce discovery service, not a search results page and not a generic AI dashboard.

## Home vs Search role split
### Home
Discovery-first. Service identity, recommendation, trend discovery, category entry, price-drop discovery, and brand value communication.

### Search
Intent-first. Query, filters, sort, category/brand refinement, and dense product results.

Do not duplicate the same first-screen hierarchy across Home and Search.

## Category interaction
Home category shortcuts open a category-focused fullscreen modal/page with its own header/back affordance, sort/filter controls, and product list. Do not switch the bottom navigation state to Search solely because a category was tapped.

## Hero banner
The hero is evergreen product branding, not an operator-managed promotional campaign slot. It must require no ongoing merchandising operations.

Primary value themes:
1. 여러 판매처를 한 번에 비교
2. 같은 상품의 최저가 확인
3. 사이즈와 소재를 더 쉽게 파악
4. 가격이 내려가면 자동 알림

The banner may rotate between a small fixed set of evergreen messages, but no recurring manual content dependency is allowed.

## Product card v2
Each canonical product appears once regardless of merchant count.

Required hierarchy:
- swipeable image gallery when multiple images are available
- favorite control
- brand
- product name, up to 3 lines
- `최저가` price label when multiple offers exist or the value represents the minimum aggregated offer price
- merchant count when greater than one
- compact evidence-backed spec chips/rows: size range, material, season/thickness, color count where known
- review rating/count only when source-permitted metadata exists
- price-drop alert toggle, not target-price input

Unknown data is omitted. Never synthesize product specs, review numbers, or trend claims.

## Canonical commerce rule
One canonical product can have many offers. The card represents the canonical product; the detail surface represents offer comparison.

The lowest price displayed on the card must be computed from currently valid offers and must not imply shipping-inclusive pricing unless the underlying source contract supports that claim.

## Multi-image behavior
- first image loads eagerly
- secondary images lazy-load
- horizontal swipe must not break vertical page scrolling
- use a lightweight page indicator only when image count > 1
- image failures fall back gracefully without changing card geometry

## Reviews
V1 exposes only rights-safe review metadata: source, rating, count, deep link, and freshness where available. Do not ingest or reproduce review bodies without explicit provider rights.

## Price-drop alert
Primary user action: `가격 내려가면 알림` toggle.

Notification semantics:
- compare current canonical lowest price with the previously observed canonical lowest price
- notify on a genuine decrease
- deduplicate repeated notifications for the same observed price state
- preserve guest-first local preference and account sync rules

## Responsive acceptance
Must pass 320 / 360 / 390 / 430 widths and 200% text where applicable, including:
- no clipping/overflow
- no bottom navigation collision
- no horizontal page scroll caused by card metadata
- category fullscreen modal safe-area correctness
- image swipe and vertical scroll coexistence

## Product Owner gate
This visual reference is already selected. Do not request multiple alternative home designs again unless the Product Owner explicitly reopens the design direction.
