# Price-alert push worker contract

The database owns evaluation, deduplication, atomic claim, bounded retry and dead-letter state. A production sender must implement only provider delivery around that boundary.

## Worker loop
1. Authenticate with server-only database credentials.
2. Call `claim_price_alert_deliveries(limit, stale_after, max_attempts)`.
3. Resolve enabled device tokens for the returned user using a server-only query/RPC; never log raw tokens.
4. Send through the configured FCM/APNs provider, using `delivery_id` as provider idempotency metadata where supported.
5. Classify result:
   - success → complete with success;
   - transient provider/network/5xx/rate-limit → retryable failure;
   - invalid/unregistered token → disable/remove token and terminally complete that provider attempt according to sender policy;
   - malformed/auth/configuration error → terminal failure and operational alert.
6. Call `complete_price_alert_delivery` with a short classification/code only. Never persist provider response bodies or credentials.

## Required production evidence
- FCM/APNs credentials remain server-side/protected.
- One successful iOS and Android delivery where those platforms are enabled.
- Invalid-token cleanup verified.
- Concurrent workers do not double-claim a ledger row.
- Retry/backoff reaches terminal failure after the configured budget.
- Provider/network failure does not block catalog browsing.
- Logs contain delivery IDs/error classes, not push tokens or customer payloads.

The concrete provider implementation remains blocked until the Product Owner supplies/approves the production push environment.
