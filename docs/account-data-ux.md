# Account and personal-data UX contract

Status: implementation contract for v1 authentication/persistence work.

## Product behavior

Guest browsing remains the default. Search, filters, product detail, merchant handoff and KKOKKAFIT explanation do not require sign-in.

Sign-in is requested only when the user asks for persistence across devices or notification delivery: favorite synchronization, saved child profile, or price alerts.

Local guest data is not silently uploaded. After first sign-in, the app must show an explicit one-time choice to keep this device only or sync the local favorites/profile/alerts to the account. Merge rules must be deterministic and reversible before confirmation.

## Account screen

The signed-in account screen must expose sign-in identity/provider, synchronized-data summary, notification preferences when push exists, privacy/support links, 앱 데이터 삭제, and 계정 삭제.

앱 데이터 삭제 removes KKOKKAPICK-owned child profile, favorites and price alerts but leaves the authentication identity intact.

계정 삭제 is a separate destructive flow. It must explain that app-owned personal data and the authentication identity will be deleted, require explicit confirmation, revoke the local session on success, and provide a retry/support path on failure. The client must never receive a service-role key to perform identity deletion.

## Child profile minimization

For v1, persist only fields needed for fit: nickname (optional), birth date or equivalent age source, height, weight, and usual size (optional). Do not store photos, free-form child notes, precise location, advertising identifiers, or raw profile values in analytics/commercial attribution.

## Failure states

Persistence failure must not discard the local copy. Authentication expiry must return the user to a recoverable signed-out state. Account deletion is not reported as complete until the privileged server operation confirms both app-data and auth-identity handling.

## QA acceptance

- Guest can complete core shopping without sign-in.
- No local data uploads before explicit sync consent.
- RLS prevents cross-user profile/favorite/alert reads and writes.
- App-data deletion is authenticated and scoped to auth.uid().
- Identity deletion cannot be invoked with client-only privilege.
- Sign-out does not delete local guest data unless the user chose to clear it.
