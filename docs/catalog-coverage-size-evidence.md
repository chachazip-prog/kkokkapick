# Catalog coverage and size evidence

## Coverage strategy

ADPICK BIZ search is the primary zero-cost discovery input for the current beta. The search endpoint is bounded per query, so coverage is expanded with a curated query matrix rather than assuming one broad query represents the provider catalog.

The query plan covers lifecycle terms, apparel categories, and known baby/kids brands. Results are deduplicated and then filtered by the existing apparel/reject rules. Search pacing remains conservative until the production account quota is verified.

Coverage is measured after every sync using source count, canonical product count, recognized-brand rate, and category distribution. More queries are not considered an improvement if off-topic rate increases.

## Size evidence hierarchy

1. `availableSizes`: product-specific sizes only when a provider or an approved product source explicitly supplies them.
2. `sizeGuide`: verified first-party brand guide. It is labeled as a brand guide, not as product availability.
3. Neither available: the client tells the user to confirm selectable size and stock at the merchant.

Never infer product availability from a brand chart or from age/height heuristics. Kkokkafit may use verified brand evidence for guidance, but the merchant remains authoritative for actual selectable options and stock.

## Production model

`product_sizes` stores explicit product-size labels. `brand_size_guides` stores verified first-party brand rows and provenance. The public catalog RPC exposes only these safe derived fields; base tables remain unavailable to anonymous clients.

Provider rights and first-party brand-source provenance remain release gates before bulk production retention.
