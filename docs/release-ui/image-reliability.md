# Product coverage and image reliability

## Source and scope

Use the authorized ADPICK BIZ search response for infant/kids apparel. Keep raw facts and seller provenance. Do not derive material composition, sold sizes or stock from product titles or age/category labels. The observed search response exposes seven fields: title, photo, price, cp_name, cp_code, cp_icon, commissionlink. Material and available-size values remain unavailable.

Discovery includes 79 distinct apparel queries plus 6 toy/learning queries (limit 20, 6.5s pacing). Six diversity searches cover sleep vests, swimwear, rashguards, hanbok, toddler clothes and rompers. Six earlier searches were restored after their baseline contributed21 unique offers. Hourly polling frequency is unchanged. These are observed search results, not the provider's total inventory; the complete accessible inventory and pagination contract remain unestablished.

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


## Implemented browser recovery and product-fact handling — 2026-10-06

Recovery now belongs to a shared original-URL state for the current catalog snapshot. Multiple cards and sheets share the same bounded two retry probes. If the original still fails, it is excluded from every browsing surface for that snapshot; another original photo of the same product is used when available. Re-rendering, changing filters and a refresh of the same snapshot do not start repeated recovery probes. Only a valid newer source timestamp clears exclusions. An older snapshot is ignored, and asynchronous results from an earlier snapshot cannot exclude newer photos.

Gallery updates preserve the active remaining photo, rebuild the position dots and synchronize photo-count badges on all cards. A single remaining photo has no dots/count badge. When all original photos fail, the product leaves discovery and its open detail/photo sheet closes safely. Local favorites, recent records and saved target prices remain; an unsaved target-price draft and child information being edited remain in memory. Empty saved views distinguish retained records from an empty collection. Offline errors show a connection message and do not exclude the photo as a source failure.

The source observation and successful image-check timestamps are retained separately with each original URL. A later photo check does not renew source observation or the display ceiling. The availability report counts only successful, retained-URL evidence with valid timestamps in order; invalid/future source times produce an unknown remaining duration. This diagnostic is point-in-time evidence, never a claim of current or continuous availability.

Missing material and actual sold-size options are labelled as information not supplied. If documented facts arrive, each seller's original material/options and observation metadata are retained and presented, with conflicts disclosed and an original seller link. A brand size chart is separate from current sale options. Combined seller, size and price filters must match the same seller offer, and the browsing price uses that matching offer rather than a cheaper nonmatching seller. Raw titles and offer facts are preserved.

## Verification and remaining gates

On 2026-10-06, all 61 configured automated checks passed locally. Independent Source/Data and QA reviews passed the production contracts. Chromium fault-injection checks passed at 320, 375, 390 and 430px for URL recovery, same-snapshot exclusion, gallery dots and badges, retained local records/input drafts, newer snapshots and offline return.

Run the fault checks from the repository root with Playwright installed:

```sh
node scripts/release-ui-image-recovery-qa.cjs
```

The script uses synthetic image responses and observation times only in its isolated browser fixture. It does not publish them. These checks establish error-handling behavior, not live supplier availability or the required real-product visual QA.

The last successful validated source publication was run 37287666875 on 2026-10-05; that review snapshot is now beyond its temporary display ceiling. Earlier real-product screenshots and successful CI are not current image/launch evidence. A new same-run source publication, full actual-photo decoding audit and real-product screenshots with independent visual review are required for a new review-candidate readiness claim.

Stable original URLs or a documented renewal contract and authorized product-detail/option feeds remain supplier-dependent launch gates. No permanent photo copies, new crawling, paid supplier, increased API cadence, child-data upload, main merge or production deployment were introduced. Prepared supplier questions are in [provider-clarification.md](provider-clarification.md); no message was sent to a supplier.


## Actual decoding and four-width QA after fresh publication

The 2026-10-06 publication run37464354073 preserved1,165 original offers and1,056 canonical products (971 apparel,49 toy,36 learning) with1,153 original photo URLs. Its server publication gate passed. A separate first-pass Chromium audit decoded1,131/1,153 photos and recorded22 HTTP400 failures. The mobile run stopped at320px before the remaining widths. These results are incomplete release QA;18 independently inspected320px captures do not establish four-width acceptance.

A read-only dependent job now checks the exact freshly published review commit. It runs synthetic failure-recovery regression separately, then decodes every unchanged original photo URL and captures actual products at320/375/390/430px. Actual decoding uses five concurrent workers and a10s attempt ceiling. Only HTTP400 is retried, at most twice with350/900ms delays;404 and unknown transport failures stop. Each attempt has a separate browser page and request identity. First-pass failures, bounded recoveries, final failures, natural dimensions and source hashes are preserved. A final failure blocks real-photo acceptance. No provider URL, source clock, catalog item or expiry is replaced to pass QA; supplier photos are not stored.

Screen metrics wait for all rendered failed/retrying images to settle and all visible images to load. Wait timeouts fail explicitly. Sorting and price-filter assertions compare the visible price with the lowest matching original seller offer. Both the actual-photo report and screenshots remain one-day artifacts. Generating screenshots does not satisfy independent visual review.
