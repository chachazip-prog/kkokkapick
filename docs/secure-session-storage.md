# Secure authentication session storage

Refresh and access tokens must not be stored in SharedPreferences or committed configuration.

The Flutter client uses `SecureSessionTokenStore`:
- iOS: Keychain through `flutter_secure_storage`, restricted to this device with `first_unlock_this_device`.
- Android: platform encrypted secure storage through `flutter_secure_storage`.
- logout/app-session invalidation clears both token values.
- failed refresh during startup restore clears stale stored tokens.

The storage implementation is behind `SessionTokenStore` so authentication tests and future platform policy changes do not couple account logic to a plugin.

Production release validation must include:
1. install/login/force-stop/relaunch restore,
2. logout/relaunch remains logged out,
3. invalid/revoked refresh token clears local session,
4. device backup/restore does not unexpectedly migrate an authenticated session,
5. no token values in logs, analytics, crash metadata, or support exports.
