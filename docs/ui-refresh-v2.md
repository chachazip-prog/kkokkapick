# UI refresh v2 direction

## Design response to Product Owner feedback

The release UI should move away from a generic marketplace grid toward a warm, editorial baby-fashion discovery experience.

### Approved implementation now
- Responsive catalog grid uses width-based 2/3/4 columns with fixed card height to prevent card breakage across device widths.
- Brand filters are contextual: brands with no products under the active stage/category/fit constraints are not shown.
- Real provider catalog images/prices remain the preview source; placeholder content must not replace available provider data.
- Visual system moves to warmer cream surfaces, softer large-radius cards, restrained coral accents and stronger editorial hierarchy.

### Next UX implementation
- Home discovery gets a swipe-first recommendation deck before the conventional catalog list. The grid remains available for deliberate comparison/search.
- Add concise in-product guides for **꼬까픽** (multi-store discovery/price comparison) and **꼬까핏** (child profile + verified size evidence).
- Merchant identity should use approved official logo assets when redistribution/trademark use is cleared; until then use text merchant marks rather than scraping logos.
- Splash/logo/brand-system selection is delegated to Planner + UX/UI for this release cycle. Apply the selected production assets after independent QA; retain Product Owner escalation only for external rights, material cost/privacy/legal exposure, or final public-store actions.

### Responsive QA matrix
320 / 360 / 390 / 430 logical-pixel phone widths, compact tablet, large tablet/web preview; text scale 100% and 200%. No horizontal overflow, clipped CTA, overlapping favorite control, or inaccessible filter state is accepted.
