# Brand identity v3 — production decision

Updated: 2026-09-29
Owner: Planner + UX/UI
Status: selected for release candidate

## Decision
Use a restrained **tag + Korean wordmark** identity rather than a mascot-led logo for the release candidate.

- Symbol: rounded clothes-tag tile, representing product discovery without implying a specific child, gender or retailer.
- Wordmark: “꼬까픽” in heavy Korean typography for recognition at small mobile sizes.
- Primary accent: existing warm coral; cream/ink surfaces retain the editorial baby-fashion tone.
- Voice: warm, useful, evidence-conscious rather than cute-for-cute's-sake.

## Why this direction
A mascot would compete with product photography and can make a multi-brand shopping utility feel younger than its actual buyer (parents/caregivers). A typography-first mark is cheaper to maintain, does not introduce licensed artwork, works in monochrome, and keeps KKOKKAFIT as a product capability rather than a second visual brand.

## Splash / launch behavior
Do not add an artificial timed splash. Native launch assets should show the same cream surface and compact mark once final native projects/signing are available. During real catalog/session loading, the Flutter launch surface shows the mark, one-line value proposition and progress state. This improves perceived continuity without delaying first interaction.

## Accessibility
The composite mark exposes one semantic label (“꼬까픽”); decorative symbol/text are excluded from duplicate announcements. Brand color is not the sole carrier of state.

## Asset boundary
The current mark is rendered from first-party Flutter primitives and text, so it has no third-party image/trademark dependency. Store raster/vector icon exports remain part of native store-asset packaging, which is gated by the final native project/store submission workflow.
