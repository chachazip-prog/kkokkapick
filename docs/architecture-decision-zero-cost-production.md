# Architecture decision: zero-cost production foundation

Decision date: 2026-09-29

## Backend
Use **Supabase Free** for the initial production/beta foundation, subject to its free quotas and inactivity behavior. This keeps the existing Postgres/RLS/RPC/Auth design and avoids rebuilding account, deletion, favorites, alerts and commercial boundaries.

Upgrade is not pre-authorized. If usage or reliability requirements exceed the free tier, Team Lead must present the observed constraint and expected recurring cost to the Product Owner first.

Alternatives considered:
- Firebase-only backend: viable, but would require rewriting the existing Postgres/RLS/RPC data model and account/deletion contracts.
- Self-hosted Postgres/Auth: software can be free but infrastructure, patching, backups, security and uptime become our responsibility; not lower operational cost for v1.
- Custom server + managed DB: greater control but more code/operations and no advantage for the current zero-cost beta target.

## Authentication
Target methods: Apple, Google, Kakao, Naver, Email.
- Apple / Google / Kakao / Email: Supabase standard auth paths.
- Naver: adapter/custom OAuth/OIDC path; production implementation is gated on Naver app registration and compatibility verification.
- Request minimum identity scopes only. No contacts/social graph.

## Application identifier
Final Android applicationId and iOS bundle ID: **com.kkokkapick.app**.

## Telemetry
Use **Firebase Crashlytics** as the preferred crash/error telemetry once the Firebase production project is connected. Crashlytics is a no-cost Firebase product. Do not add Analytics or advertising identifiers merely for crash reporting. Avoid PII in custom keys/logs.

Until Firebase setup, release remains functional without third-party telemetry.

## Release hold
Store submission/public launch remains HOLD until Product Owner explicitly authorizes it; business registration/legal identity is expected before final policy/store fields are completed.
