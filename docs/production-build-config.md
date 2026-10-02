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
