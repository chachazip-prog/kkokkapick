# Production Supabase operator runbook

This runbook activates and verifies the production backend boundary. It does not authorize external beta or store submission by itself.

## Required protected inputs

Configure these only in the protected GitHub `production` Environment or the equivalent trusted operator secret store:

- `PRODUCTION_DATABASE_URL`: privileged PostgreSQL connection used only by the read-only schema verification job.
- `PRODUCTION_SUPABASE_URL`: public production Supabase URL.
- `PRODUCTION_SUPABASE_ANON_KEY`: public client key.
- `PRODUCTION_TEST_EMAIL` / `PRODUCTION_TEST_PASSWORD`: dedicated non-customer release test account.

Never place a database password, service-role key, test password, access/refresh token or customer identifier in repository files or uploaded evidence.

## Activation order

1. Freeze the release SHA that will be verified.
2. Create a production backup or provider-supported recovery point **before** applying repository migrations. Record only the backup identifier/time in the evidence file.
3. Generate `production-migration-manifest.json` from the frozen SHA and retain it with the release evidence.
4. Apply migrations in numeric order through `031_push_delivery_target_fanout.sql` using the approved deployment mechanism. Do not skip or reorder migrations.
5. Run the GitHub Actions workflow **Production Supabase activation verification** with the protected `production` Environment.
6. Require both workflow jobs to pass:
   - schema verification: read-only JSON verification + strict validator;
   - email-auth smoke: password sign-in, refresh-token rotation, authenticated account RPC and anonymous production catalog RPC.
7. Confirm the store-candidate production preflight separately so the mobile build cannot fall back to GitHub Pages.
8. Perform the dedicated account-deletion E2E below.
9. Record backup/restore rehearsal and rollback/forward-fix evidence.
10. Attach artifact/run references to `docs/production-verification-evidence.md`. Do not copy secrets into that file.

## Dedicated account-deletion E2E

Use a disposable release test account that contains no real customer data.

1. Sign in with the dedicated account on the production-configured candidate.
2. Add representative app-owned data: child-fit profile, one favorite and one price alert. Register a test push device only if production push is enabled.
3. Verify `get_my_app_data` returns only that account's data.
4. Execute the in-app account deletion flow and its destructive confirmation.
5. Verify the prior access token can no longer call authenticated account RPCs.
6. Verify the prior refresh token cannot establish a new session.
7. With a privileged operator connection, verify aggregate row counts for the deleted test identity are zero in:
   - `profiles`
   - `child_profiles`
   - `favorites`
   - `price_alerts`
   - `push_devices`
   - `auth.users`
8. Record only PASS/FAIL and evidence references. Do not paste the test email, UUID, access token, refresh token or push token into evidence.

## Backup / restore / rollback rehearsal

Before promotion, record:

- source backup identifier and creation time;
- isolated restore target;
- restore completion time;
- verification that migration/RLS/RPC checks also pass on the restore;
- release SHA / migration range used for the rehearsal;
- whether rollback is restore-based or forward-fix;
- operator and incident/approval reference.

Prefer forward-fix migrations after activation. If production verification detects unsafe grants or missing RLS, stop promotion before mobile release and correct the database boundary first.

## Stop conditions

Stop production promotion if any of these occurs:

- migration manifest is not continuous from 001 through the repository latest migration;
- read-only schema verification or validator fails;
- any required RLS table is absent/disabled;
- anonymous access appears on account or trusted-worker RPCs;
- service-role access is missing from the 031 evaluator/target-claim/target-complete RPCs, or legacy parent-level push worker RPCs regain service-role access;
- legacy catalog/commercial metric views are anonymously selectable;
- email authentication, refresh, account RPC or production catalog smoke fails;
- backup/restore evidence is unavailable;
- account-deletion E2E leaves account-owned rows or a reusable prior session.
