# Production verification pack

After a production Supabase environment exists, run `supabase/production-verification.sql` with a privileged operator connection. It is deliberately read-only and checks expected RPC presence, RLS flags and routine grants.

Record results in `docs/production-verification-evidence.md`. Destructive account-deletion verification must use a dedicated release test account and is intentionally not automated by the read-only SQL.

The evidence file must contain references/results only, never credentials, tokens, private keys or customer data.
