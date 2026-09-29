# Account synchronization contract

Guest browsing remains the default. Authentication is requested only when the user asks for cross-device persistence or notification delivery.

## Session boundary

The mobile client exposes an authentication-session interface independently from Apple, Google, Kakao, or any concrete identity provider. No service-role credential may exist in the app. An authenticated request uses only the current user's access token plus the public Supabase anon key.

## First sign-in

Local data is never uploaded merely because a session appeared. The first authenticated session presents one explicit choice:

- keep this device's data local; or
- sync local favorites, the active child profile, and price alerts to the account.

The sync operation is additive. Existing account favorites are preserved, matching alerts are updated by product, and the singular MVP child profile is updated only when the user elected to sync it. Destructive conflict resolution requires a separate user action.

## Failure and deletion

A failed network sync leaves local data intact and can be retried. Session expiry returns the client to guest/local behavior without deleting local data.

"앱 데이터 삭제" invokes `delete_my_app_data()` and removes KKOKKAPICK-owned profile/favorite/alert rows for the authenticated user. "계정 삭제" is a separate privileged server operation that also deletes the auth identity; it must never be implemented with a service-role key in the client.

## Privacy

Child profile values are functional personalization data. Raw birth date, height, weight, or month age must not be attached to commercial attribution or analytics events. Commercial attribution remains campaign/product/session scoped.
