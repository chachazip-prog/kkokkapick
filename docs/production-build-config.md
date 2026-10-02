# Production build configuration gate

Preview/debug builds may use the repository's GitHub Pages catalog fallback. A production/store candidate must not.

Required production build values:
- `APP_ENV=production`: mandatory store-candidate runtime mode.
- `SUPABASE_URL`: approved HTTPS production backend.
- `SUPABASE_ANON_KEY`: Supabase public/anon client key. This is public client configuration, not a service-role secret.

The gate rejects missing configuration and GitHub Pages as a production catalog boundary. Service-role/provider/signing/push sender secrets remain forbidden from Flutter compile-time defines.

Example production build shape after the environment is approved:

`flutter build appbundle --release --dart-define=APP_ENV=production --dart-define=SUPABASE_URL="$SUPABASE_URL" --dart-define=SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"`

The repository intentionally does not contain real production values.


## Social authentication compile-time boundary

Social provider enablement is not a secret, but it is a release gate. The default build leaves `SOCIAL_AUTH_PROVIDERS` empty, so the repository OAuth transport cannot initiate a provider flow.

After a provider has production credentials, Supabase configuration, redirect allow-list and real-device E2E evidence, a future promoted candidate may pass a comma-separated allow-list such as `google,apple`. Naver additionally requires `NAVER_SUPABASE_PROVIDER_ID` to match the approved Supabase custom OAuth/OIDC provider identifier.

The registered mobile callback remains `kkokkapick://auth/callback`. Provider client secrets must never be supplied as Flutter `--dart-define` values.
