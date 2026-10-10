# React migration verification — 2026-10-10

This is an engineering workbench and ten-direction **design-selection candidate**.
No new visual direction has been selected. It is not release completion, current
supplier-photo approval, or physical iPhone Product Owner approval.

## Engineering changes and checks

The isolated `codex/react-web-rebuild` branch starts from PR #206's unmerged head
`0b5112c5b5224d7d0d8a61454d961025da5930b9`. Existing HTML, Flutter, source scripts,
provider query plan and raw catalog files are unchanged. React/TypeScript/Vite,
Tailwind and official project-owned shadcn/ui Radix components live in `web/`.
The optional static `react-preview/` bundle contains the app, existing approved
campaign art and licensed local fonts; it contains no supplier-photo bytes,
catalog fixture payloads, child records or credentials.

Local integration checks against the submitted source:

- TypeScript, formatting and production build: PASS.
- Vitest: **108/108**, eleven files. Covers legacy domain behavior, offer-specific
  filtering, source clocks, malformed-source isolation, multi-child local CRUD,
  local-write failure, image recovery, and initial catalog failure.
- Playwright: **11/11** after adding proposal deep-link/Back restoration. Covers favorites/targets/children across reload,
  zero-month child selection, 12-photo initial grid and scroll-triggered automatic
  append, opener focus, storage denial, exact expiry, and expired original-photo
  request suppression. The five-screen matrix runs at **320/375/390/430/1440px**.
- Axe: zero violations in **25 workbench scans**, WCAG 2 A/AA and 2.1 AA.
- Premium strict static component audit: zero findings.
- Design token document lint: zero errors; eight nonblocking orphan-token
  reference warnings. This is documentation lint, not browser design approval.
- Production dependency audit: zero known vulnerabilities. The scaffold CLI is
  not shipped as an app dependency; necessary official CSS variants are locally
  attributed under MIT in `web/THIRD_PARTY_NOTICES.md`.

These browser goods and their photo content are deliberately labeled
**CONTROLLED UI TEST**. They are test-only intercepted responses, not available
merchandise, supplier photos, or an actual-release product corpus. No synthetic
product is made available in the served preview.

## Actually opened images and fixes

Root and a separate reviewer each opened all **25 viewport screenshots** of
Home/Search/Product Detail/Wishlist/My: **20 mobile frames** at the four required
widths plus five desktop frames. Exact paths and independent live scroll/focus
measurements are in [workbench-visual-review.md](workbench-visual-review.md).
Generating the additional full-page PNGs is not counted as inspecting them.

Root also opened all ten post-fix proposal desktop-home captures and eight
representative mobile/search/detail/overlay and expired-source captures from
`/tmp/kkokkapick-proposal-verified-20261010/`. This root sample is separate from the
proposal reviewer's wider matrix and actually opened images in
[proposal-visual-review.md](proposal-visual-review.md).

Browser review found and corrected the initially intersecting infinite-scroll
sentinel, modal opener restoration, query preservation, child re-editing and
failed-save draft loss. Proposal review corrected narrow-screen intrinsic-grid
clipping, shelf containment, hero cropping, long-name density and overlay focus.
The independent source reviewer confirmed all **15/15** targeted malformed-source
and catalog-clock guards after integration fixes.

No blocking overflow, inaccessible CTA or navigation collision was demonstrated
in the controlled workbench. Its inherited presentation remains a technical
baseline: the mobile hero delays the first product row, extreme source names
produce uneven rows, and the gallery rail's focus outline is partly clipped.
These are explicitly recorded observations for selected-design refinement.
Test photo geometry cannot establish fashion image quality or actual supplier
crop suitability. Production visual QA remains pending selection and fresh data.

## Supplier evidence and present availability

The **one** approved 85-query full collection in this migration is
[run 37899663133](https://github.com/chachazip-prog/kkokkapick/actions/runs/37899663133).
It collected **572 canonical products / 627 offers** and passed the final
**627/627 HTTP-image gate**. Publication failed the unchanged coverage gate
against 965 prior products; the dependent workflow browser job was **skipped**.
There is no newly published data SHA from that run.

- Collection code: `0b5112c5b5224d7d0d8a61454d961025da5930b9`.
- Unpublished artifact SHA-256:
  `de597b51d63dcbd8ecf0617c7ed2fa092350e695f3feab37a028b1905acd491e`.
- Source clock: **2026-10-09 16:33:14.805 KST**.
- Internal photo deadline: **2026-10-09 18:03:14.805 KST**, now expired.
- Separate historical local Chromium original-photo decode: **627/627**, completed
  2026-10-09 17:15:01–17:15:21 KST, before that deadline. This is unpublished
  artifact decoding, not workflow publication or new React screen QA.
- The previously published review catalog is also expired. The public React
  preview must show source HOLD and campaign-only concepts, never normal
  current merchandise or test-fixture goods.

[catalog-evidence.md](catalog-evidence.md) distinguishes pre-quarantine artifact
bytes, final health bytes, failure cause, counts and separate decoding evidence.
No collection was repeated, source clock extended, cadence changed, gate bypassed,
original photo permanently stored, seller crawled, or child uploaded.

## Remaining release gates

Actual supplier material and selling-size fields remain absent; generic official
brand charts are not actual available stock. Toy/learning explicit age evidence
is absent from the checked prior publication. Missing facts are presented as
seller confirmation; they are never invented. Stable image delivery/refresh and
redisplay-rights contracts, provider limits, operator/public business information,
support contact and final service/privacy policies require external information.

The ten concrete proposals are compared in
[design-proposals.md](design-proposals.md). **No selected proposal ID exists.**
After Product Owner selection, implement that complete direction and run fresh
product/browser visual QA, including physical iPhone Safari owner review.
Technical approval delegation does not complete these external or owner gates.
Main remains unmerged; production is not deployed. No notification automation is
reactivated. Exact public bundle SHA, PR CI state and public browser result belong
in the current PR report, separate from local controlled evidence and data SHA.

## Delivery-path follow-up

The first submitted commit `15e02311f21305fa3b5252337609cf7d4bf9fe7b` passed
[React CI 38028127590](https://github.com/chachazip-prog/kkokkapick/actions/runs/38028127590)
on 2026-10-10; its controlled screenshot artifact is `11660408956`. This is
independent of the supplier refresh and skipped actual-source browser job.

The immutable raw.githack.com preview returned **HTTP403** on a normal public
browser attempt and normal HTTP header check. No proxy, identity spoofing or
access-control workaround was used. It is not reported as a working public demo.
A separate Vercel personal Hobby account was inspected, but no project or
deployment was created: the documented Hobby/fair-use commercial restriction
includes affiliate linking. The unused draft hosting configuration was removed.
No paid plan or service was enabled.

The fallback is a [web-readable numbered screenshot comparison](preview.md)
and `react-preview/offline.html`, a single HTML containing React, fonts and the
already approved campaign art. It contains no supplier photos, source catalog,
fixture merchandise or child records. Source connection remains HOLD; serving
the file does not make the catalog current. Its browser check via an ordinary
local static server exercised **30 proposal compositions + four workbench
routes**, decoded embedded campaign images and both fonts, and observed zero
page errors, horizontal overflow or supplier-original requests. Direct `file://`
navigation was blocked by this environment's browser policy; that path was not
bypassed and is not claimed as tested here. PC users can download the file or
serve it locally; mobile Safari/physical iPhone remains unverified.

The capture delivery includes **30 campaign-only home/search/detail screenshots**,
with no merchandising facts invented. Capture is not counted as opening all
30 images. Root actually opened all ten delivery-home JPGs before handoff; search/detail captures are generated evidence, not claimed as thirty individually inspected delivery images. The earlier independent composition review remains separately recorded.
Late integration fixed external proposal hash links and browser Back while
retaining the same reviewed layouts. The new browser regression passes; no
visual direction was chosen by this engineering fix.

Standalone final check: **2026-10-10 20:40:02 KST**, HTML SHA-256
`00576298de43c8279018dcb2ecc4f8fbb773566fb35ce57b135665cab3654092`.
The byte hash was unchanged through all 30 compositions and four workbench
routes; UI/display fonts loaded, page errors/overflow/original requests were zero.
This normal local-server check is not a successful GitHack public-browser check.
