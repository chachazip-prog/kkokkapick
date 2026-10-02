# Provider integration

## First provider: ADPICK BIZ

The app uses ADPICK on the server side only. The API key must never be embedded in the PWA/Flutter client.

### Discovery strategy
- User searches: live search with short cache.
- Catalog seed: curated baby/kids clothing keyword rotation.
- Hot queries/products: refresh more often.
- Cold results: expire instead of repeatedly polling.
- Search endpoint limits are respected by the sync worker.

### Data policy
The adapter currently marks ADPICK as `ttl_cache` conservatively. Before production launch, confirm the exact permitted retention, transformation, and redisplay period for product fields with ADPICK and adjust `cacheTtlMinutes`.

### Required secret
Create an ADPICK BIZ API key and set `ADPICK_API_KEY` in the server environment. Do not commit the key.


### Product image freshness

ADPICK BIZ `/search` documents `photo` as the product-image field. Kkokkapick consumes that field directly and does not synthesize the CloudFront image URL.

Operational evidence on 2026-10-02 showed that a catalog synced at 07:07 KST had sampled image URLs returning HTTP 404 by 11:53, while a fresh API diagnostic at 12:24 returned 15/15 image responses as HTTP 200 `image/jpeg` from the same CloudFront host. This is an observed expiry/freshness characteristic, not a claim about an ADPICK contractual TTL.

Additional overnight evidence on 2026-10-02 showed that at roughly 86–90 minutes after publication, deterministic health samples ranged from 39/40 healthy (97.5%) to 0/40 healthy (all HTTP 404). The expiry boundary is therefore variable enough that a two-hour cadence does not maintain continuous image availability.

Repository policy:
- refresh the ADPICK BIZ discovery catalog every hour;
- validate returned HTTPS image URLs with a browser-like HTTP/MIME probe before publication;
- run catalog image health immediately after each catalog publish and again around the middle of the hourly freshness window;
- require at least 80% live-image health before publishing a newly generated catalog;
- fail closed per product by omitting an image URL that does not return a successful `image/*` response;
- retain UI image fallback for transient delivery failures;
- do not scrape merchant pages, copy provider images, or introduce a proxy/cache beyond verified provider rights.
