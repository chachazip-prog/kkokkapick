# Authentication scope

MVP account methods:
- Google
- Kakao
- Naver
- Apple
- Email/password account creation and sign-in

Guest browsing remains the default. Authentication is requested only for cross-device persistence or notification delivery.

## Architecture
Supabase Auth is the account/session authority.
- Google: Supabase built-in social provider.
- Kakao: Supabase built-in social provider.
- Apple: Supabase built-in social provider; include from the initial iOS authentication scope.
- Naver: Supabase Custom OAuth/OIDC provider when the production project is configured.
- Email/password: Supabase email/password auth.
- Mobile clients receive only public Supabase configuration plus the authenticated user's session. Service-role credentials never ship in the app.

## Account linking
Do not silently merge identities only because provider emails match. A future account-linking flow must require an authenticated user and explicit confirmation.

## iOS review gate
Apple sign-in is part of the initial authentication scope. Before App Store submission, re-check the current Login Services guideline, Apple capability/entitlement, callback configuration, and review behavior against the production build.

## Data minimization
Request only identity fields needed for account creation/sign-in. Do not request contacts, social graphs, profile images, or unrelated provider scopes. Child profile data remains app-owned data and is not sent to social identity providers.

## Production configuration gates
Provider credentials and callback URLs belong in provider/Supabase consoles, not the repository. Production setup requires:
1. final app identifiers and callback/deep-link scheme,
2. production Supabase project,
3. provider applications/credentials,
4. privacy/support/account-deletion URLs,
5. App Store login-policy review before submission.


## Session-to-account boundary
The authenticated access token is exposed to account RPCs through `AuthenticationSessionBridge`. The bridge reads the current in-memory token, including rotated tokens after refresh, and returns to guest state immediately after session clear. It never exposes the refresh token to the account-data gateway.
