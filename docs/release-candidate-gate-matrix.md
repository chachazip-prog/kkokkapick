# Release candidate gate matrix

Updated: 2026-09-30

This document separates repository-complete release evidence from Product Owner / external-system activation gates. It is intentionally conservative: a green repository does not mean the app is ready for store submission.

## Candidate baseline

- Latest repository release baseline before this document: `d4916a4ffdfcddf18e1b43ccbfa9b9101bd01e97` plus the automated Flutter preview publication commit.
- Product Owner-selected visual direction: D03 / v10 approved-reference rebuild.
- Repository-only CI expectation: Flutter quality, Flutter UI preview, Code quality, Release preflight, Android unsigned release, iOS release foundation all green.
- Production-config preflight must remain a separate explicit store-candidate gate.

## Team gate matrix

| Gate owner | Repository evidence now required | Current repository state | External / owner gate still required |
| --- | --- | --- | --- |
| Team Lead / PM | Scope freeze, release evidence roll-up, no unresolved internal P0 | Account/session, My release surfaces and account-switch isolation merged; release gate remains open for external activation | Final release SHA and submission authorization |
| Product / Design | D03 structure retained; Home/Search separation; no fake/no-op release actions | v10 visual rebuild merged in #111; My additions stay inside existing visual language | Final physical-device visual sign-off after production configuration |
| Mobile FE | Flutter analyze/tests; small-width/accessibility contracts; account state behavior | Guest/authenticated/offlineAuthenticated, sync consent, delete/sign-out and My release surfaces covered by tests; Email/password is the only enabled auth method | Social OAuth callback/deep-link wiring, signed production builds and device E2E with real auth/push |
| Source / Data | Canonical product grouping, valid positive price semantics, HTTPS image aggregation, provenance/rights boundaries | Canonical aggregation hardening merged; catalog/provider policy remains fail-closed | Provider production rights, attribution and production catalog read boundary |
| Backend | RLS/RPC/account lifecycle/price-alert migrations and repository contracts | Account lifecycle, mutation boundary, deletion, price-alert evaluation/worker/retry and ownership hardening migrations are present | Apply/audit migrations in production Supabase; backup/restore rehearsal |
| QA / Reviewer | Independent regression gate; no internal P0 accepted on implementation claim alone | #112-#114 had CI + role-separated QA gates; account-switch isolation now orchestration-tested | Production physical-device E2E, signed-artifact smoke and store-reviewer path |
| Security / Privacy | No tracked secrets/signing material; stale-token boundary; owner-scoped mutation isolation; draft policies clearly non-final | Repository contracts and Flutter tests cover these boundaries | Production grants/RLS audit, real privacy particulars, ecosystem advisory pass |
| DevOps / FinOps | Reproducible CI, unsigned artifacts, rollback/runbook, no unexpected recurring cost | Six-workflow release foundation exists; latest internal changes have no infra/paid-service cost | Protected signing/store credentials, production monitoring, cost confirmation |
| Store / Compliance | Submission pack, technical privacy inventory, deletion route, support/privacy placeholders | Templates/draft pages exist and intentionally do not invent legal identity | Legal/business identity, contact, final URLs, privacy/data-safety declarations, reviewer access |

## Internal P0 evidence complete

The repository may treat the following as implemented and regression-gated, subject to production E2E where noted:

1. D03/v10 approved-reference visual rebuild foundation.
2. Guest / authenticated / offlineAuthenticated session states.
3. Secure persisted-session restore with stale access tokens kept inactive after transient refresh failure.
4. Explicit first-sign-in choice before any existing device data is uploaded.
5. Sign-out, app-data deletion and account deletion confirmation paths.
6. My-page Privacy/Data and App Settings surfaces are real actions, not placeholders.
7. Customer Support remains disabled/non-tappable while no official support channel exists.
8. Account mutation outbox is owner-scoped, including an orchestration-level account-switch regression proving user B cannot replay user A mutations.
9. Repository release preflight, Android unsigned release and iOS unsigned release-foundation checks.

## External gates that must remain blocked

Do not represent any of these as complete until evidence from the real production/store environment exists:

- Production Supabase URL/anon key and approved catalog read boundary.
- Applied migrations plus grants/RLS/RPC exposure audit in the target project.
- Enabled production authentication providers and callback configuration.
- FCM/APNs credentials, sender execution and real-device invalid-token handling.
- Provider production rights/retention/attribution confirmation.
- Official operator/legal identity, contact email, customer-support channel and final privacy policy particulars.
- Android/iOS protected signing credentials, final store registrations and signed artifacts.
- Backup/restore and rollback rehearsal against production-like infrastructure.
- Final physical-device QA and store reviewer account/path.
- Product Owner final external-beta/store submission authorization.

## Promotion rules

### Repository RC
A repository RC may be nominated when all repository workflows are green, QA and Security/Privacy record no unresolved high-risk findings, the approved visual direction has not materially drifted, and all unavailable external gates are visibly marked blocked rather than mocked.

### External beta candidate
An external beta candidate additionally requires production backend/auth/catalog configuration, deployed account deletion E2E, provider-rights confirmation, push delivery where enabled, protected signing, production privacy/support particulars and physical-device QA.

### Store candidate
A store candidate additionally requires signed artifacts, finalized submission/privacy declarations, reviewer access, rollback evidence, final release SHA freeze and explicit Product Owner authorization.

## Stop-the-line conditions

The Team Lead must stop promotion if any of the following occurs: a red required workflow; a regression in account/session isolation; a fake/no-op tappable release action; a draft policy represented as final; tracked secret/signing material; unverified provider rights used as production authorization; material visual drift from the selected direction; or a high-risk QA/Security finding without explicit Product Owner exception.
