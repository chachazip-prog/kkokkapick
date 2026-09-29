# Release operations and rollback runbook

## Scope
This runbook covers KKOKKAPICK mobile/backend release preparation. It does not authorize a production deploy or store submission.

## Pre-release gate
1. Pin the release commit SHA and record migration range.
2. Require green Code Quality, Flutter quality, iOS unsigned release validation, and independent QA_PASS.
3. Confirm no production secret, service-role key, signing key, push credential, or provider credential is committed or compiled into the client.
4. Verify production Supabase backup/restore capability before applying migrations.
5. Apply migrations in numeric order to staging first; verify grants/RLS/RPC exposure and account deletion.
6. Smoke-test catalog, sign-in, profile, favorite, price alert, merchant handoff, account deletion.
7. Build signed Android/iOS artifacts only from protected CI/store credentials after final app identifiers are approved.
8. Record release version/build number, artifact checksum, deployment time and operator.

## Rollback
### Mobile
Store binaries are immutable. If a submitted build is bad, stop rollout where the store permits and ship a new higher build number. Never reuse or mutate a published artifact.

### Backend migration
Prefer forward-fix migrations. Do not destructively reverse schema/data changes unless a reviewed rollback migration exists and backup restore has been rehearsed. If a new RPC/read boundary is unsafe, revoke execution/access first, then deploy a forward fix.

### Catalog/provider
Disable the affected provider ingestion and preserve the last policy-valid catalog snapshot where provider retention rights allow. Do not keep expired provider data merely for rollback convenience.

### Price alerts/push
Pause the trusted worker/scheduler before changing delivery semantics. Keep the delivery ledger for deduplication/audit within the approved retention policy. Invalid tokens must be disabled/removed without logging raw tokens.

## Incident minimum record
Record release SHA/build, start/end time, affected surface, user impact, mitigation, data/security impact, rollback/forward-fix action, and follow-up owner. Never paste credentials or raw push tokens into incident notes.

## External gates
Production Supabase, auth providers, final application identifiers, Apple/Google signing, FCM/APNs credentials, provider production rights, legal identity/contact details, and final submission authorization require Product Owner/external-system completion.
