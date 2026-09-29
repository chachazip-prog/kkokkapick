# v8 release-polish visual council

Status: TEAM LEAD REJECTED v7 VISUAL ACCEPTANCE / v8 REQUIRED

Evidence: actual Chrome/iPhone screenshots supplied by Product Owner after v7 deployment.

## QA failures visible in device evidence
- Home still reads like a generated prototype: oversized intro/CTA area, repeated pill chips, generic hanger glyphs, and weak product-first hierarchy.
- Horizontal recommendation deck clips the next card at the viewport edge and competes with the fixed bottom navigation.
- Child-profile dialog is visually oversized, lavender-tinted, and uses stacked filled fields with inconsistent radii. It is not release quality.
- Product detail shows raw marketplace/channel prefixes such as `[롯데백화점]` despite card normalization. Normalization is not consistently applied across surfaces.
- Detail typography permits an excessively long raw commerce title to dominate the screen.
- Detail bottom sheet uses a large tinted canvas rather than a conventional white commerce sheet.
- Input theme has inconsistent enabled/focused radii.
- Product photos now render in Chrome. This closes the prior total-image-failure symptom for the tested browser, but Safari remains a separate device gate.

## Cross-role review
- Product: first viewport must prioritize discovery/products, not explanatory copy or setup.
- UX/UI: remove prototype motifs: decorative pills, giant rounded dialog, tinted sheet, repeated icons. Use white surfaces, 8–12px radii, restrained accent, compact hierarchy.
- Mobile FE: eliminate horizontal clipping and bottom-nav overlap; safe-area and sheet constraints are release gates.
- Source/Data: one merchant-neutral display title function must be used by card, deck, detail, search and accessibility labels.
- QA: screenshot evidence overrides prior QA_PASS. v7 visual QA is revoked. Test 320/360/390/430 widths, 200% text, long titles, modal keyboard, scroll end, bottom safe area.
- Security/Privacy: profile remains optional; no new child data.
- Marketing: products and price/value should lead; brand slogans and setup CTAs must not dominate.

## Team Lead decision
v7 is not accepted as release visual quality. v8 is mandatory before release-candidate visual acceptance.

## v8 acceptance gates
1. Product-first home with compact header and no oversized onboarding hero.
2. Category controls use text-first compact controls; no repeated hanger motif.
3. Product grids/decks never show partial accidental clipping.
4. Child profile uses a compact white bottom sheet/form with consistent fields and keyboard-safe layout.
5. Detail uses normalized merchant-neutral title everywhere, capped hierarchy, white sheet, explicit offer section.
6. Fixed navigation never covers content.
7. 320/360/390/430 widths + 200% text pass without overflow.
8. Actual device screenshots are reviewed after deployment; CI alone cannot issue visual QA_PASS.
