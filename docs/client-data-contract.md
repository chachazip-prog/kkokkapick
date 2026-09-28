# Client data contract

The web demo and future Flutter client should consume the same normalized product semantics.

## Product
Required client-facing fields:
- id: stable canonical product identifier
- name
- brand: canonical brand or null
- category
- stage
- imageUrl
- fitStatus: verified | candidate | unverified
- fitSource when verified
- minPrice
- offerCount
- offers[]

## Offer
- merchant
- price
- affiliateUrl
- provider
- updatedAt/source freshness when available

## Fit
Clients must call the shared KKOKKAFIT rules conceptually:
1. require child months, height, weight
2. recommend only when the canonical brand has a verified chart
3. never use a numeric token in a product title as recommendation evidence
4. present recommendation as "<size> 우선 확인"
5. require final seller option/detail confirmation

## Price state
- price-history events are changes between observations, not a guaranteed historical ledger.
- target-price state belongs to the user; the current web demo stores it locally.
- production notifications require authenticated server-side alerts.
- provider retention policy takes precedence over product feature requirements.

## Search / sort
Initial server/client semantics:
- search: name + canonical brand + merchant + category
- filters: stage, category, brand, fit availability, favorites
- toddler filter intentionally overlaps 유아/키즈 until catalog evidence becomes more granular
- recommendation sort is deterministic, not an AI ranking claim
- price-drop sort uses observed price-change events only
