# v7 commerce-natural design council

Status: TEAM LEAD CONFIRMED FOR IMPLEMENTATION

Input: real iPhone Safari preview feedback on v6. The visual language feels synthetic/AI-generated, provider product images do not render, and channel prefixes such as [롯데백화점] must not be presented as product identity because a canonical product can have multiple offers.

## Design proposal
Use the approved v7 reference as direction, not literal artwork. Product photography and shopping information lead; lavender is limited to brand/selection/CTA accents. Remove decorative hero copy, repeated hanger motifs, oversized empty cards and excessive pill treatment. Prefer compact native-commerce hierarchy, restrained radius, white surfaces and clear typography.

## Cross-role review
- Product: discovery and products must appear above explanatory service copy.
- UX/UI: reduce decorative AI-prototype patterns; use conventional commerce rhythm and let photography create warmth.
- Mobile FE: shared components, predictable 2-column grid, 320–430px resilience, no bespoke layout that breaks 200% text.
- Source/Data: display canonical/normalized product identity, never an offer-channel prefix. Offers remain separately visible in merchant comparison.
- QA: actual Safari image rendering is required; URL presence alone is not evidence.
- Security/Privacy: no new child photo/data collection.
- Marketing: utility and products before brand slogans; no unsupported breadth/fit claims.

## Team Lead confirmation
APPROVED. v7 supersedes v6 composition. Lavender tokens may remain, but v6 composition is not a visual baseline.

## Acceptance
1. No [channel] or merchant prefix in product cards/detail title.
2. Product image delivery is confirmed on the published Safari preview, not just CI.
3. Home/find are image-led and materially less decorative.
4. Merchant identity is shown only in offer/merchant context.
5. Existing Kkokkafit evidence and privacy boundaries remain intact.
