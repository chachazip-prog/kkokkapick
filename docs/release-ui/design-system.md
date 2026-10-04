# R01 — Product Owner selected reference

Selection: the five-screen pink/lavender mockup explicitly supplied by Product Owner in the 2026-10-04 follow-up. This is the selected visual contract, superseding the earlier editorial interpretation. Owner also authorized independent UX improvements and requested an Instagram-style photo-only discovery mode and material/size information.

## Architecture

`styles/tokens.css`: color, typography, spacing, border, surfaces, radius. `styles/release.css`: component/screen styles in one coherent sheet; responsive deltas are contained in one final narrow-width media block. No old override layers. Only `[hidden]` uses `!important`.

`src/release-ui.js`: presentation/state/interactions. Provider data and canonical backend/provider engines are unchanged. `src/runtime-diagnostic.js`: existing diagnostics, separate from UI. SW cache/version includes new assets and uses network-first code/CSS to avoid stale styles.

## Selected visual direction

- Purple hanger logo and wordmark, warm smiling-child hero with pink CTA, five compact pastel category icons. Hero copy/crop remains stable at all four widths. Existing `assets/hero-smiling-child.webp` is reused and positioned/cropped in CSS; embedded navigation markers are outside the crop. A small image-edge mask blends the photo seam. A high-resolution source for the final campaign would improve quality.
- Purple search controls, horizontal age filters, 12 compact category entries, fit promotion, real brand choices. Three visible ways to explore: categories, photo feed, product list. Search typing/category actions reveal products immediately; photo mode keeps imagery ahead of optional age controls (age available in filter sheet).
- Detail: original product photo, cleaned display title and preserved raw title, pink price and purchase action, lavender fit section, real offer comparison, product-information rows and locally saved target price. Fixed CTA reserves bottom scroll space. Share links resolve to the actual product id.
- Wishlist: selected reference's heart/guidance style at a restrained size, plus actual recommendations below. Saved items browse as standard product cards.
- My: soft child-information panel, truthful saved/recent/alert counts, rounded shopping/support rows. Unsupported order/delivery and announcement menus are removed, following client-data-contract.md and mobile-ux-direction.md.
- Typography: Self-hosted NAVER NanumSquareRound, with Korean/iOS system fallback, body 400, headings 500, prices 600, logo 700. Form controls remain 16px for iOS zoom prevention. Visible keyboard focus, semantic buttons, labels and focus restoration across list re-rendering.

## Photo discovery and information integrity

Photo tiles contain only actual provider photos; accessible names are present but visual product titles/prices/brands/hearts are absent. Photo feed uses three columns and four initial rows (12 actual products), zero gap and square corners. Row height fits the available viewport above bottom navigation, without cropping garment photos. Failed tile images are removed from the photo feed, while the corresponding product remains accessible in the product list. Products with multiple unique source image URLs show an image-count badge. Selected card and detail use a shared swipe/keyboard/button gallery with counters and preserved aspect ratio. A selected photo opens a product card with brand, title, price, seller, material/size summary, favorite and detail actions.

Materials, composition, sizes, colors and care use only supplied fields. Material and size rows always appear; absent values say to verify the seller detail/options. No invented “cotton 100%”, size availability or discounts. Original data is preserved.

## Latest owner refinement

Warm ivory canvas (#fbf7f2), brighter product surfaces (#fffdfb), warm gray image borders; no accumulated overrides. The photo feed is photo-only with a selected-product sheet. Main surfaces share restrained typography and natural Korean copy. Detail images constrain grid min-height to prevent intrinsic-image clipping at 430px.

## Boundaries

No paid service, new authentication, server collection, backend migration or provider-policy change. Recently viewed ids are capped at 20 on this device; profiles, favorites and target prices retain their local storage boundary. Native sharing runs only on user action. Main and current Pages deployment remain untouched; review branch/PR only. Final iPhone review and release approval belong to Product Owner.

## Hero proposals

Three independent AI-generated Korean-child hero concepts in `hero-options.html` are proposals only, in the same order displayed in chat. They are not live campaign/catalog evidence and do not replace the existing homepage hero before owner selection.
