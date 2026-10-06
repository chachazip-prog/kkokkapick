# Supplier confirmation needed — 2026-10-06

Prepared questions only. No outbound message was sent.

Observed search fields: title, photo, price, cp_name, cp_code, cp_icon, commissionlink. Material and sale-option sizes are absent; gateway photos can expire before the internal display ceiling.

1. Can ADPICK supply a stable original product image URL, documented URL lifetime or renewal API? Does repeating search renew the photo, and what request limits apply?
2. Is a product-detail API or authorized seller feed available with composition, live sale-size options, sold-out flags and observation timestamps?
3. Which stable SKU/variant identifiers link search, photos and seller options?
4. What image hotlinking/caching/redisplay or optional image-storage rights, refresh limits, affiliate disclosure and deletion obligations apply?
5. For toys/learning products, are source age, dimensions, material and certification/warning fields available?

Acceptable next integrations require documented rights and SKU/variant provenance. Paid providers, persistent photo copies and seller crawling need separate review. Titles and brand charts must not become invented product facts or stock. Until confirmed, stable photo service and missing product facts remain launch gates.

## Public documentation check — 2026-10-06

The official [BIZ API guide](https://biz.adpick.co.kr/?ac=api&sub=guide) was available through a search index reporting crawled today; direct access returned403. It documents the current seven search fields, excludes complete stock/options/delivery/sale-state coverage and describes prices as reference values. It also documents a link API with product_img and product_price_org when linkonly=false, limited to10calls/minute and requiring a known original seller product URL. This is a follow-up candidate, not proof of stable original images or rich product facts, and was not called here.

The guide assigns content rights to sellers and does not grant storage/transformation/reuse rights itself. It does not state an approved short-cache duration. Existing24h and90min limits are internal safeguards, not rights verification. Confirm the account's applicable agreement and seller permission for metadata caching, grouping, price history, hotlink display and deletion. Bulk provision or data beyond the public APIs requires separate supplier discussion; no such inquiry was sent.
