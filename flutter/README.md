# Flutter client

This directory is the mobile client foundation for iOS and Android.

Current scope:
- canonical catalog model aligned with `docs/client-data-contract.md`
- repository boundary for catalog reads
- stale-catalog rejection
- no provider secret in the client

The current GitHub Pages catalog URL is suitable for development/demo reads only. Production should read through the approved backend/Supabase boundary so provider retention, authentication, favorites and alerts can be enforced server-side.

Do not embed ADPICK or other provider API secrets in Flutter.
