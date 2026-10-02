# Production verification pack

The repository ships a protected, non-destructive verification path for the production Supabase boundary.

## Repository artifacts

- `scripts/production-migration-manifest.js`: generates an ordered migration manifest with SHA-256 digests.
- `supabase/production-verification.sql`: privileged **read-only** query that emits one JSON object covering required RLS tables, RPC presence, role grants and public/legacy view exposure.
- `scripts/validate-production-verification.js`: compares that JSON against the expected production security boundary and fails on drift.
- `scripts/production-email-auth-smoke.js`: non-destructive Email/password sign-in → session refresh → account RPC → production catalog RPC smoke. It never logs credentials or session tokens.
- `.github/workflows/production-supabase-activation.yml`: manual protected-`production` workflow that runs the manifest, DB verification and auth smoke.
- `docs/production-supabase-operator-runbook.md`: backup/migration/verification/deletion-E2E/restore sequence.

## Execution

After a production Supabase environment exists and a backup/recovery point is recorded:

1. Apply the frozen release migration set through the latest repository migration.
2. Run **Production Supabase activation verification** from GitHub Actions using the protected `production` Environment.
3. Retain the schema evidence and auth-smoke artifacts.
4. Execute the dedicated account-deletion E2E from the operator runbook.
5. Record artifact/run references and aggregate PASS/FAIL evidence in `docs/production-verification-evidence.md`.

The read-only SQL and auth smoke do **not** delete accounts or mutate customer data. Destructive account-deletion verification must use a dedicated disposable release test account and is intentionally a separate operator action.

Evidence must contain references/results only, never credentials, access/refresh tokens, push tokens, private keys, database passwords or customer data.
