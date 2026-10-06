# R01 — selected Release UI contract

The Product Owner selected the supplied five-screen reference (R01), then selected hero proposal3 with a Korean boy and girl. Subsequent explicit requests authorized gapless photo discovery, round typography, multiple child profiles, separate toy/learning discovery and primary-color component refinement. These refinements preserve the selected layout and navigation. iPhone approval remains pending; do not merge main.

## Ownership and tokens

`styles/tokens.css` owns shared color, type, spacing, surface, radius and border tokens. `styles/release.css` owns component and screen styles with bounded responsive rules. Legacy inline override layers were removed; only the hidden utility uses important.

Use the cool neutral #F5F6F8 canvas, white product surfaces and #CCD2DB image boundaries. Purple remains the identity/selection accent; limited blue #2457D6, red #CC303B and yellow #F2C53D distinguish functional components. Keep photography ahead of decoration and avoid repeated pastel containers.

Self-hosted NanumSquareRound is the UI font. GowunDodum refines the wordmark and hero text. Body is400, section text500, prices600; inputs remain16px to avoid iOS focus zoom.

## Screens and interactions

- Home retains the approved two-child campaign, compact five-stage navigation and early actual clothing discovery.
- Search defaults to clothing. Separate 놀이 · 교구 has product/photo modes and source-based age filters. It never applies clothing sizes or KKOKKAFIT.
- Photo discovery starts with twelve products in three columns/four rows, zero gap and fine image boundaries. Tiles contain photos only. Scroll appends genuine products without more buttons or replacing existing nodes.
- Photo cards and detail share original multi-photo galleries, swipe/keyboard support and selectable dots. They preserve the active remaining photo when an original fails.
- Detail reads photo, brand/title/price, seller comparison, applicable fit and product facts. Fixed actions reserve scroll space. Raw titles and seller facts remain available.
- Wishlist focuses on saved products with a compact empty guide. My exposes local child information, favorites, recent products, target prices and settings. Unsupported order/delivery and announcement capabilities are absent.

## Data and privacy

Multiple child profiles and the selected child stay in browser-local storage. The selected child drives fit and source-backed age filtering. No real child information is sent by QA. Price alerts here save a local target and do not claim production push delivery.

Composition and actual sale sizes use supplied seller fields only. Missing information is explicitly unavailable and links to the original seller. Official brand charts do not become product stock. Unknown play ages remain visible in unrestricted browsing and absent from age-limited results.

The shared image state provides bounded original-URL recovery, snapshot quarantine and genuine alternate photos. Fully failed products leave browsing; saved records and in-progress forms remain. Metadata refresh does not renew source observations or the temporary image display ceiling. Live product JSON is not cached offline. Stable supplier image availability and richer original facts remain launch gates.

## Review evidence

Actual product photography, four required widths320/375/390/430 and independent visual review are separate from CI and synthetic fault regression. Dated history belongs in qa.md. Hero option3 is adopted; other generated hero proposals remain comparison assets rather than product evidence. Final release approval belongs to Product Owner.
