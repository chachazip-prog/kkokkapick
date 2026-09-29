# KKOKKAPICK release design system v1

Status: implementation baseline.

## Product design principle
KKOKKAPICK is a discovery utility, not a generic marketplace. The first viewport helps a caregiver see clothes quickly. Product photography and product identity outrank decorative panels. Kkokkafit is evidence attached only to eligible products.

## Visual hierarchy
1. Product image
2. Brand and normalized product name
3. Price
4. Merchant/comparison context
5. Kkokkafit evidence
6. Secondary actions

Avoid repeated badges, oversized hero panels, large empty regions, and marketplace prefixes in customer-facing names.

## Tokens
- background: soft off-white #FFFCFF
- primary: lavender #7567D8
- primary deep: #5146A6
- primary soft surface: #F0EDFF
- secondary blush surface: #FFEEF4
- ink: #25232B
- secondary text: #77737F
- neutral media/loading surface: #F7F6FA
- Kkokkafit support surface: #EFF8F3
- cards: white with subtle neutral border, no decorative elevation
- radius: 14 input/chip, 16 product media, 22 utility cards
- mobile horizontal gutter: 16px

Lavender is the brand/action language; blush is a restrained editorial accent. Mint is reserved for Kkokkafit evidence. Avoid the previous cream/coral retail-template look.

## Screen rules
### Home
Compact brand header. Intro copy is content, not a large hero. Category shortcuts follow. Real product imagery enters the viewport early. Recommendation deck is horizontal and image-led. Kkokkafit explainer appears after discovery.

### Find
Search first. Age/category chips scroll horizontally. Brand choices are contextual to current non-brand filters. Filter controls must not float over product content. Two-column grid is the phone default.

### Product card
Image occupies most of card height. Heart is the only image overlay. Brand is secondary; normalized name is max two lines. Merchant and Kkokkafit are compact metadata.

### Detail
Large image first, then brand/name/price context. Kkokkafit and official size evidence are separated from SKU availability. Purchase handoff remains explicit.

### My
Utility-first settings. Child profile and account state are the first two sections.

## Responsive/accessibility acceptance
Release widths: 320, 360, 390, 430 logical px plus tablet breakpoints. 200% text must preserve navigation and discovery without overflow. Grid changes to 3 columns at 600px and 4 at 900px. Tap targets follow Material minimums.

## Image acceptance
A non-empty URL is not evidence that an image works. Web preview QA requires provider images to render in the target browser. Flutter Web may use HTML image-element fallback for cross-origin provider images. If provider policy or browser behavior prevents reliable display, release blocks until a rights-compatible delivery strategy exists.

## Brand mark
Current release candidate uses an original coral tag symbol plus Korean wordmark. Splash uses the same mark and a short loading message. Final store artwork must derive from this identity.

## QA rejection examples
Reject when the first product viewport is dominated by empty placeholders; a floating control covers product content; raw merchant prefixes dominate product names; Kkokkafit suggests verified SKU sizes where only a brand guide exists; or phone width/200% text produces overflow.
