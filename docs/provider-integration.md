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
