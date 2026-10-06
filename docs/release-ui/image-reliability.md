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

24h is the existing internal metadata-retention ceiling, not an image-validity guarantee. Temporary ADPICK gateway photos use an additional90min display ceiling anchored to the source observation, The review/production jobs now have30min limits after a real20min timeout at query78. Hourly cadence plus the maximum job duration leaves no delay margin, so this ceiling does not guarantee continuous display availability. This is an internal safety ceiling, not a provider contractual lifetime. Invalid timestamps and clock skew exceeding5min fail closed.

Visible browsers reload catalog metadata every5min and on return online/visible, preserving filters, selected child, browsing depth and current view. Provider keys stay server-side. Product/price JSON bypasses offline service-worker storage; the app shell remains cached. No permanent copy of provider photos, new hosting, paid API, child-data upload or main merge is introduced.

The review branch currently receives manual validated handoffs. It is not an automatically refreshed production source; a single review snapshot becomes unavailable after the90min display window. Production hourly code is prepared in the PR and must not be deployed by merging main before Product Owner approval. Continuous operational image availability and provider caching/redisplay rights remain launch gates. A successful point-in-time image check cannot guarantee future upstream availability.

## Immediate manual review publication — 2026-10-05

A successful collection can still become unusable while waiting for a separate handoff: run37272448123 collected975 healthy offers at06:42UTC, but the07:39UTC handoff hit the >5% photo-outage guard and correctly published nothing. No expiry was extended and no placeholders were counted as healthy.

Manual full collection on the review branch now passes the exact same-run upload artifact ID to a dependent publication job. It audits all photos and independently repeats the100% photo gate before the existing repository/branch/event/freshness/coverage validations and nonforce review-only data commit. Empty/missing artifacts never publish. Diagnostic-only and explicit historical-artifact handoffs remain separate. Writes are scoped to the publication job; no new schedule, supplier queries, infrastructure or main write. Ops/Security independently reviewed PASS. A branch advance causes a safe push failure; do not force or silently rebase. This reduces handoff delay and does not establish continuous preview availability.

## Bounded transport recovery and visible expiry

The immediate publication run37279374457 collected924 offers (922 initially healthy photos), then its independent gate accepted919/920 photos and rejected one400 response after three attempts. The same original URL later returned200 image/jpeg in a separate direct check. This remains a failed publication, not a green release gate.

The opt-in final gate now permits one additional full audit of the unchanged URL set only when at most1% fail with designated transient statuses. It waits15s; every400 URL must recover in a single confirmation request before the full recheck. It excludes404,429,retry_later, broad failures and incomplete/duplicate audits. No new pruning or URL substitution occurs between rounds. Both results are recorded; the final threshold remains100%. Evidence artifacts retain one day. Source/Data and Ops/Security independently reviewed PASS. A source artifact from a failed publication run is usable only after actual Jobs API evidence proves its own diagnostic collection completed successfully; repository/workflow/event/branch/freshness/data/image guards remain in force.

Open product sheets now obey the earliest metadata/image expiry deadline through a local timer, without increasing network refresh frequency. Expiry clears product/price displays and closes product sheets, restores navigation focus after removed triggers, and preserves child/filter forms and local favorite/target records. Missing current product information is distinguished from missing saved records.

## Bottleneck mitigation — 2026-10-06

Planner and Source/Data agree that search-only data cannot supply missing composition/live seller sizes or guarantee future photo availability. Preserve each healthy original photo's source observation and verification timestamp through collection/grouping. Verification does not renew observation, TTL or the 90-minute internal display ceiling. Diagnostics measure collection duration, source age at verification, time remaining to the internal ceiling and missing attribute coverage. Missing legacy verification metadata stays unknown.

The client preserves conflicting composition and seller-specific sizes with field provenance and actual checkedAt. Product information links directly to each original seller affiliate destination and labels absent facts as not supplied. Official size charts remain separate from sale inventory. No new provider, crawling, paid infrastructure, persistent photo copies, polling cadence or main write is introduced. Runtime photo recovery and fresh-source browser QA remain pending; this is not continuous-availability approval.
