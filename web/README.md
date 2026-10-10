# KKOKKAPICK React web

React 19 + TypeScript + Vite + Tailwind 4, with project-owned shadcn/ui (official Radix/nova generation), Radix interaction primitives, Lucide and Sonner. React Router hash routes allow a static branch preview without a new hosting service. The separate legacy web demo and Flutter app remain intact during migration.

```sh
cd web
npm ci
npm run dev
```

Open `/#/proposals` to compare ten distinct designs. Each has home, search, detail and an overlay/navigation pattern plus rationale. `/#/technical/home`, `/search`, `/wishlist` and `/my` review the migrated behavior using inherited R01 tokens. These technical routes are not the new approved production visual direction. An explicit proposal choice is required under AGENTS.md.

```sh
npm run typecheck
npm test
npm run format:check
npm run test:browser
npm run build:review
npm run build:offline
```

Playwright uses an available `/usr/bin/chromium` or its installed Chromium. Install the latter with `npx playwright install chromium` if needed. Browser checks use **controlled synthetic fixtures**, visibly labeled and excluded from the production bundle. They do not establish supplier photo validity or a release-ready catalog. CI saves controlled screenshots for three days.

## Ownership and contracts

- `src/domain/`: raw-to-view-model facts, source-clock/90-minute photos, search/price/fit, local-record compatibility. No provider credentials or API collection.
- `src/hooks/`: cancellable catalog owner, bounded JSON revalidation, in-memory photo quarantine, atomic local mutation owner and scroll-driven pagination.
- `src/components/ui/`: generated shadcn/Radix source with centralized Korean labels and shared interaction states. Official CLI provenance and MIT license in THIRD_PARTY_NOTICES.md; no registry/CLI runtime dependency.
- `src/components/`: shared source/local state and real-original-photo gallery.
- `src/screens/TechnicalApp.tsx`: migration workbench; owner-selected designs will be implemented as dedicated screens using these contracts.
- `src/proposals/`: isolated review-only compositions, not a silently selected production system.
- `src/index.css`, root DESIGN.md and UX-CONTRACT.md: canonical baseline tokens, authored controls and source/privacy constraints.
- `e2e/`: test-only catalog/image fixtures and browser workflows, never imported into app source.

Child measurements, several profiles, favorites, target prices and recent products keep the legacy local-storage keys. No child upload, new authentication/synchronization, paid service, supplier crawling, permanent product-photo storage, order fulfillment or notification delivery is introduced. Source expiry removes merchandise and closes an unavailable product, while drafts and saved records remain on-device.

## Branch preview

`npm run build:review` writes compiled assets into `../react-preview/`. The bundle contains only application code, existing approved campaign art and licensed self-hosted fonts. Published catalog JSON remains in the existing parent `data/` location. An immutable GitHack SHA preview reads the existing eligible published source branches; it cannot revive expired originals or the failed publication of run37899663133. Record collection/deadline/hash and supplier QA separately from code CI.

No main merge or production promotion. Fresh normal merchandise review, material/selling-size source, supplier availability/redisplay rights, operator details and actual iPhone Product Owner approval are still release gates.
