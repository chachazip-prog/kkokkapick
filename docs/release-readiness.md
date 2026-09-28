# Release readiness review

Updated: 2026-09-29

This is the Team Lead roll-up of Product, Source/Data, UX/UI, Mobile FE, Backend, Security/Privacy, QA, and DevOps/FinOps review. It is a living release gate, not a claim that the app is store-ready.

## Release gates

| Area | Current state | Gate before store submission |
| --- | --- | --- |
| Product | Core discovery, filtering, favorites, child profile, fit evidence, affiliate handoff exist in prototype/mobile code | Freeze v1 scope and acceptance criteria; remove demo-only behavior |
| Source/Data | ADPICK ingestion and canonical catalog exist; retention is fail-closed by provider policy | Written production rights/retention classification; production catalog served from approved backend rather than GitHub Pages |
| UX/UI | Mobile-first discovery flow exists | Accessibility, empty/error/loading states, destructive actions, external-link disclosure, small/large device QA |
| Mobile | Flutter feature foundation exists | **BLOCKER:** Android/iOS platform projects are not committed; release signing, identifiers, icons, launch assets, deep links and release builds remain |
| Backend | Supabase schema/RLS/admin/commercial migrations exist | Apply migrations to a real environment; auth, persisted favorites/profile/alerts, account deletion, push tokens and alert worker |
| Security/Privacy | Secrets are kept out of clients; user tables have owner RLS; admin uses allow-list | Verify grants/view/RPC exposure in deployed Supabase; privacy/data retention inventory; deletion/export behavior; dependency/security review |
| Commercial | Sponsored content is separated from organic fit ranking; public event boundary excludes conversion/revenue writes | Provider-confirmed conversion ingestion; disclosure QA; abuse/rate controls and event deduplication |
| Operations | Node/Flutter CI exists; provider sync separated from fast CI | Production environments, backups/restore, monitoring, incident/rollback runbook, release build pipeline |
| Store compliance | Not yet packaged | Privacy policy, terms/support/account deletion URLs, Apple privacy answers, Google Data Safety, store metadata/screenshots/reviewer access |

## Findings corrected in this review

1. Scheduled campaigns/popups previously required a manual status transition at start time. Public read models now derive live visibility from server time, avoiding a cron dependency.
2. Commercial performance was exposed as a view name reachable through the REST schema. Direct anon/authenticated access is revoked; admin reads go through an admin-checked RPC.
3. Campaign/popup publish transitions now validate required title/disclosure/partner/schedule invariants.
4. Commercial endpoint/network failure no longer needs to fail the core Flutter catalog experience.
5. Admin lifecycle controls include scheduled/published/paused/ended states.

## High-priority release backlog

### P0 — required before external beta
- Create production Supabase project/environment and apply/verify migrations.
- Replace GitHub Pages catalog endpoint in Flutter with the approved production read boundary.
- Implement authentication and server persistence for favorites, child profile and price alerts.
- Implement account deletion and personal-data deletion path.
- Create Android/iOS platform projects and settle application identifiers before store registration.
- Add release build/signing CI without committing signing secrets.
- Verify provider production rights and attribution requirements.
- Add push token model + price-alert evaluation/deduplication + APNs/FCM delivery.
- Add privacy/support/account-deletion web pages.

### P1 — required before store submission
- End-to-end tests for sign-in, profile, search, fit, favorite, alert, merchant handoff and deletion.
- Accessibility pass: semantics, text scaling, contrast, tap targets, screen-reader labels.
- Store assets/metadata, privacy declarations, reviewer instructions and test account where required.
- Crash/error telemetry chosen under the Product Owner privacy/cost boundary.
- Backup/restore and rollback rehearsal.
- Rate/abuse protection for public commercial events and authentication surfaces.

### P2 — post-beta quality
- Improve multi-offer coverage and price-history depth only where provider rights permit.
- Expand verified first-party brand size evidence.
- Commercial dashboard CTR and provider-confirmed payable revenue reconciliation.
- Search relevance tuning based on privacy-safe aggregate events.

## Decisions intentionally deferred to Product Owner

Ask only when execution reaches the gate:
- production service/account connection or meaningful recurring cost;
- final iOS bundle ID / Android application ID before store registration;
- authentication providers and any resulting personal-data scope;
- legal/business identity required for policies/store listing;
- provider terms that require accepting material commercial/legal constraints;
- final submission/release authorization.

## Release definition of done

A release candidate may be submitted only after all P0/P1 gates applicable to v1 pass, CI is green, independent QA records QA_PASS, Security/Privacy has no unresolved high-risk finding, Source/Data confirms production provider policy, DevOps/FinOps confirms deploy/rollback and cost class, and Team Lead confirms no unresolved Product Owner decision.
