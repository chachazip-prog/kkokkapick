# Current interpretation — 2026-10-07 KST

This audit distinguishes source facts, derived shopping information and historical proposals. ADPICK search returns seven documented raw fields: title, photo, price, cp_name, cp_code, cp_icon and commissionlink. The service adds its observed time and derives grouping, price comparison, category and brand presentation; these are not additional supplier product facts. Composition, live sale-size options and explicit play ages are not present in the inspected search source and are never invented.

The selected UI direction remains owner reference R01 and hero proposal3 (Korean boy and girl). Current tokens use a cool neutral background (#F5F6F8), white bordered commerce surfaces, bounded primary blue/red/yellow component accents, GowunDodum for logo/hero and NanumSquareRound for body. The earlier A/B/C warm palette proposals below are historical and do not override that current direction.

Official public documentation was examined through the search index on 2026-10-06; the index reported crawled today, while direct guide access returned403. [ADPICK BIZ API guide](https://biz.adpick.co.kr/?ac=api&sub=guide) documents search's seven fields and a separate link API with product_img and product_price_org. That link API requires a known original seller product URL; it is a possible follow-up, not an implemented stable-image or rich-detail solution. The guide does not establish an image lifetime/renewal contract or material, live size or play-age fields. It places seller-content rights and responsibility outside an automatic ADPICK license. Neither the internal24h metadata ceiling nor90min image-display ceiling proves supplier permission; applicable account/seller rights must be confirmed before launch. No additional product API call, seller crawl or outbound supplier inquiry was performed in this investigation.

Current catalog counts and fresh-photo gates are recorded in [QA history](qa.md) and the PR. Expired snapshots and once-successful image probes must not be described as presently healthy.

# ADPICK product facts and palette review — 2026-10-04

## Verified repository snapshot

The immutable review catalog was synced at 2026-10-03T11:26:35.381Z. It contains **667 canonical products, 730 ADPICK seller offers, 9 merchants, and 50 multi-image products**. This is the service cache count, not ADPICK's entire addressable inventory. The authenticated API universe total is not established; API secrets were neither requested nor exposed.

There are **6 currently supported customer-facing information types: 5 provider-backed types plus the service-recorded check time**: product name, original image URLs, seller identity/domain, selling price, seller/affiliate destination, and checked time. The checked time is recorded by this service when it queries ADPICK; it is not an ADPICK product attribute. Seller/domain are one information type; multiple photos are one image type. Multi-image sets are grouped from seller offers and do not guarantee the full detail-photo collection from one seller. Price comparison and lowest price are derived from grouped seller offers. Brand/category/month-stage extraction and KKOKKAFIT are presentation/inference or external official-size-guide logic, not new ADPICK source facts. External identifiers, query tags and commission data are implementation fields, not shopping information.

The adapter can accept original price, but this snapshot has zero usable original-price values. Original material facts and actual available size/stock options are absent. All667 availableSizes arrays are empty. 394 products have inferred brand labels; 28 have external brand-size guides;47 have fit evidence other than unverified. A brand size chart does not establish the sizes currently sold for one product. Detail retains material and size rows with seller-verification guidance when facts are missing; no invented cotton percentages or sold sizes.

## Actual product-image analysis

Independent source reviewer measured the twelve real main images rendered in the initial photo feed screenshot. Visible image crops are50.5% near-white,65.2% light,95.9% low-chroma; mean RGB230/226/221. These are rendered image-area measurements, not an exhaustive scan of all667 source originals. The twelve include white cutout garments, beige sets, yellow stripe and darker trousers; their neutral imagery benefits from a warm surrounding surface and fine image borders. Later provider URLs can expire, so full-source photo analysis/release image QA remains blocked.

## Reviewable palette proposals

Keep the approved rounded NanumSquareRound family across logo/body; logo600, body400, section500–600, price600. Preserve product photography as the visual emphasis.

| Option | Background | Logo / headings | Body | Selected / accent | Pink CTA |
|---|---|---|---|---|---|
| A — warm ivory (recommended) | #FBF7F2 | #49375F | #342F38 | #7759A6 | #DD6686 |
| B — soft greige | #F4F2EE | #51445A | #373238 | #806894 | #CE7489 |
| C — pale mauve | #F8F5FA | #4D3C62 | #352F3D | #7854AE | #D9658E |

A best complements the measured cream/ivory clothing while separating pale product images with fine warm-gray borders. B is calmer and slightly more fashion-editorial. C carries more visible purple brand identity. These are proposals, not an unapproved replacement of the owner-selected direction. Current candidate retains its approved warm surface and purple/pink accents. Use neutral surfaces for80–90% of the interface; avoid coloring every product/category container.

## Remaining source work

Refresh image URLs from an authorized, current ADPICK catalog. Establish authenticated total coverage and source material/size availability before claiming broad inventory support. Do not copy remote provider photos into committed permanent assets as a workaround. Product Owner already authorized continuing UI work while catalog remediation is pending.
