# Production activation checklist

Updated: 2026-10-03

This checklist is for the final external-beta/store candidate. Repository-only readiness and production activation are intentionally separated.

## Final candidate gates

- [ ] Final release SHA selected and frozen
- [ ] Release candidate Code Quality green
- [ ] Release candidate Flutter analyze/tests green
- [ ] Release candidate Flutter UI preview green and deployed evidence matches the selected SHA
- [x] Android release configuration guard rejects debug signing; re-run on final release candidate
- [x] iOS unsigned release foundation build is CI-verified; re-run on final release candidate
- [ ] Independent QA_PASS recorded for final release candidate
- [ ] Security/Privacy has no unresolved high-risk finding on final release candidate
- [ ] Final physical-device pass covers supported iOS/Android widths, text scaling, navigation, auth/account/data deletion and merchant handoff

## Production backend / auth

- [ ] Production Supabase created and migration backup/restore path verified
- [ ] Migrations applied and grants/RLS/RPC exposure audited
- [ ] Account deletion contract is green and deployed environment E2E verifies deletion/cascades/session invalidation
- [ ] Production config preflight is green; approved catalog read boundary configured and GitHub Pages fallback absent from store candidate
- [ ] Email/password production auth verified
- [ ] Social authentication providers approved/configured, `kkokkapick://auth/callback` allow-listed, and real-device provider E2E approved before any social method is enabled
- [ ] Guest -> authenticated -> sign-out -> different-account switch E2E confirms server/account isolation
- [ ] First-sign-in device-data sync consent is verified against the deployed account boundary

## Push / provider / data rights

- [ ] Native iOS/Android push token acquisition wired and real-device registration/rotation verified
- [ ] FCM/APNs protected test-device smoke succeeds on each enabled platform
- [ ] Per-device price-alert worker invalid-token cleanup, retry/dead-letter and multi-device partial-success behavior verified in production
- [ ] Provider production rights/retention/attribution confirmed
- [ ] Production catalog freshness and canonical offer aggregation verified against the approved provider boundary
- [ ] No unsupported review bodies/specifications/popularity claims are introduced by production data

## Store / legal / signing

- [ ] Final Android applicationId and iOS bundle ID are confirmed against store registrations
- [ ] Signing credentials stored only in protected CI/store secret storage
- [ ] Signed Android/iOS candidate artifacts are generated from the frozen release SHA
- [ ] Privacy/support/account-deletion pages finalized with real legal/contact/data inventory
- [ ] Official customer-support channel is configured; until then the in-app Customer Support entry remains unavailable/non-tappable
- [ ] Store submission pack finalized: metadata/privacy declarations/assets/reviewer access ready
- [ ] Backup/restore and rollback rehearsal recorded
- [ ] Product Owner final release/submission authorization

## Repository gates already implemented
- [x] Production migration set is continuous through 031 and has a SHA-256 manifest contract
- [x] Production schema verification emits machine-readable read-only RLS/RPC/grant/view evidence with strict validation
- [x] Protected manual Production Supabase verification workflow exists and is non-destructive
- [x] Non-destructive Email auth/session/account/catalog smoke contract exists
- [x] Production operator runbook separates backup, migration, smoke, deletion E2E and restore evidence
- [x] Social OAuth PKCE/deep-link callback transport is repository-wired on Android/iOS while the release UI still enables Email/password only
- [x] Social callbacks without a locally pending secure PKCE flow cannot create a session
- [x] Current release truthfully enables Email/password only; Google/Kakao/Naver/Apple remain target scope until provider configuration and real-device E2E exist
- [x] Per-device push fan-out ledger prevents successful sibling devices from being resent during retries
- [x] FCM HTTP v1 and APNs HTTP/2 sender adapters classify success/retry/invalid-token/terminal outcomes without logging tokens
- [x] Push token registration/rotation coordinator avoids the offline account mutation outbox and supports remote detach before sign-out
- [x] Production push smoke and bounded live worker workflows are protected, manual-only and emit sanitized evidence

- [x] Product Owner-selected D03/v10 visual rebuild foundation merged
- [x] Account/session release wiring for guest, authenticated and offline-authenticated states
- [x] Explicit first-sign-in device-data sync consent
- [x] App-data deletion, account deletion, sign-out and destructive confirmation regression coverage
- [x] My-page Privacy/Data and App Settings actions are real surfaces rather than fake/no-op rows
- [x] Customer Support stays disabled/non-tappable until an official support channel exists
- [x] Account-switch mutation outbox isolation is verified at orchestration level
- [x] Account deletion regression contract and customer-data inventory
- [x] Public commercial impression/click replay/rate guard contract
- [x] Technical privacy/store-data inventory
- [x] Dependency lock reproducibility/analyze gate
- [x] Android unsigned release/signing-material guard
- [x] iOS unsigned release foundation validation
- [x] Preview publication restricted to main push
- [x] Production configuration contract rejects GitHub Pages for store candidates
- [x] Store/reviewer submission template
- [x] Release candidate gate matrix and repository contract preventing external gates from being silently represented as complete

See `docs/release-candidate-gate-matrix.md` for role ownership and promotion rules.
