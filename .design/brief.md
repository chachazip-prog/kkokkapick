# KKOKKAPICK reference-led design brief

Updated: 2026-10-10 UTC / 2026-10-11 KST.

## Product and user

Korean newborn/infant clothing discovery and seller comparison, with a separate toy/learning domain. Parents browse photographs, check supplied price/size facts, save products on-device and select the child whose official size guidance they want to see. KKOKKAPICK does not fulfill orders or deliveries.

## Current request

The Product Owner rejected the revised 06/08/09 visual quality and authorized analysis of commercial services and improvements to internal app behavior. Use actual publicly available service screens and official interaction descriptions. Do not characterize App Store artwork, historical help illustrations or inferred interactions as hands-on testing of the current native apps.

References: Instagram for photograph-led exploration; KakaoTalk for flat, readable rows; Mamitalk for parent context and clear Korean wording; ABLY/Zigzag for product hierarchy and compact commerce navigation. Each borrowed pattern needs a product-specific reason. A service's colorful promotional background is not evidence that its actual app uses that background.

## Invariants

- Four bottom destinations: home, search, wishlist and my. Clothing remains primary; play information uses explicit source ages rather than clothing sizes.
- The user's photo-feed requirement is three columns, four initial rows and no gaps. A fine image seam can distinguish areas. Subsequent rows append on scroll, without more buttons.
- Photo selection reveals the associated product card; detail and return preserve the query, filters, loaded rows, scroll and opener when possible.
- Product information prioritizes photograph, brand, name, price/seller comparison, child-based guidance and supplied material/actual selling sizes. Unknown information stays unknown.
- Rounded Korean typography remains an explicit user preference. Body text is readable and moderate in weight; brand expression does not make every heading decorative.
- Color expresses selection, actions and relevant product distinctions. Neither an all-pastel shell nor recoloring every empty surface resolves weak hierarchy.
- Main navigation, product actions and overlays remain reachable at 320/375/390/430px and on desktop. Existing shadcn/Radix owners remain canonical.

## Authority and evidence

This is a research/handoff brief, not a selected new visual direction. Selection ID: none. Reversible, design-independent interaction fixes may proceed; a material visual redesign requires Product Owner selection under AGENTS.md. Do not silently blend rejected concepts into a final direction.

Commercial supplier photographs are expired. Do not use expired merchandise, generated photographs, campaign imagery or controlled fixtures as current commercial goods. Controlled browser tests verify app behavior, not fashion-photo quality or supplier availability. Reference-service images remain external links or temporary local research files, not KKOKKAPICK product assets.

See [reference audit](../docs/react-web/commercial-reference-audit.md), [design handoff](../docs/react-web/reference-led-design-brief.md) and [current review](../docs/react-web/commercial-reference-review.md) for the observed screens, proposed rules and executed verification.
