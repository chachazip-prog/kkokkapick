# Price-alert push worker contract

The database owns threshold evaluation, deduplication, frozen per-device fan-out, atomic target claim, bounded retry and parent delivery aggregation. Provider I/O stays outside Postgres.

## Repository delivery boundary

- Migration 031 creates `price_alert_delivery_targets`, one row per `delivery_id + device_id`.
- Device targets are frozen when a pending parent delivery first enters worker processing. A device added later does not receive an old price event.
- Each target has independent `pending → processing → sent/failed` state, attempt budget and backoff.
- A successful device is never reclaimed merely because a sibling device failed.
- Invalid/unregistered provider results disable only that `push_devices` row and are terminal for that target.
- The parent `price_alert_deliveries` row becomes `sent` after all targets are terminal if at least one target succeeded; otherwise it becomes `failed`.
- Raw device tokens are returned only from the service-role target claim RPC and must never log raw tokens or appear in artifacts.

## Worker loop

1. Authenticate to Supabase with server-only `SUPABASE_SERVICE_ROLE_KEY`.
2. Call `evaluate_price_alerts(limit)`.
3. Call `claim_price_alert_delivery_targets(limit, stale_after, max_attempts, platform)`.
4. Send each target through exactly one configured provider:
   - Android: FCM HTTP v1 with a short-lived OAuth 2.0 access token derived from a protected service account.
   - iOS: APNs HTTP/2 with a protected ES256 provider key/JWT.
5. Classify provider outcome:
   - success → terminal target success;
   - transient provider/network/429/5xx → retryable target failure;
   - invalid/unregistered token → disable that device and terminal target failure;
   - malformed/auth/configuration error → terminal target failure and operational alert.
6. Call `complete_price_alert_delivery_target` with booleans plus a bounded error classification only. Never persist provider response bodies or credentials.

## FCM/APNs classification

- FCM `UNREGISTERED` is Invalid-token cleanup.
- FCM `INVALID_ARGUMENT` is not automatically treated as an invalid token because it can also describe an invalid message payload.
- FCM quota/internal/unavailable and HTTP 429/500/503 are retryable.
- APNs 410/`Unregistered` and `BadDeviceToken` are Invalid-token cleanup.
- APNs 429/500/503 are retryable.
- Provider authentication/configuration failures are terminal for the target and require operator intervention.

## Client registration boundary

The Flutter repository contains a provider-neutral `PushRegistrationCoordinator`. It registers and rotates a native token only while an authenticated account session is active. Push tokens are deliberately excluded from the offline account mutation outbox so a stale token cannot replay under another account. The actual native FCM/APNs token source remains an external/device integration gate.

## Production workflows

- `Production push verification` sends exactly one notification to a protected test-device token after explicit confirmation.
- `Price alert push worker` processes a bounded manual production batch after explicit confirmation.
- Neither workflow has a schedule. Recurring production delivery must not be enabled until provider credentials, native token acquisition and real-device evidence are approved.
- Artifacts contain aggregate counts/provider classification only, never raw tokens, private keys, service-role keys or customer identifiers.

## Required production evidence

- FCM/APNs credentials remain server-side/protected.
- One successful iOS and Android test-device delivery for enabled platforms.
- Native device token registration and rotation verified.
- Invalid-token cleanup verified against a disposable token/device.
- Two active devices on one account verify partial-success/retry without duplicate resend to the successful device.
- Concurrent workers do not double-claim a target row.
- Retry/backoff reaches terminal failure after the configured budget.
- Provider/network failure does not block catalog browsing.
- Logs/artifacts contain only aggregate counts and bounded error classes.

Provider credentials, native messaging configuration, signed real-device builds and live delivery evidence remain external activation gates.
