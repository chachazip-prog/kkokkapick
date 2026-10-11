# Independent reference and interaction review

Checked 2026-10-10 UTC. This report is scoped to commercial-reference evidence and design-independent technical-screen behavior. It is not an approval of the rejected proposals, supplier photographs, or the release design.

## Evidence reviewed

- `AGENTS.md`, Design Partner skill, `commercial-reference-audit.md`, `reference-led-design-brief.md`, `commercial-reference-review.md`, `commercial-reference-evidence.json`, final TechnicalApp/useInfiniteCatalog diff, UX-CONTRACT diff.
- Six representative public reference pictures actually opened: Kakao-04, historical 2021 Instagram search grid, Mamitalk-05 and -07 large, ABLY-08 large, ABLY public-web category at390.
- Official marketing framing is distinguished from embedded app UI. Instagram historical content is dated. ABLY public browser navigation is distinguished from native-app behavior. Native login/iPhone usage is not claimed. Document observations agree with the six images opened.

## Independent behavior checks on normal Chromium

Local normal CLI Vite at127.0.0.1:5174, actual Chromium executable. Controlled fixture photographs are explicitly labelled test-only and do not represent supplier goods.

Checked320,390,1440px at844px height, completed2026-10-10T22:41:07.645Z:

- Fast home-to-search typing, waiting only for URL and typing at25ms: destination remains search; browser Back returns home rather than removing characters.
- Initial12-photo feed; actual wheel/scroll appends stable records.
- Product dialog Escape, browser Back/Forward, focus trap and opener focus restoration.
- Scroll restored423px after return; no horizontal overflow or page errors in these paths.
- Actual expired source at390px: zero supplier-picture requests, zero product photographs, explicit10/9 09:35KST collection /11:05KST internal deadline shown.

Independent delayed-source boundary completed2026-10-10T22:40:34.938Z: source loading while search→my→search; then controlled ready response produces20 visible cards of40 results.

Eight final technical-state screenshots actually opened: search and photo-dialog at320/390/1440, actual expired390 search, corrected delayed-source390 return. Their clipping/overlay checks are limited to the tested functional-screen states, not fashion-image aesthetics or a selected final design.

The root-provided final captures were subsequently each opened individually: Home/Search/Detail/Wishlist/My at320/375/390/430px (20mobile captures,844px height), plus the same five surfaces at1440px (5PC captures,1000px height), in `web/test-results/commerce-controlled-five-*/` and named `*-controlled-viewport.png`. Thus this reviewer opened33 final technical-state captures in this review, apart from the six commercial reference images.

No new visual functional blocker caused by the scoped navigation changes was found. The canonical technical workbench remains unsuitable for claiming final release visual quality: in every mobile home, the first product price is below the initial viewport; the search tools occupy several rows; a very long wishlist title is not limited to two lines and substantially delays its price. These are observed remaining design issues, not excuses to accept an unselected design. The new reference-led design brief calls for their correction in the next reviewable visual direction. Supplier photo crop, palette harmony and product diversity cannot be assessed from controlled grey test images.

## Defects discovered and independently retested

1. Fast home→search input used the previous route handler and returned to home?q=UI. Reproduced twice before fix. Owner changed event-time navigation handling; the original URL-only/25ms reproduction passes at320/390/1440 after fix.
2. Returning to a list while source was loading cached display amount0, then showed40 results but no cards once source became ready. Owner separated remembered quota from clamped display count; the same delayed response reproduction now shows20 cards.

## Checked code fingerprints

- TechnicalApp.tsx SHA256:58c122093254d0ed97abad601a844b7243c144e43e2f2115fbfa357bc323b983
- use-infinite-catalog.ts SHA256:ccba7c09c928dac96198984e72a70fb962381c8a1541279264b030063958ac9b

## Scope status

Reference-claim accuracy and tested final navigation/loading regressions: PASS.
Root-provided final core20mobile plus5PC screenshot review: performed directly; no new blocker from the scoped navigation changes. Release visual quality remains HOLD for the observed layout/hierarchy issues and unselected direction.
Actual current supplier photograph decoding/crop/diversity, material/actual sales-size provenance, stable photograph availability/rights, selected visual design, actual iPhone Product Owner approval: HOLD / not performed in this review.

Reviewer changed only temporary local files, started a local Vite server, and performed read-only product checks. No Git edit/commit/push, supplier collection, source-clock/TTL/cadence change, production deployment, main merge, child upload, external asset publication, or new paid service was performed by this reviewer.

---

## Independent final interaction and visual review

Reviewed 2026-10-11 UTC. Scope: commercial-reference analysis and design-independent app behavior, including the final `OriginalPhoto` idempotent source assignment. This is not release visual approval or fresh supplier-image QA.

### Read-only evidence and actual screen inspection

Read `AGENTS.md`, `.agents/ux-ui.md`, commercial-reference overview/independent review/evidence, `commerce-gallery.tsx`, `use-catalog.ts`, `image-availability.ts`, relevant component recovery tests, and the bounded browser recovery assertion. Source/design/docs/Git were not edited by this reviewer.

The freshly generated `/tmp/kkokkapick-reference-final-browser/.last-run.json` records `status: passed`, `failedTests: []`. This file alone does not assert supplier photos or a release-ready design.

Actually opened every final Home/Search/Detail/Wishlist/My viewport image under `/tmp/kkokkapick-reference-final-browser/commerce-controlled-five-*`: 20 mobile captures at 320, 375, 390, 430 px, and 5 PC captures at 1440 px. All are explicitly labeled CONTROLLED UI TEST. These are final source-fix captures, not the earlier pre-fix screenshot set.

No new blocking text clipping, horizontal overflow, or fixed CTA/navigation collision caused by the scoped navigation/photo-source changes was visible in these 25 captures. Existing release-design issues remain: home first merchandise/price is below the mobile first viewport; search uses several full-width tool rows; the extremely long wishlist test name substantially delays its price. The source fixture is useful for flow/layout checks, not supplier photograph aesthetics or variety. Release visual quality remains HOLD.

### Bounded photo recovery independently checked

Reviewed `/tmp/kkokkapick-independent-image-recovery/baseline.json` and `results.json` using summarized actual request/event records. Both have identical start/end hashes within each run. Five baseline rounds each show HTTP 4 (two rendered requests + two shared probes); five fixed rounds each show HTTP 3 (one rendered request + two shared probes). Opening selected card/detail adds zero requests for the quarantined URL. `use-catalog.ts` and `image-availability.ts` hashes are unchanged across both runs.

The initial CI failure reported five requests against the unchanged <=4 assertion. Its fifth request's specific origin is unconfirmed because CI artifact download was denied with HTTP 403. The direct comparable local evidence is 4→3, not a proven CI 5→3 reproduction. The test ceiling remains <=4; the shared probe budget remains two. No test-budget relaxation, CSS, source clock, TTL, provider cadence, catalog query, provider access, or supplier storage change was introduced by this fix.

I additionally performed one normal local Chromium context against the current Vite source with only intercepted controlled fixtures. `/tmp/kkokkapick-reference-final-independent-network.json` records 2026-10-11T05:06:46.467Z: three failed original URL requests after recovery, still three after selected-card/detail opening, two surviving dots, no horizontal overflow, no page errors, PASS. No provider source collection occurred.

`OriginalPhoto` assigns the URL once to the connected image node when its src differs. StrictMode/Suspense reappearance does not repeat assignment. Explicit retry still remounts a fresh attempt node. Existing alt/name, lazy/eager loading, async decoding, error handling, offline reconnection, stale-generation quarantine and shared retry behavior are retained. New StrictMode/Suspense source-write regression test asserts exactly one assignment without modifying the browser request limit.

### Final fingerprints

- `commerce-gallery.tsx`: `92f5cec949a7575a1a9719f199994094715698587d4b2676fbf8cfa657f72918`
- `use-catalog.ts`: `83230d53bb81ddb136a260a0811f3699d1ff607759a31cb944a4bebb6ebdb2f3`
- `image-availability.ts`: `6ca6cf99f930457a13d1f66fecfc188bc89044f9d614b6ee03532790d797bfc4`
- `commerce-gallery.test.tsx`: `6d4ad0b518f2a8fdba0c03687679c24e93877d2b0fea41f4716abeb7de727874`

### Bounded verdict

PASS for the reviewed design-independent navigation and photo-recovery implementation, the final controlled core 20 mobile/5 PC capture inspection, and the independently replayed bounded recovery flow. No new functional blocker identified.

HOLD for final visual design selection/quality, current real supplier photo decoding/crop/diversity, stable image availability/redisplay rights, source materials/actual selling sizes/explicit play ages, operator information and actual iPhone Product Owner approval. Technical approval delegation does not supply these facts. Existing source photographs remain expired and may not be presented as current normal goods. Main merge/production deployment are not authorized or performed.

Repository overview currently still states unit 108; root reports final 109 unit and full 34 browser PASS after the added source-write regression. Root should record latest final code/QA SHA and actual new CI result in the PR rather than treating initial CI as green. This reviewer did not independently rerun the full suite, refresh provider sources, or bypass artifact access.


## Subsequent exact-head CI contrast diagnosis

The root reported new exact-head f069 CI run 38113844504: 33/34 browser pass, one 430px core accessibility failure identifying `#radix-_r_5_` title and `#radix-_r_6_` description. This subsequent CI failure is not superseded by the earlier local browser PASS. CI trace artifacts remain unavailable after a normal HTTP 403; no bypass was attempted.

Read-only normal Chromium diagnosis of the 430px original flow and final settled nodes found title color RGB(32,35,43) on white, 21px/600, contrast 15.710:1; description RGB(86,97,115) on white, 14px/400, contrast 6.263:1. Both settled text contrasts meet their WCAG AA requirements. Six repeated stable measurements recorded no axe violations; a separate three actual search→detail dialog openings were sampled from DOM insertion with MutationObserver/rAF.

The three actual openings were still animating after `toBeVisible` and `document.fonts.ready`: dialog parent opacity 0.92481, 0.802383, 0.803772 with `enter` 100ms animation running. Their traces start at opacity 0 and finish at opacity 1. Both immediate and animation-settled axe runs happened to pass locally. Thus visible/fonts-ready do not establish the finished visual state; a motion timing race is an observed possibility, while the exact CI failure cause is not proven by this local run.

Artifacts: `/tmp/kkokkapick-reference-430-contrast-diagnostic.json`, `/tmp/kkokkapick-reference-430-motion-trace.json` (checked 2026-10-11T05:15:42.953Z). No source/test mutation was made. Recommended owner change is a rendering-state synchronization before unchanged full axe checks in `commerce.spec.ts`: await real finite dialog/content animations' `finished` promises, verify effective final opacity 1, then inspect normal final colors. No color rule skipping, test ceiling relaxation, fixed arbitrary sleep, !important or CSS override append is warranted by the settled contrast evidence. New CI result after any test change must be reported separately.
