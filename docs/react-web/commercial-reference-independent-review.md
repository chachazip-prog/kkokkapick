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
