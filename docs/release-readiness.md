# Release readiness review

Updated: 2026-09-29

This is the Team Lead roll-up of Product, Source/Data, UX/UI, Mobile FE, Backend, Security/Privacy, QA, and DevOps/FinOps review. It is a living release gate, not a claim that the app is store-ready.

## Release gates

| Area | Current state | Gate before store submission |
| --- | --- | --- |
| Product | Core discovery, filtering, favorites, child profile, fit evidence, affiliate handoff exist in prototype/mobile code | Freeze v1 scope and acceptance criteria; remove demo-only behavior |
| Source/Data | ADPICK ingestion and canonical catalog exist; retention is fail-closed by provider policy | Written production rights/retention classification; production catalog served from approved backend rather than GitHub Pages |
| UX/UI | Mobile-first discovery flow exists; CI contracts cover 200% text scaling, core navigation and destructive confirmation | Final screen-reader/contrast/tap-target and small/large physical-device QA after UI feedback |
| Mobile | Flutter feature foundation exists; Android Gradle platform baseline is committed and exercised by Flutter CI | macOS CI now generates the official iOS project and verifies an unsigned release build; final identifier `com.kkokkapick.app` is fixed; committed native release artifacts, protected signing and deep-link production verification remain |
| Backend | Supabase schema/RLS/admin/commercial migrations exist; push token ownership, threshold evaluation, atomic claim/finalize and bounded retry ledger are implemented | Apply migrations to a real environment; connect auth/persistence and a credentialed provider sender/scheduler |
| Security/Privacy | Secrets are kept out of clients; user tables have owner RLS; admin uses allow-list; technical privacy inventory and dependency reproducibility gate exist | Verify grants/view/RPC exposure, retention/deletion/session behavior and ecosystem advisories against deployed production configuration |
| Commercial | Sponsored content is separated from organic fit ranking; public event boundary excludes conversion/revenue writes; opaque-session rate/replay controls exist | Provider-confirmed conversion ingestion, final disclosure QA and production edge/load abuse verification |
| Operations | Node/Flutter CI, Android/iOS unsigned release validation, dependency gate and incident/rollback runbook exist | Production environment monitoring plus backup/restore and rollback rehearsal |
| Store compliance | Draft public policy/support/deletion pages, technical data inventory and reviewer/store submission pack exist | Final legal/contact fields, production-derived Apple Privacy/Google Data Safety answers, final assets and reviewer access |

## Findings corrected in this review

1. Scheduled campaigns/popups previously required a manual status transition at start time. Public read models now derive live visibility from server time, avoiding a cron dependency.
2. Commercial performance was exposed as a view name reachable through the REST schema. Direct anon/authenticated access is revoked; admin reads go through an admin-checked RPC.
3. Campaign/popup publish transitions now validate required title/disclosure/partner/schedule invariants.
4. Commercial endpoint/network failure no longer needs to fail the core Flutter catalog experience.
5. Admin lifecycle controls include scheduled/published/paused/ended states.
6. Core catalog/provider/offer/price-history tables now enable RLS; public clients must use a deliberately narrow read boundary instead of direct table access.

## High-priority release backlog

### P0 — required before external beta
- Create production Supabase project/environment and apply/verify migrations.
- Replace GitHub Pages catalog endpoint in Flutter with the approved production read boundary.
- Authentication/account persistence client and RPC contracts are implemented; configure chosen production auth providers and verify deployed persistence/RLS E2E.
- Account deletion path is implemented with authenticated identity/app-data/push-token cleanup and a regression contract; deployed production E2E verification remains.
- iOS unsigned release generation/build is CI-verified; final application identifier is `com.kkokkapick.app`; commit final native release artifacts and configure protected signing before store registration.
- iOS unsigned release CI is implemented; Android unsigned release/signing-secret guard is CI-verified and merged. Signed-store CI remains gated on protected credentials and store-account setup.
- Verify provider production rights and attribution requirements.
- Price-alert DB pipeline plus production sender operating contract are implemented; connect credentialed FCM/APNs sender and verify invalid-token cleanup/device delivery.
- Public privacy/support/account-deletion release-draft pages are implemented; finalize legal identity/contact/data inventory before submission.

### P1 — required before store submission
- Mock-boundary account flow contract covers sign-in session, profile, favorite, alert and deletion RPCs; complete deployed E2E plus search/fit/merchant-handoff device flow.
- CI covers 200% text scaling/core navigation/destructive confirmation; complete final semantics/contrast/tap-target/screen-reader and device pass after UI freeze.
- Reviewer/store submission pack and technical privacy inventory exist; finalize assets, declarations, URLs and reviewer account against production configuration.
- Crash/error telemetry direction is Firebase Crashlytics with no Analytics/advertising identifiers solely for crash reporting; production SDK/configuration and privacy-safe verification remain.
- Backup/restore and rollback rehearsal.
- Public commercial events have DB replay/rate controls plus same-session concurrency serialization; verify production edge/load behavior and configure authentication-provider abuse controls.

### P2 — post-beta quality
- Improve multi-offer coverage and price-history depth only where provider rights permit.
- Expand verified first-party brand size evidence.
- Commercial dashboard CTR and provider-confirmed payable revenue reconciliation.
- Search relevance tuning based on privacy-safe aggregate events.

## Decisions intentionally deferred to Product Owner

Ask only when execution reaches the gate:
- production service/account connection or meaningful recurring cost;
- legal/business identity required for policies/store listing;
- provider terms that require accepting material commercial/legal constraints;
- final submission/release authorization.

## Release definition of done

A release candidate may be submitted only after all P0/P1 gates applicable to v1 pass, CI is green, independent QA records QA_PASS, Security/Privacy has no unresolved high-risk finding, Source/Data confirms production provider policy, DevOps/FinOps confirms deploy/rollback and cost class, and Team Lead confirms no unresolved Product Owner decision.

## 2026-09-29 implementation checkpoint

Completed without production credentials or paid-service activation:
- Price threshold evaluation and `(alert, observed price)` delivery deduplication.
- Atomic server-only delivery claiming/finalization with concurrent-worker protection.
- Exclusive push-token ownership across account switches.
- Bounded retry/dead-letter semantics: default 5 attempts, exponential backoff from 30 seconds capped at 1 hour, stale-worker lease recovery.
- Provider errors are constrained to short classifications/codes in the delivery ledger; raw provider responses/tokens must not be persisted there.

### Current owner/external-system boundary
Further production activation requires information or access that must not be invented in-repo: a production Supabase environment, production configuration for the chosen Apple/Google/Kakao/Email auth paths plus the Naver adapter, protected application signing, FCM/APNs credentials/configuration, provider production-rights confirmation (including direct image delivery/attribution), and legal/business identity/URLs for store/privacy materials. Actual store submission remains an explicit Product Owner gate.


### 2026-09-29 release-foundation progress
- Public privacy, support and account-deletion draft pages are present without invented legal/contact identity.
- Account deletion includes directly owned profile/child/favorite/alert/push-device data plus auth identity, with a regression contract; production E2E is still required.
- macOS CI successfully generated the official Flutter iOS project and built an unsigned release Runner.app.
- Release operations/rollback and production-activation checklists are committed.
- Android unsigned release APK, signing-material/secret guard and independent QA/Security review are complete. Public commercial-event opaque-session rate/replay controls and their CI contract are also complete; production edge/load verification remains.

### Team Lead repository-complete checkpoint
- Aggregate release preflight is implemented and green on repository-only mode.
- Read-only production DB verification/evidence pack is ready for the future Supabase environment.
- Scheduled provider sync workflows are serialized, canonical-repository guarded and race-safe against a moving main branch.
- Push sender claim/send/finalize/invalid-token/no-secret-logging contract is CI-checked; credentials/device validation remain external.
- Commercial public-event DB controls now serialize same-session rate/replay checks; rotating session keys remains an edge-control concern.
- Remaining repository work is limited to changes triggered by final UI feedback or newly supplied production/provider/store decisions.


### 2026-09-29 truth pass after mobile preview review
- Brand primitives and launch/loading surface are merged; broader discovery UI is intentionally not considered frozen until the commerce-first v4 branch passes all release workflows and independent QA.
- Canonical catalog currently has 186 products. All 186 records carry HTTPS image URLs and positive prices; 136/186 have normalized brands and 6/186 are currently verified for KKOKKAFIT evidence. URL presence does not prove that provider-hosted images render in Flutter Web, so hotlink/CORS/rights verification remains open.
- The expanded ADPICK discovery plan contains at least 45 queries, but the prior expanded scheduled run was cancelled by its old 10-minute timeout. The workflow timeout has been increased; do not claim expanded production coverage until a subsequent scheduled run publishes a newer dataset.
- Initial marketing creative/copy and measurement planning are repository-only and zero-spend. Paid acquisition remains explicitly gated on Product Owner authorization and production measurement readiness.
