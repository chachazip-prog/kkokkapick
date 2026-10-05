# Product coverage and image reliability

## Source and scope

Use the authorized ADPICK BIZ search response for infant/kids apparel. Keep raw facts and seller provenance. Do not derive material composition, sold sizes or stock from product titles or age/category labels. The observed search response exposes seven fields: title, photo, price, cp_name, cp_code, cp_icon, commissionlink. Material and available-size values remain unavailable.

Discovery now includes79 distinct queries (limit20,6.5s pacing). Six diversity searches cover sleep vests, swimwear, rashguards, hanbok, toddler clothes and rompers. Six earlier searches were restored after their baseline contributed21 unique offers. Hourly polling frequency is unchanged. These are observed search results, not the provider's total inventory; the complete accessible inventory and pagination contract remain unestablished.

## Integrity rules

- Filter laundry/craft equipment, adult garments and pet clothing; retain animal/car motifs and celebration garments for children.
- Recognize mixed letter/digit SKU candidates, never color words such as WHITE. Different genuine SKU codes remain separate. Product images, seller comparison and prices must refer to the same identity.
- Catalog groupingVersion2 establishes a fresh price baseline and clears ambiguous legacy demo price events. Saved favorites and target prices are retained; new verified price events resume from this baseline.
- Keep legitimate seller offers for comparison, but publish a canonical product only when at least one original photo is available. Do not fill missing photos with a fake product image.

## Live image evidence and handling

On2026-10-04, images collected at12:33UTC failed with404 at22:14UTC (0/820). A22:38UTC diagnostic returned15/15 fresh images, while0/3 older catalog images worked; the fresh public URLs also loaded from a separate network. This confirms a freshness problem without establishing the provider's exact URL lifetime.

A subsequent review handoff found589/644 URLs healthy and55 HTTP400 responses. Repeated external checks recovered those sample URLs (one400→200, two200→200). Therefore the shared checker retries transient400/408/429/5xx/network failures at most twice.404 is never retried by the server checker. Retry-After is honored; a requested delay above5s stops that image probe. Collection concurrency is5. Browser image errors, which do not expose status, get at most two retries of the original URL before genuine alternate photos of that same product; disconnected nodes are ignored.

Before publication, a complete initial image audit may exclude at most5% unavailable original photo URLs once; a broad outage or incomplete audit aborts. Seller prices and other facts remain intact, and canonical products require a healthy original photo. There is no repeated pruning loop. Publication then independently checks all remaining unique original catalog image URLs, including gallery photos, with a100% success gate. This is enforced before the review handoff and before the prepared production publication step. A failed gate leaves the prior snapshot unchanged. CI success is not proof of successful collection: the diagnostic job uses continue-on-error; the catalog artifact and actual health evidence are required.

## Freshness and operation

24h is the existing internal metadata-retention ceiling, not an image-validity guarantee. Temporary ADPICK gateway photos use an additional90min display ceiling anchored to the source observation, allowing the existing hourly sync plus a bounded20min job and10min margin. This is an internal safety ceiling, not a provider contractual lifetime. Invalid timestamps and clock skew exceeding5min fail closed.

Visible browsers reload catalog metadata every5min and on return online/visible, preserving filters, selected child, browsing depth and current view. Provider keys stay server-side. Product/price JSON bypasses offline service-worker storage; the app shell remains cached. No permanent copy of provider photos, new hosting, paid API, child-data upload or main merge is introduced.

The review branch currently receives manual validated handoffs. It is not an automatically refreshed production source; a single review snapshot becomes unavailable after the90min display window. Production hourly code is prepared in the PR and must not be deployed by merging main before Product Owner approval. Continuous operational image availability and provider caching/redisplay rights remain launch gates. A successful point-in-time image check cannot guarantee future upstream availability.
