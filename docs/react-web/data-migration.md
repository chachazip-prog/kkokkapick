# React web domain migration

This migration is design independent. `web/src/domain/index.ts` exports typed,
reusable product, catalog, fit, photo, search, and local persistence contracts.
The existing published JSON, provider collection, rights policy, and catalog
generation are unchanged. No new provider query, scheduler, storage service,
authentication scope, or recurring cost is introduced.

## Contracts and source parity

| React module | Existing authority | Preserved behavior |
| --- | --- | --- |
| `catalog-source.ts` | `src/catalog-source.js`, catalog section of `src/release-ui.js` | Published catalog/history JSON only; `cache: no-store`; 10-second request timeout; eligible preview grouping version 2; freshest nonexpired source and matching history; expiry blocks product display. |
| `client-product.ts` | `src/client-product.js`, `displayName` in `src/release-ui.js` | Source ID/name and seller provenance preserved; display cleanup derives a separate label; invalid prices become unknown; linked offers define normalized price bounds; candidate/unknown facts remain distinguishable. |
| `product-domain.ts` | `src/product-domain.js`, discovery helpers in `src/release-ui.js` | Per-length fabric and nonapparel floor covering exclusions; explicit age evidence and provenance; broad web stages and category fallback. |
| `fit.ts` | `src/brand-size-charts.js`, web `evaluateFit` | Exact existing 아가방/에뜨와 rows, first-party markers, and verification dates; same height/weight/month scoring; child month 0 accepted by the web; no toy/learning apparel recommendation. |
| `search.ts` | Search/filter/ranking in `src/release-ui.js` | Every query token must match; toddler overlaps 유아/키즈; seller, size, and price must all match one offer; selected offer supplies the browse price; recommendation order is deterministic. |
| `price.ts` | `src/price-tracker.js`, web price helpers | Latest valid observed event wins, including equal timestamp order; unknown price is never a target-price success; price-drop ordering uses observed changes only. |
| `image-availability.ts` | `src/product-image-availability.js` | HTTPS source URLs only, deduplicated; shared 350/900ms recovery delays; decode probe timeout 5 seconds; offline failures do not quarantine URLs; newer valid observation resets transient failures. |
| `child-profiles.ts` | `src/child-profiles.js` | Multiple children, selected context, range validation, legacy measurements, commit-before-memory writes, deletion, and secondary compatibility mirrors. |
| `local-storage.ts` | Persistence helpers in `src/release-ui.js` | Existing favorite, target-price, and recent ID keys; storage access resolved lazily; safe malformed/denied reads; mutation success reflects durable primary write. |

The new modules accept unknown input at published JSON boundaries and discard
malformed event/guide/age structures instead of treating them as evidence.
Source rows are never modified in place. Normalized product and offer models
retain extra published fields, including checked/verified timestamps and fact
provenance, but UI code must use the typed evidence fields when making claims.

The standalone older `src/kkokkafit-engine.js` rejects month 0; the released web
controller accepts month 0 and separately excludes nonapparel. The React port
deliberately preserves the released **web** behavior. No brand gains verified
status during this migration. Numeric title tokens, retailer charts, and live
option lists cannot promote brand evidence.

## Catalog API and integration responsibilities

`loadCatalog(signal?, options?)` returns `CatalogState` with discriminated
`status: ready | expired | unavailable`. Common fields are `catalog`,
`products`, `history`, `expiresAt` (millisecond deadline or null), `loadedAt`,
and `error`. Expired/unavailable states have empty product and history lists.
Optional history failure leaves a fresh catalog usable. Caller cancellation
aborts active reads and rejects with `AbortError`; hooks must ignore that result
after unmount or request replacement.

Options accept `fetchImpl`, `location`, `baseUrl`, `now`, and `imageState` for
runtime integration and deterministic tests. `baseUrl` defaults to `./data/`;
the Vite development host may pass `/data/`, while a nested `react-preview/`
build should pass `../data/` or the corresponding resolved absolute URL.
Immutable GitHack previews retain the existing main/review live-source behavior
so a hashed shell cannot freeze temporary provider catalog URLs.

Hooks must keep one image availability state per current catalog session, pass
it to catalog loading/display, and reevaluate `getVisibleProducts` after URL
quarantine. `isOlderCatalogSnapshot` allows hooks to reject a delayed older
refresh. It compares the original source `syncedAt`, not the load time.

Hooks own the existing five-minute visible-catalog refresh, visibility/online
events, and the expiry timer. `CATALOG_REFRESH_INTERVAL_MS` exposes the existing
client JSON refresh interval; it is unrelated to provider collection cadence.
They must recheck `isCatalogExpired` on timer/visibility changes and remove open
product/photo detail content at expiry. Child/filter form state and local saved
IDs remain available. An unsuccessful refresh may retain a currently unexpired
snapshot; it must never prolong its source deadline. The migration does not
add a provider API request or change the existing 85-query collection job.

## Source-clock and rights invariants

- Temporary ADPICK photos use the original 90-minute internal display ceiling
  from catalog `syncedAt`; invalid or more than five minutes future source time
  blocks temporary-photo display. The ceiling is not a provider lifetime claim.
- Explicit `expiresAt` is enforced at its exact boundary. A malformed explicit
  expiry fails closed. Legacy `ttl_cache` metadata without `expiresAt` uses the
  original 24-hour source clock. The earliest photo/metadata deadline wins.
- Fetch completion, browser reload, image verification, alternate-photo decode,
  and retry never renew source observation/expiry or claim current stock.
- Product photos remain provider hosted. Failure sets and recovery promises
  live only in memory. The React modules never cache catalog/photo payloads in
  localStorage, upload a photo, or rewrite a provider URL.
- ADPICK BIZ remains `ttl_cache`, unknown providers remain subject to the existing
  `realtime_only` default, and no provider becomes `persistent` here.
- Material conflicts remain explicit; absent material and available sizes stay
  unknown. Size recommendations say `<size> 우선 확인`; seller options, actual
  measurements, product detail, stock, and safety information need final seller
  confirmation. Organic ranking remains independent of commercial placement.

## Local compatibility and privacy invariants

| Key | Existing shape / behavior |
| --- | --- |
| `kkokkapickChildProfiles` | `{version:1, selectedId:string|null, children:[{id,name,months,height,weight}]}`; measurements are strings. |
| `months`, `height`, `weight` | Legacy selected-child mirrors; initial migration reads them when the parsed primary value is missing/falsy or unparseable. A present primary object, including an empty child list, wins. |
| `favs` | Array of product IDs, strings in the new store; existing numeric IDs remain compatible. |
| `priceAlerts` | Object keyed by product ID with finite target numbers. Saving a positive input rounds it; empty/nonpositive input removes it as in the existing UI. |
| `recentProducts` | Most recent product IDs first; repeated ID moves to front; writes retain the existing 20-item limit. |

`createChildProfileStore()` exports `all/current/select/save/remove`.
`createShoppingStore()` exports `favorites/priceAlerts/recentProducts`,
`toggleFavorite/setPriceAlert/removePriceAlert/recordRecent`. Getters return
copies. Each primary record write uses one `setItem`; memory changes only after
that succeeds. Child mutation failures throw so a form can retain its draft and
show the existing failure message. Shopping mutations return false. Neither
store rewrites malformed records on read or clears data when the catalog fails.
After the primary child record succeeds, compatibility mirror failures are
secondary and do not roll back the committed primary record.

Children keep the existing ranges: months 0–180 integer, height 30–190, weight
1–100; names are capped at 20 characters. Invalid stored measurements become
empty and require confirmation before a recommendation. Duplicate/invalid IDs
are ignored; an invalid selection falls back to the first valid child. Removing
the selected child selects the first remaining child; removing the last child
clears compatibility mirrors when storage permits.

The persistence modules contain no network/account/analytics dependency. Child
name, age, height, weight, selected ID, and locally derived fit are never
transmitted by this domain pipeline. Existing localStorage works only on the
same origin: the migration cannot read another GitHack/GitHub origin's private
browser storage. No cross-origin export/import or new collection is introduced.

Atomicity is per persisted record, matching the existing browser contract.
Compatibility mirrors are secondary. Concurrent tabs still follow browser
last-writer semantics; adding a cross-tab transaction protocol is outside this
port. Browser storage denial/quota issues remain visible mutation failures
instead of a false success or child upload fallback.

## Verification evidence

The domain Vitest suites cover local legacy migration, multiple-child selected
fit context, denied/malformed/quota storage, failed commit state retention,
prototype-like product IDs, source selection, exact expiry boundaries, source
clock preservation, cancellation, history failure, in-flight expiry, original
photo retries/offline/generation races, product exclusion, unknown/conflicting
facts, deterministic ranking, token search, seller-bound filters, and observed
price events. No test fetches the live provider or uploads a fixture.

Validation commands (from `web/`):

```sh
npm test -- src/domain/__tests__
npx tsc --ignoreConfig --noEmit --strict --noUnusedLocals --noUnusedParameters --target ES2022 --module ESNext --moduleResolution Bundler --lib ES2022,DOM src/domain/*.ts src/domain/__tests__/*.ts
```

The domain validation passed 75 tests across five suites, the scoped strict
TypeScript check, and formatting. Independent persistence QA/security/privacy
review and independent domain/source review both returned PASS. A read-only
differential check on the baseline published catalog preserved all 965 products,
1,053 linked offers, and 271 price observations; exact 90-minute/24-hour expiry
offsets matched the legacy loader. Independent fit/search differential cases
also matched the released web behavior. These checks made no provider API call.

Root integration owns the build, hook expiry behavior, rendered failure copy,
browser-flow QA, and the required independent final review. Material visual
design still requires Product Owner selection before UI work.
