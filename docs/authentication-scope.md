# Authentication scope

MVP account methods:
- Google
- Kakao
- Naver
- Email/password account creation and sign-in

Guest browsing remains the default. Authentication is requested only for cross-device persistence or notification delivery.

## Architecture
Supabase Auth is the account/session authority.
- Google: Supabase built-in social provider.
- Kakao: Supabase built-in social provider.
- Naver: Supabase Custom OAuth/OIDC provider when the production project is configured.
- Email/password: Supabase email/password auth.
- Mobile clients receive only public Supabase configuration plus the authenticated user's session. Service-role credentials never ship in the app.

## Account linking
Do not silently merge identities only because provider emails match. A future account-linking flow must require an authenticated user and explicit confirmation.

## iOS review gate
The requested social-login set intentionally excludes Apple. Before App Store submission, re-check Apple's current Login Services guideline against the implemented authentication flow. If the app uses third-party/social login for its primary account and does not qualify for an exception, the release authentication set must include an equivalent privacy-preserving login option that satisfies the guideline. Email/password alone must not be assumed to satisfy that requirement without review.

## Data minimization
Request only identity fields needed for account creation/sign-in. Do not request contacts, social graphs, profile images, or unrelated provider scopes. Child profile data remains app-owned data and is not sent to social identity providers.

## Production configuration gates
Provider credentials and callback URLs belong in provider/Supabase consoles, not the repository. Production setup requires:
1. final app identifiers and callback/deep-link scheme,
2. production Supabase project,
3. provider applications/credentials,
4. privacy/support/account-deletion URLs,
5. App Store login-policy review before submission.
