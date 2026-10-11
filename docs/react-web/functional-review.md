# React workbench functional review

Reviewed on 2026-10-10 in `codex/react-web-rebuild`. This is a functional migration
review of the technical workbench, using the existing baseline presentation.
The ten-proposal Product Owner design selection remains a separate gate; no
production design direction was chosen or materially changed here.

## Corrected interaction regressions

| Surface | Behavior after the correction |
| --- | --- |
| Product cards | Repeated offers from one merchant do not inflate the number of sellers. |
| Price filters | Negative/nonfinite values and reversed bounds retain entered text, keep the sheet open, focus the invalid field, and do not commit invalid URL bounds. Zero/empty remains the released web's unbounded-price behavior. |
| Target price | Invalid prices retain their draft and focus the price input. Enter during composition is blocked. A successful local commit clears only that product's draft. |
| Search | Korean composition does not publish partial text or submit through Enter. The query is published after composition ends. |
| Navigation | Home/search/wishlist/My links carry search, filter, mode, and sort parameters. Product/photo parameters are excluded from ordinary navigation. Resetting filters preserves query, domain, mode, and sort. |
| Lists and dialogs | List/filter changes reset page scroll. Opening/closing a product or photo dialog preserves the list's append count and scroll. Product, photograph, and recent-item dialogs restore their connected opener; unavailable openers fall back to the active navigation link. Another opening dialog retains its focus. |
| Source changes | Selected source-derived filter text remains visible if the next snapshot no longer contains that option. Price-bound drafts are independent of catalog expiry. |
| Routes | An unknown `/technical/:page` shows the missing-screen state instead of presenting it as search. |

Child create/select/edit/delete, favorites, targets and recent IDs continue to
use the existing local record hooks and storage shapes. Removing a child also
removes that child's unsaved draft. Reopening child management uses the selected
child. No child name, measurements, selection or fit result is uploaded, added to
a URL, or sent to analytics by this implementation.

## Focused rendered tests

`cd web && npm test -- src/screens/TechnicalApp.test.tsx` passed **5/5** tests.
These rendered jsdom tests exercise distinct-seller copy, invalid filter focus
and commit behavior, URL state through navigation/reset, target persistence and
focus restoration, IME submission, and missing-screen routing. Galleries are
mocked in this focused suite; it makes no image or supplier-verification claim.

`cd web && npm run typecheck` and scoped Prettier checks passed after the screen
changes. The React best-practices review checked primitive effect dependencies,
stable list keys, hook ordering, locally owned input drafts, shared Radix/shadcn
primitives, and listener cleanup. No extra fetching, persistence service or
runtime dependency was introduced.

## Independent controlled browser check

A separate Chromium session at **390×844**, using the root test-only catalog
and clock `2026-10-10T05:01:00Z`, passed these observations:

- Three fixture offers from two merchants display two sellers.
- Negative/reversed filter bounds retain entered text, focus the invalid field,
  and do not commit; a valid ordered range commits.
- Target-price validation focuses the price field; Escape restores the product
  opener while query/filter/sort parameters remain intact.
- Product-to-child dialog handoff keeps focus inside the child dialog.
- A recent item restores its actual My-page button after Escape.
- An unknown technical route visibly reports the missing screen.

The independent result is preserved in
[`functional-browser-evidence.json`](functional-browser-evidence.json), with
zero failures. This is controlled interaction evidence, not supplier QA.

## Independent source and privacy review

A separate read-only reviewer checked domain modules, local-record and catalog
hooks against the migration contract and legacy authorities. The current scoped
command passed **89/89** tests across eight suites:

```sh
cd web && npm test -- src/domain/__tests__ src/hooks/use-catalog.test.ts src/hooks/use-local-records.test.ts
```

Normal expiry/cancellation, failed-refresh retention, bounded image retries,
offline handling, alternate-photo quarantine and matching seller/size/price to
one offer passed that static/fixture review. Child fields remain within local
storage and memory; no account, network or analytics dependency was found in
those paths.

The review found malformed numeric/size values that could strand initial
loading, empty explicit expiry that did not fail closed, and negative/reversed
age evidence. Integration corrected all three; independent local reproductions
confirmed unknown prices, discarded invalid sizes/ages, fail-closed empty
expiry, and preservation of healthy rows alongside malformed rows. Follow-up
integration also rejected malformed provenance and discarded malformed history
events individually while preserving healthy observations. The independent
reviewer's final targeted malformed-source/catalog-source run passed 15/15
tests, with source TTLs, refresh cadence, source URLs and timestamps unchanged.

## Evidence limits

Root browser results and independent browser observations are recorded with the
final integration evidence in `verification.md`. Controlled UI fixtures are
synthetic, test-only goods with visibly labeled fixture photos. They are never
bundled or published and do not count as supplier goods or photo verification.

The unchanged checked-in supplier catalog is historical: `syncedAt` is
`2026-10-09T00:35:14.464Z`, and its original 90-minute internal photo deadline is
`2026-10-09T02:05:14.464Z`. Its SHA-256 is
`282fa38872f7431e444b980d92d9696aaa30082a375d0c296637bbce10a5ed6b`.
Price-history SHA-256 is
`4b2e143d26d7786deb25a650422b7b9a674f0121200d7deb02b670a1b7bbf267`.
Review began from code base SHA `0b5112c5b5224d7d0d8a61454d961025da5930b9` with
the working-tree changes under review. The integration report owns the final
code SHA and complete command results.

No live provider API, source collection, source-clock renewal, photo upload,
catalog edit, authentication expansion, PR, main merge or deployment was
performed in this review. Current supplier photo QA remains unavailable from
the expired publication. Cost impact is none.
