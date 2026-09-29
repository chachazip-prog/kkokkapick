# Visual council decision — Lavender v6

Status: FIXED FOR IMPLEMENTATION after cross-role review. This is an agent-team design council record, not a claim of separate human reviewers.

## Inputs
- Product Owner: lavender concept must replace the inherited cream/coral retail-template look; design quality is release-critical.
- UX/UI: preserve a soft editorial baby-fashion identity, reduce generic Material controls, keep product photography visually dominant, and make Kkokkafit evidence distinct from brand decoration.
- Planner/Product: first-session value must remain immediate discovery; child-profile setup is optional until Kkokkafit needs it. Do not let brand storytelling delay browsing.
- Mobile FE: use a small token set and reusable components rather than per-screen decoration. Preserve 320/360/390/430 widths, 200% text, and predictable two-column cards.
- Source/Data: never let a polished placeholder imply that a provider image or SKU size exists. Merchant prefixes may be removed from display names without altering raw source data.
- QA: visual change must be observable, regression-testable, and rejected for overflow, obstructive controls, broken images, misleading fit labels, or reversion to legacy palette.
- Security/Privacy: child-profile visuals must not encourage unnecessary data collection; no child photo or additional personal data is introduced by the redesign.
- Online Marketing: the lavender identity should improve distinctiveness, but acquisition copy must lead with discovery/size-evidence utility rather than aesthetic claims.

## Resolved discussion
### Brand versus commerce
Decision: lavender is chrome, not content. Product imagery remains the strongest visual element. Lavender deep is used for primary actions/selected state; lavender soft for navigation and quiet surfaces. Blush is secondary. Mint is reserved for Kkokkafit evidence.

### Cute versus trustworthy
Decision: avoid cartoon-heavy chrome. Use one simple original sparkle mark, rounded geometry and warm copy; trust comes from restrained typography, explicit merchant context and evidence labels.

### Onboarding versus discovery
Decision: no mandatory child-profile onboarding. Home exposes products immediately. Profile registration is a secondary action and becomes contextual when Kkokkafit requires it.

### Native controls versus bespoke styling
Decision: retain Material semantics/accessibility but visually normalize controls through shared theme/components so the app does not look like default Material widgets.

### Broken provider images
Decision: never hide failure behind decorative fake garments. Show a quiet branded error surface and keep image delivery as a release blocker until target-browser rendering is confirmed.

## Fixed v6 visual contract
- Primary: #7567D8
- Primary deep: #5146A6
- Primary soft: #F0EDFF
- Blush: #FFEEF4
- Background: #FFFCFF
- Ink: #25232B
- Kkokkafit evidence surface: #EFF8F3
- Brand mark: original lavender gradient sparkle + Korean wordmark
- Home: compact brand header -> editorial intro -> category discovery -> image-led recommendation -> further products
- Find: search -> horizontally scrollable stage/category controls -> contextual brand/Kkokkafit/sort -> image-led grid
- Product card: image > brand/name > price > merchant > fit evidence
- Detail: image > identity/price > fit evidence > size evidence > merchant handoff
- My: child profile/account/settings; no promotional clutter

## Release acceptance
1. Legacy coral/brown must not be the dominant interaction language.
2. 320/360/390/430 widths and 200% text have no blocking overflow.
3. Product imagery is visually dominant when available.
4. Broken images remain explicit and do not masquerade as product art.
5. Kkokkafit never implies SKU availability from a brand guide.
6. Child profile remains optional for browsing.
7. No new personal-data collection is introduced by visual redesign.
8. Marketing copy does not claim guaranteed fit, lowest price, or unsupported catalog breadth.
