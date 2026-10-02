# Physical-device release QA

Updated: 2026-10-03

This is the independent QA execution sheet for the Product Owner-selected D03/v10 experience. It is evidence collection, not a substitute for production configuration or store authorization.

## Current frozen candidate

- Release/source SHA: `d8665b5f803cf68b394ca1f73d389714de8d2568`
- Preview deployment commit: `21b05827713cff0caa36f6fd814f8efa7097b11e`
- Preview workflow run: `37076835751` (`Deploy Flutter UI preview` #39)
- Freeze date: 2026-10-03
- This candidate includes #162 social OAuth PKCE/deep-link transport hardening while keeping social providers disabled. Physical-device evidence must record this exact Flutter source SHA.
- Catalog evidence is runtime data and may advance independently through the scheduled ADPICK refresh; record the catalog `syncedAt` visible/verified during the device run.

## Test matrix

Run the frozen candidate on these viewport/device classes where feasible:

| Target | Required |
| --- | --- |
| 320 px logical width | Yes |
| 360 px logical width | Yes |
| 390 px logical width | Yes |
| 430 px logical width | Yes |
| iOS Safari / installed iOS build | Yes before external beta |
| Android installed build | Yes before external beta |
| Text scale 100% | Yes |
| Text scale 200% | Yes |

Record device/OS/browser or build identifier, release SHA, date, tester and evidence link for every execution.

Before starting a device run, execute the manual GitHub Actions workflow `Prepare physical QA snapshot` and attach its `physical-qa-snapshot.json` artifact to the evidence set. The artifact is version/context evidence only and explicitly reports `PREPARED_NOT_EXECUTED`; it never counts as physical-device PASS.

## A. Launch and navigation

- [ ] App launches without blank/white screen or uncaught error.
- [ ] Brand/header follows the approved D03/v10 direction.
- [ ] Bottom navigation is reachable and does not collide with safe areas/home indicator.
- [ ] Home, Search, Favorites and My each have distinct jobs and stable navigation state.
- [ ] Back gesture/system back returns to the expected prior surface.
- [ ] No debug/demo/internal labels are visible.

## B. Home visual release gate (#110)

- [ ] Home is discovery/editorial-first and does not duplicate Search with another full query surface.
- [ ] Category labels render fully without normal-label fade/truncation at 320/360/390/430 widths.
- [ ] Wordmark/header matches the approved-reference treatment; no generic AI-dashboard header treatment has returned.
- [ ] Product cards remain visually bounded when product imagery has white/light backgrounds.
- [ ] Editorial/recommendation rails swipe horizontally without stealing ordinary vertical scrolling.
- [ ] Long recommendation headings do not wrap into broken hierarchy.
- [ ] Continuous discovery feed/grid scrolls without clipping or layout jumps.

## C. Search and catalog

- [ ] Search input, filters and sort controls fit at every target width.
- [ ] Search results do not visually masquerade as Home.
- [ ] Merchant/channel prefixes such as department-store/marketplace tags are absent from display titles.
- [ ] Brand/style brackets that are part of the actual product identity remain intact.
- [ ] Same canonical product is not duplicated merely because multiple merchants sell it.
- [ ] Lowest price and merchant count agree with the currently displayed offers.
- [ ] Unknown specs are omitted rather than fabricated.

## D. Product card/gallery/detail

- [ ] Single-image product has no fake multi-image indicator/swipe affordance.
- [ ] Multi-image product shows only distinct real HTTPS images and horizontal swiping works.
- [ ] Gallery horizontal swipe does not break page vertical scroll.
- [ ] Long product name is constrained without overlap/overflow.
- [ ] Detail visibly exposes brand/name, lowest price and merchant count.
- [ ] Evidence-backed size range/material/composition/season/thickness/color information is readable when present.
- [ ] Review metadata is limited to source-permitted summary/link data; no unlicensed review body is shown from stored scraped content.
- [ ] Merchant handoff is clear before leaving the app.

## E. Guest/account/session states

Run all applicable states against the frozen candidate.

### Guest
- [ ] Guest can browse without authentication.
- [ ] Favorites/child profile/price-alert preferences remain usable under the device-first model where designed.
- [ ] If production auth is not configured, no fake login control is offered.

### Authenticated
- [ ] Login/account creation works only for providers enabled in the production build.
- [ ] First authenticated session asks whether existing device data should be synchronized before upload.
- [ ] Choosing device-only does not upload existing local data.
- [ ] Sign-out returns to the expected guest/device state without silently deleting device-first data.
- [ ] App-data deletion requires explicit destructive confirmation.
- [ ] Account deletion requires explicit destructive confirmation and deployed E2E proves server/session invalidation before external beta.

### Offline authenticated
- [ ] UI clearly communicates offline account state.
- [ ] Stale access token is not used for server mutation.
- [ ] Server account deletion is unavailable until a valid online session is re-established.
- [ ] Device-only deletion accurately explains its local-only scope.

### Account switch
- [ ] Sign out from account A, authenticate as account B, and confirm no A-owned server mutation is replayed through B.
- [ ] B sees only server account data returned for B plus intentionally device-scoped local state defined by the product model.

## F. My / privacy / support

- [ ] Privacy/Data row opens a real explanatory surface.
- [ ] App Settings row opens a real operational-state surface.
- [ ] Customer Support is visibly unavailable and non-tappable while the official operator/contact channel is not finalized.
- [ ] Draft privacy/support/deletion pages are never represented as final production legal particulars.
- [ ] After official support/privacy activation, re-run this section and record final public URLs.

## G. Price-drop alert

Repository-only execution may verify UI persistence. Production/device execution is required before the feature is promoted as real push delivery.

- [ ] Enabling/disabling the alert persists as designed.
- [ ] Repeated observation at the same price state does not produce duplicate delivery.
- [ ] A genuine lower canonical minimum price creates at most one delivery for that observed state.
- [ ] Invalid/stale/non-positive offer values do not create a false price drop.
- [ ] Invalid push token cleanup is verified on the real sender path if push is enabled.

## H. Accessibility and resilience

- [ ] 200% text scale has no clipped critical action or unreachable content.
- [ ] Interactive controls have adequate tap targets.
- [ ] VoiceOver/TalkBack labels are meaningful for navigation, destructive controls and product actions.
- [ ] Loading, empty and error states remain usable and do not expose stack traces/internal exceptions.
- [ ] Network loss during browsing/account restore degrades safely.
- [ ] Relaunch after force-quit preserves only intended state.

## Evidence record

For each failed item record:

- release SHA/build;
- device/OS/browser;
- exact navigation path;
- screenshot/screen recording;
- expected vs actual;
- reproducibility;
- severity: P0 blocks promotion, P1 blocks store submission, P2 post-beta quality;
- owning role and linked issue/PR.

## Pass criteria

`PHYSICAL_DEVICE_QA_PASS` may be recorded only when all P0 items above pass on the frozen candidate, no unresolved high-risk Security/Privacy finding exists, and any unavailable production-only check remains explicitly BLOCKED rather than marked PASS. Production-only blocked checks prevent external-beta/store promotion but do not falsify a repository-only RC result.
