# Fresh catalog evidence for React review

The one approved source refresh, [run 37899663133](https://github.com/chachazip-prog/kkokkapick/actions/runs/37899663133), collected the full 85-query plan and passed image health, but failed review publication on `Unexpected coverage collapse` at `scripts/handoff-review-catalog.cjs:61`. The dependent browser job was skipped. No source refresh was repeated and no coverage gate was changed.

## Counts and failure

The run checked out `0b5112c5b5224d7d0d8a61454d961025da5930b9` on `codex/release-ui-rebuild`. That revision contained 965 canonical products and 1,053 source offers. The fresh collection contained 572 canonical products and 627 source offers: 59.27% of the canonical baseline. The unchanged 65% publication rule requires at least 628 canonical products, so this snapshot falls short by 56.

| Domain | Prior canonical | Fresh canonical | Prior source offers | Fresh source offers |
| --- | ---: | ---: | ---: | ---: |
| Apparel | 882 | 489 | 961 | 535 |
| Toy | 48 | 48 | 55 | 55 |
| Learning | 35 | 35 | 37 | 37 |
| Total | 965 | 572 | 1,053 | 627 |

The query plan is identical to the baseline. The log records 1,023 normalized returned rows, 766 unique offers before relevance filtering, and 139 relevance exclusions. Thirty-one apparel queries returned zero normalized results; those queries previously contributed 403 accepted source offers. Other query changes account for the remaining net loss of 23 offers. This identifies the coverage degradation in search collection, before image filtering. Successful HTTP requests and normalized result counts do not establish whether the provider returned empty arrays, an unrecognized response shape, or another upstream condition; raw responses were not retained in this artifact.

The collection image audit passed 627/627. Quarantine excluded zero images, and the independent final audit at `2026-10-09T07:50:01.325Z` passed all 627 unique HTTPS image URLs with zero failures. Image health therefore did not cause this publication failure.

## Source clock and local evidence

Both source and catalog preserve `syncedAt: 2026-10-09T07:33:14.805Z` and `expiresAt: 2026-10-10T07:33:14.805Z`. The existing internal 90-minute image display window ends at **2026-10-09T09:03:14.805Z**. Later image verification does not advance this source clock.

Normal `gh run download` failed with HTTP 403 on the redirected archive. The existing GitHub connector successfully downloaded catalog artifact **11602960805** and final-health artifact **11602457891**. Temporary evidence is under `/tmp/kkokkapick-react-review-37899663133/`:

- `data/catalog.json`, `data/adpick-biz-products.json`, `data/price-history.json`: original collected artifact, suitable only for isolated unpublished QA while fresh.
- `health/review-image-health.json`: independent final-health report.
- `source-summary.json`, `coverage-diagnosis.json`: read-only summaries of the source and coverage evidence.

The downloaded catalog is the artifact uploaded before quarantine, with SHA-256 `de597b51d63dcbd8ecf0617c7ed2fa092350e695f3feab37a028b1905acd491e`; it has no `publicationImageAudit`. The final-health report references the runner's quarantined catalog hash `8725e2ad60ba7d352a243a26aa7fabb0a31fe1bec2bb7fb97c3f784d5f49a188`. Its all-image pass must not be represented as an exact-byte audit of the downloaded pre-quarantine file. Any local React QA must state its own input identity and result separately from the failed publication and skipped workflow browser job.

## Unpublished artifact browser decoding

Local Chromium **151.0.7922.173** decoded **627/627 original image URLs**, with positive natural dimensions and zero failures, from `2026-10-09T08:15:01.131Z` through `2026-10-09T08:15:21.927Z`. The exact pre-quarantine input hash above remained unchanged. This used 16 concurrent pages, one attempt per original URL, normal TLS verification, blocked service workers, and disabled HTTP caching. No image files were persisted. The run finished before the existing source display deadline; the source clock and TTL were preserved.

The allowlisted result at `/tmp/kkokkapick-react-review-37899663133/unpublished-chromium-image-decoding.json` records the source clocks, input hash, browser version, check times, per-URL decoding dimensions/status, counts, and an empty error list. This is a successful **local unpublished-artifact decode check**. Review publication still failed coverage, and its dependent workflow browser QA remains skipped.

Source-derived interaction samples are recorded in `/tmp/kkokkapick-react-review-37899663133/catalog-ui-samples.json`, including full original names and price fields:

| Case | Product ID | Observed facts |
| --- | --- | --- |
| Shortest source name | `adpickbiz_4de95a96` | `린넨 쿨 아동바지 204389`; 16 Unicode code points; 1 photo/offer/seller |
| Longest source name | `adpickbiz_d8afdad6` | 124 Unicode code points; 1 photo/offer/seller; full source name retained in the sample JSON |
| Largest photo set | `adpickbiz_ab63998` | 4 photos, 4 offers, 2 distinct sellers; ₩146,200–₩157,320 |
| Three sellers/photos | `adpickbiz_85b800a5` | 3 photos, 3 offers, 3 distinct sellers; ₩63,882–₩73,320 |
| Learning photo set | `adpickbiz_d8c0d74d` | 3 photos, 3 offers, 3 distinct sellers; ₩19,620 |

The artifact contains 48 products with multiple original photo URLs and 40 with multiple distinct sellers. None of its 627 offers supplies a positive factual `originalPrice`, so it contains no source-backed discount sample. Promotional text in a product name does not establish an original price or discount.

The review branch's existing data remains the previously published snapshot. This investigation did not edit raw data, publish the fresh artifact, bypass the coverage rule, extend TTL, alter collection cadence, copy original image bytes into the repository, or merge to `main`.
